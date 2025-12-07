<script setup lang="ts">
import { ref } from 'vue';
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

const handleSubmit = () => {
  emit('submit', {
    title: title.value,
    description: description.value,
    completed: props.initialData?.completed || false,
    priority: priority.value
  });
  
  // Reset fields if adding new
  if (!props.initialData) {
    title.value = '';
    description.value = '';
    priority.value = 'medium';
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="task-form card">
    <div class="form-group">
      <input 
        v-model="title" 
        type="text" 
        placeholder="¿Qué hay que hacer?" 
        class="input"
        required
        autofocus
      />
    </div>
    
    <div class="form-group">
      <textarea 
        v-model="description" 
        placeholder="Descripción (opcional)" 
        class="input textarea"
        rows="2"
      ></textarea>
    </div>

    <div class="form-actions">
      <div class="priority-selector">
        <label>Prioridad:</label>
        <select v-model="priority" class="input select">
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>
      </div>

      <div class="buttons">
        <button type="button" v-if="initialData" @click="$emit('cancel')" class="btn btn-text">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary">
          {{ initialData ? 'Guardar Cambios' : 'Agregar Tarea' }}
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.task-form {
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.form-group {
  margin-bottom: 1rem;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.priority-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
}

.select {
  padding: 0.5rem;
  width: auto;
  background-color: rgba(0, 0, 0, 0.2);
}

.buttons {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 640px) {
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .buttons {
    justify-content: flex-end;
  }
}
</style>
