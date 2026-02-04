import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, TitleCasePipe, CurrencyPipe, CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Service } from '../../models/Service';
import { Category } from '../../models/Category';
import { Company } from '../../models/Company';
import { ServServicioApi } from '../../services/serv-servicio-api';
import { NotificationService } from '../../services/notification.service';
import { Dialog } from '../../shared/dialog/dialog';
import { NotificationComponent } from '../../shared/notification/notification';

declare const bootstrap: any;

@Component({
  selector: 'app-services-crud',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, NgClass, 
    TitleCasePipe, 
    CurrencyPipe, 
    NotificationComponent 
  ],
  templateUrl: './services-crud.html',
  styleUrls: ['./services-crud.css']
})
export class ServicesCrud implements OnInit, AfterViewInit {
  services: Service[] = [];
  allServices: Service[] = [];
  categories: Category[] = [];
  companies: Company[] = [];

  formService!: FormGroup;
  editingId: number | null = null;
  modalRef: any;
  @ViewChild('serviceModalRef') modalElement!: ElementRef;

  constructor(
    private miServicio: ServServicioApi,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private notify: NotificationService
  ) {
    this.formService = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', Validators.required],
      categoriaID: ['', Validators.required],
      empresaID: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      imagenURL: ['', Validators.required],
      clasificacion: ['', Validators.required],
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
    this.miServicio.getCategories().subscribe({
      next: (data: any) => this.categories = data,
      error: () => this.notify.show('Error al cargar categorías', 'error')
    });

    this.miServicio.getCompanies().subscribe({
      next: (data: any) => this.companies = data,
      error: () => this.notify.show('Error al cargar empresas', 'error')
    });

    this.miServicio.getServices().subscribe({
      next: (data: any) => {
        this.services = data;
        this.allServices = [...data];
      },
      error: () => this.notify.show('Error de conexión con la base de datos SQL', 'error')
    });
  }

  save() {
    if (this.formService.invalid) {
      this.formService.markAllAsTouched();
      this.notify.show('Por favor, revisa los campos requeridos', 'error');
      return;
    }

    const datos = this.formService.value;

    if (this.editingId) {
      this.miServicio.updateService({ ...datos, servicioID: this.editingId }).subscribe({
        next: () => {
          this.notify.show('Cambios guardados en el servidor', 'success');
          this.modalRef.hide();
          this.loadData();
        },
        error: (err: any) => this.notify.show(err.error?.message || 'Error al actualizar', 'error')
      });
    } else {
      this.miServicio.createService(datos).subscribe({
        next: () => {
          this.notify.show('Nuevo servicio registrado con éxito', 'success');
          this.modalRef.hide();
          this.loadData();
        },
        error: (err: any) => this.notify.show('No se pudo crear el servicio', 'error')
      });
    }
  }

  delete(service: Service) {
    const modalRef = this.modalService.open(Dialog, { centered: true });
    modalRef.componentInstance.data = {
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar "${service.nombre}"? Esta acción desactivará el servicio en la base de datos.`
    };

    modalRef.result.then((result) => {
      if (result === true && service.servicioID) {
        this.miServicio.deleteService(service.servicioID).subscribe({
          next: () => {
            this.notify.show('Registro desactivado correctamente', 'info');
            this.loadData();
          },
          error: () => this.notify.show('Error al procesar la eliminación', 'error')
        });
      }
    }).catch(() => { });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.formService.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getCategoryName(id: number): string {
    const cat = this.categories.find(c => Number(c.categoriaID) === Number(id));
    return cat ? cat.nombre : 'Sin Categoría';
  }

  getCompanyName(id: number): string {
    const comp = this.companies.find(c => Number(c.empresaID) === Number(id));
    return comp ? comp.nombre : 'Sin Empresa';
  }

  search(input: HTMLInputElement) {
    const term = input.value.toLowerCase().trim();
    this.services = term 
      ? this.allServices.filter(s => s.nombre.toLowerCase().includes(term) || s.descripcion.toLowerCase().includes(term))
      : [...this.allServices];
  }

  openNew() {
    this.editingId = null;
    this.formService.reset({ activo: true, precio: 0 });
    this.modalRef.show();
  }

  openEdit(service: Service) {
    this.editingId = service.servicioID || null;
    this.formService.patchValue(service);
    this.modalRef.show();
  }

  handleImageError(event: any) {
    event.target.src = 'https://www.google.com/url?sa=t&source=web&rct=j&url=https%3A%2F%2Fes.vecteezy.com%2Farte-vectorial%2F4141669-sin-foto-o-imagen-en-blanco-icono-cargando-imagenes-o-imagen-faltante-marca-imagen-no-disponible-o-imagen-proxima-firmar-simple-naturaleza-silueta-en-marco-ilustracion-vectorial-aislada&ved=0CBYQjRxqFwoTCJj6lMrwwJIDFQAAAAAdAAAAABAH&opi=89978449';
  }
}