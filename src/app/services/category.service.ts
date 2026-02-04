import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/Category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = 'http://localhost:5001/api/Categorias';
  constructor(private http: HttpClient) { }
  list(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }
  get(id: number | string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }
  create(category: Category): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category);
  }
  update(id: number | string, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, category);
  }
  delete(id: number | string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}