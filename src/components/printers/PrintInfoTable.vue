<template>
  <div class="p-10 bg-gray-200 rounded-2xl shadow-md shadow-gray-500 overflow-auto overflow-x-auto">
    <table class="table-auto w-full">
      <thead>
        <tr class="py-5">
          <th class="w-[10%] text-left pb-3 text-lg">Fecha</th>
          <th v-if="adminRole" class="w-[12%] text-left pb-3 text-lg">Usuario</th>
          <th class="w-[12%] text-left pb-3 text-lg">Fichero</th>
          <th class="w-[7%] text-left pb-3 text-lg">Estado</th>
          <th class="w-[12%] text-left pb-3 text-lg">Impresora</th>
          <th class="w-[5%] text-left pb-3 text-lg">Copias</th>
          <th class="w-[7%] text-left pb-3 text-lg">Color</th>
          <th class="w-[9%] text-left pb-3 text-lg">Orientación</th>
          <th class="w-[5%] text-left pb-3 text-lg">Caras</th>
          <th class="w-[9%] text-left pb-3 text-lg">Tamaño (KB)</th>
          <th class="w-[6%] text-left pb-3 text-lg">Páginas PDF</th>
          <th class="w-[6%] text-left pb-3 text-lg">Hojas totales</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(print, index) in info" :key="index">
          <td class="truncate text-left pl-1" :title="formatDate(print.date)">{{ formatDate(print.date) }}</td>
          <td v-if="adminRole" class="truncate text-left pl-1" :title="print.user">{{ print.user }}</td>
          <td class="truncate text-left pl-1" :title="print.fileName">{{ print.fileName }}</td>
          <td :title="print.errorMessage" class="truncate text-left pl-1">
            {{ print.status }}
            <ion-icon v-if="print.status === 'Pendiente'"
                      name="close-circle-outline"
                      style="font-size: 24px; cursor: pointer;"
                      class="ml-2 text-red-500"
                      @click="cancelarImpresionTabla(print.id)"></ion-icon>
          </td>
          <td class="truncate text-left pl-1">{{ print.printer }}</td>
          <td class="truncate text-left pl-1">{{ print.copies }}</td>
          <td class="truncate text-left pl-1">{{ print.color }}</td>
          <td class="truncate text-left pl-1">{{ print.orientation }}</td>
          <td class="truncate text-left pl-1">{{ print.sides }}</td>
          <td class="truncate text-left pl-1">{{ print.fileSizeInKB }}</td>
          <td class="truncate text-left pl-1">{{ print.numeroPaginasPdf }}</td>
          <td class="truncate text-left pl-1">{{ print.hojasTotales }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { cancelarImpresion } from '@/services/printers';
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

    return {
      formatDate,
      cancelarImpresionTabla,
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

