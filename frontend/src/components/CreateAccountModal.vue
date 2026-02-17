<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Account } from '../services/accounts';

const props = defineProps<{
  initialData?: Account | null;
}>();

const emit = defineEmits<{
  (e: 'submit', data: Partial<Account>): void;
  (e: 'cancel'): void;
}>();

// Form state
const name = ref('');
const initialBalance = ref(0);
const type = ref<'corriente' | 'ahorros' | 'efectivo' | 'credito' | 'otro'>('corriente');
const currency = ref<'USD' | 'COP' | 'EUR'>('USD');
const color = ref('#7C3AED');

// Colores disponibles
const colors = ['#7C3AED', '#22C55E', '#3B82F6', '#EF4444', '#F59E0B'];

// Tipos de cuenta
const accountTypes = [
    { value: 'corriente', label: 'Corriente' },
    { value: 'ahorros', label: 'Ahorros' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'credito', label: 'Crédito' },
    { value: 'otro', label: 'Otro' },
];

// Monedas disponibles
const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'COP', label: 'COP ($)' },
    { value: 'EUR', label: 'EUR (€)' },
];

// Inicializar con datos existentes si es edición
watch(() => props.initialData, (data) => {
    if (data) {
        name.value = data.name || '';
        initialBalance.value = data.initialBalance || 0;
        type.value = data.type || 'corriente';
        currency.value = data.currency || 'USD';
        color.value = data.color || '#7C3AED';
    } else {
        name.value = '';
        initialBalance.value = 0;
        type.value = 'corriente';
        currency.value = 'USD';
        color.value = '#7C3AED';
    }
}, { immediate: true });

// Enviar formulario
const handleSubmit = () => {
    if (!name.value.trim()) return;
    
    emit('submit', {
        name: name.value.trim(),
        initialBalance: initialBalance.value,
        type: type.value,
        currency: currency.value,
        color: color.value,
    });
};
</script>

<template>
  <div class="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] shadow-2xl relative overflow-hidden flex flex-col">
    <!-- Decorative Glow (Fixed in background) -->
    <div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-primary to-purple-500 z-20"></div>
    <div class="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none z-0"></div>

    <!-- Header (Fixed) -->
    <div class="text-center pt-6 pb-4 px-5 sm:pt-8 sm:pb-6 sm:px-8 relative shrink-0 z-10 bg-[#0f172a]/95 backdrop-blur-sm">
      <h2 class="text-2xl font-black text-white tracking-tight">
        {{ initialData ? 'Editar Cuenta' : 'Nueva Cuenta' }}
      </h2>
      <p class="text-text-muted text-xs font-medium uppercase tracking-widest mt-2">
        {{ initialData ? 'Actualiza los datos' : 'Registra una nueva cuenta' }}
      </p>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-5 sm:px-8">
      <form @submit.prevent="handleSubmit" id="account-form" class="space-y-6 py-2">
        <!-- Nombre de la cuenta -->
        <div class="space-y-2">
          <label class="text-[10px] uppercase font-black tracking-widest text-text-muted px-1">Nombre de la cuenta</label>
          <div class="relative group">
            <span class="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">🏦</span>
            <input
              v-model="name"
              type="text"
              placeholder="Ej. Ahorros Banco Principal"
              class="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 sm:py-4 sm:pl-14 sm:pr-6 text-text-primary font-bold placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all shadow-inner"
              required
              autofocus
            />
          </div>
        </div>

        <!-- Saldo Inicial -->
        <div class="space-y-2">
          <label class="text-[10px] uppercase font-black tracking-widest text-text-muted px-1">Saldo Disponible</label>
          <div class="relative group">
            <span class="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-success transition-colors font-bold">$</span>
            <input
              v-model.number="initialBalance"
              type="number"
              step="0.01"
              placeholder="0.00"
              class="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 sm:py-4 sm:pl-12 sm:pr-6 text-text-primary font-mono font-bold placeholder:text-white/20 focus:outline-none focus:border-success/50 focus:bg-white/10 transition-all shadow-inner"
            />
          </div>
        </div>

        <!-- Tipo y Moneda -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-[10px] uppercase font-black tracking-widest text-text-muted px-1">Tipo de Cuenta</label>
            <div class="relative">
               <select
                v-model="type"
                class="w-full appearance-none bg-white/5 border border-white/10 rounded-2xl py-3 px-4 sm:py-4 sm:px-6 text-text-primary font-medium focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all cursor-pointer"
              >
                <option v-for="t in accountTypes" :key="t.value" :value="t.value" class="bg-bg-primary text-white">{{ t.label }}</option>
              </select>
              <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] uppercase font-black tracking-widest text-text-muted px-1">Moneda</label>
            <div class="relative">
              <select
                v-model="currency"
                class="w-full appearance-none bg-white/5 border border-white/10 rounded-2xl py-3 px-4 sm:py-4 sm:px-6 text-text-primary font-medium focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all cursor-pointer"
              >
                <option v-for="c in currencies" :key="c.value" :value="c.value" class="bg-bg-primary text-white">{{ c.label }}</option>
              </select>
              <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Color Identificador -->
        <div class="space-y-3">
          <label class="text-[10px] uppercase font-black tracking-widest text-text-muted px-1">Color Identificador</label>
          <div class="bg-black/20 p-2 rounded-2xl border border-white/5 flex gap-2 justify-between">
            <button
              v-for="c in colors"
              :key="c"
              type="button"
              @click="color = c"
              class="w-10 h-10 rounded-xl transition-all duration-300 relative group flex items-center justify-center cursor-pointer"
              :class="color === c ? 'scale-110 shadow-lg shadow-black/50' : 'opacity-60 hover:opacity-100 hover:scale-105'"
              :style="{ backgroundColor: c }"
            >
               <div v-if="color === c" class="w-2 h-2 bg-white rounded-full shadow-sm"></div>
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Footer Buttons (Fixed) -->
    <div class="px-5 py-4 sm:px-8 sm:py-6 shrink-0 z-10 bg-[#0f172a] border-t border-white/5 mt-auto">
      <div class="flex gap-3">
        <button
          type="button"
          @click="emit('cancel')"
          class="px-5 py-3 sm:px-6 sm:py-4 rounded-2xl font-bold text-text-muted hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest text-[10px]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="account-form"
          class="flex-1 py-3 sm:py-4 rounded-2xl font-black text-white bg-primary hover:bg-primary-hover shadow-xl shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase tracking-widest text-[10px]"
        >
          {{ initialData ? 'Actualizar Cuenta' : 'Crear Cuenta' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Removed old custom styles as we use Tailwind classes now */
</style>
