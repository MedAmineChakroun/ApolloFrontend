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

    viewOrderDetails() {
        this.toast.success('Order details for ');
    }
    goToNewOrder() {
        this.router.navigate(['/store/products/cart']);
    }
}
