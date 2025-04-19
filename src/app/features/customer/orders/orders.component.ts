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
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommandeService } from '../../../core/services/commande.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { selectUser } from '../../../store/user/user.selectors';
import { Store } from '@ngrx/store';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [CommonModule, ConfirmDialogModule, TableModule, InputTextModule, ButtonModule, RippleModule, TooltipModule, CardModule, BadgeModule, TagModule, ToastModule, FormsModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
    readonly sort = -1;
    @ViewChild('dt') table!: Table;
    articleCounts: { [docPiece: string]: number } = {};
    orders: DocumentVente[] = [];
    filteredOrders: DocumentVente[] = [];
    loading: boolean = true;
    tiersCode: string = '';
    Filtre: string = '';
    statusFilter: string | null = null;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toast: ToastrService,
        private commandeService: CommandeService,
        private store: Store,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.Filtre = this.router.url.split('/').pop() || '';

        // Get query parameters from URL
        this.route.queryParams.subscribe((params) => {
            this.statusFilter = params['type'] || null;
            if (this.orders.length > 0) {
                this.applyStatusFilter();
            }
        });

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
                            this.applyStatusFilter();
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

    applyStatusFilter() {
        if (!this.statusFilter) {
            this.filteredOrders = [...this.orders];
            return;
        }

        // Map URL parameter to Etat value
        let etatValue: number | null = null;

        // Make sure the case matches exactly what's in the URL
        if (this.statusFilter.toLowerCase() === 'accepte') {
            etatValue = 1;
        } else if (this.statusFilter.toLowerCase() === 'refuse') {
            etatValue = 2;
        } else if (this.statusFilter.toLowerCase() === 'attente') {
            etatValue = 0;
        }

        // Filter orders by Etat value if specified
        if (etatValue !== null) {
            // Try different property names that might hold the status
            this.filteredOrders = this.orders.filter((order) => {
                const statusMatch = order.docEtat === etatValue || (order as any).etat === etatValue || (order as any).status === etatValue || (order as any).docStatus === etatValue;

                return statusMatch;
            });
        } else {
            this.filteredOrders = [...this.orders];
        }
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
        // Use filteredOrders instead of orders for export
        const rows = this.filteredOrders.map((order) => [order.docPiece, order.docTiersCode, new Date(order.docDate).toLocaleDateString(), this.articleCounts[order.docPiece] || 0, order.docTht, order.docTtc]);

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

    getStatus(etat: number): { label: string; severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined } {
        switch (etat) {
            case 0:
                return { label: 'En attente', severity: 'secondary' };
            case 1:
                return { label: 'Accepté', severity: 'success' };
            case 2:
                return { label: 'Refusé', severity: 'danger' };
            default:
                return { label: 'Inconnu', severity: 'info' };
        }
    }

    supprimerCommande(docId: number) {
        console.log(docId);
        this.confirmationService.confirm({
            message: 'Voulez-vous vraiment supprimer cette commande ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.commandeService.deleteDocumentVente(docId).subscribe(() => {
                    this.toast.success('Commande supprimée');
                    this.loadData();
                });
            },
            reject: () => {}
        });
    }
}
