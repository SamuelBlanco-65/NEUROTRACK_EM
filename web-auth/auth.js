// Lógica común de las páginas de correo. Sin sesión persistente: esta web solo confirma o cambia la
// contraseña; después el usuario inicia sesión en la app.
(function () {
  var cfg = window.NEUROTRACK;

  function parametros() {
    var out = {};
    var query = window.location.search.replace(/^\?/, '');
    query.split('&').forEach(function (par) {
      if (!par) return;
      var i = par.indexOf('=');
      var k = decodeURIComponent(i < 0 ? par : par.slice(0, i));
      var v = i < 0 ? '' : decodeURIComponent(par.slice(i + 1).replace(/\+/g, ' '));
      out[k] = v;
    });
    return out;
  }

  function cliente() {
    return window.supabase.createClient(cfg.url, cfg.key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }

  function traducir(error) {
    var codigo = (error && error.code) || '';
    var mensaje = ((error && error.message) || '').toLowerCase();
    if (codigo === 'otp_expired' || mensaje.indexOf('expired') >= 0 || mensaje.indexOf('invalid') >= 0) {
      return 'El enlace venció o ya se usó. Pide uno nuevo desde la app.';
    }
    if (codigo === 'same_password') return 'Elige una contraseña distinta a la que tenías.';
    if (codigo === 'weak_password') return 'Esa contraseña es muy fácil de adivinar. Prueba con otra más larga.';
    if (error && error.status === 429) return 'Demasiados intentos. Espera unos minutos y vuelve a probar.';
    if (mensaje.indexOf('fetch') >= 0 || mensaje.indexOf('network') >= 0) {
      return 'Revisa tu conexión e inténtalo de nuevo.';
    }
    return 'No pudimos completar la solicitud. Pide un enlace nuevo desde la app.';
  }

  function mostrar(elemento, tipo, texto) {
    elemento.className = 'aviso ' + tipo;
    elemento.hidden = false;
    elemento.innerHTML = '';
    var icono = document.createElement('span');
    icono.className = 'icono';
    icono.setAttribute('aria-hidden', 'true');
    icono.textContent = tipo === 'ok' ? '✔' : '⚠';
    var cuerpo = document.createElement('span');
    cuerpo.textContent = texto;
    elemento.appendChild(icono);
    elemento.appendChild(cuerpo);
  }

  window.NeurotrackWeb = { parametros: parametros, cliente: cliente, traducir: traducir, mostrar: mostrar };
})();
