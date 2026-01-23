<template>
  <div id="djg-main-box">
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

      <!-- Plantas -->
      <div id="contenedor-botones-plantas-box">
        <p class="titulo-djg">Mostrar planta.</p>

        <div id="contenedor-botones-plantas">
          <button @click="setPlant('terrenos')" :class="{ 'boton-active': planta === 'terrenos' }">
            Planta<br />terrenos
          </button>
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

      <!-- ROTACIÓN: CAMBIA ENTRE PLANOS -->
      <div id="contenedor-rotacion">
        <p class="titulo-djg">
          Rotación:
          <span :class="rotationEnabled ? 'rot-on' : 'rot-off'">
            {{ rotationEnabled ? 'Activada' : 'Desactivada' }}
          </span>
        </p>

        <div class="rot-times">
          <button @click="startRotation(3)" :class="{ 'rot-active': rotationEnabled && rotationSeconds === 3 }">03s</button>
          <button @click="startRotation(5)" :class="{ 'rot-active': rotationEnabled && rotationSeconds === 5 }">05s</button>
          <button @click="startRotation(10)" :class="{ 'rot-active': rotationEnabled && rotationSeconds === 10 }">10s</button>
          <button @click="startRotation(15)" :class="{ 'rot-active': rotationEnabled && rotationSeconds === 15 }">15s</button>
          <button @click="startRotation(20)" :class="{ 'rot-active': rotationEnabled && rotationSeconds === 20 }">20s</button>
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

      <!-- INFO (click) -->
      <div id="contenedor-info">
        <p class="titulo-djg">Dispositivos en la zona</p>

        <p v-if="!selectedZoneId"><span>Seleccione una zona del mapa.</span></p>

        <template v-else>
          <p><strong>Zona:</strong> {{ zoneLabel(selectedZoneId) }}</p>
          <p><strong>Planta:</strong> {{ selectedZonePlant ?? planta }}</p>

          <hr />

          <p v-if="selectedZoneDevices.length === 0">
            No hay dispositivos registrados en esta zona.
          </p>

          <ul v-else class="device-list">
            <li v-for="d in selectedZoneDevices" :key="d.type" class="device-item">
              <span class="device-name">
                {{ DEVICE_TYPES[d.type]?.icon ?? '🔧' }}
                {{ DEVICE_TYPES[d.type]?.label ?? d.type }}
              </span>
              <span class="device-count">{{ d.count }}</span>
            </li>
          </ul>

          <p v-if="selectedZoneDevices.length" class="device-total">
            <strong>Total:</strong> {{ totalDevices }}
          </p>
        </template>
      </div>
    </div>

    <!-- MAPAS -->
    <div class="contenedor">
      <!-- TERRENOS -->
      <div v-show="planta === 'terrenos'" class="caja-mapa" :style="mapStyle(plantaTerrenosUrl)"></div>

      <!-- PLANTA BAJA -->
      <div v-show="planta === 'baja'" id="planta-baja" class="caja-mapa" :style="mapStyle(plantaBajaUrl)">
        <div
          v-for="id in zonasBaja"
          :key="id"
          :id="id"
          class="zona"
          :class="{ 'zone-selected': selectedZoneId === id }"
          @mouseenter="onZoneEnter($event, id, 'baja')"
          @mousemove="onZoneMove($event)"
          @mouseleave="onZoneLeave"
          @click="selectZone(id, 'baja')"
        />
      </div>

      <!-- PLANTA PRIMERA -->
      <div v-show="planta === 'primera'" id="planta-primera" class="caja-mapa" :style="mapStyle(plantaPrimeraUrl)">
        <div
          v-for="id in zonasPrimera"
          :key="id"
          :id="id"
          class="zona"
          :class="{ 'zone-selected': selectedZoneId === id }"
          @mouseenter="onZoneEnter($event, id, 'primera')"
          @mousemove="onZoneMove($event)"
          @mouseleave="onZoneLeave"
          @click="selectZone(id, 'primera')"
        />
      </div>

      <!-- PLANTA SEGUNDA -->
      <div v-show="planta === 'segunda'" id="planta-segunda" class="caja-mapa" :style="mapStyle(plantaSegundaUrl)">
        <div
          v-for="id in zonasSegunda"
          :key="id"
          :id="id"
          class="zona"
          :class="{ 'zone-selected': selectedZoneId === id }"
          @mouseenter="onZoneEnter($event, id, 'segunda')"
          @mousemove="onZoneMove($event)"
          @mouseleave="onZoneLeave"
          @click="selectZone(id, 'segunda')"
        />
      </div>
    </div>

    <!-- TOOLTIP GLOBAL -->
    <div
      v-if="tooltip.visible"
      class="tooltip tooltip-fixed"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="tooltip-title">{{ tooltip.title }}</div>

      <div v-if="tooltip.devices.length === 0" class="tooltip-empty">
        Sin dispositivos registrados.
      </div>

      <ul v-else class="tooltip-list">
        <li v-for="d in tooltip.devices" :key="d.type" class="tooltip-item">
          <span>
            {{ DEVICE_TYPES[d.type]?.icon ?? '🔧' }}
            {{ DEVICE_TYPES[d.type]?.label ?? d.type }}
          </span>
          <span class="tooltip-count">{{ d.count }}</span>
        </li>
      </ul>

      <div v-if="tooltip.devices.length" class="tooltip-footer">Total: {{ tooltipTotal }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onBeforeUnmount, onMounted } from 'vue';
import { obtenerDispositivos } from "@/services/automationsMap";

// TOAST
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

type Planta = 'terrenos' | 'baja' | 'primera' | 'segunda'

type DeviceType =
  | 'camera'
  | 'sensor_temp'
  | 'sensor_motion'
  | 'lock'
  | 'light'
  | 'signage'
  | 'router'
  | 'access_point'
  | 'projector'

type ZoneDevice = { type: DeviceType; count: number }

const planta = ref<Planta>('baja')

const plantaTerrenosUrl = '/img/automations/Planta-baja-terrenos.png'
const plantaBajaUrl = '/img/automations/Planta-baja.png'
const plantaPrimeraUrl = '/img/automations/Planta-primera.png'
const plantaSegundaUrl = '/img/automations/Planta-segunda.png'

// Zonas
const zonasBaja = [
  'aula-2ndo-Guia','aula-1ero-Guia-A','aula-1ero-Guia-B','gimnasio','pista-padel',
  'aula0-11','aula0-9','aula0-7','aula0-5','aula0-3','aula0-1','aula0-2-norte','aula0-2-sur'
]
const zonasPrimera = [
  'aula1-11','aula1-9','aula1-7','aula1-5','aula1-3','aula1-1','aula1-19','aula1-17',
  'aula1-15','aula1-13','aula1-2','aula1-4','aula1-6','aula1-8','aula1-10','aula1-12'
]
const zonasSegunda = [
  'aula2-11','aula2-13','aula2-9','aula2-7','aula2-5','aula2-3','aula2-1','aula2-23',
  'aula2-21','aula2-19','aula2-17','aula2-15','aula2-2','aula2-4','aula2-6','aula2-8',
  'aula2-10','aula2-12'
]

// Tipos (catálogo)
const DEVICE_TYPES: Record<DeviceType, { label: string; icon: string }> = {
  camera: { label: 'Cámara', icon: '📷' },
  sensor_temp: { label: 'Sensor de temperatura', icon: '🌡️' },
  sensor_motion: { label: 'Sensor de movimiento', icon: '🕴️' },
  lock: { label: 'Cerradura inteligente', icon: '🔒' },
  light: { label: 'Iluminación', icon: '💡' },
  signage: { label: 'Cartelería digital', icon: '🖥️' },
  router: { label: 'Router', icon: '📡' },
  access_point: { label: 'Punto de acceso', icon: '📶' },
  projector: { label: 'Proyector', icon: '📽️' }
}

// Dispositivos por zona (EJEMPLO)
const ZONE_DEVICES: Record<string, ZoneDevice[]> = {
  'aula0-11': [
    { type: 'access_point', count: 1 },
    { type: 'projector', count: 1 },
    { type: 'sensor_motion', count: 1 }
  ],
  'aula0-9': [
    { type: 'camera', count: 1 },
    { type: 'light', count: 8 }
  ],
  gimnasio: [
    { type: 'camera', count: 2 },
    { type: 'sensor_motion', count: 2 }
  ],
  'pista-padel': [{ type: 'camera', count: 1 }]
}

// Labels
const ZONE_LABELS: Record<string, string> = {
 'aula-2ndo-Guia': 'Aula 2º - Guía',
  'aula-1ero-Guia-A': 'Aula 1º - Guía A',
  'aula-1ero-Guia-B': 'Aula 1º - Guía B',
  gimnasio: 'Gimnasio',
  'pista-padel': 'Pista de pádel',
  'aula0-11': 'Aula 0.11 - 1º BCS-A',
  'aula0-9': 'Aula 0.9 - Aula de Plasica' ,
  'aula0-7': 'Aula 0.7 - 1º SMR',
  'aula0-5': 'Aula 0.5 - 2º SMR',
  'aula0-3': 'Aula 0.3 - 2º FPB',
  'aula0-1': 'Aula 0.1 - 1º FPB',
  'aula0-2-norte': 'Aula 0.2 Norte - 3º DIVER',
  'aula0-2-sur': 'Aula 0.2 Sur - 4º DIVER',
  'aula1-11': 'Aula 1.11 - Aula-Taller Tecnología',
  'aula1-9': 'Aula 1.9 - 1º ESO-C',
  'aula1-7': 'Aula 1.7 - 1º ESO-B',
  'aula1-5': 'Aula 1.5 - 1º ESO-A',
  'aula1-3': 'Aula 1.3 - 4º ESO-A',
  'aula1-1': 'Aula 1.1 - DPT-Orientación',
  'aula1-19': 'Aula 1.19 - Aula Convivencia',
  'aula1-17': 'Aula 1.17 - 4º ESO-B',
  'aula1-15': 'Aula 1.15 - 4º ESO-C',
  'aula1-13': 'Aula 1.13 - 1º CFGS Mecatrónica',
  'aula1-2': 'Aula 1.2 - 1º BACH-A',
  'aula1-4': 'Aula 1.4 - 1º BACH-B',
  'aula1-6': 'Aula 1.6 - 1º BACH-C',
  'aula1-8': 'Aula 1.8 - LAB de Ciencias',
  'aula1-10': 'Aula 1.10 - Aula-Taller TIC',
  'aula1-12': 'Aula 1.12 - 2º BACH-A',
  'aula2-11': 'Aula 2.11 - 1º DAM-DAW',
  'aula2-13': 'Aula 2.13 - 2º DAM-DAW',
  'aula2-9': 'Aula 2.9 - Informática',
  'aula2-7': 'Aula 2.7 - 3º ESO-B',
  'aula2-5': 'Aula 2.5 - 2º ESO-B',
  'aula2-3': 'Aula 2.3 - 2º ESO-A',
  'aula2-1': 'Aula 2.1 - 3º DIVER',
  'aula2-23': 'Aula 2.23 - Aula PT',
  'aula2-21': 'Aula 2.21 - Aula Convivenvia',
  'aula2-19': 'Aula 2.19 - 4º DIVER',
  'aula2-17': 'Aula 2.17 - 2º ESO-C',
  'aula2-15': 'Aula 2.15 - 3º ESO-A',
  'aula2-2': 'Aula 2.2 - Desdobles',
  'aula2-4': 'Aula 2.4 - 2º BACH-D',
  'aula2-6': 'Aula 2.6 - 2º BACH-C',
  'aula2-8': 'Aula 2.8 - 2º BACH-B',
  'aula2-10': 'Aula 2.10 - Taller Radio Audiovisuales',
  'aula2-12': 'Aula 2.12 - LAB FQ'
}
const zoneLabel = (id: string) => ZONE_LABELS[id] ?? id

// Localizador
const selectedZoneKey = ref<string>('')
const zoneOptions = computed(() =>
  [...zonasBaja, ...zonasPrimera, ...zonasSegunda].map((id) => ({
    key: id,
    label: zoneLabel(id)
  }))
)

// Selección (click)
const selectedZoneId = ref<string>('')
const selectedZonePlant = ref<Exclude<Planta, 'terrenos'> | null>(null)

const selectZone = (id: string, plant: Exclude<Planta, 'terrenos'>) => {
  selectedZoneId.value = id
  selectedZonePlant.value = plant
  selectedZoneKey.value = id
}

const onZoneChange = () => {
  const id = selectedZoneKey.value
  if (!id) return

  const plant = zonasBaja.includes(id) ? 'baja' : zonasPrimera.includes(id) ? 'primera' : 'segunda'
  planta.value = plant
  selectedZoneId.value = id
  selectedZonePlant.value = plant
}

const clearSelection = () => {
  selectedZoneId.value = ''
  selectedZonePlant.value = null
  selectedZoneKey.value = ''
  tooltip.visible = false
}

// Cambiar planta (manual)
const setPlant = (p: Planta) => {
  planta.value = p
  tooltip.visible = false
}

// Dimensiones
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

const applyDimensions = () => {
  const dim = DIMENSIONS[selectedDimensionKey.value]
  mapWidth.value = dim.w
  mapHeight.value = dim.h
}
const resetDimensions = () => {
  selectedDimensionKey.value = 'res3'
  applyDimensions()
}
const mapStyle = (imgUrl: string) =>
  ({
    width: `${mapWidth.value}px`,
    height: `${mapHeight.value}px`,
    backgroundImage: `url('${imgUrl}')`
  }) as const

// Panel
const selectedZoneDevices = computed<ZoneDevice[]>(() =>
  selectedZoneId.value ? ZONE_DEVICES[selectedZoneId.value] ?? [] : []
)
const totalDevices = computed(() => selectedZoneDevices.value.reduce((a, d) => a + d.count, 0))

// Tooltip GLOBAL con coordenadas de pantalla
const tooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  devices: [] as ZoneDevice[]
})
const tooltipTotal = computed(() => tooltip.devices.reduce((a, d) => a + d.count, 0))

const setTooltipPos = (evt: MouseEvent) => {
  tooltip.x = evt.clientX + 12
  tooltip.y = evt.clientY + 12
}

const onZoneEnter = (evt: MouseEvent, zoneId: string, _plant: Exclude<Planta, 'terrenos'>) => {
  tooltip.visible = true
  tooltip.title = zoneLabel(zoneId)
  tooltip.devices = ZONE_DEVICES[zoneId] ?? []
  setTooltipPos(evt)
}

const onZoneMove = (evt: MouseEvent) => {
  if (!tooltip.visible) return
  setTooltipPos(evt)
}

const onZoneLeave = () => {
  tooltip.visible = false
}

// ROTACIÓN: VA CAMBIANDO ENTRE PLANOS
const rotationEnabled = ref(false)
const rotationSeconds = ref(10)
let rotationTimer: number | null = null

const ROTATION_ORDER: Planta[] = ['terrenos', 'baja', 'primera', 'segunda']

const advancePlant = () => {
  const idx = ROTATION_ORDER.indexOf(planta.value)
  const next = ROTATION_ORDER[(idx + 1) % ROTATION_ORDER.length]
  planta.value = next
  tooltip.visible = false
}

const startRotation = (seconds: number) => {
  rotationSeconds.value = seconds
  rotationEnabled.value = true

  if (rotationTimer !== null) {
    window.clearInterval(rotationTimer)
    rotationTimer = null
  }

  rotationTimer = window.setInterval(() => {
    if (!rotationEnabled.value) return
    advancePlant()
  }, rotationSeconds.value * 1000)
}

const stopRotation = () => {
  rotationEnabled.value = false
  if (rotationTimer !== null) {
    window.clearInterval(rotationTimer)
    rotationTimer = null
  }
}

onMounted(async () => {
  //await obtenerDispositivos(toastMessage, toastColor, isToastOpen);
});

onBeforeUnmount(() => {
  if (rotationTimer !== null) window.clearInterval(rotationTimer)
})

// init
applyDimensions()
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

.device-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.device-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dashed #ddd;
}

.device-total {
  margin-top: 8px;
}

/* ===== ROTACIÓN ===== */
#contenedor-rotacion .rot-times {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-top: 6px;
}

.rot-on { color: green; font-weight: 800; }
.rot-off { color: #c60000; font-weight: 800; }

.rot-active {
  background-color: rgb(31, 155, 203);
  color: #fff;
  font-weight: 800;
}

/* ===== MAPA ===== */
.contenedor {
  padding: 10px;
}

.caja-mapa {
  border: 3px solid rgba(0, 0, 0, 0.35);
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  overflow: visible;
}

.zona {
  position: absolute;
  background-color: rgba(255, 255, 0, 0.26);
  border: 1px solid rgb(0, 0, 0);
  cursor: pointer;
}

.zona:hover {
  background-color: rgba(28, 46, 146, 0.5);
  border: 1px solid gray;
}

.zone-selected {
  box-shadow: 0 0 10px 3px rgba(255, 0, 0, 0.85);
}

/* Tooltip GLOBAL */
.tooltip {
  z-index: 999999;
  min-width: 220px;
  max-width: 320px;
  background: rgba(216, 247, 255, 0.97);
  border: 2px solid #2b2b2b;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
  padding: 10px;
  pointer-events: none;
}

.tooltip-fixed {
  position: fixed;
}

.tooltip-title {
  font-weight: 800;
  border-bottom: 2px solid rgba(0, 0, 0, 0.35);
  padding-bottom: 6px;
  margin-bottom: 6px;
}

.tooltip-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tooltip-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 3px 0;
}

.tooltip-count {
  font-weight: 700;
}

.tooltip-footer {
  margin-top: 8px;
  border-top: 2px solid rgba(0, 0, 0, 0.35);
  padding-top: 6px;
  font-weight: 700;
}

.tooltip-empty {
  font-style: italic;
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
</style>
