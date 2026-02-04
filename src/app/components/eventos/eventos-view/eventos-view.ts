import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, UpperCasePipe, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Service } from '../../../models/Service';
import { Category } from '../../../models/Category';
import { Company } from '../../../models/Company';
import { User } from '../../../models/User';
import { Order } from '../../../models/Order';
import { ServEventosJson } from '../../../services/serv.service';
import { OrderService } from '../../../services/order.service';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { NotificationComponent } from '../../../shared/notification/notification';
import { ServServicioApi } from '../../../services/serv-servicio-api';

declare const bootstrap: any;

@Component({
  selector: 'app-eventos-view',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe,
    RouterLink, ReactiveFormsModule, NotificationComponent
  ],
  templateUrl: './eventos-view.html',
  styleUrl: './eventos-view.css',
})
export class EventoView implements OnInit, AfterViewInit {
  servicio!: Service;
  categoria?: Category;
  empresa?: Company;
  users: User[] = [];
  cargando: boolean = true;
  formOrder!: FormGroup;
  modalRef: any;
  @ViewChild('orderModalRef') modalElement!: ElementRef;

  constructor(
    private eventosService: ServServicioApi,
    private orderService: OrderService,
    private userService: UserService,
    private notify: NotificationService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
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
    this.loadServiceData();
    this.loadUsers();
  }

  ngAfterViewInit() {
    if (typeof bootstrap !== 'undefined') {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  loadServiceData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.eventosService.getServiceById(id).subscribe((serv) => {
      this.servicio = serv;
      this.eventosService.getCategories().subscribe((cats) => {
        this.categoria = cats.find((c) => Number(c.categoriaID) === Number(this.servicio.categoriaID));
      });
      this.eventosService.getCompanies().subscribe((comps) => {
        this.empresa = comps.find((c) => Number(c.empresaID) === Number(this.servicio.empresaID));
      });
      this.cargando = false;
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: () => this.notify.show('Error cargando lista de clientes', 'error')
    });
  }

  openOrderModal() {
    if (!this.servicio) return;

    this.formOrder.patchValue({
      servicioID: this.servicio.servicioID,
      precioTotal: this.servicio.precio,
      fechaEvento: new Date().toISOString().split('T')[0],
      usuarioID: ''
    });

    this.modalRef.show();
  }

  saveOrder() {
    if (this.formOrder.invalid) {
      this.formOrder.markAllAsTouched();
      this.notify.show('Selecciona un cliente y la fecha del evento', 'error');
      return;
    }

    const datos: Order = this.formOrder.value;

    this.orderService.createOrder(datos).subscribe({
      next: () => {
        this.notify.show('¡Cotización enviada exitosamente!', 'success');
        this.modalRef.hide();
        this.formOrder.reset({ activo: true, estado: 'Pendiente' });
      },
      error: () => this.notify.show('Hubo un problema al procesar el pedido', 'error')
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.formOrder.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }
}