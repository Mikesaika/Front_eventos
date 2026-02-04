import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, TitleCasePipe, CurrencyPipe, CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Service } from '../../models/Service';
import { Category } from '../../models/Category';
import { Company } from '../../models/Company';
import { ServEventosJson } from '../../services/serv.service';
import { NotificationService } from '../../services/notification.service';
import { Dialog } from '../../shared/dialog/dialog';
import { NotificationComponent } from '../../shared/notification/notification';

declare const bootstrap: any;

@Component({
  selector: 'app-services-crud',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, NgClass, 
    TitleCasePipe, CurrencyPipe, NotificationComponent
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
    private miServicio: ServEventosJson,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private notify: NotificationService
  ) {
    // Sincronizado con nombres de columnas SQL: nombre, descripcion, precio, imagenURL...
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
    // Carga paralela de dependencias
    this.miServicio.getCategories().subscribe(data => this.categories = data);
    this.miServicio.getCompanies().subscribe(data => this.companies = data);
    this.miServicio.getServices().subscribe({
      next: (data) => {
        this.services = data;
        this.allServices = [...data];
      },
      error: () => this.notify.show('Error al sincronizar catálogo con SQL', 'error')
    });
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

  save() {
    if (this.formService.invalid) {
      this.formService.markAllAsTouched();
      this.notify.show('Completa los campos obligatorios', 'error');
      return;
    }

    const datos = this.formService.value;

    if (this.editingId) {
      this.miServicio.updateService({ ...datos, servicioID: this.editingId }).subscribe({
        next: () => {
          this.notify.show('Servicio actualizado en la base de datos', 'success');
          this.modalRef.hide();
          this.loadData();
        },
        error: () => this.notify.show('Error al actualizar registro', 'error')
      });
    } else {
      this.miServicio.createService(datos).subscribe({
        next: () => {
          this.notify.show('Servicio creado exitosamente', 'success');
          this.modalRef.hide();
          this.loadData();
        },
        error: () => this.notify.show('Error al crear el servicio', 'error')
      });
    }
  }

  delete(service: Service) {
    const modalRef = this.modalService.open(Dialog);
    modalRef.componentInstance.data = {
      title: 'Eliminar Servicio',
      message: `¿Estás seguro de eliminar "${service.nombre}"?`
    };

    modalRef.result.then((result) => {
      if (result === true && service.servicioID) {
        this.miServicio.deleteService(service.servicioID).subscribe({
          next: () => {
            this.notify.show('Servicio eliminado', 'success');
            this.loadData();
          },
          error: () => this.notify.show('No se pudo eliminar el registro', 'error')
        });
      }
    }).catch(() => { });
  }

  handleImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/150?text=No+Image';
  }

  isFieldInvalid(field: string): boolean {
    const control = this.formService.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getFieldError(field: string, error: string): boolean {
    const control = this.formService.get(field);
    return control ? control.hasError(error) : false;
  }
}