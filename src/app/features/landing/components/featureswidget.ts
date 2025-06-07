import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'features-widget',
    standalone: true,
    imports: [CommonModule],
    template: /*html*/ ` <div id="features" class="py-6 px-6 lg:px-20 mt-8 mx-0 lg:mx-20">
        <div class="grid grid-cols-12 gap-4 justify-center">
            <div class="col-span-12 text-center mt-20 mb-6">
                <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">Fonctionnalités de Shopping Intelligent</div>
                <span class="text-muted-color text-2xl">Découvrez l'avenir du e-commerce avec l'intelligence alimentée par l'IA</span>
            </div>

            <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))" class="transition-all duration-300 hover:bg-opacity-100">
                    <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full transition-all duration-300 hover:bg-opacity-95" style="border-radius: 8px">
                        <div class="flex items-center justify-center bg-yellow-200 mb-4 transform transition-all duration-300 hover:rotate-12 hover:scale-110" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                            <i class="pi pi-fw pi-bolt !text-2xl text-yellow-700"></i>
                        </div>
                        <h5 class="mb-2 text-surface-900 dark:text-surface-0 transition-all duration-300 hover:text-yellow-600">Recommandations IA</h5>
                        <span class="text-surface-600 dark:text-surface-200">Suggestions de produits personnalisées basées sur vos préférences et votre historique de navigation.</span>
                    </div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(145, 226, 237, 0.2), rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(172, 180, 223, 0.2))" class="transition-all duration-300 hover:bg-opacity-100">
                    <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full transition-all duration-300 hover:bg-opacity-95" style="border-radius: 8px">
                        <div class="flex items-center justify-center bg-cyan-200 mb-4 transform transition-all duration-300 hover:rotate-12 hover:scale-110" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                            <i class="pi pi-fw pi-box !text-2xl text-cyan-700"></i>
                        </div>
                        <h5 class="mb-2 text-surface-900 dark:text-surface-0 transition-all duration-300 hover:text-cyan-600">Passation de Commande</h5>
                        <span class="text-surface-600 dark:text-surface-200">Processus de commande simple et rapide en quelques clics, avec confirmation instantanée.</span>
                    </div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pb-8 mt-6 lg:mt-0 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(145, 226, 237, 0.2), rgba(172, 180, 223, 0.2)), linear-gradient(180deg, rgba(172, 180, 223, 0.2), rgba(246, 158, 188, 0.2))" class="transition-all duration-300 hover:bg-opacity-100">
                    <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full transition-all duration-300 hover:bg-opacity-95" style="border-radius: 8px">
                        <div class="flex items-center justify-center bg-indigo-200 mb-4 transform transition-all duration-300 hover:rotate-12 hover:scale-110" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                            <i class="pi pi-fw pi-shield !text-2xl text-indigo-700"></i>
                        </div>
                        <div class="mt-6 mb-1 text-surface-900 dark:text-surface-0 text-xl font-semibold transition-all duration-300 hover:text-indigo-600">Authentification Sécurisée</div>
                        <span class="text-surface-600 dark:text-surface-200">Protection avancée de vos données et transactions avec une authentification multi-facteurs.</span>
                    </div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(187, 199, 205, 0.2), rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(145, 210, 204, 0.2))" class="transition-all duration-300 hover:bg-opacity-100">
                    <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full transition-all duration-300 hover:bg-opacity-95" style="border-radius: 8px">
                        <div class="flex items-center justify-center bg-slate-200 mb-4 transform transition-all duration-300 hover:rotate-12 hover:scale-110" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                            <i class="pi pi-fw pi-mobile !text-2xl text-slate-700"></i>
                        </div>
                        <div class="mt-6 mb-1 text-surface-900 dark:text-surface-0 text-xl font-semibold transition-all duration-300 hover:text-slate-600">Expérience Utilisateur</div>
                        <span class="text-surface-600 dark:text-surface-200">Interface intuitive et responsive pour une navigation fluide sur tous les appareils.</span>
                    </div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 lg:pb-8 mt-6 lg:mt-0 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(187, 199, 205, 0.2), rgba(246, 158, 188, 0.2)), linear-gradient(180deg, rgba(145, 226, 237, 0.2), rgba(160, 210, 250, 0.2))" class="transition-all duration-300 hover:bg-opacity-100">
                    <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full transition-all duration-300 hover:bg-opacity-95" style="border-radius: 8px">
                        <div class="flex items-center justify-center bg-orange-200 mb-4 transform transition-all duration-300 hover:rotate-12 hover:scale-110" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                            <i class="pi pi-fw pi-desktop !text-2xl text-orange-700"></i>
                        </div>
                        <div class="mt-6 mb-1 text-surface-900 dark:text-surface-0 text-xl font-semibold transition-all duration-300 hover:text-orange-600">Interface Conviviale</div>
                        <span class="text-surface-600 dark:text-surface-200">Design moderne et ergonomique pour une expérience d'achat agréable et efficace.</span>
                    </div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pb-8 mt-6 lg:mt-0 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(251, 199, 145, 0.2), rgba(246, 158, 188, 0.2)), linear-gradient(180deg, rgba(172, 180, 223, 0.2), rgba(212, 162, 221, 0.2))" class="transition-all duration-300 hover:bg-opacity-100">
                    <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full transition-all duration-300 hover:bg-opacity-95" style="border-radius: 8px">
                        <div class="flex items-center justify-center bg-pink-200 mb-4 transform transition-all duration-300 hover:rotate-12 hover:scale-110" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                            <i class="pi pi-fw pi-comments !text-2xl text-pink-700"></i>
                        </div>
                        <div class="mt-6 mb-1 text-surface-900 dark:text-surface-0 text-xl font-semibold transition-all duration-300 hover:text-pink-600">Assistance Service</div>
                        <span class="text-surface-600 dark:text-surface-200">Support client 24/7 et assistance alimentée par l'IA pour tous vos besoins.</span>
                    </div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 mt-6 lg:mt-0 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(145, 210, 204, 0.2), rgba(160, 210, 250, 0.2)), linear-gradient(180deg, rgba(187, 199, 205, 0.2), rgba(145, 210, 204, 0.2))" class="transition-all duration-300 hover:bg-opacity-100">
                    <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full transition-all duration-300 hover:bg-opacity-95" style="border-radius: 8px">
                        <div class="flex items-center justify-center bg-teal-200 mb-4 transform transition-all duration-300 hover:rotate-12 hover:scale-110" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                            <i class="pi pi-fw pi-bell !text-2xl text-teal-700"></i>
                        </div>
                        <div class="mt-6 mb-1 text-surface-900 dark:text-surface-0 text-xl font-semibold transition-all duration-300 hover:text-teal-600">Notifications en Temps Réel</div>
                        <span class="text-surface-600 dark:text-surface-200">Alertes instantanées sur les prix, promotions et mises à jour de vos commandes.</span>
                    </div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg:pr-8 mt-6 lg:mt-0 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(145, 210, 204, 0.2), rgba(212, 162, 221, 0.2)), linear-gradient(180deg, rgba(251, 199, 145, 0.2), rgba(160, 210, 250, 0.2))" class="transition-all duration-300 hover:bg-opacity-100">
                    <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full transition-all duration-300 hover:bg-opacity-95" style="border-radius: 8px">
                        <div class="flex items-center justify-center bg-blue-200 mb-4 transform transition-all duration-300 hover:rotate-12 hover:scale-110" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                            <i class="pi pi-fw pi-shopping-cart !text-2xl text-blue-700"></i>
                        </div>
                        <div class="mt-6 mb-1 text-surface-900 dark:text-surface-0 text-xl font-semibold transition-all duration-300 hover:text-blue-600">Gestion des Commandes</div>
                        <span class="text-surface-600 dark:text-surface-200">Suivi détaillé de vos commandes avec historique et statuts en temps réel.</span>
                    </div>
                </div>
            </div>

            <div id="highlights" class="col-span-12 md:col-span-12 lg:col-span-4 p-0 lg-4 mt-6 lg:mt-0 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div style="height: 160px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(160, 210, 250, 0.2), rgba(212, 162, 221, 0.2)), linear-gradient(180deg, rgba(246, 158, 188, 0.2), rgba(212, 162, 221, 0.2))" class="transition-all duration-300 hover:bg-opacity-100">
                    <div class="p-4 bg-surface-0 dark:bg-surface-900 h-full transition-all duration-300 hover:bg-opacity-95" style="border-radius: 8px">
                        <div class="flex items-center justify-center bg-purple-200 mb-4 transform transition-all duration-300 hover:rotate-12 hover:scale-110" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                            <i class="pi pi-fw pi-shopping-bag !text-2xl text-purple-700"></i>
                        </div>
                        <div class="mt-6 mb-1 text-surface-900 dark:text-surface-0 text-xl font-semibold transition-all duration-300 hover:text-purple-600">Panier Intelligent</div>
                        <span class="text-surface-600 dark:text-surface-200">Gestion intelligente de votre panier avec suggestions et optimisation des achats.</span>
                    </div>
                </div>
            </div>

            <div
                class="col-span-12 mt-20 mb-20 p-2 md:p-20 transform transition-all duration-300 hover:scale-102 hover:shadow-md"
                style="border-radius: 20px; background: linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, #efe1af 0%, #c3dcfa 100%)"
            >
                <div class="flex flex-col justify-center items-center text-center px-4 py-4 md:py-0">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="text-gray-900 text-3xl font-semibold">Medamine Chakroun</div>
                        <div class="text-gray-600 text-2xl">&</div>
                        <div class="text-gray-900 text-3xl font-semibold">Fedi Boughnimi</div>
                    </div>
                    <span class="text-gray-600 text-2xl">Développeurs Web Full Stack </span>
                    <p class="text-gray-900 sm:line-height-2 md:line-height-4 text-2xl mt-6" style="max-width: 800px">
                        "En tant que fondateurs, nous avons intégré une technologie d'IA de pointe pour révolutionner l'expérience e-commerce. Notre système de recommandation intelligent a non seulement augmenté les ventes mais a également créé un parcours d'achat plus personnalisé pour nos utilisateurs. Les fonctionnalités alimentées par l'IA ont transformé la façon dont les clients découvrent et achètent des produits, rendant chaque interaction significative et efficace."
                    </p>
                    <div class="flex items-center gap-2 mt-6">
                        <img src="assets/general/apolo2.png" class="h-12" alt="Apollo Logo" />
                        <span class="text-gray-900 text-xl font-semibold">Apollo Store</span>
                    </div>
                </div>
            </div>
        </div>
    </div>`
})
export class FeaturesWidget {}
