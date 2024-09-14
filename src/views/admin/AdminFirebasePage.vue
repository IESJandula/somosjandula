<template>
  <div class="form-container">
    <h1 class="title">Administrar Firebase</h1>
    <div class="form-section">
      <form @submit.prevent="addUser">
        <ion-item>
          <ion-label position="stacked">UID del Usuario</ion-label>
          <ion-input v-model="uid" type="text" placeholder="Ingresa el UID"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Correo Electrónico</ion-label>
          <ion-input v-model="email" type="email" placeholder="Ingresa el correo"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Roles</ion-label>
          <ion-select v-model="selectedRoles" multiple="true" placeholder="Selecciona roles">
            <ion-select-option value="ADMINISTRADOR">ADMINISTRADOR</ion-select-option>
            <ion-select-option value="DIRECCION">DIRECCION</ion-select-option>
            <ion-select-option value="PROFESOR">PROFESOR</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-button expand="block" type="submit">Crear usuario</ion-button>
      </form>
    </div>

    <hr class="separator" />

    <div class="form-section">
      <form @submit.prevent="uploadUsers">
        <div>
          <input type="file" @change="onFileChange" />
          <ion-button expand="block" type="submit">Crear usuarios</ion-button>
        </div>
      </form>
    </div>

    <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
      @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
  </div>
</template>

<script setup>
  import { IonButton, IonLabel, IonInput, IonItem, IonSelectOption, IonSelect, IonToast } from '@ionic/vue';
  import { ref, watch, onMounted } from 'vue';
  import { getFirestore, doc, setDoc } from 'firebase/firestore';
  import { crearToast } from '@/utils/toast';
  import { firebaseColeccionUsuarios } from '@/environment/firebaseConfig';
  
  const db = getFirestore();
  
  const uid = ref('');
  const email = ref('');
  const selectedRoles = ref([]);
  
  const isToastOpen = ref(false);
  const toastMessage = ref('');
  const toastColor = ref('success');
  const users = ref([]);
    const addUser = async () =>
    {
      if (!uid.value || !email.value || selectedRoles.value.length === 0)
      {
        crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Por favor, ingresa un UID, un correo y selecciona al menos un rol.');
      }
      else
      {
        try
        {
          await crearUsuarioFirebase(uid.value, email.value, selectedRoles.value);
          crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Usuario agregado correctamente');
          uid.value = '';
          email.value = '';
          selectedRoles.value = [];
        }
        catch (error)
        {
          crearToast(toastMessage, toastColor, isToastOpen, 'danger', `Error al agregar usuario: ${error.message}`);
        }
      }
    };
  
    const onFileChange = (event) =>
    {
      const file = event.target.files[0];
      if (file)
      {
        const reader = new FileReader();
        reader.onload = (e) =>
        {
          try
          {
            users.value = JSON.parse(e.target.result);
          }
          catch (error)
          {
            crearToast(toastMessage, toastColor, isToastOpen, 'danger', `Error al leer el archivo JSON: ${error.message}`);
          }
        };
        reader.readAsText(file);
      }
    };
  
    const uploadUsers = async () =>
    {
      if (!users.value.length)
      {
        crearToast(toastMessage, toastColor, isToastOpen, 'danger', "No hay usuarios cargados para dar de alta.");
      }
      else
      {
        for (const user of users.value)
        {
          try
          {
            await crearUsuarioFirebase(user.id, user.correo, user.roles);
          }
          catch (error)
          {
            crearToast(toastMessage, toastColor, isToastOpen, 'danger', `Error al dar de alta al usuario ${user.id} debido a ${error.message}`);
          }
        }
        crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Usuarios agregados correctamente');
      }
    };
  
    const crearUsuarioFirebase = async (userId, userEmail, userRoles) =>
    {
      await setDoc(doc(db, firebaseColeccionUsuarios, userId),
      {
        email: userEmail,
        roles: userRoles
      });
    };
  </script>
  
<style scoped>
.form-container {
  width: 100%;
  max-width: 400px;
  background-color: #ffffff;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 20px 30px;
  margin: auto;
  font-family: 'Roboto', sans-serif;
  margin-top: 2%; /* Reduce el margen superior para mover la caja hacia arriba */
}

.title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 700;
  color: #3a7ca5;
}

.form-section {
  margin-bottom: 20px;
}

.separator {
  border: 0;
  height: 1px;
  background: #ccc;
  margin: 30px 0;
}

ion-item {
  margin-bottom: 15px;
}

ion-button {
  margin-top: 15px;
}
</style>
