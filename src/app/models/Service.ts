export interface Service {
    servicioID?: number; 
    nombre: string;
    descripcion: string;
    categoriaID: number; 
    empresaID: number;
    precio: number;
    imagenURL: string;
    clasificacion: 'plata' | 'oro' | 'diamante' | string;
    activo: boolean;
}