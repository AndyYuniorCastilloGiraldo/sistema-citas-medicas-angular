export interface UsuarioRequest {
    username: string;
    password?: string;
    rolId: number;
}

export interface UsuarioResponse {
    idUsuario: number;
    username: string;
    rolNombre: string;
    rolId?: number;
    estado: boolean;
    fechaCreacion: string;
}
