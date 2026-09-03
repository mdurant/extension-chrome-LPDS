document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs && tabs[0];
    if (!activeTab || activeTab.id == null) {
      showError("Sin pestaña activa");
      return;
    }

    const url = activeTab.url || "";
    if (
      url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://") ||
      url.startsWith("edge://") ||
      url.startsWith("about:") ||
      url.startsWith("devtools://")
    ) {
      showError("Página del sistema");
      return;
    }

    requestScan(activeTab.id, 0);
  });
});

function requestScan(tabId, attempt) {
  chrome.tabs.sendMessage(tabId, { action: "scanPage", delayMs: attempt === 0 ? 400 : 0 }, (response) => {
    if (chrome.runtime.lastError || !response || response.error) {
      if (attempt === 0) {
        chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] }, () => {
          if (chrome.runtime.lastError) {
            showError("No se pudo inyectar el análisis");
            return;
          }
          setTimeout(() => requestScan(tabId, 1), 500);
        });
        return;
      }
      showError("Sin respuesta del contenido");
      return;
    }
    renderResults(response);
  });
}

function renderResults(data) {
  const scoreEl = document.getElementById("score");
  const verdictEl = document.getElementById("verdict");
  const score = typeof data.score === "number" ? data.score : 0;

  scoreEl.textContent = `${score}%`;
  scoreEl.className =
    "score-value " + (score < 40 ? "low" : score < 65 ? "medium" : "high");

  if (verdictEl && data.verdict) {
    verdictEl.textContent = data.verdict.label || "";
    verdictEl.dataset.level = data.verdict.level || "";
  }

  const byId = {};
  (data.checks || []).forEach((c) => {
    byId[c.id] = c;
  });

  const ids = [
    "https",
    "privacy",
    "contact",
    "arco",
    "consent",
    "dpo",
    "law",
    "transparency_depth",
    "forms_sensitive",
  ];
  ids.forEach((id) => {
    const check = byId[id];
    if (check) updateCheckUI(check);
    else {
      const legacyMap = {
        https: data.isHttps,
        privacy: data.hasPrivacyPolicyLink,
        contact: data.hasContactMean,
        arco: data.mentionsARCORights,
        consent: data.hasCookieOrConsentBanner,
        dpo: data.mentionsDPO,
        law: data.mentionsChileanLaw,
      };
      if (id in legacyMap) {
        updateItemUI(id, legacyMap[id] ? "pass" : "fail");
      }
    }
  });

  const uxBanner = document.getElementById("ux-banner");
  const uxTips = document.getElementById("ux-tips");
  if (uxBanner && uxTips) {
    const tips = Array.isArray(data.uxTips) ? data.uxTips : [];
    const showTips =
      tips.length > 0 &&
      data.formsAnalysis &&
      data.formsAnalysis.hasPersonalDataCollection;
    uxTips.innerHTML = "";
    if (showTips) {
      tips.forEach((t) => {
        const li = document.createElement("li");
        li.textContent = t;
        uxTips.appendChild(li);
      });
      uxBanner.classList.add("show");
    } else {
      uxBanner.classList.remove("show");
    }
  }

  const evidenceRoot = document.getElementById("evidence");
  if (evidenceRoot) {
    evidenceRoot.innerHTML = "";
    (data.checks || [])
      .filter((c) => c.evidence && c.evidence.length)
      .forEach((c) => {
        const block = document.createElement("details");
        block.className = "evidence-block";
        const summary = document.createElement("summary");
        summary.textContent = `${statusGlyph(c.status)} ${c.title}`;
        block.appendChild(summary);
        const ul = document.createElement("ul");
        c.evidence.forEach((e) => {
          const li = document.createElement("li");
          li.textContent = e;
          ul.appendChild(li);
        });
        const note = document.createElement("p");
        note.className = "evidence-note";
        note.textContent = c.rationale || "";
        block.appendChild(ul);
        block.appendChild(note);
        evidenceRoot.appendChild(block);
      });
  }

  const disc = document.getElementById("disclaimer");
  if (disc && data.meta && data.meta.disclaimer) {
    disc.textContent = data.meta.disclaimer;
  }
}

function statusGlyph(status) {
  switch (status) {
    case "pass":
      return "✅";
    case "partial":
      return "🟠";
    case "review":
      return "🔎";
    case "na":
      return "➖";
    default:
      return "❌";
  }
}

function statusClass(status) {
  switch (status) {
    case "pass":
      return "pass";
    case "partial":
      return "partial";
    case "review":
      return "review";
    case "na":
      return "na";
    default:
      return "fail";
  }
}

function obligationBadge(obligation) {
  switch (obligation) {
    case "mandatory":
      return "Obligatorio";
    case "conditional":
      return "Condicional";
    case "indicator":
      return "Indicador";
    case "signal":
      return "Señal";
    default:
      return "";
  }
}

function updateCheckUI(check) {
  const itemEl = document.getElementById(`item-${check.id}`);
  const iconEl = document.getElementById(`icon-${check.id}`);
  const badgeEl = document.getElementById(`badge-${check.id}`);
  const descEl = document.getElementById(`desc-${check.id}`);
  if (!itemEl || !iconEl) return;

  itemEl.classList.remove("pass", "fail", "partial", "review", "na");
  itemEl.classList.add("item", statusClass(check.status));
  iconEl.textContent = statusGlyph(check.status);

  if (badgeEl) badgeEl.textContent = obligationBadge(check.obligation);
  if (descEl && check.article) descEl.textContent = check.article;
}

function updateItemUI(id, status) {
  updateCheckUI({ id, status, obligation: "mandatory", article: "" });
}

function showError(msg) {
  const scoreEl = document.getElementById("score");
  scoreEl.textContent = "N/A";
  scoreEl.className = "score-value low";
  const label = document.querySelector(".score-label");
  if (label) label.textContent = msg;
  const verdictEl = document.getElementById("verdict");
  if (verdictEl) verdictEl.textContent = "Abra un sitio http(s) e intente de nuevo.";
}
