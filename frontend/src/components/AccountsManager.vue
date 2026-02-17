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
  <div class="flex-1 flex flex-col w-full h-full">
    <!-- Vista de Detalles de Cuenta -->
    <Transition name="slide">
        <AccountDetailsView
            v-if="selectedAccount"
            :account="selectedAccount"
            @back="backToAccounts"
        />
    </Transition>

    <!-- Vista Principal de Cuentas -->
    <div v-show="!selectedAccount" class="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 pb-20 sm:pb-28 overflow-y-auto overflow-x-hidden custom-scrollbar">
      <!-- Workspace Header (Refined) -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-10 gap-4 sm:gap-6">
        <div>
          <h1 class="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-1 sm:mb-2">My Finance</h1>
          <p class="text-text-muted text-xs sm:text-sm max-w-md">Controla tus activos y cuentas bancarias.</p>
        </div>

        <div class="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto justify-start sm:justify-end">
             <!-- Placeholder for filters if needed in future -->
            <div class="hidden sm:block"></div> 

          <button 
            @click="showCreateModal = true"
            class="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-white text-bg-primary font-bold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-white/10"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Nueva Cuenta
          </button>
        </div>
      </div>

      <!-- Quick Metrics Bar (Minimalist) -->
      <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
        <div class="glass-card p-4 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all">
          <div>
            <p class="text-[10px] font-bold text-text-muted uppercase tracking-widest">Balance Total</p>
            <p class="text-xl sm:text-2xl font-black text-white mt-1">$ {{ formatNumber(stats.totalBalance) }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">💰</div>
        </div>
        <div class="glass-card p-4 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all">
          <div>
            <p class="text-[10px] font-bold text-text-muted uppercase tracking-widest">Cuentas</p>
            <p class="text-xl sm:text-2xl font-black text-white mt-1">{{ stats.totalAccounts }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">💳</div>
        </div>
        <div class="glass-card p-4 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all">
          <div>
            <p class="text-[10px] font-bold text-text-muted uppercase tracking-widest">Gastos del Mes</p>
            <p class="text-xl sm:text-2xl font-black text-white mt-1">$ {{ formatNumber(stats.totalExpensesThisMonth) }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">📉</div>
        </div>
         <div class="glass-card p-4 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all">
          <div>
            <p class="text-[10px] font-bold text-text-muted uppercase tracking-widest">Estado</p>
            <p class="text-xl sm:text-2xl font-black text-white mt-1">{{ stats.totalBalance >= 0 ? 'Positivo' : 'Negativo' }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">📊</div>
        </div>
      </div>

      <!-- Main List Container -->
      <div class="flex-1 min-h-0">
         <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
          <div class="animate-spin h-10 w-10 border-4 border-white/5 border-t-primary rounded-full"></div>
          <p class="text-text-muted font-bold text-xs uppercase tracking-widest">Cargando Finanzas...</p>
        </div>

        <div v-else class="space-y-4">
           <!-- Empty State -->
            <div v-if="accounts.length === 0" class="glass rounded-3xl p-20 text-center border border-white/5 space-y-6">
                <div class="text-7xl">💳</div>
                <div>
                    <h3 class="text-2xl font-black text-text-primary">Sin cuentas asociadas</h3>
                    <p class="text-text-muted mt-2">Agrega tu primera cuenta bancaria o efectivo.</p>
                </div>
                <button @click="showCreateModal = true" class="px-5 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-all">
                    Crear primera cuenta
                </button>
            </div>

            <!-- Accounts Grid -->
            <TransitionGroup 
                name="list" 
                tag="div" 
                class="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                <AccountCard
                    v-for="(account, index) in accounts"
                    :key="account._id"
                    :account="account"
                    :style="{ transitionDelay: `${index * 50}ms` }"
                    @click="selectAccount(account)"
                    @edit="openEditModal(account)"
                    @delete="handleDeleteAccount"
                />
            </TransitionGroup>
        </div>
      </div>
    </div>

    <!-- Create/Edit Account Modal -->
    <Transition name="modal">
      <div
        v-if="showCreateModal"
        @click.self="handleCancelModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4 sm:p-6"
      >
            <CreateAccountModal
                class="animate-pop"
                :initial-data="editingAccount"
                @submit="editingAccount ? handleUpdateAccount($event) : handleCreateAccount($event)"
                @cancel="handleCancelModal"
            />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
}

/* Slide Transition for Details */
.slide-enter-active, .slide-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-enter-from { transform: translateX(30px); opacity: 0; }
.slide-leave-to { transform: translateX(-30px); opacity: 0; }

/* List Transitions */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s var(--ease-spring);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
.list-leave-active {
  position: absolute;
  width: 100%; /* For grid items this might be tricky, usually leave-active absolute works best in lists. in Grid, leave absolute might mess up layout unless handled carefully. Removing absolute for grid safety or checking. */
}
</style>
