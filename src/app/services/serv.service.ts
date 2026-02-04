import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../models/Service';
import { Category } from '../models/Category';
import { Company } from '../models/Company';
import { Order } from '../models/Order';

@Injectable({
    providedIn: 'root',
})
export class ServEventosJson {
    // Sincronizado con el simulador json-server en puerto 5001 y prefijo api
    private baseUrl = 'http://localhost:5001/api';

    // Endpoints con nombres de tablas de SQL Server (PascalCase)
    private servicesUrl = `${this.baseUrl}/Servicios`;
    private categoriesUrl = `${this.baseUrl}/Categorias`;
    private companiesUrl = `${this.baseUrl}/Empresas`;
    private ordersUrl = `${this.baseUrl}/Ordenes`;

    constructor(private http: HttpClient) { }

    // --- SERVICES (SERVICIOS) ---
    getServices(): Observable<Service[]> {
        return this.http.get<Service[]>(this.servicesUrl);
    }

    getServiceById(id: number | string): Observable<Service> {
        return this.http.get<Service>(`${this.servicesUrl}/${id}`);
    }

    createService(service: Service): Observable<Service> {
        return this.http.post<Service>(this.servicesUrl, service);
    }

    updateService(service: Service): Observable<Service> {
        // Usamos servicioID que es la PK en SQL Server
        const url = `${this.servicesUrl}/${service.servicioID}`;
        return this.http.put<Service>(url, service);
    }

    deleteService(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.servicesUrl}/${id}`);
    }

    // --- CATEGORIES (CATEGORÍAS) ---
    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.categoriesUrl);
    }

    // --- COMPANIES (EMPRESAS) ---
    getCompanies(): Observable<Company[]> {
        return this.http.get<Company[]>(this.companiesUrl);
    }

    // --- ORDERS (ORDENES) ---
    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.ordersUrl);
    }
}