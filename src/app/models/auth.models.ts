export interface AuthResponse {
    token: string;
    username: string;
    rol: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    rolId: number;
}
