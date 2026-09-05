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

// === Modal content, sourced from <template> tags in the HTML ===
// Each card should call openModal('some-key'), and there should be a
// matching <template id="modal-some-key"> somewhere in the page.
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
    document.getElementById('modal').classList.add('hidden');
}

// Close modal on Escape key, and when clicking the dark overlay outside the card
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal();
});

// === Text Decode Effect ===
function scrambleReveal(el, finalText, delayBeforeStart) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>/';
    let resolved = 0;
    let frame = 0;
    const framesPerLetter = 3; // lower = faster overall reveal

    function tick() {
        let output = '';
        for (let i = 0; i < finalText.length; i++) {
            if (i < resolved) {
                output += finalText[i];
            } else if (finalText[i] === ' ') {
                output += ' ';
            } else {
                output += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        el.textContent = output;

        frame++;
        if (frame % framesPerLetter === 0 && resolved < finalText.length) {
            resolved++;
        }

        if (resolved < finalText.length) {
            requestAnimationFrame(tick);
        } else {
            el.textContent = finalText; // guarantees a clean final state
        }
    }

    setTimeout(() => requestAnimationFrame(tick), delayBeforeStart);
}

function initHeadlineDecode() {
    const heyEl = document.getElementById('decode-hey');
    const nameEl = document.getElementById('decode-name');
    if (heyEl) scrambleReveal(heyEl, 'Hey!', 0);
    if (nameEl) scrambleReveal(nameEl, 'Arnav', 200); // starts slightly after "Hey!"
}

// === Side Quests expand/collapse ===
function toggleSideQuests() {
    const content = document.getElementById('sidequests-more');
    const text = document.getElementById('sidequests-toggle-text');
    const icon = document.getElementById('sidequests-toggle-icon');
    const isExpanded = content.style.maxHeight && content.style.maxHeight !== '0px';

    if (isExpanded) {
        content.style.maxHeight = '0px';
        text.textContent = 'Read More';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    } else {
        content.style.maxHeight = content.scrollHeight + 'px';
        text.textContent = 'Read Less';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    }
}

// === Initialize everything, in order ===
initTheme();
initBackground();
initHeadlineDecode();