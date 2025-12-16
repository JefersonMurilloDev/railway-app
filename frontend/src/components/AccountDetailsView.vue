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
const filter = ref<'all' | 'gastos' | 'ingresos'>('all');

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

// Filtrar gastos
const filteredExpenses = computed(() => {
    switch (filter.value) {
        case 'gastos':
            return expenses.value.filter(e => e.amount > 0);
        case 'ingresos':
            return expenses.value.filter(e => e.amount < 0);
        default:
            return expenses.value;
    }
});

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
  <div class="flex-1 max-w-5xl mx-auto w-full px-4 py-8 pb-28">
    <!-- Header con Back -->
    <div class="flex items-center gap-4 mb-6">
      <button
        @click="emit('back')"
        class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-primary transition-all"
      >
        ←
      </button>
      <div>
        <h1
          class="text-2xl md:text-3xl font-bold"
          :style="{ color: account.color }"
        >
          {{ account.name }}
        </h1>
        <p class="text-text-muted text-sm">Gestiona tus gastos y visualiza tus transacciones recientes.</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p class="text-xs uppercase tracking-wider text-text-muted mb-1">Balance Actual</p>
        <p class="text-3xl font-bold" :class="currentBalance >= 0 ? 'text-success' : 'text-danger'">
          {{ formatCurrency(currentBalance) }}
        </p>
        <p class="text-xs text-success mt-1" v-if="currentBalance >= 0">↗ +12% vs mes anterior</p>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p class="text-xs uppercase tracking-wider text-text-muted mb-1">Gastos del Mes</p>
        <p class="text-3xl font-bold text-warning">{{ formatCurrency(totalExpenses) }}</p>
        <p class="text-xs text-primary mt-1">↑ Mayor gasto: Renta</p>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-2xl p-5">
        <p class="text-xs uppercase tracking-wider text-text-muted mb-1">Por Procesar</p>
        <p class="text-3xl font-bold text-text-secondary">{{ pendingReceipts }}</p>
        <p class="text-xs text-primary mt-1">📎 Recibos pendientes de revisión</p>
      </div>
    </div>

    <!-- Transacciones -->
    <div class="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div class="flex items-center justify-between p-5 border-b border-white/10">
        <h2 class="text-lg font-semibold">Transacciones Recientes</h2>
        <div class="flex gap-2">
          <button
            v-for="f in [{ key: 'all', label: 'Todo' }, { key: 'gastos', label: 'Gastos' }, { key: 'ingresos', label: 'Ingresos' }]"
            :key="f.key"
            @click="filter = f.key as any"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            :class="filter === f.key ? 'bg-primary text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="p-8 text-center text-text-muted">
        <div class="animate-spin h-8 w-8 border-2 border-white/10 border-t-primary rounded-full mx-auto mb-3"></div>
        <p>Cargando transacciones...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="expenses.length === 0" class="p-8 text-center">
        <div class="text-4xl mb-3">💸</div>
        <p class="text-text-muted">Sin transacciones aún</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-white/5">
            <tr class="text-left text-xs uppercase tracking-wider text-text-muted">
              <th class="p-4">Concepto</th>
              <th class="p-4">Categoría</th>
              <th class="p-4">Fecha</th>
              <th class="p-4">Recibo</th>
              <th class="p-4 text-right">Monto</th>
              <th class="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="expense in filteredExpenses"
              :key="expense._id"
              class="border-t border-white/5 hover:bg-white/5 transition-colors"
            >
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    💸
                  </div>
                  <div>
                    <p class="font-medium text-text-primary">{{ expense.description }}</p>
                    <p class="text-xs text-text-muted">{{ expense.category ?? 'General' }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getCategoryBadge(expense.category ?? 'General').color"
                >
                  {{ getCategoryBadge(expense.category ?? 'General').label }}
                </span>
              </td>
              <td class="p-4 text-text-muted text-sm">
                {{ formatDate(expense.date ?? new Date().toISOString()) }}
              </td>
              <td class="p-4">
                <a
                  v-if="expense.hasReceipt"
                  :href="getExpenseImageUrl(expense._id!)"
                  target="_blank"
                  class="text-primary text-sm hover:underline"
                >
                  📎 Ver recibo
                </a>
                <span v-else class="text-text-muted text-sm italic">Sin recibo</span>
              </td>
              <td class="p-4 text-right font-bold text-danger">
                -{{ formatCurrency(expense.amount) }}
              </td>
              <td class="p-4 text-center">
                <div class="flex gap-2 justify-center">
                  <button
                    @click="openEditModal(expense)"
                    class="w-7 h-7 rounded-lg bg-white/10 text-text-muted hover:bg-primary/20 hover:text-primary transition-all flex items-center justify-center"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    @click="handleDelete(expense._id!)"
                    class="w-7 h-7 rounded-lg bg-white/10 text-text-muted hover:bg-danger/20 hover:text-danger transition-all flex items-center justify-center"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="expenses.length > 0" class="flex items-center justify-between p-4 border-t border-white/10 text-sm text-text-muted">
        <p>Mostrando {{ filteredExpenses.length }} de {{ expenses.length }} transacciones</p>
        <div class="flex gap-2">
          <button class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            Anterior
          </button>
          <button class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- FAB -->
    <button
      v-if="!showAddModal"
      @click="showAddModal = true"
      title="Nuevo gasto"
      class="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-linear-to-br from-primary to-purple-600 text-white cursor-pointer flex items-center justify-center shadow-lg shadow-primary/40 transition-all duration-300 hover:scale-110 hover:rotate-90 active:scale-90 z-50"
    >
      <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    </button>

    <!-- Add/Edit Expense Modal -->
    <Transition name="modal">
      <div
        v-if="showAddModal"
        @click.self="handleCancelModal"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center z-200 p-5 sm:items-center sm:p-5 items-end pb-0 sm:pb-5"
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
