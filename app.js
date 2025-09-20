// app.js - CRUD SportAlgorithmus con Interactividad Completa
class SportAlgorithmusApp {
    constructor() {
        this.services = this.loadServices();
        this.clients = this.loadClients();
        this.editingService = null;
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCurrentSection();
        this.setupCharts();
        this.updateDashboard();
        this.setupFilters();
        this.loadInitialData();
    }

    bindEvents() {
        // Navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.navigate(e));
        });

        // Formulario de servicios
        const serviceForm = document.getElementById('serviceForm');
        serviceForm.addEventListener('submit', (e) => this.handleServiceSubmit(e));
        document.getElementById('add-new-service').addEventListener('click', () => this.showServiceForm());
        document.getElementById('cancelEdit').addEventListener('click', () => this.cancelEdit());

        // Filtros y búsqueda
        document.getElementById('filterStatus').addEventListener('change', () => this.filterServices());
        document.getElementById('searchServices').addEventListener('input', (e) => this.debounce(() => this.filterServices(), 300)(e));

        // Exportar
        document.getElementById('export-services').addEventListener('click', () => this.exportServices());

        // Redes sociales interactivas
        document.querySelectorAll('.social-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(link.href, '_blank');
                this.showNotification('Abriendo red social...', 'info');
            });
        });

        // Animación en hover para elementos interactivos
        document.querySelectorAll('.stat-card, .action-btn, .service-category').forEach(el => {
            el.addEventListener('mouseenter', () => el.style.transform = 'scale(1.02)');
            el.addEventListener('mouseleave', () => el.style.transform = 'scale(1)');
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    navigate(e) {
        e.preventDefault();
        const targetSection = e.currentTarget.dataset.section;
        
        // Actualizar navegación activa con animación
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Animación de fade out/in para secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.classList.remove('active');
        });
        
        setTimeout(() => {
            document.getElementById(targetSection).classList.add('active');
            document.getElementById(targetSection).style.opacity = '1';
            document.getElementById(targetSection).style.transform = 'translateY(0)';
        }, 300);
        
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

    // Dashboard con interactividad
    renderDashboard() {
        this.updateDashboardStats();
        this.updateCharts();
        // Añadir click events a stats cards
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showNotification('Redirigiendo a detalles...', 'info');
                // Simular navegación a sección específica
            });
        });
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
        return Math.floor(Math.random() * 30) + 15;
    }

    // Servicios CRUD con más interactividad
    renderServices() {
        this.renderServicesTable();
        document.getElementById('servicesCount').textContent = `(${this.services.length})`;
    }

    showServiceForm() {
        const panel = document.getElementById('crud-panel');
        panel.style.display = 'block';
        panel.style.animation = 'slideInUp 0.5s ease-out';
        document.querySelector('.table-container').style.opacity = '0.5';
        document.getElementById('add-new-service').style.display = 'none';
        document.getElementById('serviceForm').reset();
        document.getElementById('saveButtonText').textContent = 'Crear Servicio';
        this.editingService = null;
        panel.scrollIntoView({ behavior: 'smooth' });
    }

    hideServiceForm() {
        const panel = document.getElementById('crud-panel');
        panel.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            panel.style.display = 'none';
            document.querySelector('.table-container').style.opacity = '1';
            document.getElementById('add-new-service').style.display = 'inline-flex';
        }, 300);
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
            this.updateCharts();
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
            
            this.showServiceForm();
        }
    }

    deleteService(id) {
        if (confirm('¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer.')) {
            this.services = this.services.filter(s => s.id !== id);
            this.saveServices();
            this.renderServicesTable();
            this.updateDashboardStats();
            this.updateCharts();
            this.showNotification('Servicio eliminado correctamente', 'success');
        }
    }

    renderServicesTable() {
        const tbody = document.getElementById('servicesTableBody');
        const filteredServices = this.filterServicesData();
        
        tbody.innerHTML = filteredServices.map(service => `
            <tr onclick="app.editService(${service.id})" style="cursor: pointer;">
                <td>${service.id}</td>
                <td class="service-name">${service.name}</td>
                <td><span class="service-category category-${service.category}" onclick="event.stopPropagation();">${this.getCategoryLabel(service.category)}</span></td>
                <td class="price">$${service.price.toLocaleString()}</td>
                <td><span class="service-status status-${service.status}" onclick="event.stopPropagation();">${this.getStatusLabel(service.status)}</span></td>
                <td class="actions">
                    <button class="action-btn edit" onclick="event.stopPropagation(); app.editService(${service.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="action-btn delete" onclick="event.stopPropagation(); app.deleteService(${service.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Añadir interactividad a filas
        tbody.querySelectorAll('tr').forEach(row => {
            row.addEventListener('mouseenter', () => row.style.background = 'rgba(255, 69, 0, 0.05)');
            row.addEventListener('mouseleave', () => row.style.background = '');
        });
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
        document.getElementById('searchServices').addEventListener('input', this.debounce(() => this.renderServicesTable(), 300));
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
        this.updateCharts();
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

    loadInitialData() {
        this.updateDashboardStats();
        this.renderServicesTable();
        this.setupCharts();
    }

    // Charts
    setupCharts() {
        this.createServicesChart();
        this.createCategoryChart();
    }

    createServicesChart() {
        const ctx = document.getElementById('servicesChart');
        if (ctx && Chart) {
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
                        fill: true,
                        pointBackgroundColor: '#ffd700',
                        pointBorderColor: '#1a2a44',
                        pointHoverBackgroundColor: '#ff4500',
                        pointHoverBorderColor: '#ffd700'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(26, 42, 68, 0.1)' } },
                        x: { grid: { color: 'rgba(26, 42, 68, 0.1)' } }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        }
    }

    createCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (ctx && Chart) {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Web', 'Móvil', 'Consultoría', 'Datos'],
                    datasets: [{
                        data: [35, 28, 22, 15],
                        backgroundColor: ['#1a2a44', '#ff4500', '#ffd700', '#007bff'],
                        borderWidth: 2,
                        borderColor: '#fff',
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: { 
                                color: '#1a2a44',
                                font: { family: 'Oswald', size: 12 },
                                padding: 20
                            }
                        }
                    },
                    animation: {
                        animateRotate: true,
                        duration: 2000
                    }
                }
            });
        }
    }

    updateCharts() {
        // Re-render charts if needed
        this.createServicesChart();
        this.createCategoryChart();
    }

    // Notificaciones con más interactividad
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove();">×</button>
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
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        } else if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
        } else {
            notification.style.background = 'linear-gradient(135deg, #17a2b8, #138496)';
        }
        
        document.body.appendChild(notification);
        
        // Interactividad: Click para cerrar
        notification.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') notification.remove();
        });
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.4s ease-in forwards';
        }, 4000);
    }

    // Otras secciones
    renderClients() {
        // Implementar CRUD para clientes
        console.log('Renderizando clientes...');
    }

    renderSettings() {
        // Implementar configuración
        console.log('Renderizando configuración...');
    }
}

// Inicialización
const app = new SportAlgorithmusApp();

// Estilos adicionales para notificaciones y SVG
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
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
    .service-category, .service-status {
        padding: 0.4em 1em;
        border-radius: 20px;
        font-size: 0.8em;
        font-weight: 700;
        text-transform: uppercase;
        display: inline-block;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    .service-category:hover, .service-status:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .category-desarrollo-web { background: linear-gradient(135deg, #1a2a44, #2e4057); color: #ffd700; }
    .category-desarrollo-movil { background: linear-gradient(135deg, #ff4500, #e63946); color: #fff; }
    .category-consultoria { background: linear-gradient(135deg, #ffd700, #ffed4e); color: #1a2a44; }
    .category-analisis-datos { background: linear-gradient(135deg, #007bff, #0056b3); color: #fff; }
    .category-ux-ui { background: linear-gradient(135deg, #28a745, #20c997); color: #fff; }
    .category-mantenimiento { background: linear-gradient(135deg, #6c757d, #495057); color: #fff; }
    .status-disponible { background: linear-gradient(135deg, #28a745, #20c997); color: #fff; }
    .status-en-proceso { background: linear-gradient(135deg, #ffc107, #e0a800); color: #212529; }
    .status-completado { background: linear-gradient(135deg, #17a2b8, #138496); color: #fff; }
    .status-pausado { background: linear-gradient(135deg, #6c757d, #495057); color: #fff; }
    .action-btn {
        padding: 0.6em 1.2em;
        border: none;
        border-radius: 8px;
        font-size: 0.85em;
        font-weight: 700;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-right: 0.5em;
        display: inline-flex;
        align-items: center;
        gap: 0.5em;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .action-btn.edit {
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: #fff;
    }
    .action-btn.edit:hover {
        background: linear-gradient(135deg, #0056b3, #004085);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }
    .action-btn.delete {
        background: linear-gradient(135deg, #dc3545, #c82333);
        color: #fff;
    }
    .action-btn.delete:hover {
        background: linear-gradient(135deg, #c82333, #a71e2a);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
    }
`;
document.head.appendChild(additionalStyles);

// Función debounce para búsqueda
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Inicialización global
const app = new SportAlgorithmusApp();
