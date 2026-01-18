<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TaskManager from './components/TaskManager.vue';
import AccountsManager from './components/AccountsManager.vue';
import AuthForm from './components/AuthForm.vue';
import { isAuthenticated, getUser, logout as authLogout, deleteAccount as authDeleteAccount, type User } from './services/auth';

const authenticated = ref(false);
const user = ref<User | null>(null);
const loading = ref(true);
const serverError = ref<string | null>(null);
const currentView = ref<'tasks' | 'accounts'>('tasks');
const showDeleteModal = ref(false);
const deleteLoading = ref(false);

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

const handleDeleteAccount = async () => {
    deleteLoading.value = true;
    try {
        await authDeleteAccount();
        authenticated.value = false;
        user.value = null;
        showDeleteModal.value = false;
    } catch (err) {
        console.error('Error al eliminar cuenta:', err);
    } finally {
        deleteLoading.value = false;
    }
};
</script>

<template>
  <div class="h-full w-full bg-bg-primary text-text-primary font-sans antialiased overflow-hidden selection:bg-primary selection:text-white flex flex-col">
    <!-- Animated Warning -->
    <div v-if="serverError" class="fixed top-0 left-0 w-full bg-danger text-white text-center py-2 z-9999 font-bold animate-pop">
      ⚠️ Error: No se pudo conectar con el servidor ({{ serverError }})
    </div>

    <!-- Initial Loading State -->
    <div v-if="loading" class="h-full flex items-center justify-center">
      <div class="animate-spin h-10 w-10 border-3 border-white/10 border-t-primary rounded-full"></div>
    </div>

    <!-- Main View Transition (Only after loading) -->
    <Transition v-else name="fade-slide" mode="out-in">
      <div v-if="!authenticated" key="auth" class="h-full flex items-center justify-center overflow-y-auto">
        <AuthForm @success="handleLogin" />
      </div>

      <div v-else key="app" class="relative h-full w-full flex flex-col overflow-hidden">
        <!-- Header with Navigation -->
        <header class="flex-none flex justify-between items-center py-6 px-6 sm:px-8 mb-4 border-b border-white/5 mx-auto max-w-6xl w-full">
          <!-- Navigation Tabs -->
          <nav class="flex bg-white/5 p-1 rounded-xl border border-white/5">
            <button
              @click="currentView = 'tasks'"
              class="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300"
              :class="currentView === 'tasks' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text-primary'"
            >
              📋 Tareas
            </button>
            <button
              @click="currentView = 'accounts'"
              class="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300"
              :class="currentView === 'accounts' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text-primary'"
            >
              💳 Cuentas
            </button>
          </nav>

          <!-- User Info & Actions -->
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="text-text-secondary text-sm font-medium truncate max-w-[100px] sm:max-w-none hidden sm:inline">Hola, {{ user?.name }}</span>
            
            <!-- Botón Eliminar Cuenta -->
            <button 
              @click="showDeleteModal = true" 
              class="p-2 rounded-lg bg-white/5 border border-white/10 text-text-muted hover:bg-danger/10 hover:text-danger hover:border-danger/30 active:scale-95 transition-all duration-300 cursor-pointer"
              title="Eliminar mi cuenta"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>

            <!-- Botón Cerrar Sesión -->
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

        <main class="flex-1 w-full flex flex-col overflow-hidden relative">
          <Transition name="fade-slide" mode="out-in">
            <TaskManager v-if="currentView === 'tasks'" key="tasks" />
            <AccountsManager v-else key="accounts" />
          </Transition>
        </main>

        <!-- Delete Account Confirmation Modal -->
        <Teleport to="body">
          <Transition name="fade-slide">
            <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" @click.self="showDeleteModal = false">
              <div class="bg-bg-secondary border border-white/10 rounded-2xl p-6 w-full max-w-md animate-pop">
                <div class="text-center mb-6">
                  <div class="mx-auto w-14 h-14 rounded-full bg-danger/20 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 class="text-xl font-bold text-text-primary mb-2">¿Eliminar cuenta?</h2>
                  <p class="text-text-muted text-sm">
                    Esta acción es <strong class="text-danger">permanente e irreversible</strong>. Se eliminarán todas tus tareas, cuentas y gastos.
                  </p>
                </div>

                <div class="flex gap-3">
                  <button
                    @click="showDeleteModal = false"
                    class="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-medium text-text-secondary hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    @click="handleDeleteAccount"
                    :disabled="deleteLoading"
                    class="flex-1 px-4 py-3 bg-danger text-white rounded-xl font-medium hover:bg-danger/80 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <span v-if="deleteLoading" class="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                    {{ deleteLoading ? 'Eliminando...' : 'Sí, eliminar todo' }}
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </Teleport>
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
