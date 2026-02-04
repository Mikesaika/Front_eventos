export interface Order {
    ordenID?: number; 
    usuarioID: number; 
    servicioID: number;
    fechaEvento: string; 
    precioTotal: number;
    estado: string;      
    observaciones?: string;
    activo: boolean;
}