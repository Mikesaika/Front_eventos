import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/User';
import { NotificationService } from '../../../services/notification.service';
import { Dialog } from '../../../shared/dialog/dialog';
import { TableReutilizable } from '../../../shared/table-reutilizable/table-reutilizable';
import { NotificationComponent } from '../../../shared/notification/notification';

@Component({
  selector: 'app-users-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, TableReutilizable, NotificationComponent],
  templateUrl: './users-crud.html',
  styleUrl: './users-crud.css',
})
export class UsersCrud implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';

  formModel: User = {
    nombre: '',
    email: '',
    telefono: '', 
    direccion: '',
    fechaRegistro: new Date().toISOString().split('T')[0],
    rol: '',
    passwordHash: '',
    activo: true,
  };

  isEditing: boolean = false;
  modalVisible: boolean = false;
  viewModalVisible: boolean = false;
  viewTableData: User[] = [];

  viewTableColumns: string[] = ['usuarioID', 'nombre', 'email', 'rol', 'activo'];
  viewTableHeaders: string[] = ['ID', 'Nombre', 'Correo', 'Rol', 'Estado'];

  constructor(
    private service: UserService,
    private modalService: NgbModal,
    private notify: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.service.getUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
        this.filteredUsers = data;
      },
      error: () => this.notify.show('Error al conectar con SQL Server', 'error'),
    });
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredUsers = this.users.filter(
      (u: User) =>
        (u.nombre ?? '').toLowerCase().includes(term) ||
        (u.rol ?? '').toLowerCase().includes(term)
    );
  }

  isFieldInvalid(form: NgForm | undefined, field: string): boolean {
    if (!form) return false;
    const control = form.controls[field];
    return !!control && control.invalid && (control.dirty || control.touched || form.submitted);
  }

  getFieldError(field: string, form: NgForm | undefined): string {
    if (!form) return '';
    const control = form.controls[field];
    if (!control || !control.errors) return '';

    const messages: Record<string, string> = {
      nombre: 'El nombre es requerido.',
      email: 'Correo inválido.',
      rol: 'Debes asignar un rol.',
      passwordHash: 'La contraseña es obligatoria.'
    };
    return messages[field] || 'Campo inválido.';
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.resetFormModel();
    this.modalVisible = true;
  }

  openEditModal(user: User): void {
    this.isEditing = true;
    this.formModel = { ...user };
    this.modalVisible = true;
  }

  /**
   * CORRECCIÓN: Método para cerrar el modal y resetear el formulario
   * @param form Referencia opcional al NgForm del HTML
   */
  closeModal(form?: NgForm): void {
    this.modalVisible = false;
    this.resetFormModel();
    if (form) {
      form.resetForm(this.formModel);
    }
  }

  private resetFormModel(): void {
    this.formModel = {
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
      fechaRegistro: new Date().toISOString().split('T')[0],
      rol: '',
      passwordHash: '',
      activo: true,
    };
  }

  saveUser(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.notify.show('Datos incompletos', 'error');
      return;
    }

    if (this.isEditing && this.formModel.usuarioID) {
      this.service.updateUser(this.formModel.usuarioID, this.formModel).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal(form);
          this.notify.show('Usuario actualizado', 'success');
        }
      });
    } else {
      this.service.createUser(this.formModel).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal(form);
          this.notify.show('Usuario guardado', 'success');
        }
      });
    }
  }

  deleteUser(id: number | string | undefined): void {
    if (!id) return;
    const modalRef: NgbModalRef = this.modalService.open(Dialog, { centered: true });
    modalRef.componentInstance.data = {
      title: 'Eliminar Registro',
      message: '¿Borrar este usuario de la base de datos?'
    };

    modalRef.result.then((result: boolean) => {
      if (result === true) {
        this.service.deleteUser(id).subscribe({
          next: () => {
            this.loadUsers();
            this.notify.show('Eliminado con éxito', 'info');
          }
        });
      }
    }).catch(() => {});
  }

  openViewModal(user: User): void {
    this.viewTableData = [user];
    this.viewModalVisible = true;
  }
}