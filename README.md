# ATLANTES E4 · Atlas de resultados

Explorador de la colección `20261018_definitiva`, con autoría de **Fernando Cagigas y Laura Monzón**, proyecto ATLANTES, Universidad de Navarra.

Abre `index.html` en Chrome, Edge o Firefox actualizado. Todas las bibliotecas y datos están incluidos; no necesita servicios externos. También puede servirse con `python -m http.server 8765 --bind 127.0.0.1 --directory GithubPages` desde la raíz del proyecto.

## Contenido

- Inicio con contexto del estudio, construcción de dimensiones, psicometría y diagnósticos visuales calculados para la población seleccionada.
- Hallazgos y conclusiones del paper en dos bloques de portada: Asia-Pacífico como población principal, y las seis regiones OMS y el mundo como contexto internacional. Cada bloque incluye sus propias conclusiones; el segundo muestra las siete poblaciones en un gráfico y una tabla, incluida la no aplicabilidad de SEAR. Las cifras de referencia de la muestra depurada y sus intervalos se mantienen fijos al cambiar la selección psicométrica.
- Todas las casuísticas de cada población, una debajo de otra, en «Regiones y modelos». Asia-Pacífico y Europa se seleccionan allí, sin páginas duplicadas en el menú.
- Diagramas SEM de izquierda a derecha, con selección de rutas por ratón o teclado, resumen al lado y una tabla detallada por casuística al final. Las rutas cuyo IC Rubin incluye cero o no es evaluable se conservan como líneas discontinuas sin punta de flecha; el signo negativo se distingue por color.
- Debajo de cada modelo se muestran sensibilidades de su propia casuística, rangos de imputación y omisión de países, discrepancias percentil/BCa y límites psicométricos de su familia, población y muestra. El detalle de cada escenario se puede desplegar.
- Ocho casuísticas: C1–C5, C7, C8 y C9. C6 sigue retirada. C9 invierte el orden de C7, conservando rutas directas.
- Nueve unidades × dos muestras × ocho casuísticas: 144 combinaciones. SEAR, con N=10, conserva sus resultados no aplicables y motivos.
- Sensibilidades de semillas bootstrap, imputación, casos completos, delta, muestra, codificación e influencia de países.
- Página independiente de casuísticas, análisis complementarios con esquemas y figuras reales, y guía visual de interpretación.
- Página «Contexto, I1 e I2»: diferencias entre confusión, mediación y moderación; distribuciones observadas de I1/I2; correlaciones de I1; interacciones exploratorias; sensibilidad Cinelli–Hazlett y ajustes contextuales de C1 sobre submuestras comparables.
- Dos diseños de simulación de C1, con filtros de escenario, métricas, denominadores y error Monte Carlo. «Datos disponibles» calcula los compuestos con la información disponible; no es una referencia de datos perfectos.
- Catálogo completo de `resultados/`: JSON, CSV, texto, figuras y procedencia. Incluye el análisis definitivo, el paper en PDF y Word, sus suplementos, los 14 informes actualizados y la metodología.

Las tablas permiten buscar, ordenar y descargar sin redondear. El visor de CSV permite configurar dispersión, barras, líneas y distribuciones. Limita los gráficos a 3.000 filas e informa de ello; las tablas y descargas conservan todos los registros. Plotly ofrece zoom y exportación SVG.

Los datos son nacionales y transversales. Las flechas expresan especificaciones asociacionales; no establecen causalidad. Las simulaciones de C1 no validan automáticamente C9 u otras casuísticas. La variante de Asia-Pacífico con I8 global mantiene I13 curado.

## Publicar en GitHub Pages

La carpeta está preparada, pero no se ha publicado. En un repositorio independiente, copia todo el contenido de `GithubPages`, incluida `.github`, a su raíz. En el repositorio actual, copia `GithubPages/.github/workflows/pages.yml` a `.github/workflows/pages.yml`. Selecciona GitHub Actions en Settings → Pages y ejecuta manualmente **Publish ATLANTES atlas**. El workflow detecta ambos formatos. La plantilla anidada permanece inactiva.

Todas las rutas son relativas, compatibles con una dirección bajo `/repositorio/`. No requiere repetir los cálculos.

## Documentos principales

- [Paper PDF](documents/definitiva/paper/manuscript/manuscript.pdf) · [Word](documents/definitiva/paper/manuscript/manuscript.docx)
- [Suplemento metodológico PDF](documents/definitiva/paper/supplement/supplement.pdf)
- [Suplemento numérico completo ZIP](documents/definitiva/paper/Additional_file_2.zip)

Los informes HTML contienen el detalle técnico de las tareas de ambas muestras; sus PDF presentan la síntesis y las tablas principales. Los datos de contacto y las declaraciones de autores se completarán antes de un envío editorial.

## Integridad y actualización

`data/study.js` contiene tablas de presentación y `data/catalog.js` el índice. `data/measurement.js` añade los diagnósticos de medida de 270 tareas verificadas. `data/context.js` incorpora 324 tareas contextuales y dos fuentes del paper: 326 fuentes verificadas, con SHA-256. Ambos extractores leen la colección definitiva sin ajustar nuevos modelos. Cada registro carga sus originales bajo demanda desde `data/records/`, comprimidos con gzip/base64 sin pérdida. `data/manifest.json` conserva tamaño y SHA-256. No se incluye ninguna colección histórica o R2 sustituida. Los segmentos de cálculo y reparación se documentan en la procedencia de la colección única.

El constructor `python GithubPages/tools/build_definitive.py` lee resultados existentes; no ajusta modelos. Requiere vaciar antes los directorios generados `data/records`, `assets/files`, `assets/figures` y `documents`. `tools/build_data.py` es un punto de entrada equivalente. Conserva las bibliotecas, logotipos y archivos fuente.

Verificaciones:

```powershell
python GithubPages/tools/validate.py
node --check GithubPages/assets/app.js
node --check GithubPages/assets/research.js
node --check GithubPages/assets/context.js
node GithubPages/tools/qa_dom.cjs <ruta-a-jsdom>
```

`validation.json` comprueba bytes, hashes, cobertura, fuentes psicométricas y contextuales, paper y tamaño. `validation-dom.json` comprueba las 11 vistas, 144 combinaciones regionales y de casuística, contexto por región/muestra/casuística, selección de flechas, diagnósticos, filtros, tablas y visores. `validation-plotly.json` valida los esquemas gráficos. La prueba DOM sustituye el renderizado de Plotly y no equivale a revisión visual en un navegador real.

Las afiliaciones individuales, contactos y ORCID quedan pendientes. Las fuentes mantienen sus condiciones de uso; esta carpeta no asigna nuevas licencias a datos ni logotipos. Créditos en `THIRD_PARTY_NOTICES.md`.
