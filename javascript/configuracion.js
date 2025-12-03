
class ConfigManager {
    constructor() {
        this.currentUser = null;
        this.userSettings = this.loadUserSettings();
        this.unsavedChanges = false;
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupNavigation();
        this.setupEventListeners();
        this.loadSettings();
        this.setupSearch();
        console.log('⚙️ ConfigManager inicializado');
    }

    loadUserData() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData && userData !== 'undefined' && userData !== 'null') {
                this.currentUser = JSON.parse(userData);
                this.updateUserInterface();
            }
        } catch (error) {
            console.error('Error cargando datos del usuario:', error);
        }
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        // Actualizar información del usuario en la sidebar
        const updateElement = (id, text) => {
            const element = document.getElementById(id);
            if (element) element.textContent = text;
        };

        updateElement('configUserName', this.currentUser.nombre);
        updateElement('configUserCareer', this.currentUser.carrera);
        updateElement('configUserEmail', this.currentUser.email || this.currentUser.correo);

        const avatars = [
            'configHeaderAvatar',
            'configUserAvatar', 
            'profileBigAvatar'
        ];

        avatars.forEach(avatarId => {
            const avatar = document.getElementById(avatarId);
            if (avatar) {
                avatar.textContent = this.currentUser.avatar;
                avatar.style.background = this.getAvatarColor(this.currentUser.avatar);
            }
        });

        
        this.fillProfileForm();
    }

    getAvatarColor(initial) {
        const colors = {
            'A': 'linear-gradient(135deg, #006699 0%, #004d73 100%)',
            'M': 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            'C': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            'J': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        };
        return colors[initial] || 'linear-gradient(135deg, #006699 0%, #004d73 100%)';
    }

    fillProfileForm() {
        if (!this.currentUser) return;

        const nombreInput = document.getElementById('nombre');
        const carreraSelect = document.getElementById('carrera');
        const emailInput = document.getElementById('email');
        const bioInput = document.getElementById('bio');

        if (nombreInput) nombreInput.value = this.currentUser.nombre;
        if (carreraSelect) {
            carreraSelect.value = this.currentUser.carrera;
            // Si la carrera no está en las opciones, agregarla
            if (!carreraSelect.querySelector(`option[value="${this.currentUser.carrera}"]`)) {
                const newOption = document.createElement('option');
                newOption.value = this.currentUser.carrera;
                newOption.textContent = this.currentUser.carrera;
                carreraSelect.appendChild(newOption);
                carreraSelect.value = this.currentUser.carrera;
            }
        }
        if (emailInput) emailInput.value = this.currentUser.email || this.currentUser.correo;
        if (bioInput) bioInput.value = this.userSettings.bio || '';

    
        this.updateBioCharCount();
    }

    setupNavigation() {
        const menuItems = document.querySelectorAll('.menu-config-item');
        const sections = document.querySelectorAll('.config-section');

        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (item.classList.contains('logout-btn')) {
                    e.preventDefault();
                    this.logout();
                    return;
                }

                e.preventDefault();
                
                
                menuItems.forEach(i => i.classList.remove('active'));
               
                item.classList.add('active');
                
               
                sections.forEach(section => section.classList.remove('active'));
                
               
                const targetSection = item.getAttribute('data-section');
                document.getElementById(targetSection).classList.add('active');
            });
        });
    }

    setupEventListeners() {
        // Formulario de perfil
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.saveProfile(e));
            // Detectar cambios en el formulario
            profileForm.addEventListener('input', () => {
                this.unsavedChanges = true;
            });
        }

        
        const cancelProfileBtn = document.getElementById('cancelProfileBtn');
        if (cancelProfileBtn) {
            cancelProfileBtn.addEventListener('click', () => this.cancelProfileChanges());
        }

        
        const bioInput = document.getElementById('bio');
        if (bioInput) {
            bioInput.addEventListener('input', () => this.updateBioCharCount());
        }

        
        this.setupTagsSystem();

        
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.openChangePasswordModal());
        }

        
        const savePasswordBtn = document.getElementById('savePasswordBtn');
        if (savePasswordBtn) {
            savePasswordBtn.addEventListener('click', () => this.changePassword());
        }

       
        this.setupThemeSelector();

        
        this.setupDangerZone();

        
        this.setupSettingsListeners();

        
        window.addEventListener('beforeunload', (e) => {
            if (this.unsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    setupSettingsListeners() {
        
        const privacySettings = ['profilePublic', 'showEmail', 'postVisibility', 'messagePrivacy'];
        privacySettings.forEach(setting => {
            const element = document.getElementById(setting);
            if (element) {
                element.addEventListener('change', () => {
                    this.userSettings.privacy[setting] = element.type === 'checkbox' ? element.checked : element.value;
                    this.saveUserSettings();
                    this.showNotification('Configuración de privacidad guardada', 'success');
                });
            }
        });

       
        const notificationSettings = ['emailMessages', 'emailPostActivity', 'emailNews', 'pushEvents', 'pushFriendRequests'];
        notificationSettings.forEach(setting => {
            const element = document.getElementById(setting);
            if (element) {
                element.addEventListener('change', () => {
                    this.userSettings.notifications[setting] = element.checked;
                    this.saveUserSettings();
                    this.showNotification('Configuración de notificaciones guardada', 'success');
                });
            }
        });
    }

    setupTagsSystem() {
        const tagInput = document.getElementById('tagInput');
        const tagsContainer = document.getElementById('tagsContainer');

        if (tagInput && tagsContainer) {
            // Cargar tags existentes
            this.loadExistingTags();

            tagInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && tagInput.value.trim() !== '') {
                    e.preventDefault();
                    this.addTag(tagInput.value.trim());
                    tagInput.value = '';
                    this.unsavedChanges = true;
                }
            });

            tagInput.addEventListener('blur', () => {
                if (tagInput.value.trim() !== '') {
                    this.addTag(tagInput.value.trim());
                    tagInput.value = '';
                    this.unsavedChanges = true;
                }
            });
        }
    }

    loadExistingTags() {
        const tags = this.userSettings.interests || ['Programación', 'IA', 'Desarrollo Web'];
        tags.forEach(tag => this.addTag(tag, false));
    }

    addTag(text, save = true) {
        const tagsContainer = document.getElementById('tagsContainer');
        if (!tagsContainer) return;

        // Verificar si el tag ya existe
        const existingTags = Array.from(tagsContainer.querySelectorAll('.tag'))
            .map(tag => tag.textContent.replace(' ×', '').trim());
        
        if (existingTags.includes(text)) {
            this.showNotification('Este interés ya está agregado', 'warning');
            return;
        }

        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = text;
        
        const removeBtn = document.createElement('span');
        removeBtn.innerHTML = ' ×';
        removeBtn.style.cursor = 'pointer';
        removeBtn.onclick = () => {
            tag.remove();
            this.unsavedChanges = true;
        };
        
        tag.appendChild(removeBtn);
        tagsContainer.insertBefore(tag, document.getElementById('tagInput'));

        if (save) {
            this.unsavedChanges = true;
        }
    }

    getCurrentTags() {
        const tagsContainer = document.getElementById('tagsContainer');
        if (!tagsContainer) return [];
        
        return Array.from(tagsContainer.querySelectorAll('.tag'))
            .map(tag => tag.textContent.replace(' ×', '').trim())
            .filter(tag => tag !== '');
    }

    updateBioCharCount() {
        const bioInput = document.getElementById('bio');
        const bioChars = document.getElementById('bioChars');
        
        if (bioInput && bioChars) {
            const length = bioInput.value.length;
            bioChars.textContent = length;
            
            if (length > 450) {
                bioChars.style.color = '#dc3545';
            } else if (length > 400) {
                bioChars.style.color = '#ffc107';
            } else {
                bioChars.style.color = '#6c757d';
            }
        }
    }

    setupThemeSelector() {
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                themeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                const theme = option.getAttribute('data-theme');
                this.applyTheme(theme);
                this.unsavedChanges = true;
            });
        });

    
        const fontSizeBtns = document.querySelectorAll('.font-size-btn');
        fontSizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                fontSizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const size = btn.getAttribute('data-size');
                this.applyFontSize(size);
                this.unsavedChanges = true;
            });
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.userSettings.theme = theme;
        this.saveUserSettings();
        this.showNotification(`Tema ${theme} aplicado`, 'success');
    }

    applyFontSize(size) {
        document.documentElement.setAttribute('data-font-size', size);
        this.userSettings.fontSize = size;
        this.saveUserSettings();
        this.showNotification(`Tamaño de fuente ${size} aplicado`, 'success');
    }

    setupDangerZone() {
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => {
                if (confirm('¿ESTÁS SEGURO? Esta acción eliminará permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer.')) {
                    if (confirm('¿REALMENTE estás seguro? Esta es tu última oportunidad para cancelar.')) {
                        this.deleteAccount();
                    }
                }
            });
        }

        const downloadDataBtn = document.getElementById('downloadDataBtn');
        if (downloadDataBtn) {
            downloadDataBtn.addEventListener('click', () => {
                this.downloadUserData();
            });
        }
    }

    async saveProfile(e) {
        e.preventDefault();
        
        const saveBtn = document.getElementById('saveProfileBtn');
        const loadingSpinner = saveBtn.querySelector('.btn-loading');
        
        // Mostrar loading
        saveBtn.disabled = true;
        loadingSpinner.classList.remove('d-none');

        try {
            // Simular guardado en servidor
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Recopilar datos del formulario
            const profileData = {
                nombre: document.getElementById('nombre').value,
                carrera: document.getElementById('carrera').value,
                email: document.getElementById('email').value,
                bio: document.getElementById('bio').value,
                interests: this.getCurrentTags()
            };

            // Validaciones
            if (!profileData.nombre.trim()) {
                throw new Error('El nombre es requerido');
            }

            if (!profileData.carrera) {
                throw new Error('La carrera es requerida');
            }

            // Actualizar datos del usuario
            if (this.currentUser) {
                this.currentUser.nombre = profileData.nombre;
                this.currentUser.carrera = profileData.carrera;
                this.currentUser.email = profileData.email;
                
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }

            // Guardar configuración adicional
            this.userSettings.bio = profileData.bio;
            this.userSettings.interests = profileData.interests;
            this.saveUserSettings();

            this.unsavedChanges = false;
            this.showNotification('Perfil actualizado correctamente', 'success');
            
            // Actualizar UI
            this.updateUserInterface();

        } catch (error) {
            this.showNotification(error.message || 'Error al guardar los cambios', 'error');
        } finally {
            saveBtn.disabled = false;
            loadingSpinner.classList.add('d-none');
        }
    }

    cancelProfileChanges() {
        if (this.unsavedChanges && !confirm('Tienes cambios sin guardar. ¿Seguro que quieres cancelar?')) {
            return;
        }
        this.fillProfileForm();
        this.unsavedChanges = false;
        this.showNotification('Cambios cancelados', 'info');
    }

    openChangePasswordModal() {
        const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
        // Limpiar formulario
        document.getElementById('passwordForm').reset();
        modal.show();
    }

    async changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validaciones
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showNotification('Todos los campos son requeridos', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showNotification('La nueva contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        try {
            // Simular cambio de contraseña
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Cerrar modal
            bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
            this.showNotification('Contraseña cambiada exitosamente', 'success');
            
        } catch (error) {
            this.showNotification('Error al cambiar la contraseña', 'error');
        }
    }

    logout() {
        if (this.unsavedChanges && !confirm('Tienes cambios sin guardar. ¿Seguro que quieres cerrar sesión?')) {
            return;
        }
        
        if (window.authManager) {
            window.authManager.logout();
        } else {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'index.html';
        }
    }

    loadUserSettings() {
        const saved = localStorage.getItem('userSettings');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            theme: 'dark',
            fontSize: 'medium',
            bio: '',
            interests: [],
            privacy: {
                profilePublic: true,
                showEmail: false,
                postVisibility: 'public',
                messagePrivacy: 'everyone'
            },
            notifications: {
                emailMessages: true,
                emailPostActivity: true,
                emailNews: false,
                pushEvents: false,
                pushFriendRequests: true
            }
        };
    }

    saveUserSettings() {
        localStorage.setItem('userSettings', JSON.stringify(this.userSettings));
    }

    loadSettings() {
        // Cargar configuración de privacidad
        Object.keys(this.userSettings.privacy).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.userSettings.privacy[key];
                } else {
                    element.value = this.userSettings.privacy[key];
                }
            }
        });

        // Cargar configuración de notificaciones
        Object.keys(this.userSettings.notifications).forEach(key => {
            const element = document.getElementById(key);
            if (element && element.type === 'checkbox') {
                element.checked = this.userSettings.notifications[key];
            }
        });

        // Aplicar tema y tamaño de fuente guardados
        this.applyTheme(this.userSettings.theme);
        this.applyFontSize(this.userSettings.fontSize);

        // Activar opciones de tema y tamaño de fuente correctas
        this.activateSavedOptions();
    }

    activateSavedOptions() {
        // Activar tema guardado
        const themeOption = document.querySelector(`.theme-option[data-theme="${this.userSettings.theme}"]`);
        if (themeOption) {
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            themeOption.classList.add('active');
        }

        // Activar tamaño de fuente guardado
        const fontSizeBtn = document.querySelector(`.font-size-btn[data-size="${this.userSettings.fontSize}"]`);
        if (fontSizeBtn) {
            document.querySelectorAll('.font-size-btn').forEach(btn => btn.classList.remove('active'));
            fontSizeBtn.classList.add('active');
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('configSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterSections(e.target.value.toLowerCase());
            });
        }
    }

    filterSections(searchTerm) {
        const menuItems = document.querySelectorAll('.menu-config-item');
        const sections = document.querySelectorAll('.config-section');

        if (searchTerm === '') {
            // Mostrar todo si no hay término de búsqueda
            menuItems.forEach(item => item.style.display = 'flex');
            return;
        }

        menuItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    downloadUserData() {
        const userData = {
            usuario: this.currentUser,
            configuracion: this.userSettings,
            fechaDescarga: new Date().toISOString()
        };

        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `comunitec-datos-${this.currentUser.username || 'usuario'}.json`;
        link.click();
        
        this.showNotification('Datos descargados exitosamente', 'success');
    }

    deleteAccount() {
        // Simular eliminación de cuenta
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userSettings');
        
        this.showNotification('Cuenta eliminada exitosamente', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }

    showNotification(message, type = 'info') {
        // Eliminar notificaciones existentes
        document.querySelectorAll('.config-notification').forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `config-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="bi bi-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
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

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || '#3b82f6';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.configManager = new ConfigManager();
});