import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'footer-widget',
    template: /*html*/ `
        <footer class="bg-black text-white">
            <div class="container mx-auto px-8 py-12">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <!-- Company Info -->
                    <div>
                        <h3 class="text-2xl font-bold mb-4 text-white">Apollo</h3>
                        <p class="text-gray-400 text-sm mb-4">Your trusted partner in e-commerce solutions.</p>
                        <div class="flex space-x-4">
                            <a href="#" class="text-gray-400 hover:text-white transition duration-300">
                                <i class="pi pi-facebook text-xl"></i>
                            </a>
                            <a href="#" class="text-gray-400 hover:text-white transition duration-300">
                                <i class="pi pi-instagram text-xl"></i>
                            </a>
                            <a href="#" class="text-gray-400 hover:text-white transition duration-300">
                                <i class="pi pi-linkedin text-xl"></i>
                            </a>
                        </div>
                    </div>

                    <!-- Quick Links -->
                    <div>
                        <h4 class="text-lg font-semibold mb-4 text-white">Quick Links</h4>
                        <ul class="space-y-2">
                            <li><a routerLink="/products" class="text-gray-400 hover:text-white transition duration-300">Products</a></li>
                            <li><a routerLink="/services" class="text-gray-400 hover:text-white transition duration-300">Services</a></li>
                            <li><a routerLink="/solutions" class="text-gray-400 hover:text-white transition duration-300">Solutions</a></li>
                        </ul>
                    </div>

                    <!-- Support -->
                    <div>
                        <h4 class="text-lg font-semibold mb-4 text-white">Support</h4>
                        <ul class="space-y-2">
                            <li><a routerLink="/help" class="text-gray-400 hover:text-white transition duration-300">Help Center</a></li>
                            <li><a routerLink="/documentation" class="text-gray-400 hover:text-white transition duration-300">Documentation</a></li>
                            <li><a routerLink="/contact" class="text-gray-400 hover:text-white transition duration-300">Contact Us</a></li>
                        </ul>
                    </div>

                    <!-- Contact Info -->
                    <div>
                        <h4 class="text-lg font-semibold mb-4 text-white">Contact</h4>
                        <ul class="space-y-2 text-gray-400">
                            <li class="flex items-center">
                                <i class="pi pi-map-marker mr-2"></i>
                                <span>123 Business Street</span>
                            </li>
                            <li class="flex items-center">
                                <i class="pi pi-phone mr-2"></i>
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li class="flex items-center">
                                <i class="pi pi-envelope mr-2"></i>
                                <span>supportapollo.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Bottom Bar -->
                <div class="mt-12 pt-8 border-t border-gray-800">
                    <div class="flex flex-col md:flex-row justify-between items-center">
                        <div class="text-gray-400 text-sm mb-4 md:mb-0">&copy; 2024 Apollo. All rights reserved.</div>
                        <div class="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
                            <a routerLink="/privacy" class="text-gray-400 hover:text-white transition duration-300">Privacy Policy</a>
                            <a routerLink="/terms" class="text-gray-400 hover:text-white transition duration-300">Terms of Service</a>
                            <a routerLink="/about" class="text-gray-400 hover:text-white transition duration-300">About Us</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    `
})
export class FooterWidget {
    constructor(public router: Router) {}
}
