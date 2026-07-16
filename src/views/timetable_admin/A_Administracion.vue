<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="form-wrapper">
    <div class="form-container">
      <div class="title-container">
        <h1 class="title">Administración</h1>
      </div>
      <p class="info-text">
        La gestión de constantes se ha unificado en la página de administración de Firebase.
        Desde allí puedes obtener y actualizar las constantes de todos los proyectos (incluido
        <strong>schoolManager</strong>) en una única tarjeta.
      </p>
      <ion-button expand="block" color="primary" @click="irAGestionConstantes">
        Ir a gestión de constantes
      </ion-button>
    </div>
  </div>
</template>

<script setup>
import { IonButton } from "@ionic/vue";
import { useRouter } from "vue-router";

const router = useRouter();

const irAGestionConstantes = () => {
  router.push({ name: "AdminPage" });
};
</script>

<style scoped>
.form-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.form-container {
  width: 100%;
  max-width: 400px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 20px 30px;
  margin: auto;
  font-family: "Roboto", sans-serif;
  margin-top: 2%;
}

.title-container {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  padding: 20px;
}

.title {
  margin: 0;
  font-size: 24px;
}

.info-text {
  text-align: center;
  margin-bottom: 20px;
  line-height: 1.5;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .form-container {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }

  .title {
    color: var(--text-color-dark);
  }
}

@media (max-width: 768px) {
  .form-container {
    border: 1px solid #444;
  }
}
</style>
