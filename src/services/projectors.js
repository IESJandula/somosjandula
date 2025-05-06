/*import { obtenerTokenJWTValido } from '@/services/firebaseService';
//import constants from '../utils/constants.js';

export const fetchEventsOverView = async (toastMessage, toastColor, isToastOpen) =>
    {
        const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;
    
        const respuesta = await fetch('http://localhost:8086/projectors/events-overview',
        {
            method: 'GET',
            headers:
            {
                'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
            }
        }).then(res => res.json());

        console.log( "Respuesta de servicio: " + respuesta );

        return respuesta;a
};*/