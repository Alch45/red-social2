
class AuthManager {
    constructor() {
        if (window.authManagerInstance) {
            console.log('⚠️ AuthManager ya existe, retornando instancia existente');
            return window.authManagerInstance;
        }
        
        this.currentUser = null;
        this.hasUpdatedUI = false;
        window.authManagerInstance = this;
        this.init();
    }

    init() {
        console.log('🔄 AuthManager iniciando...');
        this.loadCurrentUser();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.safeUpdateUI();
            });
        } else {
            setTimeout(() => this.safeUpdateUI(), 100);
        }
    }

    loadCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData && userData !== 'undefined' && userData !== 'null') {
                this.currentUser = JSON.parse(userData);
                console.log('✅ Usuario cargado:', this.currentUser.nombre);
            } else {
                this.currentUser = null;
            }
        } catch (error) {
            console.error('Error:', error);
            this.currentUser = null;
        }
    }

    safeUpdateUI() {
        if (this.hasUpdatedUI) {
            console.log('⏸️ UI ya fue actualizada, omitiendo...');
            return;
        }
        
        this.hasUpdatedUI = true;
        this.updateUI();
        this.setupLogout();
    }

    updateUI() {
        if (!this.currentUser) {
            console.log('⚠️ No hay usuario para mostrar');
            return;
        }

        console.log('🎨 Actualizando UI para:', this.currentUser.nombre);
        
        
        const safeUpdate = (selector, text) => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = text;
                console.log(`✅ ${selector}: "${text}"`);
            }
        };

        
        
        safeUpdate('.user-name-profile', this.currentUser.nombre);
        safeUpdate('.user-career-profile', this.currentUser.carrera);
        
        
        const headerAvatar = document.querySelector('.profile-avatar');
        if (headerAvatar) {
            headerAvatar.textContent = this.currentUser.avatar;
            headerAvatar.style.background = this.getAvatarColor(this.currentUser.avatar);
        }
        
        safeUpdate('.profile-name', this.currentUser.nombre);
        safeUpdate('.profile-email', this.currentUser.email);
         
        safeUpdate('.create-post-header .user-name', this.currentUser.nombre);
        safeUpdate('.create-post-header .user-career', this.currentUser.carrera);
        
        const postAvatar = document.querySelector('.create-post-avatar');
        if (postAvatar) {
            postAvatar.textContent = this.currentUser.avatar;
            postAvatar.style.background = this.getAvatarColor(this.currentUser.avatar);
        }
        
        console.log('🎉 UI actualizada UNA SOLA VEZ');
    }

    getAvatarColor(initial) {
        const colors = {
            'A': 'linear-gradient(135deg, #006699 0%, #004d73 100%)',
            'M': 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            'C': 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        };
        return colors[initial] || 'linear-gradient(135deg, #006699 0%, #004d73 100%)';
    }

    setupLogout() {
        const logoutButtons = document.querySelectorAll('.menu-item.logout');
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    }

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }
}


if (!window.authManager) {
    console.log('🚀 Creando instancia única de AuthManager...');
    window.authManager = new AuthManager();
} else {
    console.log('⚠️ AuthManager ya existe, usando instancia global');
}