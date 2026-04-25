"use strict";

const URL_BASE = "https://zelda.fanapis.com/api/";

/**
 * Obtiene los resultados de búsqueda desde la API de Zelda o desde el localStorage si están cacheados.
 * @async
 * @param {string} texto - El término de búsqueda introducido por el usuario.
 * @param {string[]} categorias - Un array con los nombres de las categorías seleccionadas para la búsqueda.
 * @returns {Promise<Array<{categoria: string, resultados: Array<Object>, error?: boolean}>>} Promesa que resuelve a un array de objetos con la categoría y sus respectivos resultados (o un indicador de error).
 */
export const obtenerResultadosDesdeAPI = async (texto, categorias) => {
  const termino = texto.trim();

  const promesasResultado = categorias.map(async (categoria) => {
    const claveCache = `${categoria}-${termino}`;
    const datosCache = localStorage.getItem(claveCache);

    if (datosCache) {
      return { categoria, resultados: JSON.parse(datosCache) };
    }

    try {
      const respuesta = await fetch(`${URL_BASE}${categoria}?name=${termino}`);

      if (!respuesta.ok)
        throw new Error(`Error en la red al pedir ${categoria}`);

      const dataJSON = await respuesta.json();
      const resultados = dataJSON.data || [];

      localStorage.setItem(claveCache, JSON.stringify(resultados));

      return { categoria, resultados };
    } catch (e) {
      return { categoria, resultados: [], error: true };
    }
  });
  return await Promise.all(promesasResultado);
};
