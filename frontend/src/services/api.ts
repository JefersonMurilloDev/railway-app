import axios from 'axios';

// Usamos la URL relativa para aprovechar el proxy de Vite en desarrollo
// y la URL relativa en producción (mismo dominio)
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Task {
    _id?: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    createdAt?: string;
    updatedAt?: string;
}

export default api;
