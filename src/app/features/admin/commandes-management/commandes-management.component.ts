import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommandeService } from '../../../core/services/commande.service';
import { DocumentVente } from '../../../models/DocumentVente';

// PrimeNG imports
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';

@Component({
    selector: 'app-orders-management',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, RippleModule, InputTextModule, DropdownModule, TooltipModule, TagModule, ConfirmDialogModule, ToastModule, CardModule, BadgeModule],
    providers: [ConfirmationService, MessageService],
    templateUrl: './commandes-management.component.html',
    styleUrls: ['./commandes-management.component.css']
})
export class CommandesManagementComponent implements OnInit {
    @ViewChild('dt') table!: Table;

    orders: DocumentVente[] = [];
    filteredOrders: DocumentVente[] = [];
    loading: boolean = true;
    articleCounts: { [key: string]: number } = {};
    globalFilter: string = '';
    statusFilter: string | null = null;

    statusOptions: { label: string; value: number; severity: 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast' }[] = [
        { label: 'En attente', value: 0, severity: 'secondary' },
        { label: 'Accepté', value: 1, severity: 'success' },
        { label: 'Refusé', value: 2, severity: 'danger' }
    ];

    constructor(
        private commandeService: CommandeService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.loading = true;
        this.commandeService.getDocumentVente().subscribe({
            next: (data) => {
                this.orders = data;
                this.filteredOrders = [...data];
                this.loadArticleCounts();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading orders:', error);
                this.loading = false;
            }
        });
    }

    loadArticleCounts() {
        for (const order of this.orders) {
            this.commandeService.getNbLigneCommandeParDocPiece(order.docPiece).subscribe({
                next: (count) => {
                    this.articleCounts[order.docPiece] = count;
                },
                error: () => {
                    this.articleCounts[order.docPiece] = 0;
                }
            });
        }
    }

    getStatus(statusCode: number): { label: string; severity: 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast' } {
        const status = this.statusOptions.find((s) => s.value === statusCode);
        return status || { label: 'Inconnu', severity: 'info' };
    }

    getInitials(name: string): string {
        if (!name) return '';

        return name
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2); // Limit to 2 characters
    }

    applyStatusFilter(statusValue: number | null) {
        this.statusFilter = statusValue !== null ? String(statusValue) : null;

        if (statusValue === null) {
            this.filteredOrders = [...this.orders];
        } else {
            this.filteredOrders = this.orders.filter((order) => order.docEtat === statusValue);
        }
    }

    onSearchChange(event: Event) {
        const searchValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
        this.table.filterGlobal(searchValue, 'contains');
    }

    customSort(event: any) {
        const field = event.field;

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
            else if (field === 'docDate') {
                result = new Date(value1).getTime() - new Date(value2).getTime();
            } else {
                result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
            }

            return event.order * result;
        });
    }

    changeOrderStatus(order: DocumentVente, newStatus: number) {
        order.docEtat = newStatus;
    }

    viewOrderDetails(docPiece: string) {
        this.router.navigate(['/store/customer/orderDetails', docPiece]);
    }

    supprimerCommande(docId: number) {
        this.confirmationService.confirm({
            message: 'Voulez-vous vraiment supprimer cette commande ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.commandeService.deleteDocumentVente(docId).subscribe({
                    next: () => {
                        this.loadOrders(); // Reload orders after deletion
                    },
                    error: (error) => {
                        console.error('Error deleting order:', error);
                    }
                });
            }
        });
    }

    exportCSV() {
        const headers = ['Order #', 'Init', 'Customer Code', 'Customer Name', 'Date', 'Article Count', 'Total HT', 'Total TTC', 'Status'];
        const rows = this.filteredOrders.map((order) => [
            order.docPiece,
            this.getInitials(order.docTiersIntitule),
            order.docTiersCode,
            order.docTiersIntitule,
            new Date(order.docDate).toLocaleDateString(),
            this.articleCounts[order.docPiece] || 0,
            order.docTht,
            order.docTtc,
            this.getStatus(order.docEtat).label
        ]);

        const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'orders-export.csv');
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    clearFilters() {
        this.statusFilter = null;
        this.table.clear();
        this.filteredOrders = [...this.orders];
    }
}
