import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { CommandeService } from '../../../../core/services/commande.service';
import { ProductsService } from '../../../../core/services/products.service';
import { DocumentVenteLigne } from '../../../../models/DocumentVenteLigne';
import { Product } from '../../../../models/Product';
import { forkJoin } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-best-selling-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: /*html*/ `
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <div class="font-semibold text-xl">Top produits vendus</div>
                    <div class="text-sm text-muted-color mt-1">By Quantity</div>
                </div>
            </div>

            <ul class="list-none p-0 m-0">
                <li *ngFor="let product of topProducts" class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <span class="text-surface-900 dark:text-surface-0 font-medium mr-2 mb-1 md:mb-0">
                            {{ product.designation.length > 25 ? (product.designation | slice: 0 : 25) + '...' : product.designation }}
                        </span>
                        <div class="mt-1 text-muted-color">{{ product.famille || 'N/A' }}</div>
                    </div>
                    <div class="mt-2 md:mt-0 flex items-center">
                        <div class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden w-40 lg:w-24" style="height: 8px">
                            <div class="h-full" [ngClass]="product.color" [ngStyle]="{ width: product.percentage + '%' }"></div>
                        </div>
                        <span class="ml-4 font-medium">{{ product.totalQty }} units</span>
                    </div>
                </li>
            </ul>
        </div>
    `
})
export class BestSellingWidget implements OnInit {
    topProducts: {
        designation: string;
        famille: string;
        percentage: number;
        totalQty: number;
        color: string;
    }[] = [];

    totalSoldQty: number = 0;

    private colorOptions: string[] = ['bg-orange-500 text-orange-500', 'bg-cyan-500 text-cyan-500', 'bg-pink-500 text-pink-500', 'bg-green-500 text-green-500'];

    constructor(
        private commandeService: CommandeService,
        private productsService: ProductsService
    ) {}

    ngOnInit() {
        this.loadBestSellers();
    }

    loadBestSellers() {
        this.commandeService.getTopLignesCommande().subscribe({
            next: (lignes: DocumentVenteLigne[]) => {
                const qtyMap: { [code: string]: number } = {};
                lignes.forEach((l) => {
                    qtyMap[l.ligneArtCode] = (qtyMap[l.ligneArtCode] || 0) + l.ligneQte;
                });

                const topCodes = Object.entries(qtyMap)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 7)
                    .map(([code]) => code);

                forkJoin(topCodes.map((code) => this.productsService.getProductsByCode(code))).subscribe((products: Product[]) => {
                    const topProductData = products.map((product) => {
                        const totalQty = qtyMap[product.artCode] || 0;
                        const color = this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)];
                        return {
                            designation: product.artIntitule,
                            famille: product.artFamille || 'N/A',
                            totalQty,
                            color
                        };
                    });

                    const maxQty = Math.max(...topProductData.map((p) => p.totalQty)) || 1;

                    this.topProducts = topProductData.map((p) => ({
                        ...p,
                        percentage: Math.round((p.totalQty / maxQty) * 100)
                    }));

                    this.totalSoldQty = this.topProducts.reduce((sum, p) => sum + p.totalQty, 0);
                });
            },
            error: (err) => console.error('Failed to load best-selling products', err)
        });
    }
}
