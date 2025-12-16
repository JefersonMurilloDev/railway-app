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
    <div class="min-h-dvh flex items-center justify-center p-5">
        <div class="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold bg-linear-to-r from-indigo-500 via-primary to-purple-500 bg-clip-text text-transparent mb-2">TaskFlow</h1>
                <p class="text-text-muted text-sm">
                    {{ isLoginMode ? 'Inicia sesión en tu cuenta' : 'Crea una nueva cuenta' }}
                </p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
                <!-- Error Message -->
                <div 
                    v-if="error" 
                    class="bg-danger/15 border border-danger/30 text-danger-light py-3 px-4 rounded-xl text-sm text-center"
                >
                    {{ error }}
                </div>

                <!-- Name Field (Register only) -->
                <div v-if="!isLoginMode" class="flex flex-col gap-2">
                    <label for="name" class="text-text-secondary text-sm font-medium">Nombre</label>
                    <input
                        id="name"
                        v-model="form.name"
                        type="text"
                        placeholder="Tu nombre"
                        required
                        :disabled="loading"
                        class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary focus:bg-primary/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                </div>

                <!-- Email Field -->
                <div class="flex flex-col gap-2">
                    <label for="email" class="text-text-secondary text-sm font-medium">Email</label>
                    <input
                        id="email"
                        v-model="form.email"
                        type="email"
                        placeholder="tu@email.com"
                        required
                        :disabled="loading"
                        class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary focus:bg-primary/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                </div>

                <!-- Password Field -->
                <div class="flex flex-col gap-2">
                    <label for="password" class="text-text-secondary text-sm font-medium">Contraseña</label>
                    <input
                        id="password"
                        v-model="form.password"
                        type="password"
                        placeholder="••••••••"
                        required
                        minlength="6"
                        :disabled="loading"
                        class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary focus:bg-primary/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                </div>

                <!-- Submit Button -->
                <button 
                    type="submit" 
                    :disabled="loading"
                    class="w-full py-3.5 rounded-xl font-bold text-white bg-linear-to-r from-indigo-500 via-primary to-purple-600 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                    <span v-if="loading" class="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"></span>
                    {{ loading ? 'Procesando...' : (isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta') }}
                </button>
            </form>

            <!-- Footer -->
            <div class="mt-6 text-center text-text-muted text-sm">
                <p>
                    {{ isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}
                    <button 
                        type="button" 
                        @click="toggleMode" 
                        class="text-primary-light font-semibold ml-1 hover:text-primary transition-colors bg-transparent border-none p-0 cursor-pointer"
                    >
                        {{ isLoginMode ? 'Regístrate' : 'Inicia sesión' }}
                    </button>
                </p>
            </div>
        </div>
    </div>
</template>
