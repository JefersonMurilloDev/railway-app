import api from './api';

// Tipos para las Cuentas
export interface Account {
    _id?: string;
    name: string;
    initialBalance: number;
    type: 'corriente' | 'ahorros' | 'efectivo' | 'credito' | 'otro';
    currency: 'USD' | 'COP' | 'EUR';
    color: string;
    currentBalance?: number;
    totalExpenses?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface AccountStats {
    totalBalance: number;
    totalAccounts: number;
    totalExpensesThisMonth: number;
}

// Obtener todas las cuentas del usuario
export const getAccounts = async (): Promise<Account[]> => {
    const response = await api.get<Account[]>('/accounts');
    return response.data;
};

// Obtener estadísticas generales
export const getAccountStats = async (): Promise<AccountStats> => {
    const response = await api.get<AccountStats>('/accounts/stats');
    return response.data;
};

// Obtener una cuenta por ID con sus gastos
export const getAccountById = async (id: string): Promise<Account> => {
    const response = await api.get<Account>(`/accounts/${id}`);
    return response.data;
};

// Crear una nueva cuenta
export const createAccount = async (data: Partial<Account>): Promise<Account> => {
    const response = await api.post<Account>('/accounts', data);
    return response.data;
};

// Actualizar una cuenta
export const updateAccount = async (id: string, data: Partial<Account>): Promise<Account> => {
    const response = await api.put<Account>(`/accounts/${id}`, data);
    return response.data;
};

// Eliminar una cuenta
export const deleteAccount = async (id: string): Promise<void> => {
    await api.delete(`/accounts/${id}`);
};
