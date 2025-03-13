<script setup>
import { ref } from 'vue';
import { IncidenciaService } from '@/services/IncidenciaService.js'; 

// El objeto reactivo ahora solo tiene los campos necesarios
const incidencia = ref({
  numeroAula: '',
  correoDocente: '',
  descripcionIncidencia: '',
  correoDestinatario: ''
});


const enviarFormulario = async () => 
{
  const incidenciaJson = {
    numeroAula: incidencia.value.numeroAula,
    correoDocente: incidencia.value.correoDocente,
    descripcionIncidencia: incidencia.value.descripcionIncidencia,
    correoDestinatario: incidencia.value.correoDestinatario
  };

 
  try 
  {
    const message = await IncidenciaService.crearIncidencia(incidenciaJson);
    console.log('Respuesta del servidor:', message);

    // Limpiar los campos del formulario
    incidencia.value = 
    {
      numeroAula: '',
      correoDocente: '',
      descripcionIncidencia: '',
      correoDestinatario: ''
    };
  } 
  catch (error)
  {
    console.error('Error al registrar la incidencia:', error);
    
  }
};

</script>

<template>
  <div class="contenedor-formulario">
    <h1>Registro de Incidencias</h1>
    <form @submit.prevent="enviarFormulario"> 
      <div class="cajas-formulario">
        <label for="numeroAula">Número de Aula <span class="required">*</span></label>
        <input
          type="text"
          id="numeroAula"
          v-model="incidencia.numeroAula"
          placeholder="Tu respuesta"
          required
        />
      </div>

      <div class="cajas-formulario">
        <label for="correoDocente">Correo del Docente <span class="required">*</span></label>
        <input
          type="email"
          id="correoDocente"
          v-model="incidencia.correoDocente"
          placeholder="Tu correo"
          required
        />
      </div>

      <div class="cajas-formulario">
        <label for="descripcionIncidencia">Descripción de Incidencia <span class="required">*</span></label>
        <textarea
          id="descripcionIncidencia"
          v-model="incidencia.descripcionIncidencia"
          placeholder="Tu respuesta"
          required
        ></textarea>
      </div>

      <div class="cajas-formulario">
        <label for="correoDestinatario">Correo del destinatario <span class="required">*</span></label>
        <input
          type="email"
          id="correoDestinatario"
          v-model="incidencia.correoDestinatario"
          placeholder="Correo destinatario"
          required
        />
      </div>

      <div class="cajas-formulario">
        <button type="submit">Crear Incidencia</button>
      </div>

    </form>
  </div>
</template>

<style scoped>
body {
    font-family: Arial, sans-serif;
    background-color: #f9f9f9;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.contenedor-formulario {
    background: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    margin: auto;   
}

.contenedor-formulario h1 {
    padding-bottom: 20px ;
    font-size: 20px;
    margin-bottom: 20px;
    text-align: center;
    color: #007bff;
    font-weight: bold;
}

.cajas-formulario {
    margin-bottom: 15px;
}

.cajas-formulario label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #007bff;
}

.cajas-formulario input,
.cajas-formulario textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.cajas-formulario input:focus,
.cajas-formulario textarea:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

.cajas-formulario textarea {
    resize: vertical;
    height: 100px;
}

.cajas-formulario button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
}

.cajas-formulario button:hover {
    background-color: #0056b3;
}

.required {
    color: red;
}
</style>
