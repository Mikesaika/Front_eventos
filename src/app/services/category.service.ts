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

  // Obtener todas las categorías
  list(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }

  // Obtener una categoría específica por su PK (categoriaID)
  get(id: number | string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  // Crear una nueva categoría en SQL Server / Simulador
  create(category: Category): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category);
  }

  // Actualizar categoría existente usando su identificador de base de datos
  update(id: number | string, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, category);
  }

  // Eliminar un registro de categoría
  delete(id: number | string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}