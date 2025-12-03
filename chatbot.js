// Enhanced Chatbot Module
class Chatbot {
    constructor() {
        this.isResponding = false;
        this.apiKey = null;
        this.setupAPI();
    }

    setupAPI() {
        // You can add OpenAI API integration here
        // For now, we use the simulation from app.js
    }

    getSystemContext() {
        const stats = db.getSystemStats();
        const availableCars = db.getAvailableCars();
        
        let carsInfo = "";
        availableCars.slice(0, 5).forEach(car => {
            carsInfo += `- ${car.marque} ${car.modele} (${car.annee}): ${car.prix_location.toFixed(0)} TND/jour\n`;
        });
        
        let userInfo = "";
        if (currentUser) {
            const client = db.getClientByUserId(currentUser.id);
            const userRentals = db.getUserRentals(currentUser.id);
            userInfo = `\nUTILISATEUR:\n- Rôle: ${userRole}\n- Nom: ${client ? client.prenom + ' ' + client.nom : 'Non renseigné'}\n- Locations actives: ${userRentals.filter(r => r.statut === 'En cours').length}`;
        }
        
        return `SYSTÈME DE LOCATION DE SUPERCARS - CONTEXTE TEMPS RÉEL
Date: ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}

STATISTIQUES:
- Supercars totales: ${stats.total_cars}
- Supercars disponibles: ${stats.available_cars}
- Clients inscrits: ${stats.total_clients}
- Locations en cours: ${stats.active_rentals}
- Revenus totaux: ${stats.total_revenue.toFixed(2)} TND

SUPERCARS DISPONIBLES:${carsInfo}${userInfo}`;
    }

    getResponse(message, callback) {
        if (this.isResponding) {
            callback("Je traite déjà votre message, veuillez patienter...");
            return;
        }
        
        this.isResponding = true;
        
        // Simulate API call delay
        setTimeout(() => {
            try {
                const context = this.getSystemContext();
                const response = this.generateResponse(message, context);
                callback(response);
            } catch (error) {
                console.error("Chatbot error:", error);
                callback("Désolé, je rencontre un problème technique. Veuillez réessayer.");
            } finally {
                this.isResponding = false;
            }
        }, 1500);
    }

    generateResponse(message, context) {
        // You can replace this with actual OpenAI API call
        // For demonstration, we'll use enhanced simulation
        
        const messageLower = message.toLowerCase();
        
        // Check for car availability
        if (messageLower.includes('disponible') || messageLower.includes('disponibilit')) {
            const availableCars = db.getAvailableCars();
            if (availableCars.length === 0) {
                return "Désolé, aucune supercar n'est disponible pour le moment. Veuillez réessayer plus tard.";
            }
            
            const carList = availableCars.slice(0, 3).map(car => 
                `• ${car.marque} ${car.modele} - ${car.prix_location.toFixed(0)} TND/jour`
            ).join('\n');
            
            return `Nous avons ${availableCars.length} supercars disponibles ! 🚗💨\n\nVoici quelques modèles:\n${carList}\n\nConsultez notre catalogue complet pour plus de choix !`;
        }
        
        // Check for specific car queries
        const availableCars = db.getAvailableCars();
        for (const car of availableCars) {
            const brandLower = car.marque.toLowerCase();
            const modelLower = car.modele.toLowerCase();
            
            if (messageLower.includes(brandLower) || messageLower.includes(modelLower)) {
                return `✨ **${car.marque} ${car.modele}** ✨\n\n` +
                       `• Année: ${car.annee}\n` +
                       `• Prix: ${car.prix_location.toFixed(0)} TND/jour\n` +
                       `• Description: ${car.description}\n\n` +
                       `Cette supercar est ${car.disponible ? 'disponible' : 'non disponible'} pour location. ` +
                       `${car.disponible ? 'Souhaitez-vous la réserver ?' : 'Voulez-vous être notifié quand elle sera disponible ?'}`;
            }
        }
        
        // Price queries
        if (messageLower.includes('prix') || messageLower.includes('tarif') || messageLower.includes('combien')) {
            const prices = availableCars.map(c => c.prix_location);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            return `💰 **Tarifs des SUPERCARS** 💰\n\n` +
                   `• Fourchette de prix: ${minPrice.toFixed(0)} TND à ${maxPrice.toFixed(0)} TND/jour\n` +
                   `• La location moyenne coûte environ ${((minPrice + maxPrice) / 2).toFixed(0)} TND/jour\n` +
                   `• Des promotions sont disponibles pour les locations longues durées\n\n` +
                   `*Exemple de tarifs:*\n` +
                   `- Bugatti Chiron: 15,000 TND/jour\n` +
                   `- Lamborghini Aventador: 12,000 TND/jour\n` +
                   `- Ferrari SF90: 11,000 TND/jour`;
        }
        
        // Booking process
        if (messageLower.includes('réserver') || messageLower.includes('louer') || 
            messageLower.includes('booking') || messageLower.includes('process')) {
            
            return `📋 **Processus de Réservation** 📋\n\n` +
                   `1. **Choisir une supercar** - Parcourez notre catalogue\n` +
                   `2. **Sélectionner les dates** - Choisissez dates de début et fin\n` +
                   `3. **Calculer le prix** - Le système calcule automatiquement\n` +
                   `4. **Confirmer la location** - Cliquez sur "Confirmer"\n` +
                   `5. **Paiement** - Options disponibles: Carte bancaire, Virement\n\n` +
                   `💡 *Conseil:* Complétez votre profil client avant de réserver !`;
        }
        
        // Help and support
        if (messageLower.includes('aide') || messageLower.includes('help') || 
            messageLower.includes('support') || messageLower.includes('problème')) {
            
            return `🆘 **Support et Assistance** 🆘\n\n` +
                   `Je peux vous aider avec:\n\n` +
                   `• **Disponibilités** - Vérifier les supercars disponibles\n` +
                   `• **Tarifs** - Informations sur les prix\n` +
                   `• **Réservations** - Guide étape par étape\n` +
                   `• **Profil** - Gestion de compte client\n` +
                   `• **Locations** - Suivi de vos réservations\n` +
                   `• **Support technique** - Problèmes techniques\n\n` +
                   `Dites-moi précisément ce dont vous avez besoin !`;
        }
        
        // Greetings
        if (messageLower.includes('bonjour') || messageLower.includes('salut') || 
            messageLower.includes('hello') || messageLower.includes('hi')) {
            
            const greetings = [
                `Bonjour ! 👋 Bienvenue sur notre service de location de SUPERCARS. ${availableCars.length} véhicules de luxe sont disponibles dès maintenant. Que cherchez-vous ?`,
                `Salut ! 😊 Prêt à vivre l'expérience SUPERCAR ? Nous avons ${availableCars.length} modèles exclusifs. Comment puis-je vous aider aujourd'hui ?`,
                `Bonjour et bienvenue ! 🚗💨 Notre collection compte ${availableCars.length} supercars disponibles. Recherchez-vous quelque chose de particulier ?`
            ];
            
            return greetings[Math.floor(Math.random() * greetings.length)];
        }
        
        // Thank you responses
        if (messageLower.includes('merci') || messageLower.includes('thanks')) {
            const thanksResponses = [
                "Je vous en prie ! 😊 N'hésitez pas si vous avez d'autres questions.",
                "Avec plaisir ! 🚗 N'oubliez pas de consulter notre catalogue pour découvrir toutes nos supercars.",
                "De rien ! 💫 Bonne journée et à bientôt sur notre plateforme !"
            ];
            
            return thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
        }
        
        // Default intelligent response
        const contextLines = context.split('\n');
        const availableCount = contextLines.find(line => line.includes('disponibles:'))?.match(/\d+/)?.[0] || 'plusieurs';
        
        const defaultResponses = [
            `Je comprends votre question sur "${message}". Nous avons ${availableCount} SUPERCARS disponibles. Souhaitez-vous des informations spécifiques sur un modèle particulier ?`,
            `Concernant "${message}", je peux vous orienter vers nos supercars disponibles. Avez-vous une marque ou un budget en tête ?`,
            `Pour "${message}", consultez notre catalogue. Je peux aussi vous aider à trouver la supercar parfaite selon vos critères ! 🚗💨`,
            `Intéressant ! Pour "${message}", je vous recommande de parcourir notre collection. Nous avons des options pour tous les goûts et budgets.`
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
}

// Create global chatbot instance
const chatbot = new Chatbot();

// Integration with existing functions
function sendChatMessage() {
    const input = document.getElementById('chat-input-field');
    const message = input.value.trim();
    
    if (!message || chatbot.isResponding) return;
    
    addMessageToChat('user', message);
    input.value = '';
    
    // Show thinking message
    addMessageToChat('bot', "🤔 Je réfléchis...");
    
    chatbot.getResponse(message, (response) => {
        // Remove thinking message
        const chatMessages = document.getElementById('chat-messages');
        const messages = chatMessages.querySelectorAll('.message');
        if (messages.length > 0 && messages[messages.length - 1].textContent.includes('Je réfléchis')) {
            messages[messages.length - 1].remove();
        }
        
        // Add actual response
        addMessageToChat('bot', response);
        
        // Save to chat history
        if (currentUser) {
            db.saveChatMessage(currentUser.id, message, response);
        }
    });
}

function askQuickQuestion(question) {
    document.getElementById('chat-input-field').value = question;
    sendChatMessage();
}