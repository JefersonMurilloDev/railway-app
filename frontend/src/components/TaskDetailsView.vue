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

const newAccountForm = ref({
  name: '',
  initialBalance: 0,
  currency: 'COP' as 'USD' | 'COP' | 'EUR',
  type: 'corriente' as 'corriente' | 'ahorros' | 'efectivo' | 'credito' | 'otro',
  color: '#8b5cf6'
});

const accountTypeOptions = [
  { value: 'corriente', label: 'Corriente', icon: '🏦' },
  { value: 'ahorros', label: 'Ahorros', icon: '💰' },
  { value: 'efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'credito', label: 'Crédito', icon: '💳' },
  { value: 'otro', label: 'Otro', icon: '📁' }
];

const colorOptions = ['#8b5cf6', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#6366F1', '#14B8A6', '#F97316'];

const hasChanges = ref(false);
const saving = ref(false);

watch(localTask, () => {
  hasChanges.value = true;
}, { deep: true });

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

const selectedAccount = computed(() => {
  return accounts.value.find(a => a._id === localTask.value.accountId) || null;
});

const formatCurrency = (value: number, currency: string): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(value);
};

const selectAccount = (account: Account) => {
  localTask.value.accountId = account._id!;
  showAccountSelect.value = false;
};

const unlinkAccount = () => {
  localTask.value.accountId = null;
};

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
    newAccountForm.value = {
      name: '',
      initialBalance: 0,
      currency: 'COP',
      type: 'corriente',
      color: '#8b5cf6'
    };
    showNewAccountForm.value = false;
    showAccountSelect.value = false;
  } catch (err) {
    console.error('Error creando cuenta:', err);
  } finally {
    creatingAccount.value = false;
  }
};

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

const priorityOptions = [
  { value: 'low', label: 'Baja', color: 'emerald', icon: '🟢' },
  { value: 'medium', label: 'Media', color: 'amber', icon: '🟡' },
  { value: 'high', label: 'Alta', color: 'rose', icon: '🔴' },
];

onMounted(fetchAccounts);
</script>

<template>
  <div class="flex-1 flex flex-col h-full bg-bg-primary/30 animate-pop">
    <!-- Action Bar (Sticky pseudo-header) -->
    <div class="glass border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
      <div class="flex items-center gap-4">
        <button 
          @click="emit('back')"
          class="p-2 rounded-xl hover:bg-white/5 text-text-muted hover:text-text-primary transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div class="h-6 w-px bg-white/10 mx-2"></div>

        <button 
          @click="emit('toggle')"
          class="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all border"
          :class="task.completed 
            ? 'bg-success/20 text-success border-success/30' 
            : 'hover:bg-success/10 text-emerald-400 border-emerald-500/20'"
        >
          <svg v-if="task.completed" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {{ task.completed ? 'Completada' : 'Marcar como completada' }}
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button 
          v-if="hasChanges"
          @click="handleSave"
          :disabled="saving"
          class="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="saving" class="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
          {{ saving ? 'Guardando...' : 'Guardar cambios' }}
        </button>
        
        <button 
          @click="emit('delete')"
          class="p-2 rounded-lg hover:bg-rose-500/10 text-text-muted hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
          title="Eliminar"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden p-8 custom-scrollbar">
      <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <!-- Left Column: Content (7/12) -->
        <div class="lg:col-span-7 space-y-10">
          <!-- Task Title Section -->
          <div>
            <textarea 
              v-model="localTask.title"
              class="w-full bg-transparent text-4xl font-bold text-text-primary placeholder-white/20 focus:outline-none border-none resize-none px-0 leading-tight"
              placeholder="Nombre de la tarea..."
              rows="2"
            ></textarea>
            <p class="text-text-muted mt-2">Para crear esta tarea completa toda la información.</p>
          </div>

          <!-- Description Section -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-text-muted text-sm font-medium border-b border-white/5 pb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span>Descripción</span>
            </div>
            <textarea 
              v-model="localTask.description"
              class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-text-secondary placeholder-white/20 focus:outline-none focus:border-primary/40 transition-all resize-none min-h-[150px]"
              placeholder="Añade una descripción detallada..."
            ></textarea>
          </div>


        </div>

        <!-- Right Column: Metadata (5/12) -->
        <div class="lg:col-span-5 space-y-8">
          
          <!-- Metadata Workspace Section -->
          <div class="glass p-6 rounded-3xl border border-white/5 space-y-8">
            <h5 class="text-xs font-bold uppercase tracking-widest text-primary-light flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Propiedades
            </h5>

            <!-- Property Rows -->
            <div class="space-y-6">
              <!-- Priority Row -->
              <div class="flex items-center">
                <div class="w-32 flex items-center gap-2 text-text-muted text-sm px-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Prioridad</span>
                </div>
                <div class="flex-1">
                  <div class="flex bg-white/5 p-1 rounded-xl gap-1">
                    <button 
                      v-for="p in priorityOptions" 
                      :key="p.value"
                      @click="localTask.priority = p.value as any"
                      class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all uppercase tracking-tighter"
                      :class="localTask.priority === p.value 
                        ? `bg-${p.color}-500/20 text-${p.color}-400 border border-${p.color}-500/30` 
                        : 'text-text-muted hover:text-text-secondary'"
                    >
                      {{ p.label }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Due Date Row -->
              <div class="flex items-center">
                <div class="w-32 flex items-center gap-2 text-text-muted text-sm px-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Vencimiento</span>
                </div>
                <div class="flex-1">
                  <input 
                    v-model="localTask.dueDate"
                    type="date"
                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none transition-all"
                  />
                </div>
              </div>

              <!-- Status Row (Static display for now) -->
              <div class="flex items-center">
                <div class="w-32 flex items-center gap-2 text-text-muted text-sm px-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Estado</span>
                </div>
                <div class="flex-1">
                  <span 
                    class="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border"
                    :class="task.completed 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'"
                  >
                    {{ task.completed ? 'COMPLETADA' : 'EN PROGRESO' }}
                  </span>
                </div>
              </div>
            </div>


            <!-- End of Metadata Section -->
          </div>

          <!-- Linked Account Section (Moved here) -->
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-white/5 pb-2">
              <div class="flex items-center gap-2 text-text-muted text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Gestión Financiera</span>
              </div>
              <button 
                v-if="selectedAccount"
                @click="unlinkAccount"
                class="text-[10px] uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors"
              >
                Desvincular
              </button>
            </div>

            <div v-if="selectedAccount" class="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <!-- Progress Background -->
              <div 
                class="absolute inset-0 opacity-5 pointer-events-none"
                :style="{ background: selectedAccount.color }"
              ></div>

              <div class="flex items-center justify-between mb-6">
                <div>
                  <h4 class="text-xl font-bold text-text-primary mb-1">{{ selectedAccount.name }}</h4>
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: selectedAccount.color }"></span>
                    <span class="text-xs text-text-muted capitalize">{{ selectedAccount.type }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-[10px] text-text-muted uppercase tracking-widest mb-1">Presupuesto</p>
                  <p class="text-xl font-bold font-mono">{{ formatCurrency(selectedAccount.initialBalance, selectedAccount.currency) }}</p>
                </div>
              </div>

              <!-- Compact Budget Metrics -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p class="text-[10px] text-text-muted uppercase mb-1">Disponible</p>
                  <p class="text-lg font-bold text-emerald-400">{{ formatCurrency(selectedAccount.currentBalance ?? 0, selectedAccount.currency) }}</p>
                </div>
                <div class="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p class="text-[10px] text-text-muted uppercase mb-1">Gastado</p>
                  <p class="text-lg font-bold text-rose-400">{{ formatCurrency(selectedAccount.totalExpenses ?? 0, selectedAccount.currency) }}</p>
                </div>
              </div>

              <!-- Time-tracking style Progress bar -->
              <div class="space-y-2">
                <div class="h-3 bg-white/5 rounded-full overflow-hidden flex">
                  <div 
                    class="h-full transition-all duration-1000 ease-out"
                    :style="{ 
                      width: `${Math.max(0, Math.min(100, ((selectedAccount.currentBalance ?? 0) / selectedAccount.initialBalance) * 100))}%`,
                      backgroundColor: selectedAccount.color
                    }"
                  ></div>
                </div>
                <div class="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-tighter">
                  <span>{{ Math.round(((selectedAccount.currentBalance ?? 0) / selectedAccount.initialBalance) * 100) || 0 }}% DISPONIBLE</span>
                  <span class="text-text-primary">{{ (selectedAccount.currentBalance ?? 0) > 0 ? 'Fondo Saludable' : 'Fondo Agotado' }}</span>
                </div>
              </div>
            </div>

            <!-- Empty Account State / Selector -->
            <div v-else class="space-y-4">
              <div v-if="!showAccountSelect && !showNewAccountForm">
                <button 
                  @click="showAccountSelect = true"
                  class="w-full p-8 rounded-2xl border-2 border-dashed border-white/10 text-text-muted hover:border-primary/40 hover:text-primary transition-all flex flex-col items-center gap-3 bg-white/2"
                >
                  <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 4v16m8-8H4" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <span class="font-medium">Vincular una cuenta o presupuesto</span>
                </button>
              </div>

              <!-- Account List Selector -->
              <div v-if="showAccountSelect" class="space-y-3 glass p-4 rounded-2xl border border-white/10">
                <div v-if="loadingAccounts" class="flex justify-center py-4">
                  <div class="animate-spin h-6 w-6 border-2 border-white/10 border-t-primary rounded-full"></div>
                </div>
                <template v-else>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div 
                      v-for="account in accounts" 
                      :key="account._id"
                      @click="selectAccount(account)"
                      class="p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 hover:border-primary/30 transition-all flex items-center gap-3"
                    >
                      <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: account.color }"></div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold truncate">{{ account.name }}</p>
                        <p class="text-[10px] text-text-muted">{{ formatCurrency(account.currentBalance ?? 0, account.currency) }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 mt-4">
                    <button @click="showNewAccountForm = true; showAccountSelect = false" class="flex-1 text-sm text-primary font-bold py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all">+ Nueva Cuenta</button>
                    <button @click="showAccountSelect = false" class="text-sm text-text-muted px-4 py-2 hover:text-text-primary">Cerrar</button>
                  </div>
                </template>
              </div>

              <!-- Quick Create Account Form -->
              <div v-if="showNewAccountForm" class="glass p-6 rounded-2xl border border-white/10 space-y-5 animate-pop">
                <h5 class="text-sm font-bold uppercase tracking-widest text-text-primary">Nueva Cuenta</h5>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-[10px] text-text-muted uppercase font-bold px-1">Nombre</label>
                    <input v-model="newAccountForm.name" type="text" placeholder="Ej: Proyecto X" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] text-text-muted uppercase font-bold px-1">Presupuesto</label>
                    <input v-model.number="newAccountForm.initialBalance" type="number" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-primary focus:outline-none" />
                  </div>
                </div>
                <!-- Color & Type -->
                <div class="flex flex-wrap gap-4">
                  <div class="flex-1 min-w-[200px] space-y-2">
                    <label class="text-[10px] text-text-muted uppercase font-bold px-1">Categoría / Tipo</label>
                    <div class="grid grid-cols-3 gap-1">
                      <button v-for="t in accountTypeOptions" :key="t.value" @click="newAccountForm.type = t.value as any" class="p-2 rounded-lg border text-center transition-all" :class="newAccountForm.type === t.value ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/5 text-text-muted'">
                        <span class="text-lg block">{{ t.icon }}</span>
                        <span class="text-[8px] uppercase font-bold">{{ t.label }}</span>
                      </button>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] text-text-muted uppercase font-bold px-1">Color</label>
                    <div class="flex gap-2">
                      <button v-for="c in colorOptions" :key="c" @click="newAccountForm.color = c" class="w-6 h-6 rounded-full border-2 transition-all" :style="{ backgroundColor: c }" :class="newAccountForm.color === c ? 'border-white scale-110' : 'border-transparent'"></button>
                    </div>
                  </div>
                </div>
                <div class="flex gap-3">
                  <button @click="handleCreateQuickAccount" :disabled="creatingAccount || !newAccountForm.name.trim()" class="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50">Confirmar</button>
                  <button @click="showNewAccountForm = false" class="px-6 text-text-muted font-bold hover:text-text-primary">Cancelar</button>
                </div>
              </div>
            </div>
          </div>        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glass {
  background: rgba(26, 26, 46, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.glass-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}

textarea:focus {
  outline: none;
}
</style>
