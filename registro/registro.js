// registro.js

document.addEventListener('DOMContentLoaded', () => {

    // ICONOS
    lucide.createIcons();

    // FORMULARIO
    const form = document.querySelector('.auth-form');

    if (form) {
        form.addEventListener('submit', handleRegister);
    }

});

async function handleRegister(e) {

    e.preventDefault();

    // CAMPOS
    const nombre =
        document.getElementById('nombre').value.trim();

    const usuario =
        document.getElementById('usuario').value.trim();

    const email =
        document.getElementById('email-reg').value.trim();

    const password =
        document.getElementById('password-reg').value;

    const confirmPassword =
        document.getElementById('confirm-password').value;

    // VALIDACIONES

    if (nombre.length < 3) {

        showError(
            'El nombre debe tener al menos 3 caracteres'
        );

        return;
    }

    if (usuario.length < 3) {

        showError(
            'El usuario debe tener al menos 3 caracteres'
        );

        return;
    }

    if (password.length < 8) {

        showError(
            'La contraseña debe tener mínimo 8 caracteres'
        );

        return;
    }

    if (password !== confirmPassword) {

        showError(
            'Las contraseñas no coinciden'
        );

        return;
    }

    try {

        // BOTÓN
        const btn =
            document.querySelector('.btn-register');

        btn.disabled = true;

        btn.textContent = 'Registrando...';

        // PETICIÓN AL BACKEND
        const response = await fetch(
            'http://localhost:3000/api/usuarios/registro',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    nombre,
                    usuario,
                    email,
                    password,
                    id_rol: 2
                })
            }
        );

        // RESPUESTA
        const data = await response.json();

        console.log(data);

        // ÉXITO
        if (response.ok && data.success) {

            showSuccess(
                '✅ Usuario registrado correctamente'
            );

            // GUARDAR TOKEN
            if (data.token) {

                localStorage.setItem(
                    'token',
                    data.token
                );

            }

            // GUARDAR USUARIO
            if (data.user) {

                localStorage.setItem(
                    'usuario',
                    JSON.stringify(data.user)
                );

            }

            // REDIRECCIÓN
            setTimeout(() => {

                window.location.href =
                    '../pagina_principal/pg_principal.html';

            }, 2000);

        } else {

            showError(
                data.message ||
                data.error ||
                'Error en el registro'
            );

            btn.disabled = false;

            btn.textContent =
                'Registrarse en JYJGESTOR';
        }

    } catch (error) {

        console.error(
            '❌ Error:',
            error
        );

        showError(
            '❌ Error de conexión con el servidor'
        );

        const btn =
            document.querySelector('.btn-register');

        btn.disabled = false;

        btn.textContent =
            'Registrarse en JYJGESTOR';
    }
}

// MENSAJE ERROR
function showError(message) {

    removeMessages();

    const div =
        document.createElement('div');

    div.className =
        'message-box message-error';

    div.textContent = message;

    document
        .querySelector('.presentation-box')
        .insertBefore(
            div,
            document.querySelector('.auth-form')
        );
}

// MENSAJE SUCCESS
function showSuccess(message) {

    removeMessages();

    const div =
        document.createElement('div');

    div.className =
        'message-box message-success';

    div.textContent = message;

    document
        .querySelector('.presentation-box')
        .insertBefore(
            div,
            document.querySelector('.auth-form')
        );
}

// LIMPIAR MENSAJES
function removeMessages() {

    const messages =
        document.querySelectorAll('.message-box');

    messages.forEach(msg => msg.remove());
}