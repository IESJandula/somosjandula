<template>
  <!-- 
       SECCIÓN 1 — ADMIN UBICACIONES
   -->
  <h1 class="t-1">Administración de Incidencias TIC</h1>

  <div class="top-container">
    <div class="top-section">
      <div class="card-upload-csv">
        <div class="container">
          <div class="t-2">Crear nueva ubicación</div>

          <div class="section">
            <label class="t-3">Nombre de la ubicación</label>
            <input
              v-model="nuevaUbicacion"
              class="input"
              placeholder="Ej: Aula 1.15, Laboratorio Informática..."
            />
            <button @click="crearNuevaUbicacion" class="btn" :disabled="isLoading || !nuevaUbicacion.trim()">
              Guardar ubicación
            </button>
          </div>
        </div>
      </div>

      <div class="card-upload-table card-upload-csv">
        <div class="t-2">Listado de ubicaciones</div>
        <table>
          <thead>
            <tr>
              <th class="th">Nombre</th>
              <th class="th">Acción</th>
            </tr>
          </thead>
          <tbody class="t-3">
            <tr v-for="u in ubicaciones" :key="u.id">
              <td class="th">{{ u.nombre }}</td>
              <td class="th">
                <button class="eliminar" @click="borrarUbi(u.id!)">&times;</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- 
       SECCIÓN 2 — ADMIN CATEGORÍAS
   -->
  <h1 class="t-1 mt-10">Administración de categorías de incidencias</h1>

  <div class="top-container">
    <div class="top-section">
      <div class="card-upload-csv">
        <div class="container">
          <div class="t-2">Crear nueva categoría</div>

          <div class="section">
            <label class="t-3">Tipo (TIC, DIRECCIÓN...)</label>
            <input v-model="nuevaCategoria.tipo" class="input" />

            <label class="t-3">Nombre responsable</label>
            <input v-model="nuevaCategoria.nombreResponsable" class="input" />

            <label class="t-3">Correo responsable</label>
            <input v-model="nuevaCategoria.correoResponsable" class="input" />

            <button class="btn" @click="crearNuevaCategoria">Guardar categoría</button>
          </div>
        </div>
      </div>

      <div class="card-upload-table card-upload-csv">
        <div class="t-2">Lista de categorías</div>
        <table>
          <thead>
            <tr>
              <th class="th">Tipo</th>
              <th class="th">Nombre responsable</th>
              <th class="th">Correo</th>
              <th class="th">Acción</th>
            </tr>
          </thead>
          <tbody class="t-3">
            <tr v-for="categoria in categorias" :key="categoria.id">
              <td class="th">{{ categoria.tipo }}</td>
              <td class="th">{{ categoria.nombreResponsable }}</td>
              <td class="th">{{ categoria.correoResponsable }}</td>
              <td class="th">
                <button class="eliminar" @click="borrarCat(categoria.id!)">&times;</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Toast global -->
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
  listarUbicaciones,
  crearUbicacion,
  borrarUbicacion,
  listarCategorias,
  crearCategoria,
  borrarCategoria
} from "@/services/issues.js";

interface Ubicacion {
  id?: number;
  nombre: string;
}

interface CategoriaIncidencia {
  id?: number;
  tipo: string;
  nombreResponsable: string;
  correoResponsable: string;
}

const ubicaciones = ref<Ubicacion[]>([]);
const nuevaUbicacion = ref("");
const categorias = ref<CategoriaIncidencia[]>([]);
const nuevaCategoria = ref<CategoriaIncidencia>({
  tipo: "",
  nombreResponsable: "",
  correoResponsable: "",
});
const isLoading = ref(false);
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

/* 
   FUNCIONES UBICACIONES
 */
async function cargarUbicaciones() {
  try {
    ubicaciones.value = await listarUbicaciones(toastMessage, toastColor, isToastOpen);
  } catch {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al cargar ubicaciones");
  }
}

async function crearNuevaUbicacion() {
  const nombre = nuevaUbicacion.value.trim();
  if (!nombre) return;
  try {
    isLoading.value = true;
    const resp = await crearUbicacion(nombre, toastMessage, toastColor, isToastOpen);
    if (!resp.ok) throw new Error("Error al crear ubicación");
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Ubicación creada correctamente");
    nuevaUbicacion.value = "";
    await cargarUbicaciones();
  } catch (e: any) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al crear ubicación");
  } finally {
    isLoading.value = false;
  }
}

async function borrarUbi(id: number) {
  try {
    await borrarUbicacion(id, toastMessage, toastColor, isToastOpen);
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Ubicación eliminada");
    await cargarUbicaciones();
  } catch {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al borrar ubicación");
  }
}

/* 
   FUNCIONES CATEGORÍAS
 */
async function cargarCategorias() {
  try {
    categorias.value = await listarCategorias(toastMessage, toastColor, isToastOpen);
  } catch {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al cargar categorías");
  }
}

async function crearNuevaCategoria() {
  try {
    await crearCategoria(nuevaCategoria.value, toastMessage, toastColor, isToastOpen);
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Categoría creada");
    await cargarCategorias();
    nuevaCategoria.value = { tipo: "", nombreResponsable: "", correoResponsable: "" };
  } catch {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al crear categoría");
  }
}

async function borrarCat(id: number) {
  try {
    await borrarCategoria(id, toastMessage, toastColor, isToastOpen);
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Categoría eliminada");
    await cargarCategorias();
  } catch {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al borrar categoría");
  }
}

onMounted(async () => {
  await cargarUbicaciones();
  await cargarCategorias();
});
</script>

<style scoped>
.t-1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}
.mt-10 {
  margin-top: 4rem;
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
  cursor: pointer;
}
</style>
