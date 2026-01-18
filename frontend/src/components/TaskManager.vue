<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import api, { type Task } from '../services/api';
import TaskForm from './TaskForm.vue';
import TaskItem from './TaskItem.vue';
import TaskDetailsView from './TaskDetailsView.vue';

const tasks = ref<Task[]>([]);
const loading = ref(true);
const editingTask = ref<Task | null>(null);
const selectedTask = ref<Task | null>(null);
const filter = ref<'all' | 'pending' | 'completed'>('all');
const showForm = ref(false);

const completedCount = computed(() => tasks.value.filter(t => t.completed).length);
const pendingCount = computed(() => tasks.value.filter(t => !t.completed).length);

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

// Actualizar desde TaskDetailsView
const handleUpdateFromDetails = async (taskData: Partial<Task>) => {
  if (!selectedTask.value?._id) return;
  try {
    const { data } = await api.put(`/tasks/${selectedTask.value._id}`, taskData);
    const index = tasks.value.findIndex(t => t._id === data._id);
    if (index !== -1) tasks.value[index] = data;
    selectedTask.value = data;
  } catch (error) {
    console.error('Error updating task', error);
  }
};

const handleToggle = async (task: Task) => {
  try {
    const { data } = await api.patch(`/tasks/${task._id}/toggle`);
    const index = tasks.value.findIndex(t => t._id === data._id);
    if (index !== -1) tasks.value[index] = data;
    // Si estamos en la vista de detalle, actualizar también
    if (selectedTask.value?._id === data._id) {
      selectedTask.value = data;
    }
  } catch (error) {
    console.error('Error toggling task', error);
  }
};

const handleDelete = async (id: string) => {
  if (!confirm('¿Eliminar esta tarea?')) return;
  try {
    await api.delete(`/tasks/${id}`);
    tasks.value = tasks.value.filter(t => t._id !== id);
    // Si estábamos viendo esta tarea, volver a la lista
    if (selectedTask.value?._id === id) {
      selectedTask.value = null;
    }
  } catch (error) {
    console.error('Error deleting task', error);
  }
};

const handleCancel = () => {
  showForm.value = false;
  editingTask.value = null;
};

// Abrir vista de detalles al hacer clic en una tarea
const openTaskDetails = (task: Task) => {
  selectedTask.value = task;
};

// Volver a la lista de tareas
const backToList = () => {
  selectedTask.value = null;
};

onMounted(fetchTasks);
</script>

<template>
  <div class="flex-1 flex flex-col w-full">
    <!-- Vista de Detalles de Tarea -->
    <TaskDetailsView
      v-if="selectedTask"
      :task="selectedTask"
      @update="handleUpdateFromDetails"
      @back="backToList"
      @toggle="handleToggle(selectedTask!)"
      @delete="handleDelete(selectedTask!._id!)"
    />

    <!-- Vista Principal de Tareas -->
    <div v-else class="flex-1 max-w-4xl mx-auto w-full px-4 py-8 pb-28">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl md:text-5xl font-bold bg-linear-to-br from-indigo-500 via-primary to-purple-500 bg-clip-text text-transparent mb-2">TaskFlow</h1>
        <p class="text-text-muted">Organiza tu día, conquista tus metas</p>
      </header>

      <!-- Stats as Filters -->
      <div v-if="!loading && tasks.length > 0" class="flex gap-3 justify-center mb-6 flex-wrap">
        <button 
          v-for="stat in [
            { key: 'pending', value: pendingCount, label: 'Pendientes' },
            { key: 'completed', value: completedCount, label: 'Completadas' },
            { key: 'all', value: tasks.length, label: 'Total' }
          ]"
          :key="stat.key"
          @click="filter = filter === stat.key ? 'all' : stat.key as any"
          class="flex flex-col items-center px-7 py-4 bg-white/5 border-2 border-white/10 rounded-xl min-w-[110px] cursor-pointer transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5 active:scale-95 group"
          :class="{ 'bg-primary/15 border-primary -translate-y-0.5': filter === stat.key }"
        >
          <span 
            class="text-3xl font-bold text-text-secondary transition-all group-hover:text-primary-light"
            :class="{ 'text-primary-light!': filter === stat.key }"
          >
            {{ stat.value }}
          </span>
          <span 
            class="text-xs uppercase tracking-wider mt-1 text-text-muted group-hover:text-primary-light"
            :class="{ 'text-primary-light!': filter === stat.key }"
          >
            {{ stat.label }}
          </span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-16 text-text-muted">
        <div class="animate-spin h-10 w-10 border-3 border-white/10 border-t-primary rounded-full mx-auto mb-4"></div>
        <p>Cargando tareas...</p>
      </div>

      <!-- Task List -->
      <div v-else>
        <!-- Empty State -->
        <div v-if="tasks.length === 0" class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center py-16">
          <div class="text-6xl mb-4">📋</div>
          <h3 class="text-xl font-semibold text-text-primary mb-2">Tu lista está vacía</h3>
          <p class="text-text-muted mb-6">Crea tu primera tarea para comenzar</p>
          <button @click="showForm = true" class="px-5 py-3 rounded-xl font-bold text-white bg-linear-to-br from-indigo-500 via-primary to-purple-500 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
            + Crear primera tarea
          </button>
        </div>

        <!-- Empty Filter State -->
        <div v-else-if="filteredTasks.length === 0" class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center py-16">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold text-text-primary mb-2">Sin resultados</h3>
          <p class="text-text-muted">No hay tareas {{ filter === 'pending' ? 'pendientes' : 'completadas' }}</p>
        </div>

        <!-- Tasks -->
        <transition-group name="list" tag="div" class="space-y-3 relative">
          <TaskItem 
            v-for="(task, index) in filteredTasks" 
            :key="task._id" 
            :task="task"
            :style="{ transitionDelay: `${index * 50}ms` }"
            @toggle="handleToggle"
            @edit="openTaskDetails(task)"
            @delete="handleDelete"
            @click="openTaskDetails(task)"
          />
        </transition-group>
      </div>
    </div>
    
    <!-- FAB Button -->
    <button 
      v-if="!showForm && !selectedTask && tasks.length > 0"
      @click="showForm = true"
      title="Nueva tarea"
      class="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-linear-to-br from-primary to-purple-600 text-white cursor-pointer flex items-center justify-center shadow-lg shadow-primary/40 transition-all duration-300 hover:scale-110 hover:rotate-90 active:scale-90 z-50"
    >
      <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    </button>
    
    <!-- Modal Overlay -->
    <Transition name="modal">
      <div 
        v-if="showForm" 
        @click.self="handleCancel"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center z-200 p-5 sm:items-center sm:p-5 items-end pb-0 sm:pb-5"
      >
        <div class="bg-bg-secondary border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="flex justify-between items-center p-5 border-b border-white/10">
            <h2 class="text-xl font-semibold m-0">{{ editingTask ? 'Editar Tarea' : 'Nueva Tarea' }}</h2>
            <button @click="handleCancel" class="w-8 h-8 rounded-full bg-white/5 border-none text-text-muted cursor-pointer flex items-center justify-center transition-all hover:bg-danger hover:text-white">✕</button>
          </div>
          <TaskForm 
            :initial-data="editingTask" 
            @submit="editingTask ? handleUpdate($event) : handleCreate($event)"
            @cancel="handleCancel"
          />
        </div>
      </div>
    </Transition>
    
    <!-- Footer -->
    <footer class="text-center py-6 text-text-muted text-sm">
      <p>TaskFlow — Hecho con 💜</p>
    </footer>
  </div>
</template>

<style scoped>
/* List Transitions */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s var(--ease-spring);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.list-leave-active {
  position: absolute;
  width: 100%;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s var(--ease-card);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-bg-secondary,
.modal-leave-to .bg-bg-secondary {
  transform: scale(0.95) translateY(10px);
}
</style>
