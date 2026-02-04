import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-table-reutilizable',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './table-reutilizable.html',
  styleUrl: './table-reutilizable.css',
})
export class TableReutilizable {
  @Input() data: any[] = [];
  @Input() columns: string[] = []; // Nombres de las propiedades (ej: 'nombre')
  @Input() headers: string[] = []; // Títulos visuales (ej: 'Nombre Completo')
  
  // Eventos para acciones desde el CRUD
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  currentPage: number = 1;
  pageSize: number = 5;

  get totalPages(): number {
    return Math.ceil(this.data.length / this.pageSize);
  }

  get displayedHeaders(): string[] {
    return this.headers.length === this.columns.length ? this.headers : this.columns;
  }

  get paginatedData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.data.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  sortData(column: string) {
    this.data = [...this.data].sort((a, b) =>
      String(a[column] ?? '').localeCompare(String(b[column] ?? ''), undefined, { numeric: true })
    );
  }
}