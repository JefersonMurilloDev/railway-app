import api from './api';

// Tipos para los Gastos
export interface Expense {
    _id?: string;
    description: string;
    amount: number;
    date: string;
    category: string;
    accountId: string;
    hasReceipt?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Obtener todos los gastos (opcionalmente filtrados por cuenta)
export const getExpenses = async (accountId?: string): Promise<Expense[]> => {
    const params = accountId ? { accountId } : {};
    const response = await api.get<Expense[]>('/expenses', { params });
    return response.data;
};

// Obtener un gasto por ID
export const getExpenseById = async (id: string): Promise<Expense> => {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
};

// Obtener URL de imagen del recibo (para usar en <img src>)
export const getExpenseImageUrl = (id: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    return `${baseUrl}/expenses/${id}/image`;
};

// Crear un nuevo gasto (con opción de subir imagen)
export const createExpense = async (data: FormData): Promise<Expense> => {
    const response = await api.post<Expense>('/expenses', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Actualizar un gasto
export const updateExpense = async (id: string, data: FormData): Promise<Expense> => {
    const response = await api.put<Expense>(`/expenses/${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Eliminar un gasto
export const deleteExpense = async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
};
