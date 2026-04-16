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

});
