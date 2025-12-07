<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api, { type Task } from '../services/api';
import TaskForm from './TaskForm.vue';
import TaskItem from './TaskItem.vue';

const tasks = ref<Task[]>([]);
const loading = ref(true);
const editingTask = ref<Task | null>(null);

const fetchTasks = async () => {
  try {
    loading.value = true;
    const { data } = await api.get('/tasks');
    tasks.value = data;
  } catch (error) {
    console.error('Error fetching tasks', error);
  } finally {
    loading.value = false;
  }
};

const handleCreate = async (taskData: any) => {
  try {
    const { data } = await api.post('/tasks', taskData);
    tasks.value.unshift(data);
  } catch (error) {
    console.error('Error creating task', error);
  }
};

const handleUpdate = async (taskData: any) => {
  if (!editingTask.value?._id) return;
  try {
    const { data } = await api.put(`/tasks/${editingTask.value._id}`, taskData);
    const index = tasks.value.findIndex(t => t._id === data._id);
    if (index !== -1) tasks.value[index] = data;
    editingTask.value = null; // Close edit mode
  } catch (error) {
    console.error('Error updating task', error);
  }
};

const handleToggle = async (task: Task) => {
  try {
    const { data } = await api.patch(`/tasks/${task._id}/toggle`);
    const index = tasks.value.findIndex(t => t._id === data._id);
    if (index !== -1) tasks.value[index] = data;
  } catch (error) {
    console.error('Error toggling task', error);
  }
};

const handleDelete = async (id: string) => {
  if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;
  try {
    await api.delete(`/tasks/${id}`);
    tasks.value = tasks.value.filter(t => t._id !== id);
  } catch (error) {
    console.error('Error deleting task', error);
  }
};

onMounted(fetchTasks);
</script>

<template>
  <div class="task-manager container">
    <header>
      <h1>Mis Tareas</h1>
      <p style="color: var(--color-text-muted)">Organiza tu día de forma productiva</p>
    </header>

    <TaskForm 
      :initial-data="editingTask" 
      @submit="editingTask ? handleUpdate($event) : handleCreate($event)"
      @cancel="editingTask = null"
    />

    <div v-if="loading" class="loading">
      Cargando tareas...
    </div>

    <div v-else class="task-list">
      <div v-if="tasks.length === 0" class="empty-state">
        <span class="emoji">📝</span>
        <h3>No hay tareas aún</h3>
        <p>Agrega tu primera tarea arriba para empezar</p>
      </div>

      <transition-group name="list">
        <TaskItem 
          v-for="task in tasks" 
          :key="task._id" 
          :task="task"
          @toggle="handleToggle"
          @edit="editingTask = task"
          @delete="handleDelete"
        />
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
.task-manager {
  max-width: 800px;
  padding-bottom: 4rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  color: var(--color-text-muted);
}

.empty-state .emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}

/* Animations */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
  width: 100%; /* Important for smooth removal */
}
</style>
