// Enhanced animations and interactive effects
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all animations and interactions
    initializeAnimations();
    initializeInteractions();
    initializeParallax();
    initializeParticles();
});

function initializeAnimations() {
    const productCards = document.querySelectorAll('.product-card');

    // Enhanced Intersection Observer for staggered animations
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

    // Set up initial state and observe cards
    productCards.forEach((card, index) => {
        card.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1)`;
        observer.observe(card);

        // Add hover sound effect (visual feedback)
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-12px) scale(1.03)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Animate header elements on load
    setTimeout(() => {
        const header = document.querySelector('.header');
        header.style.transform = 'translateY(0)';
        header.style.opacity = '1';
    }, 200);
}

function initializeInteractions() {
    const productLinks = document.querySelectorAll('.product-link');
    const productCards = document.querySelectorAll('.product-card');

    // Enhanced click effects with ripple animation
    productLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const productName = this.closest('.product-card').querySelector('.product-name').textContent;
            console.log(`Product accessed: ${productName}`);

            // Create ripple effect
            createRipple(e, this);

            // Add loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<span>開いています...</span>';
            this.style.pointerEvents = 'none';

            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.pointerEvents = 'auto';
            }, 1500);
        });

        // Add magnetic effect on hover
        link.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
        });

        link.addEventListener('mouseleave', function () {
            this.style.transform = 'translate(0, 0) scale(1)';
        });
    });

    // Enhanced keyboard navigation
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

    // Status indicator animations
    const statusIndicators = document.querySelectorAll('.product-status');
    statusIndicators.forEach(status => {
        if (status.classList.contains('status-live')) {
            status.style.animation = 'pulse 2s infinite, statusGlow 3s ease-in-out infinite alternate';
        }
    });
}

function initializeParallax() {
    // Subtle parallax effect for background elements
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;

        document.body.style.backgroundPosition = `center ${rate}px`;

        // Parallax for decoration elements
        const decorationDots = document.querySelectorAll('.decoration-dot');
        decorationDots.forEach(dot => {
            dot.style.transform = `translateY(${scrolled * 0.1}px)`;
        });
    });
}

function initializeParticles() {
    // Create floating particles for enhanced visual appeal
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

    // Create particles
    for (let i = 0; i < 20; i++) {
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

    // Remove and recreate particle after animation
    setTimeout(() => {
        particle.remove();
        createParticle(container);
    }, duration * 1000);
}

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
    `;

    element.style.position = 'relative';
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// Enhanced CSS animations
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(46, 204, 113, 0); }
        100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
    }
    
    @keyframes statusGlow {
        from { filter: brightness(1); }
        to { filter: brightness(1.2) saturate(1.1); }
    }
    
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
    
    .particles-container {
        animation: particleContainerFloat 30s ease-in-out infinite;
    }
    
    @keyframes particleContainerFloat {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(20px); }
    }
    
    .product-card {
        will-change: transform, opacity;
    }
    
    .product-link {
        will-change: transform;
    }
    
    /* Smooth focus states for accessibility */
    .product-card:focus {
        outline: 2px solid rgba(100, 181, 246, 0.8);
        outline-offset: 4px;
    }
    
    /* Loading state styles */
    .product-link.loading {
        background: linear-gradient(135deg, #666, #888);
        cursor: wait;
    }
    
    /* Enhanced mobile interactions */
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