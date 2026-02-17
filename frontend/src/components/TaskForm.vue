<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Task } from '../services/api';

const props = defineProps<{
  initialData?: Task | null;
}>();

const emit = defineEmits<{
  (e: 'submit', task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>): void;
  (e: 'cancel'): void;
}>();

const title = ref(props.initialData?.title || '');
const description = ref(props.initialData?.description || '');
const priority = ref(props.initialData?.priority || 'medium');
const dueDate = ref(props.initialData?.dueDate?.split('T')[0] || '');

watch(() => props.initialData, (newData) => {
  if (newData) {
    title.value = newData.title;
    description.value = newData.description || '';
    priority.value = newData.priority;
    dueDate.value = newData.dueDate?.split('T')[0] || '';
  }
});

const handleSubmit = () => {
    if (!title.value.trim()) return;
  emit('submit', {
    title: title.value,
    description: description.value,
    completed: props.initialData?.completed || false,
    priority: priority.value,
    dueDate: dueDate.value || undefined
  });
  
  if (!props.initialData) {
    title.value = '';
    description.value = '';
    priority.value = 'medium';
    dueDate.value = '';
  }
};

const minDate = new Date().toISOString().split('T')[0];
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-5 sm:space-y-8 animate-pop">
    <!-- Title Input -->
    <div class="space-y-2">
      <label class="text-[10px] uppercase font-black tracking-widest text-text-muted px-1">Título de la actividad</label>
      <input 
        v-model="title" 
        type="text" 
        placeholder="Ej: Diseñar Dashboard Premium" 
        class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-lg sm:text-xl font-bold placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all shadow-inner"
        required
        autofocus
      />
    </div>

    <!-- Description Input -->
    <div class="space-y-2">
      <label class="text-[10px] uppercase font-black tracking-widest text-text-muted px-1">Detalles adicionales</label>
      <textarea 
        v-model="description" 
        placeholder="Añade notas o requerimientos..." 
        class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-sm text-text-secondary placeholder-white/20 focus:outline-none focus:border-primary/40 transition-all resize-none min-h-[100px] sm:min-h-[120px]"
      ></textarea>
    </div>
    
    <!-- Meta Options Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Priority -->
      <div class="space-y-3">
        <label class="text-[10px] uppercase font-black tracking-widest text-text-muted px-1">Nivel de prioridad</label>
        <div class="bg-black/20 p-1.5 rounded-2xl border border-white/5 flex gap-1">
          <button 
            v-for="p in [{v:'low', l:'Baja', c:'text-emerald-400'}, {v:'medium', l:'Media', c:'text-amber-400'}, {v:'high', l:'Alta', c:'text-rose-400'}]" 
            :key="p.v"
            type="button"
            @click="priority = p.v as any"
            class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
            :class="priority === p.v ? 'bg-white/10 text-white border border-white/10 shadow-lg' : 'text-text-muted hover:text-text-secondary'"
          >
            <span class="mr-1" :class="p.c">•</span>
            {{ p.l }}
          </button>
        </div>
      </div>

      <!-- Due Date -->
      <div class="space-y-3">
        <label class="text-[10px] uppercase font-black tracking-widest text-text-muted px-1">Fecha de entrega</label>
        <div class="relative">
          <input 
            type="date" 
            v-model="dueDate" 
            class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-sm text-text-primary focus:outline-none focus:border-primary/40 transition-all appearance-none cursor-pointer"
            :min="minDate"
          />
          <div v-if="dueDate" @click="dueDate = ''" class="absolute right-10 top-1/2 -translate-y-1/2 p-2 text-rose-400 hover:text-rose-300 cursor-pointer">✕</div>
        </div>
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="pt-6 flex gap-3">
      <button 
        type="submit" 
        class="flex-1 bg-primary text-white font-black py-3 sm:py-4 rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/20 hover:-translate-y-1 active:translate-y-0 transition-all uppercase tracking-widest text-xs"
      >
        {{ initialData ? 'Guardar Cambios' : 'Crear Tarea' }}
      </button>
      <button 
        type="button" 
        @click="$emit('cancel')" 
        class="px-8 text-text-muted font-bold hover:text-text-primary transition-all text-xs uppercase tracking-widest"
      >
        Cancelar
      </button>
    </div>
  </form>
</template>
