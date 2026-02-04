import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../models/User';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Sincronizado con json-server (puerto 5001) y el prefijo de tu API
  private apiUrl = 'http://localhost:5001/api/Usuarios';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError(error => this.handleError(error, 'Error al cargar usuarios desde SQL'))
    );
  }

  getUserById(id: number | string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => this.handleError(error, 'Error al obtener datos del usuario'))
    );
  }

  // Usamos Partial<User> para permitir la creación sin ID
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap(() => this.notificationService.show('Usuario registrado exitosamente', 'success')),
      catchError(error => this.handleError(error, 'Error al crear usuario'))
    );
  }

  updateUser(id: number | string, user: User): Observable<User> {
    // Usamos el ID pasado por parámetro para la URL del simulador
    return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
      tap(() => this.notificationService.show('Datos actualizados en SQL', 'success')),
      catchError(error => this.handleError(error, 'Error al actualizar usuario'))
    );
  }

  deleteUser(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.notificationService.show('Registro eliminado', 'info')),
      catchError(error => this.handleError(error, 'Error al eliminar usuario'))
    );
  }

  // Manejador de errores centralizado con tu NotificationService
  private handleError(error: HttpErrorResponse, message: string) {
    console.error('API Error:', error);
    this.notificationService.show(message, 'error');
    return throwError(() => new Error(message));
  }
}