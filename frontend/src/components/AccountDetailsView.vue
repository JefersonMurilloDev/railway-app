<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Account } from '../services/accounts';
import { getExpenses, deleteExpense, getExpenseImageUrl, type Expense } from '../services/expenses';
import AddExpenseModal from './AddExpenseModal.vue';

const props = defineProps<{
  account: Account;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const expenses = ref<Expense[]>([]);
const loading = ref(true);
const showAddModal = ref(false);
const editingExpense = ref<Expense | null>(null);

// Formatear moneda usando la de la cuenta
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: props.account.currency || 'USD',
        minimumFractionDigits: 0,
    }).format(value);
};

// Formatear fecha
const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Calcular totales
const totalExpenses = computed(() => expenses.value.reduce((sum, e) => sum + e.amount, 0));
const currentBalance = computed(() => (props.account.initialBalance || 0) - totalExpenses.value);
const pendingReceipts = computed(() => expenses.value.filter(e => !e.hasReceipt).length);

// Filtrar para mostrar solo gastos
const visibleExpenses = computed(() => expenses.value.filter(e => e.amount > 0));

// Cargar gastos
const fetchExpenses = async () => {
    try {
        loading.value = true;
        expenses.value = await getExpenses(props.account._id);
    } catch (error) {
        console.error('Error cargando gastos:', error);
    } finally {
        loading.value = false;
    }
};

// Eliminar gasto
const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este gasto?')) return;
    try {
        await deleteExpense(id);
        expenses.value = expenses.value.filter(e => e._id !== id);
    } catch (error) {
        console.error('Error eliminando gasto:', error);
    }
};

// Manejar creación exitosa
const handleExpenseCreated = (expense: Expense) => {
    expenses.value.unshift(expense);
    showAddModal.value = false;
    editingExpense.value = null;
};

// Manejar actualización exitosa
const handleExpenseUpdated = (expense: Expense) => {
    const index = expenses.value.findIndex(e => e._id === expense._id);
    if (index !== -1) expenses.value[index] = expense;
    showAddModal.value = false;
    editingExpense.value = null;
};

// Abrir modal de edición
const openEditModal = (expense: Expense) => {
    editingExpense.value = expense;
    showAddModal.value = true;
};

// Cancelar modal
const handleCancelModal = () => {
    showAddModal.value = false;
    editingExpense.value = null;
};

// Obtener badge de categoría
const getCategoryBadge = (category: string): { color: string; label: string } => {
    const categories: Record<string, { color: string; label: string }> = {
        'Salud': { color: 'bg-green-500/20 text-green-400', label: 'Salud' },
        'Comida': { color: 'bg-orange-500/20 text-orange-400', label: 'Comida' },
        'Servicios': { color: 'bg-purple-500/20 text-purple-400', label: 'Servicios' },
        'Transporte': { color: 'bg-blue-500/20 text-blue-400', label: 'Transporte' },
        'General': { color: 'bg-gray-500/20 text-gray-400', label: 'General' },
    };
    return categories[category] ?? { color: 'bg-gray-500/20 text-gray-400', label: category };
};

onMounted(fetchExpenses);
</script>

<template>
  <div class="flex-1 max-w-6xl mx-auto w-full px-4 py-8 pb-10 flex flex-col h-[calc(100vh-80px)] overflow-hidden">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 shrink-0">
      <div class="flex items-center gap-4">
        <button
          @click="emit('back')"
          class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-primary transition-all active:scale-95 cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div>
          <h1
            class="text-3xl font-black tracking-tight"
            :style="{ color: account.color }"
          >
            {{ account.name }}
          </h1>
          <p class="text-text-muted text-xs font-medium uppercase tracking-widest mt-1">Gestión de Movimientos y Balance</p>
        </div>
      </div>
      
      <button
        @click="showAddModal = true"
        class="group relative px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all overflow-hidden cursor-pointer"
      >
        <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        <span class="relative flex items-center gap-2">
          <span class="text-lg leading-none">+</span> Nueva Transacción
        </span>
      </button>
    </div>

    <!-- Scrollable Content Container -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 space-y-8">
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Balance -->
        <div class="glass-card hover:bg-white/3 transition-colors p-6 flex flex-col justify-between group">
          <div class="flex justify-between items-start mb-4">
            <div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
              💎
            </div>
            <span class="text-[10px] bg-white/5 px-2 py-1 rounded-lg text-text-muted font-mono tracking-wider">TOTAL</span>
          </div>
          <div>
            <p class="text-text-muted text-[10px] font-black uppercase tracking-widest mb-1">Balance Disponible</p>
            <p class="text-3xl font-black tracking-tight text-white mb-1" :class="currentBalance >= 0 ? 'text-white' : 'text-danger'">
              {{ formatCurrency(currentBalance) }}
            </p>
            <p class="text-xs font-medium" :class="currentBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'">
              {{ currentBalance >= 0 ? '▲ Saludable' : '▼ En negativo' }}
            </p>
          </div>
        </div>

        <!-- Gastos -->
        <div class="glass-card hover:bg-white/3 transition-colors p-6 flex flex-col justify-between group">
          <div class="flex justify-between items-start mb-4">
            <div class="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
              📉
            </div>
            <span class="text-[10px] bg-white/5 px-2 py-1 rounded-lg text-text-muted font-mono tracking-wider">MES</span>
          </div>
          <div>
            <p class="text-text-muted text-[10px] font-black uppercase tracking-widest mb-1">Gastos Totales</p>
            <p class="text-3xl font-black tracking-tight text-rose-400 mb-1">
              {{ formatCurrency(totalExpenses) }}
            </p>
            <p class="text-xs text-text-muted font-medium">Mayor gasto esta semana</p>
          </div>
        </div>

        <!-- Pendientes -->
        <div class="glass-card hover:bg-white/3 transition-colors p-6 flex flex-col justify-between group">
          <div class="flex justify-between items-start mb-4">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
              ⚡
            </div>
             <span class="text-[10px] bg-white/5 px-2 py-1 rounded-lg text-text-muted font-mono tracking-wider">ACTION</span>
          </div>
          <div>
            <p class="text-text-muted text-[10px] font-black uppercase tracking-widest mb-1">Por Procesar</p>
            <p class="text-3xl font-black tracking-tight text-white mb-1">
              {{ pendingReceipts }}
            </p>
            <p class="text-xs text-amber-400 font-medium">Recibos pendientes</p>
          </div>
        </div>
      </div>

      <!-- Transacciones List -->
      <div class="glass-card overflow-hidden flex flex-col">
        <!-- Toolbar -->
        <div class="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <span class="w-1 h-6 bg-primary rounded-full"></span>
            Transacciones
          </h2>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="p-12 text-center text-text-muted">
          <div class="animate-spin h-8 w-8 border-2 border-white/10 border-t-primary rounded-full mx-auto mb-4"></div>
          <p class="text-sm font-medium animate-pulse">Sincronizando movimientos...</p>
        </div>

        <!-- Empty -->
        <div v-else-if="expenses.length === 0" class="p-16 text-center flex flex-col items-center">
          <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner ring-1 ring-white/10">✨</div>
          <h3 class="text-xl font-bold text-white mb-2">Comienza tu historial</h3>
          <p class="text-text-muted max-w-xs mx-auto text-sm">Registra tu primera transacción para ver el análisis detallado de tus finanzas.</p>
          <button 
             @click="showAddModal = true"
             class="mt-6 px-6 py-2 rounded-lg bg-white/5 text-primary text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
          >
            Crear ahora
          </button>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-black/20">
              <tr class="text-left text-[10px] uppercase font-black tracking-widest text-text-muted">
                <th class="p-5 pl-8">Concepto</th>
                <th class="p-5">Categoría</th>
                <th class="p-5">Fecha</th>
                <th class="p-5">Recibo</th>
                <th class="p-5 text-right">Monto</th>
                <th class="p-5 text-center pr-8">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr
                v-for="expense in visibleExpenses"
                :key="expense._id"
                class="hover:bg-white/2 transition-colors group"
              >
                <td class="p-5 pl-8">
                  <div class="flex items-center gap-4">
                    <div 
                      class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
                      :class="expense.amount >= 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'"
                    >
                      {{ expense.amount >= 0 ? '💸' : '💰' }}
                    </div>
                    <div>
                      <p class="font-bold text-text-primary text-sm group-hover:text-white transition-colors">{{ expense.description }}</p>
                      <p class="text-[10px] text-text-muted mt-0.5">{{ expense._id?.substring(expense._id.length - 6) }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-5">
                  <span
                    class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                    :class="getCategoryBadge(expense.category ?? 'General').color"
                  >
                    {{ getCategoryBadge(expense.category ?? 'General').label }}
                  </span>
                </td>
                <td class="p-5">
                   <div class="flex flex-col">
                      <span class="text-xs font-bold text-text-secondary">{{ formatDate(expense.date ?? new Date().toISOString()) }}</span>
                      <span class="text-[10px] text-text-muted">Procesado</span>
                   </div>
                </td>
                <td class="p-5">
                  <a
                    v-if="expense.hasReceipt"
                    :href="getExpenseImageUrl(expense._id!)"
                    target="_blank"
                    class="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover hover:underline decoration-2 underline-offset-4 transition-colors"
                  >
                    <span>📎</span> Ver Adjunto
                  </a>
                  <span v-else class="text-[10px] text-text-muted font-medium opacity-50">--</span>
                </td>
                <td class="p-5 text-right">
                  <span class="font-bold text-sm tracking-tight" :class="expense.amount >= 0 ? 'text-rose-400' : 'text-emerald-400'">
                    {{ expense.amount >= 0 ? '-' : '+' }}{{ formatCurrency(Math.abs(expense.amount)) }}
                  </span>
                </td>
                <td class="p-5 pr-8">
                  <div class="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      @click="openEditModal(expense)"
                      class="w-8 h-8 rounded-lg bg-white/5 text-text-muted hover:bg-primary/20 hover:text-primary transition-all flex items-center justify-center cursor-pointer"
                      title="Editar"
                    >
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button
                      @click="handleDelete(expense._id!)"
                      class="w-8 h-8 rounded-lg bg-white/5 text-text-muted hover:bg-danger/20 hover:text-danger transition-all flex items-center justify-center cursor-pointer"
                      title="Eliminar"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PaginationFooter -->
         <div v-if="expenses.length > 0" class="flex items-center justify-between p-6 border-t border-white/5 bg-black/10">
          <p class="text-xs text-text-muted font-medium">Mostrando <span class="text-white">{{ visibleExpenses.length }}</span> registros</p>
          <div class="flex gap-2">
            <button class="px-4 py-2 rounded-lg bg-white/5 text-xs font-bold uppercase tracking-wider text-text-muted hover:bg-white/10 hover:text-white transition-all disabled:opacity-50" disabled>
              Anterior
            </button>
            <button class="px-4 py-2 rounded-lg bg-white/5 text-xs font-bold uppercase tracking-wider text-text-muted hover:bg-white/10 hover:text-white transition-all">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Expense Modal -->
    <Transition name="modal">
      <div
        v-if="showAddModal"
        @click.self="handleCancelModal"
        class="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center z-200 p-4 items-center"
      >
        <AddExpenseModal
          :account-id="account._id!"
          :initial-data="editingExpense"
          @created="handleExpenseCreated"
          @updated="handleExpenseUpdated"
          @cancel="handleCancelModal"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
