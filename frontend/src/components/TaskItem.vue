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
    low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    high: 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
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
  
  if (diffDays < 0) return { label: 'Vencido', class: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse', icon: '⚠️' };
  if (diffDays === 0) return { label: 'Hoy', class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', icon: '🔥' };
  if (diffDays === 1) return { label: 'Mañana', class: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20', icon: '⏰' };
  if (diffDays <= 3) return { label: `En ${diffDays} días`, class: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20', icon: '📅' };
  
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
    class="group relative flex items-center gap-4 p-4 glass-card rounded-xl transition-all duration-300 hover:translate-x-1 hover:bg-white/8 cursor-pointer"
    :class="{ 'opacity-50': task?.completed }"
    @click="$emit('edit', task)"
  >
    <!-- Status Indicator Line -->
    <div 
      class="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full transition-all duration-300 opacity-0 group-hover:opacity-100"
      :class="priorityClass?.split(' ')[1]?.replace('text-', 'bg-') || 'bg-primary'"
    ></div>

    <!-- Checkbox Custom -->
    <div class="shrink-0" @click.stop>
      <button 
        @click="$emit('toggle', task)"
        class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300"
        :class="task.completed 
          ? 'bg-success border-success text-white' 
          : 'border-white/20 hover:border-primary bg-white/5'"
      >
        <svg v-if="task.completed" viewBox="0 0 12 10" fill="none" class="w-3.5 h-3.5">
          <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    
    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-0.5">
        <h3 
          class="text-sm font-medium text-text-primary truncate transition-all duration-300"
          :class="{ 'line-through text-text-muted': task.completed }"
        >
          {{ task.title }}
        </h3>
        <span 
          class="inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
          :class="priorityClass"
        >
          {{ priorityLabel }}
        </span>
      </div>
      
      <div class="flex items-center gap-3">
        <span 
          v-if="dueStatus && !task.completed" 
          class="inline-flex items-center gap-1 text-[11px] font-medium"
          :class="dueStatus.class.split(' ')[1]"
        >
          {{ dueStatus.icon }} {{ dueStatus.label }}
        </span>
        
        <span v-if="task.description" class="text-[11px] text-text-muted truncate max-w-[200px]">
          {{ task.description }}
        </span>

        <span class="text-[10px] text-text-muted ml-auto sm:block hidden">
          {{ formatDate(task.createdAt) }}
        </span>
      </div>
    </div>

    <!-- Hover Actions -->
    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        @click.stop="$emit('delete', task._id!)" 
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-500/20 hover:text-rose-400 text-text-muted transition-all"
        title="Eliminar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
