export interface MedicoRequest {
    nombres: string;
    apellidos: string;
    cmp: string;
    telefono: string;
    correo: string;
    idEspecialidad: number;
}

export interface MedicoResponse {
    idMedico: number;
    nombres: string;
    apellidos: string;
    cmp: string;
    telefono: string;
    correo: string;
    nombreEspecialidad: string;
    idEspecialidad: number;
}
