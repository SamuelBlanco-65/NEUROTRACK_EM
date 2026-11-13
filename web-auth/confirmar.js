// Página «Confirmar correo». Va en un archivo aparte (no en línea) para poder usar una Content-Security-Policy
// sin 'unsafe-inline' (ver vercel.json).
(function () {
  var web = window.NeurotrackWeb;
  var params = web.parametros();
  var boton = document.getElementById('confirmar');
  var mensaje = document.getElementById('mensaje');
  var titulo = document.getElementById('titulo');
  var texto = document.getElementById('texto');

  if (!params.token_hash) {
    boton.hidden = true;
    titulo.textContent = 'Enlace incompleto';
    texto.textContent = 'Abre el enlace desde el correo que te enviamos, o pide uno nuevo desde la app.';
    return;
  }

  boton.addEventListener('click', function () {
    boton.disabled = true;
    boton.textContent = 'Confirmando…';
    // La confirmación se hace al tocar el botón (no al abrir la página) para que los
    // revisores automáticos de los correos no gasten el enlace.
    web.cliente().auth.verifyOtp({ token_hash: params.token_hash, type: 'signup' }).then(function (res) {
      if (res.error) {
        boton.disabled = false;
        boton.textContent = 'Confirmar mi correo';
        web.mostrar(mensaje, 'error', web.traducir(res.error));
        return;
      }
      boton.hidden = true;
      titulo.textContent = '¡Correo confirmado!';
      texto.textContent = 'Tu cuenta ya está lista. Abre la app de Neurotrack EM e inicia sesión.';
      web.mostrar(mensaje, 'ok', 'Listo: puedes cerrar esta página.');
    });
  });
})();
