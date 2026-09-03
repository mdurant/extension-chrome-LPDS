# Ley 21.719 — Indicios de Cumplimiento (extensión Chrome)

Extensión para Chrome que revisa **indicios visibles** de transparencia y buen trato de datos personales en un sitio web, alineada con la **Ley N° 21.719** (Chile; reforma a la Ley 19.628).

> **Importante:** esto **no es un certificado legal** ni un “visto bueno” de la Agencia. Es una lupa técnica para abogados, DPO/oficiales, informáticos, QA y gerencia: te muestra qué se ve (o no) en la página.

**Autor:** Mauricio Durán Torres  
**Correo:** [mauriciodurant@gmail.com](mailto:mauriciodurant@gmail.com)  
**Perfil:** más de 18 años en el mundo Tech; hoy en roles de Arquitectura de Soluciones, IA, Ciberseguridad y afines.

---

## Para la Enana con amor de su papí ❤️

Mauricio dedica este proyecto a su hija **Fernanda Durán**. Esa frase queda siempre en el pie de la extensión.

---

## ¿Qué hace (en simple)?

1. Abres un sitio (por ejemplo la home de tu empresa).
2. Haces clic en el ícono de la extensión.
3. Te entrega un **índice de indicios**, un veredicto en lenguaje claro y una checklist:
   - HTTPS
   - Política de privacidad / tratamiento
   - Canal para ejercer derechos
   - Menciones ARCOP
   - Cookies / consentimiento observable
   - Delegado (si aparece)
   - Profundidad del Art. 14 ter
   - **Formularios y datos sensibles** (nuevo y potenciado)

Si la página pide correo, RUT, salud, tarjeta, etc., la extensión te avisa y sugiere mejoras de UX/transparencia.

---

## Instalación rápida (Chrome)

1. Entra a `chrome://extensions`
2. Activa **Modo de desarrollador** (arriba a la derecha)
3. Pulsa **Cargar descomprimida**
4. Elige esta carpeta del proyecto
5. Abre cualquier sitio `https://…` y prueba la extensión
6. Si cambias código: vuelve a `chrome://extensions` y pulsa **Recargar**

---

## Licencia (cuál calza mejor y por qué)

**Se usa una Licencia Dual MDT (propietaria / source-available), no MIT ni GPL.**

| Tipo de licencia común | ¿Sirve aquí? | Por qué |
| --- | --- | --- |
| **MIT / Apache 2.0** | No como única vía | Permiten uso comercial casi sin contraprestación; no encajan con un fee institucional. |
| **GPL / AGPL** | No como única vía | Obligan a share-alike (copyleft); chocan con un modelo de licencia paga para Estado/gran empresa. |
| **Licencia Dual MDT** (este repo) | **Sí** | Combina uso comunitario gratuito + licencia comercial institucional con fee en UF. |

Detalle completo: archivo [`LICENSE`](./LICENSE).

### ¿Quién puede usarla gratis?

- Personas naturales (estudio, portafolio, uso personal)
- MiPyme (empresas de menor tamaño, Ley 20.416)
- ONG, universidades y formación (fines educativos / investigación no masiva comercial)

### ¿Quién debe pagar?

Si eres **Gobierno** (órganos del Estado, municipios, empresas públicas, etc.) o **gran empresa en Chile**, el uso requiere **Licencia Comercial Institucional**:

- **Fee:** **0,2 UF mensuales** por organización usuaria  
- **A nombre de:** Mauricio Durán Torres (desarrollador e informático)  
- **Contacto:** mauriciodurant@gmail.com  

Sin pago o convenio escrito, ese uso institucional **no está autorizado**.

---

## Guía paso a paso: qué modificar y por qué

Esta sección es para que **cualquier organización** adapte la extensión a su realidad (marca, checklist interno, umbrales), sin perder el sentido legal.

### 1) Nombre, versión y descripción

**Archivo:** `manifest.json`  
**Qué tocar:** `name`, `version`, `description`  
**Por qué:** así tus equipos ven en Chrome que es “la herramienta oficial interna” y versionan cambios.

### 2) Motor de detección (el cerebro)

**Archivo:** `content.js`  
**Qué tocar (según necesidad):**

| Bloque | Qué modifica | Por qué |
| --- | --- | --- |
| `CMP_SCRIPT_HINTS` / `CMP_DOM_HINTS` | Nombres de tu banner de cookies (OneTrust, Cookiebot, propio…) | Para que no diga “no hay cookies” si tu CMP tiene otro nombre |
| `PRIVACY_*` / `CONTACT_*` | Palabras de tus menús (“Aviso de Privacidad”, “Mis datos”, etc.) | Cada marca nombra distinto el mismo deber del Art. 14 ter |
| `SENSITIVE_FIELD_RULES` | Campos sensibles propios (ej. “n° afiliado”, “isapre”) | Mejora la alerta cuando el sitio pide datos delicados |
| `buildChecks` / `weight` | Pesos del puntaje | Ajusta la prioridad a tu política interna de riesgo |
| `buildFormUxTips` | Textos de mejora UX | Personaliza el consejo que ve QA / producto |

**No borres** la lógica que distingue *obligatorio / condicional / indicador / señal*: eso evita falsos “incumplimientos” (por ejemplo, el DPO **no** es siempre obligatorio: Art. 50 dice “podrá”).

### 3) Pantalla del popup (lo que ve la gente)

**Archivos:** `popup.html` + `popup.js`  
**Qué tocar:** textos de la checklist, colores, banner de tips UX  
**Por qué:** abogados y gerencia necesitan lenguaje claro; QA necesita evidencia expandible.

**No quites** del pie:

> Para la Enana con amor de su papí ❤️  
> (dedicatoria a Fernanda Durán)

### 4) Service worker

**Archivo:** `background.js`  
**Qué tocar:** casi nada (hoy solo confirma la instalación)  
**Por qué:** en MV3 Chrome pide este archivo; déjalo liviano.

### 5) PDF de la ley (referencia)

**Archivo:** `Ley-21719_13-DIC-2024.pdf`  
**Qué tocar:** solo actualizar si hay texto oficial nuevo en BCN  
**Por qué:** la extensión se interpreta contra la norma, no contra “costumbres de internet”.

---

## Cuando el sitio tiene formularios o datos sensibles

Si al visitar una página aparecen formularios (contacto, registro, checkout, salud, etc.), la extensión ahora:

1. Detecta campos típicos: correo, teléfono, RUT, contraseña, pago, salud, biometría, menores, etc.
2. Revisa si cerca del formulario hay **aviso de privacidad**, checkbox de consentimiento o mención de finalidad.
3. Estima un **nivel de riesgo** (nulo / bajo / medio / alto).
4. Muestra un **banner naranja** con tips concretos de UX y transparencia.

### Buenas prácticas que puedes aplicar en tu sitio (checklist corta)

1. **HTTPS siempre** si pides contraseñas o datos personales.
2. Junto al formulario: 1–2 líneas del **para qué** pides los datos.
3. Link visible a la **política de tratamiento** (Art. 14 ter a).
4. Si la base es consentimiento (Art. 12): checkbox **no** pre-marcado, fácil de revocar.
5. Pide **solo lo necesario** (minimización, Art. 14 quáter).
6. Datos sensibles o de menores: súbele el estándar (seguridad + base de licitud clara).

---

## Cómo leer el resultado (para no equivocarse)

| Símbolo | Significado |
| --- | --- |
| ✅ | Hallazgo observable a favor |
| 🟠 | Parcial (hay indicios, falta profundidad) |
| 🔎 | Revisar (no alcanza con la home; abre la política) |
| ➖ | No aplica / no es exigible en ese punto |
| ❌ | No se halló un indicio esperado |

**Ejemplo clásico:** un sitio grande puede tener cookies y HTTPS, pero si el popup antiguo fallaba o solo miraba la home sin ARCOP, “marcaba rojo”. Esta versión separa lo **obligatorio** de lo **condicional** y muestra evidencia.

---

## Mapa rápido de archivos

```
extension-chrome-21719/
├── manifest.json      ← identidad de la extensión
├── background.js      ← service worker
├── content.js         ← escaneo en la página
├── popup.html         ← interfaz
├── popup.js           ← pinta resultados
├── LICENSE            ← Licencia Dual MDT + fee 0,2 UF
├── README.md          ← esta guía
└── Ley-21719_....pdf  ← norma de referencia
```

---

## Contacto y uso institucional

- **Consultas técnicas o licencia comercial:** mauriciodurant@gmail.com  
- **Titular:** Mauricio Durán Torres  
- **Fee Gobierno / gran empresa Chile:** 0,2 UF mensual  

---

## Aviso legal breve

Los resultados son **heurísticos** (miran HTML/DOM visible). No reemplazan dictamen jurídico, DPIA, revisión de contratos con encargados, ni auditoría de seguridad real (Art. 14 quinquies / sexies).

---

Para la Enana con amor de su papí ❤️  
*Proyecto dedicado a Fernanda Durán.*
