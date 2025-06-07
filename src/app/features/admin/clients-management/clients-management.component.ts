import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG imports
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { UserService } from '../../../core/services/client-service.service';
import { Client } from '../../../models/Client';
import { catchError, forkJoin, map, of } from 'rxjs';
import { SynchronisationService } from '../../../core/services/synchronisation.service';
import { CommandeService } from '../../../core/services/commande.service';
@Component({
    selector: 'app-clients-management',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, ToolbarModule, ConfirmDialogModule, DialogModule, TooltipModule, InputTextModule, CardModule, TagModule, ReactiveFormsModule],
    providers: [ConfirmationService],
    templateUrl: './clients-management.component.html',
    styleUrl: './clients-management.component.css'
})
export class ClientsManagementComponent implements OnInit {
    clients: Client[] = [];
    loading = false;
    totalClients = 1;
    selectedClient: Client | null = null;
    dialogVisible = false;
    editMode = false;
    clientForm!: FormGroup;
    clientImage: string | null = null;
    isSyncRoute = false;
    isNonSyncRoute = false;
    @ViewChild('dt') table!: Table;

    // Services injection
    private userService = inject(UserService);
    private confirmationService = inject(ConfirmationService);
    private toastr = inject(ToastrService);
    private router = inject(Router);
    private fb = inject(FormBuilder);
    private synchronisationService = inject(SynchronisationService);
    private CommandeService = inject(CommandeService);

    ngOnInit() {
        // Check if current route is the sync route
        this.isSyncRoute = this.router.url === '/store/admin/clients/sync';
        this.isNonSyncRoute = this.router.url === '/store/admin/synchronize/clients';
        this.loadClients();
        this.getClientsCount();
        this.initForm();
    }

    initForm() {
        this.clientForm = this.fb.group({
            tiersId: [null],
            tiersCode: ['', Validators.required],
            tiersIntitule: ['', Validators.required],
            tiersAdresse1: [''],
            tiersCodePostal: [''],
            tiersVille: [''],
            tiersPays: [''],
            tiersTel1: [''],
            tiersEmail: ['', [Validators.email]],
            tiersFlag: [0]
        });
    }

    loadClients() {
        this.loading = true;
        this.userService.getUsers().subscribe({
            next: (data) => {
                const allClients = data;

                // Create an array of observables for role checking
                const roleCheckObservables = allClients.map((client) =>
                    this.userService.getUserRole(client.tiersId).pipe(
                        map((roleData) => ({ client, roleData })),
                        catchError(() => of({ client, roleData: { roles: [] } })) // Handle errors by assuming no admin role
                    )
                );

                // Execute all role checks in parallel but maintain order
                forkJoin(roleCheckObservables).subscribe({
                    next: (results) => {
                        this.clients = [];

                        results.forEach(({ client, roleData }) => {
                            // Only add if not admin
                            if (!roleData.roles.includes('admin')) {
                                // Apply route-specific filtering
                                if (this.isSyncRoute && client.tiersFlag === 1) {
                                    this.clients.push(client);
                                } else if (this.isNonSyncRoute && client.tiersFlag === 0) {
                                    this.clients.push(client);
                                } else if (!this.isSyncRoute && !this.isNonSyncRoute) {
                                    this.clients.push(client);
                                }
                            }
                        });

                        this.loading = false;
                    },
                    error: (error) => {
                        this.toastr.error('Erreur lors du chargement des clients', 'Erreur');
                        console.error('Error loading clients:', error);
                        this.loading = false;
                    }
                });
            },
            error: (error) => {
                this.toastr.error('Erreur lors du chargement des clients', 'Erreur');
                console.error('Error loading clients:', error);
                this.loading = false;
            }
        });
    }

    getClientsCount() {
        this.userService.getClientsNumber().subscribe({
            next: (count) => {
                this.totalClients = count;
            },
            error: (error) => {
                console.error('Error getting client count:', error);
            }
        });
    }

    confirmDelete(client: Client) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${client.tiersIntitule}?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            //red reject button
            rejectButtonStyleClass: 'p-button-danger',
            accept: async () => {
                const hasRelations = await this.checkRelations(client.tiersCode);
                if (hasRelations) {
                    this.toastr.warning('Suppression refusée : ce client est relié à une ou plusieurs commandes');
                    return;
                }

                this.deleteClientFromSage(client);
                this.deleteClient(client.tiersId);

                this.toastr.success('Client supprimé avec succès.', 'Succès', {
                    positionClass: 'toast-top-right',
                    timeOut: 3000,
                    closeButton: true,
                    progressBar: true
                });
            }
        });
    }
    deleteClientFromSage(client: Client) {
        this.synchronisationService.deleteClient(client.tiersCode).subscribe({
            next: (response) => {
                console.log('Client deleted from Sage:', response);
            },
            error: (error) => {
                console.error('un erreur est survenue lors de la suppression du client dans Sage');
            }
        });
    }
    deleteClient(id: number) {
        this.userService.deleteUserProfile(id).subscribe({
            next: () => {
                this.getClientsCount();
                setTimeout(() => {
                    this.loadClients();
                }, 300);
            },
            error: (error) => {
                console.error('un erreur est survenue lors de la suppression du client en local', error);
            }
        });
    }

    viewClientDetails(client: Client) {
        this.router.navigate([`/store/admin/users/${client.tiersCode}`]);
    }

    closeDialog() {
        this.dialogVisible = false;
        this.selectedClient = null;
        this.editMode = false;
    }

    resetForm() {
        if (this.clientForm) {
            this.clientForm.reset();
        }
    }

    onChangePhoto() {
        // Placeholder for photo upload functionality
        // This would typically open a file picker and handle the upload
        this.toastr.info('La fonctionnalité de téléchargement de photo sera bientôt implémentée', 'Information');
    }

    // Helper methods for flag status
    getSyncStatusLabel(flag: number): string {
        return flag === 1 ? 'Synchronisé' : 'Non Synchronisé';
    }

    getSyncStatusSeverity(flag: number): 'success' | 'danger' | 'info' | 'warn' | 'secondary' | 'contrast' {
        return flag === 1 ? 'success' : 'danger';
    }

    getSyncStatusIcon(flag: number): string {
        return flag === 1 ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle';
    }
    //exprot csv
    exportToCSV() {
        if (this.clients.length === 0) {
            this.toastr.warning('Aucune donnée à exporter', 'Attention');
            return;
        }

        try {
            // Define CSV headers based on client properties
            const headers = ['Client ID', 'Code', 'Name', 'Address', 'Postal Code', 'City', 'Country', 'Phone', 'Email', 'Sync Status'];

            // Map clients data to CSV rows
            const csvData = this.clients.map((client) => [
                client.tiersId,
                client.tiersCode,
                client.tiersIntitule,
                client.tiersAdresse1 || '',
                client.tiersCodePostal || '',
                client.tiersVille || '',
                client.tiersPays || '',
                client.tiersTel1 || '',
                client.tiersEmail || '',
                client.tiersFlag === 1 ? 'Synchronized' : 'Not Synchronized'
            ]);

            // Add headers as the first row
            csvData.unshift(headers);

            // Convert to CSV format
            const csvContent = csvData
                .map((row) =>
                    row
                        .map((cell) =>
                            // Handle cells that might contain commas or quotes
                            typeof cell === 'string' && (cell.includes(',') || cell.includes('"')) ? `"${cell.replace(/"/g, '""')}"` : cell
                        )
                        .join(',')
                )
                .join('\n');

            // Create CSV file and trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');

            // Create file name with current date
            const date = new Date();
            const fileName = `clients_export_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}.csv`;

            // Handle browser compatibility without TypeScript errors
            if (window.navigator && 'msSaveBlob' in window.navigator) {
                // For IE and Edge
                (window.navigator as any).msSaveBlob(blob, fileName);
            } else {
                // For other browsers
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error exporting CSV:', error);
            this.toastr.error('Échec de l\'exportation du fichier CSV', 'Erreur');
        }
    }

    selectedClients: any[] = [];
    selectAll: boolean = false;

    // Handle bulk synchronization of selected clients
    synchronizeSelectedClients() {
        if (this.selectedClients.length === 0) {
            this.toastr.warning('Veuillez sélectionner au moins un produit à synchroniser.', 'Attention');
            return;
        }

        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir synchroniser ${this.selectedClients.length} produit(s) sélectionné(s)?`,
            header: 'Confirmation de synchronisation',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            rejectButtonStyleClass: 'p-button-danger',
            accept: () => {
                const count = this.selectedClients.length;
                const syncCalls = this.selectedClients.map((client) => this.synchronisationService.syncClient(client.tiersCode));

                forkJoin(syncCalls).subscribe({
                    next: () => {
                        this.selectedClients = [];
                        this.loadClients(); // Now this is called AFTER syncs finish
                        this.toastr.success(`${count} client(s) synchronisé(s) avec succès!`, 'Succès', {
                            positionClass: 'toast-top-right',
                            timeOut: 3000,
                            closeButton: true,
                            progressBar: true
                        });
                    },
                    error: () => {
                        this.toastr.error('Erreur lors de la synchronisation des clients.', 'Erreur');
                    }
                });
            }
        });
    }

    clearSelection() {
        this.selectedClients = [];
    }

    isClientSelected(client: Client): boolean {
        return this.selectedClients.some((c) => c.tiersCode === client.tiersCode);
    }

    getSelectedCount(): number {
        return this.selectedClients.length;
    }

    selectAllVisible() {
        if (this.table && this.isNonSyncRoute) {
            const visibleClients = this.table.filteredValue || this.clients;
            this.selectedClients = [...visibleClients];
        }
    }

    toggleSelectAll() {
        if (this.selectedClients.length === this.clients.length) {
            this.selectedClients = [];
        } else {
            this.selectedClients = [...this.clients];
        }
    }
    async checkRelations(tiersCode: string): Promise<boolean> {
        try {
            const result = await this.CommandeService.hasOrders(tiersCode).toPromise();
            return result ?? false;
        } catch (error) {
            this.toastr.error('Erreur lors de la vérification des relations', 'Erreur');
            return true; // Return true to prevent deletion on error
        }
    }
}
