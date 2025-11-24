// Основной JavaScript файл
function setActiveMenu() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav ul li a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || 
            (currentPage === 'index.html' && linkHref === 'index.html') ||
            (currentPage.includes('products.html') && linkHref.includes('products.html'))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Вызовите функцию после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    setActiveMenu();
});

class AuthManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.users = JSON.parse(localStorage.getItem('users')) || this.getInitialUsers();
        this.saveUsers();
        this.init();
    }

    getInitialUsers() {
        return [
            {
                id: '1',
                name: 'Директор',
                email: 'admin@autolavka.ru',
                password: 'admin123',
                role: 'director',
                registrationDate: new Date().toISOString()
            },
            {
                id: '2', 
                name: 'Менеджер',
                email: 'manager@autolavka.ru',
                password: 'manager123',
                role: 'admin',
                registrationDate: new Date().toISOString()
            }
        ];
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    init() {
        this.updateAuthUI();
    }

    register(userData) {
        const existingUser = this.users.find(user => user.email === userData.email);
        if (existingUser) {
            throw new Error('Пользователь с таким email уже существует');
        }

        const newUser = {
            id: Date.now().toString(),
            ...userData,
            role: 'client',
            registrationDate: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();
        
        this.login(userData.email, userData.password);
        return newUser;
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('Неверный email или пароль');
        }

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.updateAuthUI();
        return user;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateAuthUI();
        window.location.href = 'index.html';
    }

updateAuthUI() {
    const authSection = document.getElementById('auth-section');
    const loginBtn = document.getElementById('login-btn');
    const userInfo = document.getElementById('user-info');

    if (this.currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'inline';
            userInfo.innerHTML = `
                <div class="user-welcome">
                    ${this.currentUser.name} (${this.getRoleName(this.currentUser.role)})
                </div>
                <button onclick="authManager.logout()">Выйти</button>
            `;
        }

        // Показываем ссылку на админку для администраторов и директоров
        if ((this.currentUser.role === 'admin' || this.currentUser.role === 'director') && !document.querySelector('#admin-link')) {
            const nav = document.querySelector('nav ul');
            if (nav) {
                const li = document.createElement('li');
                li.id = 'admin-link';
                li.innerHTML = '<a href="admin.html">Админ-панель</a>';
                nav.appendChild(li);
            }
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline';
        if (userInfo) userInfo.style.display = 'none';
        
        // Удаляем ссылку на админку если есть
        const adminLink = document.querySelector('#admin-link');
        if (adminLink) {
            adminLink.remove();
        }
    }
}


getRoleName(role) {
    const roleNames = {
        'client': 'Клиент',
        'employee': 'Сотрудник',
        'admin': 'Администратор', 
        'director': 'Директор'
    };
    return roleNames[role] || role;
}

    updateUserRole(userId, newRole) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.role = newRole;
            this.saveUsers();
            
            // Если обновляем текущего пользователя
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser.role = newRole;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.updateAuthUI();
            }
            return true;
        }
        return false;
    }

    getAllUsers() {
        return this.users;
    }
}

// Инициализация менеджера авторизации
const authManager = new AuthManager();

// База данных товаров
class ProductManager {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || this.getInitialProducts();
        this.saveProducts();
    }

    getInitialProducts() {
        return [
            {
                id: '1',
                name: 'Тормозные колодки Toyota',
                description: 'Качественные тормозные колодки для Toyota Camry',
                price: 2500,
                category: 'autoparts',
                brand: 'Toyota',
                model: 'Camry',
                image: null
            },
            {
                id: '2',
                name: 'Масло моторное 5W-30',
                description: 'Синтетическое моторное масло',
                price: 1800,
                category: 'oils',
                oilType: 'engine',
                image: null
            },
            {
                id: '3',
                name: 'Масло для АКПП',
                description: 'Трансмиссионное масло для автоматических коробок',
                price: 2200,
                category: 'oils',
                oilType: 'automatic',
                image: null
            },
            {
                id: '4',
                name: 'Фильтр воздушный',
                description: 'Воздушный фильтр для Honda Civic',
                price: 1200,
                category: 'autoparts',
                brand: 'Honda',
                model: 'Civic',
                image: null
            }
        ];
    }

    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    getProducts(category = null, filters = {}) {
        let filteredProducts = [...this.products];

        if (category) {
            filteredProducts = filteredProducts.filter(product => product.category === category);
        }

        if (category === 'autoparts') {
            if (filters.brand) {
                filteredProducts = filteredProducts.filter(product => product.brand === filters.brand);
            }
            if (filters.model) {
                filteredProducts = filteredProducts.filter(product => product.model === filters.model);
            }
        }

        if (category === 'oils') {
            if (filters.oilType) {
                filteredProducts = filteredProducts.filter(product => product.oilType === filters.oilType);
            }
        }

        return filteredProducts;
    }

    addProduct(productData) {
        const newProduct = {
            id: Date.now().toString(),
            ...productData
        };
        this.products.push(newProduct);
        this.saveProducts();
        return newProduct;
    }

    updateProduct(productId, productData) {
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...productData };
            this.saveProducts();
            return this.products[index];
        }
        return null;
    }

    deleteProduct(productId) {
        this.products = this.products.filter(p => p.id !== productId);
        this.saveProducts();
    }

    getProductById(productId) {
        return this.products.find(p => p.id === productId);
    }
}

const productManager = new ProductManager();

// Менеджер корзины
class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || {};
        this.orders = JSON.parse(localStorage.getItem('orders')) || {};
    }

    addToCart(productId, quantity = 1) {
        if (!authManager.currentUser) {
            alert('Для добавления товаров в корзину необходимо авторизоваться');
            window.location.href = 'auth.html';
            return;
        }

        const userId = authManager.currentUser.id;
        if (!this.cart[userId]) {
            this.cart[userId] = {};
        }

        if (this.cart[userId][productId]) {
            this.cart[userId][productId] += quantity;
        } else {
            this.cart[userId][productId] = quantity;
        }

        this.saveCart();
        alert('Товар добавлен в корзину!');
    }

    removeFromCart(productId) {
        if (!authManager.currentUser) return;
        
        const userId = authManager.currentUser.id;
        if (this.cart[userId] && this.cart[userId][productId]) {
            delete this.cart[userId][productId];
            this.saveCart();
        }
    }

    getCart() {
        if (!authManager.currentUser) return [];
        
        const userId = authManager.currentUser.id;
        const userCart = this.cart[userId] || {};
        
        return Object.keys(userCart).map(productId => {
            const product = productManager.getProductById(productId);
            return {
                product,
                quantity: userCart[productId]
            };
        }).filter(item => item.product);
    }

    getTotalPrice() {
        const cartItems = this.getCart();
        return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }

    checkout() {
        if (!authManager.currentUser) return null;

        const userId = authManager.currentUser.id;
        const cartItems = this.getCart();
        
        if (cartItems.length === 0) return null;

        const order = {
            id: Date.now().toString(),
            userId: userId,
            items: cartItems,
            total: this.getTotalPrice(),
            date: new Date().toISOString(),
            status: 'completed'
        };

        if (!this.orders[userId]) {
            this.orders[userId] = [];
        }
        this.orders[userId].push(order);

        delete this.cart[userId];

        this.saveCart();
        this.saveOrders();
        
        return order;
    }

    getUserOrders() {
        if (!authManager.currentUser) return [];
        const userId = authManager.currentUser.id;
        return this.orders[userId] || [];
    }

    getAllOrders() {
        return this.orders;
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }
}

const cartManager = new CartManager();