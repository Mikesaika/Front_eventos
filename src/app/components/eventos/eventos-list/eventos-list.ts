import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, CurrencyPipe, UpperCasePipe, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Service } from '../../../models/Service';
import { Category } from '../../../models/Category';
import { User } from '../../../models/User';
import { Order } from '../../../models/Order';
import { ServEventosJson } from '../../../services/serv.service';
import { OrderService } from '../../../services/order.service';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { NotificationComponent } from '../../../shared/notification/notification';

declare const bootstrap: any;

@Component({
  selector: 'app-eventos-list',
  standalone: true,
  imports: [
    CommonModule, NgClass, CurrencyPipe, UpperCasePipe,
    RouterLink, ReactiveFormsModule,
  ],
  templateUrl: './eventos-list.html',
  styleUrl: './eventos-list.css',
})
export class EventoList implements OnInit, AfterViewInit {
  services: Service[] = [];
  categories: Category[] = [];
  users: User[] = [];
  cargando: boolean = true;

  formOrder!: FormGroup;
  selectedService: Service | null = null;
  modalRef: any;
  @ViewChild('orderModalRef') modalElement!: ElementRef;

  constructor(
    private eventosService: ServEventosJson,
    private orderService: OrderService,
    private userService: UserService,
    private notify: NotificationService,
    private fb: FormBuilder
  ) {
    // Sincronizado con el modelo Order de SQL
    this.formOrder = this.fb.group({
      usuarioID: ['', Validators.required],
      fechaEvento: ['', Validators.required],
      servicioID: [''],
      precioTotal: [0],
      estado: ['Pendiente'],
      activo: [true]
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  ngAfterViewInit() {
    if (typeof bootstrap !== 'undefined') {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  cargarDatos() {
    this.eventosService.getCategories().subscribe(cats => this.categories = cats);
    this.eventosService.getServices().subscribe({
      next: (servs) => {
        this.services = servs;
        this.cargando = false;
        this.loadUsers(); // Cargamos usuarios solo después de los servicios
      },
      error: () => this.notify.show('Error al conectar con el catálogo', 'error')
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: () => this.notify.show('Error al cargar lista de clientes', 'error')
    });
  }

  openOrderModal(service: Service) {
    this.selectedService = service;
    this.formOrder.patchValue({
      servicioID: service.servicioID,
      precioTotal: service.precio,
      fechaEvento: new Date().toISOString().split('T')[0],
      usuarioID: ''
    });
    this.modalRef.show();
  }

  saveOrder() {
    if (this.formOrder.invalid) {
      this.formOrder.markAllAsTouched();
      this.notify.show('Completa los datos del pedido', 'error');
      return;
    }

    const datos: Order = this.formOrder.value;
    
    this.orderService.createOrder(datos).subscribe({
      next: () => {
        this.notify.show('¡Pedido solicitado! Revisa "Pedidos" en el menú', 'success');
        this.modalRef.hide();
        this.formOrder.reset({ activo: true, estado: 'Pendiente' });
      },
      error: () => this.notify.show('No se pudo procesar la solicitud', 'error')
    });
  }

  getCategoryName(id: number): string {
    const cat = this.categories.find(c => c.categoriaID === id);
    return cat ? cat.nombre : 'General';
  }

  getBadgeClass(clasificacion: string): string {
    const classes: any = { 'plata': 'badge-plata', 'oro': 'badge-oro', 'diamante': 'badge-diamante' };
    return classes[clasificacion] || 'bg-secondary';
  }

  isFieldInvalid(field: string): boolean {
    const control = this.formOrder.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }
}