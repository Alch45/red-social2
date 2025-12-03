
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventListeners();
    actualizarListaEventos();
   
    const eventosProximos = filtrarEventosProximos();
    if (eventosProximos.length > 0) {
        console.log('Eventos próximos cargados:', eventosProximos.length);
    }
});
function inicializarEventListeners() {
    const createEventBtn = document.getElementById('createEventBtn');
    if (createEventBtn) {
        createEventBtn.addEventListener('click', toggleCreateMenu);
    }
    
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', toggleCreateMenu);
    }
    
    
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', manejarEnvioFormulario);
    }
    
    // Validación en tiempo real para campos requeridos
    const inputsRequeridos = document.querySelectorAll('#eventForm input[required]');
    inputsRequeridos.forEach(input => {
        input.addEventListener('blur', validarCampo);
    });
}

function toggleCreateMenu() {
    const menu = document.getElementById('createEventMenu');
    const overlay = document.getElementById('overlay');
    const form = document.getElementById('eventForm');
    
    if (menu && overlay) {
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Limpiar formulario si se cierra el menú
        if (!menu.classList.contains('active') && form) {
            form.reset();
            delete form.dataset.editingId;
        }
    }
}


function manejarEnvioFormulario(event) {
    event.preventDefault();
    
    const form = event.target;
    const esEdicion = form.dataset.editingId;
    
    if (validarFormularioCompleto()) {
        const eventoData = obtenerDatosFormulario();
        
        if (esEdicion) {
            actualizarEventoExistente(parseInt(esEdicion), eventoData);
        } else {
            crearNuevoEvento(eventoData);
        }
        
        form.reset();
        delete form.dataset.editingId;
        toggleCreateMenu();
        mostrarNotificacion(esEdicion ? 'Evento actualizado correctamente' : 'Evento creado correctamente');
    }
}

function obtenerDatosFormulario() {
    return {
        nombre: document.querySelector('input[placeholder="Nombre del evento"]').value,
        descripcion: document.querySelector('textarea').value,
        fecha: document.querySelector('input[type="datetime-local"]').value,
        ubicacion: document.querySelector('input[placeholder="Ubicación"]').value,
        tipo: document.querySelector('select').value,
        fechaCreacion: new Date().toISOString()
    };
}

function validarFormularioCompleto() {
    const inputsRequeridos = document.querySelectorAll('#eventForm input[required]');
    let formularioValido = true;
    
    inputsRequeridos.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            formularioValido = false;
        } else {
            input.classList.remove('error');
        }
    });
    
    const fechaInput = document.querySelector('input[type="datetime-local"]');
    if (fechaInput.value) {
        const fechaEvento = new Date(fechaInput.value);
        const ahora = new Date();
        
        if (fechaEvento <= ahora) {
            fechaInput.classList.add('error');
            mostrarError('La fecha del evento debe ser futura');
            formularioValido = false;
        }
    }
    
    return formularioValido;
}

function validarCampo(event) {
    const input = event.target;
    if (input.hasAttribute('required') && !input.value.trim()) {
        input.classList.add('error');
    } else {
        input.classList.remove('error');
    }
}


function crearNuevoEvento(eventoData) {
    let eventos = obtenerEventosStorage();
    
    // Agregar metadatos al evento
    eventoData.id = Date.now();
    eventoData.invitados = [];
    eventoData.confirmados = 0;
    eventoData.estado = 'activo';
    
    eventos.push(eventoData);
    guardarEventosStorage(eventos);
    actualizarListaEventos();
}

function actualizarEventoExistente(eventoId, nuevosDatos) {
    let eventos = obtenerEventosStorage();
    const eventoIndex = eventos.findIndex(e => e.id === eventoId);
    
    if (eventoIndex !== -1) {
      
        nuevosDatos.id = eventoId;
        nuevosDatos.invitados = eventos[eventoIndex].invitados;
        nuevosDatos.confirmados = eventos[eventoIndex].confirmados;
        nuevosDatos.estado = eventos[eventoIndex].estado;
        nuevosDatos.fechaCreacion = eventos[eventoIndex].fechaCreacion;
        
        eventos[eventoIndex] = nuevosDatos;
        guardarEventosStorage(eventos);
        actualizarListaEventos();
    }
}

function editarEvento(eventoId) {
    const evento = obtenerEventoPorId(eventoId);
    
    if (evento) {
        
        document.querySelector('input[placeholder="Nombre del evento"]').value = evento.nombre;
        document.querySelector('textarea').value = evento.descripcion || '';
        document.querySelector('input[type="datetime-local"]').value = evento.fecha;
        document.querySelector('input[placeholder="Ubicación"]').value = evento.ubicacion || '';
        
        
        const select = document.querySelector('select');
        if (select) {
            select.value = evento.tipo || 'Privado (solo invitados)';
        }
        
        
        const form = document.getElementById('eventForm');
        form.dataset.editingId = eventoId;
        
        // Actualizar texto del botón
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Actualizar Evento';
        }
        
        toggleCreateMenu();
    }
}

function eliminarEvento(eventoId) {
    if (confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
        let eventos = obtenerEventosStorage();
        eventos = eventos.filter(e => e.id !== eventoId);
        guardarEventosStorage(eventos);
        actualizarListaEventos();
        mostrarNotificacion('Evento eliminado correctamente');
    }
}

function gestionarInvitados(eventoId) {
    const evento = obtenerEventoPorId(eventoId);
    
    if (evento) {
        
        const emailsInvitados = prompt(
            'Gestionar invitados. Ingresa emails separados por comas:', 
            evento.invitados.join(', ')
        );
        
        if (emailsInvitados !== null) {
            actualizarInvitados(eventoId, emailsInvitados);
        }
    }
}

function actualizarInvitados(eventoId, emailsTexto) {
    const emails = emailsTexto.split(',')
        .map(email => email.trim())
        .filter(email => email !== '');
    
    let eventos = obtenerEventosStorage();
    const eventoIndex = eventos.findIndex(e => e.id === eventoId);
    
    if (eventoIndex !== -1) {
        eventos[eventoIndex].invitados = emails;
        eventos[eventoIndex].confirmados = Math.min(eventos[eventoIndex].confirmados, emails.length);
        guardarEventosStorage(eventos);
        actualizarListaEventos();
        mostrarNotificacion('Invitados actualizados correctamente');
    }
}

function confirmarAsistencia(eventoId) {
    let eventos = obtenerEventosStorage();
    const eventoIndex = eventos.findIndex(e => e.id === eventoId);
    
    if (eventoIndex !== -1) {
        eventos[eventoIndex].confirmados++;
        guardarEventosStorage(eventos);
        actualizarListaEventos();
        mostrarNotificacion('¡Asistencia confirmada!');
    }
}

function actualizarListaEventos() {
    const listaEventos = document.querySelector('.lista-eventos');
    if (!listaEventos) return;
    
    
    const titulo = listaEventos.querySelector('h3');
    listaEventos.innerHTML = '';
    if (titulo) listaEventos.appendChild(titulo);
    
    const eventos = obtenerEventosStorage();
    
    if (eventos.length === 0) {
        listaEventos.innerHTML += `
            <div class="evento-card vacio">
                <p>No tienes eventos creados aún</p>
                <p>¡Crea tu primer evento haciendo clic en el botón "+"!</p>
            </div>
        `;
        return;
    }
    
    
    eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    eventos.forEach(evento => {
        const eventCard = crearCardEvento(evento);
        listaEventos.appendChild(eventCard);
    });
}

function crearCardEvento(evento) {
    const card = document.createElement('div');
    card.className = `evento-card ${esEventoProximo(evento.fecha) ? 'proximo' : ''}`;
    
    card.innerHTML = `
        <div class="evento-header">
            <h4>${evento.nombre}</h4>
            <span class="evento-tipo">${obtenerEtiquetaTipo(evento.tipo)}</span>
        </div>
        <p>📅 ${formatearFecha(evento.fecha)}</p>
        <p>📍 ${evento.ubicacion || 'Ubicación por confirmar'}</p>
        <p>👥 ${evento.confirmados}/${evento.invitados.length} invitados confirmados</p>
        ${evento.descripcion ? `<p class="evento-descripcion">${evento.descripcion}</p>` : ''}
        <div class="evento-acciones">
            <button onclick="gestionarInvitados(${evento.id})" class="btn-invitados">Gestionar Invitados</button>
            <button onclick="editarEvento(${evento.id})" class="btn-editar">Editar</button>
            <button onclick="eliminarEvento(${evento.id})" class="btn-eliminar">Eliminar</button>
        </div>
    `;
    
    return card;
}


function obtenerEventosStorage() {
    return JSON.parse(localStorage.getItem('eventosPrivados')) || [];
}

function guardarEventosStorage(eventos) {
    localStorage.setItem('eventosPrivados', JSON.stringify(eventos));
}

function obtenerEventoPorId(id) {
    const eventos = obtenerEventosStorage();
    return eventos.find(e => e.id === id);
}

function formatearFecha(fechaISO) {
    const opciones = { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    };
    return new Date(fechaISO).toLocaleDateString('es-ES', opciones);
}

function obtenerEtiquetaTipo(tipo) {
    const tipos = {
        'Privado (solo invitados)': '🔒 Privado',
        'Solo amigos': '👥 Amigos'
    };
    return tipos[tipo] || '🔒 Evento';
}

function esEventoProximo(fechaEvento) {
    const ahora = new Date();
    const fecha = new Date(fechaEvento);
    const diferencia = fecha - ahora;
    const diasDiferencia = diferencia / (1000 * 60 * 60 * 24);
    return diasDiferencia <= 7 && diasDiferencia >= 0; // Próximos 7 días
}

function filtrarEventosProximos() {
    const eventos = obtenerEventosStorage();
    const ahora = new Date();
    
    return eventos.filter(evento => new Date(evento.fecha) > ahora)
                 .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
}


function mostrarNotificacion(mensaje) {
    // Crear notificación temporal
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: fadeInOut 3s ease-in-out;
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}

function mostrarError(mensaje) {
    alert(`Error: ${mensaje}`); 
}

const estilosDinamicos = document.createElement('style');
estilosDinamicos.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-20px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
    }
    
    .evento-card.proximo {
        border-left: 4px solid #4CAF50;
    }
    
    .evento-card.vacio {
        text-align: center;
        padding: 40px 20px;
        color: #666;
    }
    
    .evento-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
    }
    
    .evento-tipo {
        background: #e3f2fd;
        color: #1976d2;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8em;
    }
    
    .evento-descripcion {
        font-style: italic;
        color: #555;
        margin: 10px 0;
    }
    
    .evento-acciones {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 15px;
    }
    
    .evento-acciones button {
        flex: 1;
        min-width: 120px;
    }
    
    input.error {
        border-color: #f44336 !important;
        background-color: #ffebee;
    }
`;
document.head.appendChild(estilosDinamicos);