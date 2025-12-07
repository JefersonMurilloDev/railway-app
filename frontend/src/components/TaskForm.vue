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

// Watch for changes when editing a task
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

// Get tomorrow's date for min attribute
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const minDate = new Date().toISOString().split('T')[0];
</script>

<template>
  <form @submit.prevent="handleSubmit" class="task-form card">
    <div class="form-grid">
      <div class="form-main">
        <input 
          v-model="title" 
          type="text" 
          placeholder="¿Qué necesitas hacer hoy?" 
          class="input input-title"
          required
          autofocus
        />
        <textarea 
          v-model="description" 
          placeholder="Añade detalles o notas..." 
          class="input input-desc"
          rows="2"
        ></textarea>
      </div>
      
      <div class="form-side">
        <!-- Due Date -->
        <div class="date-group">
          <label class="field-label">📅 Fecha límite</label>
          <input 
            type="date" 
            v-model="dueDate" 
            class="input input-date"
            :min="minDate"
          />
          <button 
            type="button" 
            v-if="dueDate" 
            @click="dueDate = ''" 
            class="clear-date"
            title="Quitar fecha"
          >✕</button>
        </div>

        <!-- Priority -->
        <div class="priority-group">
          <label class="field-label">Prioridad</label>
          <div class="priority-options">
            <label class="priority-option" :class="{ active: priority === 'low' }">
              <input type="radio" v-model="priority" value="low" />
              <span class="dot low"></span>
              <span>Baja</span>
            </label>
            <label class="priority-option" :class="{ active: priority === 'medium' }">
              <input type="radio" v-model="priority" value="medium" />
              <span class="dot medium"></span>
              <span>Media</span>
            </label>
            <label class="priority-option" :class="{ active: priority === 'high' }">
              <input type="radio" v-model="priority" value="high" />
              <span class="dot high"></span>
              <span>Alta</span>
            </label>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" v-if="initialData" @click="$emit('cancel')" class="btn btn-text">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            {{ initialData ? 'Guardar' : '+ Crear Tarea' }}
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<style scoped>
.task-form {
  margin-bottom: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: start;
}

.form-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-title {
  font-size: 1.1rem;
  font-weight: 500;
}

.input-desc {
  resize: vertical;
  min-height: 60px;
  font-size: 0.95rem;
}

.form-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 220px;
}

.field-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

/* Date Group */
.date-group {
  position: relative;
}

.input-date {
  padding-right: 36px;
  cursor: pointer;
  color-scheme: dark;
}

.input-date::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

.clear-date {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  margin-top: 12px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 50%;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  transition: var(--transition);
}

.clear-date:hover {
  background: var(--danger);
  color: white;
}

/* Priority Group */
.priority-group {
  display: flex;
  flex-direction: column;
}

.priority-options {
  display: flex;
  gap: 8px;
}

.priority-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.priority-option input {
  display: none;
}

.priority-option:hover {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.15);
}

.priority-option.active {
  background: rgba(139, 92, 246, 0.15);
  border-color: var(--primary);
  color: var(--text-primary);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.low { background: var(--success); }
.dot.medium { background: var(--warning); }
.dot.high { background: var(--danger); }

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-side {
    min-width: unset;
  }
  
  .priority-options {
    flex-wrap: wrap;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .btn {
    width: 100%;
  }
}
</style>
