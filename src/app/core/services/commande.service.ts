import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DocumentVenteLigne } from '../../models/DocumentVenteLigne';
import { DocLigneDto } from '../../models/Dtos/DocLigneDto';
import { Observable } from 'rxjs';
import { DocumentVente } from '../../models/DocumentVente';
import { DocVenteDto } from '../../models/Dtos/DocVenteDto';

@Injectable({
    providedIn: 'root'
})
export class CommandeService {
    private apiUrl = 'https://localhost:7257/api/DocumentVente';
    private apiUrlLigneCommande = 'https://localhost:7257/api/DocumentVenteLigne';
    constructor(private http: HttpClient) {}
    //pour Doc Commande
    getDocumentVente(): Observable<DocumentVente[]> {
        return this.http.get<DocumentVente[]>(this.apiUrl);
    }
    getDocumentVenteByTiersCode(tiersCode: string): Observable<DocumentVente[]> {
        return this.http.get<DocumentVente[]>(`${this.apiUrl}/client/${tiersCode}`);
    }
    createDocumentVente(docVenteDto: DocVenteDto): Observable<DocumentVente> {
        return this.http.post<DocumentVente>(`${this.apiUrl}/create`, docVenteDto);
    }
    getDocumentVenteByDocPiece(docPiece: string): Observable<DocumentVente> {
        return this.http.get<DocumentVente>(`${this.apiUrl}/piece/${docPiece}`);
    }
    //pour Doc Ligne Commande
    getLignesCommandeParDocPiece(docPiece: string): Observable<DocumentVenteLigne[]> {
        return this.http.get<DocumentVenteLigne[]>(`${this.apiUrlLigneCommande}/piece/${docPiece}`);
    }
    createDocumentventeLigne(docLigneDto: DocLigneDto) {
        return this.http.post<DocumentVenteLigne>(`${this.apiUrlLigneCommande}/create`, docLigneDto);
    }
    getNbLigneCommandeParDocPiece(docPiece: string): Observable<number> {
        return this.http.get<number>(`${this.apiUrlLigneCommande}/piece/nb/${docPiece}`);
    }
}
