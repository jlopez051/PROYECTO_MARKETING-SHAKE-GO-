/* =========================================
   SHAKE&GO — carrito.js
   Carrito funcional: añadir, eliminar, cantidades, total
   ========================================= */

(function() {
  'use strict';

  /* ---- Estado del carrito ---- */
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  function saveCart() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  }

  /* ---- Referencias DOM (inicializadas cuando DOM esté listo) ---- */
  let cartPanel, cartOverlay, cartItems, cartEmpty,
      cartCountEl, cartTotalEl, cartSubtotalEl;

  function initDOM() {
    cartPanel    = document.getElementById('cart-panel');
    cartOverlay  = document.getElementById('cart-overlay');
    cartItems    = document.getElementById('cart-items');
    cartEmpty    = document.getElementById('cart-empty');
    cartCountEl  = document.getElementById('cart-count');
    cartTotalEl  = document.getElementById('cart-total');
    cartSubtotalEl = document.getElementById('cart-subtotal-val');
  }

  /* ---- Abrir / Cerrar carrito ---- */
  function openCart() {
    if (!cartPanel) return;
    cartPanel.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCart();
  }

  function closeCart() {
    if (!cartPanel) return;
    cartPanel.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ---- Añadir producto ---- */
  function addToCart(producto) {
    const existente = carrito.find(item => item.id === producto.id && item.pack === producto.pack);
    if (existente) {
      existente.cantidad += 1;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }
    saveCart();
    updateCartCount();
    renderCart();
    if (typeof window.showToast === 'function') {
      window.showToast(`<strong>${producto.nombre}</strong> añadido al carrito`, '🛒');
    }
  }
  window.addToCart = addToCart;

  /* ---- Eliminar producto ---- */
  function removeFromCart(id, pack) {
    carrito = carrito.filter(item => !(item.id === id && item.pack === pack));
    saveCart();
    updateCartCount();
    renderCart();
  }

  /* ---- Cambiar cantidad ---- */
  function changeQty(id, pack, delta) {
    const item = carrito.find(i => i.id === id && i.pack === pack);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      removeFromCart(id, pack);
    } else {
      saveCart();
      updateCartCount();
      renderCart();
    }
  }

  /* ---- Actualizar contador de cabecera ---- */
  function updateCartCount() {
    const total = carrito.reduce((sum, i) => sum + i.cantidad, 0);
    if (!cartCountEl) return;
    cartCountEl.textContent = total;
    cartCountEl.classList.toggle('visible', total > 0);
  }

  /* ---- Calcular total ---- */
  function calcTotal() {
    return carrito.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  }

  /* ---- Renderizar carrito ---- */
  function renderCart() {
    if (!cartItems) return;
    cartItems.innerHTML = '';

    if (carrito.length === 0) {
      if (cartEmpty) cartEmpty.style.display = 'flex';
      actualizarTotales(0);
      return;
    }
    if (cartEmpty) cartEmpty.style.display = 'none';

    carrito.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img class="cart-item-img" src="${item.imagen}" alt="${item.nombre}" loading="lazy">
        <div class="cart-item-info">
          <div class="cart-item-cat">${item.categoria || 'Smoothie'}</div>
          <div class="cart-item-name">${item.nombre}</div>
          <div class="cart-item-price">${item.precio.toFixed(2)}€ / ud · ${item.pack}</div>
        </div>
        <div class="cart-item-controls">
          <div class="cart-item-total">${(item.precio * item.cantidad).toFixed(2)}€</div>
          <div class="cart-qty">
            <button class="cart-qty-btn remove-btn" data-id="${item.id}" data-pack="${item.pack}" data-delta="-1" aria-label="Reducir cantidad">−</button>
            <span class="cart-qty-num">${item.cantidad}</span>
            <button class="cart-qty-btn" data-id="${item.id}" data-pack="${item.pack}" data-delta="1" aria-label="Aumentar cantidad">+</button>
          </div>
        </div>
      `;
      cartItems.appendChild(div);
    });

    // Delegación de eventos en items
    cartItems.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const { id, pack, delta } = btn.dataset;
        changeQty(id, pack, parseInt(delta));
      });
    });

    actualizarTotales(calcTotal());
  }

  function actualizarTotales(total) {
    if (cartTotalEl) cartTotalEl.textContent = total.toFixed(2) + '€';
    if (cartSubtotalEl) cartSubtotalEl.textContent = total.toFixed(2) + '€';
  }

  /* ---- Inicialización ---- */
  document.addEventListener('DOMContentLoaded', () => {
    initDOM();

    // Botón carrito en header
    document.querySelectorAll('[data-open-cart]').forEach(btn => {
      btn.addEventListener('click', openCart);
    });

    // Cerrar
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    const closeBtn = document.getElementById('cart-close');
    if (closeBtn) closeBtn.addEventListener('click', closeCart);

    // Seguir comprando
    const seguirBtn = document.getElementById('btn-seguir-comprando');
    if (seguirBtn) seguirBtn.addEventListener('click', closeCart);

    // Finalizar pedido (simulado)
    const checkoutBtn = document.getElementById('btn-checkout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (carrito.length === 0) {
          if (typeof window.showToast === 'function') {
            window.showToast('Tu carrito está vacío 🛒', '⚠️');
          }
          return;
        }
        const total = calcTotal();
        closeCart();
        if (typeof window.showToast === 'function') {
          window.showToast(`¡Pedido procesado! Total: ${total.toFixed(2)}€ 🎉`, '🎉');
        }
        carrito = [];
        saveCart();
        updateCartCount();
        renderCart();
      });
    }

    // Botones "Añadir al carrito" en cualquier página
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', function() {
        const card = this.closest('.product-card, .product-card-full');
        if (!card) return;

        const packActivo = card.querySelector('.pack-btn.active');
        const precio = parseFloat(this.dataset.precio || card.querySelector('.product-precio-valor')?.textContent || '6');
        const pack = packActivo ? packActivo.dataset.pack : '1 unidad';
        const precioFinal = packActivo ? parseFloat(packActivo.dataset.precio) : precio;

        const producto = {
          id: this.dataset.id || card.dataset.id || Math.random().toString(36).substr(2,9),
          nombre: this.dataset.nombre || card.querySelector('.product-name')?.textContent?.trim() || 'Batido',
          precio: isNaN(precioFinal) ? precio : precioFinal,
          imagen: card.querySelector('.product-img-wrap img')?.src || '',
          categoria: card.dataset.categoria || 'Smoothie',
          pack: pack
        };

        addToCart(producto);

        // Feedback visual en botón
        const originalHTML = this.innerHTML;
        this.innerHTML = '✓ Añadido';
        this.classList.add('added');
        setTimeout(() => {
          this.innerHTML = originalHTML;
          this.classList.remove('added');
        }, 1800);
      });
    });

    // Teclado ESC para cerrar
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && cartPanel?.classList.contains('open')) closeCart();
    });

    updateCartCount();
  });

})();
