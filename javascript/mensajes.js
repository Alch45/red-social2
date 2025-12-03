

let chats = [];
let chatActivo = null;
let usuariosDisponibles = [];

document.addEventListener('DOMContentLoaded', function() {
    inicializarDatos();
    inicializarEventListeners();
    cargarChatsDesdeStorage();
    actualizarListaChats();
});

function inicializarDatos() {
    // Datos de ejemplo para usuarios disponibles
    usuariosDisponibles = [
        { id: 1, nombre: 'María Rodríguez', avatar: 'M', online: true },
        { id: 2, nombre: 'Carlos López', avatar: 'C', online: false },
        { id: 3, nombre: 'Juan Pérez', avatar: 'J', online: true },
        { id: 4, nombre: 'Sofia Martínez', avatar: 'S', online: true },
        { id: 5, nombre: 'Pedro García', avatar: 'P', online: false },
        { id: 6, nombre: 'Laura Hernández', avatar: 'L', online: true }
    ];
}

function inicializarEventListeners() {
    // Botón nuevo chat
    const nuevoChatBtn = document.querySelector('.nuevo-chat-btn');
    if (nuevoChatBtn) {
        nuevoChatBtn.addEventListener('click', mostrarModalNuevoChat);
    }
    
    // Búsqueda de chats
    const searchInput = document.querySelector('.chats-search input');
    if (searchInput) {
        searchInput.addEventListener('input', buscarChats);
    }
    
    // Búsqueda global
    const searchGlobal = document.querySelector('.header-search input');
    if (searchGlobal) {
        searchGlobal.addEventListener('input', buscarGlobal);
    }
    
    // Configurar menús desplegables del header
    configurarHeaderInteractivo();
}


function cargarChatsDesdeStorage() {
    const chatsGuardados = localStorage.getItem('chatsComuniTec');
    if (chatsGuardados) {
        chats = JSON.parse(chatsGuardados);
    } else {
        // Cargar chats de ejemplo
        chats = [
            {
                id: 1,
                usuario: usuariosDisponibles[0],
                mensajes: [
                    { id: 1, texto: 'Hola, ¿cómo estás?', enviadoPorMi: false, timestamp: new Date('2024-11-15T10:25:00') },
                    { id: 2, texto: '¡Hola! Bien, ¿y tú?', enviadoPorMi: true, timestamp: new Date('2024-11-15T10:26:00') },
                    { id: 3, texto: '¿Vas a ir a la sesión de estudio?', enviadoPorMi: false, timestamp: new Date('2024-11-15T10:30:00') }
                ],
                noLeidos: 3,
                ultimaActividad: new Date('2024-11-15T10:30:00')
            },
            {
                id: 2,
                usuario: usuariosDisponibles[1],
                mensajes: [
                    { id: 1, texto: 'Te envié el material de programación', enviadoPorMi: false, timestamp: new Date('2024-11-14T15:20:00') },
                    { id: 2, texto: '¡Gracias! Lo revisaré hoy', enviadoPorMi: true, timestamp: new Date('2024-11-14T15:25:00') }
                ],
                noLeidos: 0,
                ultimaActividad: new Date('2024-11-14T15:25:00')
            },
            {
                id: 3,
                usuario: usuariosDisponibles[2],
                mensajes: [
                    { id: 1, texto: 'Listo, nos vemos mañana', enviadoPorMi: false, timestamp: new Date('2024-11-11T09:15:00') },
                    { id: 2, texto: 'Perfecto, ¡llevo el material!', enviadoPorMi: true, timestamp: new Date('2024-11-11T09:16:00') }
                ],
                noLeidos: 0,
                ultimaActividad: new Date('2024-11-11T09:16:00')
            },
            {
                id: 4,
                usuario: usuariosDisponibles[3],
                mensajes: [
                    { id: 1, texto: '¿Tienes los apuntes de física?', enviadoPorMi: false, timestamp: new Date('2024-11-10T14:30:00') }
                ],
                noLeidos: 1,
                ultimaActividad: new Date('2024-11-10T14:30:00')
            }
        ];
        guardarChatsEnStorage();
    }
}

function guardarChatsEnStorage() {
    localStorage.setItem('chatsComuniTec', JSON.stringify(chats));
}


function actualizarListaChats() {
    const chatsList = document.querySelector('.chats-list');
    if (!chatsList) return;
    
    chatsList.innerHTML = '';
    
    if (chats.length === 0) {
        chatsList.innerHTML = `
            <div class="empty-chats">
                <p>No tienes conversaciones</p>
                <p>¡Inicia un nuevo chat!</p>
            </div>
        `;
        return;
    }
    
    
    chats.sort((a, b) => new Date(b.ultimaActividad) - new Date(a.ultimaActividad));
    
    chats.forEach(chat => {
        const chatItem = crearElementoChat(chat);
        chatsList.appendChild(chatItem);
    });
}

function crearElementoChat(chat) {
    const chatItem = document.createElement('div');
    chatItem.className = `chat-item ${chat.noLeidos > 0 ? 'unread' : ''}`;
    chatItem.dataset.chatId = chat.id;
    
    const ultimoMensaje = chat.mensajes[chat.mensajes.length - 1];
    const preview = ultimoMensaje ? ultimoMensaje.texto : 'Sin mensajes';
    
    chatItem.innerHTML = `
        <div class="chat-avatar ${chat.usuario.online ? 'online' : ''}">${chat.usuario.avatar}</div>
        <div class="chat-info">
            <div class="chat-header">
                <span class="chat-name">${chat.usuario.nombre}</span>
                <span class="chat-time">${formatearTiempo(chat.ultimaActividad)}</span>
            </div>
            <div class="chat-preview">
                <span>${preview}</span>
                ${chat.noLeidos > 0 ? `<span class="unread-badge">${chat.noLeidos}</span>` : ''}
            </div>
        </div>
    `;
    
   
    chatItem.addEventListener('click', () => seleccionarChat(chat.id));
    
    return chatItem;
}

function seleccionarChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    chatActivo = chat;
    
   
    if (chat.noLeidos > 0) {
        chat.noLeidos = 0;
        guardarChatsEnStorage();
        actualizarListaChats();
    }
    
    mostrarChatActivo();
    actualizarContadorNotificaciones();
}

function mostrarChatActivo() {
    const chatEmpty = document.querySelector('.chat-empty');
    if (!chatEmpty) return;
    
    chatEmpty.innerHTML = `
        <div class="chat-active">
            <div class="chat-header-active">
                <div class="chat-user-info">
                    <div class="chat-avatar ${chatActivo.usuario.online ? 'online' : ''}">${chatActivo.usuario.avatar}</div>
                    <div class="chat-user-details">
                        <h3>${chatActivo.usuario.nombre}</h3>
                        <span class="user-status">${chatActivo.usuario.online ? 'En línea' : 'Desconectado'}</span>
                    </div>
                </div>
                <div class="chat-actions">
                    <button class="chat-action-btn" title="Llamar">📞</button>
                    <button class="chat-action-btn" title="Video llamada">📹</button>
                    <button class="chat-action-btn" title="Más opciones">⋯</button>
                </div>
            </div>
            
            <div class="chat-messages" id="chatMessages">
                ${generarMensajesChat()}
            </div>
            
            <div class="chat-input-container">
                <div class="chat-input-actions">
                    <button class="input-action-btn" title="Adjuntar archivo">📎</button>
                    <button class="input-action-btn" title="Emojis">😊</button>
                </div>
                <input type="text" class="chat-input" placeholder="Escribe un mensaje..." id="chatInput">
                <button class="send-btn" id="sendBtn">➤</button>
            </div>
        </div>
    `;
    
    
    const sendBtn = document.getElementById('sendBtn');
    const chatInput = document.getElementById('chatInput');
    
    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', enviarMensaje);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                enviarMensaje();
            }
        });
    }
    
    // Scroll al final de los mensajes
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function generarMensajesChat() {
    if (!chatActivo || !chatActivo.mensajes.length) {
        return '<div class="no-messages">No hay mensajes aún. ¡Envía el primero!</div>';
    }
    
    return chatActivo.mensajes.map(mensaje => `
        <div class="message ${mensaje.enviadoPorMi ? 'sent' : 'received'}">
            <div class="message-content">
                <p>${mensaje.texto}</p>
                <span class="message-time">${formatearHora(mensaje.timestamp)}</span>
            </div>
        </div>
    `).join('');
}

//  ENVÍO DE MENSAJES 
function enviarMensaje() {
    const chatInput = document.getElementById('chatInput');
    if (!chatInput || !chatInput.value.trim() || !chatActivo) return;
    
    const texto = chatInput.value.trim();
    const nuevoMensaje = {
        id: Date.now(),
        texto: texto,
        enviadoPorMi: true,
        timestamp: new Date()
    };
    
   
    chatActivo.mensajes.push(nuevoMensaje);
    chatActivo.ultimaActividad = new Date();
    
    // Guardar y actualizar interfaz
    guardarChatsEnStorage();
    mostrarChatActivo();
    
    // Limpiar input
    chatInput.value = '';
    
    setTimeout(simularRespuesta, 2000);
}

function simularRespuesta() {
    if (!chatActivo) return;
    
    const respuestas = [
        '¡Interesante!',
        '¿En serio?',
        'Jajaja, eso es gracioso',
        'No sabía eso',
        '¿Podrías explicarme más?',
        'Estoy de acuerdo contigo',
        '¿Qué opinas tú?'
    ];
    
    const respuestaAleatoria = respuestas[Math.floor(Math.random() * respuestas.length)];
    
    const respuesta = {
        id: Date.now(),
        texto: respuestaAleatoria,
        enviadoPorMi: false,
        timestamp: new Date()
    };
    
    chatActivo.mensajes.push(respuesta);
    chatActivo.ultimaActividad = new Date();
    chatActivo.noLeidos++;
    
    guardarChatsEnStorage();
    mostrarChatActivo();
    actualizarListaChats();
    actualizarContadorNotificaciones();
}

function mostrarModalNuevoChat() {
    const modalHTML = `
        <div class="modal-overlay" id="nuevoChatModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Nuevo Chat</h3>
                    <button class="modal-close" id="closeModal">&times;</button>
                </div>
                <div class="modal-search">
                    <input type="text" placeholder="Buscar compañeros..." id="searchUsers">
                </div>
                <div class="users-list" id="usersList">
                    ${generarListaUsuarios()}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
  
    document.getElementById('closeModal').addEventListener('click', cerrarModal);
    document.getElementById('nuevoChatModal').addEventListener('click', (e) => {
        if (e.target.id === 'nuevoChatModal') cerrarModal();
    });
   
    document.getElementById('searchUsers').addEventListener('input', buscarUsuarios);
}

function generarListaUsuarios() {
    return usuariosDisponibles.map(usuario => `
        <div class="user-item" data-user-id="${usuario.id}">
            <div class="user-avatar ${usuario.online ? 'online' : ''}">${usuario.avatar}</div>
            <div class="user-info">
                <span class="user-name">${usuario.nombre}</span>
                <span class="user-status">${usuario.online ? 'En línea' : 'Desconectado'}</span>
            </div>
            <button class="start-chat-btn" onclick="iniciarChatConUsuario(${usuario.id})">Chat</button>
        </div>
    `).join('');
}

function iniciarChatConUsuario(usuarioId) {
    const usuario = usuariosDisponibles.find(u => u.id === usuarioId);
    if (!usuario) return;
    
    // Verificar si ya existe un chat con este usuario
    let chatExistente = chats.find(c => c.usuario.id === usuarioId);
    
    if (!chatExistente) {
        // Crear nuevo chat
        const nuevoChat = {
            id: Date.now(),
            usuario: usuario,
            mensajes: [],
            noLeidos: 0,
            ultimaActividad: new Date()
        };
        
        chats.push(nuevoChat);
        guardarChatsEnStorage();
        chatExistente = nuevoChat;
    }
    
    cerrarModal();
    seleccionarChat(chatExistente.id);
    actualizarListaChats();
}

function cerrarModal() {
    const modal = document.getElementById('nuevoChatModal');
    if (modal) {
        modal.remove();
    }
}


function buscarChats(event) {
    const termino = event.target.value.toLowerCase();
    const chatItems = document.querySelectorAll('.chat-item');
    
    chatItems.forEach(item => {
        const nombre = item.querySelector('.chat-name').textContent.toLowerCase();
        const preview = item.querySelector('.chat-preview span').textContent.toLowerCase();
        
        if (nombre.includes(termino) || preview.includes(termino)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function buscarUsuarios(event) {
    const termino = event.target.value.toLowerCase();
    const userItems = document.querySelectorAll('.user-item');
    
    userItems.forEach(item => {
        const nombre = item.querySelector('.user-name').textContent.toLowerCase();
        if (nombre.includes(termino)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function buscarGlobal(event) {
    const termino = event.target.value.toLowerCase();
    // Implementar búsqueda global (chats, usuarios, grupos)
    console.log('Buscando:', termino);
}


function formatearTiempo(fecha) {
    const ahora = new Date();
    const fechaMsg = new Date(fecha);
    const diferencia = ahora - fechaMsg;
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (dias === 0) {
        return formatearHora(fechaMsg);
    } else if (dias === 1) {
        return 'Ayer';
    } else if (dias < 7) {
        return `${dias}d`;
    } else {
        return fechaMsg.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
}

function formatearHora(fecha) {
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function actualizarContadorNotificaciones() {
    const totalNoLeidos = chats.reduce((total, chat) => total + chat.noLeidos, 0);
    const badge = document.querySelector('.notification-badge');
    
    if (badge) {
        if (totalNoLeidos > 0) {
            badge.textContent = totalNoLeidos > 99 ? '99+' : totalNoLeidos;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function configurarHeaderInteractivo() {
    // Menú de perfil
    const profileDropdown = document.querySelector('.profile-dropdown');
    if (profileDropdown) {
        profileDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });
    }
    
    // Cerrar menús al hacer clic fuera
    document.addEventListener('click', () => {
        const menuActivo = document.querySelector('.profile-dropdown.active');
        if (menuActivo) {
            menuActivo.classList.remove('active');
        }
    });
    
    // Notificaciones
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', mostrarNotificaciones);
    }
}

function mostrarNotificaciones() {
    // Implementar sistema de notificaciones
    alert('Sistema de notificaciones - En desarrollo');
}


const estilosMensajes = document.createElement('style');
estilosMensajes.textContent = `
    .chat-item {
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .chat-item:hover {
        background-color: #f5f5f5;
    }
    
    .chat-item.unread {
        background-color: #f0f7ff;
    }
    
    .chat-item.unread .chat-name {
        font-weight: bold;
    }
    
    .chat-avatar.online::after {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 8px;
        height: 8px;
        background-color: #4CAF50;
        border-radius: 50%;
        border: 2px solid white;
    }
    
    .chat-active {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    
    .chat-header-active {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
        background: white;
    }
    
    .chat-user-info {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .chat-user-details h3 {
        margin: 0;
        font-size: 1.1em;
    }
    
    .user-status {
        font-size: 0.8em;
        color: #666;
    }
    
    .chat-actions {
        display: flex;
        gap: 10px;
    }
    
    .chat-action-btn {
        background: none;
        border: none;
        font-size: 1.2em;
        cursor: pointer;
        padding: 5px;
    }
    
    .chat-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .message {
        display: flex;
        max-width: 70%;
    }
    
    .message.sent {
        align-self: flex-end;
    }
    
    .message.received {
        align-self: flex-start;
    }
    
    .message-content {
        padding: 10px 15px;
        border-radius: 18px;
        position: relative;
    }
    
    .message.sent .message-content {
        background: #007bff;
        color: white;
        border-bottom-right-radius: 5px;
    }
    
    .message.received .message-content {
        background: #f1f1f1;
        color: #333;
        border-bottom-left-radius: 5px;
    }
    
    .message-time {
        font-size: 0.7em;
        opacity: 0.7;
        display: block;
        margin-top: 5px;
    }
    
    .chat-input-container {
        display: flex;
        padding: 15px 20px;
        border-top: 1px solid #eee;
        background: white;
        align-items: center;
        gap: 10px;
    }
    
    .chat-input-actions {
        display: flex;
        gap: 5px;
    }
    
    .input-action-btn {
        background: none;
        border: none;
        font-size: 1.2em;
        cursor: pointer;
        padding: 5px;
    }
    
    .chat-input {
        flex: 1;
        padding: 10px 15px;
        border: 1px solid #ddd;
        border-radius: 20px;
        outline: none;
    }
    
    .send-btn {
        background: #007bff;
        color: white;
        border: none;
        border-radius: 50%;
        width: 35px;
        height: 35px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    /* Modal */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: white;
        border-radius: 10px;
        width: 90%;
        max-width: 400px;
        max-height: 80vh;
        overflow: hidden;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #eee;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 1.5em;
        cursor: pointer;
    }
    
    .modal-search {
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
    }
    
    .modal-search input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }
    
    .users-list {
        max-height: 300px;
        overflow-y: auto;
    }
    
    .user-item {
        display: flex;
        align-items: center;
        padding: 15px 20px;
        gap: 10px;
        border-bottom: 1px solid #f5f5f5;
    }
    
    .user-info {
        flex: 1;
    }
    
    .user-name {
        display: block;
        font-weight: 500;
    }
    
    .user-status {
        font-size: 0.8em;
        color: #666;
    }
    
    .start-chat-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 15px;
        cursor: pointer;
    }
    
    .empty-chats {
        text-align: center;
        padding: 40px 20px;
        color: #666;
    }
    
    .no-messages {
        text-align: center;
        color: #666;
        padding: 40px 20px;
    }
`;
document.head.appendChild(estilosMensajes);