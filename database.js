// Database Simulation using localStorage
class Database {
    constructor() {
        this.initializeDatabase();
    }

    initializeDatabase() {
        if (!localStorage.getItem('supercar_rental_db')) {
            const defaultData = {
                users: [
                    {
                        id: 1,
                        username: 'admin',
                        password: this.hashPassword('admin123'),
                        email: 'admin@location.com',
                        role: 'admin',
                        created_at: new Date().toISOString()
                    }
                ],
                clients: [],
                cars: [
                    {
                        id: 1,
                        marque: 'Bugatti',
                        modele: 'Chiron',
                        annee: 2023,
                        prix_location: 15000.0,
                        disponible: true,
                        image_path: 'bugatti_chiron.jpg',
                        description: 'Hypercar française légendaire, 1500 chevaux, vitesse max 420 km/h'
                    },
                    {
                        id: 2,
                        marque: 'Lamborghini',
                        modele: 'Aventador SVJ',
                        annee: 2023,
                        prix_location: 12000.0,
                        disponible: true,
                        image_path: 'lamborghini_aventador.jpg',
                        description: 'Supercar italienne emblématique, V12, design agressif'
                    },
                    {
                        id: 3,
                        marque: 'Ferrari',
                        modele: 'SF90 Stradale',
                        annee: 2023,
                        prix_location: 11000.0,
                        disponible: true,
                        image_path: 'ferrari_sf90.jpg',
                        description: 'Hybride rechargeable Ferrari, 1000 cv, 0-100 en 2.5s'
                    }
                ],
                rentals: [],
                chat_history: []
            };
            localStorage.setItem('supercar_rental_db', JSON.stringify(defaultData));
        }
    }

    getDatabase() {
        return JSON.parse(localStorage.getItem('supercar_rental_db') || '{}');
    }

    saveDatabase(data) {
        localStorage.setItem('supercar_rental_db', JSON.stringify(data));
    }

    hashPassword(password) {
        // Simple hash for demo purposes
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    // User methods
    verifyUser(username, password) {
        const db = this.getDatabase();
        const hashedPassword = this.hashPassword(password);
        return db.users.find(user => 
            user.username === username && user.password === hashedPassword
        );
    }

    userExists(username) {
        const db = this.getDatabase();
        return db.users.some(user => user.username === username);
    }

    createUser(username, password, email, role = 'user') {
        const db = this.getDatabase();
        const newUser = {
            id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
            username,
            password: this.hashPassword(password),
            email,
            role,
            created_at: new Date().toISOString()
        };
        
        db.users.push(newUser);
        this.saveDatabase(db);
        return newUser.id;
    }

    // Client methods
    getClientByUserId(userId) {
        const db = this.getDatabase();
        return db.clients.find(client => client.user_id === userId);
    }

    getAllClients() {
        const db = this.getDatabase();
        return db.clients;
    }

    createClient(userId, nom, prenom, telephone, email) {
        const db = this.getDatabase();
        const newClient = {
            id: db.clients.length > 0 ? Math.max(...db.clients.map(c => c.id)) + 1 : 1,
            user_id: userId,
            nom,
            prenom,
            telephone,
            email,
            created_at: new Date().toISOString()
        };
        
        db.clients.push(newClient);
        this.saveDatabase(db);
        return newClient.id;
    }

    // Car methods
    getAllCars() {
        const db = this.getDatabase();
        return db.cars;
    }

    getAvailableCars() {
        const db = this.getDatabase();
        return db.cars.filter(car => car.disponible);
    }

    getCarById(carId) {
        const db = this.getDatabase();
        return db.cars.find(car => car.id === carId);
    }

    getCarsByBrand(brand) {
        const db = this.getDatabase();
        return db.cars.filter(car => 
            car.disponible && 
            car.marque.toLowerCase().includes(brand.toLowerCase())
        );
    }

    addCar(carData) {
        const db = this.getDatabase();
        const newCar = {
            id: db.cars.length > 0 ? Math.max(...db.cars.map(c => c.id)) + 1 : 1,
            ...carData,
            disponible: true,
            image_path: carData.image_path || 'default_car.jpg'
        };
        
        db.cars.push(newCar);
        this.saveDatabase(db);
        return newCar.id;
    }

    updateCar(carId, carData) {
        const db = this.getDatabase();
        const index = db.cars.findIndex(car => car.id === carId);
        if (index !== -1) {
            db.cars[index] = { ...db.cars[index], ...carData };
            this.saveDatabase(db);
            return true;
        }
        return false;
    }

    deleteCar(carId) {
        const db = this.getDatabase();
        const index = db.cars.findIndex(car => car.id === carId);
        if (index !== -1) {
            db.cars.splice(index, 1);
            this.saveDatabase(db);
            return true;
        }
        return false;
    }

    // Rental methods
    getAllRentals() {
        const db = this.getDatabase();
        return db.rentals.map(rental => {
            const car = this.getCarById(rental.voiture_id);
            const client = db.clients.find(c => c.id === rental.client_id);
            return {
                ...rental,
                car_name: car ? `${car.marque} ${car.modele}` : 'Inconnue',
                client_name: client ? `${client.nom} ${client.prenom}` : 'Inconnu'
            };
        });
    }

    getUserRentals(userId) {
        const db = this.getDatabase();
        const client = this.getClientByUserId(userId);
        if (!client) return [];
        
        return db.rentals
            .filter(rental => rental.client_id === client.id)
            .map(rental => {
                const car = this.getCarById(rental.voiture_id);
                return {
                    ...rental,
                    car_name: car ? `${car.marque} ${car.modele}` : 'Inconnue'
                };
            });
    }

    createRental(voitureId, clientId, dateDebut, dateFin, prixTotal) {
        const db = this.getDatabase();
        const newRental = {
            id: db.rentals.length > 0 ? Math.max(...db.rentals.map(r => r.id)) + 1 : 1,
            voiture_id: voitureId,
            client_id: clientId,
            date_debut: dateDebut,
            date_fin: dateFin,
            prix_total: prixTotal,
            statut: 'En cours',
            created_at: new Date().toISOString()
        };
        
        db.rentals.push(newRental);
        
        // Mark car as unavailable
        const carIndex = db.cars.findIndex(car => car.id === voitureId);
        if (carIndex !== -1) {
            db.cars[carIndex].disponible = false;
        }
        
        this.saveDatabase(db);
        return newRental.id;
    }

    updateRentalStatus(rentalId, status) {
        const db = this.getDatabase();
        const rentalIndex = db.rentals.findIndex(r => r.id === rentalId);
        
        if (rentalIndex !== -1) {
            db.rentals[rentalIndex].statut = status;
            
            // If marking as completed, make car available again
            if (status === 'Terminée') {
                const carId = db.rentals[rentalIndex].voiture_id;
                const carIndex = db.cars.findIndex(car => car.id === carId);
                if (carIndex !== -1) {
                    db.cars[carIndex].disponible = true;
                }
            }
            
            this.saveDatabase(db);
            return true;
        }
        return false;
    }

    // Chat methods
    saveChatMessage(userId, message, response) {
        const db = this.getDatabase();
        db.chat_history.push({
            id: db.chat_history.length + 1,
            user_id: userId,
            message,
            response,
            timestamp: new Date().toISOString()
        });
        this.saveDatabase(db);
    }

    getChatHistory(userId, limit = 20) {
        const db = this.getDatabase();
        return db.chat_history
            .filter(chat => chat.user_id === userId)
            .slice(-limit);
    }

    // Statistics
    getSystemStats() {
        const db = this.getDatabase();
        const stats = {
            total_cars: db.cars.length,
            available_cars: db.cars.filter(car => car.disponible).length,
            total_clients: db.clients.length,
            active_rentals: db.rentals.filter(r => r.statut === 'En cours').length,
            total_revenue: db.rentals.reduce((sum, rental) => sum + rental.prix_total, 0),
            cars_by_brand: {}
        };
        
        // Group cars by brand
        db.cars.forEach(car => {
            stats.cars_by_brand[car.marque] = (stats.cars_by_brand[car.marque] || 0) + 1;
        });
        
        return stats;
    }

    // Data export
    exportData(type, format = 'json') {
        const db = this.getDatabase();
        let data;
        
        switch(type) {
            case 'cars':
                data = db.cars;
                break;
            case 'clients':
                data = db.clients;
                break;
            case 'rentals':
                data = db.rentals;
                break;
            case 'all':
                data = db;
                break;
            default:
                data = db.cars;
        }
        
        if (format === 'csv') {
            return this.convertToCSV(data);
        }
        
        return JSON.stringify(data, null, 2);
    }
    
    convertToCSV(data) {
        if (!Array.isArray(data) || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => 
                    JSON.stringify(row[header] || '')
                ).join(',')
            )
        ];
        
        return csvRows.join('\n');
    }
}

// Create global database instance
const db = new Database();