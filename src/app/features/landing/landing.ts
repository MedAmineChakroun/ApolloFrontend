import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import * as AOS from 'aos';
import 'aos/dist/aos.css';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TopbarWidget } from './components/topbarwidget.component';
import { HeroWidget } from './components/herowidget';
import { FeaturesWidget } from './components/featureswidget';
import { HighlightsWidget } from './components/highlightswidget';
import { FooterWidget } from './components/footerwidget';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterModule, TopbarWidget, HeroWidget, FeaturesWidget, HighlightsWidget, FooterWidget, RippleModule, StyleClassModule, ButtonModule, DividerModule],
    template: /*html*/ `
        <div class="bg-surface-0 dark:bg-surface-900">
            <div id="home" class="landing-wrapper overflow-hidden">
                <topbar-widget class="px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static" />

                <hero-widget class="animate-shine" data-aos="zoom-in" data-aos-duration="1200" data-aos-easing="ease-out-cubic" data-aos-delay="400" />

                <features-widget />

                <highlights-widget />

                <footer-widget class="animate-shine" data-aos="fade-up" data-aos-duration="800" data-aos-easing="ease-out-cubic" data-aos-delay="400" />
            </div>

            <!-- Scroll to Top Button -->
            <button
                (click)="scrollToTop()"
                [class.opacity-100]="showScrollButton"
                [class.opacity-0]="!showScrollButton"
                [class.pointer-events-auto]="showScrollButton"
                [class.pointer-events-none]="!showScrollButton"
                class="fixed bottom-8 right-8 bg-primary-500 text-white p-3 rounded-full shadow-lg hover:bg-primary-600 transition-all duration-300 z-[9999]"
                aria-label="Scroll to top"
            >
                <i class="pi pi-arrow-up text-xl"></i>
            </button>
        </div>
    `,
    styles: [
        `
            .landing-wrapper {
                position: relative;
            }
            [data-aos] {
                pointer-events: none;
            }
            [data-aos].aos-animate {
                pointer-events: auto;
            }
            /* Custom animation classes */
            .animate-float {
                animation: float 3s ease-in-out infinite;
            }
            .animate-pulse-slow {
                animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            .animate-shine {
                position: relative;
                overflow: hidden;
            }
            .animate-shine::after {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0) 100%);
                transform: rotate(45deg);
                animation: shine 3s infinite;
            }
            @keyframes float {
                0% {
                    transform: translateY(0px);
                }
                50% {
                    transform: translateY(-20px);
                }
                100% {
                    transform: translateY(0px);
                }
            }
            @keyframes pulse {
                0%,
                100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.5;
                }
            }
            @keyframes shine {
                0% {
                    transform: translateX(-100%) rotate(45deg);
                }
                100% {
                    transform: translateX(100%) rotate(45deg);
                }
            }
        `
    ]
})
export class Landing implements OnInit, AfterViewInit {
    showScrollButton = false;

    constructor(private router: Router) {}

    ngOnInit() {
        // Initialize AOS with enhanced settings
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
            disable: 'mobile',
            startEvent: 'load',
            mirror: false,
            anchorPlacement: 'top-bottom',
            easing: 'ease-out-cubic'
        });
    }

    ngAfterViewInit() {
        // Refresh AOS after view is initialized
        AOS.refresh();
    }

    @HostListener('window:scroll')
    onWindowScroll() {
        // Show button when user scrolls down 100px
        this.showScrollButton = window.scrollY > 100;
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    navigateToDashboard() {
        this.router.navigate(['/dashboard']);
    }
}
