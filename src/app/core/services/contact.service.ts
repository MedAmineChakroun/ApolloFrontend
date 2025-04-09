import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Contact } from '../../models/Contact';
@Injectable({
    providedIn: 'root'
})
export class ContactService {
    constructor(private http: HttpClient) {}
    sendEmail(contact: Contact) {
        return this.http.post('https://localhost:7257/api/Contact', contact);
    }
}
