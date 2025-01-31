export function crearToast(toastMessage, toastColor, isToastOpen, tipo, mensaje)
{
    toastMessage.value = mensaje;
    toastColor.value = tipo;
    isToastOpen.value = true;
}