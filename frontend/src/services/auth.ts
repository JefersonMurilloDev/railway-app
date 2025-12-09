import api from './api';

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    status: string;
    token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData extends LoginCredentials {
    name: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Obtener token guardado
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

// Obtener usuario guardado
export const getUser = (): User | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
};

// Guardar datos de autenticación
export const saveAuth = (token: string, user: User): void => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Limpiar datos de autenticación
export const clearAuth = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

// Verificar si está autenticado
export const isAuthenticated = (): boolean => {
    return !!getToken();
};

// Registrar nuevo usuario
export const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    saveAuth(response.data.token, response.data.user);
    return response.data;
};

// Iniciar sesión
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    saveAuth(response.data.token, response.data.user);
    return response.data;
};

// Cerrar sesión
export const logout = (): void => {
    clearAuth();
};

// Obtener perfil actual
export const getMe = async (): Promise<User> => {
    const response = await api.get<{ status: string; user: User }>('/auth/me');
    return response.data.user;
};
