import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/Order';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private baseUrl = 'http://localhost:5001/api/Ordenes';

    constructor(private http: HttpClient) { }
    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.baseUrl);
    }

    getOrderById(id: number | string): Observable<Order> {
        return this.http.get<Order>(`${this.baseUrl}/${id}`);
    }

    createOrder(order: Order): Observable<Order> {
        return this.http.post<Order>(this.baseUrl, order);
    }

    updateOrder(order: Order): Observable<Order> {
        return this.http.put<Order>(`${this.baseUrl}/${order.ordenID}`, order);
    }

    deleteOrder(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
    
    getOrdersByUserId(usuarioID: number): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.baseUrl}?usuarioID=${usuarioID}`);
    }

    getOrdersByServiceId(servicioID: number): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.baseUrl}?servicioID=${servicioID}`);
    }

    getActiveOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.baseUrl}?activo=true`);
    }
    getOrdersByDateRange(startDate: string, endDate: string): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.baseUrl}?fechaEvento_gte=${startDate}&fechaEvento_lte=${endDate}`);
    }
}