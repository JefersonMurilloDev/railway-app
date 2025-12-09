import axios from 'axios';

// Usamos la URL relativa para aprovechar el proxy de Vite en desarrollo
// y la URL relativa en producción (mismo dominio)
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token a cada request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token inválido o expirado - limpiar storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            // Recargar para ir a login
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export interface Task {
    _id?: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export default api;


