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
  <div class="bg-bg-secondary border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
    <!-- Header -->
    <div class="text-center py-6 px-6 border-b border-white/10">
      <h2 class="text-2xl font-bold bg-linear-to-br from-indigo-500 via-primary to-purple-500 bg-clip-text text-transparent">
        {{ initialData ? 'Editar Cuenta' : 'Nueva Cuenta' }}
      </h2>
      <p class="text-text-muted text-sm mt-1">
        {{ initialData ? 'Actualiza los datos de tu cuenta' : 'Registra una nueva cuenta financiera para tu balance' }}
      </p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
      <!-- Nombre de la cuenta -->
      <div>
        <label class="block text-sm font-medium text-text-secondary mb-2">Nombre de la cuenta</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">🏦</span>
          <input
            v-model="name"
            type="text"
            placeholder="Ej. Ahorros Banco X"
            class="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            required
          />
        </div>
      </div>

      <!-- Saldo Inicial -->
      <div>
        <label class="block text-sm font-medium text-text-secondary mb-2">Saldo Inicial</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
          <input
            v-model.number="initialBalance"
            type="number"
            step="0.01"
            placeholder="0.00"
            class="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <!-- Tipo y Moneda -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-text-secondary mb-2">Tipo</label>
          <select
            v-model="type"
            class="custom-select w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option v-for="t in accountTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-text-secondary mb-2">Moneda</label>
          <select
            v-model="currency"
            class="custom-select w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option v-for="c in currencies" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </div>
      </div>

      <!-- Color Identificador -->
      <div>
        <label class="block text-sm font-medium text-text-secondary mb-2">Color Identificador</label>
        <div class="flex gap-3">
          <button
            v-for="c in colors"
            :key="c"
            type="button"
            @click="color = c"
            class="w-10 h-10 rounded-full transition-all duration-200 hover:scale-110"
            :class="color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-bg-secondary scale-110' : 'opacity-70'"
            :style="{ backgroundColor: c }"
          />
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex flex-col gap-3 pt-4">
        <button
          type="submit"
          class="w-full py-3 rounded-xl font-bold text-white bg-linear-to-br from-indigo-500 via-primary to-purple-500 hover:shadow-lg hover:shadow-primary/40 active:scale-98 transition-all duration-300"
        >
          {{ initialData ? 'Actualizar Cuenta' : 'Crear Cuenta' }}
        </button>
        <button
          type="button"
          @click="emit('cancel')"
          class="w-full py-3 rounded-xl font-medium text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
        >
          Cancelar
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Fix for select dropdown options in dark mode */
.custom-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a0a0a0' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.custom-select option {
  background-color: #1a1a2e;
  color: white;
  padding: 8px;
}
</style>
