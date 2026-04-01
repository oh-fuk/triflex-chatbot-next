(function () {
  const cfg = window.ChatbotConfig || {};
  const API = (cfg.apiUrl || "").replace(/\/$/, "");

  let botName = "Triflex Media";
  let themeColor = "#0ea5e9";
  let chatHistory = [];
  let isOpen = false;
  let welcomeShown = false;

  // ── CSS ──────────────────────────────────────────────────
  const style = document.createElement("style");
  style.textContent = `
    #cb-widget * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; }
    #cb-widget { position: fixed; bottom: 24px; right: 24px; z-index: 999999; }

    #cb-toggle {
      width: 64px; height: 64px; border: none; cursor: pointer;
      background: transparent; padding: 0;
      animation: cbFloat 3s ease-in-out infinite;
      display: block; margin-left: auto;
    }
    #cb-toggle img { width: 64px; height: 64px; object-fit: contain; filter: drop-shadow(0 6px 16px rgba(14,165,233,0.5)); transition: transform 0.2s; }
    #cb-toggle:hover img { transform: scale(1.1); }
    @keyframes cbFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

    #cb-box {
      width: 370px; height: 600px; background: white; border-radius: 20px;
      box-shadow: 0 12px 50px rgba(0,0,0,0.18);
      display: flex; flex-direction: column; overflow: hidden; margin-bottom: 12px;
      transform: scale(0.9) translateY(20px); opacity: 0; pointer-events: none;
      transition: all 0.28s cubic-bezier(0.34,1.56,0.64,1);
    }
    #cb-box.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }

    #cb-header {
      background: #0ea5e9; color: white;
      padding: 0.85rem 1rem; display: flex; align-items: center; gap: 0.6rem;
      flex-shrink: 0;
    }
    #cb-header-avatar { width: 32px; height: 32px; object-fit: contain; }
    #cb-header-name { font-weight: 700; font-size: 1rem; flex: 1; }
    .cb-header-btn {
      background: none; border: none; color: white; cursor: pointer;
      font-size: 1.1rem; opacity: 0.85; padding: 4px; border-radius: 6px;
      transition: opacity 0.2s;
    }
    .cb-header-btn:hover { opacity: 1; background: rgba(255,255,255,0.15); }

    #cb-messages {
      flex: 1; overflow-y: auto; padding: 1rem;
      display: flex; flex-direction: column; gap: 0.75rem;
      scroll-behavior: smooth; background: white;
    }
    #cb-messages::-webkit-scrollbar { width: 3px; }
    #cb-messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

    .cb-date-sep { text-align: center; font-size: 0.75rem; color: #94a3b8; font-weight: 600; margin: 0.5rem 0; }

    .cb-msg-row { display: flex; align-items: flex-end; gap: 0.5rem; }
    .cb-msg-row.user { flex-direction: row-reverse; }
    .cb-msg-avatar { width: 28px; height: 28px; object-fit: contain; flex-shrink: 0; }

    .cb-bubble {
      max-width: 75%; padding: 0.65rem 0.9rem; border-radius: 18px;
      font-size: 0.875rem; line-height: 1.55; word-break: break-word;
      animation: cbFadeIn 0.2s ease;
    }
    @keyframes cbFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    .cb-bubble.bot { background: #f1f5f9; color: #1e293b; border-bottom-left-radius: 4px; }
    .cb-bubble.user { background: #e0f2fe; color: #0c4a6e; border-bottom-right-radius: 4px; min-width: 80px; }
    .cb-delivered { font-size: 0.7rem; color: #94a3b8; text-align: right; margin-top: 2px; }

    .cb-typing-row { display: flex; align-items: flex-end; gap: 0.5rem; }
    .cb-typing { background: #f1f5f9; border-radius: 18px; border-bottom-left-radius: 4px; padding: 0.75rem 1rem; display: flex; gap: 4px; align-items: center; }
    .cb-typing span { width: 7px; height: 7px; background: #94a3b8; border-radius: 50%; animation: cbBounce 1.2s infinite; }
    .cb-typing span:nth-child(2) { animation-delay: 0.2s; }
    .cb-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes cbBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }

    .cb-quick-btns { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.25rem; align-items: flex-start; }
    .cb-quick-btn {
      padding: 0.5rem 1.2rem; border-radius: 20px; font-size: 0.82rem; font-weight: 600;
      cursor: pointer; border: none; background: #0ea5e9; color: white;
      transition: opacity 0.2s, transform 0.1s; white-space: nowrap;
    }
    .cb-quick-btn:hover { opacity: 0.88; transform: scale(1.02); }

    #cb-welcome {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 2rem; background: white;
    }
    #cb-welcome img { width: 100px; height: 100px; object-fit: contain; margin-bottom: 1rem; }
    #cb-welcome-name { font-size: 1.3rem; font-weight: 700; color: #1e293b; }

    #cb-footer {
      padding: 0.75rem; border-top: 1px solid #f1f5f9; background: white;
      display: flex; gap: 0.5rem; align-items: flex-end; flex-shrink: 0;
    }
    #cb-input {
      flex: 1; border: 1.5px solid #e2e8f0; border-radius: 24px;
      padding: 0.65rem 1rem; font-size: 0.875rem; outline: none;
      resize: none; max-height: 100px; line-height: 1.4;
      transition: border-color 0.2s; font-family: inherit; background: #f8faff;
    }
    #cb-input:focus { border-color: #0ea5e9; }
    #cb-send {
      width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer;
      background: #0ea5e9; display: flex; align-items: center; justify-content: center;
      transition: opacity 0.2s; flex-shrink: 0;
    }
    #cb-send:hover { opacity: 0.85; }
    #cb-send svg { width: 18px; height: 18px; fill: white; }
    #cb-send:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Cards */
    .cb-card { width: 100%; animation: cbFadeIn 0.3s ease; }
    .cb-card-label { font-size: 0.8rem; color: #0ea5e9; margin-bottom: 0.4rem; font-weight: 600; }
    .cb-card-box { background: white; border: 1px solid #e0f2fe; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 12px rgba(14,165,233,0.1); }
    .cb-card-head { background: #0ea5e9; color: white; padding: 0.65rem 1rem; font-weight: 700; font-size: 0.88rem; }
    .cb-card-body { padding: 0.75rem; }
    .cb-contact-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: #334155; padding: 0.25rem 0; }
    .cb-contact-row span:first-child { font-size: 1rem; width: 22px; text-align: center; }
    .cb-contact-btns { display: flex; gap: 0.45rem; padding: 0 0.75rem 0.75rem; flex-wrap: wrap; }
    .cb-btn { padding: 0.38rem 0.85rem; border-radius: 20px; font-size: 0.78rem; font-weight: 600; cursor: pointer; border: none; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem; transition: opacity 0.2s; }
    .cb-btn:hover { opacity: 0.88; }
    .cb-btn-blue { background: #0ea5e9; color: white; }
    .cb-btn-green { background: #22c55e; color: white; }
    .cb-btn-outline { background: white; color: #0ea5e9; border: 1.5px solid #0ea5e9; }
    .cb-social-btns { display: flex; gap: 0.45rem; padding: 0.75rem; flex-wrap: wrap; }
    .cb-btn-fb { background: #1877f2; color: white; }
    .cb-btn-ig { background: linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888); color: white; }
    .cb-btn-li { background: #0a66c2; color: white; }
    .cb-services-wrap { display: flex; flex-direction: column; gap: 0.35rem; }
    .cb-service-item { background: white; border: 1px solid #e0f2fe; border-radius: 10px; padding: 0.55rem 0.8rem; display: flex; align-items: center; gap: 0.6rem; }
    .cb-service-dot { width: 8px; height: 8px; border-radius: 50%; background: #0ea5e9; flex-shrink: 0; }
    .cb-service-name { font-size: 0.82rem; font-weight: 600; color: #1e293b; }
    .cb-service-desc { font-size: 0.74rem; color: #64748b; }
    .cb-pricing-wrap { display: flex; flex-direction: column; gap: 0.45rem; }
    .cb-pricing-card { background: white; border: 1.5px solid #e0f2fe; border-radius: 12px; padding: 0.8rem; }
    .cb-pricing-card.highlight { border-color: #0ea5e9; background: #f0f9ff; }
    .cb-pricing-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.45rem; }
    .cb-pricing-name { font-weight: 700; font-size: 0.88rem; color: #1e293b; }
    .cb-pricing-price { font-weight: 700; font-size: 0.9rem; color: #0ea5e9; }
    .cb-pricing-badge { font-size: 0.62rem; background: #0ea5e9; color: white; padding: 0.12rem 0.45rem; border-radius: 10px; margin-left: 0.4rem; }
    .cb-pricing-features { display: flex; flex-direction: column; gap: 0.18rem; }
    .cb-pricing-feat { font-size: 0.74rem; color: #475569; display: flex; align-items: center; gap: 0.4rem; }
    .cb-pricing-feat::before { content: "✓"; color: #22c55e; font-weight: 700; }
    .cb-portfolio-wrap { display: flex; flex-direction: column; gap: 0.35rem; }
    .cb-portfolio-item { background: white; border: 1px solid #e0f2fe; border-radius: 10px; padding: 0.6rem 0.8rem; }
    .cb-portfolio-top { display: flex; justify-content: space-between; align-items: center; }
    .cb-portfolio-name { font-size: 0.82rem; font-weight: 600; color: #1e293b; }
    .cb-portfolio-type { font-size: 0.68rem; background: #e0f2fe; color: #0ea5e9; padding: 0.1rem 0.5rem; border-radius: 8px; font-weight: 600; }
    .cb-portfolio-result { font-size: 0.74rem; color: #16a34a; margin-top: 0.2rem; font-weight: 500; }

    @media (max-width: 420px) { #cb-box { width: calc(100vw - 32px); } #cb-widget { bottom: 16px; right: 16px; } }
  `;
  document.head.appendChild(style);

  // ── HTML ─────────────────────────────────────────────────
  const widget = document.createElement("div");
  widget.id = "cb-widget";
  widget.innerHTML = `
    <div id="cb-box">
      <div id="cb-header">
        <img id="cb-header-avatar" src="${API}/bot-icon.png" alt="bot" onerror="this.style.display='none'">
        <div id="cb-header-name">Triflex Media</div>
        <button class="cb-header-btn" id="cb-reset-btn" title="Reset chat">↺</button>
        <button class="cb-header-btn" id="cb-close" title="Close">✕</button>
      </div>
      <div id="cb-welcome">
        <img src="${API}/bot-icon.png" alt="bot" onerror="this.style.display='none'">
        <div id="cb-welcome-name">Triflex Media</div>
      </div>
      <div id="cb-messages" style="display:none" role="log" aria-live="polite"></div>
      <div id="cb-footer">
        <textarea id="cb-input" placeholder="Type your problem.." rows="1" aria-label="Message"></textarea>
        <button id="cb-send" aria-label="Send">
          <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
        </button>
      </div>
    </div>
    <button id="cb-toggle" aria-label="Open chat">
      <img src="${API}/bot-icon.png" alt="chat" onerror="this.style.display='none'">
    </button>
  `;
  document.body.appendChild(widget);

  const box = document.getElementById("cb-box");
  const toggle = document.getElementById("cb-toggle");
  const closeBtn = document.getElementById("cb-close");
  const resetBtn = document.getElementById("cb-reset-btn");
  const input = document.getElementById("cb-input");
  const sendBtn = document.getElementById("cb-send");
  const messages = document.getElementById("cb-messages");
  const welcome = document.getElementById("cb-welcome");

  // Load config
  fetch(API + "/api/config").then(r => r.json()).then(data => {
    botName = data.bot_name || botName;
    document.getElementById("cb-header-name").textContent = botName;
    document.getElementById("cb-welcome-name").textContent = botName;
  }).catch(() => { });

  function openChat() {
    isOpen = true; box.classList.add("open");
    toggle.style.animation = "none";
    if (!welcomeShown) { welcomeShown = true; }
    input.focus();
  }
  function closeChat() {
    isOpen = false; box.classList.remove("open");
    toggle.style.animation = "";
  }
  function resetChat() {
    chatHistory = [];
    messages.innerHTML = "";
    messages.style.display = "none";
    welcome.style.display = "flex";
    welcomeShown = false;
  }

  toggle.addEventListener("click", () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener("click", closeChat);
  resetBtn.addEventListener("click", resetChat);

  // ── Format text ──────────────────────────────────────────
  function formatText(text) {
    let t = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<strong>$1</strong>");
    const lines = t.split("\n");
    let html = "", inList = false;
    for (let line of lines) {
      line = line.trim();
      if (!line) { if (inList) { html += "</ul>"; inList = false; } continue; }
      if (/^[•\-]\s/.test(line)) {
        if (!inList) { html += '<ul style="margin:0.3rem 0 0.3rem 0.5rem;padding:0;list-style:none;">'; inList = true; }
        html += `<li style="margin:0.2rem 0;display:flex;gap:0.4rem;align-items:flex-start;"><span style="color:#0ea5e9;font-weight:700;flex-shrink:0;">•</span><span>${line.replace(/^[•\-]\s/, "")}</span></li>`;
      } else {
        if (inList) { html += "</ul>"; inList = false; }
        html += `<p style="margin:0.2rem 0;">${line}</p>`;
      }
    }
    if (inList) html += "</ul>";
    return html;
  }

  // ── Add message ──────────────────────────────────────────
  function addMessage(role, text) {
    if (messages.style.display === "none") {
      welcome.style.display = "none";
      messages.style.display = "flex";
      // Add date separator
      const sep = document.createElement("div");
      sep.className = "cb-date-sep";
      sep.textContent = "Today";
      messages.appendChild(sep);
    }
    const row = document.createElement("div");
    row.className = "cb-msg-row " + role;

    if (role === "bot") {
      const av = document.createElement("img");
      av.src = API + "/bot-icon.png"; av.className = "cb-msg-avatar";
      av.onerror = () => av.style.display = "none";
      row.appendChild(av);
    }

    const bubble = document.createElement("div");
    bubble.className = "cb-bubble " + role;
    if (role === "bot") bubble.innerHTML = formatText(text);
    else {
      const wrap = document.createElement("div");
      const b = document.createElement("div"); b.textContent = text; b.className = "cb-bubble user";
      const d = document.createElement("div"); d.className = "cb-delivered"; d.textContent = "Delivered";
      wrap.appendChild(b); wrap.appendChild(d);
      messages.appendChild(wrap);
      messages.scrollTop = messages.scrollHeight;
      return wrap;
    }
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  function showTyping() {
    if (messages.style.display === "none") { welcome.style.display = "none"; messages.style.display = "flex"; }
    const row = document.createElement("div");
    row.className = "cb-typing-row"; row.id = "cb-typing";
    const av = document.createElement("img");
    av.src = API + "/bot-icon.png"; av.className = "cb-msg-avatar";
    av.onerror = () => av.style.display = "none";
    const t = document.createElement("div"); t.className = "cb-typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    row.appendChild(av); row.appendChild(t);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }
  function removeTyping() { const t = document.getElementById("cb-typing"); if (t) t.remove(); }

  // ── Card renderer ────────────────────────────────────────
  function renderCard(parsed) {
    if (messages.style.display === "none") { welcome.style.display = "none"; messages.style.display = "flex"; }
    const wrap = document.createElement("div");
    wrap.className = "cb-card";
    if (parsed.text) { const l = document.createElement("div"); l.className = "cb-card-label"; l.textContent = parsed.text; wrap.appendChild(l); }

    if (parsed.type === "contact") {
      const d = parsed.data;
      const b = document.createElement("div"); b.className = "cb-card-box";
      b.innerHTML = `<div class="cb-card-head">📬 Get In Touch</div><div class="cb-card-body"><div class="cb-contact-row"><span>📧</span><span>${d.email}</span></div><div class="cb-contact-row"><span>📞</span><span>${d.phone}</span></div><div class="cb-contact-row"><span>📍</span><span>${d.address}</span></div><div class="cb-contact-row"><span>⏱️</span><span>Replies ${d.response_time}</span></div></div><div class="cb-contact-btns"><a href="mailto:${d.email}" class="cb-btn cb-btn-blue">✉️ Email</a><a href="https://wa.me/${d.whatsapp.replace(/\D/g, "")}" target="_blank" class="cb-btn cb-btn-green">💬 WhatsApp</a><a href="tel:${d.phone}" class="cb-btn cb-btn-outline">📞 Call</a></div>`;
      wrap.appendChild(b);
    } else if (parsed.type === "social") {
      const d = parsed.data;
      const b = document.createElement("div"); b.className = "cb-card-box";
      b.innerHTML = `<div class="cb-card-head">🌐 Follow Us</div><div class="cb-social-btns"><a href="${d.facebook}" target="_blank" class="cb-btn cb-btn-fb">👍 Facebook</a><a href="${d.instagram}" target="_blank" class="cb-btn cb-btn-ig">📸 Instagram</a><a href="${d.linkedin}" target="_blank" class="cb-btn cb-btn-li">💼 LinkedIn</a></div>`;
      wrap.appendChild(b);
    } else if (parsed.type === "services") {
      const sw = document.createElement("div"); sw.className = "cb-services-wrap";
      sw.innerHTML = parsed.data.map(s => `<div class="cb-service-item"><div class="cb-service-dot"></div><div><div class="cb-service-name">${s.name}</div><div class="cb-service-desc">${s.desc}</div></div></div>`).join("");
      wrap.appendChild(sw);
    } else if (parsed.type === "pricing") {
      const pw = document.createElement("div"); pw.className = "cb-pricing-wrap";
      pw.innerHTML = parsed.data.map(p => `<div class="cb-pricing-card ${p.highlight ? "highlight" : ""}"><div class="cb-pricing-top"><div class="cb-pricing-name">${p.name}${p.highlight ? '<span class="cb-pricing-badge">Popular</span>' : ""}</div><div class="cb-pricing-price">${p.price}</div></div><div class="cb-pricing-features">${p.features.map(f => `<div class="cb-pricing-feat">${f}</div>`).join("")}</div></div>`).join("");
      wrap.appendChild(pw);
    } else if (parsed.type === "portfolio") {
      const pw = document.createElement("div"); pw.className = "cb-portfolio-wrap";
      pw.innerHTML = parsed.data.map(p => `<div class="cb-portfolio-item"><div class="cb-portfolio-top"><div class="cb-portfolio-name">${p.name}</div><div class="cb-portfolio-type">${p.type}</div></div><div class="cb-portfolio-result">✅ ${p.result}</div></div>`).join("");
      wrap.appendChild(pw);
    }
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }

  // ── Stream response ──────────────────────────────────────
  async function streamResponse(text) {
    try {
      const res = await fetch(API + "/api/chat/stream", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: chatHistory.slice(-10) })
      });
      removeTyping();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", fullReply = "", msgDiv = null, isCard = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (raw === "[DONE]") break;
          try {
            const parsed = JSON.parse(raw);
            if (parsed.error) { addMessage("bot", "⚠️ " + parsed.error); break; }
            if (parsed.chunk) {
              fullReply += parsed.chunk;
              if (fullReply.trim().startsWith("{")) { isCard = true; }
              else {
                isCard = false;
                if (!msgDiv) {
                  if (messages.style.display === "none") { welcome.style.display = "none"; messages.style.display = "flex"; const sep = document.createElement("div"); sep.className = "cb-date-sep"; sep.textContent = "Today"; messages.appendChild(sep); }
                  const row = document.createElement("div"); row.className = "cb-msg-row bot";
                  const av = document.createElement("img"); av.src = API + "/bot-icon.png"; av.className = "cb-msg-avatar"; av.onerror = () => av.style.display = "none";
                  msgDiv = document.createElement("div"); msgDiv.className = "cb-bubble bot";
                  row.appendChild(av); row.appendChild(msgDiv); messages.appendChild(row);
                }
                msgDiv.innerHTML = formatText(fullReply);
                messages.scrollTop = messages.scrollHeight;
              }
            }
          } catch { }
        }
      }

      if (isCard && fullReply.trim().startsWith("{")) {
        try {
          const cardData = JSON.parse(fullReply.trim());
          if (cardData.type === "mixed") {
            if (msgDiv) msgDiv.closest(".cb-msg-row")?.remove();
            if (cardData.text_response) addMessage("bot", cardData.text_response);
            if (cardData.card) renderCard(cardData.card);
          } else if (cardData.type) {
            if (msgDiv) msgDiv.closest(".cb-msg-row")?.remove();
            renderCard(cardData);
          } else { if (!msgDiv) addMessage("bot", fullReply); }
        } catch { if (!msgDiv) addMessage("bot", fullReply); else msgDiv.innerHTML = formatText(fullReply); }
      }

      if (fullReply) chatHistory.push({ role: "model", content: fullReply });
    } catch (err) {
      removeTyping();
      addMessage("bot", "⚠️ Connection error. Please try again.");
    }
    sendBtn.disabled = false;
    input.focus();
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = ""; input.style.height = "auto";
    sendBtn.disabled = true;
    // Show user message
    if (messages.style.display === "none") { welcome.style.display = "none"; messages.style.display = "flex"; const sep = document.createElement("div"); sep.className = "cb-date-sep"; sep.textContent = "Today"; messages.appendChild(sep); }
    const wrap = document.createElement("div");
    const b = document.createElement("div"); b.className = "cb-bubble user"; b.textContent = text;
    const d = document.createElement("div"); d.className = "cb-delivered"; d.textContent = "Delivered";
    wrap.appendChild(b); wrap.appendChild(d); messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
    chatHistory.push({ role: "user", content: text });
    showTyping();
    await streamResponse(text);
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
  input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 100) + "px"; });
})();
