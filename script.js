// ====== SETTINGS ======
// WhatsApp number for orders & payments (061 483 5842 → +27 61 483 5842)
const WHATSAPP = "27614835842";

// Bank details for EFT payments. Add your account holder name below if you want it shown.
const BANK = { holder: "", bank: "Standard Bank", type: "MyMo Account", number: "10277149566", branch: "051001" };

const PRODUCTS = [
  { id: 1, name: "The Silent Set", cat: "sets", price: 1200, img: "silent-set", desc: "Heavy cotton tracksuit · Black, Gray, Navy", badge: "Bestseller" },
  { id: 2, name: "The Mafia Set", cat: "sets", price: 1200, img: "mafia-set", desc: "Quarter-zip tracksuit with SA crest" },
  { id: 3, name: "The Campus Set", cat: "sets", price: 1000, img: "campus-set", desc: "Hoodie + shorts · Gray, Black" },
  { id: 4, name: "The Baseball Jacket", cat: "jackets", price: 950, img: "baseball-jacket", desc: "Varsity jacket · Black, White" },
  { id: 5, name: "The Silent Tee", cat: "tees", price: 500, img: "silent-tee-black", alt: "silent-tee-white", desc: "Statue graphic, red slash · Black, White", badge: "New" },
  { id: 6, name: "The Classic Tee", cat: "tees", price: 400, img: "classic-tee-black", alt: "classic-tee-white", desc: "Vertical OMERTÀ print · Black, White" },
  { id: 7, name: "Pretty Girls Crop Top", cat: "girls", price: 300, img: "crop-top", desc: "Heavyweight cotton · White, Black" },
  { id: 8, name: "Girls Combo", cat: "girls", price: 700, img: "girls-combo", desc: "Crop top + wide-leg sweatpants", badge: "Set" }
];
const SIZES = ["S", "M", "L", "XL", "XXL"];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => "R" + n.toLocaleString("en-ZA");
let cart = [];
try { cart = JSON.parse(localStorage.getItem("omerta-cart")) || []; } catch (e) {}
let filter = "all", sort = "default";

// ====== LOADER + NAV ======
window.addEventListener("load", () => setTimeout(() => $("#loader").classList.add("done"), 900));
addEventListener("scroll", () => $("#nav").classList.toggle("solid", scrollY > 60));
$("#burger").onclick = () => document.body.classList.toggle("menu");
$$("#links a").forEach(a => a.onclick = () => document.body.classList.remove("menu"));
addEventListener("scroll", () => { // hero parallax
  if (scrollY < innerHeight) $("#heroBg").style.translate = `0 ${scrollY * 0.25}px`;
});

// ====== SHOP ======
function renderGrid() {
  let list = PRODUCTS.filter(p => filter === "all" || p.cat === filter);
  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);
  $("#grid").innerHTML = list.map((p, i) => `
    <article class="card ${p.alt ? "has-alt" : ""}" style="animation-delay:${i * 0.08}s" data-id="${p.id}">
      <div class="pic">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
        <img src="images/${p.img}.png" alt="${p.name}" loading="lazy">
        ${p.alt ? `<img class="alt" src="images/${p.alt}.png" alt="${p.name} alternate colour" loading="lazy">` : ""}
      </div>
      <div class="info">
        <h3>${p.name}</h3><p>${p.desc}</p>
        <div class="sizes">${SIZES.map((s, j) => `<button class="${j === 1 ? "on" : ""}">${s}</button>`).join("")}</div>
        <div class="row"><span class="price">${money(p.price)}</span><button class="add">Add to bag</button></div>
      </div>
    </article>`).join("");
}
$("#filters").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  $$("#filters button").forEach(x => x.classList.remove("on")); b.classList.add("on");
  filter = b.dataset.f; renderGrid();
});
$("#sort").onchange = e => { sort = e.target.value; renderGrid(); };
$("#grid").addEventListener("click", e => {
  const card = e.target.closest(".card"); if (!card) return;
  if (e.target.matches(".sizes button")) {
    $$(".sizes button", card).forEach(x => x.classList.remove("on")); e.target.classList.add("on");
  }
  if (e.target.matches(".add")) {
    addToCart(+card.dataset.id, $(".sizes .on", card).textContent);
  }
});

// ====== CART ======
function save() { try { localStorage.setItem("omerta-cart", JSON.stringify(cart)); } catch (e) {} }
function addToCart(id, size) {
  const found = cart.find(c => c.id === id && c.size === size);
  found ? found.qty++ : cart.push({ id, size, qty: 1 });
  renderCart(); toast("Added to bag ✦");
  const b = $("#bagBtn"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
}
function renderCart() {
  save();
  const count = cart.reduce((s, c) => s + c.qty, 0);
  $("#bagCount").textContent = count;
  let total = 0;
  $("#items").innerHTML = cart.length ? cart.map((c, i) => {
    const p = PRODUCTS.find(x => x.id === c.id); total += p.price * c.qty;
    return `<div class="ci"><img src="images/${p.img}.png" alt="${p.name}">
      <div><h4>${p.name}</h4><small>Size ${c.size} · ${money(p.price)}</small>
      <div class="qty"><button data-a="minus" data-i="${i}">−</button><span>${c.qty}</span><button data-a="plus" data-i="${i}">+</button></div></div>
      <button class="rm" data-a="rm" data-i="${i}">Remove</button></div>`;
  }).join("") : `<p class="empty">Your bag is silent.<br>Add something.</p>`;
  $("#total").textContent = money(total);
}
$("#items").addEventListener("click", e => {
  const a = e.target.dataset.a; if (!a) return;
  const i = +e.target.dataset.i;
  if (a === "plus") cart[i].qty++;
  if (a === "minus" && --cart[i].qty < 1) cart.splice(i, 1);
  if (a === "rm") cart.splice(i, 1);
  renderCart();
});
const toggleBag = open => document.body.classList.toggle("open", open);
$("#bagBtn").onclick = () => toggleBag(true);
$("#closeBag").onclick = $("#overlay").onclick = () => toggleBag(false);
$("#checkout").onclick = () => {
  if (!cart.length) return toast("Your bag is empty");
  let total = 0;
  const lines = cart.map(c => {
    const p = PRODUCTS.find(x => x.id === c.id); total += p.price * c.qty;
    return `• ${p.name} (${c.size}) x${c.qty} – ${money(p.price * c.qty)}`;
  });
  const msg = `Hi Omertà SA, I'd like to place an order and arrange payment:\n${lines.join("\n")}\nTotal: ${money(total)}`;
  open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
};
// ====== EFT PAYMENT ======
let ref = "";
const cartTotal = () => cart.reduce((s, c) => s + PRODUCTS.find(x => x.id === c.id).price * c.qty, 0);
const cartLines = () => cart.map(c => { const p = PRODUCTS.find(x => x.id === c.id); return `• ${p.name} (${c.size}) x${c.qty} – ${money(p.price * c.qty)}`; });
$("#eftBtn").onclick = () => {
  if (!cart.length) return toast("Your bag is empty");
  ref = "OMERTA" + Math.floor(1000 + Math.random() * 9000);
  const rows = [["Bank", BANK.bank], ["Account type", BANK.type], ["Account number", BANK.number], ["Branch code", BANK.branch], ["Reference", ref]];
  if (BANK.holder) rows.unshift(["Account name", BANK.holder]);
  $("#bankRows").innerHTML = rows.map(([k, v]) => `<div class="b-row"><span>${k}</span><b>${v}</b><button data-copy="${v}">Copy</button></div>`).join("");
  $("#eftTotal").textContent = money(cartTotal());
  toggleBag(false);
  $("#eft").classList.add("show");
};
$("#bankRows").addEventListener("click", e => {
  const v = e.target.dataset.copy; if (!v) return;
  (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => toast("Copied ✦"), () => toast(v));
});
$("#eftClose").onclick = () => $("#eft").classList.remove("show");
$("#eft").onclick = e => { if (e.target.id === "eft") $("#eft").classList.remove("show"); };
$("#eftSend").onclick = () => {
  const msg = `Hi Omertà SA, I've paid by EFT.\nReference: ${ref}\n${cartLines().join("\n")}\nTotal paid: ${money(cartTotal())}\nProof of payment attached below.`;
  open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
};
let tt;
function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), 1800); }

// ====== SCROLL REVEAL + COUNTERS ======
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in");
  $$("[data-n]", e.target).forEach(el => {
    const to = +el.dataset.n, t0 = performance.now();
    (function tick(t) {
      const k = Math.min((t - t0) / 1600, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  });
  io.unobserve(e.target);
}), { threshold: 0.15 });
$$(".reveal").forEach(el => io.observe(el));

// ====== LOOKBOOK DRAG SCROLL ======
const strip = $("#strip"); let down = false, sx, sl;
strip.onmousedown = e => { down = true; sx = e.pageX; sl = strip.scrollLeft; strip.style.cursor = "grabbing"; };
addEventListener("mouseup", () => { down = false; strip.style.cursor = "grab"; });
strip.onmousemove = e => { if (down) { e.preventDefault(); strip.scrollLeft = sl - (e.pageX - sx); } };

// ====== NEWSLETTER ======
$("#joinForm").onsubmit = e => {
  e.preventDefault();
  $("#joinMsg").textContent = "Welcome to the family. Silence is golden ✦";
  e.target.reset();
};

renderGrid(); renderCart();
