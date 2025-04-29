export interface Product {
    artId: number;
    artCode: string;
    artIntitule: string;
    artFamille: string;
    artPrixVente: number;
    artPrixAchat: number;
    //stock 0/1
    artEtat: number;
    artUnite: string;
    artImageUrl: string;
    artTvaTaux: number;
    artFlag: number;
    artDateCreate: Date;
}
