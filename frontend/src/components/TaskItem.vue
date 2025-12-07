<script setup lang="ts">
import { computed } from 'vue';
import type { Task } from '../services/api';

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: 'toggle', task: Task): void;
  (e: 'delete', id: string): void;
  (e: 'edit', task: Task): void;
}>();

const priorityClass = computed(() => {
  return `badge-${props.task.priority}`;
});

const priorityLabel = computed(() => {
  const map = { low: 'Baja', medium: 'Media', high: 'Alta' };
  return map[props.task.priority];
});

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-ES', {
    month: 'short', day: 'numeric'
  });
};
</script>

<template>
  <div class="task-item card" :class="{ completed: task.completed }">
    <div class="task-content">
      <div class="task-header">
        <label class="checkbox-wrapper">
          <input 
            type="checkbox" 
            :checked="task.completed" 
            @change="$emit('toggle', task)"
          />
          <span class="checkmark"></span>
        </label>
        
        <div class="title-section">
          <h3 class="task-title" :class="{ 'text-strike': task.completed }">
            {{ task.title }}
          </h3>
          <span class="badge" :class="priorityClass">{{ priorityLabel }}</span>
        </div>
      </div>
      
      <p v-if="task.description" class="task-desc">
        {{ task.description }}
      </p>
      
      <div class="task-meta" v-if="task.createdAt">
        <span class="date">{{ formatDate(task.createdAt) }}</span>
      </div>
    </div>

    <div class="task-actions">
      <button @click="$emit('edit', task)" class="btn-icon" title="Editar">
        ✏️
      </button>
      <button @click="$emit('delete', task._id!)" class="btn-icon delete" title="Eliminar">
        🗑️
      </button>
    </div>
  </div>
</template>

<style scoped>
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-item.completed {
  opacity: 0.7;
  background-color: rgba(30, 41, 59, 0.5);
}

.task-content {
  flex: 1;
}

.task-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.checkbox-wrapper {
  position: relative;
  display: inline-block;
  width: 24px;
  height: 24px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkbox-wrapper input {
  opacity: 0;
  width: 0;
  height: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 24px;
  width: 24px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  transition: var(--transition);
}

.checkbox-wrapper:hover .checkmark {
  background-color: rgba(255, 255, 255, 0.2);
}

.checkbox-wrapper input:checked ~ .checkmark {
  background-color: var(--color-success);
  border-color: var(--color-success);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-wrapper input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-wrapper .checkmark:after {
  left: 8px;
  top: 4px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.title-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.task-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.text-strike {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.task-desc {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-left: 2.5rem; /* Align with title */
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.task-meta {
  margin-left: 2.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.3);
}

.task-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0;
  transform: translateX(10px);
  transition: var(--transition);
}

.task-item:hover .task-actions {
  opacity: 1;
  transform: translateX(0);
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  font-size: 1.1rem;
  transition: var(--transition);
}

.btn-icon:hover {
  background-color: var(--color-primary);
  color: white;
}

.btn-icon.delete:hover {
  background-color: var(--color-danger);
}

@media (max-width: 640px) {
  .task-actions {
    opacity: 1; /* Always visible on mobile */
    transform: none;
    flex-direction: row;
  }
  
  .task-item {
    flex-direction: column;
  }
  
  .task-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
}
</style>
