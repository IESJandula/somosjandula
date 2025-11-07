<template>
  <h1 class="t-1">Gestión de Incidencias TIC</h1>

  <div class="top-container">
    <div class="top-section">
      <!-- Tarjeta para crear incidencia -->
      <div class="card-upload-csv">
        <div class="container">
          <div class="t-2">Crear nueva incidencia</div>

          <div class="section">
            <label class="t-3">Ubicación</label>
            <select v-model="nuevaIncidencia.ubicacion" class="input">
              <option disabled value="">Selecciona una ubicación</option>
              <option v-for="u in ubicaciones" :key="u" :value="u">
                {{ u }}
              </option>
            </select>

            <label class="t-3">Descripción</label>
            <textarea v-model="nuevaIncidencia.descripcionIncidencia" class="input" placeholder="Describe el problema..."></textarea>

            <label class="t-3">Correo docente</label>
            <input v-model="nuevaIncidencia.correoDocente" class="input" placeholder="Ej: soporte@centro.com" />

           <label class="t-3">Categoría</label>
            <select v-model="categoriaSeleccionadaId" class="input">
              <option value="" disabled>Selecciona una categoría</option>
              <option
                v-for="categoria in categorias"
                :key="categoria.id"
                :value="categoria.id"
              >
                {{ categoria.tipo }} - {{ categoria.nombreResponsable }} ({{ categoria.correoResponsable }})
              </option>
            </select>


            <button @click="crearNuevaIncidencia" class="btn" :disabled="isLoading">Crear incidencia</button>

            <div v-if="isLoading" class="fondo-gris">
              <div class="circulo"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tarjeta con incidencias existentes -->
      <div class="card-upload-table card-upload-csv">
        <div class="t-2">Listado de incidencias</div>
        <table>
          <thead>
            <tr>
              <th class="th">Ubicación</th>
              <th class="th">Descripción</th>
              <th class="th">Estado</th>
              <th class="th">Acción</th>
            </tr>
          </thead>
          <tbody class="t-3">
            <tr v-for="incidencia in incidencias" :key="incidencia.ubicacion">
              <td class="th">{{ incidencia.ubicacion }}</td>
              <td class="th">{{ incidencia.descripcionIncidencia }}</td>
              <td class="th">
                {{ incidencia.estadoIncidencia }}
              </td>
              <td class="th">
                <button @click="borrar(incidencia)" class="eliminar">&times;</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <ion-toast
    :is-open="isToastOpen"
    :message="toastMessage"
    :color="toastColor"
    duration="2000"
    @did-dismiss="() => (isToastOpen = false)"
    position="top"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { IonToast } from "@ionic/vue";
import { crearToast } from "@/utils/toast.js";
import {
  crearIncidencia,
  listarIncidencias,
  borrarIncidencia,
  listarUbicaciones,
  listarCategorias
} from "@/services/issues.js";

// Define el tipo de una incidencia para TypeScript
interface Incidencia {
  ubicacion?: string;
  descripcionIncidencia?: string;
  estadoIncidencia?: string;
  correoDocente?: string;
  correoDestinatario?: string;
  fechaIncidencia?: string;
}

interface CategoriaIncidencia {
  id?: number;
  tipo: string;
  nombreResponsable: string;
  correoResponsable: string;
}

const categorias = ref<CategoriaIncidencia[]>([]);
const categoriaSeleccionadaId = ref<string | number | ''>('');



// Tipamos los arrays y objetos reactivos
const ubicaciones = ref<string[]>([]);
const incidencias = ref<Incidencia[]>([]);
const isLoading = ref(false);
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

// Objeto para crear una nueva incidencia
const nuevaIncidencia = ref<Incidencia>({
  ubicacion: "",
  descripcionIncidencia: "",
  correoDestinatario: "",
  correoDocente: "",
});

async function cargarIncidencias() {
  try {
    incidencias.value = await listarIncidencias(toastMessage, toastColor, isToastOpen);
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al cargar las incidencias");
  }
}

async function crearNuevaIncidencia() {
  try {
    isLoading.value = true;

    // Buscar la categoría seleccionada
    const categoria = categorias.value.find(c => c.id === Number(categoriaSeleccionadaId.value));

    if (!categoria) {
      crearToast(toastMessage, toastColor, isToastOpen, "danger", "Selecciona una categoría");
      return;
    }

    // Rellenar correoDestinatario en la incidencia
    nuevaIncidencia.value.correoDestinatario = categoria.correoResponsable;

    await crearIncidencia(nuevaIncidencia.value as any);
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Incidencia creada correctamente");
    await cargarIncidencias();

    // Limpiar campos
    nuevaIncidencia.value = {
      ubicacion: "",
      descripcionIncidencia: "",
      correoDestinatario: "",
      correoDocente: "",
    };
    categoriaSeleccionadaId.value = '';
  } catch {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al crear incidencia");
  } finally {
    isLoading.value = false;
  }
}


async function borrar(incidencia: Incidencia) {
  try {
    await borrarIncidencia(incidencia, toastMessage, toastColor, isToastOpen);
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Incidencia eliminada");
    await cargarIncidencias(); // refresca la tabla
  } catch {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al eliminar incidencia");
  }
}

async function cargarUbicaciones() {
  try {
    const lista = await listarUbicaciones(toastMessage, toastColor, isToastOpen);
    ubicaciones.value = lista.map((u: any) => u.nombre);
  } catch (e) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al cargar ubicaciones");
  }
}

async function cargarCategorias() {
  try {
    categorias.value = await listarCategorias(toastMessage, toastColor, isToastOpen);
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al cargar categorías");
  }
}


onMounted(async () => {
  await cargarUbicaciones();
  await cargarCategorias();
  await cargarIncidencias();
});


</script>

<style scoped>
.t-1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}
.top-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
.top-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}
.card-upload-csv {
  flex: 1 1 30%;
  min-width: 520px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.t-2 {
  font-size: 1.3rem;
  text-align: center;
  margin-bottom: 1rem;
}
.section {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.t-3 {
  margin-top: 1rem;
  font-size: 1.1rem;
  text-align: left;
}
.input {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.5rem;
  width: 100%;
}
.btn {
  padding: 0.5rem;
  border-radius: 0.375rem;
  background-color: #0054e9;
  color: #fff;
  font-size: 1.1rem;
  margin-top: 1rem;
}
.btn:hover {
  background-color: #1461eb;
}
.fondo-gris {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  display: flex;
  justify-content: center;
  align-items: center;
}
.circulo {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4782eb;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.card-upload-table {
  overflow-y: auto;
  height: 400px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
.th {
  border: 1px solid currentColor;
  padding: 0.5rem 1rem;
  text-align: center;
}
.eliminar {
  color: #ef4444;
  font-size: 1.6rem;
  background: transparent;
  border: none;
}
</style>
