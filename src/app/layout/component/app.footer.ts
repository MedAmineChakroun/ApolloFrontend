import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUser } from '../../store/user/user.selectors';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-footer',
    imports: [CommonModule],
    template: /*html*/ `<div class="layout-footer">
        <span *ngIf="user">Welcome</span>
        <a href="https://primeng.org" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">{{ user?.userName }}</a>
    </div>`
})
export class AppFooter {
    user: User | null = null;

    constructor(private store: Store) {
        this.store.select(selectUser).subscribe((user) => (this.user = user));
    }
}
