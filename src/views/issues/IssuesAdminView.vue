<template>
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
            <button
              @click="crearNuevaUbicacionFunc"
              class="btn"
              :disabled="isLoading || !nuevaUbicacion.trim()"
            >
              Guardar ubicación
            </button>
          </div>
        </div>
      </div>

      <div class="card-upload-table card-upload-csv">
        <div class="t-2">Listado de ubicaciones</div>
        <div class="tabla-container">
          <table>
            <thead>
              <tr>
                <th class="th">Nombre</th>
                <th class="th">Acción</th>
              </tr>
            </thead>
            <tbody class="t-3">
              <tr v-for="u in ubicaciones" :key="u.nombre">
                <td class="th">{{ u.nombre }}</td>
                <td class="th">
                  <button class="eliminar" @click="borrarUbicacionFunc(u.nombre)">&times;</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <h1 class="t-1 mt-10">Administración de categorías</h1>

  <div class="top-container">
    <div class="top-section">
      <div class="card-upload-csv">
        <div class="container">
          <div class="t-2">Crear nueva categoría</div>

          <div class="section">
            <label class="t-3">Nombre de la categoría (TIC, DIRECCIÓN...)</label>
            <input v-model="nuevaCategoria" class="input" />

            <button class="btn" @click="crearNuevaCategoriaFunc">Guardar categoría</button>
          </div>
        </div>
      </div>

      <div class="card-upload-table card-upload-csv">
        <div class="t-2">Lista de categorías</div>
        <div class="tabla-container">
          <table>
            <thead>
              <tr>
                <th class="th">Nombre categoría</th>
                <th class="th">Acción</th>
              </tr>
            </thead>
            <tbody class="t-3">
              <tr v-for="categoria in categorias" :key="categoria.nombre">
                <td class="th">{{ categoria.nombre }}</td>
                <td class="th">
                  <button class="eliminar" @click="borrarCategoriaFunc(categoria.nombre)">
                    &times;
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <h1 class="t-1 mt-10">Administración de usuarios responsables por categoría</h1>

  <div class="top-container">
    <div class="top-section">
      <div class="card-upload-csv">
        <div class="container">
          <div class="t-2">Crear nuevo responsable de categoría</div>

          <div class="section">
            <label class="t-3">Categoría</label>
            <select v-model="nuevoUsuarioCategoria.nombreCategoria" class="input">
              <option value="" disabled>Selecciona una categoría</option>
              <option
                v-for="categoria in categorias"
                :key="categoria.nombre"
                :value="categoria.nombre"
              >
                {{ categoria.nombre }}
              </option>
            </select>

            <label class="t-3">Nombre responsable</label>
            <input v-model="nuevoUsuarioCategoria.nombreResponsable" class="input" />

            <label class="t-3">Correo responsable</label>
            <input v-model="nuevoUsuarioCategoria.emailResponsable" class="input" />

            <button class="btn" @click="crearNuevoUsuarioCategoriaFunc">
              Guardar responsable
            </button>
          </div>
        </div>
      </div>

      <div class="card-upload-table card-upload-csv">
        <div class="t-2">Lista de responsables por categoría</div>
        <div class="tabla-container">
          <table>
            <thead>
              <tr>
                <th class="th">Categoría</th>
                <th class="th">Nombre responsable</th>
                <th class="th">Correo responsable</th>
                <th class="th">Acción</th>
              </tr>
            </thead>
            <tbody class="t-3">
              <tr
                v-for="usuario in usuariosCategoria"
                :key="usuario.nombreCategoria + '-' + usuario.nombreResponsable + '-' + usuario.emailResponsable"
              >
                <td class="th">{{ usuario.nombreCategoria }}</td>
                <td class="th">{{ usuario.nombreResponsable }}</td>
                <td class="th">{{ usuario.emailResponsable }}</td>
                <td class="th">
                  <button class="eliminar" @click="borrarUsuarioCategoriaFunc(usuario)">
                    &times;
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
  listarUbicaciones,
  crearUbicacion,
  borrarUbicacion,
  listarCategorias,
  crearCategoria,
  borrarCategoria,
  listarUsuariosCategoria,
  crearUsuarioCategoria,
  borrarUsuarioCategoria,
} from "@/services/issues.js";

interface Ubicacion {
  nombre: string;
}

interface Categoria {
  nombre: string;
}

interface UsuarioCategoria {
  nombreCategoria: string;
  nombreResponsable: string;
  emailResponsable: string;
}

const ubicaciones = ref<Ubicacion[]>([]);
const nuevaUbicacion = ref("");

const categorias = ref<Categoria[]>([]);
const nuevaCategoria = ref<string>("");

const usuariosCategoria = ref<UsuarioCategoria[]>([]);
const nuevoUsuarioCategoria = ref<UsuarioCategoria>({
  nombreCategoria: "",
  nombreResponsable: "",
  emailResponsable: "",
});

const isLoading = ref(false);
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

async function cargarUbicaciones() {
  try {
    ubicaciones.value = await listarUbicaciones(toastMessage, toastColor, isToastOpen);
  } catch {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al cargar ubicaciones");
  }
}

async function crearNuevaUbicacionFunc() {
  const nombre = nuevaUbicacion.value.trim();
  if (!nombre) return;
  try {
    isLoading.value = true;
    const resp = await crearUbicacion(toastMessage, toastColor, isToastOpen, nombre);
    if (!resp.ok) throw new Error("Error al crear ubicación");
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Ubicación creada correctamente");
    nuevaUbicacion.value = "";
    await cargarUbicaciones();
  } catch (e: any) {
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "danger",
      e.message || "Error al crear ubicación"
    );
  } finally {
    isLoading.value = false;
  }
}

async function borrarUbicacionFunc(nombre: string) {
  try {
    await borrarUbicacion(toastMessage, toastColor, isToastOpen, nombre);
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Ubicación eliminada");
    await cargarUbicaciones();
  } catch {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al borrar ubicación");
  }
}

async function cargarCategorias() {
  try {
    categorias.value = await listarCategorias(toastMessage, toastColor, isToastOpen);
  } catch {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al cargar categorías");
  }
}

async function crearNuevaCategoriaFunc() {
  try {
    const nombreCategoria = nuevaCategoria.value.trim();

    if (!nombreCategoria) {
      crearToast(
        toastMessage,
        toastColor,
        isToastOpen,
        "danger",
        "El nombre de la categoría es obligatorio"
      );
      return;
    }

    const existe = categorias.value.some(
      (c) => c.nombre.trim().toLowerCase() === nombreCategoria.toLowerCase()
    );

    if (existe) {
      crearToast(
        toastMessage,
        toastColor,
        isToastOpen,
        "danger",
        "Ya existe una categoría con ese nombre: " + nombreCategoria
      );
      return;
    }

    await crearCategoria(
      toastMessage,
      toastColor,
      isToastOpen,
      nombreCategoria
    );
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Categoría creada");
    await cargarCategorias();
    nuevaCategoria.value = "";
  } catch (e: any) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e?.message || "Error al crear categoría");
  }
}

async function borrarCategoriaFunc(nombreCategoria: string) {
  try {
    await borrarCategoria(toastMessage, toastColor, isToastOpen, nombreCategoria);

    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "success",
      "Categoría eliminada correctamente"
    );

    await cargarCategorias();
    await cargarUsuariosCategoria();
  } catch (e: any) {
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "danger",
      e?.message || "No se pudo borrar la categoría"
    );
  }
}

async function cargarUsuariosCategoria() {
  try {
    usuariosCategoria.value = await listarUsuariosCategoria(
      toastMessage,
      toastColor,
      isToastOpen
    );
  } catch {
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "danger",
      "Error al cargar usuarios de categoría"
    );
  }
}

async function crearNuevoUsuarioCategoriaFunc() {
  try {
    if (!nuevoUsuarioCategoria.value.nombreCategoria) {
      crearToast(
        toastMessage,
        toastColor,
        isToastOpen,
        "danger",
        "Selecciona una categoría"
      );
      return;
    }
    if (!nuevoUsuarioCategoria.value.nombreResponsable.trim()) {
      crearToast(
        toastMessage,
        toastColor,
        isToastOpen,
        "danger",
        "El nombre del responsable es obligatorio"
      );
      return;
    }
    if (!nuevoUsuarioCategoria.value.emailResponsable.trim()) {
      crearToast(
        toastMessage,
        toastColor,
        isToastOpen,
        "danger",
        "El correo del responsable es obligatorio"
      );
      return;
    }

    const existe = usuariosCategoria.value.some(
      (u) =>
        u.nombreCategoria === nuevoUsuarioCategoria.value.nombreCategoria &&
        u.nombreResponsable.trim().toLowerCase() ===
          nuevoUsuarioCategoria.value.nombreResponsable.trim().toLowerCase() &&
        u.emailResponsable.trim().toLowerCase() ===
          nuevoUsuarioCategoria.value.emailResponsable.trim().toLowerCase()
    );

    if (existe) {
      crearToast(
        toastMessage,
        toastColor,
        isToastOpen,
        "danger",
        "Ya existe un responsable con esa categoría, nombre y correo"
      );
      return;
    }

    await crearUsuarioCategoria(
      toastMessage,
      toastColor,
      isToastOpen,
      nuevoUsuarioCategoria.value.nombreCategoria,
      nuevoUsuarioCategoria.value.nombreResponsable,
      nuevoUsuarioCategoria.value.emailResponsable,
    );

    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "success",
      "Usuario de categoría creado"
    );
    await cargarUsuariosCategoria();

    nuevoUsuarioCategoria.value = {
      nombreCategoria: "",
      nombreResponsable: "",
      emailResponsable: "",
    };
  } catch {
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "danger",
      "Error al crear usuario de categoría"
    );
  }
}

async function borrarUsuarioCategoriaFunc(usuario: UsuarioCategoria) {
  try {
    await borrarUsuarioCategoria(toastMessage, toastColor, isToastOpen, usuario.nombreCategoria, usuario.nombreResponsable, usuario.emailResponsable);
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "success",
      "Usuario de categoría eliminado"
    );
    await cargarUsuariosCategoria();
  } catch {
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "danger",
      "Error al borrar usuario de categoría"
    );
  }
}

onMounted(async () => {
  await cargarUbicaciones();
  await cargarCategorias();
  await cargarUsuariosCategoria();
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
  align-items: stretch;
}
.card-upload-csv {
  flex: 1 1 0;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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
  width: 100%;
}
.tabla-container {
  width: 100%;
}
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.th {
  border: 1px solid currentColor;
  padding: 0.5rem 1rem;
  text-align: center;
  word-wrap: break-word;
}
.eliminar {
  color: #ef4444;
  font-size: 1.6rem;
  background: transparent;
  border: none;
  cursor: pointer;
}


@media (min-width: 1024px) {
  .card-upload-csv {
    min-width: 520px;
  }
}

@media (max-width: 768px) {
  .top-container {
    max-width: 100%;
    padding: 0 10px;
  }

  .top-section {
    flex-direction: column;
    align-items: stretch;
  }

  .card-upload-csv {
    width: 100%;
  }
}

@media (prefers-color-scheme: dark) {
  .top-container {
    background-color: transparent;
  }

  .card-upload-csv {
    background-color: var(--form-bg-dark, #0b1220);
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.9);
    border: 1px solid #1f2937;
  }

  .t-1,
  .t-2,
  .t-3 {
    color: var(--text-color-dark, #e5e7eb);
  }

  table {
    color: var(--text-color-dark, #e5e7eb);
  }

  thead tr {
    background-color: #020617;
  }

  tbody tr:nth-child(even) {
    background-color: rgba(15, 23, 42, 0.7);
  }

  tbody tr:nth-child(odd) {
    background-color: rgba(15, 23, 42, 0.4);
  }

  tbody tr:hover {
    background-color: rgba(37, 99, 235, 0.15);
  }

  .th {
    border-color: #1f2937;
  }

  .input {
    background-color: #020617;
    color: var(--text-color-dark, #e5e7eb);
    border-color: #334155;
  }

  .input::placeholder {
    color: #6b7280;
  }

  .input:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 1px #60a5fa;
  }

  .btn {
    background-color: #2563eb;
    color: #e5e7eb;
  }

  .btn:hover {
    background-color: #1d4ed8;
  }

  .eliminar {
    color: #f97373;
  }

  .eliminar:hover {
    color: #fecaca;
  }
}
</style>
