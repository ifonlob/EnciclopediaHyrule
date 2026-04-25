"use strict";
import { obtenerResultadosDesdeAPI } from './api.js'
import { guardarFavoritos,eliminarFavorito,obtenerFavoritos} from './firebase.js';

const buscador = document.querySelector(".buscador__input")
const checkboxes = document.querySelectorAll(".filtros__checkbox")
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
    const categorias = [".games", ".staff", ".characters", ".monsters", ".bosses", ".dungeons", ".places", ".items"];

    categorias.forEach(selector => {
        const section = document.querySelector(selector);
        if (section) {
            section.innerHTML = "";
            section.classList.add("oculto");
        }
    });
};

const renderizarResultados = async (resultado) => {
    limpiarSecciones()

    let listaFavoritosInicial = []
    listaFavoritosInicial = await obtenerFavoritos()

    resultado.forEach(({categoria, resultados}) =>{
        const contenedorDestino = document.querySelector(`.${categoria}`);

        if(contenedorDestino && resultados.length > 0){
            contenedorDestino.classList.remove("oculto");
            const h2 = document.createElement("h2");
            h2.classList.add("seccion__titulo");
            h2.textContent = categoriasTraducidas[categoria].toUpperCase();
            contenedorDestino.append(h2);

            resultados.forEach(objeto => {
                    const tarjeta = document.createElement('article')
                    tarjeta.classList.add("tarjeta");

                    const nombre = document.createElement('h3');
                    nombre.classList.add("tarjeta__nombre");
                    nombre.textContent = objeto.name;

                    const descripcion = document.createElement('p')
                    descripcion.classList.add("tarjeta__descripcion")

                    let contenido = "";

                    /* =========================
                       1. COMÚN A CASI TODOS
                       ========================= */
                    if (objeto.description) {
                        contenido += `${objeto.description}<br><br>`;
                    }

                    /* =========================
                       2. ESPECÍFICO POR CATEGORÍA
                       ========================= */

                    if (categoria === "games") {
                        if (objeto.developer) contenido += `Desarrolladora: ${objeto.developer}<br>`;
                        if (objeto.publisher) contenido += `Publicadora: ${objeto.publisher}<br>`;
                        if (objeto.released_date) contenido += `Lanzamiento: ${objeto.released_date}<br>`;
                    }

                    if (categoria === "staff") {
                        if (objeto.role) contenido += `Rol: ${objeto.role}<br>`;

                        if (objeto.worked_on && objeto.worked_on.length > 0) {
                            contenido += `Proyectos en los que trabajó: ${objeto.worked_on.length}<br>`;
                        }
                    }

                    if (categoria === "characters") {
                        if (objeto.gender) contenido += `Género: ${objeto.gender}<br>`;
                        if (objeto.race && objeto.race.trim() !== "") {
                            contenido += `Raza: ${objeto.race}<br>`;
                        }
                    }

                    if (categoria === "bosses") {
                        if (objeto.dungeons && objeto.dungeons.length > 0) {
                            contenido += `Mazmorras: ${objeto.dungeons.length}<br>`
                        }
                    }

                    if (categoria === "places") {
                        if (objeto.inhabitants && objeto.inhabitants.length > 0) {
                            contenido += `Habitantes: ${objeto.inhabitants.length} conocidos<br>`
                        }
                    }

                    /* =========================
                       3. CONTADOR GLOBAL DE JUEGOS
                       ========================= */

                    if (objeto.appearances && objeto.appearances.length > 0) {
                        contenido += `Apariciones: ${objeto.appearances.length} juegos<br>`
                    } else if (objeto.games && objeto.games.length > 0) {
                        contenido += `Apariciones: ${objeto.games.length} juegos<br>`
                    }

                    descripcion.innerHTML = contenido;

                    const boton = document.createElement("button")
                    boton.classList.add("tarjeta__boton-favorito")
                    boton.dataset.id = objeto.id
                    boton.dataset.categoria = categoria

                    const yaEsFavorito = listaFavoritosInicial.some(fav => fav.tarjetaId === objeto.id);

                    if(yaEsFavorito){
                        boton.textContent = "Eliminar de favoritos"
                    }
                    else{
                        boton.textContent = "Añadir a favoritos"
                    }

                    boton.addEventListener("click", async () => {
                        const favsActualizados = await obtenerFavoritos()
                        const esFavAhora = favsActualizados.some(fav => fav.tarjetaId === objeto.id)
                        if(esFavAhora){
                            await eliminarFavorito(objeto.id)
                            boton.textContent = "Añadir a Favoritos"
                        }
                        else{
                            await guardarFavoritos(objeto.id, categoria, objeto.name);
                            boton.textContent = "Eliminar de favoritos";
                        }
                    });

                    tarjeta.append(nombre)
                    tarjeta.append(descripcion)
                    tarjeta.append(boton)
                    contenedorDestino.append(tarjeta)
                }
            )
        }
    }

    )
}

const mostrarMensajeBusquedaVacia = () => {
    const seccionMensaje = document.querySelector(".mensaje-busqueda-vacia")
    const introduccion = document.querySelector(".introduccion");

    if (!seccionMensaje) {
        const seccion = document.createElement("section");
        seccion.classList.add("mensaje-busqueda-vacia");

        const titulo = document.createElement("h3");
        titulo.classList.add("mensaje-busqueda-vacia__titulo");
        titulo.textContent = "¡Explora los secretos de Hyrule!";

        const texto = document.createElement("p");
        texto.classList.add("mensaje-busqueda-vacia__texto");
        texto.textContent = "Utiliza el buscador de la cabecera para encontrar personajes, objetos, lugares y mucho más. ¿A qué esperas?";

        seccion.append(titulo);
        seccion.append(texto);

        if (introduccion) {
            introduccion.after(seccion);
        }
    } else {
        seccionMensaje.classList.remove("oculto");
    }
};

const ocultarMensajeBusquedaVacia = () =>{
    const seccionMensaje = document.querySelector(".mensaje-busqueda-vacia")
    if (seccionMensaje) {
        seccionMensaje.classList.add("oculto");
    }
}

const gestionarBusqueda = () => {
    clearTimeout(temporizadorDebouncer)

    const textoBusqueda = buscador.value.trim()
    let categoriasActivas = [...checkboxes].filter(checkbox => checkbox.checked).map(checkbox => checkbox.dataset.categoria)

    if (categoriasActivas.length === 0) {
        categoriasActivas = [...checkboxes].map(checkbox => checkbox.dataset.categoria);
    }

    if (textoBusqueda.length === 0) {
        limpiarSecciones()
        mostrarMensajeBusquedaVacia()
        return;
    }

    ocultarMensajeBusquedaVacia()

    temporizadorDebouncer = setTimeout(async () =>{
        const resultado = await obtenerResultadosDesdeAPI(textoBusqueda, categoriasActivas);
        console.log(resultado)
        await renderizarResultados(resultado)
    },500)

}

const mostrarErrorAPI = (hayError) =>{
    let contenedorError = document.querySelector(".buscador__error")

    if(!contenedorError){
        contenedorError = document.createElement("p")
        contenedorError.classList.add("buscador__error")
        contenedorError.textContent = "Error con la conexión con la API"

        const navBuscador = document.querySelector(".cabecera__buscador")
        if(navBuscador) navBuscador.append(contenedorError)
    }

    if(hayError){
        contenedorError.classList.remove("oculto")
    }
    else{
        contenedorError.classList.add("oculto")
    }
}

const inicializar = () => {
        buscador.addEventListener("input", gestionarBusqueda);
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener("change", gestionarBusqueda);
        });
        gestionarBusqueda();
};




inicializar()
