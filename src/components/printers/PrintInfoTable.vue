<template>
  <div class="p-10 bg-gray-200 rounded-2xl shadow-md shadow-gray-500 h-[38rem] overflow-auto overflow-x-auto">
    <table class="table-fixed w-full">
      <thead>
        <tr class="py-5">
          <th class="w-1/12 text-left pb-3 text-lg">Fecha</th>
          <th v-if="adminRole" class="w-1/12 text-left pb-3 text-lg">Usuario</th>
          <th class="w-1/6 text-left pb-3 text-lg">Fichero</th>
          <th class="w-1/6 text-left pb-3 text-lg">Tamaño (KB)</th>
          <th class="w-1/6 text-left pb-3 text-lg">Páginas PDF</th>
          <th class="w-1/6 text-left pb-3 text-lg">Impresora</th>
          <th class="w-1/12 text-left pb-3 text-lg">Estado</th>
          <th class="w-1/12 text-left pb-3 text-lg">Copias</th>
          <th class="w-1/12 text-left pb-3 text-lg">Color</th>
          <th class="w-1/12 text-left pb-3 text-lg">Orientación</th>
          <th class="w-1/12 text-left pb-3 text-lg">Caras</th>
          <th class="w-1/12 text-left pb-3 text-lg">Hojas totales</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(print, index) in info" :key="index">
          <td class="truncate text-left pl-1">{{ formatDate(print.date) }}</td>
          <td v-if="adminRole" class="truncate text-left pl-1">{{ print.user }}</td>
          <td class="truncate text-left pl-1">{{ print.fileName }}</td>
          <td class="truncate text-left pl-1">{{ print.fileSizeInKB }}</td>
          <td class="truncate text-left pl-1">{{ print.numeroPaginasPdf }}</td>
          <td class="truncate text-left pl-1">{{ print.printer }}</td>
          <td :title="adminRole ? print.errorMessage : 'Contacta con el TDE'" class="truncate text-left pl-1">{{ print.status }}</td>
          <td class="truncate text-left pl-1">{{ print.copies }}</td>
          <td class="truncate text-left pl-1">{{ print.color }}</td>
          <td class="truncate text-left pl-1">{{ print.orientation }}</td>
          <td class="truncate text-left pl-1">{{ print.sides }}</td>
          <td class="truncate text-left pl-1">{{ print.hojasTotales }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
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
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>
<style scoped>
  .table-container table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Roboto', sans-serif;
  }

  .table-container th, .table-container td {
    border: 1px solid #dddddd;
    text-align: center; /* Centramos el contenido */
    padding: 8px;
  }

  .table-container th {
    background-color: #f2f2f2;
    color: #3a7ca5;
    font-weight: 600;
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
    background-color: #ffffff;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px;
    border-radius: 10px;
    padding: 20px;
    overflow: auto;
  }

  .table-container th {
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>