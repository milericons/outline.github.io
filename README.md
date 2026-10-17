# Milericons

Milericons es una biblioteca de iconos SVG con una galería para explorar, buscar y copiar iconos.

## CDN

Agrega el script a tu página:

```html
<script src="https://milericons.github.io/resources.github.io/public/miller-icons.js" defer></script>
```

Luego usa un elemento con la clase `miller-icon` y el nombre del icono en `data-icon`:

```html
<span class="miller-icon" data-icon="home"></span>
<span class="miller-icon" data-icon="arrow_right"></span>
```

Los nombres corresponden al nombre del archivo SVG sin la extensión, por ejemplo `home` o `arrow_left`. Puedes consultar los iconos disponibles en [`src/svg/`](./src/svg/).

### Animaciones

Algunos iconos admiten animación. Actívala con `data-animated="true"`:

```html
<span class="miller-icon" data-icon="loader" data-animated="true"></span>
```

### Color y tamaño

Los SVG usan `currentColor`, así que heredan el color del texto. Define el color y el tamaño con CSS:

```html
<span class="miller-icon mi-ejemplo" data-icon="star"></span>

<style>
  .mi-ejemplo {
    color: rebeccapurple;
    width: 2rem;
    height: 2rem;
  }
</style>
```

### API de JavaScript

La biblioteca está disponible como `window.MillerIcons`:

```js
MillerIcons.names;                    // Nombres de los iconos
MillerIcons.render(element);          // Renderiza un elemento .miller-icon
MillerIcons.scan(container);          // Busca y renderiza iconos dentro de un nodo
const svg = await MillerIcons.getSvgMarkup('home'); // Obtiene el SVG como texto
```

Los elementos existentes se renderizan automáticamente. Los elementos añadidos dinámicamente también se detectan; puedes llamar `scan()` para solicitar un escaneo explícito.

## Desarrollo local

Requisitos: [Node.js](https://nodejs.org/). No se necesitan dependencias adicionales.

Desde la raíz del repositorio, inicia el servidor:

```bash
node server.js
```

Abre <http://127.0.0.1:3000> para usar la galería. Los ejemplos de uso del CDN están en [`examples/`](./examples/).

El servidor genera `public/miller-icons.js` a partir de los SVG de `src/svg` cuando se solicita el bundle. Para agregar un icono, incorpora su archivo `.svg` en ese directorio.

## Galería

La galería permite buscar iconos, guardarlos en favoritos y crear paquetes personalizados. Añade o quita iconos desde el botón `+` de cada tarjeta y abre el constructor desde el dock para previsualizar la selección, elegir color y tamaño, copiar snippets HTML, descargar un sprite SVG o descargar los SVG individuales en un archivo ZIP.

## Estructura del proyecto

- `src/svg/`: archivos SVG fuente.
- `public/miller-icons.js`: biblioteca de iconos para navegador.
- `public/favicon.svg`: favicon del proyecto.
- `examples/`: ejemplos que cargan la biblioteca desde el CDN.
- `server.js`: servidor de desarrollo local.

## Contribuir

Las contribuciones son bienvenidas. Para proponer un cambio, abre un issue o envía un pull request con una descripción clara de lo que cambiaste.
