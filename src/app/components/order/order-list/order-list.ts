import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass, CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { Order, isActive, isPending, isApproved, isFinished, isCancelled } from '../../../models/Order';
import { User } from '../../../models/User';
import { Service } from '../../../models/Service';
import { OrderService } from '../../../services/order.service';
import { UserService } from '../../../services/user.service';
import { ServEventosJson } from '../../../services/serv.service';
import { NotificationComponent } from '../../../shared/notification/notification';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule, NgIf, NgFor, NgClass, 
    CurrencyPipe, DatePipe, NotificationComponent
  ],
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.css']
})
export class OrderList implements OnInit {
  orders: Order[] = [];
  allOrders: Order[] = [];
  filteredOrders: Order[] = [];
  users: User[] = [];
  services: Service[] = [];
  loading: boolean = true;

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private miServicio: ServEventosJson
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      orders: this.orderService.getOrders(),
      users: this.userService.getUsers(),
      services: this.miServicio.getServices()
    }).subscribe({
      next: (response) => {
        this.users = response.users;
        this.services = response.services;
        this.orders = response.orders;
        this.allOrders = [...response.orders];
        this.filteredOrders = [...response.orders];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getUserName(id: any): string {
    const user = this.users.find(u => Number(u.usuarioID) === Number(id));
    return user ? user.nombre : 'Usuario no encontrado';
  }

  getUserEmail(id: any): string {
    const user = this.users.find(u => Number(u.usuarioID) === Number(id));
    return user ? user.email : 'N/A';
  }

  getServiceName(id: any): string {
    const service = this.services.find(s => Number(s.servicioID) === Number(id));
    return service ? service.nombre : 'Servicio no encontrado';
  }

  getServiceDescription(id: any): string {
    const service = this.services.find(s => Number(s.servicioID) === Number(id));
    return service ? service.descripcion : 'N/A';
  }

  search(input: HTMLInputElement) {
    const term = input.value.toLowerCase().trim();
    if (!term) {
      this.filteredOrders = [...this.orders];
      return;
    }
    this.filteredOrders = this.orders.filter(o =>
      this.getUserName(o.usuarioID).toLowerCase().includes(term) ||
      this.getServiceName(o.servicioID).toLowerCase().includes(term) ||
      (o.observaciones && o.observaciones.toLowerCase().includes(term)) ||
      o.precioTotal.toString().includes(term)
    );
  }

  // Métodos para verificar el estado de los pedidos
  isActive(order: Order): boolean {
    return isActive(order);
  }

  isPending(order: Order): boolean {
    return isPending(order);
  }

  isApproved(order: Order): boolean {
    return isApproved(order);
  }

  isFinished(order: Order): boolean {
    return isFinished(order);
  }

  isCancelled(order: Order): boolean {
    return isCancelled(order);
  }

}
