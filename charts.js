// Chart Generation Module
let monthlyChart = null;
let brandChart = null;
let statusChart = null;
let revenueChart = null;

function generateCharts() {
    generateMonthlyChart();
    generateBrandChart();
    generateStatusChart();
    generateRevenueChart();
}

function generateMonthlyChart() {
    const ctx = document.getElementById('monthly-chart').getContext('2d');
    
    // Sample monthly data (in a real app, get from database)
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const rentalsData = [12, 19, 15, 25, 22, 30, 35, 40, 32, 28, 45, 50];
    
    if (monthlyChart) monthlyChart.destroy();
    
    monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Nombre de Locations',
                data: rentalsData,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Évolution des Locations par Mois',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nombre de Locations'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Mois'
                    }
                }
            }
        }
    });
}

function generateBrandChart() {
    const ctx = document.getElementById('brand-chart').getContext('2d');
    const stats = db.getSystemStats();
    
    // Get real car data
    const cars = db.getAllCars();
    const brandCounts = {};
    
    cars.forEach(car => {
        brandCounts[car.marque] = (brandCounts[car.marque] || 0) + 1;
    });
    
    const brands = Object.keys(brandCounts);
    const counts = Object.values(brandCounts);
    const colors = generateColors(brands.length);
    
    if (brandChart) brandChart.destroy();
    
    brandChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: brands,
            datasets: [{
                data: counts,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Répartition des SUPERCARS par Marque',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function generateStatusChart() {
    const ctx = document.getElementById('status-chart').getContext('2d');
    const rentals = db.getAllRentals();
    
    // Count rentals by status
    const statusCounts = {
        'En cours': 0,
        'Terminée': 0,
        'Annulée': 0
    };
    
    rentals.forEach(rental => {
        statusCounts[rental.statut] = (statusCounts[rental.statut] || 0) + 1;
    });
    
    const statuses = Object.keys(statusCounts);
    const counts = Object.values(statusCounts);
    const colors = ['#27ae60', '#3498db', '#e74c3c'];
    
    if (statusChart) statusChart.destroy();
    
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: statuses,
            datasets: [{
                data: counts,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Statut des Locations',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function generateRevenueChart() {
    const ctx = document.getElementById('revenue-chart').getContext('2d');
    
    // Sample revenue data (in a real app, calculate from database)
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
    const revenueData = [120000, 185000, 150000, 225000, 220000, 300000];
    
    if (revenueChart) revenueChart.destroy();
    
    revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Revenus (TND)',
                data: revenueData,
                backgroundColor: '#f39c12',
                borderColor: '#d35400',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Revenus par Mois',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Revenus (TND)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + ' TND';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Mois'
                    }
                }
            }
        }
    });
}

function generateColors(count) {
    const colors = [
        '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
        '#1abc9c', '#d35400', '#c0392b', '#2980b9', '#27ae60'
    ];
    
    // If we need more colors than available, generate random ones
    if (count <= colors.length) {
        return colors.slice(0, count);
    }
    
    const result = [...colors];
    for (let i = colors.length; i < count; i++) {
        result.push(`#${Math.floor(Math.random()*16777215).toString(16)}`);
    }
    
    return result;
}

// Export function to use in admin panel
function updateCharts() {
    generateCharts();
}