// Authentication Module
let currentUser = null;
let userRole = null;

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    const user = db.verifyUser(username, password);
    
    if (user) {
        currentUser = user;
        userRole = user.role;
        
        showToast(`Bienvenue ${username}!`, 'success');
        showMainInterface();
    } else {
        showToast('Nom d\'utilisateur ou mot de passe incorrect', 'error');
    }
}

function register() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    
    if (!username || !email || !password || !confirmPassword) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    if (db.userExists(username)) {
        showToast('Ce nom d\'utilisateur existe déjà', 'error');
        return;
    }
    
    const userId = db.createUser(username, password, email, 'user');
    
    if (userId) {
        showToast('Compte créé avec succès! Connectez-vous maintenant.', 'success');
        showLogin();
    } else {
        showToast('Erreur lors de la création du compte', 'error');
    }
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        currentUser = null;
        userRole = null;
        showLogin();
    }
}

function showLogin() {
    document.getElementById('login-page').classList.add('active');
    document.getElementById('register-page').classList.remove('active');
    document.getElementById('navbar').classList.add('hidden');
}

function showRegister() {
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('register-page').classList.add('active');
}

function showMainInterface() {
    // Hide login/register pages
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('register-page').classList.remove('active');
    
    // Show navbar
    document.getElementById('navbar').classList.remove('hidden');
    
    // Update user info
    document.getElementById('current-user').textContent = currentUser.username;
    document.getElementById('user-role').textContent = userRole.toUpperCase();
    
    // Show/hide admin menu
    const adminMenu = document.getElementById('admin-menu');
    if (userRole === 'admin') {
        adminMenu.classList.remove('hidden');
        showPage('dashboard');
    } else {
        adminMenu.classList.add('hidden');
        showPage('catalog');
    }
    
    // Show first page
    showPage(userRole === 'admin' ? 'dashboard' : 'catalog');
    
    // Load data
    loadData();
}

function showPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Show selected page
    document.getElementById(pageName).classList.add('active');
    
    // Mark active nav link
    const activeLink = document.querySelector(`a[onclick*="${pageName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Load page-specific data
    switch(pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'catalog':
            loadCatalog();
            break;
        case 'my-rentals':
            loadMyRentals();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'admin-cars':
            loadAdminCars();
            break;
        case 'admin-clients':
            loadAdminClients();
            break;
        case 'admin-rentals':
            loadAdminRentals();
            break;
        case 'admin-stats':
            loadAdminStats();
            break;
    }
}

function loadData() {
    // This function is called after login to load initial data
    if (userRole === 'admin') {
        loadDashboard();
    } else {
        loadCatalog();
        loadMyRentals();
    }
}