# Proyecto: Enciclopedia Hyrule

## Descripción del proyecto

Enciclopedia Hyrule es una plataforma web diseñada para la exploración, consulta y gestión personalizada de información relativa a la saga The Legend Of Zelda. 
La aplicación actúa como un agregador de datos que combina fuentes en tiempo real y gestión de datos persistentes en la nube.

La arquitectura de la plataforma ha sido diseñada basándose en tres pilares fundamentales:

### Exploración y Recuperación de Datos Dinámicos:

La aplicación hace uso de una API REST externa (API de Zelda) para proporcionar información actualizada sobre el universo del juego. 

De la misma forma, la interfaz de búsqueda permite la consulta en tiempo real, optimizada mediante un mecanismo de debounce que minimiza la carga innecesaria de peticiones al servidor. 

Gracias a este enfoque se garantiza una experiencia de usuario fluida, adaptándose a diversos tipos de entidades del universo de The Legend Of Zelda.

### Persistencia

El proyecto emplea una arquitectura de almacenamiento de dos niveles para maximizar el rendimiento y la experiencia del usuario:

- Caché Local (localStorage): Utilizada para las consultas a la API, ya que al almacenar los resultados de búsquedas previas, se reduce la latencia y se evita el consumo innecesario de la API externa.

- Almacenamiento en la Nube (Firebase Firestore): Destinado a la gestión de favoritos del usuario, garantizando la persistencia de los datos entre diferentes sesiones y dispositivos, permitiendo al usuario construir su biblioteca personalizada sin importar el dispositivo de acceso.

### Garantía de Calidad y Validaciones

Con tal de asegurar la integridad de la información y la robustez del código, se han hecho uso de validadores de esquemas tanto para los datos JSON entrantes como para los documentos XML.

Cabe destacar que, mediante el uso de JSON Schema para validar las respuestas de la API se han conseguido evitar errores de ejecución y ha ayudado a asegurar que toda la información procesada sea consistente y válida.

## Tecnologías y herramientas

Para el desarrollo de este proyecto, he definido un stack tecnológico centrado en la eficiencia y la mínima dependencia de librerías externas.

En todo momento, mi objetivo ha sido crear una aplicación robusta que cumpla con los estándares actuales de desarrollo web, como se muestra a continuación:

### Interacción con API REST

Para la comunicación con la Zelda API, he optado por utilizar la Fetch API nativa de JavaScript, cuya implementación puedes ver en `assets/js/api.js`

- **Mi decisión**: He preferido usar fetch directamente por ser una solución nativa, lo cual mantiene el proyecto ligero y sin dependencias innecesarias.
- **Alternativa considerada**: Evalué el uso de Axios, ya que aunque es una librería muy potente y con una gestión de errores más sencilla, consideré 
que para la escala de este proyecto, fetch es más que suficiente y me permite cumplir con el objetivo de optimización sin inflar el tamaño de la aplicación.

### Procesamiento y Conversión de Datos

Para gestionar el catálogo de juegos (juegos.xml) y su posterior exportación a CSV, he tenido que tratar con diferentes formatos de intercambio de información.
Mis decisiones se basan en la legibilidad del código y la facilidad de mantenimiento.

#### Conversión XML a JSON: 

Para procesar el archivo `data/juegos.xml`, he implementado la librería `xml2js`
- **Por qué la elegí**: Al principio valoré usar DOMParser (que es nativo del navegador), pero el código para navegar por el árbol de nodos XML me resultaba demasiado verboso y propenso a errores, 
por lo que finalmente decidí integrar `xml2js` porque me permite convertir la estructura XML a un objeto JSON de forma casi directa y mucho más limpia, lo que me ha facilitado enormemente el acceso a
los atributos (como el id en la etiqueta <juego>) y a los valores anidados, dejando mi archivo `assets/js/transform.js` mucho más ordenado y fácil de leer.


- **Alternativas consideradas**:
  - DOMParser: Es nativo, lo que ahorra peso en la carga, pero tras probarlo vi que la lógica de conversión manual me obligaba a escribir demasiadas líneas de código innecesarias.
  - fast-xml-parser: Es una opción muy rápida, pero para el volumen de datos que maneja este proyecto, sin duda alguna, `xml2js` me ofrecía una sintaxis mucho más intuitiva y una integración más rápida para el desarrollo de esta entrega.
   
#### Conversión JSON a CSV

Para la exportación del catálogo a CSV, he optado por una lógica de generación de archivos propia.

- **Mi decisión**: Dado que los datos ya están estructurados como objetos JSON tras la conversión anterior, simplemente he implementado una función que mapea los campos del objeto a filas de texto separadas por comas.
- **Alternativas**: Podría haber usado `PapaParse` para garantizar que el CSV esté correctamente escapado (por si algún título de juego contuviera comas), pero dado que el catálogo es controlado y conocido, he preferido 
mantener una implementación sencilla que no dependa de librerías de terceros, manteniendo el proyecto lo más ligero posible.

### Capas del almacenamiento

He diseñado una arquitectura híbrida de almacenamiento para separar la caché del usuario de sus datos persistentes:

#### localStorage(Caché):

Lo uso exclusivamente para cachear los resultados de las búsquedas en `assets/js/api.js`
Consideré que es la solución ideal para hacer las búsquedas rápidas y eficiente, con tal de evitar peticiones repetidas a la API.
Finalmente, cabe destacar que descarté sessionStorage porque quería que la caché fuera persistente.

#### Firebase Firestore

Lo utilizo para guardar los favoritos del usuario (configurado en `assets/js/firebase.js`)

A diferencia de localStorage, Firestore me permite sincronizar los datos en la nube, garantizando que el usuario pueda ver sus favoritos desde cualquier dispositivo.

Cabe destacar que actualmente opero en "modo test". Soy consciente de que en un entorno de producción real, esto requeriría configurar reglas de seguridad avanzadas en la consola de Firebase
para restringir el acceso a los datos únicamente al usuario propietario de la cuenta.

#### Tecnologías de validación

Con el fin de asegurar que los datos recibidos son acorde al formato requerido he utilizado:

- **JSON Schema**: He creado `schemas/entidad_schema.json` para validar la respuesta de la Zelda API. 
Esto me asegura que, si la API cambia o falla, mi código reciba exactamente lo que espera (name, description, etc.).

- **XSD (XML Schema Definition)**: He vinculado `data/juegos.xsd` con el archivo XML original usando `xsi:noNamespaceSchemaLocation`.
Esto me permite validar que el catálogo de juegos cumpla con los tipos de datos correctos (como xs:integer para los años y puntuaciones), algo que no podría hacer tan fácilmente sin este esquema.

## La Zelda API

Para dar vida a la enciclopedia y permitir que el usuario explore el universo de Zelda, he integrado la [API de Zelda](https://zelda.fanapis.com/). 
Mi decisión de utilizar esta API ha sido principalmente a que es un servicio RESTful bien estructurado, lo que me ha permitido consumir recursos de manera sencilla y dinámica.

### Implementación y arquitectura de consulta

He implementado el consumo de la API en el archivo `assets/js/api.js.`
En lugar de crear funciones aisladas para cada tipo de entidad, he diseñado una arquitectura de consulta flexible, explicada a continuación:

- **Implementación de endpoints**: A diferencia de una implementación básica, he implementado todos los endpoints de categorías disponibles (personajes, monstruos, objetos, juegos, etc.). 
Esto lo logré parametrizando la URL base en mis funciones de fetch, lo que permite que la aplicación escale si decido añadir más tipos de datos en el futuro sin tener que reescribir la lógica de la consulta a la API


- **Uso de parámetros**: He aprovechado la capacidad de la API para filtrar resultados mediante el uso de los template strings en mis peticiones fetch, gestiono la búsqueda en tiempo real y el filtrado por nombre, optimizando el tráfico de red de la API.

### Gestión de estado y errores

Para cumplir con los criterios de calidad, he pulido la interacción con la API con tal de que el usuario nunca vea una pantalla en blanco si algo falla:

- **Async/Await**:Toda la interacción es asíncrona, lo que evita que la interfaz se bloquee mientras espero la respuesta del servidor.


- **Gestión de errores**: He implementado bloques try/catch en mis llamadas, ya que si la API devuelve un código de error (como un 404 Not Found al no hallar una entidad o un 500 por fallo del servidor),
mi código intercepta la respuesta y muestra un mensaje de error claro en la interfaz (a través de ui.js), asegurando una experiencia amigable con el usuario.

## Formato de datos

En este proyecto, he trabajado con tres tipos de formatos fundamentales para el intercambio de información: JSON, XML y CSV.

### JSON

Es el formato que utilizo como "idioma nativo" dentro de la aplicación el cual se caracteriza por ser ligero, basado en texto y estructurado en pares clave-valor.

Lo he empleado en el proyecto principalmente porque es el formato estándar de la Zelda API, ya que al ser un objeto nativo de JavaScript, su integración es inmediata, sin necesidad de parseos complejos.

De la misma forma, lo he utilizado para la comunicación con la API externa y como formato intermedio tras convertir el XML.
Gracias a su estructura, me ha permitido manipular los datos de forma directa en mi código, lo que ha mejorado considerablemente la velocidad de respuesta de la interfaz.

### XML

A diferencia de JSON, es mucho más descriptivo y está diseñado no solo para el transporte de datos, sino para la estructuración de documentos.

Lo he usado en el proyecto en el archivo `data/juegos.xml` para almacenar información del catálogo de juegos.
Aunque es más verboso, su capacidad de validación mediante XSD me permite asegurar que los datos del catálogo siempre tengan 
la estructura correcta antes de procesarlos. 

### CSV

Es el formato de texto más sencillo, donde los datos se organizan en filas y columnas separadas por comas.

En el proyecto lo he destinado exclusivamente a la exportación de datos, principalmente porque aunque JSON y XML son mejores 
para el intercambio de datos entre sistemas, el CSV es el rey en cuanto a la experiencia con el usuario final, ya que permite que el
catálogo se descargue en formato CSV, garantizando que cualquier usuario pueda abrir los datos en programas como Microsoft Excel o Google Sheets sin 
necesidad de tener conocimientos técnicos.
