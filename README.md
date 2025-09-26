# AngularSofkau

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.16.

## Configuración Completada

Se han agregado etiquetas i18n a todos los textos del proyecto Angular para soporte de múltiples idiomas.

### Archivos Modificados

1. **Templates HTML**: Se agregaron etiquetas `i18n` y `i18n-alt` a todos los textos visibles
2. **Componentes TypeScript**: Se agregaron marcadores `$localize` para textos dinámicos
3. **Configuración**: Se configuró Angular i18n en `angular.json` y `package.json`

### Idiomas Soportados

- **Inglés (en-US)**: Idioma por defecto
- **Español (es)**: Traducciones completas

### Scripts NPM Disponibles

```bash
# Desarrollo en inglés (idioma por defecto)
npm start

# Desarrollo en español
npm run start:es

# Compilar en inglés
npm run build

# Compilar en español
npm run build:es

# Compilar todos los idiomas
npm run build:i18n

# Extraer nuevos mensajes para traducir
npm run extract-i18n
```

## Servidor de desarrollo

Ejecuta `ng serve` para iniciar un servidor de desarrollo. Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias alguno de los archivos fuente.

## Generación de código

Ejecuta `ng generate component nombre-componente` para generar un nuevo componente. También puedes usar `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Compilación

Ejecuta `ng build` para compilar el proyecto. Los archivos resultantes se almacenarán en el directorio `dist/`.

## Ejecución de pruebas unitarias

Ejecuta `ng test` para ejecutar las pruebas unitarias usando [Karma](https://karma-runner.github.io).

## Ejecución de pruebas end-to-end

Ejecuta `ng e2e` para ejecutar las pruebas end-to-end usando la plataforma de tu elección. Para usar este comando, primero debes agregar un paquete que implemente capacidades de pruebas end-to-end.

### Estructura de Archivos i18n

```
src/locale/
├── messages.xlf          # Archivo base con todos los textos
└── messages.es.xlf       # Traducciones en español
```

### Cómo Agregar Nuevos Textos

1. Agregar la etiqueta `i18n` al texto en el HTML:
   ```html
   <p i18n="@@unique-id">Texto a traducir</p>
   ```

2. Para textos dinámicos en TypeScript:
   ```typescript
   this.message = $localize`Texto a traducir`;
   ```

3. Extraer los nuevos mensajes:
   ```bash
   npm run extract-i18n
   ```

4. Agregar las traducciones en `src/locale/messages.es.xlf`

### Cómo Agregar un Nuevo Idioma

1. Crear archivo de traducciones: `src/locale/messages.[idioma].xlf`
2. Agregar configuración en `angular.json`:
   ```json
   "locales": {
     "fr": {
       "translation": "src/locale/messages.fr.xlf",
       "baseHref": "/fr/"
     }
   }
   ```
3. Agregar configuración de build y serve en `angular.json`
4. Agregar scripts en `package.json`

#### Componente Principal (app.component.html)
- Banner y footer de la aplicación
- Texto de copyright
- Enlace a la API

#### Lista de Personajes (character-list.component.html)
- Título principal: "Explore the Multiverse"
- Subtítulo: "Discover all the crazy characters..."
- Mensaje de carga: "Loading characters from the multiverse..."
- Etiquetas de campos: Species, Type, Gender
- Ubicaciones: "Last known location", "First seen in"
- Botones de navegación: Previous, Next
- Texto de paginación: "of"
- Botón de reintento: "Try Again"

#### Componente TypeScript (character-list.component.ts)
- Estados de personajes: Alive, Dead, Unknown
- Mensaje de error: "Error loading characters. Please try again."

### Testing de i18n

Para probar las traducciones:

1. Compilar en español: `npm run build:es`
2. Servir la aplicación: `npm run start:es`
3. Verificar que todos los textos aparezcan en español

### Notas Técnicas

- Se usa Angular i18n nativo con formato XLF
- Los IDs de traducción son únicos y descriptivos
- Se mantiene compatibilidad con Angular 16
- Los archivos de traducción están en formato XLIFF estándar

## Más ayuda

Para obtener más ayuda sobre Angular CLI, usa `ng help` o visita la página de [Angular CLI Overview and Command Reference](https://angular.io/cli).
