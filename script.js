// Enhanced Interactive Features & Animations
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all features
    initializeAnimations();
    initializeInteractions();
    initializeParallax();
    initializeParticles();
    initializeThemeSwitcher();
    initializeCursorTrail();
    initializeScrollProgress();
    initializeFloatingActionButton();
    initializeTypingAnimation();
    initializeSoundEffects();
    initializeAdvancedParticles();
    initializeMagneticButtons();
});

// Core Animation System
function initializeAnimations() {
    const productCards = document.querySelectorAll('.product-card');

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }, index * 100);
            }
        });
    }, observerOptions);

    productCards.forEach((card, index) => {
        card.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1)`;
        observer.observe(card);

        // Enhanced hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-12px) scale(1.03)';
            createSoundWave(card);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });

        // 3D Card Flip on double-click
        card.addEventListener('dblclick', () => {
            card.classList.toggle('flipped');
        });
    });

    // Animate header on load
    setTimeout(() => {
        const header = document.querySelector('.header');
        header.style.transform = 'translateY(0)';
        header.style.opacity = '1';
    }, 200);
}

// Enhanced Interactions
function initializeInteractions() {
    const productLinks = document.querySelectorAll('.product-link');
    const productCards = document.querySelectorAll('.product-card');

    productLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const productName = this.closest('.product-card').querySelector('.product-name').textContent;
            console.log(`Product accessed: ${productName}`);

            createRipple(e, this);
            playSoundEffect('click');

            // Enhanced loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<span>開いています...</span>';
            this.style.pointerEvents = 'none';
            this.classList.add('loading');

            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.pointerEvents = 'auto';
                this.classList.remove('loading');
            }, 1500);
        });

        // Magnetic effect
        link.addEventListener('mousemove', function (e) {
            if (window.innerWidth > 768) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
            }
        });

        link.addEventListener('mouseleave', function () {
            this.style.transform = 'translate(0, 0) scale(1)';
        });
    });

    // Keyboard navigation
    productCards.forEach(card => {
        const link = card.querySelector('.product-link');
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                link.click();
            }
        });
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `${card.querySelector('.product-name').textContent}を開く`);
    });
}

// Parallax Effects
function initializeParallax() {
    let ticking = false;

    function updateParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;

        document.body.style.backgroundPosition = `center ${rate}px`;

        const decorationDots = document.querySelectorAll('.decoration-dot');
        decorationDots.forEach(dot => {
            dot.style.transform = `translateY(${scrolled * 0.1}px)`;
        });

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
}

// Enhanced Particle System
function initializeParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particles-container';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;
    document.body.appendChild(particleContainer);

    for (let i = 0; i < 30; i++) {
        createParticle(particleContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    const size = Math.random() * 4 + 2;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const duration = Math.random() * 20 + 10;

    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(100, 181, 246, 0.6), transparent);
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        animation: particleFloat ${duration}s linear infinite;
        opacity: 0.3;
    `;

    container.appendChild(particle);

    setTimeout(() => {
        particle.remove();
        createParticle(container);
    }, duration * 1000);
}

// Theme Switcher
function initializeThemeSwitcher() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');

    let isDark = true;

    themeToggle.addEventListener('click', () => {
        isDark = !isDark;
        document.body.classList.toggle('light-theme', !isDark);
        themeIcon.textContent = isDark ? '🌙' : '☀️';

        playSoundEffect('click');
        createRipple(event, themeToggle);

        // Save preference
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        isDark = false;
        document.body.classList.add('light-theme');
        themeIcon.textContent = '☀️';
    }
}

// Cursor Trail Effect
function initializeCursorTrail() {
    if (window.innerWidth <= 768) return; // Skip on mobile

    const cursorTrail = document.querySelector('.cursor-trail');
    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorTrail.style.opacity = '1';

        // Create trailing particles
        if (Math.random() > 0.8) {
            createCursorParticle(mouseX, mouseY);
        }
    });

    document.addEventListener('mouseleave', () => {
        cursorTrail.style.opacity = '0';
    });

    function animateTrail() {
        trailX += (mouseX - trailX) * 0.1;
        trailY += (mouseY - trailY) * 0.1;

        cursorTrail.style.left = trailX + 'px';
        cursorTrail.style.top = trailY + 'px';

        requestAnimationFrame(animateTrail);
    }
    animateTrail();
}

function createCursorParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'cursor-particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 1000);
}

// Scroll Progress Indicator
function initializeScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress-bar');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;

        progressBar.style.width = scrollPercent + '%';
    });
}

// Floating Action Button
function initializeFloatingActionButton() {
    const fabContainer = document.querySelector('.fab-container');
    const fab = document.querySelector('.fab');
    const fabItems = document.querySelectorAll('.fab-item');

    fab.addEventListener('click', () => {
        fabContainer.classList.toggle('active');
        playSoundEffect('click');
    });

    fabItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const action = e.target.dataset.action;

            switch (action) {
                case 'top':
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    break;
                case 'theme':
                    document.querySelector('.theme-toggle').click();
                    break;
                case 'sound':
                    toggleSoundEffects();
                    break;
            }

            fabContainer.classList.remove('active');
            playSoundEffect('click');
        });
    });

    // Close FAB menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!fabContainer.contains(e.target)) {
            fabContainer.classList.remove('active');
        }
    });
}

// Typing Animation
function initializeTypingAnimation() {
    const typingElements = document.querySelectorAll('.typing-text');

    typingElements.forEach((element, index) => {
        const text = element.dataset.text;
        element.textContent = '';

        setTimeout(() => {
            typeText(element, text, 50);
        }, index * 1000);
    });
}

function typeText(element, text, speed) {
    let i = 0;
    const timer = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(timer);
            // Remove cursor after typing
            setTimeout(() => {
                element.style.borderRight = 'none';
            }, 1000);
        }
    }, speed);
}

// Sound Effects System
let soundEnabled = true;

function initializeSoundEffects() {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        soundEnabled = false;
    }
}

function playSoundEffect(type) {
    if (!soundEnabled) return;

    // Create visual sound effect instead of audio
    createSoundWave(document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2));
}

function toggleSoundEffects() {
    soundEnabled = !soundEnabled;
    const soundButton = document.querySelector('[data-action="sound"]');
    soundButton.textContent = soundEnabled ? '🔊' : '🔇';
}

function createSoundWave(element) {
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const wave = document.createElement('div');
    wave.className = 'sound-wave';
    wave.style.left = (rect.left + rect.width / 2 - 50) + 'px';
    wave.style.top = (rect.top + rect.height / 2 - 50) + 'px';

    document.body.appendChild(wave);
    setTimeout(() => wave.remove(), 600);
}

// Advanced Particle System
function initializeAdvancedParticles() {
    const particleTypes = ['particle-1', 'particle-2', 'particle-3'];

    setInterval(() => {
        if (document.querySelectorAll('.advanced-particle').length < 15) {
            createAdvancedParticle();
        }
    }, 2000);
}

function createAdvancedParticle() {
    const particle = document.createElement('div');
    const types = ['particle-1', 'particle-2', 'particle-3'];
    const type = types[Math.floor(Math.random() * types.length)];

    particle.className = `advanced-particle ${type}`;
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = window.innerHeight + 'px';

    document.body.appendChild(particle);

    setTimeout(() => {
        if (particle.parentNode) {
            particle.remove();
        }
    }, 25000);
}

// Magnetic Button Effects
function initializeMagneticButtons() {
    const buttons = document.querySelectorAll('.product-link, .fab, .theme-toggle');

    buttons.forEach(button => {
        button.classList.add('magnetic-button');

        button.addEventListener('mouseenter', () => {
            button.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0) scale(1)';
        });
    });
}

// Ripple Effect
function createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent);
        border-radius: 50%;
        transform: scale(0);
        animation: rippleEffect 0.6s ease-out;
        pointer-events: none;
        z-index: 1000;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// Performance Optimizations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Enhanced CSS Animations
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    @keyframes particleFloat {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 0.3;
        }
        90% {
            opacity: 0.3;
        }
        100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes rippleEffect {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    .product-card {
        will-change: transform, opacity;
    }
    
    .product-link {
        will-change: transform;
    }
    
    .product-card:focus {
        outline: 2px solid rgba(100, 181, 246, 0.8);
        outline-offset: 4px;
    }
    
    .product-link.loading {
        background: linear-gradient(135deg, #666, #888);
        cursor: wait;
    }
    
    @media (hover: none) and (pointer: coarse) {
        .product-card:active {
            transform: scale(0.98);
        }
        
        .product-link:active {
            transform: scale(0.95);
        }
    }
`;
document.head.appendChild(enhancedStyles);

// Initialize resize handler
window.addEventListener('resize', debounce(() => {
    // Reinitialize cursor trail on resize
    if (window.innerWidth > 768) {
        initializeCursorTrail();
    }
}, 250));