import { Component, OnInit } from '@angular/core';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';

@Component({
    selector: 'highlights-widget',
    template: `
        <div class="py-6 px-6 lg:px-20 mx-0 my-12 lg:mx-20">
            <div class="text-center" [@fadeInUp]>
                <div class="text-surface-900 dark:text-surface-0 font-bold mb-2 text-5xl bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Expériences Exceptionnelles</div>
                <span class="text-muted-color text-2xl">Découvrez nos deux expériences uniques</span>
            </div>

            <!-- Première Expérience -->
            <div class="grid grid-cols-12 gap-4 mt-20 pb-2 md:pb-20" [@slideInLeft]>
                <div class="flex justify-center col-span-12 lg:col-span-6 bg-gradient-to-br from-purple-100 to-blue-100 p-0 order-1 lg:order-none transform hover:scale-101 transition-transform duration-300" style="border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1)">
                    <img src="assets/general/pic11.png" class="w-11/12" alt="Expérience Utilisateur" />
                </div>

                <div class="col-span-12 lg:col-span-6 my-auto flex flex-col lg:items-end text-center lg:text-right gap-4">
                    <div class="flex items-center justify-center bg-gradient-to-r from-purple-400 to-blue-400 self-center lg:self-end transform hover:rotate-12 transition-transform duration-300" style="width: 4.2rem; height: 4.2rem; border-radius: 16px">
                        <i class="pi pi-fw pi-user !text-4xl text-white"></i>
                    </div>
                    <div class="leading-none text-surface-900 dark:text-surface-0 text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Expérience Utilisateur</div>
                    <span class="text-surface-700 dark:text-surface-100 text-2xl leading-normal ml-0 md:ml-2" style="max-width: 650px"
                        >Une interface intuitive et élégante qui s'adapte à vos besoins. Profitez d'une navigation fluide et d'un design moderne qui rend chaque interaction agréable et efficace.</span
                    >
                </div>
            </div>

            <!-- Deuxième Expérience -->
            <div class="grid grid-cols-12 gap-4 my-20 pt-2 md:pt-20" [@slideInRight]>
                <div class="col-span-12 lg:col-span-6 flex flex-col justify-center">
                    <div class="flex justify-center bg-gradient-to-br from-yellow-100 to-orange-100 p-0 transform hover:scale-101 transition-transform duration-300" style="border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1)">
                        <img src="assets/general/pic21.png" class="w-11/12" alt="Expérience Intelligente" />
                    </div>
                </div>

                <div class="col-span-12 lg:col-span-6 my-auto flex flex-col text-center lg:text-left gap-4">
                    <div class="flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-400 self-center lg:self-start transform hover:rotate-12 transition-transform duration-300" style="width: 4.2rem; height: 4.2rem; border-radius: 16px">
                        <i class="pi pi-fw pi-bolt !text-3xl text-white"></i>
                    </div>
                    <div class="leading-none text-surface-900 dark:text-surface-0 text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent">Expérience Intelligente</div>
                    <span class="text-surface-700 dark:text-surface-100 text-2xl leading-normal mr-0 md:mr-2" style="max-width: 650px"
                        >Une expérience enrichie par l'intelligence artificielle qui anticipe vos besoins. Bénéficiez de recommandations personnalisées et d'une assistance intelligente en temps réel.</span
                    >
                </div>
            </div>
        </div>
    `,
    animations: [
        trigger('fadeInUp', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('slideInLeft', [
            transition(':enter', [
                query('.col-span-12', [
                    style({ opacity: 0, transform: 'translateX(-50px)' }),
                    stagger(200, [
                        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
                    ])
                ])
            ])
        ]),
        trigger('slideInRight', [
            transition(':enter', [
                query('.col-span-12', [
                    style({ opacity: 0, transform: 'translateX(50px)' }),
                    stagger(200, [
                        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
                    ])
                ])
            ])
        ])
    ]
})
export class HighlightsWidget implements OnInit {
    ngOnInit() {
        // Add scroll animation trigger with enhanced options
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    // Add a slight delay for staggered animations
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, 100);
                }
            });
        }, {
            threshold: 0.2, // Trigger when 20% of the element is visible
            rootMargin: '0px 0px -50px 0px' // Start animation slightly before element comes into view
        });

        document.querySelectorAll('.grid').forEach((el) => observer.observe(el));
    }
}
