"use strict";

const URL_BASE = "https://docs.zelda.fanapis.com/api/"

export const obtenerResultadosDesdeAPI = async(texto,categorias) =>{
    const termino = texto.toLowerCase().trim();

    const promesasResultado = categorias.map(async (categoria) =>{
        const claveCache = `${categoria}-${termino}`;
        const datosCache = localStorage.getItem(claveCache)

        if (datosCache) {
            return {categoria, resultados: JSON.parse(datosCache) };
        }
        
        try{
            const respuesta = await fetch(`${URL_BASE}${categoria}?name=${termino}`);

            if (!respuesta.ok) throw new Error(`Error en la red al pedir ${categoria}`);

            const dataJSON = await respuesta.json();
            const resultados = dataJSON.data || [];

            localStorage.setItem(claveCache, JSON.stringify(resultados));

            return { categoria, resultados };
            
        }
        catch (e) {
            return { categoria, resultados: [], error: true };
        }
    })
    return await Promise.all(promesasResultado);
}