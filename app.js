// app.js - CRUD SportAlgorithmus Completo
class SportAlgorithmusApp {
    constructor() {
        this.services = this.loadServices();
        this.clients = this.loadClients();
        this.analyticsData = this.generateAnalytics();
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCurrentSection();
        this.setupCharts();
        this.updateDashboard();
        this.setupFilters();
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
        }

        // Filtros y búsqueda
        document.getElementById('filterStatus')?.addEventListener('change', () => this.filterServices());
        document.getElementById('searchServices')?.addEventListener('input', () => this.filterServices());

        // Exportar
        document.getElementById('export-services')?.addEventListener('click', () => this.exportServices());
    }

    navigate(e) {
        e.preventDefault();
        const targetSection = e.currentTarget.dataset.section;
        
        // Actualizar navegación activa
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Mostrar sección
        document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
        document.getElementById(targetSection).classList.add('active');
        
        this.currentSection = targetSection;
        this.renderCurrentSection();
    }

    renderCurrentSection() {
        switch(this.currentSection) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'services':
                this.renderServices();
                break;
            case 'analytics':
                this.renderAnalytics();
                break;
            case 'clients':
                this.renderClients();
                break;
            case 'settings':
                this.renderSettings();
                break;
        }
    }

    // Dashboard
    renderDashboard() {
        this.updateDashboardStats();
        this.updateCharts();
    }

    updateDashboardStats() {
        const totalServices = this.services.length;
        const activeServices = this.services.filter(s => s.status === 'disponible').length;
        const totalRevenue = this.services.reduce((sum, s) => sum + s.price, 0);
        const growthRate = this.calculateGrowthRate();
        
        document.getElementById('total-services').textContent = totalServices;
        document.getElementById('active-services').textContent = activeServices;
        document.getElementById('total-revenue').textContent = `$${totalRevenue.toLocaleString()}`;
        document.getElementById('growth-rate').textContent = `+${growthRate}%`;
    }

    calculateGrowthRate() {
        // Simulación de crecimiento
        return Math.floor(Math.random() * 30) + 15;
    }

    // Servicios CRUD
    renderServices() {
        this.renderServicesTable();
        document.getElementById('servicesCount').textContent = `(${this.services.length})`;
    }

    showServiceForm() {
        document.querySelector('.crud-panel').style.display = 'block';
        document.querySelector('.table-container').style.display = 'none';
        document.getElementById('add-new-service').style.display = 'none';
        document.getElementById('serviceForm').reset();
        document.getElementById('saveButtonText').textContent = 'Crear Servicio';
        this.editingService = null;
    }

    hideServiceForm() {
        document.querySelector('.crud-panel').style.display = 'none';
        document.querySelector('.table-container').style.display = 'block';
        document.getElementById('add-new-service').style.display = 'inline-flex';
    }

    handleServiceSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const serviceData = {
            id: this.editingService ? this.editingService.id : Date.now(),
            name: formData.get('serviceName'),
            category: formData.get('serviceCategory'),
            price: parseFloat(formData.get('servicePrice')),
            description: formData.get('serviceDescription'),
            duration: parseInt(formData.get('serviceDuration')) || 30,
            status: formData.get('serviceStatus'),
            createdAt: this.editingService ? this.editingService.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (this.validateService(serviceData)) {
            if (this.editingService) {
                const index = this.services.findIndex(s => s.id === this.editingService.id);
                this.services[index] = serviceData;
                this.showNotification('Servicio actualizado correctamente', 'success');
            } else {
                this.services.push(serviceData);
                this.showNotification('Servicio creado correctamente', 'success');
            }
            
            this.saveServices();
            this.hideServiceForm();
            this.renderServicesTable();
            this.updateDashboardStats();
            e.target.reset();
        }
    }

    validateService(service) {
        if (!service.name.trim()) {
            this.showNotification('El nombre del servicio es requerido', 'error');
            return false;
        }
        if (!service.category) {
            this.showNotification('Debe seleccionar una categoría', 'error');
            return false;
        }
        if (service.price <= 0) {
            this.showNotification('El precio debe ser mayor a 0', 'error');
            return false;
        }
        return true;
    }

    editService(id) {
        this.editingService = this.services.find(s => s.id === id);
        if (this.editingService) {
            document.getElementById('serviceName').value = this.editingService.name;
            document.getElementById('serviceCategory').value = this.editingService.category;
            document.getElementById('servicePrice').value = this.editingService.price;
            document.getElementById('serviceDescription').value = this.editingService.description;
            document.getElementById('serviceDuration').value = this.editingService.duration;
            document.getElementById('serviceStatus').value = this.editingService.status;
            document.getElementById('editServiceId').value = this.editingService.id;
            document.getElementById('saveButtonText').textContent = 'Actualizar Servicio';
            
            document.querySelector('.crud-panel').style.display = 'block';
            document.querySelector('.table-container').style.display = 'none';
            document.getElementById('add-new-service').style.display = 'none';
        }
    }

    deleteService(id) {
        if (confirm('¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer.')) {
            this.services = this.services.filter(s => s.id !== id);
            this.saveServices();
            this.renderServicesTable();
            this.updateDashboardStats();
            this.showNotification('Servicio eliminado correctamente', 'success');
        }
    }

    renderServicesTable() {
        const tbody = document.getElementById('servicesTableBody');
        const filteredServices = this.filterServicesData();
        
        tbody.innerHTML = filteredServices.map(service => `
            <tr>
                <td>${service.id}</td>
                <td class="service-name">${service.name}</td>
                <td><span class="service-category category-${service.category}">${this.getCategoryLabel(service.category)}</span></td>
                <td class="price">$${service.price.toLocaleString()}</td>
                <td><span class="service-status status-${service.status}">${this.getStatusLabel(service.status)}</span></td>
                <td class="actions">
                    <button class="action-btn edit" onclick="app.editService(${service.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="action-btn delete" onclick="app.deleteService(${service.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    filterServicesData() {
        const statusFilter = document.getElementById('filterStatus').value;
        const searchTerm = document.getElementById('searchServices').value.toLowerCase();
        
        return this.services.filter(service => {
            const matchesStatus = !statusFilter || service.status === statusFilter;
            const matchesSearch = !searchTerm || service.name.toLowerCase().includes(searchTerm);
            return matchesStatus && matchesSearch;
        });
    }

    setupFilters() {
        document.getElementById('filterStatus').addEventListener('change', () => this.renderServicesTable());
        document.getElementById('searchServices').addEventListener('input', () => this.renderServicesTable());
    }

    getCategoryLabel(category) {
        const labels = {
            'desarrollo-web': 'Desarrollo Web',
            'desarrollo-movil': 'Desarrollo Móvil',
            'consultoria': 'Consultoría',
            'analisis-datos': 'Análisis de Datos',
            'ux-ui': 'Diseño UX/UI',
            'mantenimiento': 'Mantenimiento'
        };
        return labels[category] || category;
    }

    getStatusLabel(status) {
        const labels = {
            'disponible': 'Disponible',
            'en-proceso': 'En Proceso',
            'completado': 'Completado',
            'pausado': 'Pausado'
        };
        return labels[status] || status;
    }

    exportServices() {
        const dataStr = JSON.stringify(this.services, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sportalgorithmus-servicios-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showNotification('Datos exportados correctamente', 'success');
    }

    cancelEdit() {
        this.editingService = null;
        document.getElementById('serviceForm').reset();
        document.getElementById('saveButtonText').textContent = 'Crear Servicio';
        this.hideServiceForm();
    }

    // Analytics
    renderAnalytics() {
        // Se renderizarán los gráficos aquí
        console.log('Renderizando analytics...');
    }

    // Storage
    loadServices() {
        return JSON.parse(localStorage.getItem('sportalgorithmus_services')) || [
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
            }
        ];
    }

    saveServices() {
        localStorage.setItem('sportalgorithmus_services', JSON.stringify(this.services));
    }

    loadClients() {
        return JSON.parse(localStorage.getItem('sportalgorithmus_clients')) || [];
    }

    saveClients() {
        localStorage.setItem('sportalgorithmus_clients', JSON.stringify(this.clients));
    }

    generateAnalytics() {
        return {
            monthlyRevenue: [12000, 18500, 22000, 19500, 24800],
            servicePerformance: {
                'desarrollo-web': 85,
                'desarrollo-movil': 92,
                'consultoria': 78,
                'analisis-datos': 95
            }
        };
    }

    // Charts
    setupCharts() {
        this.createServicesChart();
        this.createCategoryChart();
    }

    createServicesChart() {
        const ctx = document.getElementById('servicesChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
                    datasets: [{
                        label: 'Ingresos',
                        data: [12000, 18500, 22000, 19500, 24800],
                        borderColor: '#ff4500',
                        backgroundColor: 'rgba(255, 69, 0, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
    }

    createCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Web', 'Móvil', 'Consultoría', 'Datos'],
                    datasets: [{
                        data: [35, 28, 22, 15],
                        backgroundColor: ['#1a2a44', '#ff4500', '#ffd700', '#007bff']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: { 
                                color: '#1a2a44',
                                font: { family: 'Oswald' }
                            }
                        }
                    }
                }
            });
        }
    }

    // Notificaciones
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1.2em 1.5em;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            min-width: 300px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 1em;
            animation: slideInRight 0.4s ease-out;
        `;
        
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        } else if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
        } else {
            notification.style.background = 'linear-gradient(135deg, #17a2b8, #138496)';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.4s ease-in forwards';
        }, 4000);
    }
}

// Inicialización de la aplicación
const app = new SportAlgorithmusApp();

// Estilos adicionales para notificaciones
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 1.5em;
        cursor: pointer;
        margin-left: auto;
        opacity: 0.8;
        transition: opacity 0.3s;
    }
    .notification button:hover {
        opacity: 1;
    }
    .notification i {
        font-size: 1.2em;
        margin-right: 0.5em;
    }
`;
document.head.appendChild(notificationStyles);
