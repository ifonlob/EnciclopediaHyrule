"use strict";

const renderizarCatalogo = async () => {
    const contenedor = document.querySelector(".contenedor-catalogo")
    if(!contenedor) return

    try{
        const respuesta = await fetch('./data/juegos.json')

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el archivo juegos.json");
        }

        const juegos = await respuesta.json();

        contenedor.innerHTML = "";

        juegos.forEach(juego =>{
            const tarjeta = document.createElement('article');
            tarjeta.classList.add("tarjeta");

            const nombre = document.createElement('h3');
            nombre.classList.add("tarjeta__nombre");
            nombre.textContent = juego.titulo;

            const descripcion = document.createElement('p');
            descripcion.classList.add("tarjeta__descripcion");

            descripcion.innerHTML = `
                <strong>ID:</strong> ${juego.id}<br><br>
                Desarrolladora: ${juego.desarrolladora}<br>
                Publicadora: ${juego.publicadora}<br>
                Plataforma: ${juego.plataforma}<br>
                Año: ${juego.anio}<br>
                Puntuación: ${juego.puntuacion}
            `;

            tarjeta.append(nombre);
            tarjeta.append(descripcion);
            contenedor.append(tarjeta);

        })
    }
    catch (error){
        console.error('Error al cargar el catálogo:', error);
    }
}

renderizarCatalogo()