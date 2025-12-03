class ProfileManager {
    constructor() {
        this.userData = this.loadRealUserData();
        this.userPosts = this.loadUserPosts();
        this.friendsList = this.loadFriendsList();
        this.init();
        this.saveUserDataForMainFeed();
    }

    
   loadRealUserData() {
   
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser && currentUser !== 'undefined' && currentUser !== 'null') {
        try {
            const user = JSON.parse(currentUser);
            console.log('✅ Cargando usuario real:', user.nombre);
            
          
            const savedProfileData = localStorage.getItem('userProfileData');
            let savedProfileImage = null;
            
            if (savedProfileData) {
                const profileData = JSON.parse(savedProfileData);
                savedProfileImage = profileData.profileImage;
            }
        
            return {
                name: user.nombre,
                career: user.carrera,
                institution: "Tecnológico Superior De Centla",
                location: "Tabasco, Mexico",
                birthday: "15 de marzo",
                friendsCount: 1070,
                postsCount: 15,
                profileImage: savedProfileImage || user.avatarImage || "img/usuario2.png",
                bannerImage: null,
                email: user.email || user.correo || `${user.username}@tecnm.mx`,
                avatar: user.avatar
            };
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
    
    
    console.log('⚠️ Usando datos por defecto (no hay usuario loggeado)');
    return {
        name: "Usuario",
        career: "Carrera no especificada",
        institution: "Tecnológico Superior De Centla",
        location: "Tabasco, Mexico",
        birthday: "15 de marzo",
        friendsCount: 1070,
        postsCount: 15,
        profileImage: "img/usuario2.png",
        bannerImage: null,
        email: "usuario@tecnm.mx",
        avatar: "U"
    };
}
    loadUserPosts() {
        const savedPosts = localStorage.getItem('userProfilePosts');
        if (savedPosts) {
            return JSON.parse(savedPosts);
        } else {
            return [
                {
                    id: 1,
                    content: "¡Terminé mi proyecto de bases de datos! 🎉 Fue un reto increíble trabajar con MySQL y Python. ¡Gracias a todos los que me ayudaron!",
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    likes: 15,
                    comments: 8,
                    shares: 3,
                    tags: [],
                    liked: false
                },
                {
                    id: 2,
                    content: "¿Alguien más va al hackathon del próximo mes? Estoy buscando equipo para participar en la categoría de desarrollo web. ¡Tengo ideas geniales! 💡",
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    likes: 28,
                    comments: 8,
                    shares: 5,
                    tags: ["#Hackathon", "#DesarrolloWeb", "#Equipo"],
                    liked: false
                }
            ];
        }
    }

   
    loadFriendsList() {
        const savedFriends = localStorage.getItem('userFriendsList');
        if (savedFriends) {
            return JSON.parse(savedFriends);
        } else {
            return [
                { id: 1, name: "Ana García", avatar: "A", mutualFriends: 15 },
                { id: 2, name: "Marco Flores", avatar: "M", mutualFriends: 8 },
                { id: 3, name: "Carlos Rodríguez", avatar: "C", mutualFriends: 12 },
                { id: 4, name: "Sofia Martínez", avatar: "S", mutualFriends: 6 },
                { id: 5, name: "Luis García", avatar: "L", mutualFriends: 20 },
                { id: 6, name: "Elena Ruiz", avatar: "E", mutualFriends: 3 }
            ];
        }
    }

    saveUserData() {
    
    localStorage.setItem('userProfileData', JSON.stringify(this.userData));
    
    this.updateAuthUserData();
    console.log('💾 Datos de perfil guardados:', this.userData);
}

    updateAuthUserData() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && currentUser !== 'undefined' && currentUser !== 'null') {
        try {
            const user = JSON.parse(currentUser);
            
            user.nombre = this.userData.name;
            user.carrera = this.userData.career;
            user.email = this.userData.email;
            user.avatarImage = this.userData.profileImage; 
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            console.log('✅ Datos de auth actualizados');
        } catch (error) {
            console.error('Error updating auth data:', error);
        }
    }
}

    
    saveUserPosts() {
        localStorage.setItem('userProfilePosts', JSON.stringify(this.userPosts));
    }

    saveFriendsList() {
        localStorage.setItem('userFriendsList', JSON.stringify(this.friendsList));
    }

    // Inicializar funcionalidades
    init() {
        this.renderProfile();
        this.setupEventListeners();
        this.setupFriendSearch();
        this.renderFriendsGrid();
        this.setupCreatePost();
        this.setupComments();
        this.updatePostsCount();
    }

    // Renderizar perfil con datos actuales
    renderProfile() {
        console.log('🎨 Renderizando perfil para:', this.userData.name);
        
        // Actualizar información básica
        const basicInfoName = document.querySelector('.perfil-basic-info h1');
        const basicInfoCareer = document.querySelector('.perfil-carrera');
        const basicInfoFriends = document.querySelector('.perfil-amigos');

        if (basicInfoName) basicInfoName.textContent = this.userData.name;
        if (basicInfoCareer) basicInfoCareer.textContent = this.userData.career;
        if (basicInfoFriends) basicInfoFriends.textContent = `${this.userData.friendsCount.toLocaleString()} amigos`;

        // Actualizar detalles
        const detailItems = document.querySelectorAll('.detalle-item');
        if (detailItems.length >= 3) {
            const institutionSpan = detailItems[0].querySelector('span');
            const locationSpan = detailItems[1].querySelector('span');
            const birthdaySpan = detailItems[2].querySelector('span');

            if (institutionSpan) institutionSpan.textContent = this.userData.institution;
            if (locationSpan) locationSpan.textContent = this.userData.location;
            if (birthdaySpan) birthdaySpan.textContent = `Nacido el ${this.userData.birthday}`;
        }

        // Actualizar contador de amigos
        const amigosCount = document.querySelector('.amigos-count');
        if (amigosCount) {
            amigosCount.textContent = `${this.userData.friendsCount.toLocaleString()} amigos`;
        }

        // Actualizar imagen de perfil
        if (this.userData.profileImage) {
            const profileImg = document.querySelector('.foto-perfil img');
            if (profileImg) {
                profileImg.src = this.userData.profileImage;
            }
        }

        // Actualizar avatar en el header del perfil
        const profileAvatar = document.querySelector('.profile-avatar');
        if (profileAvatar && this.userData.avatar) {
            profileAvatar.textContent = this.userData.avatar;
            profileAvatar.style.background = this.getAvatarColor(this.userData.avatar);
        }

        // Actualizar avatar en crear post
        const createPostAvatar = document.querySelector('.create-post-avatar');
        if (createPostAvatar && this.userData.avatar) {
            createPostAvatar.textContent = this.userData.avatar;
            createPostAvatar.style.background = this.getAvatarColor(this.userData.avatar);
        }

        // Actualizar nombre en crear post
        const createPostName = document.querySelector('.create-post-header .user-name');
        if (createPostName) {
            createPostName.textContent = this.userData.name;
        }
    }

    // Función para colores de avatar (igual que en auth.js)
    getAvatarColor(initial) {
        const colors = {
            'A': 'linear-gradient(135deg, #006699 0%, #004d73 100%)',
            'M': 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            'C': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            'J': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            'U': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
        };
        return colors[initial] || 'linear-gradient(135deg, #006699 0%, #004d73 100%)';
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botón de editar perfil
        const editProfileBtn = document.querySelector('.btn-perfil.secondary');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.openEditProfileModal());
        }

        // Botón de cambiar foto
        const editPhotoBtn = document.querySelector('.edit-foto-btn');
        if (editPhotoBtn) {
            editPhotoBtn.addEventListener('click', () => this.triggerPhotoUpload());
        }

        // Input oculto para subir foto
        this.setupPhotoUpload();

        // Botones de acción rápida para publicaciones
        this.setupPostActions();

        // Botón "Añadir presentación"
        const addPresentationBtn = document.querySelector('.btn-detalle');
        if (addPresentationBtn) {
            addPresentationBtn.addEventListener('click', () => this.addPresentation());
        }

        // Botones de acción mini
        this.setupMiniActions();

        // Botón "Ver todos" amigos
        const seeAllFriends = document.querySelector('.see-all');
        if (seeAllFriends) {
            seeAllFriends.addEventListener('click', () => this.showAllFriends());
        }
    }

    // Configurar input oculto para subir foto
    setupPhotoUpload() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.id = 'profile-photo-upload';
        document.body.appendChild(fileInput);

        fileInput.addEventListener('change', (e) => {
            this.handlePhotoUpload(e.target.files[0]);
        });
    }

    // Disparar la selección de foto
    triggerPhotoUpload() {
        const fileInput = document.getElementById('profile-photo-upload');
        if (fileInput) {
            fileInput.click();
        }
    }

    // Manejar la subida de foto
   handlePhotoUpload(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            
            this.userData.profileImage = e.target.result;
            
           
            this.saveUserData();
            
            this.updateProfileImageInAuth(e.target.result);
            
            this.renderProfile();
            this.showNotification('Foto de perfil actualizada correctamente');
        };
        reader.readAsDataURL(file);
    }
}
updateProfileImageInAuth(newImage) {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && currentUser !== 'undefined' && currentUser !== 'null') {
        try {
            const user = JSON.parse(currentUser);
            // Actualizar la imagen de perfil
            user.avatarImage = newImage;
            localStorage.setItem('currentUser', JSON.stringify(user));
            console.log('✅ Foto de perfil actualizada en auth');
        } catch (error) {
            console.error('Error updating profile image in auth:', error);
        }
    }
}

    openEditProfileModal() {
        this.createEditProfileModal();
    }

   
    createEditProfileModal() {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;

        modalOverlay.innerHTML = `
            <div class="edit-profile-modal" style="
                background: white;
                border-radius: 12px;
                padding: 30px;
                max-width: 500px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #f0f9ff;
                ">
                    <h2 style="margin: 0; color: #006699;">Editar Perfil</h2>
                    <button class="close-modal" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        color: #6b7280;
                    ">×</button>
                </div>
                
                <form id="edit-profile-form">
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Nombre completo</label>
                        <input type="text" id="edit-name" value="${this.userData.name}" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 1rem;
                        ">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Carrera</label>
                        <input type="text" id="edit-career" value="${this.userData.career}" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 1rem;
                        ">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Institución</label>
                        <input type="text" id="edit-institution" value="${this.userData.institution}" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 1rem;
                        ">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Ubicación</label>
                        <input type="text" id="edit-location" value="${this.userData.location}" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 1rem;
                        ">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Fecha de nacimiento</label>
                        <input type="text" id="edit-birthday" value="${this.userData.birthday}" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 1rem;
                        ">
                    </div>
                
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Email</label>
                        <input type="email" id="edit-email" value="${this.userData.email}" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            font-size: 1rem;
                        ">
                    </div>
                    
                    <div class="modal-actions" style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" class="cancel-btn" style="
                            padding: 12px 24px;
                            background: #f3f4f6;
                            color: #374151;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">Cancelar</button>
                        <button type="submit" class="save-btn" style="
                            padding: 12px 24px;
                            background: #006699;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        // Event listeners para el modal
        const closeBtn = modalOverlay.querySelector('.close-modal');
        const cancelBtn = modalOverlay.querySelector('.cancel-btn');
        const form = modalOverlay.querySelector('#edit-profile-form');

        const closeModal = () => {
            document.body.removeChild(modalOverlay);
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfileChanges();
                closeModal();
            });
        }
    }

    // Guardar cambios del perfil
    saveProfileChanges() {
        const nameInput = document.getElementById('edit-name');
        const careerInput = document.getElementById('edit-career');
        const institutionInput = document.getElementById('edit-institution');
        const locationInput = document.getElementById('edit-location');
        const birthdayInput = document.getElementById('edit-birthday');
        const emailInput = document.getElementById('edit-email');

        if (nameInput) this.userData.name = nameInput.value;
        if (careerInput) this.userData.career = careerInput.value;
        if (institutionInput) this.userData.institution = institutionInput.value;
        if (locationInput) this.userData.location = locationInput.value;
        if (birthdayInput) this.userData.birthday = birthdayInput.value;
        if (emailInput) this.userData.email = emailInput.value;

        this.saveUserData(); // Esta función ahora actualiza ambos
        this.renderProfile();
        this.showNotification('Perfil actualizado correctamente');
        this.saveUserDataForMainFeed();
    }

    // Configurar búsqueda de amigos
    setupFriendSearch() {
        let searchInput = document.getElementById('friendSearch');
        if (!searchInput) {
            const friendsCard = document.querySelector('.perfil-card:last-child');
            if (friendsCard) {
                const searchDiv = document.createElement('div');
                searchDiv.className = 'search-friends';
                searchDiv.innerHTML = '<input type="text" id="friendSearch" placeholder="Buscar amigos...">';
                friendsCard.insertBefore(searchDiv, friendsCard.querySelector('.amigos-count'));
                searchInput = document.getElementById('friendSearch');
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterFriends(e.target.value);
            });
        }
    }

    // Filtrar amigos
    filterFriends(searchTerm) {
        const filteredFriends = this.friendsList.filter(friend =>
            friend.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFriendsGrid(filteredFriends);
    }

    
    renderFriendsGrid(friends = this.friendsList) {
        const friendsGrid = document.querySelector('.amigos-grid');
        if (!friendsGrid) return;

        friendsGrid.innerHTML = friends.map(friend => `
            <div class="amigo-item" data-friend-id="${friend.id}">
                <div class="amigo-avatar">${friend.avatar}</div>
                <div class="amigo-info">
                    <span class="amigo-name">${friend.name}</span>
                    <span class="mutual-friends">${friend.mutualFriends} amigos en común</span>
                </div>
                <button class="friend-action" onclick="profileManager.showFriendMenu(${friend.id})">···</button>
            </div>
        `).join('');
    }

    
    showFriendMenu(friendId) {
        this.hideAllMenus();

        const friendItem = document.querySelector(`[data-friend-id="${friendId}"]`);
        if (!friendItem) return;

        const menu = document.createElement('div');
        menu.className = 'friend-context-menu';
        menu.style.cssText = `
            position: absolute;
            right: 10px;
            top: 40px;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1000;
            min-width: 150px;
        `;

        menu.innerHTML = `
            <div class="menu-item" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #f0f0f0;" 
                 onclick="profileManager.viewFriendProfile(${friendId})">Ver perfil</div>
            <div class="menu-item" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #f0f0f0;" 
                 onclick="profileManager.sendMessage(${friendId})">Enviar mensaje</div>
            <div class="menu-item delete" style="padding: 10px; cursor: pointer; color: #e53e3e;" 
                 onclick="profileManager.removeFriend(${friendId})">Eliminar amigo</div>
        `;

        friendItem.style.position = 'relative';
        friendItem.appendChild(menu);

        
        setTimeout(() => {
            document.addEventListener('click', this.closeFriendMenus);
        }, 100);
    }

    closeFriendMenus = () => {
        document.querySelectorAll('.friend-context-menu').forEach(menu => {
            menu.remove();
        });
        document.removeEventListener('click', this.closeFriendMenus);
    }

    hideAllMenus() {
        document.querySelectorAll('.friend-context-menu').forEach(menu => {
            menu.remove();
        });
    }

    
    viewFriendProfile(friendId) {
        this.showNotification(`Redirigiendo al perfil de ${this.getFriendName(friendId)}`);
    }

    sendMessage(friendId) {
        this.showNotification(`Enviando mensaje a ${this.getFriendName(friendId)}`);
    }

    removeFriend(friendId) {
        if (confirm(`¿Estás seguro de que quieres eliminar a ${this.getFriendName(friendId)} de tus amigos?`)) {
            this.friendsList = this.friendsList.filter(friend => friend.id !== friendId);
            this.userData.friendsCount--;
            this.saveFriendsList();
            this.saveUserData();
            this.renderProfile();
            this.renderFriendsGrid();
            this.showNotification('Amigo eliminado correctamente');
        }
    }

    getFriendName(friendId) {
        const friend = this.friendsList.find(f => f.id === friendId);
        return friend ? friend.name : '';
    }

    
    setupCreatePost() {
        const createPostArea = document.querySelector('.create-post');
        if (createPostArea) {
            createPostArea.addEventListener('click', () => {
                this.openCreatePostModal();
            });
        }
    }

    openCreatePostModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 20px; max-width: 500px; width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">Crear Publicación</h3>
                    <button class="close-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
                </div>
                <form id="create-post-form">
                    <textarea placeholder="¿Qué estás pensando?" rows="4" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; margin-bottom: 15px;"></textarea>
                    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                        <button type="button" class="option-btn" style="flex: 1; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer;">📷 Foto</button>
                        <button type="button" class="option-btn" style="flex: 1; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer;">😄 Sentimiento</button>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" class="cancel-btn" style="padding: 10px 20px; background: #f3f4f6; color: #374151; border: none; border-radius: 6px; cursor: pointer;">Cancelar</button>
                        <button type="submit" class="post-btn" style="padding: 10px 20px; background: #006699; color: white; border: none; border-radius: 6px; cursor: pointer;">Publicar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());

        modal.querySelector('#create-post-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewPost(modal);
        });
    }

    createNewPost(modal) {
        const textarea = modal.querySelector('textarea');
        const content = textarea.value.trim();

        if (!content) {
            this.showNotification('Escribe algo para publicar');
            return;
        }

        const newPost = {
            id: Date.now(),
            content: content,
            timestamp: new Date().toISOString(),
            likes: 0,
            comments: 0,
            shares: 0,
            tags: [],
            liked: false
        };

        this.userPosts.unshift(newPost);
        this.saveUserPosts();
        this.renderNewPost(newPost);
        modal.remove();
        this.showNotification('Publicación creada exitosamente');
    }

    renderNewPost(post) {
        const postElement = this.createPostElement(post);
        const feed = document.querySelector('.perfil-feed');
        if (feed) {
            const existingPosts = feed.querySelectorAll('.post');
            if (existingPosts.length > 0) {
                feed.insertBefore(postElement, existingPosts[0].nextSibling);
            } else {
                feed.appendChild(postElement);
            }
        }
    }

    createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.innerHTML = `
            <div class="post-header">
                <div class="user-avatar primary">${this.userData.avatar || 'J'}</div>
                <div class="user-info">
                    <h4 class="user-name">${this.userData.name}</h4>
                    <p class="user-career">${this.formatTimeAgo(post.timestamp)}</p>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
            </div>
            <div class="post-stats">
                <span>${post.likes} me gusta</span>
                <span>${post.comments} comentarios</span>
                <span>${post.shares} compartidos</span>
            </div>
            <div class="post-footer">
                <button class="post-action-btn like-btn">
                    <img src="img/corazon.png" alt="Me gusta">
                    <span>Me gusta</span>
                </button>
                <button class="post-action-btn">
                    <img src="https://img.icons8.com/?size=100&id=38977&format=png&color=000000" alt="Comentar">
                    <span>Comentar</span>
                </button>
                <button class="post-action-btn">
                    <span class="attach-icon"><img src="img/share.png" alt=""></span>
                    <span>Compartir</span>
                </button>
            </div>
        `;

        const likeBtn = postDiv.querySelector('.like-btn');
        likeBtn.addEventListener('click', () => {
            this.togglePostLike(postDiv, post.id);
        });

        return postDiv;
    }

    
    setupPostActions() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.post-action-btn')) {
                const btn = e.target.closest('.post-action-btn');
                const postElement = btn.closest('.post');

                if (postElement && (btn.textContent.includes('Me gusta') || btn.querySelector('img[alt="Me gusta"]'))) {
                    this.togglePostLike(postElement);
                }
            }
        });
    }

    
    togglePostLike(postElement, postId = null) {
        if (!postId) {
            postId = this.getPostIdFromElement(postElement);
        }

        const post = this.userPosts.find(p => p.id === postId);
        if (post) {
            post.liked = !post.liked;
            post.likes += post.liked ? 1 : -1;
            this.saveUserPosts();
            this.updatePostStats(postElement, post);
            this.animateLike(postElement);
        }
    }

    getPostIdFromElement(element) {
        const posts = Array.from(document.querySelectorAll('.perfil-feed .post'));
        const index = posts.indexOf(element);
        return this.userPosts[index] ? this.userPosts[index].id : 1;
    }

    updatePostStats(postElement, post) {
        const statsElement = postElement.querySelector('.post-stats');
        if (statsElement) {
            statsElement.innerHTML = `
                <span>${post.likes} me gusta</span>
                <span>${post.comments} comentarios</span>
                <span>${post.shares} compartidos</span>
            `;
        }

        const likeBtn = postElement.querySelector('.post-action-btn:first-child');
        if (likeBtn) {
            if (post.liked) {
                likeBtn.classList.add('liked');
                const likeImg = likeBtn.querySelector('img');
                if (likeImg) likeImg.src = 'img/corazon-rojo.png';
            } else {
                likeBtn.classList.remove('liked');
                const likeImg = likeBtn.querySelector('img');
                if (likeImg) likeImg.src = 'img/corazon.png';
            }
        }
    }

    animateLike(postElement) {
        const likeIcon = postElement.querySelector('.post-action-btn:first-child img');
        if (likeIcon) {
            likeIcon.style.transform = 'scale(1.3)';
            setTimeout(() => {
                likeIcon.style.transform = 'scale(1)';
            }, 300);
        }
    }

    
    formatTimeAgo(timestamp) {
        const now = new Date();
        const postDate = new Date(timestamp);
        const diffInSeconds = Math.floor((now - postDate) / 1000);

        if (diffInSeconds < 60) return 'Hace unos segundos';
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
        if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;

        return postDate.toLocaleDateString();
    }

   
    setupComments() {
        
    }


    setupMiniActions() {
        const miniActions = document.querySelectorAll('.action-mini');
        miniActions.forEach(action => {
            action.addEventListener('click', () => {
                const actionType = action.textContent.trim();
                this.handleMiniAction(actionType);
            });
        });
    }

    handleMiniAction(actionType) {
        switch (actionType) {
            case 'Video en vivo':
                this.showNotification('Función de video en vivo próximamente');
                break;
            case 'Foto/video':
                this.showNotification('Selector de fotos/videos próximamente');
                break;
            case 'Sentimiento':
                this.showNotification('Selector de sentimientos próximamente');
                break;
        }
    }

    
    addPresentation() {
        const presentation = prompt('Añade una presentación sobre ti:');
        if (presentation) {
            this.showNotification('Presentación añadida correctamente');
        }
    }

    
    showAllFriends() {
        this.showNotification('Mostrando todos los amigos');
    }


    updatePostsCount() {
        console.log(`Total de publicaciones: ${this.userPosts.length}`);
    }

    
    showNotification(message) {
        document.querySelectorAll('.profile-notification').forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = 'profile-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transition: all 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    saveUserDataForMainFeed() {
        const mainFeedData = {
            name: this.userData.name,
            career: this.userData.career,
            profileImage: this.userData.profileImage,
            email: this.userData.email,
            avatar: this.userData.avatar
        };
        localStorage.setItem('mainFeedUserData', JSON.stringify(mainFeedData));
        console.log('Datos sincronizados con main feed:', mainFeedData);
    }
}


let profileManager;


document.addEventListener('DOMContentLoaded', () => {
    profileManager = new ProfileManager();
    console.log('ProfileManager inicializado correctamente');
});