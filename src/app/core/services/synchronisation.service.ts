import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class SynchronisationService {
    private apiUrl = 'https://localhost:7257/api/SynchronisationSage';

    constructor(private http: HttpClient) {}

    // sync-commande
    syncCommandes() {
        return this.http.post(`${this.apiUrl}/sync-commande`, {});
    }
    // sync-article
    syncArticle(CodeArt: string) {
        return this.http.post(`${this.apiUrl}/sync-Article`, null, { params: { CodeArt } });
    }
    // sync-client
    syncClient(CodeClient: string) {
        return this.http.post(`${this.apiUrl}/sync-Client`, null, { params: { CodeClient } });
    }
    // delete-article
    deleteArticle(CodeArticle: string) {
        return this.http.post(`${this.apiUrl}/Delete-Article`, null, { params: { CodeArticle } });
    }
    // delete-client
    deleteClient(CodeClient: string) {
        return this.http.post(`${this.apiUrl}/Delete-Client`, null, { params: { CodeClient } });
    }
    // delete-commande
    deleteCommande(NumCommande: string) {
        return this.http.post(`${this.apiUrl}/Delete-Commande`, null, { params: { NumCommande } });
    }
}
