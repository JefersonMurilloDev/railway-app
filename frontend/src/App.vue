<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TaskManager from './components/TaskManager.vue';
import AuthForm from './components/AuthForm.vue';
import { isAuthenticated, getUser, logout, type User } from './services/auth';

const authenticated = ref(false);
const user = ref<User | null>(null);
const loading = ref(true);

// Verificar autenticación al cargar
onMounted(() => {
    checkAuth();
});

const checkAuth = () => {
    authenticated.value = isAuthenticated();
    user.value = getUser();
    loading.value = false;
};

const handleAuthSuccess = () => {
    checkAuth();
};

const handleLogout = () => {
    logout();
    authenticated.value = false;
    user.value = null;
};
</script>

<template>
    <div v-if="loading" class="loading-screen">
        <div class="spinner"></div>
    </div>
    
    <template v-else>
        <!-- Usuario autenticado: mostrar TaskManager -->
        <div v-if="authenticated" class="app-container">
            <header class="app-header">
                <div class="user-info">
                    <span class="user-greeting">Hola, {{ user?.name }}</span>
                    <button @click="handleLogout" class="logout-btn">
                        Cerrar sesión
                    </button>
                </div>
            </header>
            <main>
                <TaskManager />
            </main>
        </div>

        <!-- No autenticado: mostrar formulario de login -->
        <AuthForm v-else @success="handleAuthSuccess" />
    </template>
</template>

<style>
.loading-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.loading-screen .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: #8b5cf6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.app-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.app-header {
    padding: 16px 24px;
    display: flex;
    justify-content: flex-end;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.user-greeting {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.95rem;
}

.logout-btn {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.logout-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
    color: #fca5a5;
}
</style>
