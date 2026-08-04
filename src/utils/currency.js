// Formato español de importes: dos decimales y coma decimal (0,08)
const FORMATO_EUROS = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Formatea un importe en euros, por ejemplo "1,08 €".
 *
 * @param {number|string|null|undefined} importe importe a formatear
 * @param {string} valorPorDefecto texto a devolver cuando no hay importe (por defecto, cadena vacía)
 * @returns {string} el importe formateado o el valor por defecto
 */
export function formatearEuros(importe, valorPorDefecto = '')
{
    if (importe === null || importe === undefined || importe === '')
    {
        return valorPorDefecto;
    }

    const numero = Number(importe);

    if (!Number.isFinite(numero))
    {
        return valorPorDefecto;
    }

    return `${FORMATO_EUROS.format(numero)} €`;
}
