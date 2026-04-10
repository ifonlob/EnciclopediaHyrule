"use strict";
import { obtenerResultadosDesdeAPI } from './api.js'

const buscador = document.querySelector(".buscador__input")
const checkboxes = document.querySelectorAll(".filtros__checkbox")
const contenedorPrincipal = document.querySelector("main");
const categoriasTraducidas = {
    "games" : "juegos",
    "characters" : "personajes",
    "monsters" : "monstruos",
    "bosses" : "jefes",
    "dungeons" : "mazmorras",
    "places" : "lugares",
    "items" : "objetos"
}
let temporizadorDebouncer;

const limpiarSecciones = () => {
    const intro = document.querySelector(".introduccion");
    if (intro) intro.classList.add("oculto");

    const secciones = document.querySelectorAll("main > section");
    secciones.forEach(seccion => {
        if (!seccion.classList.contains("introduccion")) {
            while (seccion.firstChild) {
                seccion.removeChild(seccion.firstChild);
            }
        }
    });
};

const renderizarResultados = (resultado) => {
    limpiarSecciones()
    resultado.forEach(({categoria, resultados}) =>{
        const contenedorDestino = document.querySelector(`.${categoria}`);

        if(contenedorDestino && resultados.length > 0){
            const h2 = document.createElement("h2");
            h2.classList.add("seccion__titulo");
            h2.textContent = categoriasTraducidas[categoria].toUpperCase();
            contenedorDestino.appendChild(h2);

            resultados.forEach(objeto => {
                    const tarjeta = document.createElement('article')
                    tarjeta.classList.add("tarjeta");

                    const nombre = document.createElement("h3");
                    nombre.classList.add("tarjeta__nombre");
                    nombre.textContent = objeto.name;

                    const boton = document.createElement("button");
                    boton.classList.add("tarjeta__boton-favorito");
                    boton.textContent = "Añadir a Favoritos";
                    boton.dataset.id = objeto.id;

                    tarjeta.appendChild(nombre);
                    tarjeta.appendChild(boton);
                    contenedorDestino.appendChild(tarjeta);
                }
            )
        }
    }

    )


}

const gestionarBusqueda = () => {
    clearTimeout(temporizadorDebouncer)

    const textoBusqueda = buscador.value.trim()
    let categoriasActivas = [...checkboxes].filter(checkbox => checkbox.checked).map(checkbox => checkbox.dataset.categoria)

    if (categoriasActivas.length === 0) {
        categoriasActivas = [...checkboxes].map(checkbox => checkbox.dataset.categoria);
    }

    if (textoBusqueda.length === 0) {
        return;
    }

    temporizadorDebouncer = setTimeout(async () =>{
        const resultado = await obtenerResultadosDesdeAPI(textoBusqueda, categoriasActivas);
        console.log(resultado)
        renderizarResultados(resultado)
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
