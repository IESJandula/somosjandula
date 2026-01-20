<template>
  <div class="contenedor-scroll-horizontal" id="djg-main-box">
    <!-- PANEL IZQUIERDO -->
    <div id="panel">
      <!-- Localizador -->
      <div id="panel-selector">
        <label for="selector-zona" class="titulo-djg">Localizador (zona):</label>

        <select id="selector-zona" v-model="selectedZoneKey" @change="onZoneChange">
          <option value="">Seleccionar</option>
          <option v-for="opt in zoneOptions" :key="opt.key" :value="opt.key">
            {{ opt.label }}
          </option>
        </select>

        <button class="btn-secondary" @click="clearSelection" :disabled="!selectedZoneId">
          Quitar selección
        </button>
      </div>

      <!-- Curso académico -->
      <div id="panel-curso">
        <p class="titulo-djg">Curso académico</p>

        <p v-if="loadingCursos">Cargando cursos…</p>

        <template v-else>
          <select v-model="cursoAcademicoSeleccionado" @change="recargarEspaciosFijos" style="width: 100%; border-radius: 5px; padding: 6px;">
            <option v-for="c in cursosAcademicos" :key="c.cursoAcademico" :value="c.cursoAcademico">
              {{ c.cursoAcademico }} <span v-if="c.seleccionado"> (seleccionado)</span>
            </option>
          </select>
        </template>

        <p v-if="loadingEspacios" style="margin-top: 8px;">Cargando espacios fijos…</p>
      </div>

      <!-- Plantas -->
      <div class="scroll-container" id="contenedor-botones-plantas-box">
        <p class="titulo-djg">Mostrar planta.</p>

        <div id="contenedor-botones-plantas">
          <button @click="setPlant('baja')" :class="{ 'boton-active': planta === 'baja' }">
            Planta<br />baja
          </button>
          <button @click="setPlant('primera')" :class="{ 'boton-active': planta === 'primera' }">
            Planta<br />primera
          </button>
          <button @click="setPlant('segunda')" :class="{ 'boton-active': planta === 'segunda' }">
            Planta<br />segunda
          </button>
        </div>
      </div>
      <!-- ROTACIÓN DE PLANTAS -->
        <div id="contenedor-rotacion">
          <p class="titulo-djg">
            Rotación:
            <span :class="rotationEnabled ? 'rot-on' : 'rot-off'">
              {{ rotationEnabled ? 'Activada' : 'Desactivada' }}
            </span>
          </p>

          <div class="rot-times">
            <button @click="startRotation(5)"  :class="{ 'rot-active': rotationEnabled && rotationSeconds === 5 }">05s</button>
            <button @click="startRotation(15)" :class="{ 'rot-active': rotationEnabled && rotationSeconds === 15 }">15s</button>
            <button @click="startRotation(30)" :class="{ 'rot-active': rotationEnabled && rotationSeconds === 30 }">30s</button>
          </div>

          <button class="btn-secondary" @click="stopRotation" :disabled="!rotationEnabled">
            Desactivar rotación
          </button>
        </div>


      <!-- Dimensiones -->
      <div id="contenedor-dimensiones">
        <label for="selector-dimensiones" class="titulo-djg">Dimensiones plano.</label>

        <select id="selector-dimensiones" v-model="selectedDimensionKey" @change="applyDimensions">
          <option value="res1">662px * 936px</option>
          <option value="res2">777px * 1100px</option>
          <option value="res3">827px * 1170px</option>
          <option value="res4">910px * 1287px</option>
          <option value="res5">992px * 1404px</option>
          <option value="res6">1984px * 2808px</option>
        </select>

        <button class="btn-secondary" id="restablecer" @click="resetDimensions">
          Restablecer
        </button>
      </div>

      <!-- INFO -->
      <div id="contenedor-info">
        <p class="titulo-djg">Zona seleccionada</p>

        <p v-if="!selectedZoneId"><span>Seleccione una zona del mapa.</span></p>

        <template v-else>
          <p><strong>Zona:</strong> {{ zoneIdToLocalizadorLabel(selectedZoneId) }}</p>
          

          <hr />

          <p v-if="!labelGrupoSeleccionado">
            Esta zona no tiene (de momento) curso/etapa/grupo asociado en espacios fijos.
          </p>

          <p v-else>
            
          </p>
        </template>
      </div>
    </div>

    <!-- MAPAS -->
    <div class="contenedor">

      <!-- PLANTA BAJA -->
      <div v-show="planta === 'baja'" id="planta-baja" class="caja-mapa" :style="mapStyle(plantaBajaUrl)">
        <div
          v-for="id in zonasBaja"
          :key="id"
          :id="id"
          class="zona"
          :class="{ 'zone-selected': selectedZoneId === id }"
          @click="selectZone(id, 'baja')"
        >
          <span v-if="zonaGrupoLabel(id)" class="zone-text">
            {{ zonaGrupoLabel(id) }}
          </span>
        </div>
      </div>

      <!-- PLANTA PRIMERA -->
      <div v-show="planta === 'primera'" id="planta-primera" class="caja-mapa" :style="mapStyle(plantaPrimeraUrl)">
        <div
          v-for="id in zonasPrimera"
          :key="id"
          :id="id"
          class="zona"
          :class="{ 'zone-selected': selectedZoneId === id }"
          @click="selectZone(id, 'primera')"
        >
          <span v-if="zonaGrupoLabel(id)" class="zone-text">
            {{ zonaGrupoLabel(id) }}
          </span>
        </div>
      </div>

      <!-- PLANTA SEGUNDA -->
      <div v-show="planta === 'segunda'" id="planta-segunda" class="caja-mapa" :style="mapStyle(plantaSegundaUrl)">
        <div
          v-for="id in zonasSegunda"
          :key="id"
          :id="id"
          class="zona"
          :class="{ 'zone-selected': selectedZoneId === id }"
          @click="selectZone(id, 'segunda')"
        >
          <span v-if="zonaGrupoLabel(id)" class="zone-text">
            {{ zonaGrupoLabel(id) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount, onMounted } from 'vue'
import { obtenerCursosAcademicos, obtenerEspaciosFijo, obtenerEspaciosDesdoble, obtenerEspaciosSinDocencia } from '@/services/automationsMap'


// TOAST
const isToastOpen = ref(false)
const toastMessage = ref('')
const toastColor = ref('success')

type Planta = 'baja' | 'primera' | 'segunda'

const planta = ref<Planta>('baja')
const rotationEnabled = ref(false)
const rotationSeconds = ref(10)
let rotationTimer: number | null = null

const ROTATION_ORDER: Planta[] = ['baja', 'primera', 'segunda']


const plantaBajaUrl = '/img/automations/Planta-baja.png'
const plantaPrimeraUrl = '/img/automations/Planta-primera.png'
const plantaSegundaUrl = '/img/automations/Planta-segunda.png'

// Zonas (IDs del mapa)
const zonasBaja = [
  'aula-2ndo-Guia',
  'aula-1ero-Guia-A',
  'aula-1ero-Guia-B',
  'gimnasio',
  'pista-padel',
  'aula0-11',
  'aula0-9',
  'aula0-7',
  'aula0-5',
  'aula0-3',
  'aula0-1',
  'aula0-2-norte',
  'aula0-2-sur',
  'caldera',
  'cafeteria',
  'aseos-f',
  'aseos-m',
  'conserjeria',
  'ampa-visitas',
  'secretaria',
  'biblioteca',
  'sala-profesores',
  'salon-actos',
  'direccion',
  'jefatura-estudios',
  'taller-lince',
  'aseos-central'
]
const zonasPrimera = [
  'aula1-11',
  'aula1-9',
  'aula1-7',
  'aula1-5',
  'aula1-3',
  'aula1-1',
  'aula1-19',
  'aula1-17',
  'aula1-15',
  'aula1-13',
  'aula1-2',
  'aula1-4',
  'aula1-6',
  'aula1-8',
  'aula1-10',
  'aula1-12',
  'aseos1-m',
  'aseos1-f'
]
const zonasSegunda = [
  'aula2-11',
  'aula2-13',
  'aula2-9',
  'aula2-7',
  'aula2-5',
  'aula2-3',
  'aula2-1',
  'aula2-23',
  'aula2-21',
  'aula2-19',
  'aula2-17',
  'aula2-15',
  'aula2-2',
  'aula2-4',
  'aula2-6',
  'aula2-8',
  'aula2-10',
  'aula2-12',
  'aseos2-m',
  'aseos2-f'
]

// ------------------------------
// CURSOS ACADÉMICOS
// ------------------------------
type CursoAcademicoDto = {
  cursoAcademico: string
  seleccionado: boolean | null
}

const cursosAcademicos = ref<CursoAcademicoDto[]>([])
const cursoAcademicoSeleccionado = ref<string>('')

const loadingCursos = ref(false)
const loadingEspacios = ref(false)

// ------------------------------
// ESPACIOS FIJOS (DTO)
// ------------------------------
type EspacioFijoDto = {
  cursoAcademico: string
  nombre: string
  curso: number | null
  etapa: string | null
  grupo: string | null
}
type EspacioDesdobleDto = {
  cursoAcademico: string
  nombre: string
}

type EspacioSinDocenciaDto = {
  cursoAcademico: string
  nombre: string
}

const espaciosDesdoble = ref<EspacioDesdobleDto[]>([])
const espaciosSinDocencia = ref<EspacioSinDocenciaDto[]>([])
const espaciosFijos = ref<EspacioFijoDto[]>([])

// ------------------------------
// NORMALIZACIÓN
// ------------------------------

const normalizarEspacioNombreAZoneId = (nombre: string): string =>
{
  // nos quedamos solo con el prefijo "Aula X.Y" si viene con " - ..."
  const base = nombre.split(' - ')[0].trim() // "Aula 2.13"
  const m = base.match(/^Aula\s+(\d+)\.(\d+)$/i)
  if (!m) return ''

  const plantaNum = m[1] // "2"
  const aulaNum = m[2]   // "13"
  return `aula${plantaNum}-${aulaNum}`
}
// "aula2-15" => "Aula 2.15"
const zoneIdToAulaNombre = (zoneId: string): string =>
{
  const m = zoneId.match(/^aula(\d+)-(\d+)$/i)
  if (!m) return zoneId
  return `Aula ${m[1]}.${m[2]}`
}

// label completo para el localizador:
// "Aula 2.15 - 3º ESO-A"  ó  "Aula 2.23"
const zoneIdToLocalizadorLabel = (zoneId: string): string =>
{
  if (isStaticZone(zoneId))
  {
    return STATIC_ZONE_LABELS[zoneId]
  }

  const aulaNombre = zoneIdToAulaNombre(zoneId)
  const info = zonaGrupoLabel(zoneId)
  if (!info) return aulaNombre

  if (info.toLowerCase().startsWith(aulaNombre.toLowerCase()))
  {
    return info
  }

  return `${aulaNombre} - ${info}`
}

    const STATIC_ZONE_LABELS: Record<string, string> = {
      'caldera': 'Caldera',
      'cafeteria': 'Cafetería',
      'aseos-f': 'Aseos (F)',
      'aseos-m': 'Aseos (M)',
      'conserjeria': 'Conserjería',
      'ampa-visitas': 'Visitas',
      'secretaria': 'Secretaría',
      'biblioteca': 'Biblioteca',
      'sala-profesores': 'Sala de profesores',
      'salon-actos': 'Salón de actos',
      'direccion': 'Dirección',
      'jefatura-estudios': 'Jefatura de estudios',
      'taller-lince': 'Taller Lince',
      'aseos-central': 'Aseos',
      'aseos1-m': 'Aseos (M)',
      'aseos1-f': 'Aseos (F)',
      'aseos2-m': 'Aseos (M)',
      'aseos2-f': 'Aseos (F)',
      'aula1-10': 'TIC',
      'aula2-10': 'Audiovisuales',
      'aula2-21': 'Convivencia'
      

    }

    const isStaticZone = (zoneId: string) => !!STATIC_ZONE_LABELS[zoneId]



// ------------------------------
// MAPEO zoneId -> "2º ESO-A"
// ------------------------------
const zoneIdToFinalLabel = computed<Record<string, string>>(() =>
{
  const map: Record<string, string> = {}

  // ESPACIOS FIJOS → "2º ESO-A"
  for (const e of espaciosFijos.value)
  {
    const zoneId = normalizarEspacioNombreAZoneId(e.nombre)
    if (!zoneId) continue

    if (e.curso && e.etapa && e.grupo)
    {
      map[zoneId] = `${e.curso}º ${e.etapa}-${e.grupo}`
    }
  }

  // DESDOBLES → "Desdobles"
  for (const e of espaciosDesdoble.value)
  {
    const zoneId = normalizarEspacioNombreAZoneId(e.nombre)
    if (!zoneId) continue

    map[zoneId] = 'Desdobles'
  }

  // SIN DOCENCIA → "Sin docencia"
  for (const e of espaciosSinDocencia.value)
  {
    const zoneId = normalizarEspacioNombreAZoneId(e.nombre)
    if (!zoneId) continue

    map[zoneId] = 'Sin docencia'
  }

  return map
})



const zonaGrupoLabel = (zoneId: string) =>
{
  // ZONA ESTÁTICA
  if (isStaticZone(zoneId))
  {
    return STATIC_ZONE_LABELS[zoneId]
  }

  const aulaNombre = zoneIdToAulaNombre(zoneId) // "Aula 2.15"
  const extra = zoneIdToFinalLabel.value[zoneId] ?? '' // "2º ESO-A" | "Desdobles" | "Sin docencia"
  return extra ? `${aulaNombre} \n ${extra}` : aulaNombre
}




// ------------------------------
// LOCALIZADOR
// ------------------------------
const selectedZoneKey = ref<string>('')
const zoneOptions = computed(() =>
  [...zonasBaja, ...zonasPrimera, ...zonasSegunda].map((id) => ({
    key: id,
    label: zoneIdToLocalizadorLabel(id)
  }))
)


// Selección (click)
const selectedZoneId = ref<string>('')
const selectedZonePlant = ref<Exclude<Planta, 'terrenos'> | null>(null)

const labelGrupoSeleccionado = computed(() =>
  selectedZoneId.value ? zonaGrupoLabel(selectedZoneId.value) : ''
)

// Centrar zona
const centerZone = (zoneId: string) =>
{
  requestAnimationFrame(() =>
  {
    const el = document.getElementById(zoneId)
    if (!el) return

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    })
  })
}

const selectZone = (id: string, plant: Exclude<Planta, 'terrenos'>) =>
{
  selectedZoneId.value = id
  selectedZonePlant.value = plant
  selectedZoneKey.value = id
  centerZone(id)
}

const onZoneChange = () =>
{
  const id = selectedZoneKey.value
  if (!id) return

  const plant = zonasBaja.includes(id) ? 'baja' : zonasPrimera.includes(id) ? 'primera' : 'segunda'
  planta.value = plant
  selectedZoneId.value = id
  selectedZonePlant.value = plant
  centerZone(id)
}

const clearSelection = () =>
{
  selectedZoneId.value = ''
  selectedZonePlant.value = null
  selectedZoneKey.value = ''
}

// Cambiar planta
const setPlant = (p: Planta) =>
{
  planta.value = p
  if (selectedZoneId.value) centerZone(selectedZoneId.value)
}
const advancePlant = () =>
{
  const idx = ROTATION_ORDER.indexOf(planta.value)
  planta.value = ROTATION_ORDER[(idx + 1) % ROTATION_ORDER.length]

  if (selectedZoneId.value)
  {
    centerZone(selectedZoneId.value)
  }
}

const startRotation = (seconds: number) =>
{
  rotationSeconds.value = seconds
  rotationEnabled.value = true

  if (rotationTimer !== null)
  {
    window.clearInterval(rotationTimer)
  }

  rotationTimer = window.setInterval(advancePlant, seconds * 1000)
}

const stopRotation = () =>
{
  rotationEnabled.value = false

  if (rotationTimer !== null)
  {
    window.clearInterval(rotationTimer)
    rotationTimer = null
  }
}


// ------------------------------
// DIMENSIONES
// ------------------------------
const DIMENSIONS: Record<string, { w: number; h: number }> = {
  res1: { w: 936, h: 662 },
  res2: { w: 1100, h: 777 },
  res3: { w: 1170, h: 827 },
  res4: { w: 1287, h: 910 },
  res5: { w: 1404, h: 992 },
  res6: { w: 2808, h: 1984 }
}
const selectedDimensionKey = ref<keyof typeof DIMENSIONS>('res3')
const mapWidth = ref(DIMENSIONS.res3.w)
const mapHeight = ref(DIMENSIONS.res3.h)

const applyDimensions = () =>
{
  const dim = DIMENSIONS[selectedDimensionKey.value]
  mapWidth.value = dim.w
  mapHeight.value = dim.h
}
const resetDimensions = () =>
{
  selectedDimensionKey.value = 'res3'
  applyDimensions()
}
const mapStyle = (imgUrl: string) =>
  ({
    width: `${mapWidth.value}px`,
    height: `${mapHeight.value}px`,
    backgroundImage: `url('${imgUrl}')`
  }) as const

// ------------------------------
// CARGA DATOS (SOLO FIJOS)
// ------------------------------
const cargarCursosYEspaciosFijos = async () =>
{
  loadingCursos.value = true
  loadingEspacios.value = true

  try
  {
    const cursos = await obtenerCursosAcademicos(toastMessage, toastColor, isToastOpen)
    cursosAcademicos.value = cursos as any

    const sel = cursosAcademicos.value.find(c => c.seleccionado)
    cursoAcademicoSeleccionado.value = sel?.cursoAcademico ?? cursosAcademicos.value[0]?.cursoAcademico ?? ''

    if (!cursoAcademicoSeleccionado.value)
    {
      throw new Error('No hay cursos académicos disponibles')
    }

    [
      espaciosFijos.value,
      espaciosDesdoble.value,
      espaciosSinDocencia.value
    ] = await Promise.all([
      obtenerEspaciosFijo(toastMessage, toastColor, isToastOpen, cursoAcademicoSeleccionado.value),
      obtenerEspaciosDesdoble(toastMessage, toastColor, isToastOpen, cursoAcademicoSeleccionado.value),
      obtenerEspaciosSinDocencia(toastMessage, toastColor, isToastOpen, cursoAcademicoSeleccionado.value)
    ]) as any


    console.log('CURSO ACADÉMICO:', cursoAcademicoSeleccionado.value)
    console.log('ESPACIOS FIJOS:', espaciosFijos.value)
  }
  catch (e: any)
  {
    toastMessage.value = e?.message ?? 'Error cargando datos'
    toastColor.value = 'danger'
    isToastOpen.value = true
  }
  finally
  {
    loadingCursos.value = false
    loadingEspacios.value = false
  }
}

const recargarEspaciosFijos = async () =>
{
  if (!cursoAcademicoSeleccionado.value) return

  loadingEspacios.value = true
  try
  {
    espaciosFijos.value = await obtenerEspaciosFijo(
      toastMessage,
      toastColor,
      isToastOpen,
      cursoAcademicoSeleccionado.value
    ) as any
  }
  catch (e: any)
  {
    toastMessage.value = e?.message ?? 'Error recargando espacios fijos'
    toastColor.value = 'danger'
    isToastOpen.value = true
  }
  finally
  {
    loadingEspacios.value = false
  }
}

// init
applyDimensions()

onMounted(async () =>
{
  await cargarCursosYEspaciosFijos()


})

onBeforeUnmount(() =>
{
  if (rotationTimer !== null)
  {
    window.clearInterval(rotationTimer)
  }
})

</script>

<style scoped>
/* ===== LAYOUT ===== */
#djg-main-box {
  display: flex;
  align-items: flex-start;
  background-color: rgb(241, 241, 224);
  min-height: 100vh;
}

#panel {
  width: 310px;
  padding: 10px;
}

#panel > * {
  border-radius: 5px;
  border: 1px solid grey;
  background-color: #fff;
  padding: 10px;
  margin: 5px 0;
}

.titulo-djg {
  font-weight: bold;
  margin-bottom: 6px;
}

#panel-selector select,
#selector-dimensiones {
  width: 100%;
  border-radius: 5px;
  margin-top: 6px;
  padding: 6px;
}

#contenedor-botones-plantas {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

button {
  cursor: pointer;
  background-color: rgb(238, 243, 242);
  transition: 0.2s;
  border-radius: 5px;
  border: 1px solid black;
  margin: 4px;
  padding: 6px 10px;
}

button:hover {
  background-color: rgb(253, 255, 121);
}

.boton-active {
  color: #fff;
  background-color: rgb(31, 155, 203);
  font-weight: bold;
}

.btn-secondary {
  width: 100%;
  margin-top: 8px;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== MAPA ===== */
.contenedor-scroll-horizontal {
  display: flex;
  overflow-x: auto;
}

.contenedor {
  padding: 10px;
}

.caja-mapa {
  position: relative;
  border: 3px solid rgba(0,0,0,0.35);
  background-repeat: no-repeat;
  background-position: top left;
  background-size: 100% 100%;
}

.zona {
  position: absolute;
  background-color: rgba(255, 255, 0, 0.26);
  border: 1px solid rgb(0, 0, 0);
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
}

.zona:hover {
  background-color: rgba(28, 46, 146, 0.5);
  border: 1px solid gray;
}

.zone-selected {
  box-shadow: 0 0 10px 3px rgba(255, 0, 0, 0.85);
}

/* Texto dentro de cada zona */
.zone-text {
  font-size: 12px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.75);
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.25);
  pointer-events: none; /* para que el click siga siendo de la zona */
  white-space: pre-line;
  text-align: center;
}

/* ===== ROTACIÓN ===== */
#contenedor-rotacion .rot-times {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-top: 6px;
}

.rot-on {
  color: green;
  font-weight: 800;
}

.rot-off {
  color: #c60000;
  font-weight: 800;
}

.rot-active {
  background-color: rgb(31, 155, 203);
  color: #fff;
  font-weight: 800;
}


/* PLANTA BAJA */
#aula-2ndo-Guia { height: 14.5%; width: 7%; top: 1.6%; left: 14%; }
#aula-1ero-Guia-A { height: 9%; width: 7%; top: 1.6%; left: 21%; }
#aula-1ero-Guia-B { height: 9%; width: 7%; top: 1.6%; left: 28%; }
#gimnasio { height: 11%; width: 18.4%; top: 29.5%; left: 12%; }
#aula0-11 { height: 10.8%; width: 8.1%; top: 25.3%; left: 44.2%; }
#aula0-9 { height: 10.8%; width: 11.9%; top: 25.3%; left: 52.6%; }
#aula0-5 { height: 9.5%; width: 9%; top: 27.5%; right: 12.8%; }
#pista-padel { height: 14.4%; width: 20.6%; top: 9.7%; right: 8.6%; transform: rotate(5.25deg); }
#aula0-7 { height: 10.3%; width: 7.1%; top: 37.4%; right: 14.8%; }
#aula0-3 { height: 10%; width: 3.6%; top: 61.6%; right: 13.8%; }
#aula0-1 { height: 10%; width: 5.5%; top: 61.6%; right: 17.7%; }
#aula0-2-norte { height: 13.2%; width: 4.5%; top: 72.8%; left: 12%; }
#aula0-2-sur { height: 13.2%; width: 4.5%; top: 72.8%; left: 16.7%; }

/* ===== ZONAS FIJAS PLANTA BAJA ===== */

#caldera {height:10%;width:4.6%;top:76%;left:21.3%;}
#cafeteria {height:10%;width:7%;top:76%;left:25.8%;}
#aseos-f {height:10%;width:3.5%;top:76%;left:33%;}
#aseos-m {height:10%;width:3.5%;top:76%;left:36.5%;}
#ampa-visitas {height:4%;width:4.8%;top:61.9%;left:35.3%;}
#conserjeria {height:6.5%;width:4.8%;top:65.9%;left:35.3%;}
#secretaria {height:10.4%;width:6.8%;top:61.5%;left:44.2%;}
#biblioteca {height:10.4%;width:11.8%;top:61.5%;left:50.7%;}
#sala-profesores {height:10.4%;width:9.4%;top:61.5%;left:62.8%;}
#aseos-central {height:10.4%;width:4.4%;top:61.5%;left:72.2%;}
#salon-actos {height:10.2%;width:23.4%;top:47.9%;left:44.0%;}
#direccion {height:10.2%;width:4.7%;top:47.9%;left:67.4%;}
#jefatura-estudios {height:10.2%;width:4.6%;top:47.9%;left:72%;}
#taller-lince {height:10.2%;width:6.3%;top:47.9%;left:76.6%;}

/* PLANTA PRIMERA */
#aula1-11 { height: 25.3%; width: 11.3%; top: 10.5%; right: 4.9%; }
#aula1-9 { height: 11%; width: 11.6%; top: 54.5%; right: 6.1%; }
#aula1-7 { height: 11%; width: 11%; top: 54.5%; right: 18.3%; }
#aula1-5 { height: 11%; width: 11.2%; top: 54.5%; right: 29.75%; }
#aula1-3 { height: 11%; width: 11.5%; top: 54.5%; right: 41.3%; }
#aula1-1 { height: 11%; width: 5.5%; top: 54.5%; right: 53.1%; }
#aula1-19 { height: 11.4%; width: 5.4%; top: 36.6%; right: 53.1%; }
#aula1-17 { height: 11.4%; width: 11.6%; top: 36.6%; right: 41.2%; }
#aula1-15 { height: 11.4%; width: 11.3%; top: 36.6%; right: 29.7%; }
#aula1-13 { height: 11.4%; width: 11.2%; top: 36.6%; right: 18.2%; }
#aula1-2 { height: 11.2%; width: 11.5%; top: 54.5%; left: 24.6%; }
#aula1-4 { height: 11.2%; width: 11.5%; top: 54.5%; left: 12.9%; }
#aula1-6 { height: 11.2%; width: 11.3%; top: 54.5%; left: 1.3%; }
#aula1-8 { height: 11.3%; width: 11.3%; top: 72.3%; left: 1.3%; }
#aula1-10 { height: 11.3%; width: 5.5%; top: 72.3%; left: 12.9%; }
#aula1-12 { height: 11.3%; width: 11.4%; top: 72.3%; left: 18.7%; }
#aseos1-m {height:11.6%;width:3.2%;top:72.4%;left:30%;}
#aseos1-f {height:11.6%;width:3.2%;top:72.4%;left:33.2%;}


/* PLANTA SEGUNDA */
#aula2-11 { height: 12.2%; width: 11.3%; top: 9%; right: 4.5%; }
#aula2-13 { height: 12.5%; width: 8.9%; top: 21.5%; right: 7%; }
#aula2-9 { height: 11%; width: 11.7%; top: 52.8%; right: 5.9%; }
#aula2-7 { height: 11%; width: 11.1%; top: 52.8%; right: 18%; }
#aula2-5 { height: 11%; width: 11.2%; top: 52.8%; right: 29.45%; }
#aula2-3 { height: 11%; width: 11.6%; top: 52.8%; right: 41%; }
#aula2-1 { height: 11%; width: 5.5%; top: 52.8%; right: 52.9%; }
#aula2-23 { height: 11.2%; width: 4.1%; top: 35%; right: 54.1%; }
#aula2-21 { height: 11.2%; width: 3.9%; top: 35%; right: 50%; }
#aula2-19 { height: 11.2%; width: 8.7%; top: 35%; right: 41%; }
#aula2-17 { height: 11.2%; width: 11.3%; top: 35%; right: 29.4%; }
#aula2-15 { height: 11.2%; width: 11.2%; top: 35%; right: 18%; }
#aula2-2 { height: 11.2%; width: 11.5%; top: 52.8%; left: 24.8%; }
#aula2-4 { height: 11.2%; width: 11.5%; top: 52.8%; left: 13%; }
#aula2-6 { height: 11.2%; width: 11.3%; top: 52.8%; left: 1.5%; }
#aula2-8 { height: 11.3%; width: 11.3%; top: 70.6%; left: 1.5%; }
#aula2-10 { height: 11.3%; width: 5.5%; top: 70.6%; left: 13.1%; }
#aula2-12 { height: 11.3%; width: 11.4%; top: 70.6%; left: 18.9%; }
#aseos2-m {height:11.6%;width:3.2%;top:70.6%;left:30%;}
#aseos2-f {height:11.6%;width:3.2%;top:70.6%;left:33.2%;}
</style>
