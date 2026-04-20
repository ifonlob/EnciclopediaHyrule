"use strict"

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js"
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js"

const firebaseConfig = {
    apiKey: "AIzaSyBEzm3LX42yBosp9Tjv40FGKIP-z-RBs_4",
    authDomain: "enciclopediahyrule.firebaseapp.com",
    projectId: "enciclopediahyrule",
    storageBucket: "enciclopediahyrule.firebasestorage.app",
    messagingSenderId: "434653160272",
    appId: "1:434653160272:web:4a5c039280513a7d0c8255",
    measurementId: "G-KE963HL6DC"
}

const app = initializeApp(firebaseConfig)
const bd = getFirestore(app)

const categoriasTraducidas = {
    "games": "juegos", "staff": "staff", "characters": "personajes",
    "monsters": "monstruos", "bosses": "jefes", "dungeons": "mazmorras",
    "places": "lugares", "items": "objetos"
}


export const guardarFavoritos = async(id, categoria,nombre) => {
    await addDoc(collection(bd, "favoritos"),{
        tarjetaId : id,
        categoria : categoria,
        nombre : nombre,
        fecha : new Date()
    })
}

export const obtenerFavoritos = async() =>{
    const favoritos = await getDocs(collection(bd,"favoritos"))
    return favoritos.docs.map(favorito => favorito.data())
}

export const eliminarFavorito = async(id) =>{
    const favoritos = await getDocs(collection(bd,"favoritos"))
    for(const documento of favoritos.docs){
        if(documento.data().tarjetaId === id){
            await deleteDoc(doc(bd,"favoritos",documento.id))
        }
    }
}

const renderizarFavoritos = async () => {
    const contenedorPrincipal = document.querySelector("#contenedor-favoritos")
    if (!contenedorPrincipal) return;
    contenedorPrincipal.innerHTML = ""

    let listaFavoritos = await obtenerFavoritos()

    if (listaFavoritos.length === 0) {
        const articulo = document.createElement('article');
        articulo.classList.add('mensaje-favoritos-vacio');

        const titulo = document.createElement('h2');
        titulo.classList.add('mensaje-favoritos-vacio__titulo');

        const descripcion = document.createElement('p');
        descripcion.classList.add('mensaje-favoritos-vacio__texto');

        titulo.textContent = "Aún no tienes favoritos guardados";
        descripcion.textContent = "¿A qué esperas para añadir tus favoritos?.\n¡Estás a un solo clic de hacerlo realidad!";

        articulo.append(titulo);
        articulo.append(descripcion);
        contenedorPrincipal.append(articulo);

        return;
    }

    const favoritosAgrupados = {}
    listaFavoritos.forEach(fav => {
        if (!favoritosAgrupados[fav.categoria]) {
            favoritosAgrupados[fav.categoria] = []
        }

        if (!favoritosAgrupados[fav.categoria].includes(fav.tarjetaId)) {
            favoritosAgrupados[fav.categoria].push(fav.tarjetaId)
        }
    })

    for (const categoria in favoritosAgrupados) {
        const ids = favoritosAgrupados[categoria]

        const seccion = document.createElement("section")
        seccion.classList.add(categoria)

        const h2 = document.createElement("h2")
        h2.classList.add("seccion__titulo")
        h2.textContent = categoriasTraducidas[categoria].toUpperCase()
        contenedorPrincipal.append(h2)

        for (const id of ids) {
            try {
                const respuesta = await fetch(`https://zelda.fanapis.com/api/${categoria}/${id}`)
                const json = await respuesta.json()

                if (json.success && json.data) {
                    const objeto = json.data

                    const tarjeta = document.createElement('article')
                    tarjeta.classList.add("tarjeta")

                    const nombre = document.createElement('h3')
                    nombre.classList.add("tarjeta__nombre")
                    nombre.textContent = objeto.name

                    const descripcion = document.createElement('p')
                    descripcion.classList.add("tarjeta__descripcion")

                    let contenido = ""

                    if (objeto.description) contenido += `${objeto.description}<br><br>`
                    if (categoria === "games") {
                        if (objeto.developer) contenido += `Desarrolladora: ${objeto.developer}<br>`
                        if (objeto.publisher) contenido += `Publicadora: ${objeto.publisher}<br>`
                        if (objeto.released_date) contenido += `Lanzamiento: ${objeto.released_date}<br>`
                    }
                    if (categoria === "staff") {
                        if (objeto.role) contenido += `Rol: ${objeto.role}<br>`
                        if (objeto.worked_on && objeto.worked_on.length > 0) contenido += `Proyectos: ${objeto.worked_on.length}<br>`
                    }
                    if (categoria === "characters") {
                        if (objeto.gender) contenido += `Género: ${objeto.gender}<br>`
                        if (objeto.race && objeto.race.trim() !== "") contenido += `Raza: ${objeto.race}<br>`
                    }
                    if (categoria === "bosses") {
                        if (objeto.dungeons && objeto.dungeons.length > 0) contenido += `Mazmorras: ${objeto.dungeons.length}<br>`
                    }
                    if (categoria === "places") {
                        if (objeto.inhabitants && objeto.inhabitants.length > 0) contenido += `Habitantes: ${objeto.inhabitants.length} conocidos<br>`
                    }
                    if (objeto.appearances && objeto.appearances.length > 0) {
                        contenido += `Apariciones: ${objeto.appearances.length} juegos<br>`
                    } else if (objeto.games && objeto.games.length > 0) {
                        contenido += `Apariciones: ${objeto.games.length} juegos<br>`
                    }

                    descripcion.innerHTML = contenido

                    const boton = document.createElement("button")
                    boton.classList.add("tarjeta__boton-favorito")
                    boton.dataset.id = objeto.id
                    boton.textContent = "Eliminar de favoritos"

                    boton.addEventListener("click", async () => {
                        await eliminarFavorito(objeto.id)
                        renderizarFavoritos()
                    })

                    tarjeta.append(nombre)
                    tarjeta.append(descripcion)
                    tarjeta.append(boton)
                    seccion.append(tarjeta)
                }
            } catch (error) {
                console.error(`Error al obtener los datos del ID ${id}:`, error)
            }
        }

        if (seccion.children.length > 0) {
            contenedorPrincipal.append(seccion)
        }
    }
}

export const vaciarFavoritos = async () =>{
    const favoritos = await getDocs(collection(bd, "favoritos"));
    const promesasBorrado = favoritos.docs.map(documento =>
        deleteDoc(doc(bd, "favoritos", documento.id))
    );
    await Promise.all(promesasBorrado);

    await renderizarFavoritos();
}

const inicializarModuloFavoritos = () => {
    renderizarFavoritos();

    const botonVaciar = document.querySelector(".cabecera-favoritos__boton");
    if (botonVaciar) {
        botonVaciar.addEventListener("click", vaciarFavoritos);
    }
}

inicializarModuloFavoritos()

const botonVaciar = document.querySelector(".cabecera-favoritos__boton");
if (botonVaciar) {
    botonVaciar.addEventListener("click", vaciarFavoritos);
}