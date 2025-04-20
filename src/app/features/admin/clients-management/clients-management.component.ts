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
                // Create a temporary storage for all clients
                const allClients = data;

                // Track how many clients we've processed
                let processedClients = 0;
                this.clients = [];

                // Process each client
                allClients.forEach((client) => {
                    this.userService.getUserRole(client.tiersId).subscribe({
                        next: (roleData) => {
                            // Only add if not admin
                            if (!roleData.roles.includes('admin')) {
                                // Check if we're on sync route and filter by tiersFlag
                                if (this.isSyncRoute) {
                                    if (client.tiersFlag === 1) {
                                        this.clients.push(client);
                                    }
                                } else if (this.isNonSyncRoute) {
                                    if (client.tiersFlag === 0) {
                                        this.clients.push(client);
                                    }
                                } else {
                                    // Normal route - add all non-admin clients
                                    this.clients.push(client);
                                }
                            }
                        },
                        error: () => {
                            // If error fetching role, assume not admin
                            if (this.isSyncRoute) {
                                if (client.tiersFlag === 0) {
                                    this.clients.push(client);
                                }
                            } else {
                                this.clients.push(client);
                            }
                        },
                        complete: () => {
                            // Count processed clients and finish when all are done
                            processedClients++;
                            if (processedClients === allClients.length) {
                                this.loading = false;
                            }
                        }
                    });
                });
            },
            error: (error) => {
                this.toastr.error('Error loading clients', 'Error');
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
            accept: () => {
                this.deleteClient(client.tiersId);
            }
        });
    }

    deleteClient(id: number) {
        this.userService.deleteUserProfile(id).subscribe({
            next: () => {
                this.toastr.success('Client deleted successfully', 'Success');
                this.loadClients();
                this.getClientsCount();
            },
            error: (error) => {
                this.toastr.error('Error deleting client', 'Error');
                console.error('Error deleting client:', error);
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
        this.toastr.info('Photo upload functionality will be implemented soon', 'Information');
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
            this.toastr.warning('No data to export', 'Warning');
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
            this.toastr.error('Failed to export CSV file', 'Error');
        }
    }
    synchronizeClients() {
        this.toastr.info('Clients will be synchronized soon', 'Information');
    }
}
