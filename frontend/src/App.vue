<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TaskManager from './components/TaskManager.vue';
import AccountsManager from './components/AccountsManager.vue';
import AuthForm from './components/AuthForm.vue';
import { isAuthenticated, getUser, logout as authLogout, type User } from './services/auth';

const authenticated = ref(false);
const user = ref<User | null>(null);
const loading = ref(true);
const serverError = ref<string | null>(null);
const currentView = ref<'tasks' | 'accounts'>('accounts');

onMounted(() => {
    checkAuth();
});

const checkAuth = () => {
    authenticated.value = isAuthenticated();
    user.value = getUser();
    loading.value = false;
};

const handleLogin = () => {
    checkAuth();
};

const logout = () => {
    authLogout();
    authenticated.value = false;
    user.value = null;
};
</script>

<template>
  <div class="min-h-dvh bg-bg-primary text-text-primary font-sans antialiased overflow-x-hidden selection:bg-primary selection:text-white">
    <!-- Animated Warning -->
    <div v-if="serverError" class="fixed top-0 left-0 w-full bg-danger text-white text-center py-2 z-9999 font-bold animate-pop">
      ⚠️ Error: No se pudo conectar con el servidor ({{ serverError }})
    </div>

    <!-- Initial Loading State -->
    <div v-if="loading" class="min-h-dvh flex items-center justify-center">
      <div class="animate-spin h-10 w-10 border-3 border-white/10 border-t-primary rounded-full"></div>
    </div>

    <!-- Main View Transition (Only after loading) -->
    <Transition v-else name="fade-slide" mode="out-in">
      <div v-if="!authenticated" key="auth" class="min-h-dvh flex items-center justify-center">
        <AuthForm @success="handleLogin" />
      </div>

      <div v-else key="app" class="relative min-h-dvh w-full flex flex-col">
        <!-- Header with Navigation -->
        <header class="flex justify-between items-center py-4 px-4 sm:px-6 mb-2 border-b border-white/5 mx-auto max-w-4xl w-full">
          <!-- Navigation Tabs -->
          <nav class="flex gap-2">
            <button
              @click="currentView = 'tasks'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
              :class="currentView === 'tasks' ? 'bg-primary text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'"
            >
              📋 Tareas
            </button>
            <button
              @click="currentView = 'accounts'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
              :class="currentView === 'accounts' ? 'bg-primary text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'"
            >
              💳 Cuentas
            </button>
          </nav>

          <!-- User Info & Logout -->
          <div class="flex items-center gap-3 sm:gap-4">
            <span class="text-text-secondary text-sm font-medium truncate max-w-[150px] sm:max-w-none">Hola, {{ user?.name }}</span>
            <button 
              @click="logout" 
              class="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-text-secondary hover:bg-danger/10 hover:text-danger hover:border-danger/30 active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-2"
              title="Cerrar Sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:hidden">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span class="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </header>

        <main class="flex-1 w-full flex flex-col">
          <Transition name="fade-slide" mode="out-in">
            <TaskManager v-if="currentView === 'tasks'" key="tasks" />
            <AccountsManager v-else key="accounts" />
          </Transition>
        </main>
      </div>
    </Transition>
  </div>
</template>

<style>
/* View Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s var(--ease-card);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
  filter: blur(4px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  filter: blur(4px);
}
</style>
