# Política de Privacidad

**Producto:** Extensión Chrome «Ley 21.719 — Indicios de Cumplimiento»  
**Versión de la política:** 1.0  
**Fecha de vigencia:** 6 de septiembre de 2026  
**Última actualización:** 6 de septiembre de 2026  

Esta Política de Privacidad se redacta conforme a la legislación chilena sobre protección de datos personales —en particular la **Ley N° 19.628** sobre protección de la vida privada, modificada por la **Ley N° 21.719**— y a los requisitos de transparencia de la **Chrome Web Store** de Google.

---

## 1. Responsable del tratamiento

| Campo | Dato |
| --- | --- |
| **Nombre / responsable** | Mauricio Durán Torres |
| **Calidad** | Desarrollador e informático titular de la extensión |
| **Correo de contacto** | [mauriciodurant@gmail.com](mailto:mauriciodurant@gmail.com) |
| **País** | Chile |
| **Finalidad del contacto** | Ejercicio de derechos, consultas sobre privacidad y licenciamiento |

Al utilizar la extensión, usted (el “Usuario”) acepta el tratamiento de la información descrito en esta política, en los términos y con las limitaciones que aquí se indican.

---

## 2. Finalidad única del producto

La extensión tiene **una sola finalidad**:

> Analizar, **de forma local en el navegador del Usuario**, indicios visibles de transparencia y tratamiento de datos personales en la página web activa (por ejemplo: uso de HTTPS, enlaces a políticas de privacidad, canales de contacto, menciones de derechos ARCOP, gestión de cookies/consentimiento y formularios que puedan solicitar datos personales o sensibles), a la luz de la **Ley N° 21.719** de Chile.

La extensión **no** está diseñada para:
- publicidad personalizada;
- seguimiento (tracking) del Usuario entre sitios;
- venta de datos;
- creación de perfiles comerciales;
- envío del contenido de las páginas visitadas a servidores del responsable.

---

## 3. ¿Qué información se trata?

### 3.1. Datos que la extensión procesa al usarla

Al abrir el popup o al ejecutarse el análisis sobre la pestaña activa, la extensión puede **leer en el dispositivo del Usuario** (sin enviarlos a un servidor del responsable):

| Tipo de información | Ejemplo | ¿Se envía a servidores del responsable? |
| --- | --- | --- |
| URL / protocolo de la pestaña activa | `https://ejemplo.cl/...` | **No** |
| Contenido visible del DOM/HTML de la página | textos, enlaces, formularios, scripts locales de la página | **No** |
| Indicios técnicos de cookies/consentimiento en esa página | nombres de cookies o claves de `localStorage` del **sitio visitado** relacionadas con consentimientos | **No** |
| Resultado del informe (score, checklist, tips) | se muestra solo en el popup | **No** (permanece en memoria de la sesión del navegador) |

Ese procesamiento es **transitorio y local**: sirve únicamente para generar el informe en pantalla.

### 3.2. Datos personales del Usuario que el responsable NO recoge con la extensión

En el funcionamiento estándar publicado, el responsable **no recolecta, no almacena en la nube y no transmite**:

- nombre, RUT, correo o teléfono del Usuario;
- historial de navegación hacia servidores propios;
- contenido de las páginas visitadas hacia bases de datos propias;
- datos de formularios que el Usuario complete en terceros sitios;
- geolocalización precisa;
- identificadores publicitarios.

### 3.3. Datos que sí pueden tratarse fuera de la extensión (canales voluntarios)

Si usted escribe a **mauriciodurant@gmail.com** (soporte, feedback, licencia comercial, ejercicio de derechos), se tratarán los datos que usted envíe voluntariamente (por ejemplo: nombre, correo, organización y contenido del mensaje), **solo** para responderle y gestionar la relación solicitada.

### 3.4. Chrome Web Store / Google

La instalación, actualizaciones, valoraciones y métricas de la Chrome Web Store se rigen por las políticas y privacidad de **Google**. El responsable de esta extensión no controla ese tratamiento. Consulte la política de privacidad de Google / Chrome Web Store.

---

## 4. Base de licitud del tratamiento

Conforme al marco chileno aplicable:

1. **Ejecución / prestación del servicio solicitado por el Usuario**  
   Al instalar y usar la extensión, usted solicita el análisis local de la página activa. El acceso al contenido de esa pestaña (permisos `activeTab`, `scripting` y hosts `http(s)://*/*`) es **necesario** para esa finalidad única.

2. **Consentimiento / solicitud voluntaria**  
   Respecto de los datos que usted envíe por correo electrónico al responsable.

3. **Cumplimiento de obligaciones legales**  
   Cuando corresponda conservar o entregar información ante requerimiento de autoridad competente.

---

## 5. Permisos de la extensión y su justificación

| Permiso / alcance | Para qué se usa | Limitación |
| --- | --- | --- |
| `activeTab` | Acceder a la pestaña activa cuando el Usuario interactúa con la extensión | No se usa para monitorear otras pestañas en segundo plano con fines ajenos a la finalidad única |
| `scripting` | Ejecutar el script de análisis propio (`content.js`) en la pestaña activa | Solo código empaquetado de la extensión |
| Hosts `http://*/*` y `https://*/*` | Permitir el análisis en cualquier sitio que el Usuario decida revisar | No implica envío del contenido a terceros ni modificación del sitio con fines ajenos al análisis |

**Código remoto:** la extensión **no carga ni ejecuta código remoto** desde CDN u orígenes externos. Todo el JavaScript relevante se distribuye empaquetado con el elemento.

---

## 6. Destinatarios y comunicaciones

- **No se venden** datos personales.
- **No se ceden** a terceros con fines publicitarios.
- Pueden conocer información solo:
  - el propio Usuario (en su navegador);
  - el responsable, si usted le escribe por correo;
  - proveedores estrictamente necesarios del correo/hosting del responsable, bajo deber de confidencialidad;
  - autoridades competentes, cuando la ley lo exija.

No existen transferencias internacionales de datos **originadas por el funcionamiento analítico de la extensión**, porque ese análisis no sale del navegador del Usuario.

---

## 7. Conservación

| Información | Plazo |
| --- | --- |
| Resultado del escaneo en el popup | Solo mientras la ventana del popup esté abierta / sesión de memoria del navegador; **no se persiste** en servidores del responsable |
| Correos de soporte / licencia | El tiempo razonable para atender la solicitud y obligaciones legales o contractuales aplicables; luego se elimina o anonimiza cuando ya no sea necesario |

---

## 8. Seguridad

El responsable aplica medidas razonables y proporcionales al riesgo, considerando que el núcleo del producto opera **en el cliente**:

- no transmite el contenido de páginas a infraestructura propia;
- no utiliza código remoto;
- limita el alcance funcional a la finalidad única declarada.

Sin perjuicio de lo anterior, ningún sistema es 100 % invulnerable. El Usuario debe mantener actualizado su navegador y revisar los permisos otorgados a la extensión.

---

## 9. Derechos del titular (ARCOP y afines)

Conforme a la normativa chilena vigente y a la Ley N° 21.719 (en lo que resulte aplicable), usted puede ejercer ante el responsable, cuando corresponda, derechos de:

- **Acceso**
- **Rectificación**
- **Supresión** (cancelación)
- **Oposición**
- **Portabilidad**
- **Bloqueo**, cuando proceda según la ley
- **Revocación del consentimiento**, cuando el tratamiento se funde en él

**Cómo ejercerlos:** escriba a [mauriciodurant@gmail.com](mailto:mauriciodurant@gmail.com) indicando:
1. nombre completo;
2. medio de contacto;
3. derecho que desea ejercer;
4. descripción clara de la solicitud.

El responsable responderá por un medio equivalente, en los plazos que establezca la ley aplicable.

Asimismo, usted podrá recurrir ante la **Agencia de Protección de Datos Personales** u otra autoridad competente, en los términos que disponga la normativa vigente.

---

## 10. Datos de niños, niñas y adolescentes

La extensión no está dirigida a menores de edad ni solicita de forma deliberada datos de menores. Si un adulto identifica un tratamiento indebido vinculado a un menor en el contexto de comunicaciones al responsable, puede solicitar su revisión o eliminación al correo indicado.

---

## 11. Cookies y tecnologías similares

La extensión **no instala cookies propias de publicidad ni de analítica del responsable** en los sitios que usted visita.

Puede **inspeccionar** indicios de cookies/consentimiento **del sitio web analizado** (por ejemplo, nombres de cookies o claves de almacenamiento local del sitio) solo para elaborar el informe local. Eso no implica que el responsable cree, lea con fines ajenos o comercialice esas cookies.

---

## 12. Decisiones automatizadas

El “índice de indicios” y los semáforos/estados del popup son **heurísticas técnicas locales**.  
**No** constituyen:
- un dictamen jurídico;
- una certificación de cumplimiento;
- una decisión automatizada con efectos jurídicos vinculantes sobre personas.

---

## 13. Cambios a esta política

Cualquier actualización relevante se publicará en este mismo documento, con nueva fecha de “Última actualización” y, cuando corresponda, nuevo número de versión. El uso continuado de la extensión después de la publicación implica toma de conocimiento de la versión vigente.

---

## 14. Contacto

**Mauricio Durán Torres**  
Correo: [mauriciodurant@gmail.com](mailto:mauriciodurant@gmail.com)  
Asunto sugerido: `Privacidad — Extensión Ley 21.719`

---

## 15. URL de esta política (Chrome Web Store)

Use esta URL pública al completar el campo de Política de Privacidad en la Chrome Web Store (ajustando la rama si corresponde):

**https://github.com/mdurant/extension-chrome-LPDS/blob/main/POLITICA-DE-PRIVACIDAD.md**

Si publica el repositorio en otra URL o dominio propio (por ejemplo, página GitHub Pages), reemplace el enlace anterior por la URL definitiva y mantenga este archivo actualizado.

---

*Documento orientado a transparencia y cumplimiento de deberes de información. No sustituye asesoría legal particular ni la certificación ante la Agencia de Protección de Datos Personales.*
