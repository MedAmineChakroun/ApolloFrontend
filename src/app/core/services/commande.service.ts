import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DocumentVenteLigne } from '../../models/DocumentVenteLigne';
import { DocLigneDto } from '../../models/Dtos/DocLigneDto';
import { firstValueFrom, Observable } from 'rxjs';
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
    getNbDocumentVente(): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/count`);
    }
    getNbDocumentVenteThisWeek(): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/count/thisWeek`);
    }
    deleteDocumentVente(int: number) {
        return this.http.delete(`${this.apiUrl}/${int}`);
    }
    updateEtatDocument(id: number, etat: number, note: string) {
        return this.http.patch(`${this.apiUrl}/updateEtat/${id}?etat=${etat}&note=${note}`, null);
    }
    updateFlagDocument(id: number, flag: number) {
        return this.http.patch(`${this.apiUrl}/updateFlag/${id}?flag=${flag}`, null);
    }
    //pour Doc Ligne Commande-------------------------------------
    getLignesCommandeParDocPiece(docPiece: string): Observable<DocumentVenteLigne[]> {
        return this.http.get<DocumentVenteLigne[]>(`${this.apiUrlLigneCommande}/piece/${docPiece}`);
    }
    createDocumentventeLigne(docLigneDto: DocLigneDto) {
        return this.http.post<DocumentVenteLigne>(`${this.apiUrlLigneCommande}/create`, docLigneDto);
    }
    getNbLigneCommandeParDocPiece(docPiece: string): Observable<number> {
        return this.http.get<number>(`${this.apiUrlLigneCommande}/piece/nb/${docPiece}`);
    }
    getNbLigneCommande(): Observable<number> {
        return this.http.get<number>(`${this.apiUrlLigneCommande}/count`);
    }
    getTopLignesCommande(): Observable<DocumentVenteLigne[]> {
        return this.http.get<DocumentVenteLigne[]>(`${this.apiUrlLigneCommande}/top`);
    }
    getLignesCommande(): Observable<DocumentVenteLigne[]> {
        return this.http.get<DocumentVenteLigne[]>(`${this.apiUrlLigneCommande}`);
    }
    getDocumentVenteLignesByDocPiece(docPiece: string): Observable<DocumentVenteLigne[]> {
        return this.http.get<DocumentVenteLigne[]>(`${this.apiUrlLigneCommande}/piece/${docPiece}`);
    }

    // Mettre à jour une commande
    updateDocumentVente(commande: DocumentVente): Observable<DocumentVente> {
        return this.http.put<DocumentVente>(`${this.apiUrl}/${commande.docId}`, commande);
    }

    // Mettre à jour une ligne de commande
    updateDocumentVenteLigne(ligne: DocumentVenteLigne): Observable<DocumentVenteLigne> {
        return this.http.put<DocumentVenteLigne>(`${this.apiUrlLigneCommande}/${ligne.ligneId}`, ligne);
    }

    // Supprimer une ligne de commande
    deleteDocumentVenteLigne(ligneId: number): Observable<any> {
        return this.http.delete(`${this.apiUrlLigneCommande}/${ligneId}`);
    }

    // Pour supporter toPromise() dans Angular moderne
    toPromise<T>(observable: Observable<T>): Promise<T> {
        return firstValueFrom(observable);
    }
    isProductPurshased(TiersCode: string, artCode: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/isProductPurshased/${TiersCode}/${artCode}`);
    }
    hasOrders(tiersCode: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/hasOrders/${tiersCode}`);
    }
    hasOrdersForArticles(artCode: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/hasOrdersForArticles/${artCode}`);
    }
}
