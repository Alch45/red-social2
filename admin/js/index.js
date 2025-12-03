document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminMessage = document.getElementById('adminMessage');
    
    const enhancedSecurityCheckbox = document.getElementById('enhancedSecurity');
    const enhancedAuthFields = document.querySelector('.enhanced-auth-fields');
    const accessKeyInput = document.getElementById('accessKey');
    
    
    const adminCredentials = [
        {
            email: 'admin@itsce.edu.mx',
            password: 'Admin123!',
            accessKey: 'CTEC-2024-ADMIN-KEY',
            name: 'Administrador Principal',
            role: 'superadmin'
        },
        {
            email: 'moderador@itsce.edu.mx',
            password: 'Mod123!',
            accessKey: 'CTEC-2024-MOD-KEY',
            name: 'Moderador',
            role: 'moderator'
        },
        {
            email: 'soporte@itsce.edu.mx',
            password: 'Soporte123!',
            accessKey: 'CTEC-2024-SUPPORT-KEY',
            name: 'Soporte Técnico',
            role: 'support'
        }
    ];

    // Toggle para mostrar/ocultar campo de llave de acceso
    enhancedSecurityCheckbox.addEventListener('change', function() {
        if (this.checked) {
            enhancedAuthFields.style.display = 'block';
            accessKeyInput.setAttribute('required', 'required');
        } else {
            enhancedAuthFields.style.display = 'none';
            accessKeyInput.removeAttribute('required');
            accessKeyInput.value = '';
        }
    });

    // Validación del formulario
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const useEnhancedSecurity = enhancedSecurityCheckbox.checked;
        const accessKey = useEnhancedSecurity ? accessKeyInput.value : null;
        
        // Mostrar estado de carga
        const submitBtn = adminLoginForm.querySelector('.admin-btn');
        submitBtn.classList.add('loading');
        
        // Simular verificación (en producción sería una llamada al servidor)
        setTimeout(() => {
            const validationResult = validateAdminCredentials(email, password, accessKey, useEnhancedSecurity);
            
            if (validationResult.success) {
                handleSuccessfulLogin(validationResult.admin);
            } else {
                handleFailedLogin(validationResult.message, submitBtn);
            }
        }, 1500);
    });
    
    // Función para validar credenciales
    function validateAdminCredentials(email, password, accessKey, useEnhancedSecurity) {
        // Buscar administrador por email
        const admin = adminCredentials.find(admin => admin.email === email);
        
        if (!admin) {
            return {
                success: false,
                message: 'No existe una cuenta de administrador con este correo'
            };
        }
        
        // Verificar contraseña
        if (admin.password !== password) {
            return {
                success: false,
                message: 'Contraseña incorrecta'
            };
        }
        
        // Verificar llave de acceso si está habilitada
        if (useEnhancedSecurity) {
            if (!accessKey) {
                return {
                    success: false,
                    message: 'La llave de acceso es requerida para autenticación reforzada'
                };
            }
            
            if (admin.accessKey !== accessKey) {
                return {
                    success: false,
                    message: 'Llave de acceso incorrecta'
                };
            }
            
            // Registrar intento de acceso con llave
            logSecurityAccess(admin.email, 'enhanced');
        } else {
            // Registrar intento de acceso estándar
            logSecurityAccess(admin.email, 'standard');
        }
        
        return {
            success: true,
            admin: admin
        };
    }
    
    // Función para manejar login exitoso
    function handleSuccessfulLogin(admin) {
        showMessage('✓ Acceso concedido. Redirigiendo al panel...', 'success');
        
        // Guardar sesión de admin
        localStorage.setItem('adminSession', JSON.stringify({
            loggedIn: true,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            enhancedSecurity: enhancedSecurityCheckbox.checked,
            timestamp: new Date().getTime(),
            sessionId: generateSessionId()
        }));
        
        // Guardar estadísticas de acceso
        saveAccessStatistics(admin.email);
        
        // Redirigir al panel de administración
        setTimeout(() => {
            window.location.href = '/admin/dashboard.html';
        }, 1500);
    }
    
    // Función para manejar login fallido
    function handleFailedLogin(message, submitBtn) {
        showMessage('✗ ' + message, 'error');
        submitBtn.classList.remove('loading');
        
        // Registrar intento fallido
        logFailedAttempt(document.getElementById('adminEmail').value);
    }
    
    // Función para mostrar mensajes
    function showMessage(text, type) {
        adminMessage.textContent = text;
        adminMessage.className = `message ${type}`;
        
        setTimeout(() => {
            adminMessage.textContent = '';
            adminMessage.className = 'message';
        }, 5000);
    }
    
    // Función para generar ID de sesión
    function generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    
    // Función para registrar acceso de seguridad
    function logSecurityAccess(email, authType) {
        const securityLogs = JSON.parse(localStorage.getItem('adminSecurityLogs') || '[]');
        
        securityLogs.push({
            email: email,
            authType: authType,
            timestamp: new Date().toISOString(),
            ip: '127.0.0.1', // En producción esto vendría del servidor
            userAgent: navigator.userAgent
        });
        
        // Mantener solo los últimos 100 registros
        if (securityLogs.length > 100) {
            securityLogs.splice(0, securityLogs.length - 100);
        }
        
        localStorage.setItem('adminSecurityLogs', JSON.stringify(securityLogs));
    }
    
    // Función para registrar intentos fallidos
    function logFailedAttempt(email) {
        const failedAttempts = JSON.parse(localStorage.getItem('adminFailedAttempts') || '[]');
        
        failedAttempts.push({
            email: email,
            timestamp: new Date().toISOString(),
            ip: '127.0.0.1'
        });
        
        // Limpiar intentos antiguos (más de 1 hora)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const recentAttempts = failedAttempts.filter(attempt => 
            attempt.timestamp > oneHourAgo
        );
        
        localStorage.setItem('adminFailedAttempts', JSON.stringify(recentAttempts));
        
        // Bloquear después de 3 intentos fallidos en 1 hora
        if (recentAttempts.filter(attempt => attempt.email === email).length >= 3) {
            blockAccountTemporarily(email);
        }
    }
    
    // Función para bloquear cuenta temporalmente
    function blockAccountTemporarily(email) {
        const blockedAccounts = JSON.parse(localStorage.getItem('adminBlockedAccounts') || '{}');
        
        blockedAccounts[email] = {
            blockedUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
            reason: 'Múltiples intentos fallidos'
        };
        
        localStorage.setItem('adminBlockedAccounts', JSON.stringify(blockedAccounts));
        
        showMessage('⚠️ Cuenta temporalmente bloqueada por seguridad. Intente nuevamente en 15 minutos.', 'error');
    }
    
    // Función para verificar si la cuenta está bloqueada
    function isAccountBlocked(email) {
        const blockedAccounts = JSON.parse(localStorage.getItem('adminBlockedAccounts') || '{}');
        const blockInfo = blockedAccounts[email];
        
        if (blockInfo && new Date(blockInfo.blockedUntil) > new Date()) {
            return {
                blocked: true,
                until: blockInfo.blockedUntil
            };
        }
        
        // Eliminar bloqueo si ya expiró
        if (blockInfo && new Date(blockInfo.blockedUntil) <= new Date()) {
            delete blockedAccounts[email];
            localStorage.setItem('adminBlockedAccounts', JSON.stringify(blockedAccounts));
        }
        
        return { blocked: false };
    }
    
    // Función para guardar estadísticas de acceso
    function saveAccessStatistics(email) {
        const accessStats = JSON.parse(localStorage.getItem('adminAccessStats') || '{}');
        
        if (!accessStats[email]) {
            accessStats[email] = {
                totalLogins: 0,
                lastLogin: null,
                firstLogin: new Date().toISOString()
            };
        }
        
        accessStats[email].totalLogins++;
        accessStats[email].lastLogin = new Date().toISOString();
        
        localStorage.setItem('adminAccessStats', JSON.stringify(accessStats));
    }
    
    // Verificar si ya hay una sesión activa
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
        const session = JSON.parse(adminSession);
        // Verificar si la sesión es reciente (menos de 2 horas)
        const twoHours = 2 * 60 * 60 * 1000;
        if (session.loggedIn && (new Date().getTime() - session.timestamp) < twoHours) {
            window.location.href = 'admin/dashboard.html';
        } else {
            // Sesión expirada
            localStorage.removeItem('adminSession');
            showMessage('Sesión expirada. Por favor, inicie sesión nuevamente.', 'info');
        }
    }
    
    // Validación en tiempo real del email institucional
    const adminEmail = document.getElementById('adminEmail');
    adminEmail.addEventListener('blur', function() {
        if (this.value && !this.value.endsWith('@itsce.edu.mx')) {
            showMessage('Por favor, use su correo institucional @itsce.edu.mx', 'error');
        } else {
            // Verificar si la cuenta está bloqueada
            const blockStatus = isAccountBlocked(this.value);
            if (blockStatus.blocked) {
                const untilTime = new Date(blockStatus.until).toLocaleTimeString();
                showMessage(`Cuenta bloqueada hasta las ${untilTime} por seguridad`, 'error');
            }
        }
    });
    
    // Validación en tiempo real de la llave de acceso
    accessKeyInput.addEventListener('input', function() {
        if (this.value.length > 0) {
            // Validar formato básico de llave
            const keyPattern = /^[A-Z0-9-]{8,}$/;
            if (!keyPattern.test(this.value)) {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = '#10b981';
            }
        } else {
            this.style.borderColor = '#e9ecef';
        }
    });
    
    // Función para recuperar llave de acceso (simulada)
    document.getElementById('recoverKey')?.addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('📧 Se ha enviado un enlace de recuperación a su correo institucional', 'info');
    });
    
    // Limpiar formulario al recargar la página
    window.addEventListener('beforeunload', function() {
        enhancedSecurityCheckbox.checked = false;
        enhancedAuthFields.style.display = 'none';
        accessKeyInput.removeAttribute('required');
    });
});