import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { DatePipe, CommonModule } from '@angular/common';

@Component({
    selector: 'app-terms-conditions',
    standalone: true,
    imports: [ButtonModule, DialogModule, AccordionModule, DividerModule, CommonModule],
    template: `
        <div class="prose dark:prose-invert prose-lg max-w-none">
            <p class="text-surface-700 dark:text-surface-300 mb-6">En utilisant cette plateforme, vous acceptez les présentes conditions générales. Veuillez les lire attentivement avant de créer un compte ou d'accéder à nos services.</p>

            <h2 class="text-2xl font-semibold mb-4 text-surface-900 dark:text-surface-0">1. Création de Compte</h2>
            <p class="text-surface-700 dark:text-surface-300 mb-6">
                Pour accéder aux fonctionnalités complètes de notre plateforme, vous devez créer un compte personnel avec des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités
                effectuées sous votre compte.
            </p>

            <h2 class="text-2xl font-semibold mb-4 text-surface-900 dark:text-surface-0">2. Utilisation Autorisée</h2>
            <p class="text-surface-700 dark:text-surface-300 mb-6">
                Vous vous engagez à utiliser notre plateforme uniquement à des fins légales et dans le respect des présentes conditions. Toute tentative d’accès non autorisé, d’utilisation abusive ou de détournement de nos services entraînera une
                suspension immédiate de votre compte.
            </p>

            <h2 class="text-2xl font-semibold mb-4 text-surface-900 dark:text-surface-0">3. Données Personnelles</h2>
            <p class="text-surface-700 dark:text-surface-300 mb-6">
                Les données collectées lors de votre inscription sont utilisées pour améliorer votre expérience utilisateur. Elles ne sont ni vendues ni partagées sans votre consentement, sauf obligation légale. Vous pouvez à tout moment demander la
                suppression de vos données.
            </p>

            <h2 class="text-2xl font-semibold mb-4 text-surface-900 dark:text-surface-0">4. Contenus et Comportements Interdits</h2>
            <p class="text-surface-700 dark:text-surface-300 mb-6">
                Il est interdit de publier ou transmettre des contenus diffamatoires, haineux, illégaux ou frauduleux. Le non-respect de cette règle peut entraîner la résiliation de votre compte sans préavis.
            </p>

            <h2 class="text-2xl font-semibold mb-4 text-surface-900 dark:text-surface-0">5. Propriété Intellectuelle</h2>
            <p class="text-surface-700 dark:text-surface-300 mb-6">
                Tous les contenus présents sur la plateforme (textes, images, logos, algorithmes, etc.) sont la propriété exclusive de [Votre société] ou de ses partenaires. Toute reproduction non autorisée est strictement interdite.
            </p>

            <h2 class="text-2xl font-semibold mb-4 text-surface-900 dark:text-surface-0">6. Modifications des Conditions</h2>
            <p class="text-surface-700 dark:text-surface-300 mb-6">
                Nous nous réservons le droit de modifier les présentes conditions à tout moment. Vous serez informé de toute modification importante par e-mail ou via l'application. L'utilisation continue de nos services vaut acceptation des
                nouvelles conditions.
            </p>

            <h2 class="text-2xl font-semibold mb-4 text-surface-900 dark:text-surface-0">7. Contact et Support</h2>
            <p class="text-surface-700 dark:text-surface-300 mb-6">
                Pour toute question concernant ces conditions, veuillez nous contacter à <a href="mailto:medaminechakroun520@gmail.com" class="text-success hover:underline">medaminechakroun520&#64;gmail.com</a>. Notre équipe vous répondra dans les
                plus brefs délais.
            </p>
        </div>
    `
})
export class TermsConditions {
    @Output() accepted = new EventEmitter<boolean>();
    currentDate = new Date();

    onAccept() {
        this.accepted.emit(true);
    }

    onReject() {
        this.accepted.emit(false);
    }
}
