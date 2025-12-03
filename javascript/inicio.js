// inicio.js - VERSIÓN COMPLETA CON SISTEMA DE 3 USUARIOS
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');

// SISTEMA DE 3 USUARIOS PREDEFINIDOS
const predefinedUsers = [
    {
        username: "alexander",
        email: "alexander@tecnm.mx", 
        password: "123456",
        nombre: "Alexander Osorio",
        carrera: "Ingeniería de Software",
        avatar: "A"
       
    },
    {
        username: "maria", 
        email: "maria.garcia@tecnm.mx",
        password: "123456",
        nombre: "María García",
        carrera: "Sistemas Computacionales", 
        avatar: "M"
      
    },
    {
        username: "carlos",
        email: "carlos.lopez@tecnm.mx", 
        password: "123456",
        nombre: "Carlos López",
        carrera: "Informática",
        avatar: "C"
    }
];

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
    clearMessages();
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
    clearMessages();
});


loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    clearFieldStyles();
    clearMessages();
    
    let isValid = true;
    
    if (username === '') {
        showFieldError('loginUsername', 'Por favor ingresa tu usuario');
        isValid = false;
    } else {
        showFieldSuccess('loginUsername');
    }
    
    if (password === '') {
        showFieldError('loginPassword', 'Por favor ingresa tu contraseña');
        isValid = false;
    } else {
        showFieldSuccess('loginPassword');
    }
    
    if (!isValid) {
        showMessage(loginMessage, 'error', 'Por favor completa todos los campos');
        return;
    }
    
    
    const user = predefinedUsers.find(u => 
        (u.username === username || u.email === username) && u.password === password
    );
    
    const submitBtn = loginForm.querySelector('.btn');
    submitBtn.classList.add('loading');
    
    setTimeout(() => {
        submitBtn.classList.remove('loading');
        
        if (user) {
    // Login exitoso
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
    
    console.log('💾 Guardando en localStorage:', user);
    
    showMessage(loginMessage, 'success', `¡Bienvenido ${user.nombre}!`);
    
    // Forzar guardado y redirigir
    setTimeout(() => {
        console.log('🔄 Redirigiendo a main.html...');
        window.location.href = 'main.html';
    }, 1000);
        } else {
            showMessage(loginMessage, 'error', 'Usuario o contraseña incorrectos');
            showFieldError('loginUsername', '');
            showFieldError('loginPassword', '');
        }
    }, 1500);
});

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    clearFieldStyles();
    clearMessages();
    
    let isValid = true;
    
  
    const predefinedUser = predefinedUsers.find(u => 
        u.username === username && u.email === email
    );
    
    if (!predefinedUser) {
        showMessage(registerMessage, 'error', 'Usuario no autorizado. Solo usuarios pre-registrados pueden acceder.');
        showFieldError('regUsername', 'Usuario no encontrado');
        showFieldError('regEmail', 'Correo no autorizado');
        isValid = false;
    }
    
    if (username.length < 3) {
        showFieldError('regUsername', 'El usuario debe tener al menos 3 caracteres');
        isValid = false;
    } else if (isValid) {
        showFieldSuccess('regUsername');
    }
    
    if (!isValidEmail(email)) {
        showFieldError('regEmail', 'Por favor ingresa un correo válido');
        isValid = false;
    } else if (!isTecnmEmail(email)) {
        showFieldError('regEmail', 'Debe ser un correo institucional del TecNM');
        isValid = false;
    } else if (isValid) {
        showFieldSuccess('regEmail');
    }

    if (password !== confirmPassword) {
        showFieldError('regConfirmPassword', 'Las contraseñas no coinciden');
        isValid = false;
    } else if (confirmPassword !== '') {
        showFieldSuccess('regConfirmPassword');
    }
    
    if (!isValid) {
        return;
    }
    
    const submitBtn = registerForm.querySelector('.btn');
    submitBtn.classList.add('loading');
    
    setTimeout(() => {
        submitBtn.classList.remove('loading');
        
        // Guardar usuario en localStorage
        localStorage.setItem('currentUser', JSON.stringify(predefinedUser));
        localStorage.setItem('isLoggedIn', 'true');
        
        showMessage(registerMessage, 'success', `¡Registro exitoso! Bienvenido ${predefinedUser.nombre}`);
        
        setTimeout(() => {
            window.location.href = 'main.html';
        }, 2000);
    }, 1500);
});


document.getElementById('regEmail').addEventListener('blur', function() {
    const email = this.value.trim();
    if (email !== '' && !isValidEmail(email)) {
        showFieldError('regEmail', 'Por favor ingresa un correo válido');
    } else if (email !== '' && !isTecnmEmail(email)) {
        showFieldError('regEmail', 'Debe ser un correo institucional del TecNM');
    } else if (email !== '') {
        showFieldSuccess('regEmail');
    }
});


function showMessage(element, type, text) {
    element.textContent = text;
    element.className = 'message ' + type;
    if (type !== 'success') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add('invalid');
    field.classList.remove('valid');
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.cssText = 'color: #ef4444; font-size: 0.8rem; margin-top: 5px;';
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
}

function showFieldSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.add('valid');
    field.classList.remove('invalid');
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function clearFieldStyle(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.remove('invalid', 'valid');
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function clearFieldStyles() {
    const fields = document.querySelectorAll('input');
    fields.forEach(field => {
        field.classList.remove('invalid', 'valid');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    });
}

function clearMessages() {
    loginMessage.style.display = 'none';
    registerMessage.style.display = 'none';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isTecnmEmail(email) {
    const domain = email.split('@')[1];
    return domain === 'centla.tecnm.mx' || domain === 'tecnm.mx';
}

// VERIFICAR SI YA ESTÁ LOGEADO
function checkExistingLogin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'main.html';
    }
}

// Prevenir envío de formularios con Enter en campos individuales
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    });
});

// Al cargar la página, verificar si ya está loggeado
document.addEventListener('DOMContentLoaded', checkExistingLogin);