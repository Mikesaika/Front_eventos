import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface NotificationData {
    message: string;
    type: 'success' | 'error' | 'info';
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationSubject = new Subject<NotificationData | null>();
    notification$ = this.notificationSubject.asObservable();

    /**
    
     * @param message El texto que se muestra en el mensaje
     * @param type Diseño de la alerta  ('success' | 'error' | 'info')
     */
    show(message: string, type: 'success' | 'error' | 'info' = 'success') {
        this.notificationSubject.next({ message, type });

        setTimeout(() => this.clear(), 4000);
    }
    clear() {
        this.notificationSubject.next(null);
    }
}