document.addEventListener('DOMContentLoaded', function() {
    if (!authManager.currentUser) {
        window.location.href = 'auth.html';
        return;
    }
    
    loadCart();
    loadOrderHistory();
});

function loadCart() {
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    const items = cartManager.getCart();
    
    if (items.length === 0) {
        cartItems.innerHTML = '<p>Корзина пуста</p>';
        totalPrice.textContent = '0';
        checkoutBtn.disabled = true;
        return;
    }
    
    cartItems.innerHTML = '';
    items.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="item-info">
                <h4>${item.product.name}</h4>
                <p>${item.product.price} руб. × ${item.quantity}</p>
            </div>
            <div class="item-total">
                <strong>${item.product.price * item.quantity} руб.</strong>
                <button onclick="removeFromCart('${item.product.id}')">Удалить</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    totalPrice.textContent = cartManager.getTotalPrice();
    checkoutBtn.disabled = false;
}

function removeFromCart(productId) {
    cartManager.removeFromCart(productId);
    loadCart();
}

document.getElementById('checkout-btn')?.addEventListener('click', function() {
    const order = cartManager.checkout();
    if (order) {
        alert(`Заказ оформлен! Номер заказа: ${order.id}\nСумма: ${order.total} руб.`);
        loadCart();
        loadOrderHistory();
    }
});

function loadOrderHistory() {
    const orderHistory = document.getElementById('order-history');
    const ordersList = document.getElementById('orders-list');
    
    const orders = cartManager.getUserOrders();
    
    if (orders.length === 0) {
        orderHistory.style.display = 'none';
        return;
    }
    
    orderHistory.style.display = 'block';
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.innerHTML = `
            <div class="order-header">
                <strong>Заказ #${order.id}</strong>
                <span>${new Date(order.date).toLocaleDateString()}</span>
                <span>${order.total} руб.</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-product">
                        ${item.product.name} - ${item.quantity} × ${item.product.price} руб.
                    </div>
                `).join('')}
            </div>
        `;
        ordersList.appendChild(orderElement);
    });
}