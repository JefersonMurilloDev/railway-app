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
  <div class="bg-[#0f172a] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative overflow-hidden border border-white/10 group">
    <!-- Decorative Glows -->
    <div class="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 via-primary to-rose-500 opacity-80"></div>
    <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Header -->
    <div class="relative px-4 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6 text-center">
      <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
        {{ initialData ? 'Editar Transacción' : 'Nueva Transacción' }}
      </h2>
      <p class="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">
        {{ initialData ? 'Modificar detalle' : 'Registrar movimiento' }}
      </p>

      <button
        @click="emit('cancel')"
        class="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all transform hover:rotate-90"
      >
        ✕
      </button>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="px-4 pb-6 sm:px-8 sm:pb-8 space-y-4 sm:space-y-6">
      <!-- Descripción -->
      <div class="group/input">
        <label class="block text-[10px] uppercase font-black tracking-widest text-text-muted mb-2 ml-1">Concepto</label>
        <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none group-focus-within/input:text-primary transition-colors text-white/30">
                <span class="text-lg">✏️</span>
            </div>
            <input
                v-model="description"
                type="text"
                placeholder="Ej: Starlink Internet"
                class="w-full bg-bg-primary border border-white/5 rounded-2xl py-3 pl-12 pr-4 sm:py-4 sm:pl-12 sm:pr-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
                required
            />
        </div>
      </div>

      <!-- Monto y Fecha -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4">
        <div class="group/input">
          <label class="block text-[10px] uppercase font-black tracking-widest text-text-muted mb-2 ml-1">Monto</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none group-focus-within/input:text-emerald-400 transition-colors text-white/30">
                <span class="text-lg font-black">$</span>
            </div>
            <input
              v-model.number="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              class="w-full bg-bg-primary border border-white/5 rounded-2xl py-3 pl-10 pr-4 sm:py-4 sm:pl-10 sm:pr-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
              required
            />
          </div>
        </div>
        <div class="group/input">
          <label class="block text-[10px] uppercase font-black tracking-widest text-text-muted mb-2 ml-1">Fecha</label>
          <input
            v-model="date"
            type="date"
            class="w-full bg-bg-primary border border-white/5 rounded-2xl py-3 px-3 sm:py-4 sm:px-4 text-white font-bold focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner scheme-dark text-xs sm:text-base"
          />
        </div>
      </div>

      <!-- Categoría -->
      <div class="group/input">
        <label class="block text-[10px] uppercase font-black tracking-widest text-text-muted mb-2 ml-1">Categoría</label>
        <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-white/30">
                <span class="text-lg">🏷️</span>
            </div>
            <select
            v-model="category"
            class="custom-select w-full bg-bg-primary border border-white/5 rounded-2xl py-3 pl-12 pr-10 sm:py-4 sm:pl-12 sm:pr-10 text-white font-bold appearance-none focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner cursor-pointer"
            >
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <!-- Custom Arrow -->
            <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-white/30">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
      </div>

      <!-- Recibo / Comprobante -->
      <div>
        <label class="block text-[10px] uppercase font-black tracking-widest text-text-muted mb-2 ml-1">Comprobante</label>
        <div
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop="handleDrop"
          class="group/drop bg-bg-primary border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-all cursor-pointer relative overflow-hidden"
          :class="dragOver ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5'"
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
          <div v-if="receiptFile" class="relative z-10">
            <img
              v-if="receiptPreview"
              :src="receiptPreview"
              alt="Preview"
              class="max-h-24 sm:max-h-32 mx-auto rounded-lg shadow-lg"
            />
            <div v-else class="text-4xl mb-2">📄</div>
            <p class="text-sm font-bold text-white mt-2">{{ receiptFile.name }}</p>
            <p class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-1">Listo para subir</p>

            <button
              type="button"
              @click.stop="removeFile"
              class="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow-lg transform hover:scale-110 transition-transform"
            >
              ✕
            </button>
          </div>

          <!-- Placeholder -->
          <div v-else class="relative z-10 py-2">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover/drop:scale-110 transition-transform duration-300">
                <span class="text-xl sm:text-2xl opacity-60">☁️</span>
            </div>
            <p class="text-white font-bold text-sm">Sube tu comprobante</p>
            <p class="text-white/40 text-[10px] sm:text-xs mt-1">Arrastra o haz click aquí</p>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex gap-4 pt-2">
        <button
          type="button"
          @click="emit('cancel')"
          class="flex-1 py-3 sm:py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all text-center"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="flex-2 py-3 sm:py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-linear-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Guardando...' : (initialData ? 'Actualizar Transacción' : 'Guardar') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Eliminated old custom CSS in favor of utility classes */
</style>
