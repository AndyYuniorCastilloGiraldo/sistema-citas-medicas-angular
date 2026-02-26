export interface UsuarioRequest {
    username: string;
    password?: string;
    rolId: number | null;
}

export interface UsuarioResponse {
    idUsuario: number;
    username: string;
    rolNombre: string;
    rolId?: number | null;
    estado: boolean;
    fechaCreacion: string;
}
