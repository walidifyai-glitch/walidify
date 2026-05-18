import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: 'AIzaSyAHO9XOzAdSZ9KWIP9ss2v6aUaSFyLAGtU',
  authDomain: 'walidify.firebaseapp.com',
  projectId: 'walidify',
  storageBucket: 'walidify.firebasestorage.app',
  messagingSenderId: '277638219996',
  appId: '1:277638219996:web:661f2d7c105df26d38cc19',
  databaseURL: 'https://walidify-default-rtdb.firebaseio.com'
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let state = {
  products: [],
  categories: [],
  cart: JSON.parse(localStorage.getItem('wld-cart') || '[]'),
  favorites: JSON.parse(localStorage.getItem('wld-favs') || '[]'),
  currentPage: 'home',
  currentCategory: 'all',
  productModal: null,
  orderProduct: null,
  lang: localStorage.getItem('wld-lang') || 'en',
  theme: localStorage.getItem('wld-theme') || 'dark',
  galleryIdx: 0,
};

// ── Slideshow state ──────────────────────────────────────────────
let _slideshowTimer = null;
let _slideshowManual = false;

function startSlideshow(media) {
  stopSlideshow();
  if (!media || media.length <= 1) return;
  _slideshowManual = false;
  updateAutoIndicator(false);
  _slideshowTimer = setInterval(() => {
    if (_slideshowManual) { stopSlideshow(); return; }
    state.galleryIdx = (state.galleryIdx + 1) % media.length;
    renderGalleryFrame(media, state.galleryIdx);
  }, 2000);
}

function stopSlideshow() {
  if (_slideshowTimer) { clearInterval(_slideshowTimer); _slideshowTimer = null; }
}

function updateAutoIndicator(isAuto) {
  const el = document.querySelector('.pm-auto-indicator');
  if (!el) return;
  el.textContent = isAuto ? '● Auto' : '◎ Manual';
  el.classList.toggle('manual', !isAuto);
}

function renderGalleryFrame(media, idx) {
  const gallery = document.getElementById('pm-gallery');
  if (!gallery) return;
  const old = gallery.querySelector('img, video');
  if (old) old.remove();
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderMediaItem(media, idx);
  const newEl = wrapper.firstElementChild;
  if (newEl) {
    newEl.classList.add('slide-enter');
    gallery.insertBefore(newEl, gallery.firstChild);
  }
  gallery.querySelectorAll('.pm-dot').forEach((dot, i) => dot.classList.toggle('active', i === idx));
}
// ────────────────────────────────────────────────────────────────

const i18n = {
  en: {
    copy_link: 'Copy Link', link_copied: 'Link copied successfully!',
    home: 'Home', categories: 'Categories', favorites: 'Favorites',
    cart: 'Cart', settings: 'Settings',
    hero_title: 'Premium Digital Products', hero_sub: 'Discover AI prompts, PDF books, and exclusive digital resources.',
    all: 'All', featured: 'Featured', view_now: 'View Now',
    add_cart: 'Add to Cart', order_now: 'Order Now', add_fav: 'Add to Favorites',
    search: 'Search products...', original_price: 'Original Price', discounted: 'Discounted',
    fav_empty: 'No favorites yet. Heart a product!', cart_empty: 'Your cart is empty.',
    order_title: 'Place Your Order', order_sub: "Fill in your details and we'll contact you on WhatsApp.",
    first_name: 'First Name', last_name: 'Last Name', phone: 'Phone / WhatsApp',
    email: 'Email (optional)', notes: 'Notes (optional)', submit_order: 'Submit Order',
    order_success_title: 'Order Sent!',
    order_success_msg: 'Your order has been sent successfully. We will contact you soon on your WhatsApp number.',
    payment_methods: 'Select Payment Method', total: 'Total',
    theme_setting: 'Dark Mode', lang_setting: 'Language', appearance: 'Appearance',
    off: 'OFF', see_all: 'See all', no_products: 'No products found.',
    back: 'Back', close: 'Close', remove: 'Remove',
    fav_added: 'Added to favorites', fav_removed: 'Removed from favorites',
    cart_added: 'Added to cart',
  },
  ar: {
    copy_link: 'نسخ الرابط', link_copied: 'تم نسخ الرابط بنجاح!',
    home: 'الرئيسية', categories: 'التصنيفات', favorites: 'المفضلة',
    cart: 'السلة', settings: 'الإعدادات',
    hero_title: 'منتجات رقمية متميزة', hero_sub: 'اكتشف برومبتات الذكاء الاصطناعي، كتب PDF، وموارد رقمية حصرية.',
    all: 'الكل', featured: 'المميزة', view_now: 'عرض',
    add_cart: 'أضف للسلة', order_now: 'اطلب الآن', add_fav: 'أضف للمفضلة',
    search: 'ابحث عن المنتجات...', original_price: 'السعر الأصلي', discounted: 'السعر المخفض',
    fav_empty: 'لا يوجد مفضلات بعد. أضف منتجًا!', cart_empty: 'السلة فارغة.',
    order_title: 'تقديم الطلب', order_sub: 'أدخل بياناتك وسنتواصل معك على واتساب.',
    first_name: 'الاسم الأول', last_name: 'اسم العائلة', phone: 'الهاتف / واتساب',
    email: 'البريد (اختياري)', notes: 'ملاحظات (اختياري)', submit_order: 'تأكيد الطلب',
    order_success_title: 'تم إرسال طلبك!',
    order_success_msg: 'تم إرسال طلبك بنجاح. سنتواصل معك قريبًا على رقم واتساب الخاص بك.',
    payment_methods: 'اختر طريقة الدفع', total: 'الإجمالي',
    theme_setting: 'الوضع الداكن', lang_setting: 'اللغة', appearance: 'المظهر',
    off: 'خصم', see_all: 'عرض الكل', no_products: 'لا توجد منتجات.',
    back: 'رجوع', close: 'إغلاق', remove: 'حذف',
    fav_added: 'أُضيف للمفضلة', fav_removed: 'حُذف من المفضلة',
    cart_added: 'أُضيف للسلة',
  },
  fr: {
    copy_link: 'Copier le lien', link_copied: 'Lien copié avec succès !',
    home: 'Accueil', categories: 'Catégories', favorites: 'Favoris',
    cart: 'Panier', settings: 'Paramètres',
    hero_title: 'Produits Numériques Premium', hero_sub: 'Découvrez des prompts IA, livres PDF et ressources numériques exclusifs.',
    all: 'Tout', featured: 'Vedettes', view_now: 'Voir',
    add_cart: 'Ajouter au panier', order_now: 'Commander', add_fav: 'Ajouter aux favoris',
    search: 'Rechercher...', original_price: 'Prix original', discounted: 'Remisé',
    fav_empty: 'Aucun favori. Cliquez sur un cœur!', cart_empty: 'Votre panier est vide.',
    order_title: 'Passer une commande', order_sub: 'Remplissez vos informations et nous vous contacterons sur WhatsApp.',
    first_name: 'Prénom', last_name: 'Nom', phone: 'Téléphone / WhatsApp',
    email: 'Email (optionnel)', notes: 'Notes (optionnel)', submit_order: 'Soumettre',
    order_success_title: 'Commande envoyée!',
    order_success_msg: 'Votre commande a été envoyée avec succès. Nous vous contacterons bientôt sur votre numéro WhatsApp.',
    payment_methods: 'Choisir le paiement', total: 'Total',
    theme_setting: 'Mode Sombre', lang_setting: 'Langue', appearance: 'Apparence',
    off: 'RÉDUC', see_all: 'Voir tout', no_products: 'Aucun produit trouvé.',
    back: 'Retour', close: 'Fermer', remove: 'Supprimer',
    fav_added: 'Ajouté aux favoris', fav_removed: 'Retiré des favoris',
    cart_added: 'Ajouté au panier',
  }
};

const t = (key) => (i18n[state.lang] || i18n.en)[key] || key;

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('wld-theme', theme);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function applyLang(lang) {
  state.lang = lang;
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  localStorage.setItem('wld-lang', lang);
  renderAll();
}

function listenProducts() {
  onValue(ref(db, 'products'), snap => {
    state.products = [];
    snap.forEach(child => {
      state.products.push({ id: child.key, ...child.val() });
    });
    renderProductGrid();
    updateCatPills();
    
    handleDeepLink(); // <--- أضف هذا السطر هنا ليفتح المنتج تلقائياً إذا كان الرابط يحتوي عليه
  });
}


function listenCategories() {
  onValue(ref(db, 'categories'), snap => {
    state.categories = [];
    snap.forEach(child => {
      state.categories.push({ id: child.key, ...child.val() });
    });
    updateCatPills();
    renderCatPage();
  });
}

function renderAll() {
  updateTopBar();
  updateNavBar();
  renderHero();
  renderProductGrid();
  updateCatPills();
  renderCatPage();
  renderFavPage();
  renderCartBadge();
  renderSettingsPage();
}

function updateTopBar() {
  const si = document.getElementById('search-input');
  if (si) si.placeholder = t('search');
}

function updateNavBar() {
  const labels = ['home', 'categories', 'favorites', 'cart', 'settings'];
  labels.forEach(key => {
    const el = document.querySelector(`.nav-item[data-page="${key}"] .nav-label`);
    if (el) el.textContent = t(key);
  });
}

function renderHero() {
  const h1 = document.getElementById('hero-title');
  const p  = document.getElementById('hero-sub');
  if (h1) h1.textContent = t('hero_title');
  if (p)  p.textContent  = t('hero_sub');
}

function updateCatPills() {
  const wrap = document.getElementById('cat-pills');
  if (!wrap) return;
  const cats = getUniqueCats();
  wrap.innerHTML = `<button class="cat-pill ${state.currentCategory === 'all' ? 'active' : ''}" data-cat="all">${t('all')}</button>` +
    cats.map(c => `<button class="cat-pill ${state.currentCategory === c ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('');
  wrap.querySelectorAll('.cat-pill').forEach(btn => {
    btn.onclick = () => {
      state.currentCategory = btn.dataset.cat;
      updateCatPills();
      renderProductGrid();
    };
  });
}

function getUniqueCats() {
  const names = state.categories.map(c => c.name);
  const fromProds = [...new Set(state.products.map(p => p.category).filter(Boolean))];
  return [...new Set([...names, ...fromProds])];
}

function renderProductGrid(query = '') {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  let prods = [...state.products];
  if (state.currentCategory !== 'all') prods = prods.filter(p => p.category === state.currentCategory);
  if (query) prods = prods.filter(p => (p.title || '').toLowerCase().includes(query.toLowerCase()));
  if (!prods.length) {
    grid.innerHTML = `<div class="no-products"><i class="fas fa-box-open"></i><p>${t('no_products')}</p></div>`;
    return;
  }
  grid.innerHTML = prods.map(p => productCardHTML(p)).join('');
  grid.querySelectorAll('.product-card').forEach(card => {
    const pid = card.dataset.id;
    // Clicking anywhere on the card (including btn-view) opens the product modal
    card.onclick = () => openProductModal(pid);
    card.querySelector('.btn-view').onclick = (e) => { e.stopPropagation(); openProductModal(pid); };
    const heartBtn = card.querySelector('.card-heart');
    if (heartBtn) heartBtn.onclick = (e) => { e.stopPropagation(); toggleFav(pid, heartBtn); };
  });
}

function productCardHTML(p) {
  const isFav = state.favorites.includes(p.id);
  const discPct = p.originalPrice && p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  const img = p.coverImage || 'https://placehold.co/400x300/12121c/7c3aed?text=Product';
  return `
    <div class="product-card" data-id="${p.id}">
      <div class="card-img-wrap">
        <img src="${img}" alt="${p.title || ''}" loading="lazy" onerror="this.src='https://placehold.co/400x300/12121c/7c3aed?text=Walidify'">
        <button class="card-heart ${isFav ? 'active' : ''}"><i class="fa${isFav ? 's' : 'r'} fa-heart"></i></button>
        ${p.category ? `<span class="card-cat-badge">${p.category}</span>` : ''}
      </div>
      <div class="card-body">
        <div class="card-title">${p.title || ''}</div>
        <div class="card-price-row">
          <span class="price-new">${formatPrice(p.price)}</span>
          ${p.originalPrice && p.originalPrice > p.price ? `<span class="price-old">${formatPrice(p.originalPrice)}</span>` : ''}
          ${discPct > 0 ? `<span class="price-badge">-${discPct}%</span>` : ''}
        </div>
        <button class="btn-view">${t('view_now')}</button>
      </div>
    </div>`;
}

function formatPrice(val) {
  if (val === undefined || val === null) return '';
  return `${val} $`; // أو يمكن كتابتها `$` + val حسب التنسيق الذي تفضله
}

function openProductModal(pid) {
  const p = state.products.find(x => x.id === pid);
  if (!p) return;
  state.productModal = p;
  state.galleryIdx = 0;

  // Stop any existing slideshow
  stopSlideshow();
  _slideshowManual = false;

  const body = document.getElementById('pm-body');

  const media = [];
  if (p.coverImage) media.push({ type: 'image', url: p.coverImage });
  if (p.gallery) p.gallery.forEach(url => media.push({ type: 'image', url }));
  if (p.video) media.push({ type: 'video', url: p.video });

  const discPct = p.originalPrice && p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  const hasMultiple = media.length > 1;

  body.innerHTML = `
    <div class="pm-gallery" id="pm-gallery">
      ${renderMediaItem(media, 0)}
      ${hasMultiple ? `
        <button class="pm-nav-btn prev" id="pm-prev"><i class="fas fa-chevron-left"></i></button>
        <button class="pm-nav-btn next" id="pm-next"><i class="fas fa-chevron-right"></i></button>
        <div class="pm-dots">${media.map((_, i) => `<div class="pm-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></div>`).join('')}</div>
        <div class="pm-auto-indicator">● Auto</div>
      ` : ''}
    </div>
    <div class="pm-body">
      <div class="pm-title">${p.title || ''}</div>
      <div class="pm-price-row" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span class="pm-price-new">${formatPrice(p.price)}</span>
        ${p.originalPrice && p.originalPrice > p.price ? `<span class="pm-price-old">${formatPrice(p.originalPrice)}</span>` : ''}
        ${discPct > 0 ? `<span class="pm-discount">-${discPct}% ${t('off')}</span>` : ''}
        
        <button onclick="copyProductLink('${p.id}')" title="${t('copy_link')}" style="background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.3); color: #a855f7; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s; font-family: inherit;" onmouseover="this.style.background='rgba(124, 58, 237, 0.3)'" onmouseout="this.style.background='rgba(124, 58, 237, 0.15)'">
          <i class="fas fa-copy"></i> ${t('copy_link')}
        </button>
      </div>
      ${p.description ? `<div class="pm-desc">${p.description}</div>` : ''}
      <div class="pm-actions">
        <button class="btn btn-outline" onclick="addToCart('${p.id}')"><i class="fas fa-shopping-cart"></i> ${t('add_cart')}</button>
        <button class="btn btn-primary" onclick="openOrderModal('${p.id}')"><i class="fas fa-bolt"></i> ${t('order_now')}</button>
      </div>
    </div>`;

  window._pmMedia = media;

  // Wire up navigation buttons with manual mode logic
  if (hasMultiple) {
    const prevBtn = document.getElementById('pm-prev');
    const nextBtn = document.getElementById('pm-next');

    prevBtn.addEventListener('click', () => {
      stopSlideshow();
      _slideshowManual = true;
      updateAutoIndicator(false);
      state.galleryIdx = (state.galleryIdx - 1 + media.length) % media.length;
      renderGalleryFrame(media, state.galleryIdx);
    });

    nextBtn.addEventListener('click', () => {
      stopSlideshow();
      _slideshowManual = true;
      updateAutoIndicator(false);
      state.galleryIdx = (state.galleryIdx + 1) % media.length;
      renderGalleryFrame(media, state.galleryIdx);
    });

    document.querySelectorAll('.pm-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        stopSlideshow();
        _slideshowManual = true;
        updateAutoIndicator(false);
        state.galleryIdx = parseInt(dot.dataset.idx);
        renderGalleryFrame(media, state.galleryIdx);
      });
    });

    // Start auto-slideshow
    startSlideshow(media);
  }

  openModal('product-modal');
}


let deepLinkHandled = false; // للتأكد من تشغيلها مرة واحدة فقط عند فتح الموقع أول مرة

function handleDeepLink() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('p'); // البحث عن معرف المنتج في الرابط
  
  if (productId) {
    const productExists = state.products.find(x => x.id === productId);
    if (productExists) {
      // 1. فتح نافذة المنتج فوراً للزائر الآتي من الرابط
      openProductModal(productId);
      
      // 2. تنظيف شريط الرابط وحذف "?p=..." فوراً ليصبح الرابط رئيسياً ونقياً
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }
}


function renderMediaItem(media, idx) {
  if (!media.length) return `<img src="https://placehold.co/720x405/12121c/7c3aed?text=Walidify" style="width:100%;height:100%;object-fit:cover">`;
  const item = media[idx];
  if (item.type === 'video') {
    return `<video src="${item.url}" controls autoplay muted style="width:100%;height:100%;object-fit:cover"></video>`;
  }
  return `<img src="${item.url}" alt="Product" style="width:100%;height:100%;object-fit:cover" onerror="this.src='https://placehold.co/720x405/12121c/7c3aed?text=Walidify'">`;
}

// Legacy global (kept for safety but arrow wiring is now direct)
window.changeGallery = function(val, absolute = false) {
  const media = window._pmMedia || [];
  if (!media.length) return;
  stopSlideshow();
  _slideshowManual = true;
  updateAutoIndicator(false);
  if (absolute) { state.galleryIdx = val; }
  else { state.galleryIdx = (state.galleryIdx + val + media.length) % media.length; }
  renderGalleryFrame(media, state.galleryIdx);
};

function toggleFav(pid, btn) {
  const idx = state.favorites.indexOf(pid);
  if (idx >= 0) {
    state.favorites.splice(idx, 1);
    if (btn) { btn.classList.remove('active'); btn.innerHTML = '<i class="far fa-heart"></i>'; }
    showToast(t('fav_removed'));
  } else {
    state.favorites.push(pid);
    if (btn) { btn.classList.add('active'); btn.innerHTML = '<i class="fas fa-heart"></i>'; }
    showToast(t('fav_added'));
  }
  localStorage.setItem('wld-favs', JSON.stringify(state.favorites));
  renderFavPage();
}

function renderFavPage() {
  const grid = document.getElementById('fav-grid');
  if (!grid) return;
  const favs = state.products.filter(p => state.favorites.includes(p.id));
  if (!favs.length) {
    grid.innerHTML = `<div class="fav-empty"><i class="far fa-heart"></i><p>${t('fav_empty')}</p></div>`;
    return;
  }
  grid.innerHTML = favs.map(p => productCardHTML(p)).join('');
  grid.querySelectorAll('.product-card').forEach(card => {
    const pid = card.dataset.id;
    card.onclick = () => openProductModal(pid);
    card.querySelector('.btn-view').onclick = (e) => { e.stopPropagation(); openProductModal(pid); };
    const heart = card.querySelector('.card-heart');
    if (heart) heart.onclick = (e) => { e.stopPropagation(); toggleFav(pid, e.currentTarget); };
  });
}

function addToCart(pid) {
  const p = state.products.find(x => x.id === pid);
  if (!p) return;
  const existing = state.cart.find(i => i.id === pid);
  if (existing) { existing.qty = (existing.qty || 1) + 1; }
  else { state.cart.push({ id: pid, qty: 1 }); }
  localStorage.setItem('wld-cart', JSON.stringify(state.cart));
  renderCartBadge();
  showToast(`${p.title} — ${t('cart_added')}`, 'success');
}

function renderCartBadge() {
  const badge = document.getElementById('cart-badge');
  const total = state.cart.reduce((s, i) => s + (i.qty || 1), 0);
  if (badge) badge.textContent = total;
  const navBadge = document.getElementById('cart-nav-badge');
  if (navBadge) navBadge.textContent = total > 0 ? total : '';
}

function openCartModal() {
  renderCartModal();
  openModal('cart-modal');
}

function renderCartModal() {
  const wrap = document.getElementById('cart-items-wrap');
  const totalVal = document.getElementById('cart-total-val');
  if (!wrap) return;
  if (!state.cart.length) {
    wrap.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>${t('cart_empty')}</p></div>`;
    if (totalVal) totalVal.textContent = '0 DA';
    return;
  }
  let totalDA = 0;
  wrap.innerHTML = state.cart.map(item => {
    const p = state.products.find(x => x.id === item.id);
    if (!p) return '';
    const lineTotal = (parseFloat(p.price) || 0) * (item.qty || 1);
    totalDA += lineTotal;
    return `
      <div class="cart-item" data-id="${p.id}">
        <img class="cart-item-img" src="${p.coverImage || 'https://placehold.co/80x80/12121c/7c3aed?text=?'}" alt="${p.title}">
        <div class="cart-item-info">
          <div class="cart-item-title">${p.title}</div>
          <div class="cart-item-price">${formatPrice(lineTotal)}</div>
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="changeQty('${p.id}',-1)">−</button>
          <span class="qty-num">${item.qty || 1}</span>
          <button class="qty-btn" onclick="changeQty('${p.id}',1)">+</button>
        </div>
        <span class="cart-remove" onclick="removeFromCart('${p.id}')"><i class="fas fa-trash"></i></span>
      </div>`;
  }).join('');
  if (totalVal) totalVal.textContent = formatPrice(totalDA);
}

window.changeQty = function(pid, delta) {
  const item = state.cart.find(i => i.id === pid);
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) + delta);
  localStorage.setItem('wld-cart', JSON.stringify(state.cart));
  renderCartBadge();
  renderCartModal();
};

window.removeFromCart = function(pid) {
  state.cart = state.cart.filter(i => i.id !== pid);
  localStorage.setItem('wld-cart', JSON.stringify(state.cart));
  renderCartBadge();
  renderCartModal();
};

function openOrderModal(pid) {
  if (pid) state.orderProduct = state.products.find(x => x.id === pid);
  closeModal('product-modal');
  stopSlideshow(); // stop slideshow when order modal opens
  const box = document.getElementById('order-box');
  if (box) box.innerHTML = orderFormHTML();
  openModal('order-modal');
  setupPaymentOptions();
}

// ── PayPal SVG icon (official brand colors) ──────────────────────
function paypalIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" style="flex-shrink:0">
    <path fill="#003087" d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.477z"/>
    <path fill="#009cde" d="M21.222 6.917c-.16-.045-.326-.086-.497-.123a.641.641 0 0 0-.124-.019c-.136-.021-.274-.036-.416-.047a7.81 7.81 0 0 0-.994-.059h-6.014c-.148 0-.29.034-.416.094a.904.904 0 0 0-.506.775l-.78 4.953-.023.146a1.059 1.059 0 0 1 1.048-.9h2.19c4.298 0 7.664-1.745 8.647-6.796.03-.15.054-.295.077-.437a5.14 5.14 0 0 0-.792-.587z"/>
  </svg>`;
}

function orderFormHTML() {
  return `
    <div class="modal-title">${t('order_title')}</div>
    <div class="modal-sub">${t('order_sub')}</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">${t('first_name')}</label>
        <input class="form-input" id="o-fname" type="text" required>
      </div>
      <div class="form-group">
        <label class="form-label">${t('last_name')}</label>
        <input class="form-input" id="o-lname" type="text" required>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">${t('phone')}</label>
      <input class="form-input" id="o-phone" type="tel" required>
    </div>
    <div class="form-group">
      <label class="form-label">${t('email')}</label>
      <input class="form-input" id="o-email" type="email">
    </div>
    <div class="form-group">
      <label class="form-label">${t('notes')}</label>
      <textarea class="form-input form-textarea" id="o-notes" rows="2"></textarea>
    </div>
    <div class="payment-info">
      <div class="payment-info-title">${t('payment_methods')}</div>
      <div class="payment-methods">
        <div class="payment-option selected" data-method="BaridiMob" id="pay-baridimob">
          <i class="fas fa-mobile-alt"></i>
          <span>BaridiMob</span>
        </div>
        <div class="payment-option" data-method="PayPal" id="pay-paypal">
          ${paypalIcon()}
          <span>PayPal</span>
        </div>
      </div>
    </div>
    <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:4px" onclick="submitOrder()">
      <i class="fas fa-paper-plane"></i> ${t('submit_order')}
    </button>`;
}

function setupPaymentOptions() {
  const options = document.querySelectorAll('.payment-option');
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
}

function getSelectedPayment() {
  const selected = document.querySelector('.payment-option.selected');
  return selected ? selected.dataset.method : 'BaridiMob';
}

window.submitOrder = async function() {
  const fname = document.getElementById('o-fname')?.value.trim();
  const lname = document.getElementById('o-lname')?.value.trim();
  const phone = document.getElementById('o-phone')?.value.trim();
  if (!fname || !lname || !phone) { showToast('Please fill required fields', 'error'); return; }

  const paymentMethod = getSelectedPayment();

  const order = {
    name: `${fname} ${lname}`,
    phone,
    email: document.getElementById('o-email')?.value.trim() || '',
    notes: document.getElementById('o-notes')?.value.trim() || '',
    paymentMethod,
    product: state.orderProduct ? state.orderProduct.id : 'cart',
    productTitle: state.orderProduct ? state.orderProduct.title : 'Cart Order',
    cart: state.cart,
    timestamp: Date.now(),
    status: 'pending'
  };

  try {
    // 1. حفظ الطلب في قاعدة البيانات أولاً
    await push(ref(db, 'orders'), order);

    // 2. إرسال الإشعار الفوري إلى بوت تيليغرام الخاص بك (الكود الجديد)
    sendTelegramNotification(order);

    // Telegram-style message (stored in order, readable in admin)
    const telegramMsg = [
      `🛒 New Order — Walidify`,
      ``,
      `👤 Customer: ${order.name}`,
      `📱 WhatsApp: ${order.phone}`,
      `📧 Email: ${order.email || '—'}`,
      `📦 Product: ${order.productTitle}`,
      `💳 Payment Method: ${paymentMethod}`,
      order.notes ? `📝 Notes: ${order.notes}` : null,
    ].filter(Boolean).join('\n');

    // Also push to a telegram_messages node for easy retrieval
    await push(ref(db, 'telegram_messages'), {
      message: telegramMsg,
      timestamp: Date.now(),
      orderId: order.phone // rough reference
    }).catch(() => {}); // non-critical

    const box = document.getElementById('order-box');
    if (box) box.innerHTML = `
      <div class="success-msg">
        <div class="success-icon"><i class="fas fa-check"></i></div>
        <h3>${t('order_success_title')}</h3>
        <p>${t('order_success_msg')}</p>
      </div>`;
  } catch(e) {
    showToast('Error saving order. Try again.', 'error');
  }
};


function renderCatPage() {
  const grid = document.getElementById('cat-grid');
  if (!grid) return;
  const cats = getUniqueCats();
  const icons = { 'PDF Books': 'fa-book', 'AI Prompts': 'fa-robot', 'Digital Products': 'fa-layer-group' };
  grid.innerHTML = cats.map(c => {
    const count = state.products.filter(p => p.category === c).length;
    const icon = icons[c] || 'fa-tag';
    return `<div class="cat-card" onclick="filterCat('${c}')">
      <div class="cat-card-icon"><i class="fas ${icon}"></i></div>
      <div class="cat-card-name">${c}</div>
      <div class="cat-card-count">${count} products</div>
    </div>`;
  }).join('');
}

function renderSettingsPage() {
  const settingsToggle = document.getElementById('theme-toggle-setting');
  if (settingsToggle) {
    settingsToggle.checked = state.theme === 'dark';
    settingsToggle.onchange = () => applyTheme(settingsToggle.checked ? 'dark' : 'light');
  }
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === state.lang);
    btn.onclick = () => applyLang(btn.dataset.lang);
  });
}

function navigateTo(page) {
  state.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  if (page === 'favorites') renderFavPage();
  if (page === 'categories') renderCatPage();
  if (page === 'settings') renderSettingsPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openModal(id) {
  document.getElementById(id)?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
  document.body.style.overflow = '';
  // Stop slideshow when product modal closes
  if (id === 'product-modal') stopSlideshow();
}

function showToast(msg, type = '') {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

let searchTimeout;
function setupSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  input.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const q = input.value.trim();
      if (state.currentPage !== 'home') navigateTo('home');
      renderProductGrid(q);
    }, 300);
  });
}

window.navigateTo     = navigateTo;
window.openCartModal  = openCartModal;
window.openProductModal = openProductModal;
window.addToCart      = addToCart;
window.openOrderModal = openOrderModal;
window.toggleFav      = toggleFav;
window.filterCat      = function(cat) {
  state.currentCategory = cat;
  navigateTo('home');
  updateCatPills();
  renderProductGrid();
};
window.closeModal = closeModal;

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(state.theme);
  applyLang(state.lang);

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.onclick = () => navigateTo(btn.dataset.page);
  });

  document.getElementById('btn-theme')?.addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  document.getElementById('btn-cart')?.addEventListener('click', openCartModal);

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.onclick = () => closeModal(btn.dataset.close);
  });

  document.getElementById('btn-cart-order')?.addEventListener('click', () => {
    state.orderProduct = null;
    closeModal('cart-modal');
    const box = document.getElementById('order-box');
    if (box) box.innerHTML = orderFormHTML();
    openModal('order-modal');
    setupPaymentOptions();
  });

  setupSearch();
  navigateTo('home');
  listenProducts();
  listenCategories();
  renderCartBadge();
});

window.copyProductLink = function(pid) {
  // إنشاء الرابط مع إضافة معرف المنتج كـ Parameter (?p=)
  const shareUrl = `${window.location.origin}${window.location.pathname}?p=${pid}`;
  
  navigator.clipboard.writeText(shareUrl).then(() => {
    showToast(t('link_copied'), 'success');
  }).catch(() => {
    showToast('Failed to copy link', 'error');
  });
};

window.copyProductLink = function(pid) {
  // إنشاء الرابط وإضافة معرف المنتج في آخره
  const shareUrl = `${window.location.origin}${window.location.pathname}?p=${pid}`;
  
  navigator.clipboard.writeText(shareUrl).then(() => {
    showToast(t('link_copied'), 'success');
  }).catch(() => {
    showToast('Failed to copy link', 'error');
  });
};

// ── دالة إرسال الإشعارات إلى بوت تيليغرام ──────────────────────────────
async function sendTelegramNotification(orderData) {
  // ⚠️ استبدل هذه القيم ببيانات البوت والـ ID الخاص بك
  const telegramToken = '7844729808:AAHo63qnseNesZNtprvMm3d1R51yyrqAEvI'; 
  const chatId = '7773047224'; 

  // تنسيق نص الرسالة
  const message = `
🛍️ *طلب جديد على موقع Walidify!*
────────────────
👤 *الزبون:* ${orderData.name}
📞 *الهاتف/واتساب:* ${orderData.phone}
📧 *البريد:* ${orderData.email || '—'}
💳 *طريقة الدفع:* ${orderData.paymentMethod}
📦 *المنتج:* ${orderData.productTitle}
📝 *ملاحظات:* ${orderData.notes || '—'}
────────────────
📅 *التاريخ:* ${new Date().toLocaleString('fr-FR')}
  `;

  const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    console.log('Telegram notification sent!');
  } catch (error) {
    console.error('Error sending to Telegram:', error);
  }
}
