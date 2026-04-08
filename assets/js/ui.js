"use strict";
import { obtenerResultadosDesdeAPI } from './api.js'

const buscador = document.querySelector(".buscador__input")
const checkboxes = document.querySelectorAll(".filtros__checkbox")
const contenedorPrincipal = document.querySelector("main");
let temporizadorDebouncer;

const renderizarResultados = (resultados) => {

}

const gestionarBusqueda = () => {
    clearTimeout(temporizadorDebouncer)

    const textoBusqueda = buscador.value.trim()
    const categoriasActivas = [...checkboxes].filter(checkbox => checkbox.checked).map(checkbox => checkbox.dataset.categoria)

    if (textoBusqueda.length === 0) {
        return;
    }

    temporizadorDebouncer = setTimeout(async () =>{
        const resultados = await obtenerResultadosDesdeAPI(textoBusqueda, categoriasActivas);
        renderizarResultados(resultados)
    },500)

}

const inicializar = () =>{
    buscador.addEventListener("input",gestionarBusqueda)

    checkboxes.forEach(checkbox =>{
        checkbox.addEventListener("change",gestionarBusqueda)
    })
}



inicializar()

















console.log(checkboxes)
