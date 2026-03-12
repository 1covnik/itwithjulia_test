// Custom cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
});

function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
}
animRing();

document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%,-50%) scale(2)';
        ring.style.transform = 'translate(-50%,-50%) scale(1.5)';
        ring.style.opacity = '0.3';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%,-50%) scale(1)';
        ring.style.transform = 'translate(-50%,-50%) scale(1)';
        ring.style.opacity = '0.6';
    });
});

// Nav scroll
window.addEventListener('scroll', () => {
    document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 50);
});

// Hamburger menu
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav-links');
if (burger) {
    burger.addEventListener('click', () => {
        burger.classList.toggle('open');
        navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            burger.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });
}

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Counter animation
function animateCounter(el, target) {
    let start = 0;
    const duration = 1800;
    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target) + '+';
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            animateCounter(e.target, parseInt(e.target.dataset.target));
            statObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(n => statObserver.observe(n));

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
        const item = q.parentElement;
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
    });
});

// ===================== MODAL WINDOW FOR TARIFFS =====================
const modal = document.getElementById('paymentModal');
const modalContent = document.getElementById('modalContent');
const modalClose = document.querySelector('.modal-close');
const modalOverlay = document.querySelector('.modal-overlay');

// Закрытие модального окна
function closeModal() {
    modal.classList.remove('show');
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Закрытие по клавише Esc
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
    }
});

// Обработчики на кнопки "Оплатить"
document.querySelectorAll('.btn-pay[data-form]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const formType = btn.dataset.form; // 'basic' или 'extended'
        const sourceId = formType === 'basic' ? 'tariff-form-basic' : 'tariff-form-extended';
        const sourceDiv = document.getElementById(sourceId);

        if (!sourceDiv) return;

        // Клонируем форму без скриптов (скрипты не выполняются через innerHTML)
        const clone = sourceDiv.cloneNode(true);

        // Удаляем теги <script> из клона — они не нужны и всё равно не выполнятся
        clone.querySelectorAll('script').forEach(s => s.remove());

        // Вставляем клон в модальное окно
        modalContent.innerHTML = '';
        modalContent.appendChild(clone);

        // Устанавливаем значения, которые скрипты GetCourse задают через window.load
        modalContent.querySelectorAll('.__gc__internal__form__helper').forEach(input => {
            input.value = window.location.href;
        });
        modalContent.querySelectorAll('.__gc__internal__form__helper_ref').forEach(input => {
            input.value = document.referrer;
        });

        modal.classList.add('show');

        // Фокус на первое поле формы
        const firstInput = modalContent.querySelector('input[type="text"]');
        if (firstInput) setTimeout(() => firstInput.focus(), 100);
    });
});
