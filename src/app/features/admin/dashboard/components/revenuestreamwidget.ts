import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, forkJoin, Subscription } from 'rxjs';
import { LayoutService } from '../../../../layout/service/layout.service';
import { CommandeService } from '../../../../core/services/commande.service';
import { ProductsService } from '../../../../core/services/products.service';
import { Product } from '../../../../models/Product';
import { DocumentVenteLigne } from '../../../../models/DocumentVenteLigne';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [ChartModule],
    template: `
        <div class="card !mb-8">
            <div class="font-semibold text-xl mb-4">Top Products: Purchase vs Sale Price</div>
            <p-chart type="bar" [data]="chartData" [options]="chartOptions" class="h-90" />
        </div>
    `
})
export class RevenueStreamWidget implements OnInit, OnDestroy {
    chartData: any;
    chartOptions: any;
    subscription!: Subscription;

    constructor(
        public layoutService: LayoutService,
        private commandeService: CommandeService,
        private productsService: ProductsService
    ) {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.loadChartData();
        });
    }

    ngOnInit() {
        this.loadChartData();
    }

    loadChartData() {
        this.commandeService.getTopLignesCommande().subscribe({
            next: (lignes: DocumentVenteLigne[]) => {
                const productCodes = [...new Set(lignes.map((l) => l.ligneArtCode))];

                forkJoin(productCodes.map((code) => this.productsService.getProductsByCode(code))).subscribe((products: Product[]) => {
                    const dataMap: {
                        [key: string]: { designation: string; prixVente: number; prixAchat: number };
                    } = {};

                    lignes.forEach((ligne) => {
                        const product = products.find((p) => p.artCode === ligne.ligneArtCode);
                        if (product) {
                            const designation = product.artIntitule;
                            const vente = ligne.ligneQte * product.artPrixVente;
                            const achat = ligne.ligneQte * product.artPrixAchat;

                            if (!dataMap[designation]) {
                                dataMap[designation] = { designation, prixVente: 0, prixAchat: 0 };
                            }

                            dataMap[designation].prixVente += vente;
                            dataMap[designation].prixAchat += achat;
                        }
                    });

                    const sorted = Object.values(dataMap)
                        .sort((a, b) => b.prixVente - a.prixVente)
                        .slice(0, 5); // top 5

                    this.buildChart(sorted);
                });
            },
            error: (err) => console.error('Failed to load sales data', err)
        });
    }

    buildChart(data: { designation: string; prixVente: number; prixAchat: number }[]) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        this.chartData = {
            labels: data.map((d) => (d.designation.length > 15 ? d.designation.substring(0, 15) + '...' : d.designation)),
            datasets: [
                {
                    type: 'bar',
                    label: 'Prix Vente',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    data: data.map((d) => d.prixVente),
                    barThickness: 32,
                    borderRadius: {
                        topLeft: 8,
                        topRight: 8,
                        bottomLeft: 0,
                        bottomRight: 0
                    }
                },
                {
                    type: 'bar',
                    label: 'Prix Achat',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    data: data.map((d) => d.prixAchat),
                    barThickness: 32,
                    borderRadius: {
                        topLeft: 8,
                        topRight: 8,
                        bottomLeft: 0,
                        bottomRight: 0
                    },
                    borderSkipped: false
                }
            ]
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    stacked: false,
                    ticks: {
                        color: textMutedColor,
                        maxRotation: 45,
                        minRotation: 30
                    },
                    grid: {
                        color: 'transparent',
                        borderColor: 'transparent'
                    }
                },
                y: {
                    stacked: false,
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: borderColor,
                        borderColor: 'transparent',
                        drawTicks: false
                    }
                }
            }
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
