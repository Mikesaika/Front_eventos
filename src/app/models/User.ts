export interface User {
    usuarioID?: number; 
    nombre: string;
    email: string;
    rol: 'Administrador' | 'Cliente' | 'Compañia' | string;
    telefono: string;
    fechaRegistro: Date | string;
    direccion: string;
    
    passwordHash: string; 
    
    activo: boolean;
}