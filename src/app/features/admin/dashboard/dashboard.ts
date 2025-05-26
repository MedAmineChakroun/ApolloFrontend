import { Component } from '@angular/core';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { TopCategories } from './components/topCategories';

@Component({
    selector: 'app-dashboard',
    imports: [StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, TopCategories],
    template: /*html*/ `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents" />
            <div class="col-span-12 xl:col-span-6">
                <app-recent-sales-widget />
                <app-top-categories-widget />
            </div>
            <div class="col-span-12 xl:col-span-6">
                <app-latest-sales-orders-widget />
                <app-best-selling-widget />
            </div>
        </div>
    `
})
export class Dashboard {}
