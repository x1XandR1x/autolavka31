document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
        loadProducts(category);
        setupFilters(category);
    }
});

function loadProducts(category, filters = {}) {
    const productsGrid = document.getElementById('products-grid');
    const categoryTitle = document.getElementById('category-title');
    
    // Устанавливаем заголовок категории
    if (categoryTitle) {
        categoryTitle.textContent = category === 'autoparts' ? 'Автозапчасти' : 'Масла';
    }
    
    // Получаем отфильтрованные товары
    const products = productManager.getProducts(category, filters);
    
    // Очищаем сетку товаров
    productsGrid.innerHTML = '';
    
    // Добавляем товары в сетку
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const imageHtml = product.image ? 
        `<img src="${product.image}" alt="${product.name}">` :
        `<div class="no-image">Изображение отсутствует</div>`;
    
    card.innerHTML = `
        <div class="product-image">
            ${imageHtml}
        </div>
        <div class="product-info">
            <h4>${product.name}</h4>
            <p>${product.description}</p>
            <div class="product-price">${product.price} руб.</div>
            <button class="add-to-cart" onclick="addToCart('${product.id}')">
                Добавить в корзину
            </button>
        </div>
    `;
    
    return card;
}

function setupFilters(category) {
    const autopartsFilters = document.getElementById('autoparts-filters');
    const oilsFilters = document.getElementById('oils-filters');
    
    // Показываем соответствующие фильтры
    if (category === 'autoparts') {
        autopartsFilters.style.display = 'flex';
        oilsFilters.style.display = 'none';
        setupAutopartsFilters();
    } else if (category === 'oils') {
        autopartsFilters.style.display = 'none';
        oilsFilters.style.display = 'flex';
        setupOilsFilters();
    }
}

function setupAutopartsFilters() {
    const brandSelect = document.getElementById('brand-select');
    const modelSelect = document.getElementById('model-select');
    
    // Получаем уникальные марки
    const brands = [...new Set(productManager.getProducts('autoparts').map(p => p.brand))];
    
    // Заполняем select марками
    brandSelect.innerHTML = '<option value="">Выберите марку</option>';
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });
    
    // Обработчик изменения марки
    brandSelect.addEventListener('change', function() {
        const selectedBrand = this.value;
        
        // Получаем уникальные модели для выбранной марки
        const models = [...new Set(
            productManager.getProducts('autoparts')
                .filter(p => p.brand === selectedBrand)
                .map(p => p.model)
        )];
        
        // Заполняем select моделями
        modelSelect.innerHTML = '<option value="">Выберите модель</option>';
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
        
        applyFilters();
    });
    
    modelSelect.addEventListener('change', applyFilters);
}

function setupOilsFilters() {
    const oilTypeSelect = document.getElementById('oil-type-select');
    oilTypeSelect.addEventListener('change', applyFilters);
}

function applyFilters() {
    const category = new URLSearchParams(window.location.search).get('category');
    const filters = {};
    
    if (category === 'autoparts') {
        const brand = document.getElementById('brand-select').value;
        const model = document.getElementById('model-select').value;
        
        if (brand) filters.brand = brand;
        if (model) filters.model = model;
    } else if (category === 'oils') {
        const oilType = document.getElementById('oil-type-select').value;
        if (oilType) filters.oilType = oilType;
    }
    
    loadProducts(category, filters);
}

function addToCart(productId) {
    cartManager.addToCart(productId, 1);
    alert('Товар добавлен в корзину!');
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('itemscope', '');
    card.setAttribute('itemtype', 'https://schema.org/Product');
    
    const imageHtml = product.image ? 
        `<img src="${product.image}" alt="${product.name}" itemprop="image">` :
        `<div class="no-image">Изображение отсутствует</div>`;
    
    card.innerHTML = `
        <div class="product-image">
            ${imageHtml}
        </div>
        <div class="product-info">
            <h4 itemprop="name">${product.name}</h4>
            <p itemprop="description">${product.description}</p>
            <div class="product-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                <span itemprop="price">${product.price}</span>
                <span itemprop="priceCurrency" content="RUB">руб.</span>
            </div>
            <button class="add-to-cart" onclick="addToCart('${product.id}')">
                Добавить в корзину
            </button>
        </div>
    `;
    
    return card;
}