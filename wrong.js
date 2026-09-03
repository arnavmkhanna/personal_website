tailwind.config = {
        darkMode: 'class'
}

// === Floating Nodes Background ===
const canvas = document.getElementById('nodes');
const ctx = canvas.getContext('2d');
let particles = [];

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
        ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#9ca3af' : '#6b7280';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function resize() {
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
                    ? `rgba(156, 163, 175, ${1 - dist/130})` 
                    : `rgba(107, 114, 128, ${1 - dist/130})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

let animationId = null;

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    animationId = requestAnimationFrame(animate);
}

function initBackground() {
    resize();
    particles = [];
    const count = Math.floor(window.innerWidth / 12);
    for (let i = 0; i < count; i++) particles.push(new Particle());

    if (animationId === null) {
        animate(); // only start the loop once
    }
}

window.addEventListener('resize', () => {
    resize();
    // just resize the canvas — don't touch particles or restart animate()
});

initBackground();

// Theme Toggle
const toggleBtn = document.getElementById('theme-toggle');
const html = document.documentElement;

function updateThemeUI() {
    const isDark = html.getAttribute('data-theme') === 'dark';
    toggleBtn.textContent = isDark ? '☀︎' : '☾';
}

toggleBtn.addEventListener('click', () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        html.setAttribute('data-theme', 'light');
        html.classList.remove('dark');
    } else {
        html.setAttribute('data-theme', 'dark');
        html.classList.add('dark');
    }
    
    updateThemeUI();
});

// Initialize correct icon on page load
updateThemeUI();

// Modal Functions
function openModal(id) {
    const content = document.getElementById('modal-content');
    // Customize per modal id
    
    content.innerHTML = `<h2 class="text-3xl font-bold mb-4">Experience ${id}</h2><p>Detailed description, achievements, etc.</p>`;
    document.getElementById('modal').classList.remove('hidden');

    // if (id == 1) {
    //     content.innerHTML = `<h2 class="text-3xl font-bold mb-4">Experience ${id}</h2><p style="text-align: justify;">Second-year engineering student at Emmanuel College, University of Cambridge.\nMember of the Full Blue Racing (Formula Student) and Cambridge University Space Flight teams.\n</p>`;
    //     document.getElementById('modal').classList.remove('hidden');
    // }
    // else if (id == 2) {
    //     // Customize per modal id
    //     content.innerHTML = `<h2 class="text-3xl font-bold mb-4">Experience ${id}</h2><p>Materials Engineering in IIT</p>`;
    //     document.getElementById('modal').classList.remove('hidden');
    // }
    // else if (id == 3) {
    //     // Customize per modal id
    //     content.innerHTML = `<h2 class="text-3xl font-bold mb-4">Experience ${id}</h2><p>tks.world</p>`;
    //     document.getElementById('modal').classList.remove('hidden');
    // }
    // else if (id == 4) {
    //     // Customize per modal id
    //     content.innerHTML = `<h2 class="text-3xl font-bold mb-4">Experience ${id}</h2><p>43/45</p>`;
    //     document.getElementById('modal').classList.remove('hidden');
    // }
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

window.addEventListener('resize', () => {
    initBackground();
});

// Initialize everything
initBackground();