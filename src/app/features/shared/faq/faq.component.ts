import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-faq',
    standalone: true,
    imports: [CommonModule, ButtonModule],
    templateUrl: './faq.component.html',
    styleUrl: './faq.component.css'
})
export class FaqComponent {
    faqs = [
        {
            header: 'What products does Apollo Store offer?',
            content: "Apollo Store offers a wide range of products including electronics, clothing, accessories, home goods, and more. Our catalog is constantly expanding to meet our customers' diverse needs."
        },
        {
            header: 'How do I create an account?',
            content: 'Creating an account is simple! Click on the "Register" button in the top navigation bar, fill in your personal details, create a password, and submit the form. You\'ll receive a confirmation email to verify your account.'
        },
        {
            header: 'What are the shipping options and delivery timeframes?',
            content: 'We offer standard shipping (3-5 business days), express shipping (1-2 business days), and same-day delivery for select areas. Shipping costs and available options will be displayed during checkout based on your location.'
        },
        {
            header: 'What is your return policy?',
            content:
                'We accept returns within 30 days of purchase for most items in their original condition. Some products may have special return conditions that will be noted on the product page. To initiate a return, please go to your order history and select the "Return" option.'
        },
        {
            header: 'How can I track my order?',
            content: 'Once your order ships, you\'ll receive a confirmation email with tracking information. You can also view your order status and tracking details by logging into your account and visiting the "Order History" section.'
        },
        {
            header: 'Do you ship internationally?',
            content: 'Yes, we ship to most countries worldwide. International shipping rates and delivery timeframes vary by location. These details will be calculated during checkout based on your shipping address.'
        },
        {
            header: 'How do I contact customer support?',
            content: 'Our customer support team is available through multiple channels: email at support@apollostore.com, live chat on our website, or by phone at 1-800-APOLLO-1 during business hours (Monday-Friday, 9 AM-6 PM EST).'
        },
        {
            header: 'Are there any discounts or loyalty programs?',
            content:
                'Yes! We offer seasonal promotions, new customer discounts, and an Apollo Rewards program. Join our mailing list to stay updated on special offers, and create an account to automatically enroll in our loyalty program to earn points on every purchase.'
        }
    ];
}
