import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ProductsService } from '../../../../core/services/products.service';
import { Product } from '../../../../models/Product';

@Component({
    standalone: true,
    selector: 'app-top-categories-widget',
    imports: [ChartModule],
    template: `
        <div class="card flex flex-col items-center !mb-8">
            <div class="font-semibold text-xl mb-4">Top 4 Product Categories</div>
            <p-chart type="pie" [data]="chartData" [options]="chartOptions" class="w-[300px] h-[300px] mx-auto" />
        </div>
    `
})
export class TopCategories implements OnInit {
    chartData: any;
    chartOptions: any;

    constructor(private productsService: ProductsService) {}

    ngOnInit() {
        this.loadChartData();
    }

    loadChartData() {
        this.productsService.getProducts().subscribe({
            next: (response: any) => {
                let products: Product[] = [];

                if (response?.data?.produits && Array.isArray(response.data.produits)) {
                    products = response.data.produits;
                } else if (Array.isArray(response)) {
                    products = response;
                }

                const familyCounts: { [key: string]: number } = {};
                products.forEach((product) => {
                    if (product?.artFamille) {
                        familyCounts[product.artFamille] = (familyCounts[product.artFamille] || 0) + 1;
                    }
                });

                const sortedCategories = Object.entries(familyCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 4);

                const labels = sortedCategories.map(([label]) => label);
                const values = sortedCategories.map(([_, count]) => count);

                const documentStyle = getComputedStyle(document.documentElement);
                const textColor = documentStyle.getPropertyValue('--text-color');

                this.chartData = {
                    labels: labels.length > 0 ? labels : ['No Data'],
                    datasets: [
                        {
                            data: values.length > 0 ? values : [0],
                            backgroundColor: [
                                documentStyle.getPropertyValue('--p-teal-500'), // teal is second again
                                documentStyle.getPropertyValue('--p-indigo-500'),
                                documentStyle.getPropertyValue('--p-purple-500'), // purple is third again
                                documentStyle.getPropertyValue('--p-orange-500')
                            ],
                            hoverBackgroundColor: [documentStyle.getPropertyValue('--p-teal-400'), documentStyle.getPropertyValue('--p-indigo-400'), documentStyle.getPropertyValue('--p-purple-400'), documentStyle.getPropertyValue('--p-orange-400')]
                        }
                    ]
                };

                this.chartOptions = {
                    plugins: {
                        legend: {
                            labels: {
                                usePointStyle: true,
                                color: textColor
                            }
                        }
                    }
                };
            },
            error: (error) => {
                console.error('Error loading product data:', error);
            }
        });
    }
}
