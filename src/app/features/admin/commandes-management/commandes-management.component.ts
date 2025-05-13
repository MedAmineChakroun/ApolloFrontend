// TypeScript Component (commandes-management.component.ts)
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
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
    selector: 'app-orders-management',
    standalone: true,
    imports: [CommonModule, ToolbarModule, FormsModule, TableModule, ButtonModule, RippleModule, InputTextModule, DropdownModule, TooltipModule, TagModule, ConfirmDialogModule, ToastModule, CardModule, BadgeModule, DialogModule],
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
    isSyncRoute = false;
    isNonSyncRoute = false;
    totalCommandes = 0;
    // Constantes pour les états de commande
    readonly STATUS_EN_ATTENTE: number = 0;
    readonly STATUS_ACCEPTE: number = 1;
    readonly STATUS_REFUSE: number = 2;
    // New properties for rejection dialog
    rejectionDialogVisible: boolean = false;
    currentOrder: DocumentVente | null = null;
    rejectionNote: string = '';

    statusOptions: { label: string; value: number; severity: 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast' }[] = [
        { label: 'En attente', value: 0, severity: 'secondary' },
        { label: 'Accepté', value: 1, severity: 'success' },
        { label: 'Refusé', value: 2, severity: 'danger' }
    ];

    // Color map for initials based on first character
    colorMap: { [key: string]: string } = {
        'A': '#4CAF50', // Green
        'B': '#FFC107', // Yellow
        'C': '#2196F3', // Blue
        'D': '#9C27B0', // Purple
        'E': '#FF5722', // Deep Orange
        'F': '#795548', // Brown
        'G': '#607D8B', // Blue Grey
        'H': '#F44336', // Red
        'I': '#00BCD4', // Cyan
        'J': '#3F51B5', // Indigo
        'K': '#8BC34A', // Light Green
        'L': '#FF9800', // Orange
        'M': '#E91E63', // Pink
        'N': '#009688', // Teal
        'O': '#673AB7', // Deep Purple
        'P': '#FFEB3B', // Yellow
        'Q': '#CDDC39', // Lime
        'R': '#03A9F4', // Light Blue
        'S': '#FF5252', // Red Accent
        'T': '#69F0AE', // Green Accent
        'U': '#40C4FF', // Blue Accent
        'V': '#B388FF', // Purple Accent
        'W': '#FFD740', // Amber Accent
        'X': '#64FFDA', // Teal Accent
        'Y': '#FF80AB', // Pink Accent
        'Z': '#B2FF59'  // Light Green Accent
    };

    constructor(
        private commandeService: CommandeService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit() {
        this.isSyncRoute = this.router.url === '/store/admin/orders/sync';
        this.isNonSyncRoute = this.router.url === '/store/admin/synchronize/commandes';
        this.loadOrders();
    }

    loadOrders() {
        this.loading = true;
        // Check if the current route is the sync route
        this.commandeService.getDocumentVente().subscribe({
            next: (data) => {
                // If on sync route, filter to only show orders with docFlag === 0
                if (this.isSyncRoute) {
                    this.orders = data.filter((order) => order.docFlag === 1);
                } else if (this.isNonSyncRoute) {
                    this.orders = data.filter((order) => order.docFlag === 0);
                } else {
                    this.orders = data;
                }
                this.totalCommandes = this.orders.length;
                this.filteredOrders = [...this.orders];
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

    getInitialColor(name: string): string {
        if (!name) return '#3B82F6'; // Default to primary color
        
        const firstChar = name.charAt(0).toUpperCase();
        return this.colorMap[firstChar] || '#3B82F6'; // Return mapped color or default
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
        // Reset current order to ensure we're working with the latest data
        this.currentOrder = order;

        if (newStatus === 0) {
            this.confirmationService.confirm({
                message: "Voulez-vous vraiment changer l'etat de cette commande à en attente ?",
                header: 'Confirmation',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Oui',
                rejectLabel: 'Non',
                rejectButtonStyleClass: 'p-button-danger',
                accept: () => {
                    this.changeOrderStatus2(order.docId, newStatus, 'en attente');
                },
                reject: () => {
                    this.resetOrderStatus(order);
                }
            });
        } else if (newStatus === 1) {
            this.confirmationService.confirm({
                message: "Voulez-vous vraiment changer l'etat de cette commande à accepté ?",
                header: 'Confirmation',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Oui',
                rejectLabel: 'Non',
                rejectButtonStyleClass: 'p-button-danger',
                accept: () => {
                    this.changeOrderStatus2(order.docId, newStatus, 'accepted');
                },
                reject: () => {
                    this.resetOrderStatus(order);
                }
            });
        } else if (newStatus === 2) {
            // Open the rejection dialog for status 2
            this.rejectionNote = ''; // Clear previous notes
            this.rejectionDialogVisible = true;
        }
    }

    // Reset the dropdown to previous value if action is cancelled
    resetOrderStatus(order: DocumentVente) {
        // Find the original order in the orders array
        const originalOrder = this.orders.find((o) => o.docId === order.docId);
        if (originalOrder) {
            order.docEtat = originalOrder.docEtat;
        }
        this.loadOrders(); // Reload to ensure UI is in sync
    }

    confirmRejection() {
        if (this.currentOrder && this.rejectionNote.trim()) {
            this.changeOrderStatus2(this.currentOrder.docId, 2, this.rejectionNote);
            this.rejectionDialogVisible = false;
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please provide a reason for rejection'
            });
        }
    }

    cancelRejection() {
        if (this.currentOrder) {
            this.resetOrderStatus(this.currentOrder);
        }
        this.rejectionDialogVisible = false;
    }

    changeOrderStatus2(orderId: number, newStatus: number, note: string) {
        this.commandeService.updateEtatDocument(orderId, newStatus, note).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'le client est notifié du changement de statut'
                });
                this.loadOrders(); // Reload orders after update
            },
            error: (error) => {
                console.error('Error updating order status:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update order status'
                });
                this.loadOrders(); // Reload to reset UI
            }
        });
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
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Order deleted successfully'
                        });
                        this.loadOrders(); // Reload orders after deletion
                    },
                    error: (error) => {
                        console.error('Error deleting order:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete order'
                        });
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
    getSyncStatusLabel(flag: number): string {
        return flag === 1 ? 'Synchronisé' : 'Non Synchronisé';
    }

    getSyncStatusSeverity(flag: number): 'success' | 'danger' | 'info' | 'warn' | 'secondary' | 'contrast' {
        return flag === 1 ? 'success' : 'danger';
    }

    getSyncStatusIcon(flag: number): string {
        return flag === 1 ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle';
    }
    viewCustomerDetails(order: DocumentVente) {
        this.router.navigate([`/store/admin/users/${order.docTiersCode}`]);
    }
    synchronizeCommandes() {
        this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'Synchronisation en cours...'
        });
    }
    canEditOrDelete(docEtat: number): boolean {
        return docEtat === this.STATUS_EN_ATTENTE;
    }
    updateOrderDetails(orderId: string) {
        this.router.navigate(['/store/customer/orders/edit', orderId]);
    }
}
