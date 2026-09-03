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
        ctx.fillStyle = isDark ? 'rgba(156, 163, 175, 0.6)' : 'rgba(107, 114, 128, 0.55)';
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
                ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'dark'
                    ? 'rgba(156, 163, 175, ' + (0.6 * (1 - dist / 130)) + ')'
                    : 'rgba(107, 114, 128, ' + (0.55 * (1 - dist / 130)) + ')';
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

// Only resize the canvas and refresh particle count on window resize.
// We never call animate() again here, so the loop never stacks.
window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
});

// === Theme Toggle ===
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
    toggleBtn.textContent = isDark ? '☀︎' : '☾';
}

function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
        applyTheme(saved === 'dark');
    } else {
        // no saved preference yet — match the OS setting
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark);
    }
}

toggleBtn.addEventListener('click', () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    applyTheme(!isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
});

// === Initialize everything, in order ===
initTheme();
initBackground();