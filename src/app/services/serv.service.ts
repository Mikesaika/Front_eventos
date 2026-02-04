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
    private baseUrl = 'http://localhost:5001/api';
    private servicesUrl = `${this.baseUrl}/Servicios`;
    private categoriesUrl = `${this.baseUrl}/Categorias`;
    private companiesUrl = `${this.baseUrl}/Empresas`;
    private ordersUrl = `${this.baseUrl}/Ordenes`;

    constructor(private http: HttpClient) { }
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
        const url = `${this.servicesUrl}/${service.servicioID}`;
        return this.http.put<Service>(url, service);
    }

    deleteService(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.servicesUrl}/${id}`);
    }

    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.categoriesUrl);
    }

    getCompanies(): Observable<Company[]> {
        return this.http.get<Company[]>(this.companiesUrl);
    }
    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.ordersUrl);
    }
}