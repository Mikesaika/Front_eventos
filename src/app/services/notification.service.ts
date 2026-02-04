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
    // Usamos Subject para emitir alertas en tiempo real en cualquier componente
    private notificationSubject = new Subject<NotificationData | null>();
    
    // El componente 'NotificationComponent' se suscribirá a este observable
    notification$ = this.notificationSubject.asObservable();

    /**
     * Muestra una alerta en pantalla
     * @param message El texto a mostrar (ej: 'Usuario guardado en SQL')
     * @param type El estilo visual de la alerta
     */
    show(message: string, type: 'success' | 'error' | 'info' = 'success') {
        this.notificationSubject.next({ message, type });
        
        // Auto-limpieza opcional: oculta la notificación después de 4 segundos
        setTimeout(() => this.clear(), 4000);
    }

    /**
     * Limpia la notificación actual
     */
    clear() {
        this.notificationSubject.next(null);
    }
}