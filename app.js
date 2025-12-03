// Main Application Logic

// Global variables
let selectedCarId = null;
let selectedRentalId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        userRole = currentUser.role;
        showMainInterface();
    }
    
    // Add event listener to password field
    document.getElementById('login-password')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') login();
    });
});

// Dashboard functions
function loadDashboard() {
    if (userRole !== 'admin') return;
    
    const stats = db.getSystemStats();
    
    // Update stats cards
    document.getElementById('total-cars').textContent = stats.total_cars;
    document.getElementById('available-cars').textContent = stats.available_cars;
    document.getElementById('total-clients').textContent = stats.total_clients;
    document.getElementById('total-revenue').textContent = `${stats.total_revenue.toFixed(2)} TND`;
    
    // Load user stats if not admin
    const userStatsDiv = document.getElementById('user-stats');
    if (userRole === 'user' && userStatsDiv) {
        const client = db.getClientByUserId(currentUser.id);
        const userRentals = db.getUserRentals(currentUser.id);
        
        userStatsDiv.innerHTML = `
            <div class="stat-card">
                <i class="fas fa-user-circle"></i>
                <h3>${client ? client.prenom + ' ' + client.nom : 'Profil Incomplet'}</h3>
                <p>Votre profil</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-car"></i>
                <h3>${userRentals.length}</h3>
                <p>Locations totales</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-clock"></i>
                <h3>${userRentals.filter(r => r.statut === 'En cours').length}</h3>
                <p>Locations en cours</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-money-bill-wave"></i>
                <h3>${userRentals.reduce((sum, r) => sum + r.prix_total, 0).toFixed(2)} TND</h3>
                <p>Total dépensé</p>
            </div>
        `;
    }
    
    // Load featured cars
    const availableCars = db.getAvailableCars().slice(0, 3);
    const featuredDiv = document.getElementById('featured-cars');
    if (featuredDiv) {
        featuredDiv.innerHTML = availableCars.map(car => `
            <div class="car-card">
                <div class="car-image">
                    <img src="images/${car.image_path || 'default_car.jpg'}" alt="${car.marque} ${car.modele}">
                </div>
                <div class="car-content">
                    <h3 class="car-title">${car.marque} ${car.modele}</h3>
                    <div class="car-details">
                        <p><i class="fas fa-calendar-alt"></i> Année: ${car.annee}</p>
                        <p><i class="fas fa-tachometer-alt"></i> Performance</p>
                    </div>
                    <div class="car-price">${car.prix_location.toFixed(2)} TND/jour</div>
                    <p class="car-description">${car.description}</p>
                    ${userRole === 'user' ? `
                        <button class="btn btn-primary" onclick="openRentalModal(${car.id})">
                            <i class="fas fa-calendar-plus"></i> Louer maintenant
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }
}

// Catalog functions
function loadCatalog() {
    const cars = db.getAvailableCars();
    const catalogDiv = document.getElementById('catalog-cars');
    
    if (catalogDiv) {
        catalogDiv.innerHTML = cars.map(car => `
            <div class="car-card">
                <div class="car-image">
                    <img src="images/${car.image_path || 'default_car.jpg'}" alt="${car.marque} ${car.modele}">
                </div>
                <div class="car-content">
                    <h3 class="car-title">${car.marque} ${car.modele}</h3>
                    <div class="car-details">
                        <p><i class="fas fa-calendar-alt"></i> Année: ${car.annee}</p>
                        <p><i class="fas fa-tachometer-alt"></i> Performance exceptionnelle</p>
                    </div>
                    <div class="car-price">${car.prix_location.toFixed(2)} TND/jour</div>
                    <p class="car-description">${car.description}</p>
                    <button class="btn btn-primary" onclick="openRentalModal(${car.id})">
                        <i class="fas fa-calendar-plus"></i> Louer cette supercar
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Load brands for filter
    const brands = [...new Set(cars.map(car => car.marque))];
    const brandSelect = document.getElementById('brand-filter');
    if (brandSelect) {
        brandSelect.innerHTML = '<option value="">Toutes les marques</option>' + 
            brands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
    }
}

function filterCatalog() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const selectedBrand = document.getElementById('brand-filter').value;
    const cars = db.getAvailableCars();
    
    const filteredCars = cars.filter(car => {
        const matchesSearch = searchTerm === '' || 
            car.marque.toLowerCase().includes(searchTerm) ||
            car.modele.toLowerCase().includes(searchTerm) ||
            car.description.toLowerCase().includes(searchTerm);
        
        const matchesBrand = selectedBrand === '' || car.marque === selectedBrand;
        
        return matchesSearch && matchesBrand;
    });
    
    const catalogDiv = document.getElementById('catalog-cars');
    if (catalogDiv) {
        catalogDiv.innerHTML = filteredCars.map(car => `
            <div class="car-card">
                <div class="car-image">
                    <img src="images/${car.image_path || 'default_car.jpg'}" alt="${car.marque} ${car.modele}">
                </div>
                <div class="car-content">
                    <h3 class="car-title">${car.marque} ${car.modele}</h3>
                    <div class="car-details">
                        <p><i class="fas fa-calendar-alt"></i> Année: ${car.annee}</p>
                        <p><i class="fas fa-tachometer-alt"></i> Performance exceptionnelle</p>
                    </div>
                    <div class="car-price">${car.prix_location.toFixed(2)} TND/jour</div>
                    <p class="car-description">${car.description}</p>
                    <button class="btn btn-primary" onclick="openRentalModal(${car.id})">
                        <i class="fas fa-calendar-plus"></i> Louer cette supercar
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('brand-filter').value = '';
    loadCatalog();
}

// Rental functions
function openRentalModal(carId) {
    if (!currentUser) {
        showToast('Veuillez vous connecter pour louer une supercar', 'error');
        return;
    }
    
    const client = db.getClientByUserId(currentUser.id);
    if (!client) {
        showToast('Veuillez d\'abord compléter votre profil client', 'error');
        loadProfile();
        return;
    }
    
    const car = db.getCarById(carId);
    if (!car) return;
    
    selectedCarId = carId;
    
    document.getElementById('rental-title').innerHTML = `
        <i class="fas fa-car"></i> Location: ${car.marque} ${car.modele}
    `;
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('rental-start-date').min = today;
    document.getElementById('rental-end-date').min = today;
    document.getElementById('rental-start-date').value = today;
    
    document.getElementById('rental-modal').classList.add('active');
}

function closeRentalModal() {
    document.getElementById('rental-modal').classList.remove('active');
    selectedCarId = null;
    document.getElementById('rental-total-price').textContent = '0.00 TND';
}

function calculateRentalPrice() {
    const startDate = document.getElementById('rental-start-date').value;
    const endDate = document.getElementById('rental-end-date').value;
    
    if (!startDate || !endDate) {
        showToast('Veuillez sélectionner les dates', 'error');
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
        showToast('La date de fin doit être après la date de début', 'error');
        return;
    }
    
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const car = db.getCarById(selectedCarId);
    
    if (car) {
        const totalPrice = car.prix_location * days;
        document.getElementById('rental-total-price').textContent = 
            `${totalPrice.toFixed(2)} TND`;
    }
}

function confirmRental() {
    const startDate = document.getElementById('rental-start-date').value;
    const endDate = document.getElementById('rental-end-date').value;
    const totalPriceText = document.getElementById('rental-total-price').textContent;
    
    if (totalPriceText === '0.00 TND') {
        showToast('Veuillez d\'abord calculer le prix', 'error');
        return;
    }
    
    const client = db.getClientByUserId(currentUser.id);
    if (!client) return;
    
    const totalPrice = parseFloat(totalPriceText.replace(' TND', ''));
    
    try {
        db.createRental(selectedCarId, client.id, startDate, endDate, totalPrice);
        
        showToast('Location créée avec succès!', 'success');
        closeRentalModal();
        
        // Reload data
        loadCatalog();
        loadMyRentals();
        if (userRole === 'admin') {
            loadAdminRentals();
            loadAdminStats();
        }
    } catch (error) {
        showToast('Erreur lors de la location: ' + error.message, 'error');
    }
}

// My Rentals functions
function loadMyRentals() {
    if (!currentUser) return;
    
    const rentals = db.getUserRentals(currentUser.id);
    const tableBody = document.getElementById('rentals-body');
    
    if (tableBody) {
        tableBody.innerHTML = rentals.map(rental => `
            <tr>
                <td>${rental.id}</td>
                <td>${rental.car_name}</td>
                <td>${rental.date_debut}</td>
                <td>${rental.date_fin}</td>
                <td>${rental.prix_total.toFixed(2)} TND</td>
                <td>
                    <span class="status-badge ${getStatusClass(rental.statut)}">
                        ${rental.statut}
                    </span>
                </td>
            </tr>
        `).join('');
    }
}

function getStatusClass(status) {
    switch(status) {
        case 'En cours': return 'status-active';
        case 'Terminée': return 'status-completed';
        default: return 'status-pending';
    }
}

// Profile functions
function loadProfile() {
    if (!currentUser) return;
    
    // Load account info
    const accountDiv = document.getElementById('account-info');
    if (accountDiv) {
        accountDiv.innerHTML = `
            <div class="info-item">
                <div class="info-label">Nom d'utilisateur</div>
                <div class="info-value">${currentUser.username}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${currentUser.email}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Rôle</div>
                <div class="info-value">${currentUser.role}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Date d'inscription</div>
                <div class="info-value">${new Date(currentUser.created_at).toLocaleDateString('fr-FR')}</div>
            </div>
        `;
    }
    
    // Load or create client info
    const client = db.getClientByUserId(currentUser.id);
    const clientSection = document.getElementById('client-info-section');
    const clientFormSection = document.getElementById('client-form-section');
    
    if (client) {
        clientSection.innerHTML = `
            <h2><i class="fas fa-id-card"></i> Informations Client</h2>
            <div class="profile-info">
                <div class="info-item">
                    <div class="info-label">Nom</div>
                    <div class="info-value">${client.nom}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Prénom</div>
                    <div class="info-value">${client.prenom}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Téléphone</div>
                    <div class="info-value">${client.telephone}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${client.email || currentUser.email}</div>
                </div>
            </div>
        `;
        clientFormSection.innerHTML = '';
    } else {
        clientSection.innerHTML = '';
        clientFormSection.innerHTML = `
            <h2><i class="fas fa-user-edit"></i> Compléter votre profil client</h2>
            <div class="form-grid">
                <input type="text" id="client-lastname" placeholder="Nom">
                <input type="text" id="client-firstname" placeholder="Prénom">
                <input type="tel" id="client-phone" placeholder="Téléphone">
                <input type="email" id="client-email" placeholder="Email (optionnel)">
            </div>
            <div class="form-actions">
                <button class="btn btn-success" onclick="saveClientProfile()">
                    <i class="fas fa-save"></i> Enregistrer le profil
                </button>
            </div>
        `;
    }
}

function saveClientProfile() {
    const nom = document.getElementById('client-lastname').value;
    const prenom = document.getElementById('client-firstname').value;
    const telephone = document.getElementById('client-phone').value;
    const email = document.getElementById('client-email').value;
    
    if (!nom || !prenom || !telephone) {
        showToast('Nom, Prénom et Téléphone sont obligatoires', 'error');
        return;
    }
    
    try {
        db.createClient(currentUser.id, nom, prenom, telephone, email);
        showToast('Profil client enregistré avec succès', 'success');
        loadProfile();
    } catch (error) {
        showToast('Erreur lors de l\'enregistrement: ' + error.message, 'error');
    }
}

// Admin Car Management
function loadAdminCars() {
    const cars = db.getAllCars();
    const tableBody = document.getElementById('cars-body');
    
    if (tableBody) {
        tableBody.innerHTML = cars.map(car => `
            <tr>
                <td>${car.id}</td>
                <td>${car.marque}</td>
                <td>${car.modele}</td>
                <td>${car.annee}</td>
                <td>${car.prix_location.toFixed(2)} TND</td>
                <td>${car.disponible ? 'Oui' : 'Non'}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editCar(${car.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCarPrompt(${car.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

function addCar() {
    const marque = document.getElementById('car-brand').value;
    const modele = document.getElementById('car-model').value;
    const annee = parseInt(document.getElementById('car-year').value);
    const prix = parseFloat(document.getElementById('car-price').value);
    const description = document.getElementById('car-description').value;
    
    if (!marque || !modele || !annee || !prix) {
        showToast('Marque, Modèle, Année et Prix sont obligatoires', 'error');
        return;
    }
    
    try {
        db.addCar({
            marque,
            modele,
            annee,
            prix_location: prix,
            description
        });
        
        showToast('Supercar ajoutée avec succès', 'success');
        clearCarForm();
        loadAdminCars();
        loadAdminStats();
    } catch (error) {
        showToast('Erreur lors de l\'ajout: ' + error.message, 'error');
    }
}

function editCar(carId) {
    const car = db.getCarById(carId);
    if (!car) return;
    
    selectedCarId = carId;
    
    document.getElementById('car-brand').value = car.marque;
    document.getElementById('car-model').value = car.modele;
    document.getElementById('car-year').value = car.annee;
    document.getElementById('car-price').value = car.prix_location;
    document.getElementById('car-description').value = car.description || '';
}

function updateCar() {
    if (!selectedCarId) {
        showToast('Veuillez sélectionner une supercar à modifier', 'error');
        return;
    }
    
    const marque = document.getElementById('car-brand').value;
    const modele = document.getElementById('car-model').value;
    const annee = parseInt(document.getElementById('car-year').value);
    const prix = parseFloat(document.getElementById('car-price').value);
    const description = document.getElementById('car-description').value;
    
    if (!marque || !modele || !annee || !prix) {
        showToast('Tous les champs sont obligatoires', 'error');
        return;
    }
    
    try {
        db.updateCar(selectedCarId, {
            marque,
            modele,
            annee,
            prix_location: prix,
            description
        });
        
        showToast('Supercar modifiée avec succès', 'success');
        clearCarForm();
        loadAdminCars();
    } catch (error) {
        showToast('Erreur lors de la modification: ' + error.message, 'error');
    }
}

function deleteCarPrompt(carId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette supercar ?')) {
        deleteCar(carId);
    }
}

function deleteCar() {
    if (!selectedCarId) {
        showToast('Veuillez sélectionner une supercar à supprimer', 'error');
        return;
    }
    
    try {
        db.deleteCar(selectedCarId);
        showToast('Supercar supprimée avec succès', 'success');
        clearCarForm();
        loadAdminCars();
        loadAdminStats();
    } catch (error) {
        showToast('Erreur lors de la suppression: ' + error.message, 'error');
    }
}

function clearCarForm() {
    selectedCarId = null;
    document.getElementById('car-brand').value = '';
    document.getElementById('car-model').value = '';
    document.getElementById('car-year').value = '';
    document.getElementById('car-price').value = '';
    document.getElementById('car-description').value = '';
}

// Admin Clients Management
function loadAdminClients() {
    const clients = db.getAllClients();
    const tableBody = document.getElementById('clients-body');
    
    if (tableBody) {
        tableBody.innerHTML = clients.map(client => `
            <tr>
                <td>${client.id}</td>
                <td>${client.nom}</td>
                <td>${client.prenom}</td>
                <td>${client.telephone}</td>
                <td>${client.email}</td>
                <td>${new Date(client.created_at).toLocaleDateString('fr-FR')}</td>
            </tr>
        `).join('');
    }
}

// Admin Rentals Management
function loadAdminRentals() {
    const rentals = db.getAllRentals();
    const tableBody = document.getElementById('admin-rentals-body');
    
    if (tableBody) {
        tableBody.innerHTML = rentals.map(rental => `
            <tr>
                <td>${rental.id}</td>
                <td>${rental.car_name}</td>
                <td>${rental.client_name}</td>
                <td>${rental.date_debut}</td>
                <td>${rental.date_fin}</td>
                <td>${rental.prix_total.toFixed(2)} TND</td>
                <td>
                    <span class="status-badge ${getStatusClass(rental.statut)}">
                        ${rental.statut}
                    </span>
                </td>
                <td>
                    ${rental.statut === 'En cours' ? `
                        <button class="btn btn-success btn-sm" onclick="returnCar(${rental.id})">
                            <i class="fas fa-check"></i> Retour
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }
}

function returnCar(rentalId) {
    if (confirm('Marquer cette supercar comme retournée ?')) {
        try {
            db.updateRentalStatus(rentalId, 'Terminée');
            showToast('Supercar retournée avec succès', 'success');
            loadAdminRentals();
            loadAdminStats();
            loadCatalog();
        } catch (error) {
            showToast('Erreur lors du retour: ' + error.message, 'error');
        }
    }
}

// Admin Statistics
function loadAdminStats() {
    const stats = db.getSystemStats();
    
    // Update quick stats
    document.getElementById('total-cars').textContent = stats.total_cars;
    document.getElementById('available-cars').textContent = stats.available_cars;
    document.getElementById('total-clients').textContent = stats.total_clients;
    document.getElementById('total-revenue').textContent = `${stats.total_revenue.toFixed(2)} TND`;
    
    // Generate charts
    generateCharts();
}

// Export functions
function openImportModal() {
    document.getElementById('import-modal').classList.add('active');
}

function closeImportModal() {
    document.getElementById('import-modal').classList.remove('active');
}

function exportData() {
    const type = document.getElementById('export-type').value;
    const format = document.getElementById('export-format').value;
    
    const data = db.exportData(type, format);
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supercars_${type}_${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('Données exportées avec succès', 'success');
    closeImportModal();
}

// Utility functions
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Chatbot functions
function openChatbot() {
    document.getElementById('chatbot-modal').classList.add('active');
}

function closeChatbot() {
    document.getElementById('chatbot-modal').classList.remove('active');
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// Add these to your existing chatbot.js
function sendChatMessage() {
    const input = document.getElementById('chat-input-field');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessageToChat('user', message);
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const response = getAIResponse(message);
        addMessageToChat('bot', response);
        
        // Save to chat history
        if (currentUser) {
            db.saveChatMessage(currentUser.id, message, response);
        }
    }, 1000);
}

function addMessageToChat(sender, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${sender === 'user' ? '👤 Vous' : '🤖 Assistant'}:</strong> ${message}
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function askQuickQuestion(question) {
    document.getElementById('chat-input-field').value = question;
    sendChatMessage();
}

// AI Response Simulation
function getAIResponse(message) {
    const messageLower = message.toLowerCase();
    const stats = db.getSystemStats();
    const availableCars = db.getAvailableCars();
    
    // Check for specific responses
    if (messageLower.includes('bonjour') || messageLower.includes('salut')) {
        return `Bonjour ! 👋 Je suis votre assistant pour la location de SUPERCARS. Nous avons actuellement ${stats.available_cars} supercars disponibles. Comment puis-je vous aider ?`;
    }
    
    if (messageLower.includes('disponible') || messageLower.includes('disponibilité')) {
        return `Nous avons ${stats.available_cars} SUPERCARS disponibles actuellement ! 🚗💨`;
    }
    
    if (messageLower.includes('prix') || messageLower.includes('tarif') || messageLower.includes('combien')) {
        const minPrice = Math.min(...availableCars.map(c => c.prix_location));
        const maxPrice = Math.max(...availableCars.map(c => c.prix_location));
        return `Nos tarifs vont de ${minPrice.toFixed(0)} TND à ${maxPrice.toFixed(0)} TND par jour selon le modèle. Les supercars comme Porsche commencent à 8000 TND/jour, tandis que les hypercars comme Bugatti atteignent 15000 TND/jour.`;
    }
    
    if (messageLower.includes('réserver') || messageLower.includes('location') || messageLower.includes('louer')) {
        return "Pour réserver : 1) Choisissez une supercar dans le catalogue 2) Cliquez 'Louer cette supercar' 3) Sélectionnez vos dates 4) Confirmez ! 📝";
    }
    
    if (messageLower.includes('aide') || messageLower.includes('support')) {
        return "Je peux vous aider avec : locations, disponibilités, prix, réservations, support technique. Dites-moi ce dont vous avez besoin ! 💪";
    }
    
    // Check for car brands
    for (const car of availableCars) {
        if (messageLower.includes(car.marque.toLowerCase())) {
            return `La ${car.marque} ${car.modele} (${car.annee}) est disponible au prix de ${car.prix_location.toFixed(0)} TND/jour. ${car.description} Souhaitez-vous plus de détails ?`;
        }
    }
    
    // Default response
    const responses = [
        `Je comprends votre question. Nous avons ${stats.available_cars} SUPERCARS disponibles. Souhaitez-vous des informations spécifiques sur nos modèles ?`,
        `Je peux vous orienter vers nos ${stats.available_cars} supercars disponibles. Avez-vous une marque ou un budget particulier en tête ?`,
        `Consultez notre catalogue avec ${stats.available_cars} options. Je peux aussi vous aider à trouver la supercar parfaite ! 🚗💨`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}