import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Category } from '../../../models/Category';
import { CategoryService } from '../../../services/category.service';
import { NotificationService } from '../../../services/notification.service';
import { Dialog } from '../../../shared/dialog/dialog';
import { NotificationComponent } from '../../../shared/notification/notification';
import { CommonModule } from '@angular/common';

declare const bootstrap: any;

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NotificationComponent],
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.css']
})
export class CategoryListComponent implements OnInit, AfterViewInit {
  categories: Category[] = [];
  allCategories: Category[] = [];
  formCategory!: FormGroup;
  editingId: number | null = null;
  modalRef: any;

  @ViewChild('categoryModalRef') modalElement!: ElementRef;

  constructor(
    private service: CategoryService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private notify: NotificationService,
    private route: ActivatedRoute 
  ) {
    this.formCategory = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', Validators.required],
      icon: ['bi-tag'],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'new') {
        setTimeout(() => this.openNew(), 100);
      }
    });
  }

  ngAfterViewInit() {
    if (typeof bootstrap !== 'undefined') {
      this.modalRef = new bootstrap.Modal(this.modalElement.nativeElement);
    }
  }

  loadData(): void {
    this.service.list().subscribe({
      next: (data) => {
        this.categories = data;
        this.allCategories = [...data];
      },
      error: () => this.notify.show('Error al conectar con el servidor', 'error')
    });
  }

  search(input: HTMLInputElement) {
    const term = input.value.toLowerCase().trim();
    this.categories = term 
      ? this.allCategories.filter(c => 
          c.nombre.toLowerCase().includes(term) || 
          c.descripcion.toLowerCase().includes(term))
      : [...this.allCategories];
  }

  openNew() {
    this.editingId = null;
    this.formCategory.reset({ activo: true, icon: 'bi-tag' });
    this.modalRef.show();
  }

  openEdit(cat: Category) {
    this.editingId = cat.categoriaID || null;
    this.formCategory.patchValue(cat);
    this.modalRef.show();
  }

  save() {
    if (this.formCategory.invalid) {
      this.formCategory.markAllAsTouched();
      return;
    }

    const datos = this.formCategory.value;

    if (this.editingId) {
      this.service.update(this.editingId, { ...datos, categoriaID: this.editingId }).subscribe({
        next: () => {
          this.notify.show('Categoría actualizada en SQL', 'success');
          this.modalRef.hide();
          this.loadData();
        },
        error: () => this.notify.show('Error al actualizar', 'error')
      });
    } else {
      this.service.create(datos).subscribe({
        next: () => {
          this.notify.show('Categoría creada exitosamente', 'success');
          this.modalRef.hide();
          this.loadData();
        },
        error: () => this.notify.show('Error al crear', 'error')
      });
    }
  }

  delete(cat: Category) {
    const modalRef = this.modalService.open(Dialog);
    modalRef.componentInstance.data = {
      title: 'Eliminar Registro',
      message: `¿Estás seguro de eliminar "${cat.nombre}"?`
    };

    modalRef.result.then((result) => {
      if (result === true && cat.categoriaID) {
        this.service.delete(cat.categoriaID).subscribe({
          next: () => {
            this.notify.show('Registro eliminado', 'success');
            this.loadData();
          },
          error: () => this.notify.show('Error al eliminar', 'error')
        });
      }
    }).catch(() => { });
  }
}