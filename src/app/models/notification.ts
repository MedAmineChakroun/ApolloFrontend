export interface Notification {
    id: number;
    tiersCode: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    type: string;
}
