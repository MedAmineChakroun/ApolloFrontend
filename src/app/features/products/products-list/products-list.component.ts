import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { OrderListModule } from 'primeng/orderlist';
import { PickListModule } from 'primeng/picklist';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../models/Product';
import { CartService } from '../../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { RippleModule } from 'primeng/ripple';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

@Component({
    selector: 'app-products-list',
    standalone: true,
    imports: [
        CommonModule, 
        DataViewModule, 
        FormsModule, 
        SelectButtonModule, 
        PickListModule, 
        OrderListModule, 
        TagModule, 
        ButtonModule, 
        InputTextModule,
        RippleModule
    ],
    templateUrl: './products-list.component.html',
    styleUrls: ['./products-list.component.css'],
    providers: [ProductsService]
})
export class ProductsListComponent {
    // Default product image to use when product image is not available
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    layout: 'list' | 'grid' = 'grid';
    options = ['list', 'grid'];
    products: Product[] = [];
    filteredProducts: Product[] = [];
    searchText: string = '';

    constructor(
        private productService: ProductsService, 
        private cartService: CartService,
        private toastr: ToastrService
    ) {}

    // Method to handle image loading errors
    handleProductImageError(event: any): void {
        event.target.src = this.DEFAULT_PRODUCT_IMAGE;
    }

    ngOnInit() {
        this.productService.getProducts().subscribe({
            next: (response: any) => {
                this.products = response.data.produits || [];
                this.filteredProducts = this.products;
            },
            error: (err) => {
                console.error('Error loading products:', err);
                this.toastr.error('Failed to load products. Please try again later.', 'Error');
                this.products = [];
                this.filteredProducts = [];
            }
        });
    }

    addToCart(product: Product) {
        this.cartService.addToCart(product);
        
        // Show success toast
        this.toastr.success(`${product.artIntitule} added to cart`, 'Added to Cart', {
            timeOut: 2000,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
        });

        // Add animation to cart icon (optional)
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.classList.add('animate-bounce');
            setTimeout(() => {
                cartIcon.classList.remove('animate-bounce');
            }, 1000);
        }
    }

    filterProducts(): void {
        if (!this.searchText.trim()) {
            this.filteredProducts = this.products;
            return;
        }

        const searchTerm = this.searchText.toLowerCase().trim();
        this.filteredProducts = this.products.filter(product => {
            const intitule = product.artIntitule?.toLowerCase() || '';
            const code = product.artCode?.toLowerCase() || '';
            const famille = product.artFamille?.toLowerCase() || '';
            const barcode = product.artBarcode?.toLowerCase() || '';
            
            return intitule.includes(searchTerm) || 
                   code.includes(searchTerm) || 
                   famille.includes(searchTerm) ||
                   barcode.includes(searchTerm);
        });
    }

    getStockStatus(stockValue: number): string {
        return stockValue > 0 ? 'IN STOCK' : 'OUT OF STOCK';
    }

    getStockSeverity(stockValue: number): TagSeverity {
        return stockValue > 0 ? 'success' : 'danger';
    }

    isOutOfStock(stockValue: number): boolean {
        return stockValue === 0;
    }
}
