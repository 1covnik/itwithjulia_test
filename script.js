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
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !burger.contains(e.target)) {
            burger.classList.remove('open');
            navLinks.classList.remove('open');
        }
    });
}

// Scroll reveal — all animation variants
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
    .forEach(el => revealObserver.observe(el));

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

// ===================== DRAG TO SCROLL (program, bonus, results, ifyou) =====================
function makeDraggable(el) {
    if (!el) return;
    let isDown = false, startX = 0, scrollLeft = 0;
    el.addEventListener('mousedown', e => {
        isDown = true;
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
    });
    el.addEventListener('mouseleave', () => { isDown = false; });
    el.addEventListener('mouseup', () => { isDown = false; });
    el.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX);
    });
}

const programTrack = document.getElementById('programScrollTrack');
makeDraggable(programTrack);

// Program carousel arrows
const programPrev = document.getElementById('programPrev');
const programNext = document.getElementById('programNext');
if (programPrev && programNext && programTrack) {
    function scrollToSlide(direction) {
        const slideWidth = programTrack.clientWidth + 20; // ширина + gap
        programTrack.scrollBy({ left: direction * slideWidth, behavior: 'smooth' });
    }
    programPrev.addEventListener('click', () => scrollToSlide(-1));
    programNext.addEventListener('click', () => scrollToSlide(1));
}
makeDraggable(document.querySelector('.ifyou-grid'));
makeDraggable(document.querySelector('.bonus-grid'));
makeDraggable(document.querySelector('.results-grid'));

// ===================== MODAL WINDOW FOR TARIFFS =====================
const modal = document.getElementById('paymentModal');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');
const modalOverlay = document.querySelector('.modal-overlay');

// URL виджет-скриптов GetCourse
const gcWidgetUrls = {
    basic:    'https://itwithjuliiia.getcourse.ru/pl/lite/widget/script?id=1573697',
    extended: 'https://itwithjuliiia.getcourse.ru/pl/lite/widget/script?id=1573697'
};

// Закрытие модального окна
function closeModal() {
    modal.classList.remove('show');
    // Удаляем загруженный скрипт и контент, чтобы при следующем открытии виджет перезагрузился
    modalContent.innerHTML = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
});

// Обработчики на кнопки "Оплатить"
document.querySelectorAll('.btn-pay[data-form]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const formType = btn.dataset.form; // 'basic' или 'extended'
        const widgetUrl = gcWidgetUrls[formType];
        if (!widgetUrl) return;

        // Показываем модал с индикатором загрузки
        modalContent.innerHTML = '<div class="modal-loading">Загрузка формы...</div>';
        modal.classList.add('show');

        // Динамически создаём и вставляем скрипт GetCourse в контейнер
        // document.createElement + appendChild — единственный способ выполнить скрипт
        const script = document.createElement('script');
        script.src = widgetUrl;
        script.onload = () => {
            // Убираем лоадер после загрузки скрипта
            const loader = modalContent.querySelector('.modal-loading');
            if (loader) loader.remove();
        };
        script.onerror = () => {
            modalContent.innerHTML = '<p style="color:red;text-align:center;">Не удалось загрузить форму. Попробуйте позже.</p>';
        };
        modalContent.appendChild(script);
    });
});
