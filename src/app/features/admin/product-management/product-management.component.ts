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
// Define valid severity types for p-tag to match PrimeNG's expected types
type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

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

    products: Product[] = [];
    selectedProduct: Product | null = null;
    dialogVisible: boolean = false;
    loading: boolean = true;
    editMode: boolean = false;
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    handleProductImageError(event: any): void {
        event.target.src = this.DEFAULT_PRODUCT_IMAGE;
    }

    constructor(
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private productService: ProductsService,
        private toastr: ToastrService
    ) {}

    ngOnInit() {
        this.loadProducts();
    }

    loadProducts() {
        this.loading = true;
        // Simulating API call with static data
        this.productService.getProducts().subscribe({
            next: (response: any) => {
                this.products = response?.data?.produits;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading products:', error);
                this.loading = false;
            }
        });
    }

    viewProductDetails(product: Product) {
        this.selectedProduct = product;
        this.dialogVisible = true;
        this.editMode = false;
    }

    editProduct(product: Product) {
        this.selectedProduct = { ...product };
        this.dialogVisible = true;
        this.editMode = true;
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
                // In a real app, you would call an API to delete the product
                this.productService.deleteProduct(product.artId).subscribe({
                    next: () => {
                        this.loadProducts();
                        this.toastr.success('Produit supprimé avec succès', 'Succès', {
                            positionClass: 'toast-top-right',
                            timeOut: 3000,
                            closeButton: true,
                            progressBar: true
                        });
                    }
                });
            }
        });
    }

    exportToCSV() {
        // Correct CSV headers (no Stock Status now)
        let csvContent = 'ID,Code,Name,Category,Sale Price,Cost Price,Unit,Image URL,VAT Rate,Flag,Created Date\n';

        this.products.forEach((product) => {
            csvContent += `${product.artId},${product.artCode},"${product.artIntitule}",${product.artFamille},${product.artPrixVente.toFixed(3)},${product.artPrixAchat.toFixed(3)},${product.artUnite},${product.artImageUrl},${product.artTvaTaux},${product.artFlag},"${new Date(product.artDateCreate).toLocaleDateString()}"\n`;
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

        // Use toastr instead of messageService
        this.toastr.info('Produits exportés avec succès.', 'Succès', {
            positionClass: 'toast-top-right',
            timeOut: 3000,
            closeButton: true,
            progressBar: true
        });
    }

    // Fixed method to return the specific TagSeverity type
    getStockStatusSeverity(stock: number): TagSeverity {
        if (stock <= 10) return 'danger';
        if (stock <= 30) return 'warn';
        return 'success';
    }

    getStockStatusLabel(stock: number): string {
        if (stock <= 10) return 'Low';
        if (stock <= 30) return 'Medium';
        return 'High';
    }

    getStockIcon(stock: number): string {
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
    // Fixed method to return the specific TagSeverity type
    getSyncStatusSeverity(Sync: number): TagSeverity {
        if (Sync == 0) return 'danger';
        if (Sync == 1) return 'success';
        return 'success';
    }

    getSyncStatusLabel(Sync: number): string {
        if (Sync == 0) return 'non synchronisé';
        if (Sync == 1) return 'synchronisé';
        return 'synchronisé';
    }

    getSyncIcon(Sync: number): string {
        if (Sync == 0) return 'pi pi-exclamation-circle';
        if (Sync == 1) return 'pi pi-check-circle';
        return 'pi pi-check-circle';
    }
    saveProduct() {}

    // Method to cancel editing and return to view mode
    cancelEdit() {
        // Restore original product data
        if (this.selectedProduct) {
            const originalProduct = this.products.find((p) => p.artId === this.selectedProduct?.artId);
            if (originalProduct) {
                this.selectedProduct = { ...originalProduct };
            }
        }
        this.editMode = false;
    }
}
