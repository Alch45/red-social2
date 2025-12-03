class FeedManager {
    constructor() {
        this.postManager = new PostManager();
        this.notificationManager = new NotificationManager();
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.postManager.init();
        this.notificationManager.init();
    }

    // Cargar datos del usuario para el main feed
    loadUserData() {
        const savedData = localStorage.getItem('mainFeedUserData');
        
        if (savedData) {
            const userData = JSON.parse(savedData);
            this.updateSidebarUserInfo(userData);
            this.updateHeaderUserInfo(userData);
        } else {
            const profileData = localStorage.getItem('userProfileData');
            if (profileData) {
                const userData = JSON.parse(profileData);
                this.updateSidebarUserInfo({
                    name: userData.name,
                    career: userData.career,
                    profileImage: userData.profileImage
                });
                this.updateHeaderUserInfo({
                    name: userData.name,
                    career: userData.career,
                    profileImage: userData.profileImage
                });
            }
        }
    }

    // Actualizar la información del usuario en el sidebar
    updateSidebarUserInfo(userData) {
        const userNameElement = document.querySelector('.user-name-profile');
        const userCareerElement = document.querySelector('.user-career-profile');
        const avatarImage = document.querySelector('.user-avatar-large img');
        const createPostName = document.querySelector('.create-post .user-name');

        if (userNameElement && userData.name) userNameElement.textContent = userData.name;
        if (userCareerElement && userData.career) userCareerElement.textContent = userData.career;
        if (avatarImage && userData.profileImage) avatarImage.src = userData.profileImage;
        if (createPostName && userData.name) createPostName.textContent = userData.name;
    }

    // Actualizar información en el header
    updateHeaderUserInfo(userData) {
        const profileNameElement = document.querySelector('.profile-name');
        const profileEmailElement = document.querySelector('.profile-email');
        const headerAvatar = document.querySelector('.profile-avatar');

        if (profileNameElement && userData.name) profileNameElement.textContent = userData.name;
        if (profileEmailElement && userData.email) profileEmailElement.textContent = userData.email;
        if (headerAvatar && userData.name) headerAvatar.textContent = userData.name.charAt(0).toUpperCase();
    }

    // Configurar event listeners
    setupEventListeners() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'mainFeedUserData' && e.newValue) {
                const userData = JSON.parse(e.newValue);
                this.updateSidebarUserInfo(userData);
                this.updateHeaderUserInfo(userData);
            }
        });

        this.setupPeriodicSync();
    }

    // Sincronización periódica
    setupPeriodicSync() {
        setInterval(() => {
            const savedData = localStorage.getItem('mainFeedUserData');
            if (savedData) {
                const userData = JSON.parse(savedData);
                this.updateSidebarUserInfo(userData);
                this.updateHeaderUserInfo(userData);
            }
        }, 2000);
    }
}

class PostManager {
    constructor() {
        this.posts = this.loadPosts();
        this.currentUser = this.getCurrentUser();
    }

    init() {
        this.renderExistingPosts();
        this.setupCreatePost();
        this.setupPostMenus();
        this.setupSearch();
        this.setupFileUpload();
        this.setupRealTimeFeed();
    }
    // ELIMINAR PUBLICACIONES
setupPostMenus() {
    document.addEventListener('click', (e) => {
        // Abrir/cerrar menú de opciones
        if (e.target.closest('.post-menu-btn')) {
            e.stopPropagation();
            this.togglePostMenu(e.target.closest('.post-menu-btn'));
        }
        
        // Cerrar menús al hacer clic fuera
        if (!e.target.closest('.post-menu') && !e.target.closest('.post-menu-btn')) {
            this.closeAllPostMenus();
        }
    });

    // Manejar acciones del menú
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-post')) {
            this.deletePost(e.target.closest('.post'));
        }
        
        if (e.target.classList.contains('edit-post')) {
            this.editPost(e.target.closest('.post'));
        }
    });
}
togglePostMenu(menuBtn) {
    // Cerrar otros menús abiertos
    this.closeAllPostMenus();
    
    // Abrir el menú actual
    const menu = menuBtn.nextElementSibling;
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

closeAllPostMenus() {
    document.querySelectorAll('.post-menu').forEach(menu => {
        menu.style.display = 'none';
    });
}

deletePost(postElement) {
    const postId = parseInt(postElement.dataset.postId);
    const post = this.posts.find(p => p.id === postId);
    
    if (!post) return;
    
    // Confirmación antes de eliminar
    if (confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
        // Eliminar del array
        this.posts = this.posts.filter(p => p.id !== postId);
          
        postElement.remove();
        this.savePosts();

        this.showNotification('success', 'Publicación eliminada correctamente');
        
        // Cerrar menú
        this.closeAllPostMenus();
    }
}

editPost(postElement) {
    const postId = parseInt(postElement.dataset.postId);
    const post = this.posts.find(p => p.id === postId);
    
    if (!post) return;
    
    // Convertir el contenido en editable
    const postContent = postElement.querySelector('.post-content p');
    const currentContent = postContent.textContent;
    
    // Crear textarea para editar
    const textarea = document.createElement('textarea');
    textarea.value = currentContent;
    textarea.style.width = '100%';
    textarea.style.padding = '10px';
    textarea.style.border = '2px solid #3b82f6';
    textarea.style.borderRadius = '8px';
    textarea.style.resize = 'vertical';
    textarea.rows = 3;
    
    // Reemplazar el contenido
    postContent.replaceWith(textarea);
    textarea.focus();
    
    // Botones de guardar/cancelar
    const editControls = document.createElement('div');
    editControls.className = 'edit-controls';
    editControls.style.marginTop = '10px';
    editControls.style.display = 'flex';
    editControls.style.gap = '10px';
    editControls.style.justifyContent = 'flex-end';
    
    editControls.innerHTML = `
        <button class="cancel-edit-btn" style="padding: 8px 16px; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer;">Cancelar</button>
        <button class="save-edit-btn" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">Guardar</button>
    `;
    
    postElement.querySelector('.post-content').appendChild(editControls);
    
    // Event listeners para los botones
    const cancelBtn = editControls.querySelector('.cancel-edit-btn');
    const saveBtn = editControls.querySelector('.save-edit-btn');
    
    cancelBtn.addEventListener('click', () => {
        // Restaurar contenido original
        textarea.replaceWith(postContent);
        editControls.remove();
    });
    
    saveBtn.addEventListener('click', () => {
        const newContent = textarea.value.trim();
        if (newContent) {
            // Actualizar contenido
            post.content = newContent;
            this.savePosts();
            
            // Actualizar DOM
            postContent.textContent = newContent;
            textarea.replaceWith(postContent);
            editControls.remove();
            
            this.showNotification('success', 'Publicación actualizada correctamente');
        } else {
            this.showNotification('error', 'El contenido no puede estar vacío');
        }
    });
    
    
    this.closeAllPostMenus();
}
 renderExistingPosts() {
        const feedContainer = document.querySelector('.feed-container');
        if (!feedContainer || this.posts.length === 0) return;

        
        const createPostArea = feedContainer.querySelector('.create-post');
        const insertionPoint = createPostArea ? createPostArea.nextElementSibling : null;

        this.posts.forEach(post => {
            const postElement = this.createPostElement(post);
            if (insertionPoint) {
                feedContainer.insertBefore(postElement, insertionPoint);
            } else {
                feedContainer.appendChild(postElement);
            }
        });
    }
   
     loadPosts() {
        const savedPosts = localStorage.getItem('feedPosts');
        if (savedPosts) {
            return JSON.parse(savedPosts);
        } else {
            return [
                {
                    id: 1,
                    user: { name: "Alexander Osorio Sanchez", career: "Ingeniería de Software" },
                    content: "¡Alguien Vio Mi carterA?.",
                    timestamp: new Date(Date.now() - 3600000), 
                    likes: 5,
                    comments: [],
                    shares: 2,
                    liked: false
                }
            ];
        }
    }

    savePosts() {
        localStorage.setItem('feedPosts', JSON.stringify(this.posts));
    }

    getCurrentUser() {
        const savedData = localStorage.getItem('mainFeedUserData');
        if (savedData) {
            return JSON.parse(savedData);
        } else {
            return { name: "Alexander Osorio Sanchez", career: "Ingeniería de Software" };
        }
    }

    createPost(content, image = null) {
        const newPost = {
            id: Date.now(),
            user: this.currentUser,
            content: content,
            image: image,
            timestamp: new Date(),
            likes: 0,
            comments: [],
            shares: 0,
            liked: false
        };
        
        this.posts.unshift(newPost);
        this.savePosts();
        this.renderNewPost(newPost);
        this.showNotification('success', '¡Publicación creada exitosamente!');
    }

    renderNewPost(post) {
        const postElement = this.createPostElement(post);
        const feedContainer = document.querySelector('.feed-container');
        const createPostArea = feedContainer.querySelector('.create-post');
        
        // Insertar después del área de crear post
        if (createPostArea && createPostArea.nextElementSibling) {
            feedContainer.insertBefore(postElement, createPostArea.nextElementSibling);
        } else {
            feedContainer.appendChild(postElement);
        }
    }

   createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.dataset.postId = post.id;
    
    const isCurrentUserPost = post.user.name === this.currentUser.name;
    
    postDiv.innerHTML = `
        <div class="post-header">
            <div class="user-avatar primary">${post.user.name.charAt(0)}</div>
            <div class="user-info">
                <h4 class="user-name">${post.user.name}</h4>
                <p class="user-career">${post.user.career}</p>
                <span class="post-time">${this.formatTimeAgo(post.timestamp)}</span>
            </div>
            ${isCurrentUserPost ? `
                <div class="post-actions">
                    <button class="post-menu-btn" title="Opciones del post">⋯</button>
                    <div class="post-menu" style="display: none;">
                        <button class="menu-item edit-post">Editar</button>
                        <button class="menu-item delete-post">Eliminar</button>
                    </div>
                </div>
            ` : ''}
        </div>
        <div class="post-content">
            <p>${post.content}</p>
            ${post.image ? `<div class="post-image"><img src="${post.image}" alt="Imagen del post"></div>` : ''}
        </div>
        <div class="post-stats">
            <span><span class="likes-count">${post.likes}</span> me gusta</span>
            <span><span class="comments-count">${post.comments.length}</span> comentarios</span>
            <span><span class="shares-count">${post.shares}</span> compartidos</span>
        </div>
        <div class="post-footer">
            <button class="post-action-btn like-btn ${post.liked ? 'liked' : ''}">
                <img src="${post.liked ? 'img/corazon-rojo.png' : 'img/corazon.png'}" alt="Me gusta">
                <span>Me gusta</span>
            </button>
            <button class="post-action-btn comment-btn">
                <img src="https://img.icons8.com/?size=100&id=38977&format=png&color=000000" alt="Comentar">
                <span>Comentar</span>
            </button>
            <button class="post-action-btn share-btn">
                <span class="attach-icon"><img src="img/share.png" alt=""></span>
                <span>Compartir</span>
            </button>
        </div>
        <div class="comments-section" style="display: none;"></div>
    `;

    this.attachPostEventListeners(postDiv, post);
    return postDiv;
}

 attachPostEventListeners(postElement, post) {
    const likeBtn = postElement.querySelector('.like-btn');
    const commentBtn = postElement.querySelector('.comment-btn');
    const shareBtn = postElement.querySelector('.share-btn');

    
    likeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleLike(postElement, post.id);
    });


    commentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleComments(postElement, post.id);
    });

   
    shareBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.sharePost(postElement, post.id);
    });
}

    //  SISTEMA DE LIKES 
    setupLikeSystem() {

    }

    toggleLike(postElement, postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const likeBtn = postElement.querySelector('.like-btn');
        const likesCount = postElement.querySelector('.likes-count');
        
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        
        this.savePosts();
        this.updatePostStats(postElement, post);
        this.animateLike(likeBtn);
        
        if (post.liked) {
            this.showNotification('info', `Te gusta la publicación de ${post.user.name}`);
        }
    }

    updatePostStats(postElement, post) {
        const likesCount = postElement.querySelector('.likes-count');
        const commentsCount = postElement.querySelector('.comments-count');
        const sharesCount = postElement.querySelector('.shares-count');
        const likeBtn = postElement.querySelector('.like-btn');
        const likeImg = likeBtn.querySelector('img');

        if (likesCount) likesCount.textContent = post.likes;
        if (commentsCount) commentsCount.textContent = post.comments.length;
        if (sharesCount) sharesCount.textContent = post.shares;
        
        likeBtn.classList.toggle('liked', post.liked);
        likeImg.src = post.liked ? 'img/corazon-rojo.png' : 'img/corazon.png';
    }

    animateLike(likeBtn) {
        likeBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            likeBtn.style.transform = 'scale(1)';
        }, 200);
    }

    
    toggleComments(postElement, postId) {
        let commentsSection = postElement.querySelector('.comments-section');
        
        if (!commentsSection || commentsSection.style.display === 'none') {
            if (!commentsSection) {
                commentsSection = this.createCommentsSection();
                postElement.appendChild(commentsSection);
            }
            commentsSection.style.display = 'block';
            this.loadComments(postElement, postId);
        } else {
            commentsSection.style.display = 'none';
        }
    }

    createCommentsSection() {
        const section = document.createElement('div');
        section.className = 'comments-section';
        section.innerHTML = `
            <div class="comment-input-container">
                <input type="text" placeholder="Escribe un comentario..." class="comment-input">
                <button class="comment-submit-btn">Comentar</button>
            </div>
            <div class="comments-list"></div>
        `;
        return section;
    }

    loadComments(postElement, postId) {
        const post = this.posts.find(p => p.id === postId);
        const commentsList = postElement.querySelector('.comments-list');
        const commentInput = postElement.querySelector('.comment-input');
        const submitBtn = postElement.querySelector('.comment-submit-btn');

        if (!post || !commentsList) return;

        // Render comments
        commentsList.innerHTML = post.comments.map(comment => `
            <div class="comment">
                <div class="comment-avatar">${comment.user.charAt(0)}</div>
                <div class="comment-content">
                    <strong>${comment.user}</strong>
                    <p>${comment.text}</p>
                    <span class="comment-time">${this.formatTimeAgo(comment.timestamp)}</span>
                </div>
            </div>
        `).join('');

        // Add new comment
        const addComment = () => {
            const text = commentInput.value.trim();
            if (text) {
                const newComment = {
                    user: this.currentUser.name,
                    text: text,
                    timestamp: new Date()
                };
                
                post.comments.push(newComment);
                this.savePosts();
                this.loadComments(postElement, postId);
                commentInput.value = '';
                this.updatePostStats(postElement, post);
                this.showNotification('success', 'Comentario agregado');
            }
        };

        submitBtn.onclick = addComment;
        commentInput.onkeypress = (e) => {
            if (e.key === 'Enter') addComment();
        };
    }

    // ========== COMPARTIR PUBLICACIONES ==========
    sharePost(postElement, postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.shares++;
            this.savePosts();
            this.updatePostStats(postElement, post);
            this.showNotification('success', 'Publicación compartida');
        }
    }

  
    setupCreatePost() {
        const publishBtn = document.querySelector('.publish-btn');
        const textarea = document.querySelector('.create-post textarea');
        
        if (publishBtn && textarea) {
            publishBtn.addEventListener('click', () => {
                const content = textarea.value.trim();
                if (content) {
                    this.createPost(content);
                    textarea.value = '';
                    textarea.style.height = 'auto';
                } else {
                    this.showNotification('error', 'Escribe algo para publicar');
                }
            });

            // Auto-resize textarea
            textarea.addEventListener('input', this.autoResizeTextarea);
        }
    }

    autoResizeTextarea(e) {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    }

   
    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterPosts(e.target.value.toLowerCase());
            });
        }
    }

    filterPosts(searchTerm) {
        const posts = document.querySelectorAll('.post');
        
        posts.forEach(post => {
            const content = post.querySelector('.post-content').textContent.toLowerCase();
            const userName = post.querySelector('.user-name').textContent.toLowerCase();
            const tagsElement = post.querySelector('.post-tags');
            const tags = tagsElement ? tagsElement.textContent.toLowerCase() : '';
            
            const matches = content.includes(searchTerm) || 
                           userName.includes(searchTerm) || 
                           tags.includes(searchTerm);
            
            post.style.display = matches ? 'block' : 'none';
        });
    }


    setupFileUpload() {
        const attachOptions = document.querySelectorAll('.attach-option');
        
        attachOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const type = e.target.closest('.attach-option').textContent.trim();
                
                if (type === 'Foto') {
                    this.triggerImageUpload();
                } else if (type === 'Archivo') {
                    this.showNotification('info', 'Subida de archivos próximamente');
                }
            });
        });
    }

    triggerImageUpload() {
        this.showNotification('info', 'Selector de imágenes próximamente');
    }

   
    setupRealTimeFeed() {
        // Verificar nuevas publicaciones cada 30 segundos
        setInterval(() => {
            this.checkForNewPosts();
        }, 30000);
    }

    checkForNewPosts() {
        // En una implementación real, aquí harías una petición al servidor
        console.log('Verificando nuevas publicaciones...');
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

    formatPostContent(content) {
        // Convertir hashtags en enlaces (simulado)
        return content.replace(/#(\w+)/g, '<span class="post-tag">#$1</span>');
    }

    showNotification(type, message) {
       
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
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
}

class NotificationManager {
    constructor() {
        this.notifications = this.loadNotifications();
    }

    init() {
        this.updateNotificationBadge();
        this.setupNotificationListeners();
    }

    loadNotifications() {
        const saved = localStorage.getItem('notifications');
        return saved ? JSON.parse(saved) : [];
    }

    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        if (badge) {
            badge.textContent = unreadCount > 0 ? unreadCount : '';
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }

    setupNotificationListeners() {
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showNotificationsPanel();
            });
        }
    }

    showNotificationsPanel() {
        this.showNotification('info', 'Panel de notificaciones próximamente');
    }

    addNotification(type, message) {
        const notification = {
            id: Date.now(),
            type: type,
            message: message,
            timestamp: new Date(),
            read: false
        };
        
        this.notifications.unshift(notification);
        this.saveNotifications();
        this.updateNotificationBadge();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new FeedManager();
});