// auth.js
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('modal-auth');
    const btnUser = document.getElementById('btn-user');
    const userLabel = document.getElementById('user-label');
    const closeBtn = document.getElementById('modal-close-btn');

    // Tabs
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-login').style.display = btn.dataset.tab === 'login' ? '' : 'none';
        document.getElementById('tab-registro').style.display = btn.dataset.tab === 'registro' ? '' : 'none';
      });
    });

    function getUsers() { return JSON.parse(localStorage.getItem('sg_users') || '[]'); }
    function getLoggedUser() { return JSON.parse(localStorage.getItem('sg_logged') || 'null'); }

    function updateUI() {
      const user = getLoggedUser();
      if (user) {
        userLabel.textContent = user.nombre.split(' ')[0];
        document.getElementById('tab-login').style.display = 'none';
        document.getElementById('tab-registro').style.display = 'none';
        document.getElementById('modal-user-logged').style.display = 'block';
        document.getElementById('user-name-display').textContent = user.nombre;
      } else {
        userLabel.textContent = 'Entrar';
        document.getElementById('modal-user-logged').style.display = 'none';
        document.getElementById('tab-login').style.display = '';
      }
    }

    btnUser?.addEventListener('click', () => { overlay.classList.add('open'); updateUI(); });
    closeBtn?.addEventListener('click', () => overlay.classList.remove('open'));
    overlay?.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });

    // Registro
    document.getElementById('btn-registro')?.addEventListener('click', () => {
      const nombre = document.getElementById('reg-nombre').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const pass = document.getElementById('reg-pass').value;
      if (!nombre || !email || !pass) return showToast('Rellena todos los campos', '⚠️');
      const users = getUsers();
      if (users.find(u => u.email === email)) return showToast('Email ya registrado', '⚠️');
      users.push({ nombre, email, pass });
      localStorage.setItem('sg_users', JSON.stringify(users));
      localStorage.setItem('sg_logged', JSON.stringify({ nombre, email }));
      updateUI();
      showToast(`¡Bienvenido/a, ${nombre}! 🎉`, '✅');
    });

    // Login
    document.getElementById('btn-login')?.addEventListener('click', () => {
      const email = document.getElementById('login-email').value.trim();
      const pass = document.getElementById('login-pass').value;
      const users = getUsers();
      const user = users.find(u => u.email === email && u.pass === pass);
      if (!user) return showToast('Email o contraseña incorrectos', '❌');
      localStorage.setItem('sg_logged', JSON.stringify({ nombre: user.nombre, email }));
      updateUI();
      showToast(`¡Hola de nuevo, ${user.nombre}! 👋`, '✅');
    });

    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', () => {
      localStorage.removeItem('sg_logged');
      updateUI();
      overlay.classList.remove('open');
      showToast('Sesión cerrada', '👋');
    });

    updateUI();
  });
})();