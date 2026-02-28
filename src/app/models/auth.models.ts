export interface AuthResponse {
    token: string;
    username: string;
    rol: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    rolId: number;
}
