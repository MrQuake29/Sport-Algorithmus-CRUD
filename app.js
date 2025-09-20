// app.js - CRUD SportAlgorithmus
class ServiceManager {
    constructor() {
        this.services = JSON.parse(localStorage.getItem('sportalgorithmus_services')) || [];
        this.editingIndex = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderDashboard();
        this.renderServices();
        this.updateDashboardStats();
    }

    bindEvents() {
        const form = document.getElementById('service-form');
        const addBtn = document.getElementById('add-service-btn');
        const cancelBtn = document.getElementById('cancel-edit');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        addBtn.addEventListener('click', () => this.resetForm());
        cancelBtn.addEventListener('click', () => this.resetForm());
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('service-name').value.trim(),
            type: document.getElementById('service-type').value,
            price: parseFloat(document.getElementById('service-price').value),
            description: document.getElementById('service-description').value.trim(),
            duration: parseInt(document.getElementById('service-duration').value) || 0,
            status: document.getElementById('service-status').value,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (!this.validateForm(formData)) return;

        if (this.editingIndex !== null) {
            this.services[this.editingIndex] = { ...formData, id: this.services[this.editingIndex].id };
            this.editingIndex = null;
            this.showNotification('Servicio actualizado exitosamente', 'success');
        } else {
            const newService = { ...formData, id: Date.now() };
            this.services.push(newService);
            this.showNotification('Servicio creado exitosamente', 'success');
        }

        this.saveData();
        this.resetForm();
        this.renderServices();
        this.updateDashboardStats();
    }

    validateForm(data) {
        if (!data.name || !data.type || !data.price || data.price <= 0) {
            this.showNotification('Por favor completa todos los campos correctamente', 'error');
            return false;
        }
        return true;
    }

    resetForm() {
        document.getElementById('service-form').reset();
        document.getElementById('service-id').value = '';
        this.editingIndex = null;
    }

    editService(index) {
        const service = this.services[index];
        document.getElementById('service-name').value = service.name;
        document.getElementById('service-type').value = service.type;
        document.getElementById('service-price').value = service.price;
        document.getElementById('service-description').value = service.description;
        document.getElementById('service-duration').value = service.duration;
        document.getElementById('service-status').value = service.status;
        this.editingIndex = index;
        document.getElementById('service-form').scrollIntoView({ behavior: 'smooth' });
    }

    deleteService(index) {
        if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
            this.services.splice(index, 1);
            this.saveData();
            this.renderServices();
            this.updateDashboardStats();
            this.showNotification('Servicio eliminado exitosamente', 'success');
        }
    }

    renderServices() {
        const tbody = document.getElementById('services-table-body');
        tbody.innerHTML = '';

        this.services.forEach((service, index) => {
            const row = document.createElement('tr');
            row.className = service.status === 'activo' ? 'status-active' : 'status-inactive';
            
            row.innerHTML = `
                <td>${service.id}</td>
                <td>${service.name}</td>
                <td>
                    <span class="service-type ${service.type}">${this.getServiceTypeLabel(service.type)}</span>
                </td>
                <td>$${service.price.toLocaleString()}</td>
                <td>
                    <span class="status-badge ${service.status}">${this.getStatusLabel(service.status)}</span>
                </td>
                <td>
                    <button class="action-btn edit" onclick="serviceManager.editService(${index})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="action-btn delete" onclick="serviceManager.deleteService(${index})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    getServiceTypeLabel(type) {
        const types = {
            'desarrollo-web': 'Web Development',
            'desarrollo-movil': 'Mobile Development',
            'consultoria': 'Consulting',
            'mantenimiento': 'Maintenance',
            'analisis-datos': 'Data Analysis',
            'ux-ui': 'UX/UI Design'
        };
        return types[type] || type;
    }

    getStatusLabel(status) {
        const labels = {
            'activo': 'Activo',
            'inactivo': 'Inactivo',
            'en-proceso': 'En Proceso'
        };
        return labels[status] || status;
    }

    renderDashboard() {
        // Dashboard rendering (puede expandirse)
        document.getElementById('dashboard').classList.add('active');
    }

    updateDashboardStats() {
        const totalServices = this.services.length;
        const activeServices = this.services.filter(s => s.status === 'activo').length;
        const totalRevenue = this.services.reduce((sum, s) => sum + s.price, 0);
        const lastUpdate = new Date().toLocaleDateString('es-CO');

        document.getElementById('total-services').textContent = totalServices;
        document.getElementById('active-services').textContent = activeServices;
        document.getElementById('total-revenue').textContent = `$${totalRevenue.toLocaleString()}`;
        document.getElementById('last-update').textContent = lastUpdate;
    }

    saveData() {
        localStorage.setItem('sportalgorithmus_services', JSON.stringify(this.services));
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1em 1.5em;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        if (type === 'success') notification.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        if (type === 'error') notification.style.background = 'linear-gradient(135deg, #dc3545, #e74c3c)';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Inicialización
const serviceManager = new ServiceManager();

// Agregar estilos para animaciones de notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .service-type {
        padding: 0.3em 0.8em;
        border-radius: 15px;
        font-size: 0.8em;
        font-weight: 700;
        text-transform: uppercase;
    }
    .service-type.desarrollo-web { background: #1a2a44; color: #ffd700; }
    .service-type.desarrollo-movil { background: #ff4500; color: #fff; }
    .service-type.consultoria { background: #ffd700; color: #1a2a44; }
    .service-type.mantenimiento { background: #6c757d; color: #fff; }
    .service-type.analisis-datos { background: #007bff; color: #fff; }
    .service-type.ux-ui { background: #28a745; color: #fff; }
    .status-badge {
        padding: 0.3em 0.8em;
        border-radius: 20px;
        font-size: 0.8em;
        font-weight: 700;
    }
    .status-badge.activo { background: #28a745; color: #fff; }
    .status-badge.inactivo { background: #6c757d; color: #fff; }
    .status-badge.en-proceso { background: #ffc107; color: #212529; }
`;
document.head.appendChild(style);
