// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

if (cursor && ring) {
    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        cursor.style.left = mx + 'px';
        cursor.style.top = my + 'px';
    });
    function animRing() {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
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
}

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
    .forEach(el => revealObserver.observe(el));

// ===== MODULE ACCORDION =====
document.querySelectorAll('.module-header').forEach(header => {
    header.addEventListener('click', () => {
        const item = header.closest('.module-item');
        const isOpen = item.classList.contains('open');

        // Close all
        document.querySelectorAll('.module-item').forEach(m => m.classList.remove('open'));

        // Open clicked if it was closed
        if (!isOpen) item.classList.add('open');
    });
});

// ===== FLOW — из низа блока в бок следующего (как на макете) =====
function drawFlowPath() {
    const container = document.querySelector('.flow-steps');
    const steps     = Array.from(document.querySelectorAll('.flow-step'));
    const svg       = document.getElementById('flowSvg');
    const arrows    = svg ? Array.from(svg.querySelectorAll('.flow-arrow')) : [];

    if (!container || steps.length < 2 || !svg || !arrows.length) return;

    // отключаем на мобиле
    if (window.innerWidth <= 768) {
        arrows.forEach(a => a.setAttribute('d', ''));
        return;
    }

    const cr = container.getBoundingClientRect();

    const pts = steps.map(s => {
        const r = s.getBoundingClientRect();
        return {
            cx: r.left - cr.left + r.width / 2,
            cy: r.top  - cr.top  + r.height / 2,

            top:    r.top    - cr.top,
            bottom: r.bottom - cr.top,

            left:  r.left  - cr.left,
            right: r.right - cr.left
        };
    });

    // 🔥 основная магия
    const curve = (a, b) => {
        const fromX = a.cx;
        const fromY = a.bottom;

        // определяем сторону входа
        const goLeft = b.cx < a.cx;

        const toX = goLeft ? b.right : b.left;
        const toY = b.cy;

        // адаптивные отступы (чтобы не ломалось на разных экранах)
        const dx = Math.abs(fromX - toX);
        const dy = Math.abs(fromY - toY);

        const offsetY = Math.max(60, dy * 0.4);
        const offsetX = Math.max(40, dx * 0.3);

        const c1x = fromX;
        const c1y = fromY + offsetY;

        const c2x = goLeft ? toX + offsetX : toX - offsetX;
        const c2y = toY;

        return `M ${fromX} ${fromY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${toX} ${toY}`;
    };

    // строим пути
    const paths = [];
    for (let i = 0; i < pts.length - 1; i++) {
        paths.push(curve(pts[i], pts[i + 1]));
    }

    arrows.forEach((arrow, i) => {
        arrow.setAttribute('d', paths[i] || '');
    });

    // обновляем SVG
    svg.setAttribute('viewBox', `0 0 ${cr.width} ${cr.height}`);
    svg.style.width  = cr.width + 'px';
    svg.style.height = cr.height + 'px';
}

window.addEventListener('load', drawFlowPath);
window.addEventListener('resize', drawFlowPath);


// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
