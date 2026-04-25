"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBEzm3LX42yBosp9Tjv40FGKIP-z-RBs_4",
  authDomain: "enciclopediahyrule.firebaseapp.com",
  projectId: "enciclopediahyrule",
  storageBucket: "enciclopediahyrule.firebasestorage.app",
  messagingSenderId: "434653160272",
  appId: "1:434653160272:web:4a5c039280513a7d0c8255",
  measurementId: "G-KE963HL6DC",
};

const app = initializeApp(firebaseConfig);
const bd = getFirestore(app);

const categoriasTraducidas = {
  games: "juegos",
  staff: "staff",
  characters: "personajes",
  monsters: "monstruos",
  bosses: "jefes",
  dungeons: "mazmorras",
  places: "lugares",
  items: "objetos",
};

/**
 * Guarda un nuevo elemento en la colección de "favoritos" en Firebase Firestore.
 * @async
 * @param {string} id - El ID único del elemento (tarjeta) de la API.
 * @param {string} categoria - La categoría a la que pertenece el elemento.
 * @param {string} nombre - El nombre del elemento.
 */
export const guardarFavoritos = async (id, categoria, nombre) => {
  await addDoc(collection(bd, "favoritos"), {
    tarjetaId: id,
    categoria: categoria,
    nombre: nombre,
    fecha: new Date(),
  });
};

/**
 * Obtiene todos los elementos guardados en la colección de "favoritos" de Firebase Firestore.
 * @async
 * @returns {Promise<Array<Object>>} Promesa que contiene un array de objetos con los datos de los favoritos.
 */
export const obtenerFavoritos = async () => {
  const favoritos = await getDocs(collection(bd, "favoritos"));
  return favoritos.docs.map((favorito) => favorito.data());
};

/**
 * Elimina un elemento específico de la colección de "favoritos" en Firebase buscando por su `tarjetaId`.
 * @async
 * @param {string} id - El ID del elemento (tarjeta) que se desea eliminar.
 */
export const eliminarFavorito = async (id) => {
  const favoritos = await getDocs(collection(bd, "favoritos"));
  for (const documento of favoritos.docs) {
    if (documento.data().tarjetaId === id) {
      await deleteDoc(doc(bd, "favoritos", documento.id));
    }
  }
};

/**
 * Renderiza los elementos favoritos en el DOM.
 * Filtra, ordena y hace peticiones a la API externa para obtener los datos completos de cada favorito.
 * @async
 * Modifica el DOM insertando las tarjetas de favoritos o un mensaje si está vacío.
 */
const renderizarFavoritos = async () => {
  const contenedorPrincipal = document.querySelector("#contenedor-favoritos");
  if (!contenedorPrincipal) return;
  contenedorPrincipal.innerHTML = "";

  let listaFavoritos = await obtenerFavoritos();

  const checkboxes = document.querySelectorAll(".filtros__checkbox");
  const categoriasActivas = [...checkboxes]
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.dataset.categoria);

  if (categoriasActivas.length > 0) {
    listaFavoritos = listaFavoritos.filter((fav) =>
      categoriasActivas.includes(fav.categoria),
    );
  }

  if (listaFavoritos.length === 0) {
    const articulo = document.createElement("article");
    articulo.classList.add("mensaje-favoritos-vacio");

    const titulo = document.createElement("h2");
    titulo.classList.add("mensaje-favoritos-vacio__titulo");
    titulo.textContent = "Aún no tienes favoritos guardados";

    const descripcion = document.createElement("p");
    descripcion.classList.add("mensaje-favoritos-vacio__texto");
    descripcion.textContent =
      "¿A qué esperas para añadir tus favoritos?.\n¡Estás a un solo clic de hacerlo realidad!";

    articulo.append(titulo);
    articulo.append(descripcion);
    contenedorPrincipal.append(articulo);
    return;
  }

  const selectOrden = document.querySelector(".controles__select");
  const orden = selectOrden ? selectOrden.value : "fecha-desc";

  listaFavoritos.sort((a, b) => {
    if (orden === "fecha-desc") return b.fecha.toMillis() - a.fecha.toMillis();
    if (orden === "fecha-asc") return a.fecha.toMillis() - b.fecha.toMillis();
    if (orden === "nombre-asc") return a.nombre.localeCompare(b.nombre);
    if (orden === "nombre-desc") return b.nombre.localeCompare(a.nombre);
    return 0;
  });

  const seccionUnica = document.createElement("section");
  seccionUnica.classList.add("contenedor-tarjetas-unico");

  for (const fav of listaFavoritos) {
    try {
      const respuesta = await fetch(
        `https://zelda.fanapis.com/api/${fav.categoria}/${fav.tarjetaId}`,
      );
      const json = await respuesta.json();

      if (json.success && json.data) {
        const objeto = json.data;

        const tarjeta = document.createElement("article");
        tarjeta.classList.add("tarjeta");

        const nombre = document.createElement("h3");
        nombre.classList.add("tarjeta__nombre");
        nombre.textContent = objeto.name;

        const descripcion = document.createElement("p");
        descripcion.classList.add("tarjeta__descripcion");

        let contenido = "";
        contenido += `Categoría: ${categoriasTraducidas[fav.categoria].toUpperCase()}<br><br>`;

        if (objeto.description) contenido += `${objeto.description}<br><br>`;
        if (fav.categoria === "games") {
          if (objeto.developer)
            contenido += `Desarrolladora: ${objeto.developer}<br>`;
          if (objeto.publisher)
            contenido += `Publicadora: ${objeto.publisher}<br>`;
          if (objeto.released_date)
            contenido += `Lanzamiento: ${objeto.released_date}<br>`;
        }
        if (fav.categoria === "staff") {
          if (objeto.role) contenido += `Rol: ${objeto.role}<br>`;
          if (objeto.worked_on && objeto.worked_on.length > 0)
            contenido += `Proyectos: ${objeto.worked_on.length}<br>`;
        }
        if (fav.categoria === "characters") {
          if (objeto.gender) contenido += `Género: ${objeto.gender}<br>`;
          if (objeto.race && objeto.race.trim() !== "")
            contenido += `Raza: ${objeto.race}<br>`;
        }
        if (fav.categoria === "bosses") {
          if (objeto.dungeons && objeto.dungeons.length > 0)
            contenido += `Mazmorras: ${objeto.dungeons.length}<br>`;
        }
        if (fav.categoria === "places") {
          if (objeto.inhabitants && objeto.inhabitants.length > 0)
            contenido += `Habitantes: ${objeto.inhabitants.length} conocidos<br>`;
        }
        if (objeto.appearances && objeto.appearances.length > 0) {
          contenido += `Apariciones: ${objeto.appearances.length} juegos<br>`;
        } else if (objeto.games && objeto.games.length > 0) {
          contenido += `Apariciones: ${objeto.games.length} juegos<br>`;
        }

        descripcion.innerHTML = contenido;

        const boton = document.createElement("button");
        boton.classList.add("tarjeta__boton-favorito");
        boton.dataset.id = objeto.id;
        boton.textContent = "Eliminar de favoritos";

        boton.addEventListener("click", async () => {
          await eliminarFavorito(objeto.id);
          renderizarFavoritos();
        });

        tarjeta.append(nombre);
        tarjeta.append(descripcion);
        tarjeta.append(boton);
        seccionUnica.append(tarjeta);
      }
    } catch (error) {
      console.error(
        `Error al obtener los datos del ID ${fav.tarjetaId}:`,
        error,
      );
    }
  }

  contenedorPrincipal.append(seccionUnica);
};

/**
 * Elimina absolutamente todos los documentos de la colección de "favoritos" en Firebase y actualiza la vista.
 * @async
 */
export const vaciarFavoritos = async () => {
  const favoritos = await getDocs(collection(bd, "favoritos"));
  const promesasBorrado = favoritos.docs.map((documento) =>
    deleteDoc(doc(bd, "favoritos", documento.id)),
  );
  await Promise.all(promesasBorrado);

  await renderizarFavoritos();
};

/**
 * Inicializa el módulo de favoritos. Configura los listeners de eventos para filtros, ordenación
 * y el botón de vaciar, y ejecuta la primera renderización de la lista.
 */
const inicializarModuloFavoritos = () => {
  renderizarFavoritos();

  const botonVaciar = document.querySelector(".cabecera-favoritos__boton");
  if (botonVaciar) {
    botonVaciar.addEventListener("click", vaciarFavoritos);
  }

  const checkboxes = document.querySelectorAll(".filtros__checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", renderizarFavoritos);
  });

  const selectOrden = document.querySelector(".controles__select");
  if (selectOrden) {
    selectOrden.addEventListener("change", renderizarFavoritos);
  }
};

inicializarModuloFavoritos();

const botonVaciar = document.querySelector(".cabecera-favoritos__boton");
if (botonVaciar) {
  botonVaciar.addEventListener("click", vaciarFavoritos);
}
