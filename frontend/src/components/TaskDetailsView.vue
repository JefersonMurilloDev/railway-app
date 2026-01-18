<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Task } from '../services/api';
import { getAccounts, createAccount, type Account } from '../services/accounts';

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: 'update', task: Partial<Task>): void;
  (e: 'back'): void;
  (e: 'toggle'): void;
  (e: 'delete'): void;
}>();

// Estado local editable
const localTask = ref({
  title: props.task.title,
  description: props.task.description || '',
  priority: props.task.priority,
  dueDate: props.task.dueDate?.split('T')[0] || '',
  accountId: props.task.accountId || null as string | null,
});

// Cuentas disponibles
const accounts = ref<Account[]>([]);
const loadingAccounts = ref(true);
const showAccountSelect = ref(false);
const showNewAccountForm = ref(false);
const creatingAccount = ref(false);

// Formulario de nueva cuenta completo
const newAccountForm = ref({
  name: '',
  initialBalance: 0,
  currency: 'COP' as 'USD' | 'COP' | 'EUR',
  type: 'corriente' as 'corriente' | 'ahorros' | 'efectivo' | 'credito' | 'otro',
  color: '#7c3aed'
});

// Opciones de moneda
const currencyOptions = [
  { value: 'COP', label: '🇨🇴 COP', symbol: '$' },
  { value: 'USD', label: '🇺🇸 USD', symbol: '$' },
  { value: 'EUR', label: '🇪🇺 EUR', symbol: '€' }
];

// Opciones de tipo de cuenta
const accountTypeOptions = [
  { value: 'corriente', label: 'Corriente', icon: '🏦' },
  { value: 'ahorros', label: 'Ahorros', icon: '💰' },
  { value: 'efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'credito', label: 'Crédito', icon: '💳' },
  { value: 'otro', label: 'Otro', icon: '📁' }
];

// Colores predefinidos
const colorOptions = ['#7c3aed', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#6366F1', '#14B8A6', '#F97316'];

// Estado de guardado
const hasChanges = ref(false);
const saving = ref(false);

// Detectar cambios
watch(localTask, () => {
  hasChanges.value = true;
}, { deep: true });

// Cargar cuentas
const fetchAccounts = async () => {
  try {
    loadingAccounts.value = true;
    accounts.value = await getAccounts();
  } catch (err) {
    console.error('Error cargando cuentas:', err);
  } finally {
    loadingAccounts.value = false;
  }
};

// Cuenta seleccionada
const selectedAccount = computed(() => {
  return accounts.value.find(a => a._id === localTask.value.accountId) || null;
});

// Formatear moneda
const formatCurrency = (value: number, currency: string): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(value);
};

// Seleccionar cuenta
const selectAccount = (account: Account) => {
  localTask.value.accountId = account._id!;
  showAccountSelect.value = false;
};

// Desvincular cuenta
const unlinkAccount = () => {
  localTask.value.accountId = null;
};

// Crear nueva cuenta completa
const handleCreateQuickAccount = async () => {
  if (!newAccountForm.value.name.trim()) return;
  
  try {
    creatingAccount.value = true;
    const newAccount = await createAccount({
      name: newAccountForm.value.name.trim(),
      initialBalance: newAccountForm.value.initialBalance,
      currency: newAccountForm.value.currency,
      type: newAccountForm.value.type,
      color: newAccountForm.value.color
    });
    accounts.value.unshift(newAccount);
    localTask.value.accountId = newAccount._id!;
    // Resetear formulario
    newAccountForm.value = {
      name: '',
      initialBalance: 0,
      currency: 'COP',
      type: 'corriente',
      color: '#7c3aed'
    };
    showNewAccountForm.value = false;
    showAccountSelect.value = false;
  } catch (err) {
    console.error('Error creando cuenta:', err);
  } finally {
    creatingAccount.value = false;
  }
};

// Guardar cambios
const handleSave = () => {
  saving.value = true;
  emit('update', {
    title: localTask.value.title,
    description: localTask.value.description || undefined,
    priority: localTask.value.priority,
    dueDate: localTask.value.dueDate || undefined,
    accountId: localTask.value.accountId || undefined,
  });
  hasChanges.value = false;
  saving.value = false;
};

// Prioridad
const priorityOptions = [
  { value: 'low', label: 'Baja', color: 'bg-success', textColor: 'text-success' },
  { value: 'medium', label: 'Media', color: 'bg-warning', textColor: 'text-warning' },
  { value: 'high', label: 'Alta', color: 'bg-danger', textColor: 'text-danger' },
];

const currentPriority = computed(() => {
  return priorityOptions.find(p => p.value === localTask.value.priority) || priorityOptions[1];
});

// Obtener etiqueta de tipo de cuenta
const getAccountTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    corriente: 'Cuenta Corriente',
    ahorros: 'Cuenta de Ahorros',
    efectivo: 'Efectivo',
    credito: 'Crédito',
    otro: 'Otro'
  };
  return labels[type] || type;
};

// Obtener color de la barra de progreso según porcentaje disponible
const getProgressColor = (currentBalance: number, initialBalance: number): string => {
  if (initialBalance <= 0) return '#10B981'; // Verde si no hay presupuesto
  const percentage = (currentBalance / initialBalance) * 100;
  if (percentage > 50) return '#10B981'; // Verde
  if (percentage > 25) return '#F59E0B'; // Amarillo
  return '#EF4444'; // Rojo
};

onMounted(fetchAccounts);
</script>

<template>
  <div class="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
    <!-- Header con navegación -->
    <div class="flex items-center justify-between mb-6">
      <button
        @click="emit('back')"
        class="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Volver</span>
      </button>

      <div class="flex items-center gap-2">
        <!-- Toggle completado -->
        <button
          @click="emit('toggle')"
          class="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          :class="task.completed 
            ? 'bg-success/20 text-success border border-success/30' 
            : 'bg-white/5 text-text-muted border border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/30'"
        >
          <svg v-if="task.completed" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {{ task.completed ? 'Completada' : 'Marcar completada' }}
        </button>

        <!-- Eliminar -->
        <button
          @click="emit('delete')"
          class="p-2 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:bg-danger/20 hover:text-danger hover:border-danger/30 transition-all"
          title="Eliminar tarea"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Contenido principal - Layout de dos columnas -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- Columna izquierda: Detalles de la tarea -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Título -->
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <input
            v-model="localTask.title"
            type="text"
            class="w-full bg-transparent text-2xl font-bold text-text-primary placeholder-white/30 focus:outline-none border-none"
            placeholder="Título de la tarea"
          />
          <textarea
            v-model="localTask.description"
            class="w-full mt-4 bg-transparent text-text-secondary placeholder-white/30 focus:outline-none border-none resize-none min-h-[100px]"
            placeholder="Añade una descripción o notas..."
            rows="4"
          ></textarea>
        </div>

        <!-- Propiedades -->
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
          <!-- Fecha de vencimiento -->
          <div class="flex items-center justify-between py-2 border-b border-white/5">
            <span class="text-text-muted text-sm">📅 Fecha de vencimiento</span>
            <input
              v-model="localTask.dueDate"
              type="date"
              class="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <!-- Prioridad -->
          <div class="flex items-center justify-between py-2 border-b border-white/5">
            <span class="text-text-muted text-sm">🎯 Prioridad</span>
            <div class="flex gap-2">
              <button
                v-for="p in priorityOptions"
                :key="p.value"
                @click="localTask.priority = p.value as 'low' | 'medium' | 'high'"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                :class="localTask.priority === p.value 
                  ? `${p.color}/20 ${p.textColor} border-current` 
                  : 'bg-white/5 text-text-muted border-transparent hover:bg-white/10'"
              >
                {{ p.label }}
              </button>
            </div>
          </div>

          <!-- Estado -->
          <div class="flex items-center justify-between py-2">
            <span class="text-text-muted text-sm">📊 Estado</span>
            <span
              class="px-3 py-1.5 rounded-lg text-xs font-medium"
              :class="task.completed ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'"
            >
              {{ task.completed ? 'Completada' : 'Pendiente' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Columna derecha: Cuenta vinculada -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 class="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            💳 Cuenta Vinculada
          </h3>

          <!-- Cuenta seleccionada -->
          <div v-if="selectedAccount" class="relative">
            <div
              class="p-4 rounded-xl border-2 transition-all"
              :style="{ borderColor: selectedAccount.color + '50', backgroundColor: selectedAccount.color + '10' }"
            >
              <!-- Header con nombre y desvincular -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: selectedAccount.color }"></div>
                  <span class="font-semibold text-text-primary">{{ selectedAccount.name }}</span>
                </div>
                <button
                  @click="unlinkAccount"
                  class="text-text-muted hover:text-danger text-xs transition-colors"
                >
                  Desvincular
                </button>
              </div>

              <!-- Desglose del presupuesto -->
              <div class="space-y-3">
                <!-- Presupuesto original -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-text-muted">💵 Presupuesto</span>
                  <span class="font-semibold text-text-primary">
                    {{ formatCurrency(selectedAccount.initialBalance, selectedAccount.currency) }}
                  </span>
                </div>

                <!-- Gastado -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-text-muted">🔴 Gastado</span>
                  <span class="font-semibold text-danger">
                    -{{ formatCurrency(selectedAccount.totalExpenses ?? 0, selectedAccount.currency) }}
                  </span>
                </div>

                <!-- Separador -->
                <div class="border-t border-white/10"></div>

                <!-- Disponible -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-text-muted">✅ Disponible</span>
                  <span class="text-xl font-bold" :style="{ color: selectedAccount.color }">
                    {{ formatCurrency(selectedAccount.currentBalance ?? 0, selectedAccount.currency) }}
                  </span>
                </div>

                <!-- Barra de progreso -->
                <div class="mt-2">
                  <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :style="{ 
                        width: `${Math.max(0, Math.min(100, ((selectedAccount.currentBalance ?? 0) / selectedAccount.initialBalance) * 100))}%`,
                        backgroundColor: getProgressColor(selectedAccount.currentBalance ?? 0, selectedAccount.initialBalance)
                      }"
                    ></div>
                  </div>
                  <div class="flex justify-between text-xs text-text-muted mt-1">
                    <span>{{ Math.round(((selectedAccount.currentBalance ?? 0) / selectedAccount.initialBalance) * 100) || 0 }}% disponible</span>
                    <span>{{ getAccountTypeLabel(selectedAccount.type) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Selector de cuenta -->
          <div v-else>
            <div v-if="!showAccountSelect && !showNewAccountForm">
              <button
                @click="showAccountSelect = true"
                class="w-full p-4 rounded-xl border-2 border-dashed border-white/20 text-text-muted hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Vincular cuenta
              </button>
            </div>

            <!-- Lista de cuentas -->
            <div v-if="showAccountSelect" class="space-y-3">
              <div v-if="loadingAccounts" class="text-center py-4">
                <div class="animate-spin h-6 w-6 border-2 border-white/10 border-t-primary rounded-full mx-auto"></div>
              </div>
              
              <template v-else>
                <div
                  v-for="account in accounts"
                  :key="account._id"
                  @click="selectAccount(account)"
                  class="p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 hover:border-primary/30 transition-all"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: account.color }"></div>
                    <span class="font-medium text-text-primary">{{ account.name }}</span>
                    <span class="ml-auto text-sm text-text-muted">
                      {{ formatCurrency(account.currentBalance ?? 0, account.currency) }}
                    </span>
                  </div>
                </div>

                <button
                  @click="showNewAccountForm = true; showAccountSelect = false"
                  class="w-full p-3 rounded-xl border border-dashed border-white/20 text-text-muted hover:border-primary/40 hover:text-primary transition-all text-sm"
                >
                  + Crear nueva cuenta
                </button>

                <button
                  @click="showAccountSelect = false"
                  class="w-full text-center text-xs text-text-muted hover:text-text-secondary transition-colors"
                >
                  Cancelar
                </button>
              </template>
            </div>

            <!-- Formulario de nueva cuenta completo -->
            <div v-if="showNewAccountForm" class="space-y-4">
              <!-- Nombre -->
              <div>
                <label class="block text-xs text-text-muted mb-1">Nombre de la cuenta</label>
                <input
                  v-model="newAccountForm.name"
                  type="text"
                  placeholder="Ej: Gastos de enero"
                  class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-text-primary focus:border-primary focus:outline-none"
                  autofocus
                />
              </div>

              <!-- Balance inicial -->
              <div>
                <label class="block text-xs text-text-muted mb-1">Presupuesto / Balance inicial</label>
                <input
                  v-model.number="newAccountForm.initialBalance"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <!-- Moneda -->
              <div>
                <label class="block text-xs text-text-muted mb-1">Moneda</label>
                <div class="flex gap-2">
                  <button
                    v-for="curr in currencyOptions"
                    :key="curr.value"
                    @click="newAccountForm.currency = curr.value as 'COP' | 'USD' | 'EUR'"
                    class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border"
                    :class="newAccountForm.currency === curr.value 
                      ? 'bg-primary/20 text-primary border-primary/50' 
                      : 'bg-white/5 text-text-muted border-white/10 hover:bg-white/10'"
                  >
                    {{ curr.label }}
                  </button>
                </div>
              </div>

              <!-- Tipo de cuenta -->
              <div>
                <label class="block text-xs text-text-muted mb-1">Tipo de cuenta</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="accType in accountTypeOptions"
                    :key="accType.value"
                    @click="newAccountForm.type = accType.value as 'corriente' | 'ahorros' | 'efectivo' | 'credito' | 'otro'"
                    class="px-2 py-2 rounded-lg text-xs font-medium transition-all border flex flex-col items-center gap-1"
                    :class="newAccountForm.type === accType.value 
                      ? 'bg-primary/20 text-primary border-primary/50' 
                      : 'bg-white/5 text-text-muted border-white/10 hover:bg-white/10'"
                  >
                    <span class="text-lg">{{ accType.icon }}</span>
                    <span>{{ accType.label }}</span>
                  </button>
                </div>
              </div>

              <!-- Color -->
              <div>
                <label class="block text-xs text-text-muted mb-1">Color</label>
                <div class="flex gap-2 flex-wrap">
                  <button
                    v-for="color in colorOptions"
                    :key="color"
                    @click="newAccountForm.color = color"
                    class="w-8 h-8 rounded-full transition-all border-2"
                    :style="{ backgroundColor: color }"
                    :class="newAccountForm.color === color 
                      ? 'border-white scale-110' 
                      : 'border-transparent hover:scale-105'"
                  ></button>
                </div>
              </div>

              <!-- Botones -->
              <div class="flex gap-2 pt-2">
                <button
                  @click="showNewAccountForm = false"
                  class="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-text-muted hover:bg-white/10 transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  @click="handleCreateQuickAccount"
                  :disabled="creatingAccount || !newAccountForm.name.trim()"
                  class="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50 transition-all text-sm"
                >
                  {{ creatingAccount ? 'Creando...' : 'Crear cuenta' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón guardar -->
        <button
          v-if="hasChanges"
          @click="handleSave"
          :disabled="saving"
          class="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 animate-pop"
        >
          <span v-if="saving" class="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
          {{ saving ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pop {
  animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes pop {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
