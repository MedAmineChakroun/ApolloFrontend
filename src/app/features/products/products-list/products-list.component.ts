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
    layout: 'list' | 'grid' = 'grid';

    options = ['list', 'grid'];

    products: Product[] = [];
    productDefaultImage = 'assets/generale/product-default.png';
    constructor(private productService: ProductsService) {}
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
}
