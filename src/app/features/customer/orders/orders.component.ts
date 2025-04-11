import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DocumentVente } from '../../../models/DocumentVente';
import { DocumentVenteLigne } from '../../../models/DocumentVenteLigne';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, CardModule, TagModule, TooltipModule],
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.css']
})
export class OrdersComponent {
    orders: DocumentVente[] = [
        {
            docId: 1,
            docType: 1,
            docPiece: 'CMD-2024-001',
            docDate: new Date('2024-03-15'),
            docTht: 1500,
            docTtc: 1800,
            docTiersCode: 'CUST001',
            docTiersIntitule: 'John Doe'
        },
        {
            docId: 2,
            docType: 1,
            docPiece: 'CMD-2024-002',
            docDate: new Date('2024-03-20'),
            docTht: 2500,
            docTtc: 3000,
            docTiersCode: 'CUST001',
            docTiersIntitule: 'John Doe'
        }
    ];

    orderDetails: { [key: number]: DocumentVenteLigne[] } = {
        1: [
            {
                ligneId: 1,
                ligneDocPiece: 'CMD-2024-001',
                ligneArtCode: 'PRD001',
                ligneArtDesi: 'Product 1',
                ligneQte: 2,
                lignePu: 500,
                ligneHt: 1000,
                ligneTtc: 1200
            },
            {
                ligneId: 2,
                ligneDocPiece: 'CMD-2024-001',
                ligneArtCode: 'PRD002',
                ligneArtDesi: 'Product 2',
                ligneQte: 1,
                lignePu: 500,
                ligneHt: 500,
                ligneTtc: 600
            }
        ],
        2: [
            {
                ligneId: 3,
                ligneDocPiece: 'CMD-2024-002',
                ligneArtCode: 'PRD003',
                ligneArtDesi: 'Product 3',
                ligneQte: 3,
                lignePu: 500,
                ligneHt: 1500,
                ligneTtc: 1800
            },
            {
                ligneId: 4,
                ligneDocPiece: 'CMD-2024-002',
                ligneArtCode: 'PRD004',
                ligneArtDesi: 'Product 4',
                ligneQte: 2,
                lignePu: 500,
                ligneHt: 1000,
                ligneTtc: 1200
            }
        ]
    };

    // Array to hold expanded docIds
    expandedRows: { [key: string]: boolean } = {};

    toggleRow(docId: number): void {
        const key = docId.toString();
        this.expandedRows[key] = !this.expandedRows[key];
        // Trigger change detection by cloning the object
        this.expandedRows = { ...this.expandedRows };
    }

    isRowExpanded(docId: number): boolean {
        return !!this.expandedRows[docId.toString()];
    }

    getSeverity(status: number) {
        switch (status) {
            case 1:
                return 'success';
            case 2:
                return 'warn';
            case 3:
                return 'danger';
            default:
                return 'info';
        }
    }

    getStatusLabel(status: number) {
        switch (status) {
            case 1:
                return 'Completed';
            case 2:
                return 'Processing';
            case 3:
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    }
}
