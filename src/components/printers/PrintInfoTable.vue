<template>
  <div class="p-10 bg-gray-200 rounded-2xl shadow-md shadow-gray-500 overflow-auto overflow-x-auto">
    <table class="table-auto w-full text-center">
      <thead>
        <tr class="py-5">
          <th class="w-[10%] text-center pb-3 text-lg">Fecha</th>
          <th v-if="adminRole" class="w-[11%] text-center pb-3 text-lg">Usuario</th>
          <th class="w-[11%] text-center pb-3 text-lg">Fichero</th>
          <th class="w-[7%] text-center pb-3 text-lg">Estado</th>
          <th class="w-[11%] text-center pb-3 text-lg">Impresora</th>
          <th class="w-[5%] text-center pb-3 text-lg">Copias</th>
          <th class="w-[6%] text-center pb-3 text-lg">Color</th>
          <th class="w-[8%] text-center pb-3 text-lg">Orientación</th>
          <th class="w-[5%] text-center pb-3 text-lg">Caras</th>
          <th class="w-[8%] text-center pb-3 text-lg">Tamaño (KB)</th>
          <th class="w-[6%] text-center pb-3 text-lg">Páginas PDF</th>
          <th class="w-[6%] text-center pb-3 text-lg">Hojas totales</th>
          <th v-if="mostrarCoste" class="w-[6%] text-center pb-3 text-lg">Coste</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(print, index) in info" :key="index">
          <td class="truncate text-center" :title="formatDate(print.date)">{{ formatDate(print.date) }}</td>
          <td v-if="adminRole" class="truncate text-center" :title="print.user">{{ print.user }}</td>
          <td class="truncate text-center" :title="print.fileName">{{ print.fileName }}</td>
          <td :title="print.errorMessage" class="print-status-cell text-center">
            <span>{{ print.status }}</span>
            <button
              v-if="adminRole && print.status === 'Pendiente de recogida'"
              type="button"
              class="recogida-button"
              :disabled="recogidasEnProceso.includes(print.id)"
              @click="confirmarRecogidaTabla(print.id)">
              {{ recogidasEnProceso.includes(print.id) ? 'ACTUALIZANDO...' : 'RECOGIDO' }}
            </button>
            <ion-icon v-if="print.status === 'Pendiente de imprimir'"
                      name="close-circle-outline"
                      style="font-size: 24px; cursor: pointer;"
                      class="ml-2 text-red-500"
                      @click="cancelarImpresionTabla(print.id)"></ion-icon>
          </td>
          <td class="truncate text-center">{{ print.printer }}</td>
          <td class="truncate text-center">{{ print.copies }}</td>
          <td class="truncate text-center">{{ print.color }}</td>
          <td class="truncate text-center">{{ print.orientation }}</td>
          <td class="truncate text-center">{{ print.sides }}</td>
          <td class="truncate text-center">{{ print.fileSizeInKB }}</td>
          <td class="truncate text-center">{{ print.numeroPaginasPdf }}</td>
          <td class="truncate text-center">{{ print.hojasTotales }}</td>
          <td v-if="mostrarCoste" class="truncate text-center">{{ formatearEuros(print.coste) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { cancelarImpresion, confirmarRecogidaImpresion } from '@/services/printers';
import { formatearEuros } from '@/utils/currency';
import { EVENTO_ROL_CAMBIADO, ROL_SELECCIONADO_KEY } from '@/utils/roles';
import { IonIcon } from '@ionic/vue';

export default defineComponent({
  name: 'PrintInfoTable',
  props: {
    info: {
      type: Array,
      required: true
    },
    adminRole: {
      type: Boolean,
      required: true
    }
  },
  components: {
    IonIcon,
  },
  setup(props, { emit }) {
    const rolSeleccionado = ref(null);
    const recogidasEnProceso = ref([]);
    const mostrarCoste = computed(() => rolSeleccionado.value !== 'CONSERJERIA');

    const actualizarRolSeleccionado = (event) => {
      rolSeleccionado.value = event?.detail?.rol || localStorage.getItem(ROL_SELECCIONADO_KEY);
    };

    onMounted(() => {
      actualizarRolSeleccionado();
      window.addEventListener(EVENTO_ROL_CAMBIADO, actualizarRolSeleccionado);
    });

    onBeforeUnmount(() => {
      window.removeEventListener(EVENTO_ROL_CAMBIADO, actualizarRolSeleccionado);
    });

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const cancelarImpresionTabla = async (id) => {
      try {
        const toastMessage = 'Cancelando impresión...';
        const toastColor = 'warning';
        const isToastOpen = true;

        const response = await cancelarImpresion(toastMessage, toastColor, isToastOpen, id);
        if (response.ok)
        {
          emit('actualizar-tabla'); // Refrescar la tabla después de cancelar
        }
        else
        {
          alert('No se pudo cancelar la impresión. Pincha sobre el botón de actualizar para ver el nuevo estado de la tarea');
        }
      } catch (error) {
        console.error(error);
        alert('Ocurrió un error al intentar cancelar la impresión. Pincha sobre el botón de actualizar para ver el nuevo estado de la tarea');
      }
    };

    const confirmarRecogidaTabla = async (id) => {
      if (recogidasEnProceso.value.includes(id)) {
        return;
      }

      recogidasEnProceso.value = [...recogidasEnProceso.value, id];

      try {
        const response = await confirmarRecogidaImpresion('', '', false, id);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'No se pudo confirmar la recogida de la impresion');
        }

        emit('actualizar-tabla');
      } catch (error) {
        console.error(error);
        alert(error.message || 'Ocurrio un error al confirmar la recogida de la impresion.');
      } finally {
        recogidasEnProceso.value = recogidasEnProceso.value.filter((printId) => printId !== id);
      }
    };

    return {
      formatDate,
      formatearEuros,
      cancelarImpresionTabla,
      confirmarRecogidaTabla,
      recogidasEnProceso,
      mostrarCoste,
    };
  }
});
</script>
<style scoped>
/* Estilos generales de la tabla */
.table-container table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Roboto', sans-serif;
}

.table-container th, .table-container td {
  border: 1px solid #dddddd;
  text-align: center;
  padding: 8px;
}

.table-container th {
  background-color: var(--form-bg-light);
  color: var(--text-color-light);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-container tr:nth-child(even) {
  background-color: #f9f9f9;
}

.table-container tr:hover {
  background-color: #e6f7ff;
}

.table-container a {
  color: #3a7ca5;
  text-decoration: none;
}

.table-container a:hover {
  text-decoration: underline;
  color: #1a5a7a;
}

.table-container {
  width: 50%;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px;
  border-radius: 10px;
  padding: 20px;
  overflow: auto;
}

.print-status-cell {
  white-space: normal;
}

.recogida-button {
  display: block;
  width: 100%;
  margin: 0.4rem 0 0.45rem;
  padding: 0.35rem 0.55rem;
  color: #ffffff;
  background-color: #16803c;
  border: 1px solid #0f5f2d;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.recogida-button:hover:not(:disabled) {
  background-color: #0f5f2d;
}

.recogida-button:disabled {
  opacity: 0.7;
  cursor: wait;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .table-container {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 4px 6px;
  }

  .table-container th {
    background-color: var(--form-bg-dark);
    color: var(--text-color-dark);
  }

  .table-container tr:nth-child(even) {
    background-color: #2c2c2c;
  }

  .table-container tr:hover {
    background-color: #3e3e3e;
  }

  .table-container a {
    color: var(--text-color-dark);
  }

  .table-container a:hover {
    color: #76c7c0;
  }
}
/* Columna fichero se controla por porcentaje arriba; mantener truncado */
</style>

