import { ref, computed } from 'vue'
import { obtenerConstantes } from '@/services/constantes'
import { schoolmanagerApiUrl } from '@/environment/apiUrls.ts'

const constantes = ref([])

export function useConstanteSolicitudes() {
    const isDeshabilitada = computed(() => {
        const c = constantes.value.find(c => c.clave === 'Selección horarios por claustro')
        return !!(c && c.valor && c.valor.trim() !== '')
    })

    async function cargar() {
        try {
            const datos = await obtenerConstantes(
                schoolmanagerApiUrl + "/schoolManager/constants"
            )
            console.log('[useConstanteSolicitudes] constantes:', datos)
            constantes.value = datos
        } catch (err) {
            console.error('[useConstanteSolicitudes] error cargando constantes:', err)
        }
    }

    return { isDeshabilitada, cargar }
}