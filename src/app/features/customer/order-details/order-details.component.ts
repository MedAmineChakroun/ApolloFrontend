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
//forpdf exportation
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
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

    printInvoice() {
        window.print();
        this.messageService.add({ severity: 'info', summary: 'Print', detail: 'Print dialog opened' });
    }
    goBack() {
        this.router.navigate(['/store/customer/orders']);
    }
    exportPdf() {
        this.messageService.add({ severity: 'info', summary: 'PDF Export', detail: 'Preparing PDF...' });

        const doc = new jsPDF();
        const fileName = `Invoice-${this.orderDocPiece}-${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;

        // Helper function to split text into multiple lines
        const splitTextToLines = (text: string, maxWidth: number) => {
            return doc.splitTextToSize(text, maxWidth);
        };

        // Document title
        doc.setFontSize(20);
        doc.text(`Invoice #${this.orderDocPiece}`, 105, 20, { align: 'center' });

        // Customer and company information
        doc.setFontSize(12);
        doc.text('Bill To:', 15, 40);

        // Handle long customer name with line breaks
        const customerName = this.clientData?.tiersIntitule || '';
        const nameLines = splitTextToLines(customerName, 90);
        doc.text(nameLines, 15, 45);

        // Calculate new Y position based on number of lines in customer name
        let yPos = 45 + nameLines.length * 5;

        doc.text(`${this.clientData?.tiersAdresse1}`, 15, yPos);
        yPos += 5;
        doc.text(`${this.clientData?.tiersCodePostal}, ${this.clientData?.tiersVille}`, 15, yPos);

        // Company info (right aligned)
        doc.text('Apollo Store', 150, 40, { align: 'right' });
        doc.text('123 Business Street', 150, 45, { align: 'right' });
        doc.text('Business City, 12345', 150, 50, { align: 'right' });

        // Invoice details
        yPos = Math.max(yPos + 15, 70); // Make sure we have enough space
        doc.text(`Date: ${this.formatDate(this.CommandeEntete?.docDate || new Date())}`, 15, yPos);
        yPos += 5;
        doc.text(`Status: Passed successfully`, 15, yPos);

        // Items table
        yPos += 10;
        doc.line(15, yPos, 195, yPos);
        yPos += 5;

        // Table headers
        doc.setFont('helvetica', 'bold');
        doc.text('Item', 15, yPos);
        doc.text('Description', 45, yPos);
        doc.text('Qty', 110, yPos);
        doc.text('Unit Price', 130, yPos);
        doc.text('Total', 170, yPos);

        doc.setFont('helvetica', 'normal');
        yPos += 5;
        doc.line(15, yPos, 195, yPos);
        yPos += 10;

        // Table content
        this.LignesCommande.forEach((item) => {
            doc.text(`#${item.ligneArtCode}`, 15, yPos);

            // Handle long descriptions with line breaks
            const description = item.ligneArtDesi || '';
            const descriptionLines = splitTextToLines(description, 60);
            doc.text(descriptionLines, 45, yPos);

            // Calculate line height based on description length
            const lineHeight = descriptionLines.length * 5;

            doc.text(item.ligneQte.toString(), 110, yPos);
            doc.text(item.lignePu.toFixed(2) + ' TND', 130, yPos);
            doc.text(item.ligneTtc.toFixed(2) + ' TND', 170, yPos);

            // Move to next item position, accounting for multi-line descriptions
            yPos += Math.max(10, lineHeight);

            // Add new page if necessary
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
        });

        // Add totals
        yPos += 5;
        doc.line(15, yPos, 195, yPos);
        yPos += 10;

        doc.text('Subtotal:', 130, yPos);
        doc.text(`${this.calculateTotal().toFixed(2)} TND`, 170, yPos);
        yPos += 8;

        doc.text('Tax:', 130, yPos);
        doc.text(`${(this.calculateTotalTTC() - this.calculateTotal()).toFixed(2)} TND`, 170, yPos);
        yPos += 8;

        doc.setFont('helvetica', 'bold');
        doc.text('Total:', 130, yPos);
        doc.text(`${this.calculateTotalTTC().toFixed(2)} TND`, 170, yPos);

        // Save the PDF
        doc.save(fileName);

        this.messageService.add({
            severity: 'success',
            summary: 'PDF Exported',
            detail: `Invoice has been exported as PDF`
        });
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
}
