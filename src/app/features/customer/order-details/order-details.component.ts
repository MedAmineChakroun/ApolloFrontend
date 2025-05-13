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
import { MessageModule } from 'primeng/message';
//forpdf exportation
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import { autoTable } from 'jspdf-autotable';
@Component({
    selector: 'app-order-details',
    templateUrl: './order-details.component.html',
    styleUrls: ['./order-details.component.css'],
    providers: [MessageService],
    imports: [CommonModule, MessageModule, RouterModule, CardModule, ButtonModule, TableModule, ToastModule, TagModule, DividerModule, SkeletonModule, Divider]
})
export class OrderDetailsComponent implements OnInit {
    orderDocPiece: string | null = null;
    CommandeEntete: DocumentVente | null = null;
    LignesCommande: DocumentVenteLigne[] = [];
    clientData: Client | null = null;
    loading: boolean = true;

    // Company colors
    primaryColor = '#02c39a'; // Apollo blue
    secondaryColor = '#f8f9fa'; // Light gray
    accentColor = '#ff5400';   // Orange accent

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
        // Store the original contents
        const originalContents = document.body.innerHTML;
        
        // Get only the content we want to print
        const printContent = document.getElementById('pdfContent');
        
        if (printContent) {
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            
            if (printWindow) {
                // Set up the print window with just our content
                printWindow.document.write(`
                    <html>
                    <head>
                        <title>Invoice #${this.orderDocPiece}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                            .invoice-number { font-size: 24px; font-weight: bold; color: #333; }
                            .status { padding: 5px 10px; border-radius: 4px; font-weight: bold; }
                            .status-accepted { background-color: #e6f7e6; color: #2e7d32; }
                            .status-rejected { background-color: #ffebee; color: #c62828; }
                            .status-pending { background-color: #e3f2fd; color: #1565c0; }
                            .billing-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                            .bill-to, .company-info { width: 48%; }
                            .section-title { color: #FF5400; font-weight: bold; margin-bottom: 5px; font-size: 18px; }
                            .details { margin-bottom: 20px; }
                            .detail-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                            .label { color: #666; }
                            .value { font-weight: bold; text-align: right; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                            th { background-color: #02c39a; color: white; text-align: left; padding: 10px; }
                            td { padding: 10px; border-bottom: 1px solid #eee; }
                            .text-right { text-align: right; }
                            .text-center { text-align: center; }
                            .totals { margin-left: auto; width: 40%; }
                            .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
                            .final-total { font-weight: bold; font-size: 18px; color: #02c39a; border-top: 2px solid #eee; padding-top: 10px; }
                            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div class="invoice-number">Document #${this.orderDocPiece}</div>
                            ${this.renderStatusBox()}
                        </div>
                        
                        <div class="billing-info">
                            <div class="bill-to">
                                <div class="section-title">Bill To:</div>
                                <div>${this.clientData?.tiersIntitule || ''}</div>
                                <div>${this.clientData?.tiersAdresse1 || ''}</div>
                                <div>${this.clientData?.tiersCodePostal || ''}, ${this.clientData?.tiersVille || ''}</div>
                                <div>${this.clientData?.tiersPays || ''}</div>
                                <div>${this.clientData?.tiersTel1 || ''}</div>
                                <div>${this.clientData?.tiersEmail || ''}</div>
                            </div>
                            
                            <div class="company-info">
                                <div class="section-title text-right">Apollo Store</div>
                                <div class="text-right">123 Business Street</div>
                                <div class="text-right">Business City, 12345</div>
                                <div class="text-right">contactyourcompany.com</div>
                                <div class="text-right">+1 234 567 890</div>
                            </div>
                        </div>
                        
                        <div class="details">
                            <div class="detail-row">
                                <span class="label">Invoice #:</span>
                                <span class="value">#${this.CommandeEntete?.docPiece || ''}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Date:</span>
                                <span class="value">${this.formatDate(this.CommandeEntete?.docDate || new Date())}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Client Code:</span>
                                <span class="value">#${this.CommandeEntete?.docTiersCode || ''}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Status:</span>
                                <span class="value">${this.getStatus(this.CommandeEntete?.docEtat || 0).label}</span>
                            </div>
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Item Code</th>
                                    <th>Description</th>
                                    <th class="text-center">Quantity</th>
                                    <th class="text-right">Unit Price</th>
                                    <th class="text-right">Total HT</th>
                                    <th class="text-right">Total TTC</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderTableRows()}
                            </tbody>
                        </table>
                        
                        <div class="totals">
                            <div class="total-row">
                                <span>Subtotal:</span>
                                <span>${this.calculateTotal().toFixed(2)} TND</span>
                            </div>
                            <div class="total-row">
                                <span>Tax:</span>
                                <span>${(this.calculateTotalTTC() - this.calculateTotal()).toFixed(2)} TND</span>
                            </div>
                            <div class="total-row final-total">
                                <span>Total:</span>
                                <span>${this.calculateTotalTTC().toFixed(2)} TND</span>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>Thank you for choosing Apollo Store! We appreciate your business.</p>
                            <p>Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                        </div>
                    </body>
                    </html>
                `);
                
                // Focus on the new window and print it
                printWindow.document.close();
                printWindow.focus();
                
                // Print after a slight delay to ensure content is loaded
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 250);
                
                this.messageService.add({ severity: 'info', summary: 'Print', detail: 'Print dialog opened' });
            } else {
                // Fallback to old method if window.open fails (rarely happens due to popup blockers)
                this.messageService.add({ severity: 'warn', summary: 'Print', detail: 'Unable to open print window. Please check your popup blocker settings.' });
            }
        }
    }
    
    // Helper method to render status box with appropriate color
    private renderStatusBox(): string {
        const status = this.getStatus(this.CommandeEntete?.docEtat || 0);
        let statusClass = '';
        
        switch (status.severity) {
            case 'success':
                statusClass = 'status-accepted';
                break;
            case 'danger':
                statusClass = 'status-rejected';
                break;
            default:
                statusClass = 'status-pending';
                break;
        }
        
        return `<div class="status ${statusClass}">${status.label}</div>`;
    }
    
    // Helper method to render table rows
    private renderTableRows(): string {
        return this.LignesCommande.map(item => `
            <tr>
                <td>#${item.ligneArtCode}</td>
                <td>${item.ligneArtDesi || ''}</td>
                <td class="text-center">${item.ligneQte}</td>
                <td class="text-right">${item.lignePu.toFixed(2)} TND</td>
                <td class="text-right">${item.ligneHt.toFixed(2)} TND</td>
                <td class="text-right">${item.ligneTtc.toFixed(2)} TND</td>
            </tr>
        `).join('');
    }
    
    goBack() {
        this.router.navigate(['/store/customer/orders']);
    }
    
    exportPdf() {
        // Create new document with A4 dimensions
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const fileName = `Invoice-${this.orderDocPiece}-${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15;

        // Add header with company colors
        doc.setFillColor(this.primaryColor);
        doc.rect(0, 0, pageWidth, 35, 'F');
        
        // Add company logo/name
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('APOLLO STORE', pageWidth / 2, 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text('Professional Invoice', pageWidth / 2, 25, { align: 'center' });
        
        // Add invoice number with accent bar
        doc.setFillColor(this.accentColor);
        doc.rect(margin, 45, pageWidth - (margin * 2), 10, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text(`INVOICE #${this.orderDocPiece}`, pageWidth / 2, 52, { align: 'center' });
        
        // Reset text color for rest of the document
        doc.setTextColor(0, 0, 0);
        
        // Customer and company information section
        const sectionY = 70;
        
        // Left side: Customer Information
        doc.setFillColor(this.secondaryColor);
        doc.rect(margin, sectionY, 80, 40, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(this.primaryColor);
        doc.text('BILL TO:', margin + 5, sectionY + 8);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        
        // Handle long customer name with line breaks
        const customerName = this.clientData?.tiersIntitule || 'Customer Name';
        const nameLines = doc.splitTextToSize(customerName, 70);
        doc.text(nameLines, margin + 5, sectionY + 16);
        
        // Calculate new Y position based on number of lines in customer name
        let infoY = sectionY + 16 + (nameLines.length * 5);
        
        doc.text(`${this.clientData?.tiersAdresse1 || 'Address Line 1'}`, margin + 5, infoY);
        infoY += 5;
        doc.text(`${this.clientData?.tiersCodePostal || 'Postal Code'}, ${this.clientData?.tiersVille || 'City'}`, margin + 5, infoY);
        
        // Right side: Company Information
        doc.setFillColor(this.secondaryColor);
        doc.rect(pageWidth - margin - 80, sectionY, 80, 40, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(this.primaryColor);
        doc.text('FROM:', pageWidth - margin - 75, sectionY + 8);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text('Apollo Store Inc.', pageWidth - margin - 75, sectionY + 16);
        doc.text('123 Business Street', pageWidth - margin - 75, sectionY + 21);
        doc.text('Business City, 12345', pageWidth - margin - 75, sectionY + 26);
        doc.text('contact@apollostore.com', pageWidth - margin - 75, sectionY + 31);
        doc.text('+216 123 456 789', pageWidth - margin - 75, sectionY + 36);
        
        // Invoice details
        const detailsY = sectionY + 50;
        
        doc.setFillColor(this.secondaryColor);
        doc.rect(margin, detailsY, (pageWidth - (margin * 2)) / 2 - 5, 25, 'F');
        doc.rect(pageWidth / 2, detailsY, (pageWidth - (margin * 2)) / 2, 25, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(this.primaryColor);
        doc.text('DATE ISSUED:', margin + 5, detailsY + 8);
        doc.text('STATUS:', pageWidth / 2 + 5, detailsY + 8);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`${this.formatDate(this.CommandeEntete?.docDate || new Date())}`, margin + 5, detailsY + 16);
        
        // Format status with color
        const status = this.getStatus(this.CommandeEntete?.docEtat || 0);
        doc.setTextColor(status.severity === 'success' ? 0 : (status.severity === 'danger' ? 255 : 0), 
                        status.severity === 'success' ? 128 : (status.severity === 'danger' ? 0 : 0), 
                        status.severity === 'success' ? 0 : (status.severity === 'danger' ? 0 : 0));
        doc.text(status.label, pageWidth / 2 + 5, detailsY + 16);
        doc.setTextColor(0, 0, 0);
        
        // Items table
        const tableY = detailsY + 35;
        
        const tableColumns = [
            { header: 'ITEM', dataKey: 'code' },
            { header: 'DESCRIPTION', dataKey: 'description' },
            { header: 'QTY', dataKey: 'qty' },
            { header: 'UNIT PRICE', dataKey: 'price' },
            { header: 'TOTAL', dataKey: 'total' }
        ];
        
        const tableData = this.LignesCommande.map(item => ({
            code: `#${item.ligneArtCode}`,
            description: item.ligneArtDesi || '',
            qty: item.ligneQte.toString(),
            price: `${item.lignePu.toFixed(2)} TND`,
            total: `${item.ligneTtc.toFixed(2)} TND`
        }));
        
        autoTable(doc, {
            startY: tableY,
            head: [tableColumns.map(col => col.header)],
            body: tableData.map(row => tableColumns.map(col => row[col.dataKey as keyof typeof row])),
            margin: { top: margin, right: margin, bottom: margin, left: margin },
            headStyles: {
                fillColor: this.primaryColor,
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: this.secondaryColor
            },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 20, halign: 'center' },
                3: { cellWidth: 35, halign: 'right' },
                4: { cellWidth: 35, halign: 'right' }
            },
        });
        
        // Get the last Y position after the table
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        
        // Total section
        doc.setFillColor(this.secondaryColor);
        doc.rect(pageWidth - margin - 80, finalY, 80, 35, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(this.primaryColor);
        
        let totalY = finalY + 10;
        doc.text('SUBTOTAL:', pageWidth - margin - 75, totalY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`${this.calculateTotal().toFixed(2)} TND`, pageWidth - margin - 15, totalY, { align: 'right' });
        
        totalY += 8;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(this.primaryColor);
        doc.text('TAX:', pageWidth - margin - 75, totalY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`${(this.calculateTotalTTC() - this.calculateTotal()).toFixed(2)} TND`, pageWidth - margin - 15, totalY, { align: 'right' });
        
        totalY += 8;
        doc.setFillColor(this.accentColor);
        doc.rect(pageWidth - margin - 80, totalY - 5, 80, 10, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('TOTAL:', pageWidth - margin - 75, totalY);
        doc.text(`${this.calculateTotalTTC().toFixed(2)} TND`, pageWidth - margin - 15, totalY, { align: 'right' });
        
        // Footer
        const footerY = pageHeight - 15;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Thank you for your business! For any questions regarding this invoice, please contact us.', pageWidth / 2, footerY, { align: 'center' });
        doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 5, { align: 'center' });
        
        // Save the PDF
        doc.save(fileName);
        
        this.messageService.add({
            severity: 'info',
            summary: 'PDF Exported',
            detail: `Professional invoice has been exported as PDF`
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
