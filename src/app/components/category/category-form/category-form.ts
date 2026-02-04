import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; 
import { Category } from '../../../models/Category';
import { CategoryService } from '../../../services/category.service';
import { NotificationService } from '../../../services/notification.service';
import { NotificationComponent } from '../../../shared/notification/notification';
import { Dialog } from '../../../shared/dialog/dialog'; 

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NotificationComponent, RouterLink],
  templateUrl: './category-form.html'
})
export class CategoryFormComponent implements OnInit {
  mode: 'new' | 'edit' = 'new';
  currentId: number | null = null;
  form: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: CategoryService,
    private fb: FormBuilder,
    private notify: NotificationService,
    private modalService: NgbModal 
  ) {
    // Sincronizado con el modelo de SQL: nombre, descripcion, activo
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', Validators.required],
      icon: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.mode = 'edit';
      this.currentId = Number(id); 

      this.service.get(this.currentId).subscribe({
        next: (cat) => {
          if (cat) this.form.patchValue(cat);
        },
        error: () => this.notify.show('Error al cargar la categoría desde el simulador', 'error')
      });
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.show('Por favor, completa los campos obligatorios', 'error');
      return;
    }

    const datos: Category = this.form.value as Category;

    if (this.mode === 'new') {
      this.service.create(datos).subscribe({
        next: () => {
          this.notify.show('Categoría guardada en la base de datos', 'success');
          setTimeout(() => this.router.navigate(['/categories']), 1000);
        },
        error: () => this.notify.show('Error al intentar crear el registro', 'error')
      });
    } else {
      if (this.currentId) {
        // Mapeamos el ID correcto para SQL Server
        const catUpdate = { ...datos, categoriaID: this.currentId };
        
        this.service.update(this.currentId, catUpdate).subscribe({
          next: () => {
            this.notify.show('Cambios actualizados correctamente', 'success');
            setTimeout(() => this.router.navigate(['/categories']), 1000);
          },
          error: () => this.notify.show('Error al actualizar la categoría', 'error')
        });
      }
    }
  }

  delete() {
    if (!this.currentId) return;

    const modalRef = this.modalService.open(Dialog);
    modalRef.componentInstance.data = {
      title: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas borrar esta categoría? Esta acción afectará a los servicios vinculados.'
    };

    modalRef.result.then((result) => {
      if (result === true) {
        this.service.delete(this.currentId!).subscribe({
          next: () => {
            this.notify.show('Categoría eliminada de SQL', 'success');
            this.router.navigate(['/categories']);
          },
          error: () => this.notify.show('No se pudo eliminar el registro', 'error')
        });
      }
    }).catch(() => {});
  }
}