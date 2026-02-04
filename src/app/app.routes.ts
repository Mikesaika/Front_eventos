import { Routes } from '@angular/router';
import { EventoList } from './components/eventos/eventos-list/eventos-list';
import { EventoView } from './components/eventos/eventos-view/eventos-view';
import { ServicesCrud } from './components/services-crud/services-crud';
import { UsersCrud } from './components/usuarios/users-crud/users-crud';
import { OrderCrud } from './components/order/order-crud/order-crud';
import { OrderList } from './components/order/order-list/order-list';
import { CategoryListComponent } from './components/category/category-list/category-list';
import { CategoryFormComponent } from './components/category/category-form/category-form';

export const routes: Routes = [
    // --- Sección de Cliente (Catálogo) ---
    { path: 'eventos-list', component: EventoList },
    { path: 'eventos-view/:id', component: EventoView },

    // --- Administración de Servicios ---
    { path: 'services-crud', component: ServicesCrud },

    // --- Administración de Usuarios ---
    { path: 'usuarios', component: UsersCrud },

    // --- Gestión de Pedidos ---
    { path: 'order-list', component: OrderList },
    { path: 'order-crud', component: OrderCrud },

    // --- Gestión de Categorías ---
    { path: 'categories', component: CategoryListComponent },
    { path: 'categories-form', component: CategoryFormComponent },
    { path: 'categories-form/:id', component: CategoryFormComponent }, // Para editar

    // --- Redireccionamiento ---
    { path: '', redirectTo: 'eventos-list', pathMatch: 'full' },
    { path: '**', redirectTo: 'eventos-list' }
];