export interface UsuarioRequest {
    username: string;
    email: string;
    password?: string;
    rolId: number | null;
}

export interface UsuarioResponse {
    idUsuario: number;
    username: string;
    email?: string;
    rolNombre: string;
    rolId?: number | null;
    password?: string;
    estado: boolean;
    fechaCreacion: string;
}
