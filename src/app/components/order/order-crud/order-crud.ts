import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Order, isActive, isPending, isApproved, isFinished, isCancelled } from '../../../models/Order';
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
    CommonModule, 
    ReactiveFormsModule,
    FormsModule,
    NotificationComponent
  ],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './order-crud.html',
  styleUrls: ['./order-crud.css']
})
export class OrderCrud implements OnInit, AfterViewInit {
  orders: Order[] = [];
  allOrders: Order[] = [];
  users: User[] = [];
  services: Service[] = [];
  filteredOrders: Order[] = [];

  // Variables para estadísticas (Solución al error del HTML)
  stats = {
    activeCount: 0,
    pendingCount: 0,
    estimatedIncome: 0
  };

  formOrder!: FormGroup;
  editingId: number | null = null;
  modalRef: any;
  @ViewChild('orderModalRef') modalElement!: ElementRef;

  searchTerm: string = '';
  estadoFilter: string = '';
  usuarioFilter: number | null = null;
  servicioFilter: number | null = null;

  estadosValidos = ['Pendiente', 'Aprobado', 'Finalizado'];

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
      observaciones: ['']
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
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.notify.show('Error al sincronizar datos', 'error');
      }
    });
  }

  // Lógica de cálculo de estadísticas
  updateStatistics() {
    this.stats.activeCount = this.filteredOrders.filter(o => isActive(o)).length;
    this.stats.pendingCount = this.filteredOrders.filter(o => isPending(o)).length;
    this.stats.estimatedIncome = this.filteredOrders
      .filter(o => isActive(o))
      .reduce((sum, o) => sum + (Number(o.precioTotal) || 0), 0);
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

  onServiceChange() {
    const serviceId = this.formOrder.get('servicioID')?.value;
    const service = this.services.find(s => Number(s.servicioID) === Number(serviceId));
    if (service) {
      this.formOrder.patchValue({ precioTotal: service.precio });
    }
  }

  openNew() {
    this.editingId = null;
    this.formOrder.reset({ estado: 'Pendiente', precioTotal: 0, observations: '' });
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
        error: () => this.notify.show('Error al actualizar', 'error')
      });
    } else {
      this.orderService.createOrder(datos).subscribe({
        next: () => {
          this.notify.show('Pedido registrado', 'success');
          this.modalRef.hide();
          this.loadData();
        },
        error: () => this.notify.show('Error al crear', 'error')
      });
    }
  }

  delete(order: Order) {
    const modalRef = this.modalService.open(Dialog);
    modalRef.componentInstance.data = {
      title: 'Eliminar Pedido',
      message: `¿Borrar pedido de ${this.getUserName(order.usuarioID)}?`
    };

    modalRef.result.then((result) => {
      if (result === true && order.ordenID) {
        this.orderService.deleteOrder(order.ordenID).subscribe({
          next: () => {
            this.notify.show('Eliminado con éxito', 'success');
            this.loadData();
          }
        });
      }
    }).catch(() => {});
  }

  cancelOrder(order: Order) {
    const modalRef = this.modalService.open(Dialog);
    modalRef.componentInstance.data = {
      title: 'Cancelar Pedido',
      message: `¿Desea cancelar el pedido?`
    };

    modalRef.result.then((result) => {
      if (result === true && order.ordenID) {
        this.orderService.cancelOrder(order.ordenID).subscribe({
          next: () => {
            this.notify.show('Pedido cancelado', 'success');
            this.loadData();
          }
        });
      }
    }).catch(() => {});
  }

  updateStatus(order: Order, nuevoEstado: string) {
    if (order.ordenID) {
      this.orderService.updateOrderStatus(order.ordenID, nuevoEstado).subscribe({
        next: () => {
          this.notify.show('Estado actualizado', 'success');
          this.loadData();
        }
      });
    }
  }

  searchOrders() {
    this.orderService.searchOrders(
      this.searchTerm || undefined,
      this.usuarioFilter || undefined,
      this.servicioFilter || undefined,
      this.estadoFilter || undefined
    ).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applyFilters();
      }
    });
  }

  applyFilters() {
    let filtered = [...this.orders];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        this.getUserName(o.usuarioID).toLowerCase().includes(term) ||
        this.getServiceName(o.servicioID).toLowerCase().includes(term)
      );
    }

    if (this.estadoFilter) {
      filtered = filtered.filter(o => o.estado === this.estadoFilter);
    }

    if (this.usuarioFilter) {
      filtered = filtered.filter(o => Number(o.usuarioID) === Number(this.usuarioFilter));
    }

    if (this.servicioFilter) {
      filtered = filtered.filter(o => Number(o.servicioID) === Number(this.servicioFilter));
    }

    this.filteredOrders = filtered;
    this.updateStatistics(); // Actualizar stats cada vez que el filtro cambia
  }

  clearFilters() {
    this.searchTerm = '';
    this.estadoFilter = '';
    this.usuarioFilter = null;
    this.servicioFilter = null;
    this.loadData();
  }

  isActive = isActive;
  isPending = isPending;
  isApproved = isApproved;
  isFinished = isFinished;
  isCancelled = isCancelled;
}
