import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommandeService } from '../../../core/services/commande.service';
import { DocumentVenteLigne } from '../../../models/DocumentVenteLigne';
import { UserService } from '../../../core/services/client-service.service';
import { DocumentVente } from '../../../models/DocumentVente';
import { Client } from '../../../models/Client';
// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { CommonModule } from '@angular/common';
import { Divider } from 'primeng/divider';
@Component({
    selector: 'app-order-details',
    templateUrl: './order-details.component.html',
    styleUrls: ['./order-details.component.css'],
    providers: [MessageService],
    imports: [CommonModule, RouterModule, CardModule, ButtonModule, TableModule, ToastModule, TagModule, DividerModule, SkeletonModule, Divider]
})
export class OrderDetailsComponent implements OnInit {
    orderDocPiece: string | null = null;
    CommandeEntete: DocumentVente | null = null;
    LignesCommande: DocumentVenteLigne[] = [];
    clientData: Client | null = null;
    loading: boolean = true;

    constructor(
        private route: ActivatedRoute,
        private commandeService: CommandeService,
        private clientservice: UserService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit() {
        this.orderDocPiece = this.route.snapshot.paramMap.get('id');

        this.LoadCommandeEnTete();
        this.LoadCommandeLignes();
    }

    LoadUserData(code: string) {
        this.clientservice.getUserByCode(code).subscribe({
            next: (response) => {
                this.clientData = response;
                this.loading = false;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load client data' });
                console.error('Error loading client data:', err.message);
                this.loading = false;
            }
        });
    }

    LoadCommandeEnTete() {
        if (this.orderDocPiece) {
            this.commandeService.getDocumentVenteByDocPiece(this.orderDocPiece).subscribe({
                next: (response) => {
                    this.LoadUserData(response.docTiersCode);
                    this.CommandeEntete = response;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load order details' });
                    console.error('Error loading order details:', err.message);
                    this.loading = false;
                }
            });
        }
    }

    LoadCommandeLignes() {
        if (this.orderDocPiece) {
            this.commandeService.getLignesCommandeParDocPiece(this.orderDocPiece).subscribe({
                next: (response) => {
                    this.LignesCommande = response;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load order lines' });
                    console.error('Error loading order lines:', err.message);
                }
            });
        }
    }

    formatDate(date: Date): string {
        if (!date) return '';
        return new Date(date).toLocaleDateString();
    }

    calculateTotal(): number {
        return this.LignesCommande.reduce((sum, line) => sum + line.ligneHt, 0);
    }

    calculateTotalTTC(): number {
        return this.LignesCommande.reduce((sum, line) => sum + line.ligneTtc, 0);
    }

    exportPdf() {
        // Implement PDF export functionality here
        this.messageService.add({ severity: 'success', summary: 'Export', detail: 'Invoice exported as PDF' });
    }

    printInvoice() {
        window.print();
        this.messageService.add({ severity: 'info', summary: 'Print', detail: 'Print dialog opened' });
    }
    goBack() {
        this.router.navigate(['/store/customer/orders']);
    }
}
