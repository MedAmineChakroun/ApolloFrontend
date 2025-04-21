import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Notification } from '../../models/notification';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private apiUrl = 'https://localhost:7257/api/Notification';
    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    private unreadCountSubject = new BehaviorSubject<number>(0);

    constructor(private http: HttpClient) {}

    // Get all notifications for a user
    getNotifications(tiersCode: string): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.apiUrl}/${tiersCode}`).pipe(
            tap((notifications) => {
                this.notificationsSubject.next(notifications);
                this.updateUnreadCount(notifications);
            })
        );
    }

    // Get all unread notifications for a user
    getUnreadNotifications(tiersCode: string): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.apiUrl}/unread/${tiersCode}`).pipe(
            tap((notifications) => {
                // We don't update notificationsSubject here since these are only unread ones
                this.updateUnreadCount(notifications);
            })
        );
    }

    // Mark a notification as read
    markAsRead(id: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/read/${id}`, {}).pipe(
            tap(() => {
                // Update the read status in our local cache
                const currentNotifications = this.notificationsSubject.value;
                const updatedNotifications = currentNotifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
                this.notificationsSubject.next(updatedNotifications);
                this.updateUnreadCount(updatedNotifications);
            })
        );
    }

    // Get the current notifications as an observable
    getCurrentNotifications(): Observable<Notification[]> {
        return this.notificationsSubject.asObservable();
    }

    // Get the unread count as an observable
    getUnreadCount(): Observable<number> {
        return this.unreadCountSubject.asObservable();
    }

    // Update the unread count based on notifications
    private updateUnreadCount(notifications: Notification[]): void {
        const unreadCount = notifications.filter((n) => !n.isRead).length;
        this.unreadCountSubject.next(unreadCount);
    }
}
