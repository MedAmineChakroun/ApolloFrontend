// signalr.service.ts
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Notification } from '../../models/notification';
import { BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class SignalRService {
    private hubConnection!: signalR.HubConnection;
    private notificationSubject = new BehaviorSubject<Notification | null>(null);
    notification$ = this.notificationSubject.asObservable();
    token = localStorage.getItem('jwtToken');
    startConnection(tiersCode: string) {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`https://localhost:7257/notificationHub?tiersCode=${tiersCode}`, {
                transport: signalR.HttpTransportType.WebSockets
            })
            .build();

        this.hubConnection
            .start()
            .then(() => {
                console.log('SignalR Connected');
            })
            .catch((err) => console.error('SignalR Connection Error:', err));

        this.hubConnection.on('ReceiveNotification', (notification: Notification) => {
            this.notificationSubject.next(notification);
        });
    }

    stopConnection() {
        this.hubConnection?.stop();
    }
}
