eventListeners();
// Lista de proyectos
var listaProyectos = document.querySelector('ul#proyectos');

function eventListeners() {

    // Document Ready
    document.addEventListener('DOMContentLoaded', function() {
        actualizarProgreso();
    });

    // boton para crear proyecto
    document.querySelector('.crear-proyecto a').addEventListener('click', nuevoProyecto);

    // Botón para una nueva tarea
    if (document.querySelector('.nueva-tarea') !== null) {
        document.querySelector('.nueva-tarea').addEventListener('click', agregarTarea);
    }

    // Botones para las acciones de las tareas
    document.querySelector('.listado-pendientes').addEventListener('click', accionesTareas);
}

function nuevoProyecto(e) {
    e.preventDefault();

    var listaProyectos = document.querySelector('ul#proyectos');
    // Crea un <input> para el nombre del nuevo proyecto
    var nuevoProyecto = document.createElement('li');
    nuevoProyecto.innerHTML = '<input type="text" id="nuevo-proyecto">';
    listaProyectos.appendChild(nuevoProyecto);

    // Seleccionar el ID con el nuevoProyecto
    var inputNuevoProyecto = document.querySelector('#nuevo-proyecto');

    // al presionar enter crear el proyecto

    inputNuevoProyecto.addEventListener('keypress', function(e) {
        var tecla = e.which || e.keyCode;

        if (tecla === 13) {
            guardarProyectoDB(inputNuevoProyecto.value);
            listaProyectos.removeChild(nuevoProyecto);
        }
    });
}

function guardarProyectoDB(nombreProyecto) {
    // Crear llamado a Ajax
    var xhr = new XMLHttpRequest();

    // Enviar datos por formdata
    var datos = new FormData();
    datos.append('proyecto', nombreProyecto);
    datos.append('accion', 'crear');

    // Abrir la conexión
    xhr.open('POST', 'inc/modelos/modelo-proyecto.php', true);

    // En la carga
    xhr.onload = function() {
        if (this.status === 200) {
            // Obtenes datos de la respuesta
            var respuesta = JSON.parse(xhr.responseText);
            var proyecto = respuesta.nombre_proyecto,
                id_proyecto = respuesta.id_insertado,
                tipo = respuesta.tipo,
                resultado = respuesta.respuesta;

            // Comprobar la inserción
            if (resultado === 'correcto') {
                // Fue éxitoso
                if (tipo === 'crear') {
                    // Se creó un nuevo proyecto
                    // Inyectar en el HTML
                    var nuevoProyecto = document.createElement('li');
                    nuevoProyecto.innerHTML = `
                        <a href="index.php?id_proyecto=${id_proyecto}" id="proyecto:${id_proyecto}">
                            ${proyecto}
                        </a>
                    `;
                    // Agregar al html
                    listaProyectos.appendChild(nuevoProyecto);

                    // Enviar alerta
                    swal({
                            title: 'Proyecto Creado',
                            text: 'El Proyecto: ' + proyecto + ' se creó correctamente',
                            type: 'success'
                        })
                        .then(resultado => {
                            // Redireccionar a la nueva URL
                            if (resultado.value) {
                                window.location.href = 'index.php?id_proyecto=' + id_proyecto;
                            }
                        })

                } else {
                    // Se actualizó o se eliminó
                }
            } else {
                // Hubo un error
                swal({
                    type: 'error',
                    title: 'Error',
                    text: 'Hubo un error'
                })
            }
        }
    }

    // Enviar el Request
    xhr.send(datos);
}

// Agregar una nueva tarea al proyecto actual
function agregarTarea(e) {
    e.preventDefault();

    var nombreTarea = document.querySelector('.nombre-tarea').value;
    // Validar el campo que tenga algo escrito

    if (nombreTarea === '') {
        swal({
            title: 'Error',
            text: 'No hay tareas asignadas',
            type: 'error'
        })
    } else {
        // La tarea tiene contenido

        // Crear llamado a Ajax
        var xhr = new XMLHttpRequest();

        // Crear formData
        var datos = new FormData();
        datos.append('tarea', nombreTarea);
        datos.append('accion', 'crear');
        datos.append('id_proyecto', document.querySelector('#id_proyecto').value);

        // Abrir la conexión
        xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);

        // Ejecutarlo y respuesta
        xhr.onload = function() {
                if (this.status === 200) {
                    // Todo correcto
                    var respuesta = JSON.parse(xhr.responseText);

                    // Asignar valores

                    var resultado = respuesta.respuesta,
                        tarea = respuesta.tarea,
                        id_insertado = respuesta.id_insertado,
                        accion = respuesta.accion;

                    if (resultado === 'correcto') {
                        // Se agregó correctamente
                        if (accion === 'crear') {
                            // Lanzar una alerta
                            swal({
                                title: 'Tarea Creada',
                                text: 'La tarea: ' + tarea + ' se creó correctamente',
                                type: 'success'
                            });

                            // seleccionar el párrafo con la lista vacía

                            var parrafoListaVacia = document.querySelectorAll('.lista-vacia');
                            if (parrafoListaVacia.length > 0) {
                                document.querySelector('.lista-vacia').remove();
                            }

                            // Construir el template
                            var nuevaTarea = document.createElement('li');

                            // Agregamos el ID
                            nuevaTarea.id = 'tarea:' + id_insertado;

                            // agregar la clase tarea
                            nuevaTarea.classList.add('tarea');

                            // construir el html
                            nuevaTarea.innerHTML = `
                            <p>${tarea}</p>
                            <div class= "acciones">
                                <i class="far fa-check-circle"></li>
                                <i class="fas fa-trash"></li>
                            </div>                            
                        `;

                            // agregarlo al HTML
                            var listado = document.querySelector('.listado-pendientes ul');
                            listado.appendChild(nuevaTarea);

                            // Limpiar el formulario
                            document.querySelector('.agregar-tarea').reset();

                            // Actualizar el Progreso
                            actualizarProgreso();
                        }
                    } else {
                        // Hubo un error
                        swal({
                            title: 'Error',
                            text: 'Hubo un error',
                            type: 'error'
                        })
                    }
                }
            }
            // Enviar consulta
        xhr.send(datos);
    }
}

// Cambia el estado de las tareas o las elimina
function accionesTareas(e) {
    e.preventDefault();

    if (e.target.classList.contains('fa-check-circle')) {
        if (e.target.classList.contains('completo')) {
            e.target.classList.remove('completo');
            cambiarEstadoTarea(e.target, 0);
        } else {
            e.target.classList.add('completo');
            cambiarEstadoTarea(e.target, 1);
        }
    }

    if (e.target.classList.contains('fa-trash')) {
        swal({
            title: 'Seguro(a)?',
            text: "Esta acción no se puede deshacer",
            type: 'warning',
            showCancelButton: 'true',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {

                var tareaEliminar = e.target.parentElement.parentElement;
                // Borrar de la BD
                eliminarTareaBD(tareaEliminar);

                // Borrar del HTML
                tareaEliminar.remove();
                swal(
                    'Eliminado!',
                    'La tarea fue eliminada',
                    'success'
                )
            }
        })
    }
}

// Completa o descompleta una tarea
function cambiarEstadoTarea(tarea, estado) {
    var idTarea = tarea.parentElement.parentElement.id.split(':');

    // crear llamado a Ajax
    var xhr = new XMLHttpRequest();

    // información
    var datos = new FormData();
    datos.append('id', idTarea[1]);
    datos.append('accion', 'actualizar');
    datos.append('estado', estado);


    // abrir la conexión
    xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);

    // on load
    xhr.onload = function() {
        if (this.status === 200) {
            console.log(JSON.parse(xhr.responseText));

            // Actualizar el Progreso
            actualizarProgreso();
        }
    }

    // enviar la petición
    xhr.send(datos);
}

// Elimina las tareas de la base de datos
function eliminarTareaBD(tarea) {
    var idTarea = tarea.id.split(':');

    // crear llamado a Ajax
    var xhr = new XMLHttpRequest();

    // información
    var datos = new FormData();
    datos.append('id', idTarea[1]);
    datos.append('accion', 'eliminar');

    // abrir la conexión
    xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);

    // on load
    xhr.onload = function() {
        if (this.status === 200) {
            console.log(JSON.parse(xhr.responseText));

            // Comprobar que haya tareas restantes
            var listaTareasRestantes = document.querySelectorAll('li.tarea');
            if (listaTareasRestantes.length === 0) {
                document.querySelector('.listado-pendientes ul').innerHTML = "<p class='lista-vacia'>No hay tareas en este proyecto</p>";
            }

            // Actualizar el Progreso
            actualizarProgreso();
        }
    }

    // enviar la petición
    xhr.send(datos);
}

//Actualiza el avance del proyecto
function actualizarProgreso() {
    // obtener todas las tareas
    const tareas = document.querySelectorAll('li.tarea');

    // obtener las tareas completadas
    const tareasCompletadas = document.querySelectorAll('i.completo');

    // Determinar el avance
    const avance = Math.round((tareasCompletadas.length / tareas.length) * 100);

    // asignar el avance a la barra
    const porcentaje = document.querySelector('#porcentaje');
    porcentaje.style.width = avance + '%';

    // Mostrar una alerta al completar el 100
    if (avance === 100) {
        swal({
            title: 'Proyecto Terminado',
            text: 'No hay tareas pendientes',
            type: 'success'
        })
    }

}