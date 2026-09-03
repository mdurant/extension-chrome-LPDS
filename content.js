/**
 * Motor de indicios de cumplimiento — Ley N° 21.719 (modifica Ley 19.628).
 * Orientado a especialistas: produce evidencia observable en el DOM/HTML,
 * distingue obligaciones, elementos condicionales y señales débiles.
 * NO constituye dictamen jurídico ni certificación de cumplimiento.
 */

(function () {
  "use strict";

  const CMP_SCRIPT_HINTS = [
    "onetrust",
    "cookielaw",
    "otSDKStub",
    "cookiebot",
    "consentcdn",
    "cookie-script",
    "cookieyes",
    "complianz",
    "iubenda",
    "didomi",
    "usercentrics",
    "trustarc",
    "truste.com",
    "quantcast",
    "sourcepoint",
    "osano",
    "termly",
    "axeptio",
    "cookieinformation",
    "pandectes",
    "civic-cookie",
  ];

  const CMP_DOM_HINTS = [
    "#onetrust-banner-sdk",
    "#onetrust-consent-sdk",
    "#ot-sdk-btn",
    "#CybotCookiebotDialog",
    ".cc-window",
    ".cc-banner",
    "#cookie-law-info-bar",
    ".cli-modal-content",
    "[id*='cookie' i]",
    "[class*='cookie' i]",
    "[id*='consent' i]",
    "[class*='consent' i]",
    "[aria-label*='cookie' i]",
    "[data-testid*='cookie' i]",
  ];

  const PRIVACY_HREF_RE =
    /privacy|privacidad|protecci[oó]n[-_\s]?de[-_\s]?datos|tratamiento[-_\s]?de[-_\s]?datos|datos[-_\s]?personales|aviso[-_\s]?de[-_\s]?privacidad|notice[-_\s]?of[-_\s]?privacy|datenschutz|confidentialit[eé]|politica[-_\s]?de[-_\s]?datos|pol[ií]tica[-_\s]?de[-_\s]?privacidad|personal[-_\s]?data/i;

  const PRIVACY_TEXT_RE =
    /pol[ií]tica\s+de\s+(privacidad|tratamiento|datos)|aviso\s+de\s+privacidad|privacy\s+polic(y|ies)|protecci[oó]n\s+de\s+datos|datos\s+personales|personal\s+data|data\s+protection|notice\s+of\s+privacy|declaraci[oó]n\s+de\s+privacidad/i;

  const COOKIE_POLICY_RE =
    /cookie|cookies|preferencias\s+de\s+cookies|gesti[oó]n\s+de\s+cookies|configurar\s+cookies|cookie\s+polic(y|ies)|pol[ií]tica\s+de\s+cookies/i;

  const CONTACT_HREF_RE =
    /contacto|contact[-_]?us|contactenos|cont[aá]ctenos|escr[ií]benos|support|ayuda|help|solicitud|derechos|arco|arcp|arcoop|privacy[-_]?request|data[-_]?request|ejercer|titular/i;

  const CONTACT_TEXT_RE =
    /contacto|cont[aá]ctenos|contact\s*us|escr[ií]benos|ejercer\s+derechos|solicitud\s+de\s+datos|derechos\s+del\s+titular|formulario\s+de\s+contacto|privacy\s+request|data\s+subject/i;

  const ARCO_TERMS = {
    acceso: /\b(acceso|access|acceso\s+a\s+(mis\s+)?datos)\b/i,
    rectificacion: /\b(rectificaci[oó]n|rectificar|correcci[oó]n|correction|rectify)\b/i,
    supresion: /\b(supresi[oó]n|cancelaci[oó]n|eliminaci[oó]n|borrado|erasure|deletion|right\s+to\s+be\s+forgotten)\b/i,
    oposicion: /\b(oposici[oó]n|oponerse|object(?:ion)?|opt[- ]?out)\b/i,
    portabilidad: /\b(portabilidad|portability|portable)\b/i,
  };

  function safeLower(s) {
    return (s || "").toLowerCase();
  }

  function collectTextFromShadow(root, depth) {
    if (!root || depth > 6) return "";
    let out = "";
    try {
      const walk = root.querySelectorAll ? root.querySelectorAll("*") : [];
      walk.forEach((el) => {
        if (el.shadowRoot) out += " " + collectTextFromShadow(el.shadowRoot, depth + 1);
      });
      if (root.innerText) out += " " + root.innerText;
      else if (root.textContent) out += " " + root.textContent;
    } catch (_) {
      /* cross-origin or closed shadow */
    }
    return out;
  }

  function getDeepPageText() {
    const parts = [];
    if (document.body) parts.push(document.body.innerText || "");
    parts.push(collectTextFromShadow(document.documentElement, 0));
    try {
      document.querySelectorAll("iframe").forEach((frame) => {
        try {
          const doc = frame.contentDocument;
          if (doc && doc.body) parts.push(doc.body.innerText || "");
        } catch (_) {
          /* cross-origin iframe */
        }
      });
    } catch (_) {}
    return parts.join("\n");
  }

  function getDeepHtmlSample() {
    const chunks = [document.documentElement ? document.documentElement.innerHTML : ""];
    try {
      document.querySelectorAll("*").forEach((el) => {
        if (el.shadowRoot) {
          try {
            chunks.push(el.shadowRoot.innerHTML || "");
          } catch (_) {}
        }
      });
    } catch (_) {}
    return chunks.join("\n");
  }

  function getClickableNodes() {
    const nodes = Array.from(
      document.querySelectorAll("a[href], area[href], button, [role='link'], [role='button']")
    );
    try {
      document.querySelectorAll("*").forEach((el) => {
        if (el.shadowRoot) {
          el.shadowRoot
            .querySelectorAll("a[href], button, [role='link'], [role='button']")
            .forEach((n) => nodes.push(n));
        }
      });
    } catch (_) {}
    return nodes;
  }

  function nodeSignals(el) {
    const href = el.href || el.getAttribute("href") || el.getAttribute("data-href") || "";
    const text = (el.innerText || el.textContent || el.getAttribute("aria-label") || "").trim();
    const title = el.getAttribute("title") || "";
    return { href, text, title, blob: `${href} ${text} ${title}` };
  }

  function findMatches(nodes, hrefRe, textRe, limit) {
    const found = [];
    for (const el of nodes) {
      const s = nodeSignals(el);
      if ((hrefRe && hrefRe.test(s.href)) || (textRe && textRe.test(s.text)) || (textRe && textRe.test(s.title))) {
        found.push({
          tag: el.tagName,
          href: (s.href || "").slice(0, 200),
          text: (s.text || "").slice(0, 120),
        });
        if (found.length >= (limit || 5)) break;
      }
    }
    return found;
  }

  function detectCmpScripts(html) {
    const hits = [];
    const scripts = Array.from(document.scripts || []);
    for (const s of scripts) {
      const src = s.src || "";
      const inline = s.textContent || "";
      const hay = `${src} ${inline.slice(0, 2000)}`.toLowerCase();
      for (const hint of CMP_SCRIPT_HINTS) {
        if (hay.includes(hint.toLowerCase())) {
          hits.push(src || `inline:${hint}`);
          break;
        }
      }
    }
    const htmlLower = html.toLowerCase();
    for (const hint of CMP_SCRIPT_HINTS) {
      if (htmlLower.includes(hint.toLowerCase()) && !hits.some((h) => h.toLowerCase().includes(hint.toLowerCase()))) {
        hits.push(`html:${hint}`);
      }
    }
    return hits.slice(0, 8);
  }

  function detectCmpDom() {
    const hits = [];
    for (const sel of CMP_DOM_HINTS) {
      try {
        if (document.querySelector(sel)) hits.push(sel);
      } catch (_) {
        /* invalid selector in older engines */
      }
      if (hits.length >= 6) break;
    }
    return hits;
  }

  function detectCookieStorageSignals() {
    const names = [];
    try {
      const raw = document.cookie || "";
      if (raw) {
        raw.split(";").forEach((p) => {
          const name = p.split("=")[0].trim().toLowerCase();
          if (/consent|cookie|optanon|euconsent|gdpr|cc_cookie|cookieyes|cmplz/.test(name)) {
            names.push(name);
          }
        });
      }
    } catch (_) {}
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = (localStorage.key(i) || "").toLowerCase();
        if (/consent|cookie|onetrust|optanon|uc_user|didomi|gdpr/.test(k)) names.push(`ls:${k}`);
      }
    } catch (_) {}
    return [...new Set(names)].slice(0, 8);
  }

  const SENSITIVE_FIELD_RULES = [
    { id: "email", re: /e-?mail|correo/i, label: "correo electrónico" },
    { id: "phone", re: /tel[eé]fono|phone|celular|m[oó]vil|whatsapp/i, label: "teléfono" },
    { id: "name", re: /nombre|name|apellido|firstname|lastname/i, label: "nombre/apellido" },
    { id: "rut", re: /\brut\b|run\b|documento|dni|pasaporte|passport|national.?id/i, label: "RUT/documento" },
    { id: "address", re: /direcci[oó]n|address|comuna|ciudad|city|calle/i, label: "dirección" },
    { id: "password", re: /password|contrase[nñ]a|clave/i, label: "contraseña" },
    { id: "payment", re: /tarjeta|card.?number|cvv|cvc|credit|débito|debito|pago|payment|iban|cuenta.?banc/i, label: "pago/tarjeta" },
    { id: "health", re: /salud|health|diagn[oó]stico|paciente|medical|enfermedad|previsi[oó]n/i, label: "datos de salud" },
    { id: "biometric", re: /huella|biometric|rostro|face.?id|iris/i, label: "datos biométricos" },
    { id: "minors", re: /menor|ni[nñ]o|ni[nñ]a|child|fecha.?nacimiento|birth.?date|edad/i, label: "menores/fecha nacimiento" },
    { id: "location", re: /ubicaci[oó]n|geoloc|latitude|longitude|gps/i, label: "ubicación" },
    { id: "sensitive_other", re: /sensib|etnia|religi[oó]n|orientaci[oó]n|pol[ií]tica|sindicato|genero|género/i, label: "categoría sensible" },
  ];

  function fieldFingerprint(el) {
    return [
      el.name,
      el.id,
      el.placeholder,
      el.getAttribute("aria-label"),
      el.getAttribute("autocomplete"),
      el.type,
      el.className,
    ]
      .filter(Boolean)
      .join(" ");
  }

  function nearbyPrivacyNotice(form) {
    const container = form.closest("section, article, main, div") || form.parentElement || form;
    const blob = `${container.innerText || ""} ${form.innerHTML || ""}`.toLowerCase();
    const hasLink =
      !!form.querySelector(
        "a[href*='privacy' i], a[href*='privacidad' i], a[href*='datos' i], a[href*='proteccion' i], a[href*='protección' i]"
      ) ||
      PRIVACY_HREF_RE.test(blob) ||
      PRIVACY_TEXT_RE.test(blob);
    const hasConsentCheckbox = !!form.querySelector(
      "input[type='checkbox'][name*='privac' i], input[type='checkbox'][name*='consent' i], input[type='checkbox'][id*='privac' i], input[type='checkbox'][id*='consent' i], input[type='checkbox'][name*='acepto' i]"
    );
    const mentionsPurpose = /finalidad|para\s+qu[eé]|tratamiento|privacidad|privacy|consentimiento|autorizo|acepto/i.test(blob);
    return { hasLink, hasConsentCheckbox, mentionsPurpose };
  }

  function analyzeFormsAndSensitiveData() {
    const mailtos = Array.from(document.querySelectorAll('a[href^="mailto:"]'))
      .map((a) => a.getAttribute("href"))
      .filter(Boolean)
      .slice(0, 5);

    const allForms = Array.from(document.querySelectorAll("form"));
    const looseFields = Array.from(
      document.querySelectorAll(
        "input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset']):not([type='image']), textarea, select"
      )
    ).filter((el) => !el.closest("form"));

    const categories = new Set();
    const formReports = [];
    let sensitiveFormCount = 0;
    let formsWithNotice = 0;
    let formsMissingNotice = 0;
    let passwordOverHttp = false;
    let autocompleteOffCount = 0;

    function inspectFields(fields, formEl) {
      const found = [];
      fields.forEach((el) => {
        const fp = fieldFingerprint(el);
        const type = (el.type || "").toLowerCase();
        if (type === "email") {
          categories.add("email");
          found.push("correo electrónico");
        }
        if (type === "tel") {
          categories.add("phone");
          found.push("teléfono");
        }
        if (type === "password") {
          categories.add("password");
          found.push("contraseña");
          if (window.location.protocol !== "https:") passwordOverHttp = true;
        }
        if (type === "file") {
          categories.add("file");
          found.push("archivo");
        }
        for (const rule of SENSITIVE_FIELD_RULES) {
          if (rule.re.test(fp)) {
            categories.add(rule.id);
            found.push(rule.label);
          }
        }
        if (el.autocomplete === "off") autocompleteOffCount += 1;
      });
      return [...new Set(found)];
    }

    allForms.forEach((form, idx) => {
      const fields = Array.from(
        form.querySelectorAll(
          "input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset']), textarea, select"
        )
      );
      const found = inspectFields(fields, form);
      const notice = nearbyPrivacyNotice(form);
      const isContactLike = /contact|privac|dato|derecho|arco|support|solicitud|login|registro|signup|checkout|pago/i.test(
        `${form.id || ""} ${form.className || ""} ${form.getAttribute("aria-label") || ""} ${form.action || ""}`
      );
      const isSensitive = found.length > 0 || isContactLike || !!form.querySelector("input[type='email'], textarea");
      if (!isSensitive && found.length === 0) return;

      if (found.length > 0 || isSensitive) sensitiveFormCount += 1;
      const noticeOk = notice.hasLink || notice.hasConsentCheckbox || notice.mentionsPurpose;
      if (noticeOk) formsWithNotice += 1;
      else formsMissingNotice += 1;

      formReports.push({
        index: idx + 1,
        action: (form.getAttribute("action") || "(misma página)").slice(0, 120),
        method: (form.getAttribute("method") || "get").toUpperCase(),
        fields: found.slice(0, 8),
        noticeOk,
        notice,
      });
    });

    if (looseFields.length) {
      const found = inspectFields(looseFields, null);
      if (found.length) {
        categories.add("loose_fields");
        formReports.push({
          index: "sin-<form>",
          action: "(campos sueltos en la página)",
          method: "N/A",
          fields: found.slice(0, 8),
          noticeOk: PRIVACY_TEXT_RE.test(document.body ? document.body.innerText : ""),
          notice: { hasLink: false, hasConsentCheckbox: false, mentionsPurpose: false },
        });
      }
    }

    const contactForms = allForms.filter((f) => {
      const blob = `${f.id || ""} ${f.className || ""} ${f.getAttribute("aria-label") || ""} ${f.action || ""}`.toLowerCase();
      return /contact|privac|dato|derecho|arco|support|solicitud/.test(blob) || f.querySelector("textarea, input[type='email']");
    });

    const riskLevel =
      passwordOverHttp || categories.has("health") || categories.has("biometric") || categories.has("payment")
        ? "alto"
        : categories.has("rut") || categories.size >= 3
          ? "medio"
          : categories.size > 0
            ? "bajo"
            : "nulo";

    return {
      mailtos,
      formCount: contactForms.length,
      totalForms: allForms.length,
      sensitiveFormCount,
      formsWithNotice,
      formsMissingNotice,
      categories: [...categories],
      formReports: formReports.slice(0, 6),
      passwordOverHttp,
      autocompleteOffCount,
      riskLevel,
      hasPersonalDataCollection: categories.size > 0 || sensitiveFormCount > 0,
    };
  }

  function analyzeArco(pageText) {
    const present = {};
    let count = 0;
    for (const [key, re] of Object.entries(ARCO_TERMS)) {
      const ok = re.test(pageText);
      present[key] = ok;
      if (ok) count += 1;
    }
    const acronym = /\barcop?\b|\barcoop\b|\bderechos\s+arco\b/i.test(pageText);
    return {
      present,
      count,
      acronym,
      // Art. 14 ter f: acceso, rectificación, supresión, oposición y portabilidad
      sufficient: count >= 3 || (acronym && count >= 2),
    };
  }

  function detectDpoOrEncargado(pageText, html) {
    const hay = `${pageText}\n${html}`;
    const patterns = [
      /delegado\s+de\s+protecci[oó]n(\s+de\s+datos)?/i,
      /\bDPO\b/,
      /data\s+protection\s+officer/i,
      /encargado\s+de\s+prevenci[oó]n/i,
      /privacy\s+officer/i,
      /oficial\s+de\s+(privacidad|protecci[oó]n\s+de\s+datos)/i,
    ];
    const evidence = [];
    for (const re of patterns) {
      const m = hay.match(re);
      if (m) evidence.push(m[0]);
    }
    return { found: evidence.length > 0, evidence: evidence.slice(0, 4) };
  }

  function detectChileanRegulatorySignals(pageText, html) {
    const hay = `${pageText}\n${html}`;
    const patterns = [
      /21\.?719/,
      /19\.?628/,
      /agencia\s+de\s+protecci[oó]n\s+de\s+datos/i,
      /ley\s+de\s+protecci[oó]n\s+de\s+(los\s+)?datos(\s+personales)?/i,
      /protecci[oó]n\s+de\s+la\s+vida\s+privada/i,
      /\bAPDP\b/,
    ];
    const evidence = [];
    for (const re of patterns) {
      const m = hay.match(re);
      if (m) evidence.push(m[0]);
    }
    return { found: evidence.length > 0, evidence: evidence.slice(0, 4) };
  }

  function detectTransparencyExtras(pageText) {
    return {
      finalidades: /finalidad(es)?|purposes?\s+of\s+(processing|treatment)|para\s+qu[eé]\s+(usamos|tratamos)/i.test(pageText),
      basesLicitud: /base\s+(de\s+)?(licitud|legitimidad|legal)|legal\s+basis|inter[eé]s\s+leg[ií]timo|consentimiento/i.test(pageText),
      transferencias: /transferencia(s)?\s+(internacional|a\s+tercer)|third[- ]countr|fuera\s+de\s+chile|adequate\s+level/i.test(pageText),
      conservacion: /plazo\s+de\s+conservaci[oó]n|retention\s+period|cu[aá]nto\s+tiempo\s+conserv/i.test(pageText),
      agenciaRecurso: /agencia(\s+de\s+protecci[oó]n)?|autoridad\s+de\s+control|supervisory\s+authority|reclamar\s+ante/i.test(pageText),
      revocacion: /revocar(\s+el)?\s+consentimiento|retirar(\s+el)?\s+consentimiento|withdraw\s+consent/i.test(pageText),
      seguridadInfo: /medidas\s+de\s+seguridad|security\s+measures|cifrado|encryption|seudonimiz/i.test(pageText),
    };
  }

  function buildFormUxTips(formsAnalysis, hasPrivacy) {
    const tips = [];
    if (!formsAnalysis.hasPersonalDataCollection) {
      tips.push("No se detectó recolección evidente de datos personales en formularios de esta vista.");
      return tips;
    }
    if (formsAnalysis.passwordOverHttp) {
      tips.push("URGENTE: hay campo de contraseña en HTTP. Active HTTPS antes de pedir credenciales.");
    }
    if (formsAnalysis.formsMissingNotice > 0) {
      tips.push(
        `Hay ${formsAnalysis.formsMissingNotice} formulario(s) con datos personales sin aviso de privacidad/consentimiento visible cerca. Art. 14 ter + Art. 12: informe finalidad y base de licitud al momento de recolectar.`
      );
    }
    if (formsAnalysis.categories.includes("payment")) {
      tips.push("Detectamos campos de pago/tarjeta: refuerce cifrado, minimización y retención (Art. 14 quáter/quinquies).");
    }
    if (formsAnalysis.categories.includes("health") || formsAnalysis.categories.includes("biometric")) {
      tips.push("Posibles datos sensibles (salud/biometría): el régimen de la Ley 21.719 es reforzado; revise consentimiento específico y medidas de seguridad.");
    }
    if (formsAnalysis.categories.includes("minors")) {
      tips.push("Hay indicios de datos de menores/fecha de nacimiento: verifique reglas de consentimiento de padres/representantes.");
    }
    if (formsAnalysis.categories.includes("rut")) {
      tips.push("Se solicita RUT/documento: confirme necesidad real (minimización) y transparencia de la finalidad.");
    }
    if (!hasPrivacy) {
      tips.push("La página recolecta datos pero no se halló enlace claro a política de tratamiento: priorice publicarla (Art. 14 ter a).");
    }
    if (formsAnalysis.formsWithNotice > 0) {
      tips.push(`Bien: ${formsAnalysis.formsWithNotice} formulario(s) ya muestran indicios de aviso/consentimiento cercano.`);
    }
    tips.push("Tip UX: explique en 1–2 líneas para qué pide cada dato, ofrezca enlace a la política y un checkbox de consentimiento no pre-tickeado cuando la base sea consentimiento.");
    return tips.slice(0, 8);
  }

  function buildChecks(ctx) {
    const {
      isHttps,
      privacyHits,
      cookiePolicyHits,
      contactHits,
      mailtos,
      formCount,
      formsAnalysis,
      cmpScripts,
      cmpDom,
      cookieStorage,
      cookieKeywordHit,
      arco,
      dpo,
      chileLaw,
      extras,
    } = ctx;

    const hasPrivacy = privacyHits.length > 0;
    const hasContact =
      contactHits.length > 0 || mailtos.length > 0 || formCount > 0;
    const hasCookieMgmt =
      cmpScripts.length > 0 ||
      cmpDom.length > 0 ||
      cookieStorage.length > 0 ||
      cookiePolicyHits.length > 0 ||
      cookieKeywordHit;

    let formsStatus = "na";
    if (formsAnalysis.hasPersonalDataCollection) {
      if (formsAnalysis.passwordOverHttp) formsStatus = "fail";
      else if (formsAnalysis.formsMissingNotice === 0 && (hasPrivacy || formsAnalysis.formsWithNotice > 0))
        formsStatus = "pass";
      else if (formsAnalysis.formsWithNotice > 0 || hasPrivacy) formsStatus = "partial";
      else formsStatus = "fail";
    }

    return [
      {
        id: "https",
        title: "Cifrado en tránsito (HTTPS)",
        article: "Art. 14 quinquies (indicador técnico parcial)",
        obligation: "indicator",
        status: isHttps ? "pass" : "fail",
        weight: 15,
        rationale:
          "El Art. 14 quinquies exige medidas técnicas adecuadas (confidencialidad/integridad). HTTPS es un indicador mínimo de cifrado en tránsito, no agota el deber de seguridad.",
        evidence: [window.location.protocol + "//" + window.location.host],
      },
      {
        id: "privacy",
        title: "Política de tratamiento / privacidad",
        article: "Art. 14 ter lit. a",
        obligation: "mandatory",
        status: hasPrivacy ? "pass" : "fail",
        weight: 20,
        rationale:
          "Debe mantenerse permanentemente a disposición del público la política de tratamiento de datos (con fecha/versión). Términos y condiciones no sustituyen este deber.",
        evidence: privacyHits.slice(0, 3).map((h) => `${h.text || "(sin texto)"} → ${h.href}`),
      },
      {
        id: "contact",
        title: "Canal para solicitudes del titular",
        article: "Art. 14 ter lit. c",
        obligation: "mandatory",
        status: hasContact ? "pass" : "fail",
        weight: 15,
        rationale:
          "Correo, formulario u otro medio tecnológico de uso común para notificar solicitudes de titulares (ARCOP).",
        evidence: [
          ...contactHits.slice(0, 2).map((h) => `${h.text || "(sin texto)"} → ${h.href}`),
          ...mailtos.slice(0, 2),
          formCount ? `formularios relevantes: ${formCount}` : "",
        ].filter(Boolean),
      },
      {
        id: "arco",
        title: "Información de derechos ARCOP",
        article: "Art. 14 ter lit. f",
        obligation: "mandatory",
        status: arco.sufficient ? "pass" : "partial",
        weight: 15,
        rationale:
          "Debe informarse el derecho a acceso, rectificación, supresión, oposición y portabilidad. La detección en homepage es indiciaria; suele estar en la política.",
        evidence: [
          `menciones detectadas: ${arco.count}/5` + (arco.acronym ? " (+acrónimo ARCO)" : ""),
          ...Object.entries(arco.present)
            .filter(([, v]) => v)
            .map(([k]) => k),
        ],
      },
      {
        id: "consent",
        title: "Gestión de cookies / consentimiento",
        article: "Art. 12 + Art. 14 ter lit. k (si hay tratamiento basado en consentimiento)",
        obligation: "conditional",
        status: hasCookieMgmt ? "pass" : "review",
        weight: 10,
        rationale:
          "La ley no tipifica 'cookies' por nombre. Si hay cookies no esenciales / tracking, el consentimiento debe ser libre, informado, específico, previo e inequívoco, con revocación expedita. Banner o CMP es indiciario, no prueba de validez del consentimiento.",
        evidence: [
          ...cmpScripts.slice(0, 3).map((s) => `script/CMP: ${s}`),
          ...cmpDom.slice(0, 3).map((s) => `DOM: ${s}`),
          ...cookiePolicyHits.slice(0, 2).map((h) => `política cookies: ${h.href || h.text}`),
          ...cookieStorage.slice(0, 3).map((c) => `storage: ${c}`),
          cookieKeywordHit ? "keyword cookie/consent en HTML" : "",
        ].filter(Boolean),
      },
      {
        id: "dpo",
        title: "Delegado / encargado de prevención",
        article: "Art. 14 ter lit. b + Art. 50",
        obligation: "conditional",
        status: dpo.found ? "pass" : "na",
        weight: 5,
        rationale:
          "El Art. 50 dice que el responsable 'podrá' designar delegado. El Art. 14 ter b exige identificar al encargado de prevención 'si existiere'. Ausencia ≠ incumplimiento.",
        evidence: dpo.evidence,
      },
      {
        id: "law",
        title: "Referencia normativa chilena",
        article: "Señal contextual (no es deber formal de citar el número de ley)",
        obligation: "signal",
        status: chileLaw.found ? "pass" : "na",
        weight: 0,
        rationale:
          "Citar Ley 19.628/21.719 o la Agencia ayuda a auditoría local, pero la ley no exige que el sitio mencione el número de la norma para cumplir.",
        evidence: chileLaw.evidence,
      },
      {
        id: "transparency_depth",
        title: "Profundidad Art. 14 ter (d,e,g,h,i,k)",
        article: "Art. 14 ter lits. d–k",
        obligation: "mandatory",
        status:
          Object.values(extras).filter(Boolean).length >= 3
            ? "pass"
            : Object.values(extras).filter(Boolean).length >= 1
              ? "partial"
              : "review",
        weight: 10,
        rationale:
          "Además de la política, deben informarse finalidades, bases de licitud, seguridad, recurso ante la Agencia, transferencias, plazos, revocación, etc. Suele evaluarse mejor abriendo la política completa.",
        evidence: Object.entries(extras)
          .filter(([, v]) => v)
          .map(([k]) => k),
      },
      {
        id: "forms_sensitive",
        title: "Formularios y datos personales/sensibles",
        article: "Art. 12 + Art. 14 ter + Art. 14 quáter (minimización)",
        obligation: formsAnalysis.hasPersonalDataCollection ? "mandatory" : "signal",
        status: formsStatus,
        weight: formsAnalysis.hasPersonalDataCollection ? 15 : 0,
        rationale:
          "Si el sitio pide datos (correo, RUT, salud, pago, etc.), debe informar con claridad al titular y aplicar minimización. Esta revisión mira la superficie del formulario, no el backend.",
        evidence: [
          `riesgo estimado: ${formsAnalysis.riskLevel}`,
          `formularios totales: ${formsAnalysis.totalForms} · con datos: ${formsAnalysis.sensitiveFormCount}`,
          `con aviso cercano: ${formsAnalysis.formsWithNotice} · sin aviso: ${formsAnalysis.formsMissingNotice}`,
          formsAnalysis.categories.length
            ? `categorías: ${formsAnalysis.categories.join(", ")}`
            : "sin categorías detectadas",
          ...formsAnalysis.formReports.slice(0, 3).map(
            (r) =>
              `#${r.index} ${r.method} ${r.action} · campos: ${(r.fields || []).join(", ") || "n/d"} · aviso: ${
                r.noticeOk ? "sí" : "no"
              }`
          ),
        ].filter(Boolean),
      },
    ];
  }

  function scoreChecks(checks) {
    let earned = 0;
    let possible = 0;
    for (const c of checks) {
      if (c.obligation === "signal" || !c.weight) continue;
      if (c.obligation === "conditional" && c.status === "na") continue;
      // DPO optional: only counts when found (bonus) or ignored when na
      if (c.id === "dpo" && c.status === "na") continue;
      if (c.status === "na") continue;

      possible += c.weight;
      if (c.status === "pass") earned += c.weight;
      else if (c.status === "partial") earned += Math.round(c.weight * 0.5);
      else if (c.status === "review" && c.obligation === "conditional") {
        // no penalización plena: indicios insuficientes en homepage
        possible -= Math.round(c.weight * 0.5);
      }
    }
    if (possible <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((earned / possible) * 100)));
  }

  function verdictFrom(score, checks) {
    const mandatoryFails = checks.filter((c) => c.obligation === "mandatory" && c.status === "fail");
    if (mandatoryFails.length >= 2 || score < 40) {
      return {
        level: "critical_gaps",
        label: "Brechas críticas de transparencia observable",
      };
    }
    if (mandatoryFails.length === 1 || score < 65) {
      return {
        level: "partial",
        label: "Cumplimiento parcial / requiere revisión de política",
      };
    }
    if (score < 85) {
      return {
        level: "likely_aligned",
        label: "Indicios favorables — validar contenido sustantivo",
      };
    }
    return {
      level: "strong_signals",
      label: "Señales sólidas en superficie web — no es certificación",
    };
  }

  function scanCompliance() {
    const pageText = getDeepPageText();
    const html = getDeepHtmlSample();
    const nodes = getClickableNodes();

    const privacyHits = findMatches(nodes, PRIVACY_HREF_RE, PRIVACY_TEXT_RE, 6);
    const cookiePolicyHits = findMatches(nodes, COOKIE_POLICY_RE, COOKIE_POLICY_RE, 6);
    const contactHits = findMatches(nodes, CONTACT_HREF_RE, CONTACT_TEXT_RE, 6);
    const formsAnalysis = analyzeFormsAndSensitiveData();
    const { mailtos, formCount } = formsAnalysis;

    const cmpScripts = detectCmpScripts(html);
    const cmpDom = detectCmpDom();
    const cookieStorage = detectCookieStorageSignals();
    const cookieKeywordHit =
      /cookie|cookies|consentimiento|consent[-_ ]?banner|manage\s+cookies|configurar\s+cookies/i.test(html) ||
      COOKIE_POLICY_RE.test(pageText);

    const arco = analyzeArco(pageText);
    const dpo = detectDpoOrEncargado(pageText, html);
    const chileLaw = detectChileanRegulatorySignals(pageText, html);
    const extras = detectTransparencyExtras(pageText);

    const isHttps = window.location.protocol === "https:";
    const hasPrivacy = privacyHits.length > 0;
    const uxTips = buildFormUxTips(formsAnalysis, hasPrivacy);

    const checks = buildChecks({
      isHttps,
      privacyHits,
      cookiePolicyHits,
      contactHits,
      mailtos,
      formCount,
      formsAnalysis,
      cmpScripts,
      cmpDom,
      cookieStorage,
      cookieKeywordHit,
      arco,
      dpo,
      chileLaw,
      extras,
    });

    const score = scoreChecks(checks);
    let verdict = verdictFrom(score, checks);
    if (formsAnalysis.hasPersonalDataCollection && formsAnalysis.riskLevel === "alto") {
      verdict = {
        level: verdict.level === "strong_signals" ? "likely_aligned" : verdict.level,
        label: `${verdict.label} · Atención: formularios de alto riesgo en esta vista`,
      };
    }

    return {
      url: window.location.href,
      scannedAt: new Date().toISOString(),
      score,
      verdict,
      checks,
      formsAnalysis,
      uxTips,
      meta: {
        nodeCount: nodes.length,
        textLength: pageText.length,
        disclaimer:
          "Análisis heurístico de indicios en la página visible. No evalúa tratamientos backend, bases de licitud reales, DPIA, contratos con encargados ni validez jurídica del consentimiento.",
      },
      isHttps,
      hasPrivacyPolicyLink: hasPrivacy,
      hasContactMean: contactHits.length > 0 || mailtos.length > 0 || formCount > 0,
      mentionsARCORights: arco.sufficient,
      mentionsDPO: dpo.found,
      hasCookieOrConsentBanner:
        cmpScripts.length > 0 ||
        cmpDom.length > 0 ||
        cookieStorage.length > 0 ||
        cookiePolicyHits.length > 0 ||
        cookieKeywordHit,
      mentionsChileanLaw: chileLaw.found,
    };
  }

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "scanPage") {
      try {
        // Reintento breve: muchos CMP/SPA inyectan el banner tras document_idle.
        const run = () => sendResponse(scanCompliance());
        if (request.delayMs && request.delayMs > 0) {
          setTimeout(run, Math.min(request.delayMs, 2500));
          return true;
        }
        run();
      } catch (err) {
        sendResponse({ error: String(err && err.message ? err.message : err) });
      }
      return true;
    }
    return false;
  });
})();
