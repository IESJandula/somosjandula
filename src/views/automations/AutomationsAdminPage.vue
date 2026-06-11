<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="page-grid">
    <div class="left-col">
      <div class="form-container">
        <div class="title-container">
          <h1 class="title">Dispositivos</h1>
        </div>

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
        </div>

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

        <div class="row">
          <label>Tipo:</label>
          <select v-model="tipoElegido">
            <option disabled value="">Selecciona tipo</option>
            <option v-for="t in tipos" :key="t.id ?? t.tipo" :value="t.tipo">
              {{ t.tipo }}
            </option>
          </select>
        </div>

        <div class="section center" v-if="esSensorForm && tipoElegido">
          <div class="switch-container-gestion">
            <span>Booleano</span>
            <label class="switch">
              <input type="checkbox" v-model="esNumericoForm" />
              <span class="slider"></span>
            </label>
            <span>Numérico</span>
          </div>
        </div>

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

        <div class="section" v-if="!esSensorForm && esTipoPuerta">
          <div class="row">
            <label>Número de relés:</label>
            <input type="number" min="1" v-model="numeroReles" />
          </div>
        </div>
        <div class="section" v-if="!esSensorForm && esTipoProyector">
          <div class="row">
            <label>Comando estado:</label>
            <input type="text" v-model="comandoEstadoProyector" />
          </div>
        </div>

        <div class="section">
          <button
            v-if="dispositivo && dispositivo.trim() !== '' && ubicacionElegida && tipoElegido && !esSensorForm && !esTipoPuerta && !esTipoProyector"
            class="btn-primary"
            @click="crearActuadorVista"
          >
            Crear / Modificar
          </button>

          <button
            v-if="dispositivo && dispositivo.trim() !== '' && ubicacionElegida && tipoElegido && !esSensorForm && esTipoPuerta && Number(numeroReles) >= 1"
            class="btn-primary"
            @click="crearActuadorVista"
          >
            Crear / Modificar
          </button>

          <button
            v-if="dispositivo && dispositivo.trim() !== '' && ubicacionElegida && tipoElegido && !esSensorForm && esTipoProyector && comandoEstadoProyector && comandoEstadoProyector.trim() !== ''"
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
            v-if="dispositivo && dispositivo.trim() !== '' && ubicacionElegida && tipoElegido && esSensorForm && esNumericoForm && umbralMin < umbralMax"
            class="btn-primary"
            @click="crearSensorNumericoVista"
          >
            Crear / Modificar
          </button>
        </div>
      </div>

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

          <div class="row" v-if="esPuertaSeleccionada">
            <label>Elige número de relé:</label>
            <select v-model="indiceReleSeleccionado">
              <option disabled value="">Selecciona relé</option>
              <option v-for="r in relesDisponibles" :key="r" :value="r">
                {{ r }}
              </option>
            </select>
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
            :disabled="!puedeCrearComando"
            @click="crearComandoActuadorVista"
          >
            Crear / Modificar
          </button>
        </div>
      </div>
    </div>

    <div class="right-col">
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
              <th>Tipo</th>
              <th>Ubicación</th>
              <th v-if="esSensorLista">Última actualización</th>
              <th>Estado</th>

              <th v-if="!esSensorLista" class="col-reles">Número de relés</th>
              <th v-if="!esSensorLista">Comando estado</th>
              <th v-if="!esSensorLista">Estado proyector</th>

              <th v-if="esSensorLista">Valor actual</th>
              <th v-if="esSensorLista">Umbral mínimo</th>
              <th v-if="esSensorLista">Umbral máximo</th>

              <th>Acciones</th>
            </tr>
          </thead>

          <tbody v-if="!esSensorLista">
            <tr v-for="d in actuadoresPaginados" :key="d.mac">
              <td>{{ d.mac }}</td>
              <td>{{ d.tipo }}</td>
              <td>{{ d.nombreUbicacion }}</td>
              <td>{{ d.estado }}</td>
              <td class="col-reles">
                {{ d.tipo?.toLowerCase() === 'puerta' ? (d.numeroReles ?? '-') : '' }}
              </td>
              <td>
                {{ d.tipo?.toLowerCase() === 'proyector' ? (d.comandoEstado ?? '-') : '' }}
              </td>
              <td>
                {{ d.tipo?.toLowerCase() === 'proyector' ? (d.estadoProyector ?? '-') : '' }}
              </td>
              <td><button @click="eliminarActuadorVista(d)">X</button></td>
            </tr>
            <tr v-if="(actuadoresPaginados?.length ?? 0) === 0">
              <td colspan="8">No hay actuadores</td>
            </tr>
          </tbody>

          <tbody v-if="esSensorLista && !esNumericoLista">
            <tr v-for="s in sensoresBooleanosPaginados" :key="s.mac">
              <td>{{ s.mac }}</td>
              <td>{{ s.tipo }}</td>
              <td>{{ s.nombreUbicacion }}</td>
              <td>
                <span v-if="s.ultimaActualizacion !== null">{{ s.ultimaActualizacion }}</span>
                <span v-else>-</span>
              </td>
              <td>{{ s.estado }}</td>
              <td>
                <span v-if="s.valorActual !== null">{{ s.valorActual }}</span>
                <span v-else>-</span>
              </td>
              <td>{{ s.umbralMinimo }}</td>
              <td>{{ s.umbralMaximo }}</td>
              <td><button @click="eliminarSensorBooleanoVista(s.mac)">X</button></td>
            </tr>
            <tr v-if="(sensoresBooleanosPaginados?.length ?? 0) === 0">
              <td colspan="9">No hay sensores booleanos</td>
            </tr>
          </tbody>

          <tbody v-if="esSensorLista && esNumericoLista">
            <tr v-for="s in sensoresNumericosPaginados" :key="s.mac">
              <td>{{ s.mac }}</td>
              <td>{{ s.tipo }}</td>
              <td>{{ s.nombreUbicacion }}</td>
              <td>
                <span v-if="s.ultimaActualizacion !== null">{{ s.ultimaActualizacion }}</span>
                <span v-else>-</span>
              </td>
              <td>{{ s.estado }}</td>
              <td>
                <span v-if="s.valorActual !== null">{{ s.valorActual }}</span>
                <span v-else>-</span>
              </td>
              <td>{{ s.umbralMinimo }}</td>
              <td>{{ s.umbralMaximo }}</td>
              <td><button @click="eliminarSensorNumericoVista(s.mac)">X</button></td>
            </tr>
            <tr v-if="(sensoresNumericosPaginados?.length ?? 0) === 0">
              <td colspan="9">No hay sensores numéricos</td>
            </tr>
          </tbody>
        </table>

        <div class="pagination-container">
          <button
            class="btn-pagination"
            :disabled="paginaActualDispositivos === 1"
            @click="paginaAnteriorDispositivos"
          >
            Anterior
          </button>

          <span class="pagination-info">
            Página {{ paginaActualDispositivos }} de {{ totalPaginasDispositivos }}
          </span>

          <button
            class="btn-pagination"
            :disabled="paginaActualDispositivos === totalPaginasDispositivos"
            @click="paginaSiguienteDispositivos"
          >
            Siguiente
          </button>
        </div>
      </div>

      <div class="form-container-table">
        <div class="title-container">
          <h1 class="title">Lista de comandos</h1>
        </div>

        <table>
          <thead>
            <tr>
              <th>MAC</th>
              <th>Keyword</th>
              <th>Relé</th>
              <th>Comando</th>
              <th>Texto OK</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="c in comandosActuadorPaginados" :key="c.mac + '_' + c.keyword + '_' + (c.indiceRele ?? 'sin_rele')">
              <td>{{ c.mac }}</td>
              <td>{{ c.keyword }}</td>
              <td>{{ c.indiceRele ?? '' }}</td>
              <td>{{ c.comandos }}</td>
              <td>{{ c.textoOk }}</td>
              <td>
                <button @click="eliminarComandoActuadorVista(c)">X</button>
              </td>
            </tr>

            <tr v-if="(comandosActuadorPaginados?.length ?? 0) === 0">
              <td colspan="6">No hay comandos</td>
            </tr>
          </tbody>
        </table>

        <div class="pagination-container">
          <button
            class="btn-pagination"
            :disabled="paginaActualComandos === 1"
            @click="paginaAnteriorComandos"
          >
            Anterior
          </button>

          <span class="pagination-info">
            Página {{ paginaActualComandos }} de {{ totalPaginasComandos }}
          </span>

          <button
            class="btn-pagination"
            :disabled="paginaActualComandos === totalPaginasComandos"
            @click="paginaSiguienteComandos"
          >
            Siguiente
          </button>
        </div>
      </div>

      <div class="form-container-table">
        <div class="title-container">
          <h1 class="title">Histórico de acciones</h1>
        </div>

        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Dispositivo</th>
              <th>Fecha</th>
              <th>Resultado</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="a in accionesPaginadas" :key="a.idAccion">
              <td>{{ a.usuario }}</td>
              <td>{{ a.dispositivo }}</td>
              <td>{{ a.fecha }}</td>
              <td>{{ a.resultado }}</td>
            </tr>

            <tr v-if="(accionesPaginadas?.length ?? 0) === 0">
              <td colspan="4">No hay acciones registradas</td>
            </tr>
          </tbody>
        </table>

        <div class="pagination-container">
          <button
            class="btn-pagination"
            :disabled="paginaActualAcciones === 1"
            @click="paginaAnteriorAcciones"
          >
            Anterior
          </button>

          <span class="pagination-info">
            Página {{ paginaActualAcciones }} de {{ totalPaginasAcciones }}
          </span>

          <button
            class="btn-pagination"
            :disabled="paginaActualAcciones === totalPaginasAcciones"
            @click="paginaSiguienteAcciones"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { crearToast } from "@/utils/toast.js";

import {
  obtenerTiposActuador,
  obtenerTiposSensores,
  crearActuador,
  crearActuadorPuerta,
  crearActuadorProyector,
  crearSensorBooleano,
  crearSensorNumerico,
  obtenerActuadores,
  obtenerActuadoresPaginacion,
  obtenerSensorNumericoPaginacion,
  obtenerSensorBooleanoPaginacion,
  eliminarActuador,
  eliminarActuadorPuerta,
  eliminarActuadorProyector,
  eliminarSensorBooleano,
  eliminarSensorNumerico,
  crearComandoActuador,
  crearComandoActuadorPuerta,
  obtenerComandosActuador,
  obtenerComandosActuadorPuerta,
  eliminarComandoActuador,
  eliminarComandoActuadorPuerta,
  obtenerAcciones,
  obtenerOrdenesSimples,
} from "@/services/automations";

import {
  obtenerCursosAcademicos,
  obtenerEspaciosFijo,
  obtenerEspaciosDesdoble,
  obtenerEspaciosSinDocencia,
} from "@/services/schoolManager";

const dispositivo = ref("");
const ubicacionElegida = ref("");
const estado = ref("indefinido");
const umbralMin = ref(0);
const umbralMax = ref(0);
const numeroReles = ref(1);
const comandoEstadoProyector = ref("");

const actuadores = ref([]);
const sensoresNumericos = ref([]);
const sensoresBooleanos = ref([]);
const actuadoresParaComandos = ref([]);

const ubicaciones = ref([]);
const cursoAcademicoElegido = ref("");

const tipoElegido = ref("");
const tipos = ref([]);

const esSensorForm = ref(false);
const esNumericoForm = ref(false);
const esSensorLista = ref(false);
const esNumericoLista = ref(false);

const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

const dispositivoSeleccionado = ref("");
const keywordCmd = ref("");
const comandoTexto = ref("");
const textoOk = ref("");
const indiceReleSeleccionado = ref("");
const listaComandosActuador = ref([]);

const paginaActualDispositivos = ref(1);
const dispositivosPorPagina = ref(5);
const totalPaginasDispositivos = ref(1);

const paginaActualComandos = ref(1);
const comandosPorPagina = ref(5);
const totalPaginasComandos = ref(1);

const listaAcciones = ref([]);
const paginaActualAcciones = ref(1);
const accionesPorPagina = ref(5);
const totalPaginasAcciones = ref(1);

const actuadoresPaginados = computed(() => actuadores.value ?? []);
const sensoresBooleanosPaginados = computed(() => sensoresBooleanos.value ?? []);
const sensoresNumericosPaginados = computed(() => sensoresNumericos.value ?? []);
const comandosActuadorPaginados = computed(() => listaComandosActuador.value ?? []);
const accionesPaginadas = computed(() => listaAcciones.value ?? []);

const esTipoPuerta = computed(() => String(tipoElegido.value ?? "").toLowerCase() === "puerta");
const esTipoProyector = computed(() => String(tipoElegido.value ?? "").toLowerCase() === "proyector");

const dispositivosParaComandos = computed(() => {
  return (actuadoresParaComandos.value ?? []).map((a) => ({
    mac: a.mac,
    aula: a.nombreUbicacion,
    tipo: a.tipo ?? "Actuador",
    numeroReles: a.numeroReles ?? null,
  }));
});

const dispositivoComandoSeleccionadoObj = computed(() => {
  return (dispositivosParaComandos.value ?? []).find((d) => d.mac === dispositivoSeleccionado.value) ?? null;
});

const esPuertaSeleccionada = computed(() => {
  return String(dispositivoComandoSeleccionadoObj.value?.tipo ?? "").toLowerCase() === "puerta";
});

const relesDisponibles = computed(() => {
  const total = Number(dispositivoComandoSeleccionadoObj.value?.numeroReles ?? 0);

  if (!esPuertaSeleccionada.value || total <= 0) return [];

  const macSeleccionada = dispositivoSeleccionado.value;

  const relesUsados = new Set(
    (listaComandosActuador.value ?? [])
      .filter((c) => c.mac === macSeleccionada && c.indiceRele != null)
      .map((c) => Number(c.indiceRele))
  );

  return Array.from({ length: total }, (_, i) => i)
    .filter((rele) => !relesUsados.has(rele));
});

const puedeCrearComando = computed(() => {
  if (!dispositivoSeleccionado.value || !keywordCmd.value || !textoOk.value) return false;

  if (
    esPuertaSeleccionada.value &&
    (
      indiceReleSeleccionado.value === "" ||
      indiceReleSeleccionado.value === null ||
      indiceReleSeleccionado.value === undefined
    )
  ) {
    return false;
  }

  return true;
});

const paginaAnteriorDispositivos = async () => {
  if (paginaActualDispositivos.value > 1) {
    paginaActualDispositivos.value--;

    if (!esSensorLista.value) await obtenerActuadoresVista();
    else if (!esNumericoLista.value) await obtenerSensorBooleanoVista();
    else await obtenerSensorNumericoVista();
  }
};

const paginaSiguienteDispositivos = async () => {
  if (paginaActualDispositivos.value < totalPaginasDispositivos.value) {
    paginaActualDispositivos.value++;

    if (!esSensorLista.value) await obtenerActuadoresVista();
    else if (!esNumericoLista.value) await obtenerSensorBooleanoVista();
    else await obtenerSensorNumericoVista();
  }
};

const paginaAnteriorComandos = async () => {
  if (paginaActualComandos.value > 1) {
    paginaActualComandos.value--;
    await cargarComandosActuador();
  }
};

const paginaSiguienteComandos = async () => {
  if (paginaActualComandos.value < totalPaginasComandos.value) {
    paginaActualComandos.value++;
    await cargarComandosActuador();
  }
};

const paginaAnteriorAcciones = async () => {
  if (paginaActualAcciones.value > 1) {
    paginaActualAcciones.value--;
    await cargarAcciones();
  }
};

const paginaSiguienteAcciones = async () => {
  if (paginaActualAcciones.value < totalPaginasAcciones.value) {
    paginaActualAcciones.value++;
    await cargarAcciones();
  }
};

const obtenerTiposVista = async () => {
  try {
    const raw = esSensorForm.value
      ? await obtenerTiposSensores(toastMessage, toastColor, isToastOpen)
      : await obtenerTiposActuador(toastMessage, toastColor, isToastOpen);

    tipos.value = (raw ?? [])
      .map((t) => {
        if (typeof t === "string") return { id: t, tipo: t };
        const tipo = t?.tipo ?? t?.nombreTipo ?? "";
        return { ...t, tipo };
      })
      .filter((t) => String(t.tipo).trim() !== "");
  } catch (error) {
    tipos.value = [];
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

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

const cargarActuadoresParaComandos = async () => {
  try {
    actuadoresParaComandos.value = await obtenerActuadores(
      toastMessage,
      toastColor,
      isToastOpen
    );
  } catch {
    actuadoresParaComandos.value = [];
  }
};

const obtenerActuadoresVista = async () => {
  try {
    const response = await obtenerActuadoresPaginacion(
      toastMessage,
      toastColor,
      isToastOpen,
      paginaActualDispositivos.value - 1,
      dispositivosPorPagina.value
    );

    actuadores.value = response?.content ?? [];
    totalPaginasDispositivos.value = Math.max(1, response?.totalPages ?? 1);
  } catch {
    actuadores.value = [];
    totalPaginasDispositivos.value = 1;
  }
};

const obtenerSensorBooleanoVista = async () => {
  try {
    const response = await obtenerSensorBooleanoPaginacion(
      toastMessage,
      toastColor,
      isToastOpen,
      paginaActualDispositivos.value - 1,
      dispositivosPorPagina.value
    );

    sensoresBooleanos.value = response?.content ?? [];
    totalPaginasDispositivos.value = Math.max(1, response?.totalPages ?? 1);
  } catch {
    sensoresBooleanos.value = [];
    totalPaginasDispositivos.value = 1;
  }
};

const obtenerSensorNumericoVista = async () => {
  try {
    const response = await obtenerSensorNumericoPaginacion(
      toastMessage,
      toastColor,
      isToastOpen,
      paginaActualDispositivos.value - 1,
      dispositivosPorPagina.value
    );

    sensoresNumericos.value = response?.content ?? [];
    totalPaginasDispositivos.value = Math.max(1, response?.totalPages ?? 1);
  } catch {
    sensoresNumericos.value = [];
    totalPaginasDispositivos.value = 1;
  }
};

const limpiarFormularioDispositivo = () => {
  dispositivo.value = "";
  ubicacionElegida.value = "";
  tipoElegido.value = "";
  numeroReles.value = 1;
  comandoEstadoProyector.value = "";
  umbralMin.value = 0;
  umbralMax.value = 0;
};

const crearActuadorVista = async () => {
  try {
    if (esTipoPuerta.value) {
      await crearActuadorPuerta(
        toastMessage,
        toastColor,
        isToastOpen,
        dispositivo,
        estado,
        ubicacionElegida,
        tipoElegido,
        numeroReles
      );
    } else if (esTipoProyector.value) {
      await crearActuadorProyector(
        toastMessage,
        toastColor,
        isToastOpen,
        dispositivo,
        estado,
        ubicacionElegida,
        tipoElegido,
        comandoEstadoProyector
      );
    } else {
      await crearActuador(
        toastMessage,
        toastColor,
        isToastOpen,
        dispositivo,
        estado,
        ubicacionElegida,
        tipoElegido
      );
    }

    crearToast(toastMessage, toastColor, isToastOpen, "Actuador creado correctamente");
    await obtenerActuadoresVista();
    await cargarActuadoresParaComandos();
    limpiarFormularioDispositivo();
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
    await cargarActuadoresParaComandos();
    limpiarFormularioDispositivo();
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
    await cargarActuadoresParaComandos();
    limpiarFormularioDispositivo();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

const eliminarActuadorVista = async (actuador) => {
  try {
    const tipo = String(actuador?.tipo ?? "").toLowerCase();

    if (tipo === "puerta") {
      await eliminarActuadorPuerta(toastMessage, toastColor, isToastOpen, actuador.mac);
    } else if (tipo === "proyector") {
      await eliminarActuadorProyector(toastMessage, toastColor, isToastOpen, actuador.mac);
    } else {
      await eliminarActuador(toastMessage, toastColor, isToastOpen, actuador.mac);
    }

    crearToast(toastMessage, toastColor, isToastOpen, "Actuador eliminado correctamente");
    await obtenerActuadoresVista();
    await cargarActuadoresParaComandos();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

const eliminarSensorBooleanoVista = async (mac) => {
  try {
    await eliminarSensorBooleano(toastMessage, toastColor, isToastOpen, mac);
    crearToast(toastMessage, toastColor, isToastOpen, "Sensor booleano eliminado correctamente");
    await obtenerSensorBooleanoVista();
    await cargarActuadoresParaComandos();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

const eliminarSensorNumericoVista = async (mac) => {
  try {
    await eliminarSensorNumerico(toastMessage, toastColor, isToastOpen, mac);
    crearToast(toastMessage, toastColor, isToastOpen, "Sensor numérico eliminado correctamente");
    await obtenerSensorNumericoVista();
    await cargarActuadoresParaComandos();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

const cargarComandosActuador = async () => {
  try {
    const [response, relacionesPuerta] = await Promise.all([
      obtenerComandosActuador(
        toastMessage,
        toastColor,
        isToastOpen,
        paginaActualComandos.value - 1,
        comandosPorPagina.value
      ),
      obtenerComandosActuadorPuerta(
        toastMessage,
        toastColor,
        isToastOpen
      ),
    ]);

    const mapaReles = new Map();

    for (const relacion of (relacionesPuerta ?? [])) {
      const mac = relacion?.comandoActuadorMac ?? relacion?.mac ?? "";
      const keyword = relacion?.comandoActuadorKeyword ?? relacion?.keyword ?? "";
      const indiceRele = relacion?.indiceRele ?? null;
      mapaReles.set(`${mac}__${keyword}`, indiceRele);
    }

    listaComandosActuador.value = (response?.content ?? []).map((c) => ({
      ...c,
      indiceRele: mapaReles.get(`${c.mac}__${c.keyword}`) ?? null,
    }));

    totalPaginasComandos.value = Math.max(1, response?.totalPages ?? 1);
  } catch {
    listaComandosActuador.value = [];
    totalPaginasComandos.value = 1;
  }
};

const onSeleccionDispositivoComandos = async () => {
  dispositivo.value = dispositivoSeleccionado.value;
  indiceReleSeleccionado.value = "";
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

    if (esPuertaSeleccionada.value) {
      await crearComandoActuadorPuerta(
        toastMessage,
        toastColor,
        isToastOpen,
        dispositivoSeleccionado.value,
        keywordCmd,
        Number(indiceReleSeleccionado.value)
      );
    }

    crearToast(toastMessage, toastColor, isToastOpen, "Comando creado correctamente");

    keywordCmd.value = "";
    comandoTexto.value = "";
    textoOk.value = "";
    indiceReleSeleccionado.value = "";

    await cargarComandosActuador();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

const eliminarComandoActuadorVista = async (comando) => {
  try {
    if (comando?.indiceRele != null && comando?.indiceRele !== "") {
      await eliminarComandoActuadorPuerta(
        toastMessage,
        toastColor,
        isToastOpen,
        comando.mac,
        comando.keyword,
        comando.indiceRele
      );
    }

    await eliminarComandoActuador(
      toastMessage,
      toastColor,
      isToastOpen,
      comando.mac,
      comando.keyword
    );

    crearToast(toastMessage, toastColor, isToastOpen, "Comando eliminado correctamente");
    await cargarComandosActuador();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

const cargarAcciones = async () => {
  try {
    const [accionesPage, ordenesRaw] = await Promise.all([
      obtenerAcciones(
        toastMessage,
        toastColor,
        isToastOpen,
        paginaActualAcciones.value - 1,
        accionesPorPagina.value
      ),
      obtenerOrdenesSimples(toastMessage, toastColor, isToastOpen),
    ]);

    const accionesRaw = accionesPage?.content ?? [];
    totalPaginasAcciones.value = Math.max(1, accionesPage?.totalPages ?? 1);

    const mapaOrdenes = new Map();

    for (const orden of (ordenesRaw ?? [])) {
      const ordenId = orden?.id ?? orden?.ordenId ?? orden?.idOrden;
      if (ordenId != null) {
        mapaOrdenes.set(Number(ordenId), orden);
      }
    }

    listaAcciones.value = (accionesRaw ?? []).map((accion) => {
      const ordenId = accion?.ordenId ?? accion?.orden_id ?? accion?.idOrden ?? null;
      const orden = ordenId != null ? mapaOrdenes.get(Number(ordenId)) : null;

      const usuario =
        `${orden?.nombre ?? ""} ${orden?.apellidos ?? ""}`.trim() ||
        orden?.email ||
        orden?.usuario ||
        orden?.nombreUsuario ||
        "-";

      const dispositivo =
        accion?.actuadorMac ??
        accion?.mac ??
        accion?.dispositivo ??
        accion?.nombreDispositivo ??
        "-";

      const fechaRaw =
        accion?.fecha ||
        accion?.createdAt ||
        orden?.fecha ||
        orden?.fechaCreacion ||
        orden?.createdAt ||
        null;

      let fecha = "-";
      if (fechaRaw) {
        try {
          fecha = new Intl.DateTimeFormat("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }).format(new Date(fechaRaw));
        } catch {
          fecha = String(fechaRaw);
        }
      }

      const resultado =
        accion?.resultado ||
        accion?.textoRespuesta ||
        accion?.estado ||
        "-";

      return {
        idAccion: accion?.idAccion ?? accion?.id ?? `${ordenId}_${dispositivo}_${resultado}`,
        usuario,
        dispositivo,
        fecha,
        resultado,
      };
    });
  } catch (error) {
    listaAcciones.value = [];
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

watch([esSensorLista, esNumericoLista], async () => {
  paginaActualDispositivos.value = 1;

  if (!esSensorLista.value) await obtenerActuadoresVista();
  else if (!esNumericoLista.value) await obtenerSensorBooleanoVista();
  else await obtenerSensorNumericoVista();
});

watch(esSensorForm, async () => {
  tipoElegido.value = "";
  esNumericoForm.value = false;
  numeroReles.value = 1;
  comandoEstadoProyector.value = "";
  await obtenerTiposVista();
});

watch(tipoElegido, () => {
  if (!esTipoPuerta.value) {
    numeroReles.value = 1;
  }

  if (!esTipoProyector.value) {
    comandoEstadoProyector.value = "";
  }

  if (!esSensorForm.value) {
    esNumericoForm.value = false;
  }
});

watch(dispositivoSeleccionado, () => {
  if (!esPuertaSeleccionada.value) {
    indiceReleSeleccionado.value = "";
  }
});
watch(relesDisponibles, (nuevosReles) => {
  if (!nuevosReles.includes(Number(indiceReleSeleccionado.value))) {
    indiceReleSeleccionado.value = "";
  }
});

onMounted(async () => {
  await obtenerTiposVista();
  await obtenerUbicacionesVista();
  await obtenerActuadoresVista();
  await cargarActuadoresParaComandos();
  await cargarComandosActuador();
  await cargarAcciones();
});
</script>

<style scoped>
:global(:root) {
  color-scheme: light dark;
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

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.pagination-info {
  color: var(--text);
  font-weight: 600;
}

.btn-pagination {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background-color: var(--primary);
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.btn-pagination:hover {
  background-color: var(--primary-hover);
}

.btn-pagination:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
