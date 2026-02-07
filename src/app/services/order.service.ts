import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/Order';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private baseUrl = 'http://localhost:5041/api/Ordenes';

    constructor(private http: HttpClient) { }

    // Obtener todas las órdenes activas (no canceladas)
    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.baseUrl);
    }

    // Obtener orden por ID
    getOrderById(id: number | string): Observable<Order> {
        return this.http.get<Order>(`${this.baseUrl}/${id}`);
    }

    // Crear nueva orden
    createOrder(order: Order): Observable<Order> {
        return this.http.post<Order>(this.baseUrl, order);
    }

    // Actualizar orden existente
    updateOrder(order: Order): Observable<Order> {
        return this.http.put<Order>(`${this.baseUrl}/${order.ordenID}`, order);
    }

    // Eliminar orden (eliminación física - solo administradores)
    deleteOrder(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    // Cancelar orden (eliminación lógica - cambia estado a "Cancelado")
    cancelOrder(id: number | string): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/cancel/${id}`, {});
    }

    // Buscar órdenes con múltiples filtros
    searchOrders(
        search?: string, 
        usuarioID?: number, 
        servicioID?: number, 
        estado?: string,
        fechaInicio?: string,
        fechaFin?: string
    ): Observable<Order[]> {
        let params = new HttpParams();
        
        if (search) {
            params = params.set('search', search);
        }
        if (usuarioID) {
            params = params.set('usuarioID', usuarioID.toString());
        }
        if (servicioID) {
            params = params.set('servicioID', servicioID.toString());
        }
        if (estado) {
            params = params.set('estado', estado);
        }
        if (fechaInicio) {
            params = params.set('fechaInicio', fechaInicio);
        }
        if (fechaFin) {
            params = params.set('fechaFin', fechaFin);
        }

        return this.http.get<Order[]>(`${this.baseUrl}/search`, { params });
    }

    // Obtener órdenes de un usuario específico
    getOrdersByUserId(usuarioID: number): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.baseUrl}/byuser/${usuarioID}`);
    }

    // Obtener órdenes de un servicio específico
    getOrdersByServiceId(servicioID: number): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.baseUrl}/byservice/${servicioID}`);
    }

    // Actualizar estado de una orden
    updateOrderStatus(id: number, estado: string): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/updatestatus/${id}`, { estado });
    }

    // Obtener estadísticas de órdenes (solo administradores)
    getStatistics(): Observable<any> {
        return this.http.get(`${this.baseUrl}/statistics`);
    }
}


