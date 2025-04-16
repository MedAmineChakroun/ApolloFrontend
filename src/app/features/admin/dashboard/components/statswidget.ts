import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../../../core/services/authentication.service';
import { FamillesService } from '../../../../core/services/familles.service';
import { ProductsService } from '../../../../core/services/products.service';
import { UserService } from '../../../../core/services/client-service.service';
import { CommandeService } from '../../../../core/services/commande.service';
@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: /*html*/ `<div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Orders</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ nbCommandes }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-blue-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ nbCommandesSinceLastWeek }}</span>
                <span class="text-muted-color">since last week</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Aricles</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ nbArticles }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-bag text-orange-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Total</span>
                <span class="text-muted-color">products we have</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Customers</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ nbClients - 1 }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-cyan-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">number </span>
                <span class="text-muted-color">of All costumers</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Categories</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ nbFamilles }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-list text-purple-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ nbArticles }} </span>
                <span class="text-muted-color">related</span>
            </div>
        </div>`
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
        private CommandeService: CommandeService
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
}
