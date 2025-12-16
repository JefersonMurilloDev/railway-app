<script setup lang="ts">
import { ref, watch } from 'vue';
import { createExpense, updateExpense, type Expense } from '../services/expenses';

const props = defineProps<{
  accountId: string;
  initialData?: Expense | null;
}>();

const emit = defineEmits<{
  (e: 'created', expense: Expense): void;
  (e: 'updated', expense: Expense): void;
  (e: 'cancel'): void;
}>();

// Form state
const description = ref('');
const amount = ref(0);
const date = ref('');
const category = ref('General');
const receiptFile = ref<File | null>(null);
const receiptPreview = ref<string | null>(null);
const loading = ref(false);
const dragOver = ref(false);

// Categorías disponibles
const categories = ['General', 'Comida', 'Transporte', 'Salud', 'Servicios', 'Entretenimiento', 'Educación', 'Otro'];

// Helper para obtener fecha como string
const getDateString = (dateValue?: string): string => {
    if (dateValue) {
        return dateValue.split('T')[0] ?? '';
    }
    return new Date().toISOString().split('T')[0] ?? '';
};

// Inicializar con datos existentes si es edición
watch(() => props.initialData, (data) => {
    if (data) {
        description.value = data.description ?? '';
        amount.value = data.amount ?? 0;
        date.value = getDateString(data.date);
        category.value = data.category ?? 'General';
        receiptFile.value = null;
        receiptPreview.value = null;
    } else {
        description.value = '';
        amount.value = 0;
        date.value = getDateString();
        category.value = 'General';
        receiptFile.value = null;
        receiptPreview.value = null;
    }
}, { immediate: true });

// Manejar archivo seleccionado
const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        processFile(target.files[0]);
    }
};

// Manejar drag & drop
const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    dragOver.value = false;
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
        processFile(event.dataTransfer.files[0]);
    }
};

// Procesar archivo
const processFile = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        alert('Tipo de archivo no permitido. Solo imágenes y PDF.');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        alert('El archivo excede 5MB');
        return;
    }
    receiptFile.value = file;

    // Preview para imágenes
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            receiptPreview.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    } else {
        receiptPreview.value = null;
    }
};

// Remover archivo
const removeFile = () => {
    receiptFile.value = null;
    receiptPreview.value = null;
};

// Enviar formulario
const handleSubmit = async () => {
    if (!description.value.trim() || !amount.value) return;

    const formData = new FormData();
    formData.append('description', description.value.trim());
    formData.append('amount', amount.value.toString());
    formData.append('date', date.value || new Date().toISOString());
    formData.append('category', category.value);
    formData.append('accountId', props.accountId);

    if (receiptFile.value) {
        formData.append('receipt', receiptFile.value);
    }

    try {
        loading.value = true;
        if (props.initialData?._id) {
            const updated = await updateExpense(props.initialData._id, formData);
            emit('updated', updated);
        } else {
            const created = await createExpense(formData);
            emit('created', created);
        }
    } catch (error) {
        console.error('Error guardando gasto:', error);
        alert('Error al guardar el gasto');
    } finally {
        loading.value = false;
    }
};
</script>

<template>
  <div class="bg-bg-secondary border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
    <!-- Header -->
    <div class="flex justify-between items-center p-5 border-b border-white/10">
      <div class="flex items-center gap-3">
        <span class="text-2xl">🧾</span>
        <h2 class="text-xl font-semibold">{{ initialData ? 'Editar Gasto' : 'Nuevo Gasto' }}</h2>
      </div>
      <button
        @click="emit('cancel')"
        class="w-8 h-8 rounded-full bg-white/5 text-text-muted flex items-center justify-center hover:bg-danger hover:text-white transition-all"
      >
        ✕
      </button>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="p-5 space-y-5">
      <!-- Descripción -->
      <div>
        <label class="block text-sm font-medium text-text-secondary mb-2">Descripción</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">✏️</span>
          <input
            v-model="description"
            type="text"
            placeholder="Ej: Compras del supermercado"
            class="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            required
          />
        </div>
      </div>

      <!-- Monto y Fecha -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-text-secondary mb-2">Monto</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
            <input
              v-model.number="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              class="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-text-secondary mb-2">Fecha</label>
          <input
            v-model="date"
            type="date"
            class="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <!-- Categoría -->
      <div>
        <label class="block text-sm font-medium text-text-secondary mb-2">Categoría</label>
        <select
          v-model="category"
          class="custom-select w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
        >
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <!-- Recibo / Comprobante -->
      <div>
        <label class="block text-sm font-medium text-text-secondary mb-2">Recibo / Comprobante</label>
        <div
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop="handleDrop"
          class="border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer"
          :class="dragOver ? 'border-primary bg-primary/10' : 'border-white/20 hover:border-primary/40'"
          @click="($refs.fileInput as HTMLInputElement).click()"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*,application/pdf"
            class="hidden"
            @change="handleFileChange"
          />

          <!-- Preview -->
          <div v-if="receiptFile" class="relative">
            <img
              v-if="receiptPreview"
              :src="receiptPreview"
              alt="Preview"
              class="max-h-32 mx-auto rounded-lg"
            />
            <div v-else class="text-4xl">📄</div>
            <p class="text-sm text-text-muted mt-2">{{ receiptFile.name }}</p>
            <button
              type="button"
              @click.stop="removeFile"
              class="absolute top-0 right-0 w-6 h-6 bg-danger text-white rounded-full text-xs hover:scale-110 transition-transform"
            >
              ✕
            </button>
          </div>

          <!-- Placeholder -->
          <div v-else>
            <div class="text-4xl text-text-muted mb-2">☁️</div>
            <p class="text-primary text-sm font-medium">Sube una imagen</p>
            <p class="text-text-muted text-xs">o arrastra aquí</p>
            <p class="text-text-muted text-xs mt-2">PNG, JPG, PDF hasta 5MB</p>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3 pt-4">
        <button
          type="button"
          @click="emit('cancel')"
          class="flex-1 py-3 rounded-xl font-medium text-text-muted border border-white/10 hover:bg-white/5 transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 py-3 rounded-xl font-bold text-white bg-linear-to-br from-indigo-500 via-primary to-purple-500 hover:shadow-lg hover:shadow-primary/40 active:scale-98 transition-all duration-300 disabled:opacity-50"
        >
          {{ loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar Gasto') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Fix for select dropdown options in dark mode */
.custom-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a0a0a0' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.custom-select option {
  background-color: #1a1a2e;
  color: white;
  padding: 8px;
}
</style>
