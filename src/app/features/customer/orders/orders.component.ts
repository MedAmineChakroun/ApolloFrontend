import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DocumentVente } from '../../../models/DocumentVente';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommandeService } from '../../../core/services/commande.service';
import { selectUser } from '../../../store/user/user.selectors';
import { Store } from '@ngrx/store';
@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [CommonModule, TableModule, InputTextModule, ButtonModule, RippleModule, TooltipModule, CardModule, BadgeModule, TagModule, ToastModule, FormsModule],
    providers: [MessageService],
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
    @ViewChild('dt') table!: Table;
    articleCounts: { [docPiece: string]: number } = {};
    orders: DocumentVente[] = [];
    loading: boolean = true;
    tiersCode: string = '';
    constructor(
        private router: Router,
        private toast: ToastrService,
        private commandeService: CommandeService,
        private store: Store
    ) {}

    ngOnInit() {
        this.loadData();
    }
    loadData() {
        this.store.select(selectUser).subscribe({
            next: (user) => {
                if (user && user.tiersCode) {
                    this.tiersCode = user.tiersCode;

                    // Now fetch data with the correct tiersCode
                    this.commandeService.getDocumentVenteByTiersCode(this.tiersCode).subscribe({
                        next: (response) => {
                            this.orders = response;
                            this.loadNbLigne();
                            this.loading = false;
                        },
                        error: (err) => {
                            this.loading = false;
                            console.error('Error loading orders:', err.message);
                            this.toast.error('Failed to load orders');
                        }
                    });
                }
            },
            error: (error) => {
                this.loading = false;
                console.log(error);
            }
        });
    }
    loadNbLigne() {
        this.orders.forEach((order) => {
            this.commandeService.getNbLigneCommandeParDocPiece(order.docPiece).subscribe({
                next: (count) => {
                    this.articleCounts[order.docPiece] = count;
                },
                error: () => {
                    this.articleCounts[order.docPiece] = 0;
                }
            });
        });
    }

    goToNewOrder() {
        this.router.navigate(['/store/products/cart']);
    }
    viewOrderDetails(orderId: string) {
        this.router.navigate(['/store/customer/orderDetails', orderId]);
    }
    customSort(event: any) {
        const field = event.field as keyof DocumentVente | 'articleCount';

        event.data.sort((a: DocumentVente, b: DocumentVente) => {
            let value1: any;
            let value2: any;

            if (field === 'articleCount') {
                value1 = this.articleCounts[a.docPiece] || 0;
                value2 = this.articleCounts[b.docPiece] || 0;
            } else {
                value1 = a[field as keyof DocumentVente];
                value2 = b[field as keyof DocumentVente];
            }

            let result = 0;

            if (value1 == null && value2 != null) result = -1;
            else if (value1 != null && value2 == null) result = 1;
            else if (value1 == null && value2 == null) result = 0;
            else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
            else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

            return event.order * result;
        });
    }
    exportCSV() {
        const headers = ['Order #', 'Customer Code', 'Date', 'Article Count', 'Total HT', 'Total TTC'];
        const rows = this.orders.map((order) => [order.docPiece, order.docTiersCode, new Date(order.docDate).toLocaleDateString(), this.articleCounts[order.docPiece] || 0, order.docTht, order.docTtc]);

        const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'My-customer-orders.csv');
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
