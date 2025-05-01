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

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

// Enhanced interface for products with stock information
interface ProductWithStock {
    article: Product;
    stockQuantity: number;
}

@Component({
    selector: 'app-product-management',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, CardModule, ToolbarModule, DialogModule, ConfirmDialogModule, ToastModule, TagModule, TooltipModule],
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

    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    handleProductImageError(event: any): void {
        event.target.src = this.DEFAULT_PRODUCT_IMAGE;
    }

    constructor(
        private confirmationService: ConfirmationService,
        private productService: ProductsService,
        private toastr: ToastrService,
        private router: Router,
        private stockService: StockService
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
                console.error('Error loading products:', error);
                this.loading = false;
                this.toastr.error('Failed to load products', 'Error');
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
            accept: () => {
                this.productService.deleteProduct(product.artId).subscribe({
                    next: () => {
                        this.loadProducts();
                        this.toastr.success('Produit supprimé avec succès', 'Succès', {
                            positionClass: 'toast-top-right',
                            timeOut: 3000,
                            closeButton: true,
                            progressBar: true
                        });
                    },
                    error: (error) => {
                        console.error('Error deleting product:', error);
                        this.toastr.error('Failed to delete product', 'Error');
                    }
                });
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
        if (stock <= 10) return 'danger';
        if (stock <= 30) return 'warn';
        return 'success';
    }

    getStockStatusLabel(stockQty: number | undefined): string {
        const stock = stockQty || 0;
        if (stock <= 10) return 'Low';
        if (stock <= 30) return 'Medium';
        return 'High';
    }

    getStockIcon(stockQty: number | undefined): string {
        const stock = stockQty || 0;
        if (stock <= 10) return 'pi pi-exclamation-circle';
        if (stock <= 30) return 'pi pi-info-circle';
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
}
