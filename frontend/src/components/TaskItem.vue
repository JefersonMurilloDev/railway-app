<script setup lang="ts">
import { computed } from 'vue';
import type { Task } from '../services/api';

const props = defineProps<{
  task: Task;
}>();

defineEmits<{
  (e: 'toggle', task: Task): void;
  (e: 'delete', id: string): void;
  (e: 'edit', task: Task): void;
}>();

const priorityClass = computed(() => {
  const classes = {
    low: 'bg-success/15 text-success border border-success/30',
    medium: 'bg-warning/15 text-warning border border-warning/30',
    high: 'bg-danger/15 text-danger-light border border-danger/30'
  };
  return classes[props.task.priority];
});

const priorityLabel = computed(() => {
  const map = { low: 'Baja', medium: 'Media', high: 'Alta' };
  return map[props.task.priority];
});

const dueStatus = computed(() => {
  if (!props.task.dueDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(props.task.dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { label: 'Vencido', class: 'bg-danger/15 text-red-400 border border-danger/30 animate-pulse', icon: '⚠️' };
  if (diffDays === 0) return { label: 'Hoy', class: 'bg-amber-500/15 text-amber-400 border border-amber-500/30', icon: '🔥' };
  if (diffDays === 1) return { label: 'Mañana', class: 'bg-blue-500/15 text-blue-400 border border-blue-500/30', icon: '⏰' };
  if (diffDays <= 3) return { label: `En ${diffDays} días`, class: 'bg-blue-500/15 text-blue-400 border border-blue-500/30', icon: '📅' };
  
  return { 
    label: new Date(props.task.dueDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }), 
    class: 'bg-white/5 text-text-muted border border-white/10',
    icon: '📅'
  };
});

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
};
</script>

<template>
  <div 
    class="flex items-start gap-4 p-5 mb-3 bg-white/5 border border-white/10 rounded-2xl transition-all duration-300 md:hover:bg-white/10 group"
    :class="{ 'opacity-60 hover:opacity-80': task.completed }"
  >
    <div class="shrink-0 pt-0.5">
      <label class="block relative cursor-pointer group/check active:scale-90 transition-transform duration-200">
        <input 
          type="checkbox" 
          :checked="task.completed" 
          @change="$emit('toggle', task)"
          class="absolute opacity-0 w-0 h-0"
        />
        <span 
          class="flex items-center justify-center w-6 h-6 border-2 border-white/25 rounded-full text-transparent transition-all duration-300 group-hover/check:border-primary group-hover/check:bg-primary/10"
          :class="{ 'bg-success! border-success! text-white!': task.completed }"
        >
          <svg viewBox="0 0 12 10" fill="none" class="w-3 h-3 transition-transform duration-300" :class="{ 'animate-pop': task.completed }">
            <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </label>
    </div>
    
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-3 flex-wrap mb-1">
        <h3 
          class="text-base font-semibold text-text-primary m-0 transition-colors duration-300"
          :class="{ 'line-through text-text-muted': task.completed }"
        >
          {{ task.title }}
        </h3>
        <span 
          class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
          :class="priorityClass"
        >
          {{ priorityLabel }}
        </span>
      </div>
      
      <p v-if="task.description" class="text-sm text-text-secondary my-2 leading-relaxed">
        {{ task.description }}
      </p>
      
      <div class="flex items-center gap-3 mt-2">
        <span 
          v-if="dueStatus && !task.completed" 
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
          :class="dueStatus.class"
        >
          {{ dueStatus.icon }} {{ dueStatus.label }}
        </span>
        
        <span class="text-xs text-text-muted" v-if="!dueStatus && task.createdAt">
          Creado: {{ formatDate(task.createdAt) }}
        </span>
      </div>
    </div>

    <div class="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-col sm:flex-row">
      <button @click="$emit('edit', task)" class="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-text-secondary border-none cursor-pointer transition-all hover:bg-primary hover:text-white active:scale-90" title="Editar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4.5 h-4.5">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button @click="$emit('delete', task._id!)" class="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-text-secondary border-none cursor-pointer transition-all hover:bg-danger hover:text-white active:scale-90" title="Eliminar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4.5 h-4.5">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  </div>
</template>
