import { Component, OnInit } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../../../core/services/authentication.service';
import { UserService } from '../../../../core/services/client-service.service';
import { FamillesService } from '../../../../core/services/familles.service';
import { ProductsService } from '../../../../core/services/products.service';
import { CommandeService } from '../../../../core/services/commande.service';
import { DocumentVenteLigne } from '../../../../models/DocumentVenteLigne';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, catchError, finalize } from 'rxjs/operators';
import { Product } from '../../../../models/Product';
import { Router } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule],
    template: /*html*/ `
        <div class="card !mb-8">
            <div class="font-semibold text-xl mb-4">Recent Sales</div>
            <p-table [value]="products" [paginator]="true" [rows]="5" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Image</th>
                        <th pSortableColumn="artIntitule">Name <p-sortIcon field="artIntitule"></p-sortIcon></th>
                        <th pSortableColumn="artPrixVente">Price <p-sortIcon field="artPrixVente"></p-sortIcon></th>
                        <th>View</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-product>
                    <tr>
                        <td style="width: 15%; min-width: 5rem;">
                            <img src="http://localhost:91/Images/{{ product.artImageUrl }}" class="shadow-lg" alt="{{ product.artIntitule }}" width="50" (error)="handleProductImageError($event)" />
                        </td>
                        <td style="width: 35%; min-width: 7rem;">{{ product.artIntitule }}</td>
                        <td style="width: 35%; min-width: 8rem;">{{ product.artPrixVente | currency: 'TND' }}</td>
                        <td style="width: 15%;">
                            <button pButton pRipple type="button" icon="pi pi-search" class="p-button p-component p-button-text p-button-icon-only" (click)="viewProductDetails(product)"></button>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="4">No recent sales found.</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class RecentSalesWidget implements OnInit {
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    products: Product[] = [];
    commandes: DocumentVenteLigne[] = [];
    loading: boolean = false;

    constructor(
        private authService: AuthenticationService,
        private clientService: UserService,
        private familleService: FamillesService,
        private produitService: ProductsService,
        private commandeService: CommandeService,
        private route: Router
    ) {}

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.loading = true;

        this.commandeService
            .getTopLignesCommande()
            .pipe(
                switchMap((commandes) => {
                    this.commandes = commandes;
                    const productRequests = commandes.map((c) => {
                        return this.produitService.getProductsByCode(c.ligneArtCode).pipe(
                            catchError(() => of(null)) // in case a product fails to load
                        );
                    });

                    return forkJoin(productRequests);
                }),
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe((products) => {
                // Filter out nulls if any
                this.products = products.filter((p) => p !== null);
            });
    }

    handleProductImageError(event: any): void {
        event.target.src = this.DEFAULT_PRODUCT_IMAGE;
    }

    viewProductDetails(product: Product): void {
        this.route.navigate([`/store/products/${product.artId}`]);
    }
}
