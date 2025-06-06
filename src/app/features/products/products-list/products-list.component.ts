import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { OrderListModule } from 'primeng/orderlist';
import { PickListModule } from 'primeng/picklist';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../models/Product';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { CartService } from '../../../core/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { RippleModule } from 'primeng/ripple';
import { RecommendedProductsComponent } from '../recommended-products/recommended-products.component';
import { TopRatedComponent } from '../top-rated/top-rated.component';
import { TopSalesComponent } from '../top-sales/top-sales.component';
import { AdsCarouselComponent } from '../ads-carousel/ads-carousel.component';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { PromoBannerComponent } from '../promo-banner/promo-banner.component';
import { StockService } from '../../../core/services/stock.service';
import { Stock } from '../../../models/Stock';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

interface SortOption {
    label: string;
    value: string;
    icon: string;
}

@Component({
    selector: 'app-products-list',
    standalone: true,
    imports: [
        PromoBannerComponent,
        AdsCarouselComponent,
        TopSalesComponent,
        TopRatedComponent,
        RecommendedProductsComponent,
        CommonModule,
        DataViewModule,
        FormsModule,
        SelectButtonModule,
        PickListModule,
        OrderListModule,
        TagModule,
        ButtonModule,
        DropdownModule,
        InputTextModule,
        InputGroupModule,
        RippleModule,
        SliderModule,
        CheckboxModule,
        DialogModule
    ],
    templateUrl: './products-list.component.html',
    styleUrls: ['./products-list.component.scss'],
    providers: [ProductsService, StockService]
})
export class ProductsListComponent implements OnInit {
    // Default product image to use when product image is not available
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    layout: 'list' | 'grid' = 'grid';
    products: Product[] = [];
    filteredProducts: Product[] = [];
    searchQuery: string = '';
    isSearching: boolean = false;
    pageTitle: string = 'Tout les produits';
    stocks: Stock[] = [];
    // Price range slider
    priceRange: number[] = [0, 10000]; // Default price range values
    inStockOnly: boolean = false;
    showPriceDialog: boolean = false;

    // Sort options
    sortField: string = 'price';
    sortOrder: number = 0; // 0 for unsorted, 1 for ascending, -1 for descending
    sortOptions: SortOption[] = [
        { label: 'Prix: bas a haute', value: 'price_asc', icon: 'pi pi-sort-amount-up' },
        { label: 'Prix: haute a bas', value: 'price_desc', icon: 'pi pi-sort-amount-down' }
    ];
    selectedSortOption: SortOption | null = null;

    filters = {
        priceMin: 0,
        priceMax: 10000,
        category: '',
        rating: 0,
        inStock: false,
        search: ''
    };

    constructor(
        private productService: ProductsService,
        private route: ActivatedRoute,
        private router: Router,
        private toastr: ToastrService,
        private cartService: CartService,
        private stockService: StockService
    ) {}

    handleProductImageError(event: any): void {
        event.target.src = this.DEFAULT_PRODUCT_IMAGE;
    }

    ngOnInit() {
        // Listen for query param changes
        this.route.queryParams.subscribe((params) => {
            // Update filters based on query params
            if (params['priceMin']) {
                this.filters.priceMin = +params['priceMin'];
                this.priceRange[0] = +params['priceMin'];
            }
            if (params['priceMax']) {
                this.filters.priceMax = +params['priceMax'];
                this.priceRange[1] = +params['priceMax'];
            }
            if (params['category']) {
                this.filters.category = params['category'];
                this.pageTitle = params['category']; // Update page title to show category
            } else {
                this.filters.category = '';
                this.pageTitle = 'Tous les produits';
            }
            if (params['rating']) this.filters.rating = +params['rating'];
            if (params['inStock']) {
                this.filters.inStock = params['inStock'] === 'true';
                this.inStockOnly = params['inStock'] === 'true';
                if (this.filters.inStock) {
                    this.pageTitle = 'In Stock Products';
                }
            } else {
                this.filters.inStock = false;
                this.inStockOnly = false;
            }
            if (params['search']) {
                this.filters.search = params['search'];
                this.searchQuery = params['search'];
            } else {
                this.filters.search = '';
                this.searchQuery = '';
            }

            // Handle sort parameters
            if (params['sort']) {
                const sortOption = this.sortOptions.find((option) => option.value === params['sort']);
                if (sortOption) {
                    this.selectedSortOption = sortOption;
                    this.updateSortingFromOption(sortOption.value);
                }
            }

            // If we already have products, apply filters
            if (this.products.length > 0) {
                this.applyFilters();
            }
        });

        this.loadProducts();
    }

    loadProducts() {
        // Check if we have a category filter
        if (this.filters.category) {
            this.productService.getProductsByFamille(this.filters.category).subscribe({
                next: (response: any) => {
                    // Handle different response formats
                    if (response?.data?.produits) {
                        this.products = response.data.produits;
                    } else if (Array.isArray(response)) {
                        this.products = response;
                    } else if (response?.data && Array.isArray(response.data)) {
                        this.products = response.data;
                    } else if (response?.produits && Array.isArray(response.produits)) {
                        this.products = response.produits;
                    } else {
                        this.products = [];
                        console.warn('Unexpected API response format:', response);
                    }

                    // After products are loaded, fetch stock data
                    this.loadStockData();
                },
                error: (err) => {
                    console.error('Error loading products by category:', err);
                    this.products = []; // Fallback empty array
                    this.filteredProducts = [];
                }
            });
        } else {
            this.productService.getProducts().subscribe({
                next: (response: any) => {
                    // Handle different response formats
                    if (response?.data?.produits) {
                        this.products = response.data.produits;
                    } else if (Array.isArray(response)) {
                        this.products = response;
                    } else if (response?.data && Array.isArray(response.data)) {
                        this.products = response.data;
                    } else if (response?.produits && Array.isArray(response.produits)) {
                        this.products = response.produits;
                    } else {
                        this.products = [];
                        console.warn('Unexpected API response format:', response);
                    }

                    // After products are loaded, fetch stock data
                    this.loadStockData();
                },
                error: (err) => {
                    console.error('Error loading products:', err);
                    this.products = []; // Fallback empty array
                    this.filteredProducts = [];
                }
            });
        }
    }

    loadStockData() {
        this.stockService.getAllStock().subscribe({
            next: (stockData: Stock[]) => {
                this.stocks = stockData;

                // Attach stock information to products using the same approach as TopSalesComponent
                this.products = this.products.map((product) => {
                    const stock = stockData.find((s) => s.arRef === product.artCode);

                    // Add stockQuantity property to the product
                    return { ...product, stockQuantity: stock?.asQteSto ?? 0 };
                });

                // Apply filters after attaching stock data
                this.applyFilters();
            },
            error: (err) => {
                console.error('Error loading stock data:', err);
                // Apply filters even if stock data failed to load
                this.applyFilters();
            }
        });
    }

    applyPriceFilter() {
        // Get current query parameters to preserve other filters
        const currentParams = { ...this.route.snapshot.queryParams };

        // Update price range filters
        this.filters.priceMin = this.priceRange[0];
        this.filters.priceMax = this.priceRange[1];

        // Update query parameters
        currentParams['priceMin'] = this.priceRange[0];
        currentParams['priceMax'] = this.priceRange[1];

        // Close dialog if it's open
        this.showPriceDialog = false;

        this.router
            .navigate([], {
                relativeTo: this.route,
                queryParams: currentParams
            })
            .then(() => {
                this.scrollToProductGrid();
            });
    }

    toggleInStock() {
        // Get current query parameters to preserve other filters
        const currentParams = { ...this.route.snapshot.queryParams };

        // Add or update the inStock parameter
        if (this.inStockOnly) {
            currentParams['inStock'] = 'true';
        } else {
            delete currentParams['inStock'];
        }

        this.router
            .navigate([], {
                relativeTo: this.route,
                queryParams: currentParams
            })
            .then(() => {
                this.scrollToProductGrid();
            });
    }

    openPriceFilterDialog() {
        this.showPriceDialog = true;
    }

    clearCategoryFilter() {
        if (this.filters.category) {
            // Create a new query params object without the category param
            const queryParams: any = { ...this.route.snapshot.queryParams };
            delete queryParams.category;

            this.router
                .navigate([], {
                    relativeTo: this.route,
                    queryParams: queryParams
                })
                .then(() => {
                    this.scrollToProductGrid();
                });
        }
    }

    clearInStockFilter() {
        if (this.filters.inStock) {
            // Create a new query params object without the inStock param
            const queryParams: any = { ...this.route.snapshot.queryParams };
            delete queryParams.inStock;
            this.inStockOnly = false;

            this.router
                .navigate([], {
                    relativeTo: this.route,
                    queryParams: queryParams
                })
                .then(() => {
                    this.scrollToProductGrid();
                });
        }
    }

    searchProducts() {
        this.isSearching = true;

        this.router
            .navigate([], {
                relativeTo: this.route,
                queryParams: { search: this.searchQuery },
                queryParamsHandling: 'merge'
            })
            .then(() => {
                // Turn off loading after navigation is complete
                this.isSearching = false;
                this.scrollToProductGrid();
            });
    }

    clearSearch() {
        if (this.searchQuery) {
            this.searchQuery = '';
            this.isSearching = true;

            // Create a new query params object without the search param
            const queryParams: any = { ...this.route.snapshot.queryParams };
            delete queryParams.search;

            this.router
                .navigate([], {
                    relativeTo: this.route,
                    queryParams: queryParams
                })
                .then(() => {
                    // Turn off loading after navigation is complete
                    this.isSearching = false;
                    this.scrollToProductGrid();
                });
        }
    }

    updateSortingFromOption(optionValue: string) {
        if (optionValue === 'price_asc') {
            this.sortField = 'artPrixVente';
            this.sortOrder = 1; // ascending
        } else if (optionValue === 'price_desc') {
            this.sortField = 'artPrixVente';
            this.sortOrder = -1; // descending
        }
    }

    onSortChange(event: any) {
        const value = event.value.value;

        // Update URL with sort parameter
        this.router
            .navigate([], {
                relativeTo: this.route,
                queryParams: { sort: value },
                queryParamsHandling: 'merge'
            })
            .then(() => {
                this.scrollToProductGrid();
            });

        this.updateSortingFromOption(value);
        this.applyFilters();
    }

    /**
     * Apply all active filters to the products
     */
    applyFilters() {
        const { priceMin, priceMax, category, inStock, search } = this.filters;

        // Determine if any filters are active
        const isFilterActive =
            priceMin > 0 ||
            priceMax < 10000 || // 10000 is your max default, so user reduced it
            !!category?.trim() ||
            !!inStock ||
            !!search?.trim();

        // First apply filters
        this.filteredProducts = this.products.filter((product) => {
            const matchesPrice = product.artPrixVente >= priceMin && (priceMax === 0 || product.artPrixVente <= priceMax);

            const matchesCategory = !category || product.artFamille.toLowerCase() === category.toLowerCase();

            // Use stockQuantity instead of artEtat for in-stock filter
            const matchesInStock = !inStock || (product as any).stockQuantity > 0;

            const searchTerm = search.toLowerCase();
            const matchesSearch = !searchTerm || product.artIntitule.toLowerCase().includes(searchTerm) || product.artCode.toLowerCase().includes(searchTerm) || product.artFamille.toLowerCase().includes(searchTerm);

            return matchesPrice && matchesCategory && matchesInStock && matchesSearch;
        });

        // Apply sorting if needed
        if (this.sortOrder !== 0) {
            this.filteredProducts.sort((a, b) => {
                const valueA = a[this.sortField as keyof Product];
                const valueB = b[this.sortField as keyof Product];

                if (typeof valueA === 'number' && typeof valueB === 'number') {
                    return this.sortOrder * (valueA - valueB);
                }

                return 0;
            });
        }

        // Scroll only if filters are active
        if (isFilterActive) {
            this.scrollToProductGrid();
        }
    }

    private scrollToProductGrid() {
        setTimeout(() => {
            const gridElement = document.getElementById('grid');
            if (gridElement) {
                const yOffset = -80; // adjust this based on sticky header height, etc.
                const y = gridElement.getBoundingClientRect().top + window.scrollY + yOffset;
                window.scrollTo({ top: y, behavior: 'auto' }); // instant scroll
            }
        }, 50); // Wait 50ms before trying to scroll
    }

    // Update stock methods to use stockQuantity property instead of artEtat
    getSeverity(product: any): TagSeverity {
        const stock = product.stockQuantity || 0;
        if (stock == 0) return 'danger';
        if (stock <= 10) return 'warn';
        return 'success';
    }

    getSeverityValue(product: any): string {
        const stock = product.stockQuantity || 0;
        if (stock == 0) return 'Rupture ';
        if (stock <= 10) return 'Faible';
        return 'Disponible';
    }

    getStockIcon(product: any): string {
        const stock = product.stockQuantity || 0;
        if (stock == 0) return 'pi pi-exclamation-circle';
        if (stock <= 10) return 'pi pi-info-circle';
        return 'pi pi-check-circle';
    }

    isOutOfStock(product: any): boolean {
        return product.stockQuantity === 0;
    }

    addToCart(product: Product) {
        this.cartService.addToCart(product);

        // Show success toast
        this.toastr.success(`${product.artIntitule} added to cart`, 'Added to Cart', {
            timeOut: 2000,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-bottom-right'
        });

        // Add animation to cart icon (optional)
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.classList.add('animate-bounce');
            setTimeout(() => {
                cartIcon.classList.remove('animate-bounce');
            }, 1000);
        }
    }

    navigateToProductDetails(productId: string) {
        this.router.navigate(['/store/products', productId]);
    }
}
