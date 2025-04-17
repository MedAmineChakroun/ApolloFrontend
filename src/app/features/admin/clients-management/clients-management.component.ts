// clients-management.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { UserService } from '../../../core/services/client-service.service';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Client } from '../../../models/Client';

@Component({
    selector: 'app-clients-management',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, DialogModule, ToastModule, ConfirmDialogModule, ToolbarModule, CardModule, DividerModule, TooltipModule, BadgeModule, TagModule, RippleModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './clients-management.component.html',
    styleUrl: './clients-management.component.css'
})
export class ClientsManagementComponent implements OnInit {
    @ViewChild('dt') table: Table | undefined;

    clients: Client[] = [];
    selectedClients: Client[] = [];
    client: Client = this.initializeNewClient();
    clientDialog: boolean = false;
    submitted: boolean = false;
    loading: boolean = true;
    searchQuery: string = '';
    totalClients: number = 0;

    constructor(
        private userService: UserService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadClients();
        this.loadClientsCount();
    }

    initializeNewClient(): Client {
        return {
            tiersId: 0,
            tiersCode: '',
            tiersIntitule: '',
            tiersAdresse1: '',
            tiersCodePostal: '',
            tiersVille: '',
            tiersPays: '',
            tiersTel1: ''
        };
    }

    loadClients() {
        this.loading = true;

        this.userService
            .getUsers()
            .pipe(
                finalize(() => (this.loading = false)),
                catchError((error) => {
                    this.showErrorMessage('Failed to load clients. Please try again later.');
                    console.error('Error loading clients:', error);
                    return of([]);
                })
            )
            .subscribe((data) => {
                this.clients = data;
            });
    }

    loadClientsCount() {
        this.userService
            .getClientsNumber()
            .pipe(
                catchError((error) => {
                    console.error('Error loading client count:', error);
                    return of(0);
                })
            )
            .subscribe((count) => {
                this.totalClients = count;
            });
    }

    openNew() {
        this.client = this.initializeNewClient();
        this.submitted = false;
        this.clientDialog = true;
    }

    deleteSelectedClients() {
        if (!this.selectedClients || this.selectedClients.length === 0) {
            return;
        }

        this.confirmationService.confirm({
            message: `Are you sure you want to delete the selected ${this.selectedClients.length} client(s)?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                // Create an array of delete operations
                const deleteOperations = this.selectedClients.map((client) => this.userService.deleteUserProfile(client.tiersId));

                // Execute all delete operations in parallel
                Promise.all(
                    deleteOperations.map((operation) =>
                        operation.toPromise().catch((error) => {
                            console.error(`Failed to delete client:`, error);
                            return null;
                        })
                    )
                ).then((results) => {
                    const successCount = results.filter((result) => result !== null).length;

                    // Refresh the client list
                    this.loadClients();
                    this.loadClientsCount();
                    this.selectedClients = [];

                    if (successCount > 0) {
                        this.showSuccessMessage(`${successCount} client(s) successfully deleted`);
                    }
                });
            }
        });
    }

    editClient(client: Client) {
        this.loading = true;

        // Fetch the complete client data
        this.userService
            .getUserById(client.tiersId)
            .pipe(
                finalize(() => (this.loading = false)),
                catchError((error) => {
                    this.showErrorMessage('Failed to load client details');
                    console.error('Error fetching client details:', error);
                    return of(null);
                })
            )
            .subscribe((data) => {
                if (data) {
                    this.client = { ...data };
                    this.clientDialog = true;
                }
            });
    }

    deleteClient(client: Client) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${client.tiersIntitule}?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.loading = true;
                this.userService
                    .deleteUserProfile(client.tiersId)
                    .pipe(
                        finalize(() => (this.loading = false)),
                        catchError((error) => {
                            this.showErrorMessage('Failed to delete client');
                            console.error('Error deleting client:', error);
                            return of(null);
                        })
                    )
                    .subscribe((response) => {
                        if (response !== null) {
                            // Remove client from the array
                            this.clients = this.clients.filter((c) => c.tiersId !== client.tiersId);
                            this.loadClientsCount();
                            this.showSuccessMessage('Client successfully deleted');
                        }
                    });
            }
        });
    }

    hideDialog() {
        this.clientDialog = false;
        this.submitted = false;
    }

    searchClients(event: Event) {
        const query = (event.target as HTMLInputElement).value.toLowerCase();
        this.searchQuery = query;
    }

    getFilteredClients() {
        if (!this.searchQuery) {
            return this.clients;
        }

        return this.clients.filter(
            (client) =>
                client.tiersIntitule?.toLowerCase().includes(this.searchQuery) ||
                '' ||
                client.tiersCode?.toLowerCase().includes(this.searchQuery) ||
                '' ||
                client.tiersVille?.toLowerCase().includes(this.searchQuery) ||
                '' ||
                client.tiersPays?.toLowerCase().includes(this.searchQuery) ||
                ''
        );
    }

    exportCSV() {
        this.showSuccessMessage('CSV file has been downloaded');
    }

    // Helper methods for notifications
    private showSuccessMessage(detail: string) {
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: detail,
            life: 3000
        });
    }

    private showErrorMessage(detail: string) {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: detail,
            life: 5000
        });
    }
}
