import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { CommandeService } from '../../../../core/services/commande.service';

@Component({
    standalone: true,
    selector: 'app-best-selling-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: /*html*/ `
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <div class="font-semibold text-xl">Top produits vendus</div>
                    <div class="text-sm text-muted-color mt-1">Par Quantité</div>
                </div>
            </div>

            <ul class="list-none p-0 m-0">
                <li
                    *ngFor="let product of topProducts"
                    class="flex flex-col md:flex-row md:items-center md:justify-between  p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:shadow-md transform hover:scale-[1.02]"
                    (click)="viewProductDetails(product)"
                    role="button"
                    tabindex="0"
                    (keydown.enter)="viewProductDetails(product)"
                    (keydown.space)="viewProductDetails(product)"
                >
                    <div>
                        <span class="text-surface-900 dark:text-surface-0 font-medium mr-2 mb-1 md:mb-0">
                            {{ getProductName(product.article.artIntitule).length > 25 ? (getProductName(product.article.artIntitule) | slice: 0 : 25) + '...' : getProductName(product.article.artIntitule) }}
                        </span>
                        <div class="mt-1 text-muted-color">{{ product.article.artFamille || 'N/A' }}</div>
                    </div>
                    <div class="mt-2 md:mt-0 flex items-center">
                        <div class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden w-40 lg:w-24" style="height: 8px">
                            <div class="h-full" [ngClass]="product.color" [ngStyle]="{ width: product.percentage + '%' }"></div>
                        </div>
                        <span class="ml-4 font-medium">{{ product.totalQuantitySold }} units</span>
                    </div>
                </li>
            </ul>
        </div>
    `
})
export class BestSellingWidget implements OnInit {
    topProducts: {
        article: any;
        totalQuantitySold: number;
        percentage: number;
        color: string;
    }[] = [];

    totalSoldQty: number = 0;

    private colorOptions: string[] = [
        'bg-orange-500 text-orange-500',
        'bg-cyan-500 text-cyan-500',
        'bg-pink-500 text-pink-500',
        'bg-green-500 text-green-500',
        'bg-purple-500 text-purple-500',
        'bg-indigo-500 text-indigo-500',
        'bg-teal-500 text-teal-500'
    ];

    constructor(
        private commandeService: CommandeService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadBestSellers();
    }

    loadBestSellers() {
        this.commandeService.getTopProduits().subscribe({
            next: (response: any[]) => {
                // Response format: [{ article: Article, totalQuantitySold: number }]

                if (!response || response.length === 0) {
                    this.topProducts = [];
                    this.totalSoldQty = 0;
                    return;
                }

                // Take only top 7 products
                const topProductsData = response.slice(0, 7);

                // Find max quantity for percentage calculation
                const maxQty = Math.max(...topProductsData.map((p) => p.totalQuantitySold)) || 1;

                // Calculate total sold quantity
                this.totalSoldQty = topProductsData.reduce((sum, p) => sum + p.totalQuantitySold, 0);

                // Map the data with colors and percentages
                this.topProducts = topProductsData.map((product, index) => ({
                    article: product.article,
                    totalQuantitySold: product.totalQuantitySold,
                    percentage: Math.round((product.totalQuantitySold / maxQty) * 100),
                    color: this.colorOptions[index % this.colorOptions.length]
                }));
            },
            error: (err) => {
                console.error('Failed to load best-selling products', err);
                this.topProducts = [];
                this.totalSoldQty = 0;
            }
        });
    }

    getProductName(artIntitule: string): string {
        return artIntitule || 'Unknown Product';
    }

    viewProductDetails(product: any): void {
        // Navigate to product details page using the article ID
        this.router.navigate([`/store/products/${product.article.artId}`]);
    }
}
