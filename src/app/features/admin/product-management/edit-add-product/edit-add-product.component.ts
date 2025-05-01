import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

import { ToastrService } from 'ngx-toastr';
import { ProductsService } from '../../../../core/services/products.service';
import { Famille } from '../../../../models/Famille';
import { FamillesService } from '../../../../core/services/familles.service';

@Component({
    selector: 'app-edit-add-product',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, InputNumberModule, DropdownModule, FileUploadModule, ToastModule, TooltipModule],
    providers: [MessageService],
    templateUrl: './edit-add-product.component.html',
    styleUrl: './edit-add-product.component.scss'
})
export class EditAddProductComponent implements OnInit {
    @ViewChild('fileUpload') fileUpload!: FileUpload;

    productForm!: FormGroup;
    isEditMode: boolean = false;
    pageTitle: string = 'Ajouter un Produit';
    productId: number | null = null;
    loading: boolean = false;
    submitting: boolean = false;
    uploadedFile: File | null = null;
    product: any = null;
    imageBaseUrl: string = 'http://localhost:91/Images/';
    categories: Famille[] = [];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private productService: ProductsService,
        private toastr: ToastrService,
        private famillesService: FamillesService
    ) {}

    ngOnInit(): void {
        this.initializeForm();
        this.loadCategories();

        // Check if we're in edit mode based on route parameter
        this.route.params.subscribe((params) => {
            if (params['id']) {
                this.isEditMode = true;
                this.productId = +params['id'];
                this.pageTitle = 'Modifier un Produit';
                this.loadProductDetails(this.productId);
            }
        });
    }

    initializeForm(): void {
        this.productForm = this.fb.group({
            artIntitule: ['', [Validators.required, Validators.maxLength(100)]],
            artFamille: ['', Validators.required],
            artPrixVente: [0, [Validators.required, Validators.min(0)]],
            artPrixAchat: [0, [Validators.required, Validators.min(0)]],
            artUnite: ['', Validators.required],
            artImageUrl: [''],
            artTvaTaux: [0, Validators.required]
        });
    }

    loadProductDetails(id: number): void {
        this.loading = true;
        this.productService.getProductById(id).subscribe({
            next: (response: any) => {
                this.product = response;
                if (this.product) {
                    this.productForm.patchValue({
                        artIntitule: this.product.artIntitule,
                        artFamille: this.product.artFamille,
                        artPrixVente: this.product.artPrixVente,
                        artPrixAchat: this.product.artPrixAchat,
                        artUnite: this.product.artUnite,
                        artTvaTaux: this.product.artTvaTaux
                    });
                    // Note: we don't set artImageUrl in the form - we'll handle this separately in the template
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading product details:', error);
                this.toastr.error('Erreur lors du chargement des détails du produit', 'Erreur');
                this.loading = false;
            }
        });
    }

    loadCategories(): void {
        this.famillesService.getFamilles().subscribe({
            next: (response: Famille[]) => {
                this.categories = response;
            },
            error: (error) => {
                console.error('Error loading categories:', error);
            }
        });
    }

    onSubmit(): void {
        if (this.productForm.invalid) {
            this.markFormGroupTouched(this.productForm);
            this.toastr.warning('Veuillez corriger les erreurs dans le formulaire', 'Formulaire invalide');
            return;
        }

        const formData = this.prepareFormData();
        this.submitting = true;

        if (this.isEditMode && this.productId) {
            // Edit existing product
            const productData = {
                ...formData,
                artId: this.productId
            };

            // Simulated update for now
            setTimeout(() => {
                this.submitting = false;
                this.toastr.success('Produit mis à jour avec succès', 'Succès');
                this.router.navigate(['store/admin/products']);
            }, 1000);
        } else {
            // Create new product
            // Simulated create for now
            setTimeout(() => {
                this.submitting = false;
                this.toastr.success('Produit créé avec succès', 'Succès');
                this.router.navigate(['store/admin/products']);
            }, 1000);
        }
    }

    // Helper to mark all controls as touched for validation
    markFormGroupTouched(formGroup: FormGroup) {
        Object.values(formGroup.controls).forEach((control) => {
            control.markAsTouched();
            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['store/admin/products']);
    }

    onImageUpload(event: any): void {
        if (event.files && event.files.length > 0) {
            const file = event.files[0];
            this.uploadedFile = file;

            // Create a FileReader to preview the image
            const reader = new FileReader();
            reader.onload = (e) => {
                this.productForm.patchValue({
                    artImageUrl: e.target?.result as string
                });
            };
            reader.readAsDataURL(file);

            // Reset the file uploader UI after successful upload
            if (this.fileUpload) {
                this.fileUpload.clear();
            }
        }
    }

    // Check if a form control is invalid and touched
    isInvalid(controlName: string): boolean {
        const control = this.productForm.get(controlName);
        return control !== null && control.invalid && (control.dirty || control.touched);
    }

    // Method to prepare form data for submission
    prepareFormData(): any {
        const formData = this.productForm.value;

        // Handle image URL logic in a simplified way
        if (this.uploadedFile) {
            // For new uploads, we'd normally upload the file to the server first
            // For this example, we're just using the filename
            formData.artImageUrl = this.uploadedFile.name;
        } else if (this.isEditMode && this.product?.artImageUrl && !this.productForm.get('artImageUrl')?.value) {
            // Keep existing image if in edit mode and no new image was uploaded
            formData.artImageUrl = this.product.artImageUrl;
        }

        return formData;
    }
}
