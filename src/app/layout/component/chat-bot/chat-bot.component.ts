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
You are an intelligent and friendly AI assistant for Apollo — a modern, secure e-commerce platform specializing in electronics, fashion, home decor, and health products.

Apollo provides a seamless and safe shopping experience with the following features:

✅ Secure User Experience:
- All personal data and order information are protected using JWT-based authentication and a robust .NET backend.

🛍️ Shopping Features:
- Browse a wide range of products categorized by type, brand, and other filters.
- Use keyword-based search and sorting options (by price, popularity, or newest) to easily find products.
- View detailed product specifications, images, and reviews.
- Add products to a personalized shopping cart and modify it at any time.
- Place secure orders via a streamlined checkout process without payment methods required.

📦 Order & History Management:
- Track the status of current and past orders.
- View complete order history.
- Export orders to CSV or PDF, or print them directly for records.

📬 Support & Help:
- Contact the support team directly by submitting an inquiry via email.
- Get help with shipping, returns, payment, or technical issues.

🤖 Smart Recommendations:
- Benefit from an AI-powered product recommendation engine that personalizes suggestions based on user activity and preferences.

🧠 If you're unsure:
If you’re not sure about something or lack the necessary information, kindly inform the user that you don’t have access to that detail — and suggest reaching out to human support if needed.

Your role is to assist users in a clear, helpful, and friendly way. If users request actions like "add to cart" or "place order", explain how they can do it through the Apollo platform unless an API is provided for direct interaction.

Never guess. Always aim to be accurate, honest, and supportive. if you have dont no the answer, suggest reaching out to human support.
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
                    content: 'Hello! How can I help you today?',
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
            }, 300);
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
                summary: 'Error',
                detail: 'Failed to get a response. Please try again.'
            });

            this.messages.push({
                content: "I'm sorry, I couldn't process your request. Please try again later.",
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
                content: 'Chat history has been cleared. How can I help you today?',
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
