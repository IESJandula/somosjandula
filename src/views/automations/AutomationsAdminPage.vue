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

          <!-- ✅ NUEVO: Texto OK debajo de comando -->
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

// ======================= STATE =======================
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

// Tipo (antes aplicabilidad)
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

// ======================= COMANDOS =======================
const dispositivoSeleccionado = ref("");
const keywordCmd = ref("");
const comandoTexto = ref("");
const textoOk = ref("");
const listaComandosActuador = ref([]);

// ✅ lista filtrada para la zona izquierda (solo del dispositivo seleccionado)
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

// ======================= FUNCIONES =======================

const obtenerTiposVista = async () => {
  try {
    tipos.value = await obtenerTipos(toastMessage, toastColor, isToastOpen);
  } catch (error) {
    tipos.value = [];
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

// ✅ Ubicaciones desde SchoolBaseServer
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

// ✅ AHORA: carga todos (GET /comando/actuador)
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
  // Mantengo tu línea para no romper nada que dependa de 'dispositivo'
  dispositivo.value = dispositivoSeleccionado.value;
  // ya no hace falta pedir por MAC: ya está todo cargado y se filtra en computed
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

  await cargarComandosActuador(); // ✅ carga todos al iniciar
});
</script>

<style scoped>
.page-grid {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 20px;
  align-items: start;
  justify-content: center;
  padding: 10px;
}

.left-col,
.right-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-container {
  width: 100%;
  max-width: 400px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
  border: 1px solid #444;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 20px 30px;
  font-family: "Roboto", sans-serif;
}

.form-container-table {
  width: 100%;
  min-width: 900px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
  border: 1px solid #444;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 20px 30px;
  font-family: "Roboto", sans-serif;
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
}

input,
select {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #999;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: bold;
  background-color: #2196f3;
  border: none;
  border-radius: 6px;
  margin-top: 10px;
  text-transform: uppercase;
  color: white;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background: #025ec0;
  color: white;
  cursor: pointer;
}

/* Switch */
.switch-container-gestion {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196f3;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Table */
table {
  border-collapse: collapse;
  width: 100%;
  text-align: center;
  background-color: #f8f9fa;
  color: #1a1a1a;
  border: 2px solid #007bff;
  margin-top: 10px;
  border-radius: 5px;
  overflow: hidden;
}

th,
td {
  border: 2px solid #007bff;
  padding: 10px;
}

th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}

td {
  background-color: #e9f5ff;
  text-overflow: ellipsis;
  overflow: hidden;
  word-wrap: break-word;
}

button {
  padding: 5px 10px;
  border: none;
  background-color: #dc3545;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

tr:hover td {
  background-color: #d0eaff;
}

@media (max-width: 1200px) {
  .page-grid {
    grid-template-columns: 1fr;
  }
  .form-container-table {
    min-width: 0;
  }
}
</style>