function switchTab(tabName) {
    // Скрыть все формы
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Убрать активный класс со всех кнопок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показать нужную форму и активировать кнопку
    document.getElementById(`${tabName}-form`).classList.add('active');
    event.target.classList.add('active');
}

document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;

    try {
        authManager.login(email, password);
        alert('Успешный вход!');
        window.location.href = 'index.html';
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const inputs = this.querySelectorAll('input');
    const name = inputs[0].value;
    const email = inputs[1].value;
    const password = inputs[2].value;
    const confirmPassword = inputs[3].value;

    if (password !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
    }

    try {
        authManager.register({ name, email, password });
        alert('Регистрация успешна!');
        window.location.href = 'index.html';
    } catch (error) {
        alert(error.message);
    }
});