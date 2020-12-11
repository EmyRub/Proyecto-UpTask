eventListeners();

function eventListeners() {
    document.querySelector('#formulario').addEventListener('submit', validarRegistro);
}

function validarRegistro(e) {
    //Evita que se envíe automáticamente 
    //al # que se ha determinado en action
    e.preventDefault();

    var usuario = document.querySelector('#usuario').value,
        password = document.querySelector('#password').value,
        tipo = document.querySelector('#tipo').value;

    if (usuario === '' || password === '') {
        // La validación falló
        swal({
            type: 'error',
            title: 'Error',
            text: 'Ambos campos son obligatorios!'
        })
    } else {
        // Ambos campos son correctos, mandar ejecutar Ajax

        // Datos que se envian al servidor
        var datos = new FormData();
        datos.append('usuario', usuario);
        datos.append('password', password);
        datos.append('accion', tipo);

        // Crear el llamado a Ajax
        var xhr = new XMLHttpRequest();

        //Abrir la conexión
        xhr.open('POST', 'inc/modelos/modelo-admin.php', true);

        // Retorno de datos
        xhr.onload = function() {
            if (this.status === 200) {
                var respuesta = JSON.parse(xhr.responseText);

                console.log(respuesta);
                // Si la respuesta es correcta
                if (respuesta.respuesta === 'correcto') {
                    // Si es un nuevo usuario
                    if (respuesta.tipo === 'crear') {
                        swal({
                            title: 'Usuario Creado',
                            text: 'El usuario se creó correctamente',
                            type: 'success'
                        });
                    } else if (respuesta.tipo === 'login') {
                        swal({
                                title: 'Login Correcto',
                                text: 'Presiona OK para abrir el dashboard',
                                type: 'success'
                            })
                            .then(resultado => {
                                if (resultado.value) {
                                    window.location.href = 'index.php';
                                }
                            })
                    }
                } else {
                    // Hubo un error
                    swal({
                        title: 'Error',
                        text: 'Hubo un error',
                        type: 'error'
                    });
                }
            }
        }

        // Enviar la petición
        xhr.send(datos);
    }
}