import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar'; // Ajout du module Toolbar
import { InputTextModule } from 'primeng/inputtext'; // Ajout du module InputText
import { TagModule } from 'primeng/tag'; // Ajout du module Tag

import { ToastrService } from 'ngx-toastr';
import { CommandeService } from '../../../core/services/commande.service';
import { DocumentVente } from '../../../models/DocumentVente';
import { DocumentVenteLigne } from '../../../models/DocumentVenteLigne';
import { DocVenteDto } from '../../../models/Dtos/DocVenteDto';
import { DocLigneDto } from '../../../models/Dtos/DocLigneDto';

@Component({
    selector: 'app-edit-order',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        RippleModule,
        TooltipModule,
        CardModule,
        InputNumberModule,
        DialogModule,
        ConfirmDialogModule,
        ToastModule,
        ToolbarModule, // Ajout du module Toolbar dans les imports
        InputTextModule, // Ajout du module InputText
        TagModule // Ajout du module Tag
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './edit-order.component.html',
    styleUrls: ['./edit-order.component.css']
})
export class EditOrderComponent implements OnInit {
    loading: boolean = true;
    docPiece: string = '';
    commande: DocumentVente | null = null;
    lignes: DocumentVenteLigne[] = [];
    modifiedLignes: Map<number, boolean> = new Map(); // Pour suivre les lignes modifiées
    filteredLignes: DocumentVenteLigne[] = []; // Pour stocker les lignes filtrées

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private toast: ToastrService,
        private commandeService: CommandeService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.route.params.subscribe((params) => {
            this.docPiece = params['id'];
            if (this.docPiece) {
                this.loadCommande();
            } else {
                this.toast.error('Identifiant de commande non fourni');
                this.router.navigate(['/store/customer/orders']);
            }
        });
    }

    loadCommande() {
        this.loading = true;

        // Charger les détails de la commande
        this.commandeService.getDocumentVenteByDocPiece(this.docPiece).subscribe({
            next: (response) => {
                this.commande = response;

                // Vérifier si la commande est en attente
                if (this.commande && this.commande.docEtat !== 0) {
                    this.toast.warning('Seules les commandes en attente peuvent être modifiées');
                    this.router.navigate(['/store/customer/orders']);
                    return;
                }

                // Charger les lignes de la commande
                this.loadLignesCommande();
            },
            error: (err) => {
                this.loading = false;
                console.error('Erreur lors du chargement de la commande:', err);
                this.toast.error('Échec du chargement de la commande');
                this.router.navigate(['/store/customer/orders']);
            }
        });
    }

    loadLignesCommande() {
        this.commandeService.getDocumentVenteLignesByDocPiece(this.docPiece).subscribe({
            next: (response) => {
                this.lignes = response;
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
                console.error('Erreur lors du chargement des lignes de commande:', err);
                this.toast.error('Échec du chargement des détails de la commande');
            }
        });
    }

    // Marquer une ligne comme modifiée
    onQuantityChange(ligne: DocumentVenteLigne) {
        this.modifiedLignes.set(ligne.ligneId, true);
        this.updateLineTotals(ligne);
        this.updateOrderTotals(); // Mettre à jour les totaux de la commande après changement
    }

    // Mettre à jour les totaux de la ligne
    updateLineTotals(ligne: DocumentVenteLigne) {
        // Calcul du montant HT de la ligne
        ligne.ligneHt = ligne.ligneQte * ligne.lignePu;

        // Calcul du montant TTC de la ligne
        // Note: La propriété lignTva n'existe pas dans l'interface DocumentVenteLigne
        // Nous devons donc l'ajouter ou utiliser une autre approche
        ligne.ligneTtc = ligne.ligneHt * 1.2; // Supposons une TVA fixe de 20%
    }

    // Mettre à jour les totaux de la commande
    updateOrderTotals() {
        if (!this.commande) return;

        // Réinitialiser les totaux
        this.commande.docTht = 0;
        this.commande.docTtc = 0;

        // Recalculer les totaux à partir des lignes
        for (const ligne of this.lignes) {
            this.commande.docTht += ligne.ligneHt;
            this.commande.docTtc += ligne.ligneTtc;
        }
    }

    // Supprimer une ligne de commande
    supprimerLigne(ligne: DocumentVenteLigne) {
        this.confirmationService.confirm({
            message: 'Voulez-vous vraiment supprimer cet article de la commande ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                if (ligne.ligneId) {
                    // Si la ligne existe déjà en BD
                    this.commandeService.deleteDocumentVenteLigne(ligne.ligneId).subscribe({
                        next: () => {
                            // Retirer la ligne du tableau
                            this.lignes = this.lignes.filter((l) => l.ligneId !== ligne.ligneId);
                            this.filteredLignes = [...this.lignes]; // Mettre à jour les lignes filtrées
                            this.updateOrderTotals();
                            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Article supprimé de la commande' });
                            this.toast.success('Article supprimé de la commande');
                        },
                        error: (err) => {
                            console.error('Erreur lors de la suppression de la ligne:', err);
                            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Échec de la suppression de l'article" });
                            this.toast.error("Échec de la suppression de l'article");
                        }
                    });
                } else {
                    // Si c'est une nouvelle ligne pas encore sauvegardée
                    this.lignes = this.lignes.filter((l) => l !== ligne);
                    this.filteredLignes = [...this.lignes]; // Mettre à jour les lignes filtrées
                    this.updateOrderTotals();
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Article supprimé de la commande' });
                    this.toast.success('Article supprimé de la commande');
                }
            }
        });
    }

    // Enregistrer les modifications de la commande
    saveChanges() {
        if (!this.commande) return;

        // Mettre à jour les totaux avant la sauvegarde
        this.updateOrderTotals();

        // Liste des opérations de mise à jour
        const updateOperations: Promise<any>[] = [];

        // Mettre à jour le document principal
        updateOperations.push(this.commandeService.updateDocumentVente(this.commande).toPromise());

        // Mettre à jour les lignes modifiées
        this.lignes.forEach((ligne) => {
            if (this.modifiedLignes.get(ligne.ligneId)) {
                updateOperations.push(this.commandeService.updateDocumentVenteLigne(ligne).toPromise());
            }
        });

        // Exécuter toutes les opérations
        Promise.all(updateOperations)
            .then(() => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Commande mise à jour avec succès' });
                this.toast.success('Commande mise à jour avec succès');
                this.router.navigate(['/store/customer/orders']);
            })
            .catch((error: Error) => {
                console.error('Erreur lors de la mise à jour de la commande:', error);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la mise à jour de la commande' });
                this.toast.error('Échec de la mise à jour de la commande');
            });
    }

    // Annuler les modifications et retourner à la liste des commandes
    cancelEdit() {
        this.router.navigate(['/store/customer/orders']);
    }
}
