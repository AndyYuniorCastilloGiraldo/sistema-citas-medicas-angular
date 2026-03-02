export interface CitaRequest {
    fecha: string;
    hora: string;
    motivo: string;
    observaciones: string;
    idPaciente: number;
    idMedico: number;
    idUsuario: number;
}

export interface CitaResponse {
    idCita: number;
    fecha: string;
    hora: string;
    motivo: string;
    estado: string;
    observaciones: string;
    fechaRegistro: string;
    idPaciente: number;
    nombrePaciente: string;
    idMedico: number;
    nombreMedico: string;
    idUsuario: number;
    nombreUsuario: string;
}
