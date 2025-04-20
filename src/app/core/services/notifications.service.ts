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

    // Mark all notifications as read (we'll need to add this to the backend)
    markAllAsRead(tiersCode: number): Observable<any> {
        // This would need to be implemented on the backend
        // For now, we'll mark each notification as read individually
        const unreadNotifications = this.notificationsSubject.value.filter((n) => !n.isRead);

        // This is just a placeholder - you would need to implement this endpoint on the backend
        console.warn('markAllAsRead is not implemented on the backend');

        // Update local state
        const updatedNotifications = this.notificationsSubject.value.map((n) => ({ ...n, isRead: true }));
        this.notificationsSubject.next(updatedNotifications);
        this.updateUnreadCount(updatedNotifications);

        // Return an observable that completes successfully
        return new Observable((observer) => {
            observer.next(true);
            observer.complete();
        });
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
