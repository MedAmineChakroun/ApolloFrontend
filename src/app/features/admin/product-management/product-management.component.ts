// product-management.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { Table } from 'primeng/table';
import { Product } from '../../../models/Product';
import { ProductsService } from '../../../core/services/products.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Stock } from '../../../models/Stock';
import { StockService } from '../../../core/services/stock.service';
import { SynchronisationService } from '../../../core/services/synchronisation.service';
import { forkJoin } from 'rxjs';
import { ImageModule } from 'primeng/image';
import { CommandeService } from '../../../core/services/commande.service';
type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

// Enhanced interface for products with stock information
interface ProductWithStock {
    article: Product;
    stockQuantity: number;
}

@Component({
    selector: 'app-product-management',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, ImageModule, CardModule, ToolbarModule, DialogModule, ConfirmDialogModule, ToastModule, TagModule, TooltipModule],
    providers: [ConfirmationService, MessageService],
    templateUrl: './product-management.component.html',
    styleUrl: './product-management.component.scss'
})
export class ProductManagementComponent implements OnInit {
    @ViewChild('dt') table!: Table;
    stocks: Stock[] = [];
    products: ProductWithStock[] = [];
    selectedProduct: ProductWithStock | null = null;
    dialogVisible: boolean = false;
    loading: boolean = true;
    isSyncRoute = false;
    isNonSyncRoute = false;
    selectedProducts: any[] = [];
    selectAll: boolean = false;
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    handleProductImageError(event: any): void {
        event.target.src = this.DEFAULT_PRODUCT_IMAGE;
    }

    constructor(
        private confirmationService: ConfirmationService,
        private productService: ProductsService,
        private toastr: ToastrService,
        private router: Router,
        private stockService: StockService,
        private synchronisationService: SynchronisationService,
        private CommandeService: CommandeService
    ) {}

    ngOnInit() {
        this.isSyncRoute = this.router.url === '/store/admin/products/sync';
        this.isNonSyncRoute = this.router.url === '/store/admin/synchronize/products';
        this.loadProducts();
    }

    loadProducts() {
        this.loading = true;
        this.productService.getProducts().subscribe({
            next: (response: any) => {
                let productData = response?.data?.produits || [];

                // Filter products based on route
                if (this.isSyncRoute) {
                    // Get only synchronized products (artFlag = 1)
                    productData = productData.filter((product: any) => product.artFlag === 1);
                } else if (this.isNonSyncRoute) {
                    // Get only non-synchronized products (artFlag = 0)
                    productData = productData.filter((product: any) => product.artFlag === 0);
                }
                // For other routes, keep all products (no filtering)

                // Initialize products with zero stock
                this.products = productData.map((product: any) => ({
                    article: product,
                    stockQuantity: 0
                }));

                // Then load stock data and update the products
                this.stockService.getAllStock().subscribe({
                    next: (stockData) => {
                        this.products = this.products.map((product) => {
                            const stock = stockData.find((s) => s.arRef === product.article.artCode);
                            return {
                                ...product,
                                stockQuantity: stock?.asQteSto ?? 0
                            };
                        });
                        this.loading = false;
                    },
                    error: (error) => {
                        console.error('Error loading stock data:', error);
                        this.loading = false;
                    }
                });
            },
            error: (error) => {
                console.error('Échec du chargement des produits', error);
                this.loading = false;
                this.toastr.error('Échec du chargement des produits', 'Erreur');
            }
        });
    }

    viewProductDetails(product: ProductWithStock) {
        this.selectedProduct = product;
        this.dialogVisible = true;
    }

    closeDialog() {
        this.dialogVisible = false;
        this.selectedProduct = null;
    }

    confirmDelete(product: Product) {
        this.confirmationService.confirm({
            message: `Etes vous sûr de vouloir supprimer le produit? "${product.artIntitule}"?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            rejectButtonStyleClass: 'p-button-danger',
            accept: async () => {
                const hasRelations = await this.checkRelations(product.artCode);
                if (hasRelations) {
                    this.toastr.warning('Suppression refusée : ce produit exist dans une ou plusieurs commandes');
                    return;
                }
                this.deleteProductFromSage(product);
                this.deletelocal(product);

                this.toastr.success('Produit supprimé avec succès.', 'Succès', {
                    positionClass: 'toast-top-right',
                    timeOut: 3000,
                    closeButton: true,
                    progressBar: true
                });
            }
        });
    }
    deleteProductFromSage(product: Product) {
        this.synchronisationService.deleteArticle(product.artCode).subscribe({
            next: (response) => {
                console.log('product deleted from Sage:', response);
            },
            error: (error) => {
                console.error('Error deleting product:', error);
            }
        });
    }
    deletelocal(product: Product) {
        this.productService.deleteProduct(product.artId).subscribe({
            next: () => {
                setTimeout(() => {
                    this.loadProducts();
                }, 300);
            },
            error: (error) => {
                console.error('un erreur est survenue lors de la suppression du produit en local', error);
            }
        });
    }

    exportToCSV() {
        // Include stock quantity in the CSV
        let csvContent = 'ID,Code,Name,Category,Sale Price,Cost Price,Stock Quantity,Unit,Status,Image URL,VAT Rate,Flag,Created Date\n';

        this.products.forEach((product) => {
            csvContent += `${product.article.artId},${product.article.artCode},"${product.article.artIntitule}",${product.article.artFamille},${product.article.artPrixVente.toFixed(3)},${product.article.artPrixAchat.toFixed(3)},${product.stockQuantity},${product.article.artUnite},${product.article.artEtat},${product.article.artImageUrl},${product.article.artTvaTaux},${product.article.artFlag},"${new Date(product.article.artDateCreate).toLocaleDateString()}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'products.csv');
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.toastr.info('Produits exportés avec succès.', 'Succès', {
            positionClass: 'toast-top-right',
            timeOut: 3000,
            closeButton: true,
            progressBar: true
        });
    }

    // Stock status methods - now correctly using the stockQuantity parameter
    getStockStatusSeverity(stockQty: number | undefined): TagSeverity {
        const stock = stockQty || 0;
        if (stock == 0) return 'danger';
        if (stock <= 10) return 'warn';
        return 'success';
    }

    getStockStatusLabel(stockQty: number | undefined): string {
        const stock = stockQty || 0;
        if (stock == 0) return 'Epuisé ';
        if (stock <= 10) return 'Moyenne';
        return 'Elevee';
    }

    getStockIcon(stockQty: number | undefined): string {
        const stock = stockQty || 0;
        if (stock == 0) return 'pi pi-exclamation-circle';
        if (stock <= 10) return 'pi pi-info-circle';
        return 'pi pi-check-circle';
    }

    calculateProfit(product: Product): number {
        return product.artPrixVente - product.artPrixAchat;
    }

    calculateProfitMargin(product: Product): number {
        if (product.artPrixAchat === 0) return 0;
        return ((product.artPrixVente - product.artPrixAchat) / product.artPrixAchat) * 100;
    }

    // Sync status methods
    getSyncStatusSeverity(sync: number): TagSeverity {
        return sync === 0 ? 'danger' : 'success';
    }

    getSyncStatusLabel(sync: number): string {
        return sync === 0 ? 'non synchronisé' : 'synchronisé';
    }

    getSyncIcon(sync: number): string {
        return sync === 0 ? 'pi pi-exclamation-circle' : 'pi pi-check-circle';
    }

    navigateToEdit(product: Product) {
        this.router.navigate(['store/admin/products/edit/', product.artId]);
    }

    navigateToCreate() {
        this.router.navigate(['store/admin/products/add']);
    }
    synchronizeProducts() {
        this.toastr.info('Synchronisation des produits en cours...', 'Information');
    }

    // Handle bulk synchronization of selected products
    synchronizeSelectedProducts() {
        if (this.selectedProducts.length === 0) {
            this.toastr.warning('Veuillez sélectionner au moins un produit à synchroniser.', 'Attention');
            return;
        }

        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir synchroniser ${this.selectedProducts.length} produit(s) sélectionné(s)?`,
            header: 'Confirmation de synchronisation',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                const count = this.selectedProducts.length;
                const syncCalls = this.selectedProducts.map((product) => this.synchronisationService.syncArticle(product.article.artCode));

                forkJoin(syncCalls).subscribe({
                    next: () => {
                        this.selectedProducts = [];
                        this.loadProducts(); // Now this is called AFTER syncs finish
                        this.toastr.success(`${count} produit(s) synchronisé(s) avec succès!`, 'Succès', {
                            positionClass: 'toast-top-right',
                            timeOut: 3000,
                            closeButton: true,
                            progressBar: true
                        });
                    },
                    error: () => {
                        this.toastr.error('Erreur lors de la synchronisation des produits.', 'Erreur');
                    }
                });
            }
        });
    }

    // Clear all selections
    clearSelection() {
        this.selectedProducts = [];
    }

    // Check if a specific product is selected
    isProductSelected(product: ProductWithStock): boolean {
        return this.selectedProducts.some((p) => p.article.artCode === product.article.artCode);
    }

    // Get count of selected products
    getSelectedCount(): number {
        return this.selectedProducts.length;
    }

    // Select all visible products (current page)
    selectAllVisible() {
        if (this.table && this.isNonSyncRoute) {
            // Get currently visible products from the table
            const visibleProducts = this.table.filteredValue || this.products;
            this.selectedProducts = [...visibleProducts];
        }
    }

    // Toggle selection of all visible products
    toggleSelectAll() {
        if (this.selectedProducts.length === this.products.length) {
            this.selectedProducts = [];
        } else {
            this.selectedProducts = [...this.products];
        }
    }
    async checkRelations(artCode: string): Promise<boolean> {
        try {
            const result = await this.CommandeService.hasOrdersForArticles(artCode).toPromise();
            return result ?? false;
        } catch (error) {
            this.toastr.error('Erreur lors de la vérification des relations', 'Erreur');
            return true; // Return true to prevent deletion on error
        }
    }
}
