import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUser } from '../../store/user/user.selectors';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-footer',
    imports: [CommonModule],
    template: /*html*/ `<div class="layout-footer">
        <span *ngIf="ClientName !== ''">Welcome</span>

        <a href="https://primeng.org" target="_blank" rel="noopener noreferrer" class="text-color">{{ ClientName }}</a>
    </div>`
})
export class AppFooter {
    ClientName: string = '';

    constructor(private store: Store) {
        this.store.select(selectUser).subscribe((client) => {
            this.ClientName = client?.tiersIntitule || '';
        });
    }
}
