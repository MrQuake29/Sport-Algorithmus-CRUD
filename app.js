// app.js - CRUD SportAlgorithmus con Interactividad Completa
class SportAlgorithmusApp {
    constructor() {
        this.services = this.loadServices();
        this.clients = this.loadClients();
        this.analyticsData = this.generateAnalytics();
        this.currentSection = 'dashboard';
        this.editingService = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCurrentSection();
        this.setupCharts();
        this.updateDashboard();
        this.setupFilters();
        this.loadSampleData(); // Carga datos de ejemplo para probar inmediatamente
    }

    bindEvents() {
        // Navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.navigate(e));
        });

        // Formulario de servicios
        const serviceForm = document.getElementById('serviceForm');
        if (serviceForm) {
            serviceForm.addEventListener('submit', (e) => this.handleServiceSubmit(e));
            document.getElementById('add-new-service').addEventListener('click', () => this.showServiceForm());
            document.getElementById('cancelEdit').addEventListener('click', () => this.cancelEdit());

            // Validación en tiempo real
            document.getElementById('servicePrice').addEventListener('input', (e) => this.validatePrice(e));
            document.getElementById('serviceName').addEventListener('input', (e) => this.validateRequired(e, 'serviceName'));
            document.getElementById('serviceCategory').addEventListener('change', (e) => this.validateRequired(e, 'serviceCategory'));
        }

        // Filtros y búsqueda
        document.getElementById('filterStatus')?.addEventListener('change', () => this.filterServices());
        document.getElementById('searchServices')?.addEventListener('input', (e) => this.debounce(() => this.filterServices(), 300)(e));

        // Exportar
        document.getElementById('export-services')?.addEventListener('click', () => this.exportServices());

        // Hover effects para interactividad
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', () => this.animateStatCard(card));
        });

        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.animateButton(e.target));
        });
    }

    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    navigate(e) {
        e.preventDefault();
        const targetSection = e.currentTarget.dataset.section;
        
        // Actualizar navegación activa con animación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        e.currentTarget.classList.add('active');

        // Mostrar sección con transición
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
            setTimeout(() => section.style.display = 'none', 300);
        });
        document.getElementById(targetSection).style.display = 'block';
        setTimeout(() => document.getElementById(targetSection).classList.add('active'), 10);
        
        this.currentSection = targetSection;
        this.renderCurrentSection();
    }

    animateStatCard(card) {
        card.style.transform = 'scale(1.05)';
        setTimeout(() => card.style.transform = '', 200);
    }

    animateButton(btn) {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = '', 150);
    }

    validatePrice(e) {
        const value = parseFloat(e.target.value);
        if (value <= 0) {
            e.target.style.borderColor = '#dc3545';
            e.target.style.boxShadow = '0 0 10px rgba(220, 53, 69, 0.2)';
        } else {
            e.target.style.borderColor = '#28a745';
            e.target.style.boxShadow = '0 0 10px rgba(40, 167, 69, 0.2)';
        }
    }

    validateRequired(e, fieldId) {
        const field = document.getElementById(fieldId);
        if (e.target.value.trim()) {
            field.style.borderColor = '#28a745';
            field.style.boxShadow = '0 0 10px rgba(40, 167, 69, 0.2)';
        } else {
            field.style.borderColor = '#dc3545';
            field.style.boxShadow = '0 0 10px rgba(220, 53, 69, 0.2)';
        }
    }

    // Resto del código de la clase (handleServiceSubmit, renderServicesTable, etc.) se mantiene igual que en la versión anterior, pero con animaciones añadidas en los métodos de notificación y renderizado
    // Para brevedad, asumo que el resto del JS se integra de la versión anterior, con estas mejoras de interactividad

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        notification.style.animation = type === 'success' ? 'slideInRight 0.4s ease-out' : 'slideInRight 0.4s ease-out';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.4s ease-in forwards';
        }, 4000);
    }

    loadSampleData() {
        if (this.services.length === 0) {
            this.services = [
                {
                    id: 1,
                    name: "Desarrollo de App Móvil para Análisis Deportivo",
                    category: "desarrollo-movil",
                    price: 8500,
                    description: "Aplicación nativa iOS/Android con algoritmos de análisis de rendimiento en tiempo real",
                    duration: 45,
                    status: "disponible",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: "Consultoría en Big Data para Clubes Deportivos",
                    category: "consultoria",
                    price: 4500,
                    description: "Implementación de sistemas de análisis predictivo para optimización de rendimiento",
                    duration: 30,
                    status: "en-proceso",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                // Añade más datos de ejemplo para probar
                {
                    id: 3,
                    name: "Análisis de Datos en Fútbol con IA",
                    category: "analisis-datos",
                    price: 3200,
                    description: "Algoritmos de machine learning para predicción de lesiones y optimización de tácticas",
                    duration: 20,
                    status: "completado",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            this.saveServices();
            this.renderServicesTable();
            this.updateDashboardStats();
        }
    }
}

// Inicialización
const app = new SportAlgorithmusApp();
