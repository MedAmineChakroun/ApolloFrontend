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

// Define the allowed severity types for p-tag
type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

interface SortOption {
    label: string;
    value: string;
    icon: string;
}

@Component({
    selector: 'app-products-list',
    standalone: true,
    imports: [CommonModule, DataViewModule, FormsModule, SelectButtonModule, PickListModule, OrderListModule, TagModule, ButtonModule, DropdownModule, InputTextModule, InputGroupModule],
    templateUrl: './products-list.component.html',
    styleUrls: ['./products-list.component.css'],
    providers: [ProductsService]
})
export class products implements OnInit {
    // Default product image to use when product image is not available
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    layout: 'list' | 'grid' = 'grid';
    options = ['list', 'grid'];
    products: Product[] = [];
    filteredProducts: Product[] = [];
    searchQuery: string = '';
    isSearching: boolean = false;
    pageTitle: string = 'All Products';

    // Sort options
    sortField: string = 'price';
    sortOrder: number = 0; // 0 for unsorted, 1 for ascending, -1 for descending
    sortOptions: SortOption[] = [
        { label: 'Price: Low to High', value: 'price_asc', icon: 'pi pi-sort-amount-up' },
        { label: 'Price: High to Low', value: 'price_desc', icon: 'pi pi-sort-amount-down' }
    ];
    selectedSortOption: SortOption | null = null;

    filters = {
        priceMin: 0,
        priceMax: 5000,
        category: '',
        rating: 0,
        inStock: false,
        search: ''
    };

    constructor(
        private productService: ProductsService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    // Method to handle image loading errors
    handleProductImageError(event: any): void {
        event.target.src = this.DEFAULT_PRODUCT_IMAGE;
    }

    ngOnInit() {
        // Listen for query param changes
        this.route.queryParams.subscribe((params) => {
            // Update filters based on query params
            if (params['priceMin']) this.filters.priceMin = +params['priceMin'];
            if (params['priceMax']) this.filters.priceMax = +params['priceMax'];
            if (params['category']) {
                this.filters.category = params['category'];
                this.pageTitle = params['category']; // Update page title to show category
            } else {
                this.filters.category = '';
                this.pageTitle = 'All Products';
            }
            if (params['rating']) this.filters.rating = +params['rating'];
            if (params['inStock']) {
                this.filters.inStock = params['inStock'] === 'true';
                if (this.filters.inStock) {
                    this.pageTitle = 'In Stock Products';
                }
            } else {
                this.filters.inStock = false;
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

    /**
     * Load products from the service
     */
    loadProducts() {
        // Show loading state if needed

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

                    this.applyFilters(); // Apply additional filters
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

                    this.applyFilters(); // Apply initial filters
                },
                error: (err) => {
                    console.error('Error loading products:', err);
                    this.products = []; // Fallback empty array
                    this.filteredProducts = [];
                }
            });
        }
    }

    /**
     * Clear category filter
     */
    clearCategoryFilter() {
        if (this.filters.category) {
            // Create a new query params object without the category param
            const queryParams: any = { ...this.route.snapshot.queryParams };
            delete queryParams.category;

            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: queryParams
            });
        }
    }

    /**
     * Clear in-stock filter
     */
    clearInStockFilter() {
        if (this.filters.inStock) {
            // Create a new query params object without the inStock param
            const queryParams: any = { ...this.route.snapshot.queryParams };
            delete queryParams.inStock;

            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: queryParams
            });
        }
    }

    /**
     * Handle search form submission
     */
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
            });
    }

    /**
     * Clear search and reset filter
     */
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
                });
        }
    }

    /**
     * Update sort field and order based on selected option
     */
    updateSortingFromOption(optionValue: string) {
        if (optionValue === 'price_asc') {
            this.sortField = 'artPrixVente';
            this.sortOrder = 1; // ascending
        } else if (optionValue === 'price_desc') {
            this.sortField = 'artPrixVente';
            this.sortOrder = -1; // descending
        }
    }

    /**
     * Handle sort option change
     */
    onSortChange(event: any) {
        const value = event.value.value;

        // Update URL with sort parameter
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { sort: value },
            queryParamsHandling: 'merge'
        });

        this.updateSortingFromOption(value);
        this.applyFilters();
    }

    /**
     * Apply all active filters to the products
     */
    applyFilters() {
        // First apply filters
        this.filteredProducts = this.products.filter((product) => {
            // Price filter
            const matchesPrice = product.artPrixVente >= this.filters.priceMin && (this.filters.priceMax === 0 || product.artPrixVente <= this.filters.priceMax);

            // Category filter (if specified)
            const matchesCategory = !this.filters.category || product.artFamille.toLowerCase() === this.filters.category.toLowerCase();

            // In-stock filter (if specified)
            const matchesInStock = !this.filters.inStock || product.artEtat > 0;

            // Search filter
            const searchTerm = this.filters.search.toLowerCase();
            const matchesSearch = !searchTerm || product.artIntitule.toLowerCase().includes(searchTerm) || product.artCode.toLowerCase().includes(searchTerm) || product.artFamille.toLowerCase().includes(searchTerm);

            // Return true if all conditions are met
            return matchesPrice && matchesCategory && matchesInStock && matchesSearch;
        });

        // Then apply sorting if applicable
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
    }

    // artEtat is 1 for in stock, 0 for out of stock
    getStockStatus(stockValue: number): string {
        return stockValue > 0 ? 'IN STOCK' : 'OUT OF STOCK';
    }

    getStockSeverity(stockValue: number): TagSeverity {
        return stockValue > 0 ? 'success' : 'danger';
    }

    isOutOfStock(stockValue: number): boolean {
        return stockValue === 0;
    }
}
