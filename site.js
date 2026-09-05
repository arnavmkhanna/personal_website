tailwind.config = {
    darkMode: 'class'
}

// === Floating Nodes Background ===
const canvas = document.getElementById('nodes');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId = null;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1.5;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.speedY = Math.random() * 0.6 - 0.3;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.fillStyle = isDark ? 'rgba(156, 163, 175, 0.35)' : 'rgba(107, 114, 128, 0.2)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function connect() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.hypot(dx, dy);
            if (dist < 130) {
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                ctx.strokeStyle = isDark
                    ? 'rgba(156, 163, 175, ' + (0.35 * (1 - dist / 130)) + ')'
                    : 'rgba(107, 114, 128, ' + (0.2 * (1 - dist / 130)) + ')';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    animationId = requestAnimationFrame(animate);
}

function createParticles() {
    particles = [];
    const count = Math.floor(window.innerWidth / 12);
    for (let i = 0; i < count; i++) particles.push(new Particle());
}

function initBackground() {
    resizeCanvas();
    createParticles();
    if (animationId === null) {
        animate(); // the loop starts exactly once, ever
    }
}

window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
});

// === Theme Toggle ===
// Note: tailwind.config = { darkMode: 'class' } and the pre-paint theme
// detection snippet both live in an inline <script> in each page's <head>,
// not here — they must run before Tailwind's CDN script initializes.
const toggleBtn = document.getElementById('theme-toggle');
const html = document.documentElement;

function applyTheme(isDark) {
    if (isDark) {
        html.setAttribute('data-theme', 'dark');
        html.classList.add('dark');
    } else {
        html.setAttribute('data-theme', 'light');
        html.classList.remove('dark');
    }
    if (toggleBtn) toggleBtn.textContent = isDark ? '☀︎' : '☾';
}

function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
        applyTheme(saved === 'dark');
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark);
    }
}

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        const isDark = html.getAttribute('data-theme') === 'dark';
        applyTheme(!isDark);
        localStorage.setItem('theme', !isDark ? 'dark' : 'light');
    });
}

// === Modal content, sourced from <template> tags in the HTML ===
// Only runs if the page actually has a #modal element — pages without
// modals (like project pages) simply skip this without erroring.
function openModal(key) {
    const template = document.getElementById('modal-' + key);
    if (!template) {
        console.error('No template found for modal key: ' + key);
        return;
    }
    const content = document.getElementById('modal-content');
    content.innerHTML = '';
    content.appendChild(template.content.cloneNode(true));
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (!modal) return;
    const card = modal.querySelector('.modal');
    card.classList.remove('modal');
    card.classList.add('modal-closing');

    setTimeout(() => {
        modal.classList.add('hidden');
        card.classList.remove('modal-closing');
        card.classList.add('modal');
    }, 200);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

const modalEl = document.getElementById('modal');
if (modalEl) {
    modalEl.addEventListener('click', (e) => {
        if (e.target.id === 'modal') closeModal();
    });
}

// === Initialize everything, in order ===
initTheme();
initBackground();