<template>
  <div class="main-container">
    <div class="center-container">

      <!-- FORMULARIO -->
      <div class="left-container">
        <div class="form-container">
          <h2 class="window-title">CREAR HUELGA</h2>

          <div class="form-row">
            <label class="form-label">Título:</label>
            <input type="text" v-model="huelga.titulo" class="form-input" />
          </div>

          <div class="form-row">
            <label class="form-label">Inicio de inscripciones:</label>
            <input type="date" v-model="huelga.fechaInicio" class="form-input" />
          </div>

          <div class="form-row">
            <label class="form-label">Fin de inscripciones:</label>
            <input type="date" v-model="huelga.fechaFin" class="form-input" />
          </div>

          <div class="button-row">
            <button class="btn-enviar" @click="crearHuelgaFn">
              ENVIAR
            </button>
          </div>

        </div>
      </div>

      <!-- TABLA -->
      <div class="right-container">
        <div class="form-container-table">
          <h2 class="window-title">HISTÓRICO DE HUELGAS</h2>

          <table class="events-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Inicio inscrip.</th>
                <th>Fin inscrip.</th>
                <th>Estado</th>
                <th>Formulario</th>
                <th>Nº Participantes</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="h in huelgas" :key="h.titulo">
                <td>{{ h.titulo }}</td>
                <td>{{ formatFecha(h.fechaInicio) }}</td>
                <td>{{ formatFecha(h.fechaFin) }}</td>
                <td>{{ h.estado }}</td>
                <td>
                  <div class="url-container">
                    <input
                      type="text"
                      :value="h.urlEncuestado"
                      readonly
                      class="url-input"
                    />
                    <button
                      class="btn-copiar"
                      @click="copiarUrl(h.urlEncuestado)"
                    >
                      📋
                    </button>
                  </div>
                </td>
                <td>
                  <button class="btn-eliminar" @click="borrarHuelgaFn(h.titulo)">
                    X
                  </button>
                </td>
              </tr>
              <tr v-if="huelgas.length === 0">
                <td colspan="8" class="no-data">
                  No hay huelgas registradas
                </td>
              </tr>
            </tbody>
          </table>

          <!-- PAGINACIÓN -->
          <div class="paginacion">
            <button @click="paginaAnterior" :disabled="currentPage === 0">
              ←
            </button>

            <span>{{ currentPage + 1 }} / {{ totalPages }}</span>

            <button
              @click="paginaSiguiente"
              :disabled="currentPage >= totalPages - 1"
            >
              →
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>

  <ion-toast
    :is-open="isToastOpen"
    :message="toastMessage"
    :color="toastColor"
    duration="2000"
    position="top"
    @did-dismiss="isToastOpen = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { IonToast } from "@ionic/vue";
import { crearHuelga, obtenerHuelgas, borrarHuelga } from "@/services/strikes.js";

/* ================= TIPOS ================= */

interface Huelga {
  titulo: string;
  fechaInicio: number;
  fechaFin: number;
  estado: string;
  urlEncuestado: string;
}

interface Page<T> {
  content: T[];
  totalPages: number;
  number: number;
}

interface HuelgaForm {
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
}

/* ================= STATE ================= */

const huelgas = ref<Huelga[]>([]);
const totalPages = ref(0);
const currentPage = ref(0);

const huelga = ref<HuelgaForm>({
  titulo: "",
  fechaInicio: "",
  fechaFin: "",
});

const ultimaUrlForm = ref<string | null>(null);

const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

/* ================= UTIL ================= */

function dateToTimestamp(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

function formatFecha(ts: number): string {
  return new Date(ts).toLocaleDateString("es-ES");
}
/* ================= API ================= */

async function cargarHuelgas(page = 0) {
  const data: Page<Huelga> = await obtenerHuelgas(
    toastMessage,
    toastColor,
    isToastOpen,
    page,
    5
  );

  huelgas.value = data.content;
  totalPages.value = data.totalPages;
  currentPage.value = data.number;
}

function mostrarToast(
  mensaje: string,
  color: "success" | "warning" | "danger"
) {
  toastMessage.value = mensaje;
  toastColor.value = color;
  isToastOpen.value = true;
}

/* ================= CREAR ================= */

async function crearHuelgaFn() {
  try {

    if (!huelga.value.titulo) {
      mostrarToast("El título es obligatorio", "warning");
      return;
    }

    if (!huelga.value.fechaInicio) {
      mostrarToast("La fecha de inicio de inscripciones es obligatoria", "warning");
      return;
    }

    if (!huelga.value.fechaFin) {
      mostrarToast("La fecha de fin de inscripciones es obligatoria", "warning");
      return;
    }

    const inicio = dateToTimestamp(huelga.value.fechaInicio);
    const fin = dateToTimestamp(huelga.value.fechaFin);

    if (fin < inicio) {
      mostrarToast("La fecha fin no puede ser anterior al inicio", "warning");
      return;
    }

    await crearHuelga(
      toastMessage,
      toastColor,
      isToastOpen,
      huelga.value.titulo,
      inicio,
      fin
    );

    mostrarToast("Huelga creada correctamente", "success");

    huelga.value = {
      titulo: "",
      fechaInicio: "",
      fechaFin: "",
    };

    await cargarHuelgas();

  } catch (error: any) {

    if (error?.response) {
      if (error.response.status === 400) {
        mostrarToast(
          error.response.data || "Error de validación en servidor",
          "warning"
        );
      } else {
        mostrarToast("Error interno del servidor", "danger");
      }
    } else {
      mostrarToast("No se pudo conectar con el servidor", "danger");
    }
  }
}

/* ================= BORRAR ================= */

async function borrarHuelgaFn(titulo: string) {
  try {

    await borrarHuelga(
      toastMessage,
      toastColor,
      isToastOpen,
      titulo
    );

    mostrarToast("Recursos eliminados correctamente", "success");

    await cargarHuelgas(currentPage.value);

  } catch (error: any) {

    if (error?.response) {
      if (error.response.status === 400) {
        mostrarToast(
          error.response.data || "Error en la petición",
          "warning"
        );
      } else {
        mostrarToast("Error interno del servidor", "danger");
      }
    } else {
      mostrarToast("No se pudo conectar con el servidor", "danger");
    }
  }
}
async function copiarUrl(url: string) {
  if (!url) {
    mostrarToast("No hay URL disponible", "warning");
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    mostrarToast("URL copiada al portapapeles", "success");
  } catch (error) {
    mostrarToast("No se pudo copiar la URL", "danger");
  }
}

/* ================= PAGINACIÓN ================= */

function paginaAnterior() {
  if (currentPage.value > 0) {
    cargarHuelgas(currentPage.value - 1);
  }
}

function paginaSiguiente() {
  if (currentPage.value < totalPages.value - 1) {
    cargarHuelgas(currentPage.value + 1);
  }
}

onMounted(() => cargarHuelgas());
</script>

<style scoped>
.main-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
}

.center-container {
  display: flex;
  gap: 20px;
  max-width: 1200px;
  width: 100%;
}

.left-container { flex: 1; }
.right-container { flex: 2; }

.form-container,
.form-container-table {
  background: #fff;
  border: 1px solid #444;
  border-radius: 10px;
  padding: 25px;
}

.window-title {
  border-bottom: 2px solid #007bff;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  align-items: center;
}

.form-label {
  min-width: 120px;
}

.form-input {
  flex: 1;
  padding: 8px;
}

.button-row {
  display: flex;
  justify-content: flex-end;
}

.btn-enviar {
  background: #007bff;
  color: white;
  padding: 10px 25px;
  border: none;
  border-radius: 4px;
}

.events-table {
  width: 100%;
  border-collapse: collapse;
}

.events-table th,
.events-table td {
  border: 1px solid #007bff;
  padding: 8px;
}

.events-table th {
  background: #007bff;
  color: white;
}

.no-data {
  text-align: center;
}

.paginacion {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}
.url-container {
  display: flex;
  gap: 6px;
  align-items: center;
}

.url-input {
  width: 180px;
  padding: 5px;
  font-size: 12px;
}

.btn-copiar {
  background: #28a745;
  color: white;
  border: none;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-copiar:hover {
  background: #218838;
}
</style>
