import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { CartState } from '../../../store/cart/cart.reducers';
import { selectCartItems, selectCartItemCount, selectCartTotal } from '../../../store/cart/cart.selectors';
import { Observable, of } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import * as CartActions from '../../../store/cart/cart.actions';
import { CartItem } from '../../../models/cart-item';
import { CartService } from '../../../core/services/cart.service';
import { CommandeService } from '../../../core/services/commande.service';
import { DocVenteDto } from '../../../models/Dtos/DocVenteDto';
import { Router } from '@angular/router';
import { selectUser } from '../../../store/user/user.selectors';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { DocLigneDto } from '../../../models/Dtos/DocLigneDto';
import { StepperModule } from 'primeng/stepper';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../models/Product';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { TooltipModule } from 'primeng/tooltip';
import posthog from 'posthog-js';

@Component({
    selector: 'app-shopping-cart',
    standalone: true,
    imports: [TooltipModule, CommonModule, ButtonModule, StepperModule, DialogModule, FormsModule, CheckboxModule, CardModule, CarouselModule],
    providers: [],
    templateUrl: './shopping-cart.component.html',
    styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit {
    cartItems$: Observable<CartItem[]>;
    cartItemCount$: Observable<number>;
    cartTotal$: Observable<number>;
    FREE_SHIPPING_THRESHOLD = 500;
    currentTotal = 0;
    totalTht = 0;
    TiersCode: string | null = null;
    TiersIntitule: string | null = null;
    TiersAdresse1: string | null = null;
    TiersCodePostal: string | null = null;
    TiersVille: string | null = null;
    TiersPays: string | null = null;
    TiersTel1: string | null = null;
    TiersEmail: string | null = null;
    TiersDateCreate: Date | null = null;
    docVentePiece: string | null = null;
    currentStep = 1;
    display = false;
    confirmationDisplay = false;
    accepted = false;
    isProcessing = false;
    recommendedProducts: Product[] = [];
    isLoadingRecommendations = false;

    //to not double fetching and web traicking
    private lastRecommendedItemIds: string[] = [];
    private trackedRecommendationIds = new Set<string>(); // ✅ track what's already sent

    responsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 3,
            numScroll: 1
        },
        {
            breakpoint: '768px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '560px',
            numVisible: 1,
            numScroll: 1
        }
    ];

    constructor(
        private toastr: ToastrService,
        private store: Store<{ cart: CartState }>,
        private cartService: CartService,
        private commandeService: CommandeService,
        private router: Router,
        private authService: AuthenticationService,
        private productsService: ProductsService
    ) {
        this.cartItems$ = this.store.select(selectCartItems);
        this.cartItemCount$ = this.store.select(selectCartItemCount);
        this.cartTotal$ = this.store.select(selectCartTotal);

        // Subscribe to keep track of current total
        this.cartTotal$.subscribe((total) => {
            this.currentTotal = total;
        });

        // Subscribe to keep track of total HT
        this.cartItems$.pipe(map((items) => items.reduce((total, item) => total + item.product.artPrixVente * item.quantity, 0))).subscribe((total) => {
            this.totalTht = total;
        });
    }
    set() {
        if (this.accepted) this.currentStep = 2;
        else this.currentStep = 3;
    }
    open() {
        this.currentStep = 2;
        this.display = true;
    }

    close() {
        this.display = false;
        this.currentStep = 1;
    }
    ngOnInit(): void {
        if (this.authService.isAuthenticated()) {
            this.getClientFromStore();
        }

        // Fetch recommendations only once when component initializes
        this.cartItems$.pipe(take(1)).subscribe((items) => {
            if (items.length > 0) {
                this.getRecommendedProducts(items);
            }
        });
    }

    isAuthenticated(): boolean {
        return this.authService.isAuthenticated();
    }
    PasserCommande(): void {
        if (!this.authService.isAuthenticated()) {
            this.toastr.warning('Veuillez vous connecter pour continuer');
            return;
        }

        if (!this.hasRequiredInfo()) {
            this.toastr.warning('Veuillez compléter votre profil pour continuer');
            this.navigateToProfile();
            return;
        }

        this.display = false;
        this.confirmationDisplay = true;
        this.currentStep = 3;
    }

    closeConfirmation(): void {
        this.confirmationDisplay = false;
        this.currentStep = 2;
        this.display = true;
        this.isProcessing = false;
    }
    confirmOrder(): void {
        this.isProcessing = true;

        if (!this.hasRequiredInfo()) {
            this.isProcessing = false;
            this.toastr.error('Informations de livraison incomplètes');
            return;
        }

        this.cartItems$.pipe(take(1)).subscribe((items) => {
            if (items.length === 0) {
                this.isProcessing = false;
                this.toastr.error('Le panier est vide');
                return;
            }

            try {
                this.creerDocument();
            } catch (error) {
                this.isProcessing = false;
                console.error('Error during order creation:', error);
                this.toastr.error('Erreur lors de la création de la commande');
            }
        });
    }
    getClientFromStore(): void {
        this.store.select(selectUser).subscribe({
            next: (user) => {
                if (user) {
                    this.TiersCode = user.tiersCode;
                    this.TiersIntitule = user.tiersIntitule;
                    this.TiersAdresse1 = user.tiersAdresse1;
                    this.TiersCodePostal = user.tiersCodePostal;
                    this.TiersVille = user.tiersVille;
                    this.TiersPays = user.tiersPays;
                    this.TiersTel1 = user.tiersTel1;
                    this.TiersEmail = user.tiersEmail;
                    this.TiersDateCreate = user.tiersDateCreate;
                }
            },
            error: (error) => {
                console.error('Error fetching user data:', error);
            }
        });
    }

    navigateToProfile(): void {
        this.close();
        this.router.navigate(['/store/customer/profile'], {
            queryParams: { returnUrl: '/store/products/cart' }
        });
    }

    hasRequiredInfo(): boolean {
        return !!(this.TiersAdresse1 && this.TiersCodePostal && this.TiersVille && this.TiersPays && this.TiersTel1 && this.TiersEmail);
    }
    creerDocument(): void {
        if (!this.TiersCode || !this.TiersIntitule) {
            this.isProcessing = false;
            this.toastr.error('Erreur: Informations client manquantes');
            return;
        }

        const docVenteDto: DocVenteDto = {
            docTiersCode: this.TiersCode,
            docTiersIntitule: this.TiersIntitule,
            docTht: this.totalTht,
            docTtc: this.currentTotal + (!this.isEligibleForFreeShipping() ? 10 : 0) // Add shipping cost if not eligible
        };

        this.commandeService.createDocumentVente(docVenteDto).subscribe({
            next: (response) => {
                this.docVentePiece = response.docPiece;
                console.log('Document created with piece:', this.docVentePiece);
                // Now that we have the docVentePiece, create the document lines
                this.creerDocumentLignes();
            },
            error: (error) => {
                console.error('Error creating document:', error);
                this.toastr.error('Erreur lors de la création du document');
            }
        });
    }
    private cleanupAndNavigate(): void {
        this.clearCart();
        this.confirmationDisplay = false;
        this.currentStep = 1;
        this.isProcessing = false;
        this.router.navigate(['/store/customer/orders'], {
            queryParams: { type: 'en-attente' }
        });
    }
    creerDocumentLignes(): void {
        this.cartItems$.pipe(take(1)).subscribe((cartItems) => {
            let completedLines = 0;
            const totalLines = cartItems.length;

            if (totalLines === 0) {
                this.toastr.success('Commande passée avec succès');
                this.cleanupAndNavigate();
                return;
            }

            cartItems.forEach((item) => {
                const docLigneDto: DocLigneDto = {
                    ligneDocPiece: this.docVentePiece || '',
                    ligneArtCode: item.product.artCode,
                    ligneArtDesi: item.product.artIntitule,
                    ligneQte: item.quantity,
                    lignePu: item.product.artPrixVente,
                    ligneHt: item.product.artPrixVente * item.quantity,
                    ligneTtc: item.product.artPrixVente * (1 + item.product.artTvaTaux / 100) * item.quantity
                };

                console.log('Creating document line:', docLigneDto);
                this.commandeService.createDocumentventeLigne(docLigneDto).subscribe({
                    next: (response) => {
                        console.log('Document line created successfully:', response);
                        completedLines++;

                        if (completedLines === totalLines) {
                            this.toastr.success('Commande passée avec succès');
                            this.cleanupAndNavigate();
                        }
                    },
                    error: (error) => {
                        console.error('Error creating document line:', error);
                        this.toastr.error('Erreur lors de la création des lignes de commande');
                        this.isProcessing = false;
                    }
                });
            });
        });
    }
    updateQuantity(productId: number, quantity: number): void {
        if (quantity > 0) {
            this.store.dispatch(CartActions.updateQuantity({ productId, quantity }));
        }
    }

    removeFromCart(productId: number): void {
        this.store.dispatch(CartActions.removeFromCart({ productId }));
    }

    clearCart(): void {
        this.cartService.clearCart();
        this.store.dispatch(CartActions.clearCart());
    }

    continueShopping(): void {
        this.router.navigate(['/store/products']);
    }

    handleImageError(event: any): void {
        event.target.src = 'assets/general/product-default.png';
    }

    isEligibleForFreeShipping(): boolean {
        return this.currentTotal >= this.FREE_SHIPPING_THRESHOLD;
    }

    getProgressWidth(): string {
        const progress = (this.currentTotal / this.FREE_SHIPPING_THRESHOLD) * 100;
        return Math.min(progress, 100) + '%';
    }

    getRecommendedProducts(items: CartItem[]): void {
        //caching cart for no re fetch
        this.isLoadingRecommendations = true;
        this.recommendedProducts = [];
        const itemIds = items.map((item) => item.product.artCode);
        if (JSON.stringify(itemIds) === JSON.stringify(this.lastRecommendedItemIds)) {
            return; // Same cart items as before, skip API call
        }
        this.lastRecommendedItemIds = itemIds;

        if (itemIds.length === 0) {
            this.isLoadingRecommendations = false;
            return;
        }

        this.productsService.getRecommendedProductsForCart(itemIds, 5).subscribe({
            next: (products) => {
                setTimeout(() => {
                    console.log('Recommended products:', products);
                    this.recommendedProducts = products;
                    this.isLoadingRecommendations = false;

                    products.forEach((product) => {
                        if (!this.trackedRecommendationIds.has(product.artCode)) {
                            posthog.capture('recommendation_impression', {
                                productId: product.artCode,
                                userId: this.TiersCode
                            });
                            this.trackedRecommendationIds.add(product.artCode);
                        }
                    });
                }, 800);
            },
            error: (error) => {
                console.error('Error fetching recommended products:', error);
                this.isLoadingRecommendations = false;
                this.recommendedProducts = [];
            }
        });
    }
    navigateToproductFromRecommendation(product: Product): void {
        posthog.capture('recommendation_click', {
            productId: product.artCode,
            userId: this.TiersCode
        });
        this.router.navigate([`/store/products/${product.artId}`]);
    }
    navigateToProduct(product: Product): void {
        this.router.navigate([`/store/products/${product.artId}`]);
    }
}
