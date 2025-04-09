import { Routes } from '@angular/router';
import { FaqComponent } from './faq/faq.component';
import { ContactComponent } from './contact/contact.component';
export default [
    {
        path: 'faqs',
        component: FaqComponent
    },
    {
        path: 'contact',
        component: ContactComponent
    }
] as Routes;
