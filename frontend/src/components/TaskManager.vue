<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import api, { type Task } from '../services/api';
import TaskForm from './TaskForm.vue';
import TaskItem from './TaskItem.vue';

const tasks = ref<Task[]>([]);
const loading = ref(true);
const editingTask = ref<Task | null>(null);
const filter = ref<'all' | 'pending' | 'completed'>('all');
const showForm = ref(false);

const completedCount = computed(() => tasks.value.filter(t => t.completed).length);
const pendingCount = computed(() => tasks.value.filter(t => !t.completed).length);

// Filtered tasks based on selected filter
const filteredTasks = computed(() => {
  switch (filter.value) {
    case 'pending':
      return tasks.value.filter(t => !t.completed);
    case 'completed':
      return tasks.value.filter(t => t.completed);
    default:
      return tasks.value;
  }
});

// Open form when editing
watch(editingTask, (newVal) => {
  if (newVal) showForm.value = true;
});

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
    showForm.value = false;
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
    showForm.value = false;
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

const handleCancel = () => {
  showForm.value = false;
  editingTask.value = null;
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

      <!-- Stats as Filters -->
      <div class="stats-filter" v-if="!loading && tasks.length > 0">
        <button 
          class="stat-btn" 
          :class="{ active: filter === 'pending' }"
          @click="filter = filter === 'pending' ? 'all' : 'pending'"
        >
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">Pendientes</span>
        </button>
        <button 
          class="stat-btn" 
          :class="{ active: filter === 'completed' }"
          @click="filter = filter === 'completed' ? 'all' : 'completed'"
        >
          <span class="stat-value">{{ completedCount }}</span>
          <span class="stat-label">Completadas</span>
        </button>
        <button 
          class="stat-btn" 
          :class="{ active: filter === 'all' }"
          @click="filter = 'all'"
        >
          <span class="stat-value">{{ tasks.length }}</span>
          <span class="stat-label">Total</span>
        </button>
      </div>

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
          <p>Crea tu primera tarea para comenzar</p>
          <button class="btn btn-primary" @click="showForm = true">
            + Crear primera tarea
          </button>
        </div>

        <!-- Empty Filter State -->
        <div v-else-if="filteredTasks.length === 0" class="empty-state card">
          <div class="empty-icon">🔍</div>
          <h3>Sin resultados</h3>
          <p>No hay tareas {{ filter === 'pending' ? 'pendientes' : 'completadas' }}</p>
        </div>

        <!-- Tasks -->
        <transition-group name="task" tag="div">
          <TaskItem 
            v-for="task in filteredTasks" 
            :key="task._id" 
            :task="task"
            @toggle="handleToggle"
            @edit="editingTask = task"
            @delete="handleDelete"
          />
        </transition-group>
      </div>
    </div>
    
    <!-- FAB Button -->
    <button 
      class="fab" 
      @click="showForm = true"
      v-if="!showForm && tasks.length > 0"
      title="Nueva tarea"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    </button>
    
    <!-- Modal Overlay -->
    <transition name="modal">
      <div class="modal-overlay" v-if="showForm" @click.self="handleCancel">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editingTask ? 'Editar Tarea' : 'Nueva Tarea' }}</h2>
            <button class="close-btn" @click="handleCancel">✕</button>
          </div>
          <TaskForm 
            :initial-data="editingTask" 
            @submit="editingTask ? handleUpdate($event) : handleCreate($event)"
            @cancel="handleCancel"
          />
        </div>
      </div>
    </transition>
    
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
  padding-bottom: 100px; /* Space for FAB */
}

/* Stats as Filters */
.stats-filter {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  justify-content: center;
}

.stat-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 28px;
  background: var(--glass-bg);
  border: 2px solid var(--glass-border);
  border-radius: var(--radius-md);
  min-width: 110px;
  cursor: pointer;
  transition: var(--transition);
}

.stat-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.stat-btn.active {
  background: rgba(139, 92, 246, 0.15);
  border-color: var(--primary);
  transform: translateY(-2px);
}

.stat-btn .stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-secondary);
  transition: var(--transition);
}

.stat-btn:hover .stat-value,
.stat-btn.active .stat-value {
  color: var(--primary-light);
}

.stat-btn .stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 4px;
  transition: var(--transition);
}

.stat-btn.active .stat-label {
  color: var(--primary-light);
}

/* FAB Button */
.fab {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, #9333ea 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.4);
  transition: var(--transition);
  z-index: 100;
}

.fab:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 12px 40px rgba(139, 92, 246, 0.5);
}

.fab svg {
  width: 28px;
  height: 28px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--glass-border);
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.close-btn:hover {
  background: var(--danger);
  color: white;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
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
  margin-bottom: 24px;
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
  transition: all 0.15s ease;
}

.task-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.task-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.task-leave-active {
  position: absolute;
  width: calc(100% - 48px);
}

/* Responsive */
@media (max-width: 640px) {
  .stats-filter {
    gap: 8px;
  }
  
  .stat-btn {
    padding: 12px 16px;
    min-width: 80px;
  }
  
  .stat-btn .stat-value {
    font-size: 1.5rem;
  }
  
  .fab {
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
  }
  
  .fab svg {
    width: 24px;
    height: 24px;
  }
  
  .modal-overlay {
    padding: 12px;
    align-items: flex-end;
  }
  
  .modal-content {
    max-height: 85vh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
  
  .empty-state {
    padding: 40px 16px;
  }
  
  .empty-icon {
    font-size: 3rem;
  }
}
</style>
