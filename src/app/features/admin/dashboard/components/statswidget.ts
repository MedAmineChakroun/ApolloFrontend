import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../../core/services/authentication.service';
import { FamillesService } from '../../../../core/services/familles.service';
import { ProductsService } from '../../../../core/services/products.service';
import { UserService } from '../../../../core/services/client-service.service';
import { CommandeService } from '../../../../core/services/commande.service';
import { ToastrService } from 'ngx-toastr';
@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: /*html*/ `
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div
                class="card mb-0 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] transform hover:bg-surface-50 dark:hover:bg-surface-800/50"
                (click)="navigateToCommandes()"
                role="button"
                tabindex="0"
                (keydown.enter)="navigateToCommandes()"
                (keydown.space)="navigateToCommandes()"
            >
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Commandes</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ nbCommandes }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border transition-colors duration-300 hover:bg-blue-200 dark:hover:bg-blue-400/20" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-blue-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-success font-medium">{{ nbCommandesSinceLastWeek }}</span>
                <span class="text-muted-color">depuis la semaine dernière</span>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div
                class="card mb-0 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] transform hover:bg-surface-50 dark:hover:bg-surface-800/50"
                (click)="navigateToArticles()"
                role="button"
                tabindex="0"
                (keydown.enter)="navigateToArticles()"
                (keydown.space)="navigateToArticles()"
            >
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Articles</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ nbArticles }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border transition-colors duration-300 hover:bg-orange-200 dark:hover:bg-orange-400/20" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-bag text-orange-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-success font-medium">Total</span>
                <span class="text-muted-color">produits disponibles</span>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div
                class="card mb-0 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] transform hover:bg-surface-50 dark:hover:bg-surface-800/50"
                (click)="navigateToClients()"
                role="button"
                tabindex="0"
                (keydown.enter)="navigateToClients()"
                (keydown.space)="navigateToClients()"
            >
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Clients</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ nbClients - 1 }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border transition-colors duration-300 hover:bg-cyan-200 dark:hover:bg-cyan-400/20" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-cyan-500 !text-xl"></i>
                    </div>
                </div>
                <span class="prime-text">nombre</span>
                <span class="text-muted-color">de tous les clients</span>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div
                class="card mb-0 cursor-pointer transition-all duration-100 hover:shadow-sm hover:scale-[1.02] transform hover:bg-surface-25 dark:hover:bg-surface-900/30"
                (click)="navigateToCategories()"
                role="button"
                tabindex="0"
                (keydown.enter)="navigateToCategories()"
                (keydown.space)="navigateToCategories()"
            >
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Catégories</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ nbFamilles }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border transition-colors duration-300 hover:bg-purple-200 dark:hover:bg-purple-400/20" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-list text-purple-500 !text-xl"></i>
                    </div>
                </div>
                <span class="prime-text">{{ nbArticles }}</span>
                <span class="text-muted-color">articles associés</span>
            </div>
        </div>
    `
})
export class StatsWidget {
    nbCommandes = 0;
    nbArticles = 0;
    nbClients = 1;
    nbFamilles = 0;
    nbCommandesSinceLastWeek = 0;

    constructor(
        private authService: AuthenticationService,
        private clientService: UserService,
        private familleService: FamillesService,
        private produitService: ProductsService,
        private CommandeService: CommandeService,
        private router: Router,
        private toastr: ToastrService
    ) {}

    ngOnInit() {
        this.loadStats();
    }

    loadStats() {
        this.CommandeService.getNbDocumentVente().subscribe((data) => {
            this.nbCommandes = data;
        });
        this.clientService.getClientsNumber().subscribe((data) => {
            this.nbClients = data;
        });
        this.produitService.getProductsNumber().subscribe((data) => {
            this.nbArticles = data;
        });
        this.familleService.getFamillesNumber().subscribe((data) => {
            this.nbFamilles = data;
        });
        this.CommandeService.getNbDocumentVenteThisWeek().subscribe((data) => {
            this.nbCommandesSinceLastWeek = data;
        });
    }

    // Navigation methods - you can define the routes later
    navigateToCommandes(): void {
        // TODO: Define route for commandes
        // this.router.navigate(['/commandes']);
        this.router.navigate([`/store/admin/orders`]);
    }

    navigateToArticles(): void {
        // TODO: Define route for articles
        // this.router.navigate(['/articles']);
        this.router.navigate([`/store/admin/products`]);
    }

    navigateToClients(): void {
        // TODO: Define route for clients
        // this.router.navigate(['/clients']);
        this.router.navigate([`/store/admin/clients`]);
    }

    navigateToCategories(): void {
        this.toastr.info("Désolé, mais la gestion des catégories n'est pas encore implémentée.", 'Information', {
            timeOut: 3000,
            closeButton: true,
            progressBar: true
        });
    }
}
