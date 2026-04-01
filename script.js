// Enhanced Interactive Features & Animations
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all features
    initializeFooterYear();
    initializeInnovationHub();
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

function initializeFooterYear() {
    const currentYear = document.getElementById('current-year');

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
}

function initializeInnovationHub() {
    const searchInput = document.getElementById('project-search');
    const filtersContainer = document.getElementById('innovation-filters');
    const resultsEl = document.getElementById('innovation-results');
    const emptyState = document.getElementById('products-empty');
    const resetButton = document.getElementById('reset-filters');
    const spotlightImage = document.getElementById('spotlight-image');
    const spotlightName = document.getElementById('spotlight-name');
    const spotlightStatus = document.getElementById('spotlight-status');
    const spotlightDescription = document.getElementById('spotlight-description');
    const spotlightTags = document.getElementById('spotlight-tags');
    const spotlightLink = document.getElementById('spotlight-link');
    const spotlightJump = document.getElementById('spotlight-jump');
    const spotlightCopy = document.getElementById('spotlight-copy');
    const statValues = document.querySelectorAll('[data-stat]');
    const cards = Array.from(document.querySelectorAll('.product-card'));

    if (!searchInput || !filtersContainer || !resultsEl || !cards.length) {
        return;
    }

    const filters = [
        { id: 'all', label: 'すべて' },
        { id: 'ai', label: 'AI' },
        { id: 'geo', label: '地図 / GIS' },
        { id: 'simulation', label: 'シミュレーション' },
        { id: 'admin', label: '管理者向け' }
    ];

    const projects = cards.map((card, index) => {
        const name = card.querySelector('.product-name')?.textContent.trim() || `Project ${index + 1}`;
        const description = card.querySelector('.product-description')?.textContent.trim() || '';
        const link = card.querySelector('.product-link');
        const image = card.querySelector('.project-image');
        const status = card.querySelector('.product-status');
        const categories = (card.dataset.categories || '')
            .split(',')
            .map(value => value.trim())
            .filter(Boolean);
        const tags = (card.dataset.tags || '')
            .split(',')
            .map(value => value.trim())
            .filter(Boolean);

        return {
            card,
            link,
            image,
            name,
            description,
            statusText: status?.textContent.trim() || '公開中',
            statusClass: status?.className || 'product-status status-live',
            categories,
            tags,
            priority: Number(card.dataset.priority || 0),
            searchText: normalizeText([name, description, categories.join(' '), tags.join(' ')].join(' '))
        };
    });

    let activeFilter = 'all';
    let selectedProject = projects.reduce((best, project) => {
        if (!best || project.priority > best.priority) {
            return project;
        }

        return best;
    }, null);

    renderFilters();
    updateStats(statValues, projects);

    projects.forEach(project => {
        project.card.addEventListener('mouseenter', () => setSelectedProject(project));
        project.card.addEventListener('focus', () => setSelectedProject(project));
        project.card.addEventListener('click', event => {
            if (event.target.closest('.product-link')) {
                return;
            }

            setSelectedProject(project);
        });
    });

    searchInput.addEventListener('input', () => {
        applyFilters();
    });

    filtersContainer.addEventListener('click', event => {
        const button = event.target.closest('.innovation-filter');

        if (!button) {
            return;
        }

        activeFilter = button.dataset.filter || 'all';
        syncFilterButtons();
        applyFilters();
        playSoundEffect('click');
    });

    spotlightJump?.addEventListener('click', () => {
        if (!selectedProject) {
            return;
        }

        selectedProject.card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        selectedProject.card.focus({ preventScroll: true });
    });

    spotlightCopy?.addEventListener('click', async () => {
        if (!selectedProject) {
            return;
        }

        const shareUrl = new URL(window.location.href);
        shareUrl.hash = selectedProject.card.id;

        try {
            await navigator.clipboard.writeText(shareUrl.toString());
            flashButtonState(spotlightCopy, 'コピーしました');
        } catch (_) {
            flashButtonState(spotlightCopy, 'コピー不可');
        }
    });

    resetButton?.addEventListener('click', () => {
        searchInput.value = '';
        activeFilter = 'all';
        syncFilterButtons();
        applyFilters();
    });

    const hashTarget = window.location.hash.replace('#', '');
    const hashMatch = hashTarget
        ? projects.find(project => project.card.id === hashTarget)
        : null;

    if (hashMatch) {
        selectedProject = hashMatch;
    }

    syncFilterButtons();
    applyFilters({ updateHash: false });

    function renderFilters() {
        filtersContainer.innerHTML = filters
            .map(filter => `
                <button type="button" class="innovation-filter" data-filter="${filter.id}">
                    ${filter.label}
                </button>
            `)
            .join('');
    }

    function syncFilterButtons() {
        filtersContainer.querySelectorAll('.innovation-filter').forEach(button => {
            const isActive = button.dataset.filter === activeFilter;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    }

    function applyFilters({ updateHash = true } = {}) {
        const query = normalizeText(searchInput.value);
        const visibleProjects = projects.filter(project => matchesProject(project, query, activeFilter));

        projects.forEach(project => {
            const isVisible = visibleProjects.includes(project);
            project.card.classList.toggle('is-hidden', !isVisible);
            project.card.hidden = !isVisible;
            project.card.setAttribute('aria-hidden', String(!isVisible));
        });

        emptyState.hidden = visibleProjects.length > 0;
        resultsEl.textContent = buildResultsLabel(visibleProjects.length, query, activeFilter);

        if (!visibleProjects.length) {
            selectedProject = null;
            renderEmptySpotlight();
            return;
        }

        if (!selectedProject || !visibleProjects.includes(selectedProject)) {
            selectedProject = visibleProjects.reduce((best, project) => {
                if (!best || project.priority > best.priority) {
                    return project;
                }

                return best;
            }, null);
        }

        setSelectedProject(selectedProject, { updateHash });
    }

    function setSelectedProject(project, { updateHash = true } = {}) {
        if (!project) {
            return;
        }

        selectedProject = project;

        projects.forEach(entry => {
            entry.card.classList.toggle('is-selected', entry === project);
        });

        spotlightImage.src = project.image?.getAttribute('src') || 'assets/images/pckk.png';
        spotlightImage.alt = `${project.name}のプレビュー`;
        spotlightName.textContent = project.name;
        spotlightStatus.textContent = project.statusText;
        spotlightStatus.className = project.statusClass;
        spotlightDescription.textContent = project.description;
        spotlightTags.innerHTML = project.tags
            .map(tag => `<span class="spotlight-tag">${tag}</span>`)
            .join('');

        spotlightLink.href = project.link?.href || '#';
        spotlightLink.removeAttribute('aria-disabled');
        spotlightLink.tabIndex = 0;
        spotlightJump.disabled = false;
        spotlightCopy.disabled = false;

        if (updateHash) {
            history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${project.card.id}`);
        }
    }

    function renderEmptySpotlight() {
        projects.forEach(project => project.card.classList.remove('is-selected'));
        spotlightImage.src = 'assets/images/pckk.png';
        spotlightImage.alt = '該当案件なし';
        spotlightName.textContent = '該当案件がありません';
        spotlightStatus.textContent = '再検索';
        spotlightStatus.className = 'product-status status-dev';
        spotlightDescription.textContent = '検索語を変えるか、フィルターを解除すると別の案件が表示されます。';
        spotlightTags.innerHTML = '<span class="spotlight-tag">検索条件を調整</span>';
        spotlightLink.removeAttribute('href');
        spotlightLink.setAttribute('aria-disabled', 'true');
        spotlightLink.tabIndex = -1;
        spotlightJump.disabled = true;
        spotlightCopy.disabled = true;
    }

    function updateStats(nodes, entries) {
        const stats = {
            total: entries.length,
            ai: entries.filter(entry => entry.categories.includes('ai')).length,
            geo: entries.filter(entry => entry.categories.includes('geo')).length,
            simulation: entries.filter(entry => entry.categories.includes('simulation')).length
        };

        nodes.forEach(node => {
            const value = stats[node.dataset.stat] ?? 0;
            animateCount(node, value);
        });
    }

    function animateCount(node, target) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            node.textContent = String(target);
            return;
        }

        const duration = 700;
        const startTime = performance.now();

        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            node.textContent = String(Math.round(target * progress));

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    function buildResultsLabel(count, query, filterId) {
        const filterLabel = filters.find(filter => filter.id === filterId)?.label || 'すべて';

        if (query) {
            return `「${searchInput.value.trim()}」で ${count} 件表示中 / フィルター: ${filterLabel}`;
        }

        if (filterId !== 'all') {
            return `${filterLabel} の案件を ${count} 件表示中`;
        }

        return `${count} 件の案件を表示中`;
    }

    function matchesProject(project, query, filterId) {
        const matchesQuery = !query || project.searchText.includes(query);
        const matchesFilter = filterId === 'all' || project.categories.includes(filterId);

        return matchesQuery && matchesFilter;
    }

    function flashButtonState(button, text) {
        const originalText = button.dataset.originalText || button.textContent;

        button.dataset.originalText = originalText;
        button.textContent = text;
        button.classList.add('is-success');
        clearTimeout(button._flashTimer);

        button._flashTimer = setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('is-success');
        }, 1400);
    }
}

function normalizeText(value) {
    return (value || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

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
            playSoundEffect('hover');
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

// Theme Switcher (Dark → Light → Sakura)
const THEME_SOUNDTRACKS = {
    dark: 'assets/audio/dark.mp3',
    light: 'assets/audio/light.mp3',
    sakura: 'assets/audio/sakura.mp3'
};

function initializeThemeSwitcher() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');

    const themes = ['dark', 'light', 'sakura'];

    function applyTheme(theme) {
        document.body.classList.remove('light-theme', 'sakura-theme');
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            themeIcon.textContent = '☀️';
        } else if (theme === 'sakura') {
            document.body.classList.add('sakura-theme');
            themeIcon.textContent = '🌸';
        } else {
            // dark (default)
            themeIcon.textContent = '🌙';
        }
        localStorage.setItem('theme', theme);
        document.body.setAttribute('data-theme', theme);
        syncThemeSoundtrack(theme);
    }

    // Determine initial theme
    let currentTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(currentTheme);

    themeToggle.addEventListener('click', (e) => {
        // Cycle to next theme
        const idx = themes.indexOf(currentTheme);
        currentTheme = themes[(idx + 1) % themes.length];
        applyTheme(currentTheme);

        playSoundEffect('click');
        createRipple(e, themeToggle);
    });
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

function syncThemeSoundtrack(theme) {
    const customEl = document.getElementById('custom-sound');
    const nextSrc = THEME_SOUNDTRACKS[theme] || THEME_SOUNDTRACKS.dark;

    if (!customEl || customEl.getAttribute('src') === nextSrc) {
        return;
    }

    customEl.pause();
    customEl.setAttribute('src', nextSrc);
    customEl.load();
}

function playAudioEl(el, { volume = 1.0, rate = 1.0, rewind = true } = {}) {
  if (!el) return;
  try {
    if (rewind) el.currentTime = 0;
    el.volume = volume;
    el.playbackRate = rate;
    const p = el.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => { /* ignore autoplay policy rejections until user interacts */ });
    }
  } catch (_) { /* no-op */ }
}

function playSoundEffect(type = 'click') {
    if (!soundEnabled) return;

    // Create visual sound effect instead of audio
 createSoundWave(document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2));

  // choose which audio to play
  const hoverEl  = document.getElementById('hover-sound');   // from index.html
  const clickEl  = document.getElementById('click-sound');   // from index.html
  const customEl = document.getElementById('custom-sound');
  
switch (type) {
    case 'hover':
      playAudioEl(hoverEl, { volume: 0.6 });
      playAudioEl(customEl, { volume: 0.4, rewind: false }); // layer it softly
      break;
    case 'custom':
      playAudioEl(customEl, { volume: 1.0, rewind: false });
      break;
    case 'click':
    default:
      playAudioEl(clickEl, { volume: 0.9 });
      playAudioEl(customEl, { volume: 0.7, rewind: false });
      break;
  }
}

function toggleSoundEffects() {
  soundEnabled = !soundEnabled;
  const soundButton = document.querySelector('[data-action="sound"]');
  soundButton.textContent = soundEnabled ? '🔊' : '🔇';
  document.querySelectorAll('audio').forEach(a => (a.muted = !soundEnabled));
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
