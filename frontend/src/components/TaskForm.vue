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
  <form @submit.prevent="handleSubmit" class="p-6">
    <!-- Main inputs -->
    <div class="flex flex-col gap-3 mb-4">
      <input 
        v-model="title" 
        type="text" 
        placeholder="¿Qué necesitas hacer hoy?" 
        class="w-full bg-transparent border-none text-xl font-medium placeholder-white/40 focus:outline-none focus:ring-0 p-0"
        required
        autofocus
      />
      <textarea 
        v-model="description" 
        placeholder="Añade detalles o notas..." 
        class="w-full bg-transparent border-none text-base placeholder-white/40 focus:outline-none focus:ring-0 resize-none min-h-[60px] p-0"
        rows="2"
      ></textarea>
    </div>
    
    <!-- Options Row -->
    <div class="flex gap-4 flex-col sm:flex-row mb-4">
      <!-- Due Date -->
      <div class="flex-1 sm:min-w-[140px]">
        <label class="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">📅 Fecha</label>
        <div class="relative inline-block w-full">
          <input 
            type="date" 
            v-model="dueDate" 
            class="w-full bg-white/5 border border-white/10 rounded-lg pl-3 pr-16 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all cursor-pointer min-w-full sm:min-w-[150px] appearance-none"
            :min="minDate"
          />
          <button 
            type="button" 
            v-if="dueDate" 
            @click="dueDate = ''" 
            class="absolute right-9 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-white/10 rounded-full text-text-muted text-[10px] hover:bg-danger hover:text-white transition-all border-none cursor-pointer"
            title="Quitar fecha"
          >✕</button>
        </div>
      </div>

      <!-- Priority -->
      <div class="flex-1">
        <label class="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Prioridad</label>
        <div class="flex gap-1.5 w-full">
          <label 
            class="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-black/20 border border-white/10 rounded-lg cursor-pointer transition-all text-xs text-text-secondary hover:bg-black/30"
            :class="{ 'bg-primary/15 border-primary text-text-primary': priority === 'low' }"
          >
            <input type="radio" v-model="priority" value="low" class="hidden" />
            <span class="w-2 h-2 rounded-full bg-success shrink-0"></span>
            <span class="hidden sm:inline">Baja</span>
          </label>
          <label 
            class="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-black/20 border border-white/10 rounded-lg cursor-pointer transition-all text-xs text-text-secondary hover:bg-black/30"
            :class="{ 'bg-primary/15 border-primary text-text-primary': priority === 'medium' }"
          >
            <input type="radio" v-model="priority" value="medium" class="hidden" />
            <span class="w-2 h-2 rounded-full bg-warning shrink-0"></span>
            <span class="hidden sm:inline">Media</span>
          </label>
          <label 
            class="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-black/20 border border-white/10 rounded-lg cursor-pointer transition-all text-xs text-text-secondary hover:bg-black/30"
            :class="{ 'bg-primary/15 border-primary text-text-primary': priority === 'high' }"
          >
            <input type="radio" v-model="priority" value="high" class="hidden" />
            <span class="w-2 h-2 rounded-full bg-danger shrink-0"></span>
            <span class="hidden sm:inline">Alta</span>
          </label>
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="flex gap-2 justify-end mt-6">
      <button type="button" v-if="initialData" @click="$emit('cancel')" class="bg-transparent text-text-secondary border-none hover:text-text-primary px-4 py-2 font-semibold cursor-pointer transition-colors active:scale-95">
        Cancelar
      </button>
      <button type="submit" class="px-6 py-2 rounded-xl font-semibold text-white bg-linear-to-br from-indigo-500 via-primary to-purple-600 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 border-none cursor-pointer w-full sm:w-auto">
        {{ initialData ? 'Guardar' : '+ Crear Tarea' }}
      </button>
    </div>
  </form>
</template>
