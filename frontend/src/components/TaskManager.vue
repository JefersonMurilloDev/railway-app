<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api, { type Task } from '../services/api';
import TaskForm from './TaskForm.vue';
import TaskItem from './TaskItem.vue';

const tasks = ref<Task[]>([]);
const loading = ref(true);
const editingTask = ref<Task | null>(null);

const completedCount = computed(() => tasks.value.filter(t => t.completed).length);
const pendingCount = computed(() => tasks.value.filter(t => !t.completed).length);

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
    editingTask.value = null;
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
  if (!confirm('¿Eliminar esta tarea?')) return;
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
  <div class="app-wrapper">
    <div class="container">
      <header>
        <h1>TaskFlow</h1>
        <p>Organiza tu día, conquista tus metas</p>
      </header>

      <!-- Stats -->
      <div class="stats" v-if="!loading && tasks.length > 0">
        <div class="stat">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">Pendientes</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ completedCount }}</span>
          <span class="stat-label">Completadas</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ tasks.length }}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>

      <!-- Form -->
      <TaskForm 
        :initial-data="editingTask" 
        @submit="editingTask ? handleUpdate($event) : handleCreate($event)"
        @cancel="editingTask = null"
      />

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando tareas...</p>
      </div>

      <!-- Task List -->
      <div v-else class="task-list">
        <!-- Empty State -->
        <div v-if="tasks.length === 0" class="empty-state card">
          <div class="empty-icon">📋</div>
          <h3>Tu lista está vacía</h3>
          <p>Crea tu primera tarea para comenzar a ser productivo</p>
        </div>

        <!-- Tasks -->
        <transition-group name="task" tag="div">
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
    
    <!-- Footer -->
    <footer>
      <p>TaskFlow — Hecho con 💜</p>
    </footer>
  </div>
</template>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
  padding-bottom: 40px;
}

/* Stats */
.stats {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  justify-content: center;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 24px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  min-width: 100px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-light);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 24px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.empty-state p {
  color: var(--text-muted);
}

/* Loading */
.loading {
  text-align: center;
  padding: 60px 24px;
  color: var(--text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--glass-border);
  border-top-color: var(--primary);
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer */
footer {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Transitions */
.task-move,
.task-enter-active,
.task-leave-active {
  transition: all 0.4s ease;
}

.task-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.task-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.task-leave-active {
  position: absolute;
  width: calc(100% - 48px);
}

/* Responsive */
@media (max-width: 640px) {
  .stats {
    gap: 8px;
  }
  
  .stat {
    padding: 12px 16px;
    min-width: 80px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .empty-state {
    padding: 40px 16px;
  }
  
  .empty-icon {
    font-size: 3rem;
  }
}
</style>
