let editingProductId = null;

// Добавьте эту функцию в начало файла admin.js
function updateAdminStats() {
    // Статистика пользователей
    const usersCount = authManager.getAllUsers().length;
    document.getElementById('users-count').textContent = usersCount;
    
    // Статистика товаров
    const productsCount = productManager.products.length;
    document.getElementById('products-count').textContent = productsCount;
    
    // Статистика заказов и выручки
    const allOrders = [];
    let totalRevenue = 0;
    Object.values(cartManager.getAllOrders()).forEach(userOrders => {
        allOrders.push(...userOrders);
        userOrders.forEach(order => {
            totalRevenue += order.total;
        });
    });
    
    document.getElementById('orders-count').textContent = allOrders.length;
    document.getElementById('revenue-count').textContent = totalRevenue.toLocaleString();
    
    // Имя администратора
    const adminName = document.getElementById('admin-user-name');
    if (adminName && authManager.currentUser) {
        adminName.textContent = authManager.currentUser.name;
    }
}

// Обновите функцию loadUsers
function loadUsers() {
    const usersList = document.getElementById('users-list');
    const users = authManager.getAllUsers();
    
    usersList.innerHTML = '';
    
    if (users.length === 0) {
        usersList.innerHTML = '<div class="user-item"><div class="user-info"><p>Пользователи не найдены</p></div></div>';
        return;
    }
    
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        
        const roleClass = `role-${user.role}`;
        const roleNames = {
            'client': 'Клиент',
            'employee': 'Сотрудник', 
            'admin': 'Администратор',
            'director': 'Директор'
        };
        
        userItem.innerHTML = `
            <div class="user-info">
                <strong>${user.name}</strong>
                <span>📧 ${user.email}</span>
                <span>📅 Зарегистрирован: ${new Date(user.registrationDate).toLocaleDateString('ru-RU')}</span>
            </div>
            <div class="user-role">
                <span class="role-badge ${roleClass}">${roleNames[user.role] || user.role}</span>
                ${authManager.currentUser.role === 'director' ? 
                    `<select onchange="updateUserRole('${user.id}', this.value)">
                        <option value="client" ${user.role === 'client' ? 'selected' : ''}>Клиент</option>
                        <option value="employee" ${user.role === 'employee' ? 'selected' : ''}>Сотрудник</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Администратор</option>
                        <option value="director" ${user.role === 'director' ? 'selected' : ''}>Директор</option>
                    </select>` :
                    ''
                }
            </div>
        `;
        usersList.appendChild(userItem);
    });
    
    updateAdminStats();
}

// Обновите функцию loadOrdersForAdmin
function loadOrdersForAdmin() {
    const ordersList = document.getElementById('orders-list-admin');
    const allOrders = [];
    
    const ordersData = cartManager.getAllOrders();
    Object.values(ordersData).forEach(userOrders => {
        allOrders.push(...userOrders);
    });
    
    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    ordersList.innerHTML = '';
    
    if (allOrders.length === 0) {
        ordersList.innerHTML = '<div class="order-item-admin"><div class="user-info"><p>Заказов нет</p></div></div>';
        return;
    }
    
    allOrders.forEach(order => {
        const user = authManager.users.find(u => u.id === order.userId);
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item-admin';
        orderElement.innerHTML = `
            <div class="order-header-admin">
                <div>
                    <strong>🛒 Заказ #${order.id}</strong>
                    <span style="display: block; color: var(--gray); font-size: 0.9rem;">
                        👤 ${user ? user.name : 'Неизвестно'} (${user ? user.email : 'N/A'})
                    </span>
                </div>
                <div style="text-align: right;">
                    <div style="color: var(--dark-blue); font-weight: bold; font-size: 1.2rem;">
                        ${order.total} руб.
                    </div>
                    <div style="color: var(--gray); font-size: 0.9rem;">
                        📅 ${new Date(order.date).toLocaleDateString('ru-RU')}
                    </div>
                </div>
            </div>
            <div class="order-items-admin">
                ${order.items.map(item => `
                    <div class="order-product-admin">
                        <span>${item.product.name}</span>
                        <span>${item.quantity} × ${item.product.price} руб. = ${item.quantity * item.product.price} руб.</span>
                    </div>
                `).join('')}
            </div>
        `;
        ordersList.appendChild(orderElement);
    });
    
    updateAdminStats();
}

document.addEventListener('DOMContentLoaded', function() {
    if (!authManager.currentUser) {
        window.location.href = 'auth.html';
        return;
    }
    
    if (authManager.currentUser.role !== 'admin' && authManager.currentUser.role !== 'director') {
        alert('У вас нет доступа к админ-панели');
        window.location.href = 'index.html';
        return;
    }
    
    loadUsers();
    loadProductsForAdmin();
    loadOrdersForAdmin();
    setupProductForm();
});

function switchAdminTab(tabName) {
    // Скрыть все вкладки
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убрать активный класс со всех кнопок
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показать нужную вкладку и активировать кнопку
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

function loadUsers() {
    const usersList = document.getElementById('users-list');
    const users = authManager.getAllUsers();
    
    usersList.innerHTML = '';
    
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div class="user-info">
                <strong>${user.name}</strong>
                <span>${user.email}</span>
                <span>Роль: ${user.role}</span>
                <span>Зарегистрирован: ${new Date(user.registrationDate).toLocaleDateString()}</span>
            </div>
            <div class="user-role">
                ${authManager.currentUser.role === 'director' ? 
                    `<select onchange="updateUserRole('${user.id}', this.value)">
                        <option value="client" ${user.role === 'client' ? 'selected' : ''}>Клиент</option>
                        <option value="employee" ${user.role === 'employee' ? 'selected' : ''}>Сотрудник</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Администратор</option>
                        <option value="director" ${user.role === 'director' ? 'selected' : ''}>Директор</option>
                    </select>` :
                    `<span>${user.role}</span>`
                }
            </div>
        `;
        usersList.appendChild(userItem);
    });
}

function updateUserRole(userId, newRole) {
    if (authManager.currentUser.role !== 'director') {
        alert('Только директор может изменять роли пользователей');
        return;
    }
    
    if (authManager.updateUserRole(userId, newRole)) {
        alert('Роль пользователя обновлена');
        loadUsers();
    }
}

function loadProductsForAdmin() {
    const productsList = document.getElementById('admin-products-list');
    const products = productManager.products;
    
    productsList.innerHTML = '';
    
    // Проверяем права для управления товарами
    const canManageProducts = authManager.currentUser.role === 'director';
    
    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <div class="product-info">
                <strong>${product.name}</strong>
                <span>${product.price} руб.</span>
                <span>Категория: ${product.category === 'autoparts' ? 'Автозапчасти' : 'Масла'}</span>
                ${product.category === 'autoparts' ? `<span>Марка: ${product.brand}, Модель: ${product.model}</span>` : ''}
                ${product.category === 'oils' ? `<span>Тип: ${getOilTypeName(product.oilType)}</span>` : ''}
            </div>
            <div class="admin-actions">
                ${canManageProducts ? `
                    <button class="btn-edit" onclick="editProduct('${product.id}')">Редактировать</button>
                    <button class="btn-delete" onclick="deleteProduct('${product.id}')">Удалить</button>
                ` : '<span>Только для директора</span>'}
            </div>
        `;
        productsList.appendChild(productItem);
    });
}

function getOilTypeName(oilType) {
    const types = {
        'engine': 'Для ДВС',
        'automatic': 'Для АКПП', 
        'manual': 'Для МКПП'
    };
    return types[oilType] || oilType;
}

function setupProductForm() {
    const categorySelect = document.getElementById('product-category');
    const autopartsFields = document.getElementById('autoparts-fields');
    const oilsFields = document.getElementById('oils-fields');
    
    categorySelect.addEventListener('change', function() {
        if (this.value === 'autoparts') {
            autopartsFields.style.display = 'block';
            oilsFields.style.display = 'none';
        } else {
            autopartsFields.style.display = 'none';
            oilsFields.style.display = 'block';
        }
    });
    
    // Модальное окно
    const modal = document.getElementById('product-modal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        editingProductId = null;
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            editingProductId = null;
        }
    });
    
    // Форма товара
    document.getElementById('product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
}

function showProductForm() {
    if (authManager.currentUser.role !== 'director') {
        alert('Только директор может управлять товарами');
        return;
    }
    
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    
    modalTitle.textContent = 'Добавить товар';
    editingProductId = null;
    
    // Сброс формы
    document.getElementById('product-form').reset();
    document.getElementById('autoparts-fields').style.display = 'none';
    document.getElementById('oils-fields').style.display = 'none';
    
    modal.style.display = 'block';
}

function editProduct(productId) {
    if (authManager.currentUser.role !== 'director') {
        alert('Только директор может редактировать товары');
        return;
    }
    
    const product = productManager.getProductById(productId);
    if (!product) return;
    
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    
    modalTitle.textContent = 'Редактировать товар';
    editingProductId = productId;
    
    // Заполняем форму данными товара
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category;
    
    // Триггерим изменение категории
    const event = new Event('change');
    document.getElementById('product-category').dispatchEvent(event);
    
    if (product.category === 'autoparts') {
        document.getElementById('product-brand').value = product.brand || '';
        document.getElementById('product-model').value = product.model || '';
    } else {
        document.getElementById('product-oil-type').value = product.oilType || 'engine';
    }
    
    modal.style.display = 'block';
}

function saveProduct() {
    if (authManager.currentUser.role !== 'director') {
        alert('Только директор может сохранять товары');
        return;
    }
    
    const formData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        category: document.getElementById('product-category').value
    };
    
    if (formData.category === 'autoparts') {
        formData.brand = document.getElementById('product-brand').value;
        formData.model = document.getElementById('product-model').value;
    } else {
        formData.oilType = document.getElementById('product-oil-type').value;
    }
    
    let result;
    if (editingProductId) {
        result = productManager.updateProduct(editingProductId, formData);
        alert('Товар обновлен');
    } else {
        result = productManager.addProduct(formData);
        alert('Товар добавлен');
    }
    
    document.getElementById('product-modal').style.display = 'none';
    loadProductsForAdmin();
    editingProductId = null;
}

function deleteProduct(productId) {
    if (authManager.currentUser.role !== 'director') {
        alert('Только директор может удалять товары');
        return;
    }
    
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
        productManager.deleteProduct(productId);
        loadProductsForAdmin();
        alert('Товар удален');
    }
}

function loadOrdersForAdmin() {
    const ordersList = document.getElementById('orders-list-admin');
    const allOrders = [];
    
    // Собираем все заказы из всех пользователей
    const ordersData = cartManager.getAllOrders();
    Object.values(ordersData).forEach(userOrders => {
        allOrders.push(...userOrders);
    });
    
    // Сортируем по дате (новые сначала)
    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    ordersList.innerHTML = '';
    
    if (allOrders.length === 0) {
        ordersList.innerHTML = '<p>Заказов нет</p>';
        return;
    }
    
    allOrders.forEach(order => {
        const user = authManager.users.find(u => u.id === order.userId);
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.innerHTML = `
            <div class="order-header">
                <strong>Заказ #${order.id}</strong>
                <span>Пользователь: ${user ? user.name : 'Неизвестно'} (${user ? user.email : 'N/A'})</span>
                <span>${new Date(order.date).toLocaleDateString()}</span>
                <span>${order.total} руб.</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-product">
                        ${item.product.name} - ${item.quantity} × ${item.product.price} руб. = ${item.quantity * item.product.price} руб.
                    </div>
                `).join('')}
            </div>
        `;
        ordersList.appendChild(orderElement);
    });
}