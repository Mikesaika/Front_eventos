export interface Order {
    ordenID?: number; 
    usuarioID: number; 
    servicioID: number;
    fechaOrden?: string;
    fechaEvento: string; 
    precioTotal: number;
    estado: string;     // Pendiente, Aprobado, Finalizado, Cancelado 
    observaciones?: string;
    usuario?: any;
    servicio?: any;
}

// Funciones auxiliares para verificar el estado
export function isActive(order: Order): boolean {
    return order && order.estado !== 'Cancelado';
}

export function isPending(order: Order): boolean {
    return order && order.estado === 'Pendiente';
}

export function isApproved(order: Order): boolean {
    return order && order.estado === 'Aprobado';
}

export function isFinished(order: Order): boolean {
    return order && order.estado === 'Finalizado';
}

export function isCancelled(order: Order): boolean {
    return order && order.estado === 'Cancelado';
}
