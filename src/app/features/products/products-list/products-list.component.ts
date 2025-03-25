import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { OrderListModule } from 'primeng/orderlist';
import { PickListModule } from 'primeng/picklist';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../models/Product';
@Component({
    selector: 'app-products-list',
    standalone: true,
    imports: [CommonModule, DataViewModule, FormsModule, SelectButtonModule, PickListModule, OrderListModule, TagModule, ButtonModule],
    templateUrl: './products-list.component.html',
    styleUrls: ['./products-list.component.css'],
    providers: [ProductsService]
})
export class products {
    // Default product image to use when product image is not available
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    layout: 'list' | 'grid' = 'grid';

    options = ['list', 'grid'];

    products: Product[] = [];

    constructor(private productService: ProductsService) {}

    // Method to handle image loading errors
    handleProductImageError(event: any): void {
        event.target.src = this.DEFAULT_PRODUCT_IMAGE;
    }

    ngOnInit() {
        this.productService.getProducts().subscribe({
            next: (response: any) => {
                this.products = response.data.produits || []; //testMerge
                console.log('Products loaded:', this.products);
            },
            error: (err) => {
                console.error('Error loading products:', err);
                this.products = []; // Fallback empty array
            }
        });
    }

    getStockStatus(stockValue: number): string {
        return stockValue > 0 ? 'IN STOCK' : 'OUT OF STOCK';
    }

    getStockSeverity(stockValue: number): string {
        return stockValue > 0 ? 'success' : 'danger';
    }

    isOutOfStock(stockValue: number): boolean {
        return stockValue === 0;
    }
}
