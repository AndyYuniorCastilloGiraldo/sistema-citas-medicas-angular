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
    username?: string;
    password: string;
    rolId: number;
}
