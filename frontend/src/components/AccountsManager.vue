<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
    getAccounts, 
    getAccountStats, 
    createAccount, 
    updateAccount, 
    deleteAccount,
    type Account,
    type AccountStats 
} from '../services/accounts';
import AccountCard from './AccountCard.vue';
import CreateAccountModal from './CreateAccountModal.vue';
import AccountDetailsView from './AccountDetailsView.vue';

const accounts = ref<Account[]>([]);
const stats = ref<AccountStats | null>(null);
const loading = ref(true);
const showCreateModal = ref(false);
const editingAccount = ref<Account | null>(null);
const selectedAccount = ref<Account | null>(null);

// Formatear número sin símbolo de moneda (para stats globales con varias monedas)
const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
    }).format(value);
};

// Cargar datos
const fetchData = async () => {
    try {
        loading.value = true;
        const [accountsData, statsData] = await Promise.all([
            getAccounts(),
            getAccountStats(),
        ]);
        accounts.value = accountsData;
        stats.value = statsData;
    } catch (error) {
        console.error('Error cargando cuentas:', error);
    } finally {
        loading.value = false;
    }
};

// Crear cuenta
const handleCreateAccount = async (accountData: Partial<Account>) => {
    try {
        const newAccount = await createAccount(accountData);
        accounts.value.unshift(newAccount);
        showCreateModal.value = false;
        await fetchData(); // Refresh stats
    } catch (error) {
        console.error('Error creando cuenta:', error);
    }
};

// Actualizar cuenta
const handleUpdateAccount = async (accountData: Partial<Account>) => {
    if (!editingAccount.value?._id) return;
    try {
        const updated = await updateAccount(editingAccount.value._id, accountData);
        const index = accounts.value.findIndex(a => a._id === updated._id);
        if (index !== -1) accounts.value[index] = updated;
        editingAccount.value = null;
        showCreateModal.value = false;
        await fetchData();
    } catch (error) {
        console.error('Error actualizando cuenta:', error);
    }
};

// Eliminar cuenta
const handleDeleteAccount = async (id: string) => {
    if (!confirm('¿Eliminar esta cuenta y todos sus gastos?')) return;
    try {
        await deleteAccount(id);
        accounts.value = accounts.value.filter(a => a._id !== id);
        await fetchData();
    } catch (error) {
        console.error('Error eliminando cuenta:', error);
    }
};

// Abrir modal de edición
const openEditModal = (account: Account) => {
    editingAccount.value = account;
    showCreateModal.value = true;
};

// Cancelar modal
const handleCancelModal = () => {
    showCreateModal.value = false;
    editingAccount.value = null;
};

// Seleccionar cuenta para ver detalles
const selectAccount = (account: Account) => {
    selectedAccount.value = account;
};

// Volver a la vista de cuentas
const backToAccounts = () => {
    selectedAccount.value = null;
    fetchData();
};

onMounted(fetchData);
</script>

<template>
  <div class="flex-1 flex flex-col w-full">
    <!-- Vista de Detalles de Cuenta -->
    <AccountDetailsView
      v-if="selectedAccount"
      :account="selectedAccount"
      @back="backToAccounts"
    />

    <!-- Vista Principal de Cuentas -->
    <div v-else class="flex-1 max-w-4xl mx-auto w-full px-4 py-8 pb-28">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl md:text-5xl font-bold bg-linear-to-br from-indigo-500 via-primary to-purple-500 bg-clip-text text-transparent mb-2">
          TaskFlow
        </h1>
        <p class="text-text-muted">Gestiona tus finanzas, controla tu futuro</p>
      </header>

      <!-- Stats Cards -->
      <div v-if="stats && !loading" class="flex gap-3 justify-center mb-8 flex-wrap">
        <div class="flex flex-col items-center px-7 py-4 bg-white/5 border-2 border-success/30 rounded-xl min-w-[110px]">
          <span class="text-3xl font-bold text-success">$ {{ formatNumber(stats.totalBalance) }}</span>
          <span class="text-xs uppercase tracking-wider mt-1 text-text-muted">Total</span>
        </div>
        <div class="flex flex-col items-center px-7 py-4 bg-white/5 border-2 border-white/10 rounded-xl min-w-[110px]">
          <span class="text-3xl font-bold text-text-secondary">{{ stats.totalAccounts }}</span>
          <span class="text-xs uppercase tracking-wider mt-1 text-text-muted">Cuentas</span>
        </div>
        <div class="flex flex-col items-center px-7 py-4 bg-white/5 border-2 border-danger/30 rounded-xl min-w-[110px]">
          <span class="text-3xl font-bold text-danger">-$ {{ formatNumber(stats.totalExpensesThisMonth) }}</span>
          <span class="text-xs uppercase tracking-wider mt-1 text-text-muted">Gastos Mes</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-16 text-text-muted">
        <div class="animate-spin h-10 w-10 border-3 border-white/10 border-t-primary rounded-full mx-auto mb-4"></div>
        <p>Cargando cuentas...</p>
      </div>

      <!-- Accounts Section -->
      <div v-else>
        <div class="flex items-center mb-4">
          <h2 class="text-xl font-semibold">Mis Cuentas</h2>
        </div>

        <!-- Empty State -->
        <div v-if="accounts.length === 0" class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center py-16">
          <div class="text-6xl mb-4">💳</div>
          <h3 class="text-xl font-semibold text-text-primary mb-2">Sin cuentas</h3>
          <p class="text-text-muted mb-6">Crea tu primera cuenta para comenzar</p>
          <button @click="showCreateModal = true" class="px-5 py-3 rounded-xl font-bold text-white bg-linear-to-br from-indigo-500 via-primary to-purple-500 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
            + Crear primera cuenta
          </button>
        </div>

        <!-- Accounts Grid -->
        <transition-group v-else name="list" tag="div" class="space-y-3 relative">
          <AccountCard
            v-for="(account, index) in accounts"
            :key="account._id"
            :account="account"
            :style="{ transitionDelay: `${index * 50}ms` }"
            @click="selectAccount(account)"
            @edit="openEditModal(account)"
            @delete="handleDeleteAccount"
          />
        </transition-group>

        <!-- Add Account Card (Visual) -->
        <div
          v-if="accounts.length > 0"
          @click="showCreateModal = true"
          class="mt-3 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl p-6 text-center cursor-pointer hover:bg-white/10 hover:border-primary/40 transition-all duration-300 group"
        >
          <span class="text-2xl text-text-muted group-hover:text-primary transition-colors">+</span>
          <p class="text-text-muted group-hover:text-primary text-sm mt-1 transition-colors">Agregar otra cuenta</p>
        </div>
      </div>
    </div>

    <!-- FAB Button -->
    <button
      v-if="!showCreateModal && !selectedAccount"
      @click="showCreateModal = true"
      title="Nueva cuenta"
      class="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-linear-to-br from-primary to-purple-600 text-white cursor-pointer flex items-center justify-center shadow-lg shadow-primary/40 transition-all duration-300 hover:scale-110 hover:rotate-90 active:scale-90 z-50"
    >
      <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    </button>

    <!-- Create/Edit Account Modal -->
    <Transition name="modal">
      <div
        v-if="showCreateModal"
        @click.self="handleCancelModal"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center z-200 p-5 sm:items-center sm:p-5 items-end pb-0 sm:pb-5"
      >
        <CreateAccountModal
          :initial-data="editingAccount"
          @submit="editingAccount ? handleUpdateAccount($event) : handleCreateAccount($event)"
          @cancel="handleCancelModal"
        />
      </div>
    </Transition>

    <!-- Footer -->
    <footer class="text-center py-6 text-text-muted text-sm">
      <p>TaskFlow — Hecho con 💜</p>
    </footer>
  </div>
</template>

<style scoped>
/* List Transitions */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s var(--ease-spring);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.list-leave-active {
  position: absolute;
  width: 100%;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s var(--ease-card);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-bg-secondary,
.modal-leave-to .bg-bg-secondary {
  transform: scale(0.95) translateY(10px);
}
</style>
