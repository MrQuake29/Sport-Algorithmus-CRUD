let services = JSON.parse(localStorage.getItem('services')) || [];
let editingId = null;

const form = document.getElementById('service-form');
const tableBody = document.querySelector('#service-table tbody');

function renderTable() {
    tableBody.innerHTML = '';
    services.forEach((service, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${service.name}</td>
            <td>${service.description}</td>
            <td>$${service.price}</td>
            <td>
                <button onclick="editService(${index})">Editar</button>
                <button onclick="deleteService(${index})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const price = parseFloat(document.getElementById('price').value);

    if (editingId !== null) {
        services[editingId] = { name, description, price };
        editingId = null;
    } else {
        services.push({ name, description, price });
    }

    localStorage.setItem('services', JSON.stringify(services));
    form.reset();
    renderTable();
});

function editService(index) {
    const service = services[index];
    document.getElementById('name').value = service.name;
    document.getElementById('description').value = service.description;
    document.getElementById('price').value = service.price;
    editingId = index;
}

function deleteService(index) {
    services.splice(index, 1);
    localStorage.setItem('services', JSON.stringify(services));
    renderTable();
}

// Inicializar tabla
renderTable();
