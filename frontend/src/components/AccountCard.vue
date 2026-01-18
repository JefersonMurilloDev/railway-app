<script setup lang="ts">
import type { Account } from '../services/accounts';

const props = defineProps<{
  account: Account;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
  (e: 'edit', account: Account): void;
  (e: 'delete', id: string): void;
}>();

// Formatear moneda usando la moneda de la cuenta
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: props.account.currency || 'USD',
        minimumFractionDigits: 0,
    }).format(value);
};

// Obtener icono según tipo de cuenta
const getAccountIcon = (type: string): string => {
    const icons: Record<string, string> = {
        corriente: '🏦',
        ahorros: '💰',
        efectivo: '💵',
        credito: '💳',
        otro: '📊',
    };
    return icons[type] || '📊';
};

// Obtener nombre del tipo
const getTypeName = (type: string): string => {
    const names: Record<string, string> = {
        corriente: 'Cuenta Corriente',
        ahorros: 'Cuenta de Ahorros',
        efectivo: 'Efectivo / Caja',
        credito: 'Crédito',
        otro: 'Otro',
    };
    return names[type] || 'Cuenta';
};

// Determinar si el balance es positivo
const isPositive = props.account.currentBalance ? props.account.currentBalance >= 0 : props.account.initialBalance >= 0;
</script>

<template>
  <div
    @click="emit('click')"
    class="group h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10"
  >
    <div class="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
      <!-- Left: Icon & Info -->
      <div class="flex items-center gap-4 min-w-0 flex-1">
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          :style="{ backgroundColor: account.color + '20', color: account.color }"
        >
          {{ getAccountIcon(account.type) }}
        </div>
        <div>
          <h3 class="font-semibold text-text-primary text-lg truncate pr-2">{{ account.name }}</h3>
          <p class="text-sm text-text-muted">{{ getTypeName(account.type) }}</p>
        </div>
      </div>

      <!-- Right: Balance & Actions -->
      <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end ml-14 sm:ml-0">
        <div class="text-right">
          <p
            class="font-bold text-xl"
            :class="isPositive ? 'text-success' : 'text-danger'"
          >
            {{ formatCurrency(account.currentBalance ?? account.initialBalance) }}
          </p>
          <p class="text-xs text-text-muted">
            <span v-if="isPositive" class="text-success">Activa</span>
            <span v-else class="text-warning">Pendiente</span>
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            @click.stop="emit('edit', account)"
            class="w-8 h-8 rounded-lg bg-white/10 border border-white/10 text-text-muted flex items-center justify-center hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all"
            title="Editar"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            @click.stop="emit('delete', account._id!)"
            class="w-8 h-8 rounded-lg bg-white/10 border border-white/10 text-text-muted flex items-center justify-center hover:bg-danger/20 hover:text-danger hover:border-danger/30 transition-all"
            title="Eliminar"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
