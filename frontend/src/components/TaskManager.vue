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
  let filtered = tasks.value;
  switch (filter.value) {
    case 'pending':
      filtered = tasks.value.filter(t => !t.completed);
      break;
    case 'completed':
      filtered = tasks.value.filter(t => t.completed);
      break;
  }
  return filtered.sort((a, b) => {
    if (a.completed === b.completed) {
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    }
    return a.completed ? 1 : -1;
  });
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
    if (selectedTask.value?._id === data._id) {
      selectedTask.value = data;
    }
  } catch (error) {
    console.error('Error toggling task', error);
  }
};

const handleDelete = async (id: string | any) => {
    // Si viene de un evento de borrado directo desde el item
    const taskId = typeof id === 'string' ? id : id._id;

  if (!confirm('¿Eliminar esta tarea?')) return;
  try {
    await api.delete(`/tasks/${taskId}`);
    tasks.value = tasks.value.filter(t => t._id !== taskId);
    if (selectedTask.value?._id === taskId) {
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

const openTaskDetails = (task: Task) => {
  selectedTask.value = task;
};

const backToList = () => {
  selectedTask.value = null;
};

onMounted(fetchTasks);
</script>

<template>
  <div class="flex-1 flex flex-col w-full h-full">
    <!-- Vista de Detalles de Tarea -->
    <Transition name="slide">
        <TaskDetailsView
            v-if="selectedTask"
            :task="selectedTask"
            @update="handleUpdateFromDetails"
            @back="backToList"
            @toggle="handleToggle(selectedTask!)"
            @delete="handleDelete(selectedTask!._id!)"
        />
    </Transition>

    <!-- Vista Principal de Tareas -->
    <div v-show="!selectedTask" class="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 pb-20 sm:pb-28 overflow-y-auto overflow-x-hidden custom-scrollbar">
      <!-- Workspace Header (Refined) -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-10 gap-4 sm:gap-6">
        <div>
          <h1 class="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-1 sm:mb-2">My Workspace</h1>
          <p class="text-text-muted text-xs sm:text-sm max-w-md">Gestiona tus prioridades y finanzas en un solo lugar.</p>
        </div>

        <div class="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto justify-start sm:justify-end">
          <!-- Filter Tabs (Glass style) -->
          <div class="flex bg-white/5 p-1 rounded-xl border border-white/5 backdrop-blur-md">
            <button 
              v-for="f in [{id:'all', label:'Todas'}, {id:'pending', label:'Pendientes'}, {id:'completed', label:'Hechas'}]"
              :key="f.id"
              @click="filter = f.id as any"
              class="px-3 py-1.5 sm:px-4 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all"
              :class="filter === f.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-white'"
            >
              {{ f.label }}
            </button>
          </div>

          <button 
            @click="showForm = true"
            class="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-white text-bg-primary font-bold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-white/10"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Nueva
          </button>
        </div>
      </div>

      <!-- Quick Metrics Bar (Minimalist) -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
        <div class="glass-card p-4 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all">
          <div>
            <p class="text-[10px] font-bold text-text-muted uppercase tracking-widest">Pendientes</p>
            <p class="text-xl sm:text-2xl font-black text-white mt-1">{{ pendingCount }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">🔥</div>
        </div>
        <div class="glass-card p-4 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all">
          <div>
            <p class="text-[10px] font-bold text-text-muted uppercase tracking-widest">Completas</p>
            <p class="text-xl sm:text-2xl font-black text-white mt-1">{{ completedCount }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">✅</div>
        </div>
        <div class="glass-card p-4 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all">
          <div>
            <p class="text-[10px] font-bold text-text-muted uppercase tracking-widest">Eficiencia</p>
            <p class="text-xl sm:text-2xl font-black text-white mt-1">{{ tasks.length > 0 ? Math.round((completedCount/tasks.length)*100) : 0 }}%</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">🚀</div>
        </div>
        <div class="glass-card p-4 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all">
          <div>
            <p class="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total</p>
            <p class="text-xl sm:text-2xl font-black text-white mt-1">{{ tasks.length }}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">📋</div>
        </div>
      </div>

      <!-- Main List Container -->
      <div class="flex-1 min-h-0">
        <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
          <div class="animate-spin h-10 w-10 border-4 border-white/5 border-t-primary rounded-full"></div>
          <p class="text-text-muted font-bold text-xs uppercase tracking-widest">Cargando Workspace...</p>
        </div>

        <div v-else class="space-y-2">
          <!-- Empty States -->
          <div v-if="tasks.length === 0" class="glass rounded-3xl p-20 text-center border border-white/5 space-y-6">
            <div class="text-7xl">✨</div>
            <div>
              <h3 class="text-2xl font-black text-text-primary">Tu espacio está limpio</h3>
              <p class="text-text-muted mt-2">Empieza creando una tarea vinculada a tu presupuesto.</p>
            </div>
          </div>

          <!-- Task Items -->
          <TransitionGroup 
            name="task-list" 
            tag="div" 
            class="grid grid-cols-1 gap-3"
          >
            <TaskItem 
              v-for="task in filteredTasks" 
              :key="task._id" 
              :task="task"
              @toggle="handleToggle"
              @edit="openTaskDetails(task)"
              @delete="handleDelete"
            />
          </TransitionGroup>
        </div>
      </div>
    </div>
    
    <!-- Modal Overlay para Formulario -->
    <Transition name="modal">
      <div 
        v-if="showForm" 
        @click.self="handleCancel"
        class="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4 sm:p-6"
      >
        <div class="bg-bg-secondary w-full max-w-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-pop mx-4 sm:mx-0">
          <div class="flex justify-between items-center px-5 py-4 sm:px-8 sm:py-6 border-b border-white/5">
            <h2 class="text-xl sm:text-2xl font-black m-0 tracking-tighter">{{ editingTask ? 'Editar Tarea' : 'Nueva Tarea' }}</h2>
            <button @click="handleCancel" class="w-8 h-8 rounded-full hover:bg-rose-500/20 hover:text-rose-400 text-text-muted flex items-center justify-center transition-all">✕</button>
          </div>
          <div class="p-5 sm:p-8">
            <TaskForm 
              :initial-data="editingTask" 
              @submit="editingTask ? handleUpdate($event) : handleCreate($event)"
              @cancel="handleCancel"
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
}

/* Slide Transition for Details */
.slide-enter-active, .slide-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-enter-from { transform: translateX(30px); opacity: 0; }
.slide-leave-to { transform: translateX(-30px); opacity: 0; }

/* List Transitions */
.task-list-enter-active, .task-list-leave-active {
  transition: all 0.4s var(--ease-spring);
}
.task-list-enter-from, .task-list-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
