import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf, NgClass, CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Order } from '../../../models/Order';
import { User } from '../../../models/User';
import { Service } from '../../../models/Service';

// Servicios
import { OrderService } from '../../../services/order.service';
import { UserService } from '../../../services/user.service';
import { ServEventosJson } from '../../../services/serv.service';
import { NotificationService } from '../../../services/notification.service';
import { NotificationComponent } from '../../../shared/notification/notification';
import { Dialog } from '../../../shared/dialog/dialog';

declare const bootstrap: any;

@Component({
  selector: 'app-order-crud',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, NgIf, NgFor,
    NgClass, CurrencyPipe, DatePipe, NotificationComponent
  ],
  templateUrl: './order-crud.html',
  styleUrls: ['./order-crud.css']
})
export class OrderCrud implements OnInit, AfterViewInit {
  orders: Order[] = [];
  allOrders: Order[] = [];
  users: User[] = [];
  services: Service[] = [];

  formOrder!: FormGroup;
  editingId: number | null = null;
  modalRef: any;
  @ViewChild('orderModalRef') modalElement!: ElementRef;

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private miServicio: ServEventosJson,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private notify: NotificationService 
  ) {
    this.formOrder = this.fb.group({
      usuarioID: ['', [Validators.required]],
      servicioID: ['', [Validators.required]],
      fechaEvento: ['', [Validators.required]],
      precioTotal: [0, [Validators.required, Validators.min(0)]],
      estado: ['Pendiente'],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit() {
    if (typeof bootstrap !== 'undefined') {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  loadData(): void {
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
      },
      error: () => this.notify.show('Error al sincronizar datos con SQL', 'error')
    });
  }

  getUserName(id: any): string {
    const user = this.users.find(u => Number(u.usuarioID) === Number(id));
    return user ? user.nombre : 'Usuario no encontrado';
  }

  getServiceName(id: any): string {
    const service = this.services.find(s => Number(s.servicioID) === Number(id));
    return service ? service.nombre : 'Servicio no encontrado';
  }

  onServiceChange() {
    const serviceId = this.formOrder.get('servicioID')?.value;
    const service = this.services.find(s => Number(s.servicioID) === Number(serviceId));
    if (service) {
      this.formOrder.patchValue({ precioTotal: service.precio });
    }
  }

  openNew() {
    this.editingId = null;
    this.formOrder.reset({ activo: true, precioTotal: 0, estado: 'Pendiente' });
    this.modalRef.show();
  }

  openEdit(order: Order) {
    this.editingId = order.ordenID || null;
    this.formOrder.patchValue(order);
    this.modalRef.show();
  }

  save() {
    if (this.formOrder.invalid) {
      this.formOrder.markAllAsTouched();
      return;
    }

    const datos = this.formOrder.value;

    if (this.editingId) {
      this.orderService.updateOrder({ ...datos, ordenID: this.editingId }).subscribe({
        next: () => {
          this.notify.show('Pedido actualizado', 'success');
          this.modalRef.hide();
          this.loadData();
        },
        error: () => this.notify.show('Error al actualizar registro', 'error')
      });
    } else {
      this.orderService.createOrder(datos).subscribe({
        next: () => {
          this.notify.show('Pedido registrado en SQL', 'success');
          this.modalRef.hide();
          this.loadData();
        },
        error: () => this.notify.show('Error al crear pedido', 'error')
      });
    }
  }

  delete(order: Order) {
    const modalRef = this.modalService.open(Dialog);
    modalRef.componentInstance.data = {
      title: 'Eliminar Pedido',
      message: `¿Borrar el pedido de "${this.getUserName(order.usuarioID)}"?`
    };

    modalRef.result.then((result) => {
      if (result === true && order.ordenID) {
        this.orderService.deleteOrder(order.ordenID).subscribe({
          next: () => {
            this.notify.show('Pedido eliminado', 'success');
            this.loadData();
          },
          error: () => this.notify.show('No se pudo eliminar de la base de datos', 'error')
        });
      }
    }).catch(() => { });
  }

  search(input: HTMLInputElement) {
    const term = input.value.toLowerCase().trim();
    this.orders = term 
      ? this.allOrders.filter(o => 
          this.getUserName(o.usuarioID).toLowerCase().includes(term) ||
          this.getServiceName(o.servicioID).toLowerCase().includes(term))
      : [...this.allOrders];
  }
}