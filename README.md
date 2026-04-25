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