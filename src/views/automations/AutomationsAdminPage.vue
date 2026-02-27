<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="page-grid">
    <!-- ================== COLUMNA IZQUIERDA ================== -->
    <div class="left-col">
      <!-- ====== CUADRO 1: DISPOSITIVOS ====== -->
      <div class="form-container">
        <div class="title-container">
          <h1 class="title">Dispositivos</h1>
        </div>

        <!-- ===== DATOS BÁSICOS ===== -->
        <div class="section">
          <div class="row">
            <label>MAC:</label>
            <input type="text" v-model="dispositivo" />
          </div>

          <div class="row">
            <label>Ubicación:</label>
            <select v-model="ubicacionElegida">
              <option disabled value="">Selecciona ubicación</option>
              <option
                v-for="ubicacion in ubicaciones"
                :key="ubicacion.nombreUbicacion"
                :value="ubicacion.nombreUbicacion"
              >
                {{ ubicacion.nombreUbicacion }}
              </option>
            </select>
          </div>

          <div class="row">
            <label>Tipo:</label>
            <select v-model="tipoElegido">
              <option disabled value="">Selecciona tipo</option>
              <option
                v-for="t in tipos"
                :key="t.id ?? t.nombreAplicabilidad ?? t"
                :value="t.nombreAplicabilidad ?? t"
              >
                {{ t.nombreAplicabilidad ?? t }}
              </option>
            </select>
          </div>
        </div>

        <!-- ===== TIPO DISPOSITIVO ===== -->
        <div class="section center">
          <div class="switch-container-gestion">
            <span>Actuador</span>
            <label class="switch">
              <input type="checkbox" v-model="esSensorForm" />
              <span class="slider"></span>
            </label>
            <span>Sensor</span>
          </div>
        </div>

        <!-- ===== TIPO SENSOR ===== -->
        <div class="section center" v-if="esSensorForm">
          <div class="switch-container-gestion">
            <span>Booleano</span>
            <label class="switch">
              <input type="checkbox" v-model="esNumericoForm" />
              <span class="slider"></span>
            </label>
            <span>Numérico</span>
          </div>
        </div>

        <!-- ===== UMBRALES ===== -->
        <div class="section" v-if="esSensorForm">
          <div class="row">
            <label>Umbral Mínimo:</label>
            <input type="number" v-model="umbralMin" />
          </div>

          <div class="row">
            <label>Umbral Máximo:</label>
            <input type="number" v-model="umbralMax" />
          </div>
        </div>

        <!-- ===== BOTONES ===== -->
        <div class="section">
          <button
            v-if="dispositivo && dispositivo.trim() !== '' && ubicacionElegida && tipoElegido && !esSensorForm"
            class="btn-primary"
            @click="crearActuadorVista"
          >
            Crear / Modificar
          </button>

          <button
            v-if="dispositivo && dispositivo.trim() !== '' && ubicacionElegida && tipoElegido && esSensorForm && !esNumericoForm && umbralMin < umbralMax"
            class="btn-primary"
            @click="crearSensorBooleanoVista"
          >
            Crear / Modificar
          </button>

          <button
            v-if="dispositivo && ubicacionElegida && tipoElegido && esSensorForm && esNumericoForm && umbralMin < umbralMax"
            class="btn-primary"
            @click="crearSensorNumericoVista"
          >
            Crear / Modificar
          </button>
        </div>
      </div>

      <!-- ====== CUADRO 2: CREAR COMANDO (AULA - TIPO) ====== -->
      <div class="form-container">
        <div class="title-container">
          <h1 class="title">Comandos y keywords</h1>
        </div>

        <div class="section">
          <div class="row">
            <label>Actuadores (Aula - Tipo):</label>
            <select v-model="dispositivoSeleccionado" @change="onSeleccionDispositivoComandos">
              <option disabled value="">Selecciona dispositivo</option>
              <option v-for="d in dispositivosParaComandos" :key="d.mac" :value="d.mac">
                {{ d.aula }} - {{ d.tipo }} ({{ d.mac }})
              </option>
            </select>
          </div>

          <div class="row">
            <label>Keyword:</label>
            <input type="text" v-model="keywordCmd" />
          </div>

          <div class="row">
            <label>Comando:</label>
            <input type="text" v-model="comandoTexto" />
          </div>

          <div class="row">
            <label>Texto OK:</label>
            <input type="text" v-model="textoOk" />
          </div>

          <button
            class="btn-primary"
            :disabled="!dispositivoSeleccionado || !keywordCmd || !textoOk"
            @click="crearComandoActuadorVista"
          >
            Crear / Modificar
          </button>
        </div>
      </div>
    </div>

    <!-- ================== COLUMNA DERECHA ================== -->
    <div class="right-col">
      <!-- ====== CUADRO 3: LISTA DISPOSITIVOS ====== -->
      <div class="form-container-table">
        <div class="title-container">
          <h1 class="title">Lista de dispositivos</h1>
        </div>

        <div class="section center">
          <div class="switch-container-gestion">
            <span>Actuador</span>
            <label class="switch">
              <input type="checkbox" v-model="esSensorLista" />
              <span class="slider"></span>
            </label>
            <span>Sensor</span>
          </div>
        </div>

        <div class="section center" v-if="esSensorLista">
          <div class="switch-container-gestion">
            <span>Booleano</span>
            <label class="switch">
              <input type="checkbox" v-model="esNumericoLista" />
              <span class="slider"></span>
            </label>
            <span>Numérico</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>MAC</th>
              <th>Estado</th>
              <th>Ubicación</th>
              <th>Tipo</th>

              <th v-if="esSensorLista">Valor actual</th>
              <th v-if="esSensorLista">Umbral máximo</th>
              <th v-if="esSensorLista">Umbral mínimo</th>
              <th v-if="esSensorLista">Última actualización</th>

              <th>Acciones</th>
            </tr>
          </thead>

          <!-- ACTUADOR -->
          <tbody v-if="!esSensorLista">
            <tr v-for="d in actuadores" :key="d.mac">
              <td>{{ d.mac }}</td>
              <td>{{ d.estado }}</td>
              <td>{{ d.nombreUbicacion }}</td>
              <td>{{ d.tipo }}</td>
              <td><button @click="eliminarActuadorVista(d.mac)">X</button></td>
            </tr>
          </tbody>

          <!-- SENSOR BOOLEANO -->
          <tbody v-if="esSensorLista && !esNumericoLista">
            <tr v-for="s in sensoresBooleanos" :key="s.mac">
              <td>{{ s.mac }}</td>
              <td>{{ s.estado }}</td>
              <td>{{ s.nombreUbicacion }}</td>
              <td>{{ s.tipo }}</td>

              <td>
                <span v-if="s.valorActual !== null">{{ s.valorActual }}</span>
                <span v-else>-</span>
              </td>
              <td>{{ s.umbralMaximo }}</td>
              <td>{{ s.umbralMinimo }}</td>
              <td>
                <span v-if="s.ultimaActualizacion !== null">{{ s.ultimaActualizacion }}</span>
                <span v-else>-</span>
              </td>

              <td><button @click="eliminarSensorBooleanoVista(s.mac)">X</button></td>
            </tr>
          </tbody>

          <!-- SENSOR NUMÉRICO -->
          <tbody v-if="esSensorLista && esNumericoLista">
            <tr v-for="s in sensoresNumericos" :key="s.mac">
              <td>{{ s.mac }}</td>
              <td>{{ s.estado }}</td>
              <td>{{ s.nombreUbicacion }}</td>
              <td>{{ s.tipo }}</td>

              <td>
                <span v-if="s.valorActual !== null">{{ s.valorActual }}</span>
                <span v-else>-</span>
              </td>
              <td>{{ s.umbralMaximo }}</td>
              <td>{{ s.umbralMinimo }}</td>
              <td>
                <span v-if="s.ultimaActualizacion !== null">{{ s.ultimaActualizacion }}</span>
                <span v-else>-</span>
              </td>

              <td><button @click="eliminarSensorNumericoVista(s.mac)">X</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ====== CUADRO 4: LISTA COMANDOS ====== -->
      <div class="form-container-table">
        <div class="title-container">
          <h1 class="title">Lista de comandos</h1>
        </div>

        <table>
          <thead>
            <tr>
              <th>MAC</th>
              <th>Keyword</th>
              <th>Comando</th>
              <th>Texto OK</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="c in listaComandosActuador" :key="c.mac + '_' + c.keyword">
              <td>{{ c.mac }}</td>
              <td>{{ c.keyword }}</td>
              <td>{{ c.comandos }}</td>
              <td>{{ c.textoOk }}</td>
              <td>
                <button @click="eliminarComandoActuadorVista(c.mac, c.keyword)">X</button>
              </td>
            </tr>

            <tr v-if="(listaComandosActuador?.length ?? 0) === 0">
              <td colspan="5">No hay comandos</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { crearToast } from "@/utils/toast.js";

// ===== AutomationsServer (dispositivos + comandos) =====
import {
  obtenerTipos,
  crearActuador,
  crearSensorBooleano,
  crearSensorNumerico,
  obtenerActuadores,
  obtenerSensorNumerico,
  obtenerSensorBooleano,
  eliminarActuador,
  eliminarSensorBooleano,
  eliminarSensorNumerico,

  crearComandoActuador,
  obtenerComandosActuador,
  eliminarComandoActuador,
} from "@/services/automations";

// ===== SchoolBaseServer (ubicaciones) =====
import {
  obtenerCursosAcademicos,
  obtenerEspaciosFijo,
  obtenerEspaciosDesdoble,
  obtenerEspaciosSinDocencia,
} from "@/services/schoolBaseServer";

const dispositivo = ref("");
const ubicacionElegida = ref("");
const estado = ref("indefinido");
const umbralMin = ref(0);
const umbralMax = ref(0);

// Listas
const actuadores = ref([]);
const sensoresNumericos = ref([]);
const sensoresBooleanos = ref([]);

// Ubicaciones (vienen de SchoolBaseServer)
const ubicaciones = ref([]);
const cursoAcademicoElegido = ref("");

// Tipo
const tipoElegido = ref("");
const tipos = ref([]);

// switches
const esSensorForm = ref(false);
const esNumericoForm = ref(false);
const esSensorLista = ref(false);
const esNumericoLista = ref(false);

// Toast
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

const dispositivoSeleccionado = ref("");
const keywordCmd = ref("");
const comandoTexto = ref("");
const textoOk = ref("");
const listaComandosActuador = ref([]);

const comandosActuadorSeleccionado = computed(() => {
  const mac = (dispositivoSeleccionado.value || "").trim();
  if (!mac) return [];
  return (listaComandosActuador.value ?? []).filter((c) => c.mac === mac);
});

// Para el desplegable "Aula - Tipo (MAC)"
const dispositivosParaComandos = computed(() => {
  const lista = [];

  for (const a of (actuadores.value ?? [])) {
    lista.push({ mac: a.mac, aula: a.nombreUbicacion, tipo: a.tipo ?? "Actuador" });
  }

  for (const s of (sensoresBooleanos.value ?? [])) {
    lista.push({ mac: s.mac, aula: s.nombreUbicacion, tipo: s.tipo ?? "Sensor booleano" });
  }

  for (const s of (sensoresNumericos.value ?? [])) {
    lista.push({ mac: s.mac, aula: s.nombreUbicacion, tipo: s.tipo ?? "Sensor numérico" });
  }

  const uniq = new Map();
  for (const d of lista) uniq.set(d.mac, d);
  return Array.from(uniq.values());
});


const obtenerTiposVista = async () => {
  try {
    tipos.value = await obtenerTipos(toastMessage, toastColor, isToastOpen);
  } catch (error) {
    tipos.value = [];
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

// Ubicaciones desde SchoolBaseServer
const obtenerUbicacionesVista = async () => {
  try {
    const cursos = await obtenerCursosAcademicos(toastMessage, toastColor, isToastOpen);

    const curso =
      cursoAcademicoElegido.value ||
      (cursos?.[0]?.cursoAcademico ?? cursos?.[0] ?? "");

    cursoAcademicoElegido.value = curso;

    if (!curso) {
      ubicaciones.value = [];
      return;
    }

    const [fijos, desdobles, sinDocencia] = await Promise.all([
      obtenerEspaciosFijo(toastMessage, toastColor, isToastOpen, curso),
      obtenerEspaciosDesdoble(toastMessage, toastColor, isToastOpen, curso),
      obtenerEspaciosSinDocencia(toastMessage, toastColor, isToastOpen, curso),
    ]);

    const normalizar = (arr) =>
      (arr ?? [])
        .map((e) => ({
          nombreUbicacion:
            e?.nombreEspacio ??
            e?.nombreUbicacion ??
            e?.aula ??
            e?.nombre ??
            e?.descripcion ??
            e?.id ??
            "",
        }))
        .filter((x) => String(x.nombreUbicacion).trim() !== "");

    const mezcla = [...normalizar(fijos), ...normalizar(desdobles), ...normalizar(sinDocencia)];

    const uniq = new Map();
    for (const u of mezcla) uniq.set(u.nombreUbicacion, u);

    ubicaciones.value = Array.from(uniq.values()).sort((a, b) =>
      a.nombreUbicacion.localeCompare(b.nombreUbicacion, "es")
    );
  } catch (error) {
    ubicaciones.value = [];
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

// ===== Dispositivos =====
const obtenerActuadoresVista = async () => {
  try {
    actuadores.value = await obtenerActuadores(isToastOpen, toastMessage, toastColor);
  } catch {
    actuadores.value = [];
  }
};

const obtenerSensorBooleanoVista = async () => {
  try {
    sensoresBooleanos.value = await obtenerSensorBooleano(isToastOpen, toastMessage, toastColor);
  } catch {
    sensoresBooleanos.value = [];
  }
};

const obtenerSensorNumericoVista = async () => {
  try {
    sensoresNumericos.value = await obtenerSensorNumerico(isToastOpen, toastMessage, toastColor);
  } catch {
    sensoresNumericos.value = [];
  }
};

const crearActuadorVista = async () => {
  try {
    await crearActuador(
      toastMessage,
      toastColor,
      isToastOpen,
      dispositivo,
      estado,
      ubicacionElegida,
      tipoElegido
    );

    crearToast(toastMessage, toastColor, isToastOpen, "Actuador creado correctamente");
    await obtenerActuadoresVista();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

const crearSensorBooleanoVista = async () => {
  try {
    await crearSensorBooleano(
      toastMessage,
      toastColor,
      isToastOpen,
      dispositivo,
      estado,
      ubicacionElegida,
      tipoElegido,
      umbralMin,
      umbralMax
    );

    crearToast(toastMessage, toastColor, isToastOpen, "Sensor booleano creado correctamente");
    await obtenerSensorBooleanoVista();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

const crearSensorNumericoVista = async () => {
  try {
    await crearSensorNumerico(
      toastMessage,
      toastColor,
      isToastOpen,
      dispositivo,
      estado,
      ubicacionElegida,
      tipoElegido,
      umbralMin,
      umbralMax
    );

    crearToast(toastMessage, toastColor, isToastOpen, "Sensor numérico creado correctamente");
    await obtenerSensorNumericoVista();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

const eliminarActuadorVista = async (mac) => {
  try {
    await eliminarActuador(toastMessage, toastColor, isToastOpen, mac);
    crearToast(toastMessage, toastColor, isToastOpen, "Actuador eliminado correctamente");
    await obtenerActuadoresVista();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

const eliminarSensorBooleanoVista = async (mac) => {
  try {
    await eliminarSensorBooleano(toastMessage, toastColor, isToastOpen, mac);
    crearToast(toastMessage, toastColor, isToastOpen, "Sensor booleano eliminado correctamente");
    await obtenerSensorBooleanoVista();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

const eliminarSensorNumericoVista = async (mac) => {
  try {
    await eliminarSensorNumerico(toastMessage, toastColor, isToastOpen, mac);
    crearToast(toastMessage, toastColor, isToastOpen, "Sensor numérico eliminado correctamente");
    await obtenerSensorNumericoVista();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

// ===== Comandos actuador =====

const cargarComandosActuador = async () => {
  try {
    listaComandosActuador.value = await obtenerComandosActuador(
      toastMessage,
      toastColor,
      isToastOpen
    );
  } catch {
    listaComandosActuador.value = [];
  }
};

const onSeleccionDispositivoComandos = async () => {

  dispositivo.value = dispositivoSeleccionado.value;

};

const crearComandoActuadorVista = async () => {
  try {
    await crearComandoActuador(
      toastMessage,
      toastColor,
      isToastOpen,
      dispositivoSeleccionado.value,
      keywordCmd,
      comandoTexto,
      textoOk
    );

    crearToast(toastMessage, toastColor, isToastOpen, "Comando creado correctamente");

    keywordCmd.value = "";
    comandoTexto.value = "";
    textoOk.value = "";

    await cargarComandosActuador(); // ✅ recarga todos
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

const eliminarComandoActuadorVista = async (mac, keyword) => {
  try {
    await eliminarComandoActuador(toastMessage, toastColor, isToastOpen, mac, keyword);
    crearToast(toastMessage, toastColor, isToastOpen, "Comando eliminado correctamente");
    await cargarComandosActuador(); // ✅ recarga todos
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

onMounted(async () => {
  await obtenerTiposVista();
  await obtenerUbicacionesVista();

  await obtenerActuadoresVista();
  await obtenerSensorNumericoVista();
  await obtenerSensorBooleanoVista();

  await cargarComandosActuador();
});
</script>

<style scoped>

:global(:root) {
  color-scheme: light dark;

  /* Claro */
  --bg-page: #f4f6f9;
  --card-bg: #ffffff;
  --text: #1a1a1a;
  --muted: #5a5a5a;
  --border: #dcdcdc;

  --input-bg: #ffffff;
  --input-border: #cfcfcf;

  --table-bg: #ffffff;
  --table-head-bg: #007bff;
  --table-row: #ffffff;
  --table-row-alt: #f1f6ff;
  --table-hover: #e2efff;

  --primary: #2196f3;
  --primary-hover: #1976d2;
  --danger: #dc3545;
}

@media (prefers-color-scheme: dark) {
  :global(:root) {
    --bg-page: #0f1115;
    --card-bg: #161a22;
    --text: #e8e9ee;
    --muted: #b8bcc8;
    --border: #2a2f3a;

    --input-bg: #0f1320;
    --input-border: #2e3442;

    --table-bg: #121624;
    --table-head-bg: #2c2f36;
    --table-row: #161a22;
    --table-row-alt: #121724;
    --table-hover: #1b2130;

    --primary: #3ea6ff;
    --primary-hover: #1e88e5;
    --danger: #ff4d4f;
  }
}


:global(html),
:global(body) {
  background: var(--bg-page);
}


.page-grid {
  background: var(--bg-page);
  min-height: 100vh;

  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 20px;
  align-items: start;
  justify-content: center;
  padding: 20px;
}

.left-col,
.right-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-container,
.form-container-table {
  background-color: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-sizing: border-box;
  padding: 20px 25px;
  font-family: "Roboto", sans-serif;
  color: var(--text);

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-container-table {
  width: 100%;
  min-width: 900px;
}


.title-container {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 0 15px 0;
}

.title {
  margin: 0;
  font-size: 24px;
  text-align: center;
  width: 100%;
  color: var(--text);
}


.section {
  margin-bottom: 18px;
}

.section.center {
  display: flex;
  justify-content: center;
}

.row {
  margin-bottom: 12px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}

label {
  font-weight: 600;
  color: var(--text);
}


input,
select {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--input-border);
  background-color: var(--input-bg);
  color: var(--text);
}

input::placeholder {
  color: var(--muted);
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(62, 166, 255, 0.22);
}

.btn-primary {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: bold;
  background-color: var(--primary);
  border: none;
  border-radius: 8px;
  margin-top: 10px;
  text-transform: uppercase;
  color: white;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


button {
  padding: 6px 10px;
  border: none;
  background-color: var(--danger);
  color: white;
  border-radius: 6px;
  cursor: pointer;
}


.switch-container-gestion {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  color: var(--text);
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #bdbdbd;
  transition: 0.25s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: #ffffff;
  transition: 0.25s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary);
}

input:checked + .slider:before {
  transform: translateX(26px);
}


table {
  border-collapse: collapse;
  width: 100%;
  text-align: center;
  background-color: var(--table-bg);
  color: var(--text);
  margin-top: 10px;
  border-radius: 10px;
  overflow: hidden;
}

th,
td {
  border: 1px solid var(--border);
  padding: 10px;
}

th {
  background-color: var(--table-head-bg);
  color: #ffffff;
  font-weight: bold;
}

td {
  background-color: var(--table-row);
  text-overflow: ellipsis;
  overflow: hidden;
  word-wrap: break-word;
}

tr:nth-child(even) td {
  background-color: var(--table-row-alt);
}

tr:hover td {
  background-color: var(--table-hover);
}


@media (max-width: 1200px) {
  .page-grid {
    grid-template-columns: 1fr;
  }
  .form-container-table {
    min-width: 0;
  }
}

@media (prefers-color-scheme: dark) {
  :global(::-webkit-scrollbar) {
    width: 8px;
  }
  :global(::-webkit-scrollbar-track) {
    background: #0b0d12;
  }
  :global(::-webkit-scrollbar-thumb) {
    background: #2a2f3a;
    border-radius: 4px;
  }
}
</style>