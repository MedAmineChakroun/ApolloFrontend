import { Component, signal, inject, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { trigger, transition, style, animate } from '@angular/animations';

interface ChatMessage {
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

@Component({
    standalone: true,
    selector: 'app-chatbot',
    imports: [CommonModule, ButtonModule, InputTextModule, FormsModule, ToastModule, ProgressSpinnerModule, RippleModule, AvatarModule, BadgeModule, TooltipModule],
    providers: [MessageService],
    templateUrl: './chat-bot.component.html',
    styleUrls: ['./chat-bot.component.css'],
    animations: [
        trigger('slideInOut', [
            transition('void => in', [style({ transform: 'translateY(20px)', opacity: 0 }), animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))]),
            transition('in => void', [animate('300ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))])
        ])
    ]
})
export class ChatbotComponent implements OnInit {
    @ViewChild('chatBody') chatBody!: ElementRef;
    @ViewChild('messageInput') messageInput!: ElementRef;

    // Using regular properties instead of signals for simplicity
    isOpen = false;
    isLoading = false;
    userMessage = '';
    messages: ChatMessage[] = [];
    unreadCount = 0;
    isNearBottom = true;
    showScrollBtn = false;
    systemContext = `
Vous êtes un assistant IA intelligent et amical pour Apollo — une plateforme e-commerce moderne et sécurisée spécialisée dans l'électronique, la mode, la décoration intérieure et les produits de santé.

Apollo offre une expérience d'achat fluide et sûre avec les fonctionnalités suivantes :

✅ Expérience utilisateur sécurisée :
- Toutes les données personnelles et informations de commande sont protégées grâce à une authentification basée sur JWT et un backend .NET robuste.

🛍️ Fonctionnalités d'achat :
- Parcourez une large gamme de produits classés par type, marque et autres filtres.
- Utilisez la recherche par mots-clés et les options de tri (par prix, popularité ou nouveautés) pour trouver facilement des produits.
- Consultez les spécifications détaillées, images et avis des produits.
- Ajoutez des produits à un panier personnalisé et modifiez-le à tout moment.
- Passez des commandes sécurisées via un processus de commande simplifié sans méthodes de paiement requises.

📦 Gestion des commandes & historique :
- Suivez le statut des commandes en cours et passées.
- Consultez l'historique complet des commandes.
- Exportez les commandes en CSV ou PDF, ou imprimez-les directement pour vos dossiers.
- Recevez des notifications pour les mises à jour de commande par e-mail et via notre système de notifications.

📬 Support & Aide :
- Contactez l'équipe support directement en soumettant une demande par e-mail.
- Obtenez de l'aide pour la livraison, les retours, le paiement ou les problèmes techniques.
- Accédez à une FAQ complète pour des réponses rapides aux questions courantes.

🤖 Recommandations intelligentes :
- Profitez d'un moteur de recommandations personnalisées basé sur l'IA selon vos commandes précédentes.
- Recevez des suggestions adaptées pour des produits similaires dans votre panier actuel.
- Nos systèmes IA sont mis à jour automatiquement pour fournir les informations les plus récentes.
🧠 En cas de doute :
Si vous n'êtes pas sûr de quelque chose ou si vous n'avez pas l'information nécessaire, informez gentiment l'utilisateur que vous n'avez pas accès à ce détail — et suggérez de contacter le support humain si besoin.

Votre rôle est d'assister les utilisateurs de manière claire, utile et amicale. Si les utilisateurs demandent des actions comme « ajouter au panier » ou « passer commande », expliquez comment ils peuvent le faire via la plateforme Apollo sauf si une API est fournie pour une interaction directe.

Ne devinez jamais. Soyez toujours précis, bref, honnête et serviable. Si vous ne connaissez pas la réponse, suggérez de contacter le support humain.
`;

    private scrollThreshold = 150; // Increased threshold for better UX
    private messageService = inject(MessageService);
    private genAI = new GoogleGenerativeAI('AIzaSyBj7GtFbJj8Komijg_OurAEUbbGjda7-4w');
    private model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    private chatHistory: string[] = [];

    ngOnInit() {
        this.loadSavedMessages();
    }

    toggleChat() {
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            this.unreadCount = 0;

            // Add welcome message if chat is empty
            if (this.messages.length === 0) {
                this.messages.push({
                    content: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
                    sender: 'ai',
                    timestamp: new Date()
                });
                this.saveMessages();
            }

            // Focus input field after a short delay to allow animation
            setTimeout(() => {
                if (this.messageInput) {
                    this.messageInput.nativeElement.focus();
                }
                this.scrollToBottom();
            }, 50);
        }
    }

    async sendMessage() {
        if (!this.userMessage.trim()) return;

        const userMsg = this.userMessage.trim();
        this.userMessage = '';

        // Add user message
        this.messages.push({
            content: userMsg,
            sender: 'user',
            timestamp: new Date()
        });

        // Add to chat history
        this.chatHistory.push(`User: ${userMsg}`);

        this.isLoading = true;
        this.isNearBottom = true;
        this.scrollToBottom();

        try {
            // Create prompt with context
            const prompt = this.systemContext + '\n\n' + this.chatHistory.slice(-10).join('\n') + '\nAI:';

            // Generate response
            const result = await this.model.generateContent(prompt);
            const response = await result.response.text();

            // Add AI response
            this.messages.push({
                content: response,
                sender: 'ai',
                timestamp: new Date()
            });

            // Add to history
            this.chatHistory.push(`AI: ${response}`);
            this.saveMessages();

            // Increment unread count if chat is closed
            if (!this.isOpen) {
                this.unreadCount++;
            }
        } catch (error) {
            console.error('Gemini API Error:', error);

            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible d\'obtenir une réponse. Veuillez réessayer.'
            });

            this.messages.push({
                content: "Je suis désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer plus tard.",
                sender: 'ai',
                timestamp: new Date()
            });
        } finally {
            this.isLoading = false;
            this.scrollToBottom();
        }
    }

    clearChat() {
        this.messages = [
            {
                content: 'L\'historique du chat a été effacé. Comment puis-je vous aider ?',
                sender: 'ai',
                timestamp: new Date()
            }
        ];
        this.chatHistory = [];
        this.saveMessages();
        this.scrollToBottom();
    }

    onChatScroll() {
        if (!this.chatBody) return;

        const element = this.chatBody.nativeElement;
        const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight < this.scrollThreshold;

        this.isNearBottom = atBottom;
        this.showScrollBtn = !atBottom && element.scrollTop < element.scrollHeight - element.clientHeight;
    }

    scrollToBottom() {
        setTimeout(() => {
            if (this.chatBody) {
                const element = this.chatBody.nativeElement;
                element.scrollTop = element.scrollHeight;
                this.isNearBottom = true;
                this.showScrollBtn = false;
            }
        }, 100);
    }

    formatTime(timestamp: Date): string {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    private loadSavedMessages() {
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            try {
                // Parse dates correctly
                const parsedMessages = JSON.parse(savedMessages);
                this.messages = parsedMessages.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
            } catch (e) {
                console.error('Error parsing saved messages:', e);
                this.messages = [];
            }
        }
    }

    private saveMessages() {
        localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    }
}
