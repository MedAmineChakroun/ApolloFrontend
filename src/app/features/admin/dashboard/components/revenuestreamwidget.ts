import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../../../layout/service/layout.service';
import { CommandeService } from '../../../../core/services/commande.service';
import { DocumentVente } from '../../../../models/DocumentVente';

@Component({
    standalone: true,
    selector: 'app-latest-sales-orders-widget',
    imports: [ChartModule],
    template: `
        <div class="card !mb-8">
            <div class="font-semibold text-xl mb-4">Dernières commandes de vente</div>
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
        private commandeService: CommandeService
    ) {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.loadChartData();
        });
    }

    ngOnInit() {
        this.loadChartData();
    }

    loadChartData() {
        this.commandeService.getDocumentVente().subscribe({
            next: (orders: DocumentVente[]) => {
                // Sort by date (most recent first) and take top 5
                const latestOrders = orders.sort((a, b) => new Date(b.docDate).getTime() - new Date(a.docDate).getTime()).slice(0, 7);

                this.buildChart(latestOrders);
            },
            error: (err) => console.error('Failed to load sales orders data', err)
        });
    }

    buildChart(orders: DocumentVente[]) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        // Create labels from order piece numbers and customer names
        const labels = orders.map((order) => {
            const customerName = order.docTiersIntitule.length > 12 ? order.docTiersIntitule.substring(0, 12) + '...' : order.docTiersIntitule;
            return `${order.docPiece} - ${customerName}`;
        });

        this.chartData = {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Montant TTC',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    data: orders.map((order) => order.docTtc),
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
                    label: 'Montant HT',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    data: orders.map((order) => order.docTht),
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
                },
                tooltip: {
                    callbacks: {
                        title: (context: any) => {
                            const index = context[0].dataIndex;
                            const order = orders[index];
                            return `Commande: ${order.docPiece}`;
                        },
                        afterTitle: (context: any) => {
                            const index = context[0].dataIndex;
                            const order = orders[index];
                            return [`Client: ${order.docTiersIntitule}`, `Date: ${new Date(order.docDate).toLocaleDateString('fr-FR')}`];
                        }
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
                        color: textMutedColor,
                        callback: function (value: any) {
                            return new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                            }).format(value);
                        }
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
