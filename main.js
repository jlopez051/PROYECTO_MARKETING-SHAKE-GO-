/* =========================================
   SHAKE&GO — main.js
   Menú, header scroll, animaciones, filtros
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Header scroll effect ----
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // ---- Menú hamburguesa ----
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- Marcar nav activo ----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ---- Animación de entrada con IntersectionObserver ----
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.valor-card, .product-card, .testimonio-card, .nosotros-valor, .mision-block').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity 0.55s ease ${i * 0.07}s, transform 0.55s ease ${i * 0.07}s`;
    observer.observe(el);
  });

  // ---- Filtros de producto (productos.html) ----
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card-full');

  if (filterBtns.length && productCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        productCards.forEach(card => {
          if (filter === 'todos' || card.dataset.categoria === filter) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.96)';
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            });
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ---- Selector de packs ----
  document.querySelectorAll('.pack-selector').forEach(selector => {
    selector.querySelectorAll('.pack-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selector.querySelectorAll('.pack-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Actualiza precio del producto
        const card = btn.closest('.product-card, .product-card-full');
        if (card) {
          const priceEl = card.querySelector('.product-precio-valor');
          const unitEl = card.querySelector('.product-precio-unidad');
          if (priceEl) priceEl.textContent = btn.dataset.precio + '€';
          if (unitEl) unitEl.textContent = btn.dataset.unidad || 'por unidad (IVA inc.)';
        }
      });
    });
  });

  // ---- Toast global ----
  window.showToast = function(msg, icon = '✅') {
    let toast = document.getElementById('global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span class="toast-icon">${icon}</span>${msg}`;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
  };

  // ---- Scroll suave para anclas ----
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- Activar filtro desde URL (ej: productos.html?filtro=detox) ----
  const params = new URLSearchParams(window.location.search);
  const filtroURL = params.get('filtro');
  if (filtroURL && filterBtns.length) {
    const btnTarget = [...filterBtns].find(b => b.dataset.filter === filtroURL);
  if (btnTarget) btnTarget.click(); // Simula clic para activar filtro y animación
  }

  // ---- Popup newsletter (se muestra 1 vez tras 4 segundos) ----
  const popup = document.getElementById('popup-newsletter');
  if (popup && !localStorage.getItem('sg_popup_shown')) {
    setTimeout(() => popup.classList.add('open'), 4000);
    document.getElementById('popup-close')?.addEventListener('click', () => {
      popup.classList.remove('open');
      localStorage.setItem('sg_popup_shown', '1');
    });
    document.getElementById('popup-submit')?.addEventListener('click', () => {
      const email = document.getElementById('popup-email').value.trim();
      if (!email) return;
      popup.classList.remove('open');
      localStorage.setItem('sg_popup_shown', '1');
      showToast('¡Código BIENVENIDA10 copiado! Úsalo al pedir 🎉', '🎁');
    });
    popup?.addEventListener('click', e => {
      if (e.target === popup) {
        popup.classList.remove('open');
        localStorage.setItem('sg_popup_shown', '1');
      }
    });
  }

  // ---- Modal detalle producto ----
  
  const modalProd = document.getElementById('modal-producto');
  if (modalProd) {
    const modalAddBtn = document.getElementById('modal-btn-add');
    const modalSelector = document.getElementById('modal-pack-selector');

    document.querySelectorAll('.btn-ver-detalle').forEach(btn => {
      btn.addEventListener('click', () => {
        // Rellenar datos
        document.getElementById('modal-prod-img').src = btn.dataset.img;
        document.getElementById('modal-prod-img').alt = btn.dataset.nombre;
        document.getElementById('modal-prod-nombre').textContent = btn.dataset.nombre;
        document.getElementById('modal-prod-cat').textContent = btn.dataset.cat;
        document.getElementById('modal-prod-desc').textContent = btn.dataset.desc;
        document.getElementById('modal-prod-stars').textContent = btn.dataset.stars;

        // Guardar id y nombre en el botón del modal
        modalAddBtn.dataset.id = btn.dataset.id;
        modalAddBtn.dataset.nombre = btn.dataset.nombre;

        // Resetear pack al SINGLE
        modalSelector.querySelectorAll('.pack-btn').forEach((b, i) => {
          b.classList.toggle('active', i === 0);
        });
        document.getElementById('modal-precio-val').textContent = '3,50€';
        document.getElementById('modal-precio-unidad').textContent = 'por unidad (IVA inc.)';
        modalAddBtn.dataset.precio = '3.50';

        modalProd.classList.add('open');
      });
    });

    // Cambiar pack dentro del modal
    modalSelector.querySelectorAll('.pack-btn').forEach(pb => {
      pb.addEventListener('click', () => {
        modalSelector.querySelectorAll('.pack-btn').forEach(b => b.classList.remove('active'));
        pb.classList.add('active');
        document.getElementById('modal-precio-val').textContent = pb.dataset.precio + '€';
        document.getElementById('modal-precio-unidad').textContent = pb.dataset.unidad;
        modalAddBtn.dataset.precio = pb.dataset.precio;
      });
    });

    // Añadir al carrito desde el modal (listener propio, sin depender de closest())
    modalAddBtn.addEventListener('click', function() {
      const packActivo = modalSelector.querySelector('.pack-btn.active');
      const pack = packActivo ? packActivo.dataset.pack : '1 unidad';
      const precio = packActivo ? parseFloat(packActivo.dataset.precio) : 3.50;

      const producto = {
        id: this.dataset.id + '-' + pack.replace(/\s/g, '-'),
        nombre: this.dataset.nombre,
        precio: precio,
        imagen: document.getElementById('modal-prod-img').src,
        categoria: document.getElementById('modal-prod-cat').textContent,
        pack: pack
      };

    if (typeof window.addToCart === 'function') {
        window.addToCart(producto);
    }

      // Feedback visual en el botón
      const originalHTML = this.innerHTML;
      this.innerHTML = '✓ Añadido';
      this.classList.add('added');
      setTimeout(() => {
        this.innerHTML = originalHTML;
        this.classList.remove('added');
      }, 1800);

      modalProd.classList.remove('open');
    });

    // Cerrar modal
    document.getElementById('modal-prod-close')?.addEventListener('click', () => modalProd.classList.remove('open'));
    modalProd.addEventListener('click', e => { if (e.target === modalProd) modalProd.classList.remove('open'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') modalProd.classList.remove('open'); });
  }
});
