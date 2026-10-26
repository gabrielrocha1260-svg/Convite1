/* ===== CONFIGURAÇÃO =====
   whatsappNumber: formato internacional, só dígitos (ex.: 5511900000000). Vazio = mostra um aviso.
   noMaxEscapes: quantas vezes o botão "Não" foge antes de cansar.
   img (em cada ideia): caminho de uma foto, ex.: "assets/tour.jpg". Vazio = fundo neutro. */
const CONFIG = { whatsappNumber: "5511979938429", noMaxEscapes: 5 };

const ACTIVITIES = [
  { id:"tour", cat:"Comer", feat:1, title:"Tour gastronômico", desc:"Escolher alguns lugares, experimentar comidas diferentes e decidir juntos qual merece entrar pro nosso ranking oficial.", reply:"Topo. Mas o ranking oficial vai ter critérios rigorosos.", img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85" },
  { id:"alturas", cat:"Explorar", feat:1, title:"Um rolê nas alturas", desc:"Visitar um lugar com uma vista absurda, observar a cidade lá de cima e fingir que a gente planejou tudo perfeitamente.", reply:"Fechado. Eu finjo que foi tudo planejado.", img:"https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=85" },
  { id:"estratosfera", cat:"Explorar", title:"Conhecer a Estratosfera", desc:"Um passeio diferente que está na minha lista pra conhecer com você. O resto a gente combina no caminho.", reply:"Fiquei curiosa. Topo conhecer.", img:"https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=85" },
  { id:"cafe", cat:"Comer", title:"Um café sem hora pra acabar", desc:"Pedir alguma coisa gostosa e começar falando de música, até perceber que já estamos conversando há horas.", reply:"Aviso que vou pedir mais um café sem perceber a hora.", img:"https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=85" },
  { id:"surpresa", cat:"Explorar", title:"Um date surpresa", desc:"Eu escolho uma parte do rolê, você escolhe outra e a gente descobre o resto no caminho.", reply:"Combinado: eu escolho a minha parte.", img:"https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=85" },
  { id:"porsol", cat:"Relaxar", feat:1, title:"Pôr do sol e conversa boa", desc:"Encontrar um lugar bonito, sentar juntos e deixar o tempo passar sem muita preocupação.", reply:"Sem pressa e sem olhar o relógio. Aceito.", img:"https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=85" },
  { id:"musica", cat:"Só pela resenha", title:"Noite de música", desc:"Cantar Luan Santana como se estivéssemos em um show lotado, mesmo que nossa plateia seja composta por duas pessoas.", reply:"Já aviso que sei a letra toda.", img:"https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85" },
  { id:"futebol", cat:"Só pela resenha", title:"Futebol, comida e sofrimento compartilhado", desc:"Assistir ao Corinthians, pedir alguma coisa gostosa e descobrir se nossa relação sobrevive a um gol perdido aos 48 do segundo tempo.", reply:"Topo, mas o sofrimento é dividido meio a meio.", img:"https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=85" },
  { id:"cultural", cat:"Explorar", title:"Um rolê cultural", desc:"Visitar uma exposição, conhecer um espaço diferente, tirar umas fotos e depois discutir qual foi a parte mais interessante.", reply:"Topo. Já vou ter opinião sobre tudo.", img:"https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=85" },
  { id:"conversas", cat:"Só pela resenha", title:"Conversas que mudam o mundo", desc:"Comer alguma coisa, trocar ideias sobre política e imaginar como seria construir um mundo mais justo. A revolução pode esperar a sobremesa.", reply:"Aceito. A revolução espera, a sobremesa não.", img:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85" }
];

const $ = id => document.getElementById(id);
const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
const num = (CONFIG.whatsappNumber || "").replace(/\D/g, "");
const wa = text => `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
const warn = (el, on) => { el.hidden = !on; el.textContent = on ? "Falta configurar o número em CONFIG.whatsappNumber." : ""; };
const bgOf = (a, i) => a.img ? `url("${a.img}")` : `linear-gradient(${120 + i * 23}deg,#2b2b2b,#0a0a0a 70%)`;

/* ----- telas ----- */
const screens = { invite: $("screen-invite"), catalog: $("screen-catalog"), declined: $("screen-declined") };
function show(name) {
  for (const k in screens) screens[k].hidden = k !== name;
  document.body.dataset.screen = name;
  window.scrollTo(0, 0);
  const f = screens[name].querySelector("[data-focus]");
  if (f) f.focus({ preventScroll: true });
}

/* ----- Não que foge (só ao ser tocado) ----- */
const yes = $("btnYes"), no = $("btnNo"), runner = $("runner"), quip = $("quip"), noCharacter = $("noCharacter"), declWrap = $("declineWrap");
const lines = ["Ei! Nem clicou direito e já quer me dispensar?", "Pensa com carinho… eu sou só um botãozinho.", "Calma, eu tenho sentimentos digitais!", "Você é persistente, hein? Eu também.", "Tá bom, cansei de correr. Mas a decisão é sua."];
let esc = 0, lastDodge = 0, stopT, restT;

function rest() {
  clearTimeout(stopT); clearTimeout(restT);
  runner.classList.remove("run", "running"); runner.style.left = runner.style.top = "";
  no.textContent = "Ok, cansei";
  quip.textContent = "Tá bom, parei. Prometo não fugir mais. A escolha é sua 💌";
}
function dodge() {
  if (esc >= CONFIG.noMaxEscapes) return false;
  esc++; lastDodge = Date.now();
  const r = runner.getBoundingClientRect(), w = r.width || 104, h = (r.height || 48) + 24, m = 16;
  let x, y, t = 0;
  do {
    x = m + Math.random() * Math.max(0, innerWidth - w - 2 * m);
    y = m + Math.random() * Math.max(0, innerHeight - h - 2 * m);
    t++;
  } while (t < 12 && Math.hypot(x - r.left, y - r.top) < 160);
  if (!runner.classList.contains("run")) {
    runner.classList.add("run"); runner.style.left = r.left + "px"; runner.style.top = r.top + "px";
    void runner.offsetWidth; /* fixa a posição de partida antes de correr */
  }
  runner.classList.add("has-legs", "running");
  runner.style.left = x + "px"; runner.style.top = y + "px";
  clearTimeout(stopT); stopT = setTimeout(() => runner.classList.remove("running"), reduce ? 0 : 720);
  quip.textContent = lines[Math.min(esc - 1, lines.length - 1)];
  noCharacter.hidden = false;
  declWrap.hidden = false;
  if (esc >= CONFIG.noMaxEscapes) restT = setTimeout(rest, reduce ? 0 : 1600);
  return true;
}
no.addEventListener("pointerdown", e => { if (dodge()) e.preventDefault(); });
no.addEventListener("click", () => {
  if (Date.now() - lastDodge < 600) return; /* o mesmo toque não conta duas vezes */
  if (!dodge()) show("declined");
});
$("btnDeclineForReal").addEventListener("click", () => show("declined"));
$("btnBack").addEventListener("click", () => {
  esc = 0; rest(); no.textContent = "Não"; runner.classList.remove("has-legs");
  quip.textContent = ""; noCharacter.hidden = true; declWrap.hidden = true;
  show("invite"); no.focus();
});

/* ----- Sim: cortina e catálogo ----- */
yes.addEventListener("click", () => {
  const c = $("curtain");
  c.classList.add("on");
  setTimeout(() => { show("catalog"); c.classList.remove("on"); }, reduce ? 0 : 900);
});

/* ----- catálogo ----- */
$("cards").innerHTML = ACTIVITIES.map((a, i) => `
<li class="card${a.feat ? " card--feat" : ""}" data-id="${a.id}" data-cat="${a.cat}">
  <div class="card__ph" style="background-image:${bgOf(a, i)}"></div>
  <div class="card__body"><span class="tag">${a.cat}</span><h3>${a.title}</h3><p>${a.desc}</p>
  <button class="btn" type="button" data-open="${a.id}">Ver essa ideia</button></div>
</li>`).join("");

const cats = ["Tudo", ...new Set(ACTIVITIES.map(a => a.cat))];
$("chips").innerHTML = cats.map((c, i) => `<button class="chip" type="button" aria-pressed="${i === 0}" data-c="${c}">${c}</button>`).join("");
$("chips").addEventListener("click", e => {
  const b = e.target.closest(".chip"); if (!b) return;
  $("chips").querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", x === b));
  $("cards").querySelectorAll(".card").forEach(c => { c.hidden = b.dataset.c !== "Tudo" && c.dataset.cat !== b.dataset.c; });
});

/* ----- detalhes + WhatsApp ----- */
const dlg = $("detail"), live = $("live");
let opener = null, current = null;
$("cards").addEventListener("click", e => {
  const b = e.target.closest("[data-open]"); if (!b) return;
  opener = b; current = ACTIVITIES.findIndex(a => a.id === b.dataset.open);
  const a = ACTIVITIES[current];
  $("detailPh").style.backgroundImage = bgOf(a, current);
  $("detailTag").textContent = a.cat;
  $("detailTitle").textContent = a.title;
  $("detailDesc").textContent = a.desc;
  $("detailReply").textContent = a.reply;
  $("btnWhats").href = wa(`Escolhi: ${a.title}. ${a.reply}`);
  warn($("whatsWarn"), !num);
  typeof dlg.showModal === "function" ? dlg.showModal() : dlg.setAttribute("open", "");
});
$("btnWhats").addEventListener("click", () => {
  const a = ACTIVITIES[current];
  $("cards").querySelectorAll(".card").forEach(c => {
    const on = c.dataset.id === a.id;
    c.classList.toggle("on", on);
    c.querySelector("[data-open]").textContent = on ? "Escolhida" : "Ver essa ideia";
  });
  live.textContent = `Anotei: ${a.title}. Ainda não é reserva.`;
});
dlg.addEventListener("click", e => { if (e.target === dlg || e.target.closest("[data-close]")) dlg.close(); });
dlg.addEventListener("close", () => { if (opener) opener.focus(); });

/* ----- sugerir outro rolê ----- */
$("btnSuggest").href = wa("Tenho outra ideia de rolê: ");
warn($("suggestWarn"), !num);
