import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommandeService } from '../../../../core/services/commande.service';

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

    constructor(private CommandeService: CommandeService) {}

    ngOnInit() {
        this.loadChartData();
    }

    loadChartData() {
        this.CommandeService.getTopCategories().subscribe({
            next: (response: any[]) => {
                // Response format: [{ categoryName: string, totalQuantitySold: number }]
                const labels = response.map((category) => category.categoryName || 'Unknown');
                const values = response.map((category) => category.totalQuantitySold || 0);

                const documentStyle = getComputedStyle(document.documentElement);
                const textColor = documentStyle.getPropertyValue('--text-color');

                this.chartData = {
                    labels: labels.length > 0 ? labels : ['No Data'],
                    datasets: [
                        {
                            data: values.length > 0 ? values : [0],
                            backgroundColor: [documentStyle.getPropertyValue('--p-teal-500'), documentStyle.getPropertyValue('--p-indigo-500'), documentStyle.getPropertyValue('--p-purple-500'), documentStyle.getPropertyValue('--p-orange-500')],
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
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context: any) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    return `${label}: ${value} sold`;
                                }
                            }
                        }
                    }
                };
            },
            error: (error) => {
                console.error('Error loading top categories data:', error);

                // Set empty chart data on error
                this.chartData = {
                    labels: ['No Data'],
                    datasets: [
                        {
                            data: [0],
                            backgroundColor: ['#cccccc'],
                            hoverBackgroundColor: ['#aaaaaa']
                        }
                    ]
                };
            }
        });
    }
}
