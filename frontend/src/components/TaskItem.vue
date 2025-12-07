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

const priorityClass = computed(() => `badge-${props.task.priority}`);

const priorityLabel = computed(() => {
  const map = { low: 'Baja', medium: 'Media', high: 'Alta' };
  return map[props.task.priority];
});

// Due Date Logic
const dueStatus = computed(() => {
  if (!props.task.dueDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(props.task.dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { label: 'Vencido', class: 'overdue', icon: '⚠️' };
  if (diffDays === 0) return { label: 'Hoy', class: 'today', icon: '🔥' };
  if (diffDays === 1) return { label: 'Mañana', class: 'soon', icon: '⏰' };
  if (diffDays <= 3) return { label: `En ${diffDays} días`, class: 'soon', icon: '📅' };
  
  return { 
    label: new Date(props.task.dueDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }), 
    class: 'normal',
    icon: '📅'
  };
});

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-ES', {
    month: 'short', 
    day: 'numeric'
  });
};
</script>

<template>
  <div class="task-item card" :class="{ completed: task.completed }">
    <div class="task-left">
      <label class="checkbox">
        <input 
          type="checkbox" 
          :checked="task.completed" 
          @change="$emit('toggle', task)"
        />
        <span class="checkbox-visual">
          <svg viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </label>
    </div>
    
    <div class="task-content">
      <div class="task-header">
        <h3 class="task-title" :class="{ 'is-done': task.completed }">
          {{ task.title }}
        </h3>
        <span class="badge" :class="priorityClass">{{ priorityLabel }}</span>
      </div>
      
      <p v-if="task.description" class="task-desc">
        {{ task.description }}
      </p>
      
      <div class="task-meta">
        <!-- Due Date Badge -->
        <span 
          v-if="dueStatus && !task.completed" 
          class="due-badge" 
          :class="dueStatus.class"
        >
          {{ dueStatus.icon }} {{ dueStatus.label }}
        </span>
        
        <!-- Created Date (fallback if no due date) -->
        <span class="created-date" v-if="!dueStatus && task.createdAt">
          Creado: {{ formatDate(task.createdAt) }}
        </span>
      </div>
    </div>

    <div class="task-actions">
      <button @click="$emit('edit', task)" class="action-btn" title="Editar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button @click="$emit('delete', task._id!)" class="action-btn delete" title="Eliminar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.task-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  margin-bottom: 12px;
  transition: var(--transition);
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed:hover {
  opacity: 0.8;
}

/* Checkbox */
.task-left {
  flex-shrink: 0;
  padding-top: 2px;
}

.checkbox {
  display: block;
  position: relative;
  cursor: pointer;
}

.checkbox input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  transition: var(--transition);
  color: transparent;
}

.checkbox-visual svg {
  width: 12px;
  height: 12px;
}

.checkbox:hover .checkbox-visual {
  border-color: var(--primary);
  background: rgba(139, 92, 246, 0.1);
}

.checkbox input:checked + .checkbox-visual {
  background: var(--success);
  border-color: var(--success);
  color: white;
}

/* Content */
.task-content {
  flex: 1;
  min-width: 0;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.task-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.task-title.is-done {
  text-decoration: line-through;
  color: var(--text-muted);
}

.task-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 8px 0;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

/* Due Date Badge */
.due-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
}

.due-badge.overdue {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  animation: pulse-danger 2s infinite;
}

.due-badge.today {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.due-badge.soon {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.due-badge.normal {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  border: 1px solid var(--glass-border);
}

@keyframes pulse-danger {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.created-date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Actions */
.task-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: var(--transition);
}

.task-item:hover .task-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn:hover {
  background: var(--primary);
  color: white;
}

.action-btn.delete:hover {
  background: var(--danger);
}

/* Responsive */
@media (max-width: 640px) {
  .task-item {
    padding: 16px;
  }
  
  .task-actions {
    opacity: 1;
    flex-direction: column;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
  }
  
  .action-btn svg {
    width: 16px;
    height: 16px;
  }
}
</style>
