// Инициализация AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100,
    easing: 'ease-in-out'
});

// Навигация с изменением при скролле
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Кнопка назад вверх
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Плавный скролл для якорей
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Закрытие мобильного меню
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }
        }
    });
});

// Обработка формы
document.getElementById('applyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Получаем данные формы
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        specialty: document.getElementById('specialty').value
    };
    
    // Валидация
    if (!formData.name || !formData.phone || !formData.email || !formData.specialty) {
        alert('Խնդրում ենք լրացնել բոլոր դաշտերը');
        return;
    }
    
    if (!isValidEmail(formData.email)) {
        alert('Խնդրում ենք մուտքագրել վավեր էլ. փոստի հասցե');
        return;
    }
    
    // Здесь можно отправить данные на сервер
    console.log('Form submitted:', formData);
    
    // Показываем сообщение об успехе
    alert('Շնորհակալություն դիմելու համար: Մենք կկապնվենք Ձեզ հետ մոտակա ժամերին:');
    
    // Закрываем модальное окно
    const modal = bootstrap.Modal.getInstance(document.getElementById('applyModal'));
    modal.hide();
    
    // Очищаем форму
    this.reset();
});

// Валидация email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Параллакс эффект для hero секции
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scrolled = window.scrollY;
    
    if (scrolled < hero.offsetHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Анимация цифр в статистике при скролле
const statsSection = document.querySelector('.stats-section');
const statNumbers = document.querySelectorAll('.stat-number');
let animated = false;

window.addEventListener('scroll', () => {
    if (!statsSection || animated) return;
    
    const sectionPos = statsSection.getBoundingClientRect().top;
    const screenPos = window.innerHeight / 1.3;
    
    if (sectionPos < screenPos) {
        animateNumbers();
        animated = true;
    }
});

function animateNumbers() {
    statNumbers.forEach(stat => {
        const targetNumber = parseInt(stat.textContent);
        if (isNaN(targetNumber)) return;
        
        let currentNumber = 0;
        const increment = targetNumber / 50;
        const timer = setInterval(() => {
            currentNumber += increment;
            if (currentNumber >= targetNumber) {
                stat.textContent = targetNumber + (stat.textContent.includes('+') ? '+' : '');
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(currentNumber) + (stat.textContent.includes('+') ? '+' : '');
            }
        }, 20);
    });
}

// Добавление активного класса для навигации
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const navHeight = document.querySelector('.navbar').offsetHeight;
        
        if (window.scrollY >= sectionTop - navHeight - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Инициализация тултипов Bootstrap
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});
