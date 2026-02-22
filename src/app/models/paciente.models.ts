export interface PacienteRequest {
    nombres: string;
    apellidos: string;
    dni: string;
    telefono: string;
    correo: string;
    direccion: string;
}

export interface PacienteResponse {
    idPaciente: number;
    nombres: string;
    apellidos: string;
    dni: string;
    telefono: string;
    correo: string;
    direccion: string;
    fechaRegistro: string;
}
