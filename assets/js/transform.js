const fs = require('fs');
const xml2js = require('xml2js');

const procesarCatalogo = async () => {
    try {
        const archivoXML = fs.readFileSync('../../data/juegos.xml', 'utf8');

        const parser = new xml2js.Parser({ explicitArray: false });

        const resultado = await parser.parseStringPromise(archivoXML);

        const juegosBrutos = resultado.saga.juego;

        const juegosFormateados = juegosBrutos.map(juego => ({
            id: juego.$.id,
            titulo: juego.titulo,
            desarrolladora: juego.desarrolladora,
            publicadora: juego.publicadora,
            plataforma: juego.plataforma,
            anio: Number(juego.anio),
            puntuacion: Number(juego.puntuacion)
        }));

        fs.writeFileSync(
            './data/juegos.json',
            JSON.stringify(juegosFormateados, null, 2)
        );

        generarCSV(juegosFormateados);

    } catch (error) {
        console.error('Error al procesar el XML:', error);
    }
};

const generarCSV = (datos) => {
    const cabeceras = "ID,Título,Desarrolladora,Publicadora,Plataforma,Año,Puntuación\n";

    const filas = datos.map(juego=>
        `"${juego.id}","${juego.titulo}","${juego.desarrolladora}","${juego.publicadora}","${juego.plataforma}",${juego.anio},${juego.puntuacion}`
    ).join("\n");

    fs.writeFileSync('./data/juegos.csv', cabeceras + filas);
};

procesarCatalogo();