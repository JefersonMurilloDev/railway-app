<script setup lang="ts">
import { ref } from 'vue';
import { login, register, type LoginCredentials, type RegisterData } from '../services/auth';

const emit = defineEmits<{
    (e: 'success'): void;
}>();

const isLoginMode = ref(true);
const loading = ref(false);
const error = ref('');

const form = ref({
    name: '',
    email: '',
    password: ''
});

const toggleMode = () => {
    isLoginMode.value = !isLoginMode.value;
    error.value = '';
};

const handleSubmit = async () => {
    error.value = '';
    loading.value = true;

    try {
        if (isLoginMode.value) {
            const credentials: LoginCredentials = {
                email: form.value.email,
                password: form.value.password
            };
            await login(credentials);
        } else {
            const data: RegisterData = {
                name: form.value.name,
                email: form.value.email,
                password: form.value.password
            };
            await register(data);
        }
        emit('success');
    } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            error.value = axiosError.response?.data?.message || 'Error de autenticación';
        } else {
            error.value = 'Error de conexión';
        }
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1 class="auth-title">TaskFlow</h1>
                <p class="auth-subtitle">
                    {{ isLoginMode ? 'Inicia sesión en tu cuenta' : 'Crea una nueva cuenta' }}
                </p>
            </div>

            <form @submit.prevent="handleSubmit" class="auth-form">
                <div v-if="error" class="error-message">
                    {{ error }}
                </div>

                <div v-if="!isLoginMode" class="form-group">
                    <label for="name">Nombre</label>
                    <input
                        id="name"
                        v-model="form.name"
                        type="text"
                        placeholder="Tu nombre"
                        required
                        :disabled="loading"
                    />
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input
                        id="email"
                        v-model="form.email"
                        type="email"
                        placeholder="tu@email.com"
                        required
                        :disabled="loading"
                    />
                </div>

                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input
                        id="password"
                        v-model="form.password"
                        type="password"
                        placeholder="••••••••"
                        required
                        minlength="6"
                        :disabled="loading"
                    />
                </div>

                <button type="submit" class="submit-btn" :disabled="loading">
                    <span v-if="loading" class="spinner"></span>
                    {{ loading ? 'Procesando...' : (isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta') }}
                </button>
            </form>

            <div class="auth-footer">
                <p>
                    {{ isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}
                    <button type="button" @click="toggleMode" class="toggle-btn">
                        {{ isLoginMode ? 'Regístrate' : 'Inicia sesión' }}
                    </button>
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 20px;
}

.auth-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 40px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.auth-header {
    text-align: center;
    margin-bottom: 30px;
}

.auth-title {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 10px;
}

.auth-subtitle {
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    font-size: 0.95rem;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    font-weight: 500;
}

.form-group input {
    padding: 14px 16px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.form-group input::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

.form-group input:focus {
    outline: none;
    border-color: #8b5cf6;
    background: rgba(139, 92, 246, 0.1);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.form-group input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.error-message {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 0.9rem;
    text-align: center;
}

.submit-btn {
    padding: 16px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
}

.submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.auth-footer {
    margin-top: 24px;
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
}

.toggle-btn {
    background: none;
    border: none;
    color: #a855f7;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    margin-left: 4px;
    transition: color 0.3s ease;
}

.toggle-btn:hover {
    color: #c084fc;
}
</style>
