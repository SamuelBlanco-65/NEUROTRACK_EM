// Página «Contraseña nueva». Va en un archivo aparte (no en línea) para poder usar una Content-Security-Policy
// sin 'unsafe-inline' (ver vercel.json).
(function () {
  var web = window.NeurotrackWeb;
  var params = web.parametros();
  var formulario = document.getElementById('formulario');
  var mensaje = document.getElementById('mensaje');
  var titulo = document.getElementById('titulo');
  var texto = document.getElementById('texto');
  var guardar = document.getElementById('guardar');
  var password = document.getElementById('password');
  var confirmar = document.getElementById('confirmar');

  if (!params.token_hash) {
    formulario.hidden = true;
    titulo.textContent = 'Enlace incompleto';
    texto.textContent = 'Abre el enlace desde el correo que te enviamos, o pide uno nuevo desde la app.';
    return;
  }

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    if (password.value.length < 8) {
      web.mostrar(mensaje, 'error', 'La contraseña debe tener al menos 8 caracteres.');
      password.focus();
      return;
    }
    if (password.value !== confirmar.value) {
      web.mostrar(mensaje, 'error', 'Las contraseñas no coinciden.');
      confirmar.focus();
      return;
    }

    guardar.disabled = true;
    guardar.textContent = 'Guardando…';
    mensaje.hidden = true;

    var cliente = web.cliente();
    // El enlace se gasta aquí, al guardar: verifica el correo, cambia la contraseña y cierra
    // las sesiones abiertas de la cuenta (quien tuviera la contraseña vieja pierde el acceso).
    cliente.auth
      .verifyOtp({ token_hash: params.token_hash, type: 'recovery' })
      .then(function (res) {
        if (res.error) throw res.error;
        return cliente.auth.updateUser({ password: password.value });
      })
      .then(function (res) {
        if (res.error) throw res.error;
        return cliente.auth.signOut({ scope: 'global' });
      })
      .then(function () {
        formulario.hidden = true;
        titulo.textContent = 'Contraseña actualizada';
        texto.textContent = 'Por seguridad cerramos tus sesiones abiertas. Abre la app de Neurotrack EM e inicia sesión con tu contraseña nueva.';
        web.mostrar(mensaje, 'ok', 'Listo: puedes cerrar esta página.');
      })
      .catch(function (error) {
        guardar.disabled = false;
        guardar.textContent = 'Guardar contraseña';
        web.mostrar(mensaje, 'error', web.traducir(error));
      });
  });
})();
