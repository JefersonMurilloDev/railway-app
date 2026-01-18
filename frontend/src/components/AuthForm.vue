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
  <div class="min-h-screen flex flex-col lg:flex-row bg-[#0B0F1A]">
    <!-- Left Side: Form Section -->
    <div class="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-12 bg-white/5 backdrop-blur-3xl z-10">
      <div class="w-full max-w-md animate-pop">
        <!-- Logo/Header -->
        <div class="text-center lg:text-left mb-10">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/20 text-primary mb-6 border border-primary/30">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">
            {{ isLoginMode ? 'Bienvenido de nuevo' : 'Crea tu cuenta' }}
          </h1>
          <p class="text-text-muted text-base">
            {{ isLoginMode ? 'Ingresa tus credenciales para continuar' : 'Comienza tu viaje con TaskFlow hoy' }}
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div v-if="error" class="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm text-center animate-shake">
            {{ error }}
          </div>

          <div v-if="!isLoginMode" class="space-y-2">
            <label class="block text-sm font-medium text-text-secondary">Nombre Completo</label>
            <input v-model="form.name" type="text" placeholder="John Doe" required class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary focus:bg-primary/5 transition-all outline-none" />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-text-secondary">Correo Electrónico</label>
            <input v-model="form.email" type="email" placeholder="nombre@ejemplo.com" required class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary focus:bg-primary/5 transition-all outline-none" />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-text-secondary flex justify-between">
              <span>Contraseña</span>
              <a v-if="isLoginMode" href="#" class="text-xs text-primary hover:text-primary-light transition-colors">¿Olvidaste tu contraseña?</a>
            </label>
            <input v-model="form.password" type="password" placeholder="••••••••" required minlength="6" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary focus:bg-primary/5 transition-all outline-none" />
          </div>

          <button type="submit" :disabled="loading" class="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 text-lg">
            <span v-if="loading" class="animate-spin h-5 w-5 border-3 border-white/30 border-t-white rounded-full"></span>
            {{ loading ? 'Trabajando...' : (isLoginMode ? 'Iniciar Sesión' : 'Registrarse') }}
          </button>
        </form>

        <!-- Footer -->
        <p class="mt-8 text-center text-text-muted">
          {{ isLoginMode ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta?' }}
          <button @click="toggleMode" type="button" class="text-primary font-bold hover:underline ml-1">
            {{ isLoginMode ? 'Regístrate aquí' : 'Inicia sesión' }}
          </button>
        </p>

        <p class="mt-12 text-center text-xs text-text-muted/50">
          © 2026 TaskFlow Inc. Todos los derechos reservados.
        </p>
      </div>
    </div>

    <!-- Right Side: Decorative/Preview Section -->
    <div class="hidden lg:flex w-[55%] relative overflow-hidden bg-gradient-to-br from-[#0B0F1A] via-[#1A1A2E] to-primary/10">
      <!-- Animated Background Blobs -->
      <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[100px] rounded-full"></div>

      <!-- Preview Mockup Content -->
      <div class="relative w-full h-full flex flex-col items-center justify-center p-12">
        <div class="w-full max-w-2xl space-y-12 mb-12">
            <h2 class="text-5xl font-bold text-white leading-tight">
                Transforma tus Datos en <span class="text-primary">Acciones Claras</span>
            </h2>
            <p class="text-xl text-text-muted leading-relaxed max-w-lg">
                TaskFlow te ayuda a gestionar tus cuentas y tareas con una interfaz diseñada para la productividad y el análisis inteligente.
            </p>
        </div>

        <!-- Glassmorphism Cards Preview -->
        <div class="relative w-full max-w-2xl grid grid-cols-2 gap-6">
            <!-- Card 1 -->
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transform hover:-translate-y-2 transition-transform duration-500">
                <div class="flex justify-between items-start mb-4">
                    <div class="p-2 bg-success/20 rounded-lg text-success">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span class="text-xs text-text-muted">Este mes</span>
                </div>
                <div class="text-2xl font-bold text-white mb-1">$12,480.00</div>
                <div class="text-sm text-text-muted">Balance Total Cuentas</div>
            </div>

            <!-- Card 2 -->
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transform hover:-translate-y-2 transition-transform duration-500 delay-100">
                <div class="flex justify-between items-start mb-4">
                    <div class="p-2 bg-primary/20 rounded-lg text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    </div>
                    <span class="text-xs text-text-muted">Progreso</span>
                </div>
                <div class="text-2xl font-bold text-white mb-1">85%</div>
                <div class="text-sm text-text-muted">Tareas Completadas</div>
            </div>

            <!-- Card 3 (Large) -->
            <div class="col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transform hover:-translate-y-2 transition-transform duration-500 delay-200">
                <div class="flex items-center gap-4">
                    <div class="h-10 w-10 rounded-full bg-linear-to-r from-primary to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg">JD</div>
                    <div class="flex-1">
                        <div class="h-2 w-3/4 bg-white/10 rounded-full mb-2"></div>
                        <div class="h-2 w-1/2 bg-white/5 rounded-full"></div>
                    </div>
                    <div class="flex -space-x-3">
                        <div class="h-8 w-8 rounded-full border-2 border-[#1A1A2E] bg-gray-600"></div>
                        <div class="h-8 w-8 rounded-full border-2 border-[#1A1A2E] bg-gray-500"></div>
                        <div class="h-8 w-8 rounded-full border-2 border-[#1A1A2E] bg-primary flex items-center justify-center text-[10px] font-bold">+5</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Carousel Indicators -->
        <div class="flex gap-2 mt-12">
            <div class="w-8 h-1 bg-primary rounded-full"></div>
            <div class="w-2 h-1 bg-white/20 rounded-full"></div>
            <div class="w-2 h-1 bg-white/20 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Transiciones sutiles adicionales si se requieren */
.animate-pop {
    animation: pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes pop {
    0% { transform: scale(0.95); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

.animate-shake {
    animation: shake 0.5s ease-in-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
}
</style>

