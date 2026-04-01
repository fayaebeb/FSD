// Enhanced Interactive Features & Animations
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all features
    initializeFooterYear();
    initializeGameModal();
    initializeInnovationHub();
    initializeSignalRunner();
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

function initializeGameModal() {
    const modal = document.getElementById('game-modal');
    const backdrop = document.getElementById('game-modal-backdrop');
    const closeButton = document.getElementById('game-modal-close');
    const fab = document.querySelector('.fab');

    if (!modal || !fab) {
        return;
    }

    const openModal = () => {
        modal.hidden = false;
        requestAnimationFrame(() => {
            modal.classList.add('is-open');
        });
        document.body.classList.add('game-modal-open');
        fab.setAttribute('aria-expanded', 'true');
        playSoundEffect('click');
        closeButton?.focus();
    };

    const closeModal = async () => {
        if (document.fullscreenElement) {
            try {
                await document.exitFullscreen();
            } catch (_) {
                // ignore exit errors
            }
        }

        modal.classList.remove('is-open');
        modal.hidden = true;
        document.body.classList.remove('game-modal-open');
        fab.setAttribute('aria-expanded', 'false');
        fab.focus();
        window.dispatchEvent(new CustomEvent('fsd:game-modal-closed'));
    };

    fab.addEventListener('click', () => {
        if (modal.hidden) {
            openModal();
        } else {
            closeModal();
        }
    });

    backdrop?.addEventListener('click', () => {
        closeModal();
    });

    closeButton?.addEventListener('click', () => {
        closeModal();
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !modal.hidden) {
            closeModal();
        }
    });

    window.addEventListener('fsd:open-game-modal', () => {
        openModal();
    });

    window.addEventListener('fsd:close-game-modal', () => {
        closeModal();
    });
}

function initializeSignalRunner() {
    const canvas = document.getElementById('signal-runner');
    const gameShell = document.querySelector('.game-shell');
    const startButton = document.getElementById('game-start');
    const pauseButton = document.getElementById('game-pause');
    const fullscreenButton = document.getElementById('game-fullscreen');
    const startInlineButton = document.getElementById('game-start-inline');
    const pauseInlineButton = document.getElementById('game-pause-inline');
    const exitFullscreenButton = document.getElementById('game-exit-fullscreen');
    const rewardButton = document.getElementById('game-apply-reward');
    const rewardText = document.getElementById('game-reward-text');
    const characterGrid = document.getElementById('game-character-grid');
    const currentPlayerEl = document.getElementById('game-current-player');
    const overlay = document.getElementById('game-overlay');
    const overlayTitle = document.getElementById('game-overlay-title');
    const overlayText = document.getElementById('game-overlay-text');
    const scoreEl = document.getElementById('game-score');
    const timeEl = document.getElementById('game-time');
    const bestEl = document.getElementById('game-best');

    if (!canvas || !gameShell) {
        return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return;
    }

    const width = canvas.width;
    const height = canvas.height;
    const bestKey = 'fsd-signal-runner-best';
    const playerKey = 'fsd-signal-runner-player';
    const keys = new Set();
    const pointer = { active: false, x: width / 2, y: height / 2 };
    let bestScore = Number(localStorage.getItem(bestKey) || 0);
    let animationFrame = null;
    let lastTick = 0;
    let flashLevel = 0;
    let rewardFilter = null;
    const playerOptions = {
        sakura: {
            label: '桜',
            src: 'assets/images/sakura-player.png',
            accent: '#ff8db8'
        },
        mirai: {
            label: 'ミライ',
            src: 'assets/images/mirai-player.png',
            accent: '#69c7ff'
        },
        mapai: {
            label: 'マップAI',
            src: 'assets/images/mapai-player.png',
            accent: '#6cf0a4'
        }
    };

    Object.values(playerOptions).forEach(option => {
        option.image = new Image();
        option.image.src = option.src;
    });

    const state = {
        running: false,
        paused: false,
        ended: false,
        score: 0,
        timeLeft: 30,
        remainingMs: 30000,
        roundEndsAt: 0,
        timerHandle: null,
        selectedPlayerId: localStorage.getItem(playerKey) || 'sakura',
        player: createPlayer(),
        entities: [],
        particles: [],
        categoryScore: { ai: 0, geo: 0, simulation: 0 }
    };

    const typeConfig = {
        ai: { color: '#5ad9ff', value: 12, radius: 14, label: 'AI案件が強いです。' },
        geo: { color: '#5eff9c', value: 12, radius: 14, label: '地図 / GIS案件と相性が良いです。' },
        simulation: { color: '#ffd36c', value: 14, radius: 14, label: 'シミュレーション案件を深掘りしてください。' },
        glitch: { color: '#ff6f91', value: -10, radius: 16, label: 'Glitch' }
    };

    if (!playerOptions[state.selectedPlayerId]) {
        state.selectedPlayerId = 'sakura';
    }

    bestEl.textContent = String(bestScore);
    syncCharacterPicker();
    syncFullscreenButton();
    syncPauseButtons();
    updateGameHud();
    drawGame();

    startButton?.addEventListener('click', handleStartGame);
    startInlineButton?.addEventListener('click', handleStartGame);

    fullscreenButton?.addEventListener('click', async () => {
        await toggleFullscreen();
    });

    exitFullscreenButton?.addEventListener('click', async () => {
        await toggleFullscreen({ forceExit: true });
    });

    document.addEventListener('fullscreenchange', () => {
        syncFullscreenButton();
    });

    window.addEventListener('fsd:game-modal-closed', () => {
        if (state.running && !state.paused && !state.ended) {
            togglePauseState();
        }
    });

    pauseButton?.addEventListener('click', togglePauseState);
    pauseInlineButton?.addEventListener('click', togglePauseState);

    rewardButton?.addEventListener('click', () => {
        if (!rewardFilter) {
            return;
        }

        window.dispatchEvent(new CustomEvent('fsd:apply-filter', {
            detail: {
                filterId: rewardFilter,
                source: 'signal-runner'
            }
        }));
        flashButtonState(rewardButton, '反映しました');
    });

    characterGrid?.addEventListener('click', event => {
        const button = event.target.closest('.game-character-option');
        const playerId = button?.dataset.player;

        if (!playerId || !playerOptions[playerId]) {
            return;
        }

        state.selectedPlayerId = playerId;
        localStorage.setItem(playerKey, playerId);
        syncCharacterPicker();
        drawGame();
        playSoundEffect('click');
    });

    function handleStartGame() {
        startGame();
        playSoundEffect('click');
    }

    async function toggleFullscreen({ forceExit = false } = {}) {
        if (!document.fullscreenEnabled) {
            flashButtonState(fullscreenButton, '非対応');
            return;
        }

        try {
            if (document.fullscreenElement === gameShell) {
                if (forceExit || !forceExit) {
                    await document.exitFullscreen();
                }
            } else if (!forceExit) {
                await gameShell.requestFullscreen();
            }
            syncFullscreenButton();
            playSoundEffect('click');
        } catch (_) {
            flashButtonState(fullscreenButton, '失敗');
        }
    }

    function togglePauseState() {
        if (!state.running || state.ended) {
            return;
        }

        if (!state.paused) {
            state.remainingMs = Math.max(0, state.roundEndsAt - Date.now());
        } else {
            state.roundEndsAt = Date.now() + state.remainingMs;
        }

        state.paused = !state.paused;
        syncPauseButtons();
        setOverlay(
            state.paused ? 'Paused' : 'Running',
            state.paused ? 'ゲームを一時停止しています' : 'ミッション進行中',
            state.paused ? '再開するとカウントが戻ります。' : 'シグナルを回収して、最も多く集めたカテゴリをアンロックしてください。',
            !state.paused
        );

        if (!state.paused) {
            lastTick = performance.now();
            animationFrame = requestAnimationFrame(gameLoop);
        } else if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    canvas.addEventListener('mousemove', event => {
        const point = getCanvasPoint(event, canvas);
        pointer.active = true;
        pointer.x = point.x;
        pointer.y = point.y;
    });

    canvas.addEventListener('mouseleave', () => {
        pointer.active = false;
    });

    canvas.addEventListener('touchstart', event => {
        const point = getCanvasPoint(event.touches[0], canvas);
        pointer.active = true;
        pointer.x = point.x;
        pointer.y = point.y;
    }, { passive: true });

    canvas.addEventListener('touchmove', event => {
        const point = getCanvasPoint(event.touches[0], canvas);
        pointer.active = true;
        pointer.x = point.x;
        pointer.y = point.y;
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
        pointer.active = false;
    }, { passive: true });

    window.addEventListener('keydown', event => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
            return;
        }

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
            event.preventDefault();
        }

        if (event.key === ' ' && !state.running) {
            startGame();
            return;
        }

        keys.add(event.key.toLowerCase());
    });

    window.addEventListener('keyup', event => {
        keys.delete(event.key.toLowerCase());
    });

    function startGame() {
        state.running = true;
        state.paused = false;
        state.ended = false;
        state.score = 0;
        state.timeLeft = 30;
        state.remainingMs = 30000;
        state.roundEndsAt = Date.now() + state.remainingMs;
        state.player = createPlayer();
        state.entities = [];
        state.particles = [];
        state.categoryScore = { ai: 0, geo: 0, simulation: 0 };
        rewardFilter = null;
        flashLevel = 0;

        rewardButton.disabled = true;
        rewardText.textContent = 'シグナルの傾向から、次に見るべきカテゴリを提案します。';
        syncPauseButtons();
        updateGameHud();
        setOverlay('Mission Live', 'ミッション進行中', 'シグナルを回収して、グリッチを避けてください。', true);
        startRoundTimer();

        for (let index = 0; index < 7; index += 1) {
            spawnEntity();
        }

        lastTick = performance.now();
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        animationFrame = requestAnimationFrame(gameLoop);
    }

    function endGame() {
        state.running = false;
        state.ended = true;
        state.paused = false;
        clearRoundTimer();
        syncPauseButtons();

        if (state.score > bestScore) {
            bestScore = state.score;
            localStorage.setItem(bestKey, String(bestScore));
            bestEl.textContent = String(bestScore);
        }

        const dominantCategory = Object.entries(state.categoryScore)
            .sort((left, right) => right[1] - left[1])[0];

        rewardFilter = dominantCategory && dominantCategory[1] > 0 ? dominantCategory[0] : 'ai';
        const rewardLabels = {
            ai: 'AI案件を推奨します。桜AI、ミライ、マップAIに寄ってみてください。',
            geo: '地図 / GIS案件を推奨します。マップAI、FrameArk、小樽マップAIが向いています。',
            simulation: 'シミュレーション案件を推奨します。MobilityTwin と DTSB を見てください。'
        };

        rewardText.textContent = rewardLabels[rewardFilter];
        rewardButton.disabled = false;
        setOverlay('Round Complete', `スコア ${state.score}`, 'おすすめカテゴリを反映して、相性の良い案件をそのまま絞り込めます。', false);
        drawGame();
    }

    function gameLoop(timestamp) {
        const delta = Math.min((timestamp - lastTick) / 1000, 0.032);
        lastTick = timestamp;

        if (!state.running || state.paused) {
            drawGame();
            return;
        }
        updatePlayer(delta);
        updateEntities(delta);
        updateParticles(delta);
        updateGameHud();
        drawGame();

        animationFrame = requestAnimationFrame(gameLoop);
    }

    function updatePlayer(delta) {
        const player = state.player;
        let ax = 0;
        let ay = 0;
        const acceleration = 720;

        if (keys.has('arrowup') || keys.has('w')) {
            ay -= acceleration;
        }
        if (keys.has('arrowdown') || keys.has('s')) {
            ay += acceleration;
        }
        if (keys.has('arrowleft') || keys.has('a')) {
            ax -= acceleration;
        }
        if (keys.has('arrowright') || keys.has('d')) {
            ax += acceleration;
        }

        if (pointer.active) {
            ax += (pointer.x - player.x) * 2.8;
            ay += (pointer.y - player.y) * 2.8;
        }

        player.vx += ax * delta;
        player.vy += ay * delta;
        player.vx *= 0.9;
        player.vy *= 0.9;
        player.x += player.vx * delta;
        player.y += player.vy * delta;

        player.x = clamp(player.x, player.radius, width - player.radius);
        player.y = clamp(player.y, player.radius, height - player.radius);
    }

    function updateEntities(delta) {
        if (state.entities.length < 8) {
            spawnEntity();
        }

        state.entities.forEach(entity => {
            entity.x += entity.vx * delta;
            entity.y += entity.vy * delta;
            entity.phase += delta * entity.phaseSpeed;

            if (entity.x <= entity.radius || entity.x >= width - entity.radius) {
                entity.vx *= -1;
            }
            if (entity.y <= entity.radius || entity.y >= height - entity.radius) {
                entity.vy *= -1;
            }
        });

        state.entities = state.entities.filter(entity => {
            const collided = isColliding(state.player, entity);

            if (!collided) {
                return true;
            }

            if (entity.type === 'glitch') {
                state.score = Math.max(0, state.score + typeConfig.glitch.value);
                flashLevel = 1;
                spawnBurst(entity.x, entity.y, typeConfig.glitch.color, 12);
            } else {
                state.score += typeConfig[entity.type].value;
                state.categoryScore[entity.type] += 1;
                spawnBurst(entity.x, entity.y, typeConfig[entity.type].color, 10);
            }

            return false;
        });

        flashLevel = Math.max(0, flashLevel - delta * 2);
    }

    function updateParticles(delta) {
        state.particles = state.particles.filter(particle => {
            particle.x += particle.vx * delta;
            particle.y += particle.vy * delta;
            particle.life -= delta;
            return particle.life > 0;
        });
    }

    function drawGame() {
        const theme = document.body.getAttribute('data-theme') || 'dark';
        const palette = getGamePalette(theme);
        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = palette.background;
        ctx.fillRect(0, 0, width, height);
        drawGrid(palette.grid);
        drawScanLines(palette.scan);
        drawPlayer(palette.player);
        drawEntities();
        drawParticles();

        if (flashLevel > 0) {
            ctx.fillStyle = `rgba(255, 111, 145, ${flashLevel * 0.18})`;
            ctx.fillRect(0, 0, width, height);
        }
    }

    function drawGrid(color) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        for (let x = 0; x <= width; x += 54) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y <= height; y += 54) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawScanLines(color) {
        ctx.save();
        ctx.fillStyle = color;
        for (let y = 0; y <= height; y += 6) {
            ctx.fillRect(0, y, width, 1);
        }
        ctx.restore();
    }

    function drawPlayer(color) {
        const player = state.player;
        const gradient = ctx.createRadialGradient(player.x, player.y, 6, player.x, player.y, player.radius * 2.2);
        gradient.addColorStop(0, color.inner);
        gradient.addColorStop(1, color.outer);

        ctx.save();
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius * 1.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = color.ring;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.stroke();

        const selectedPlayer = playerOptions[state.selectedPlayerId];
        const sprite = selectedPlayer?.image;

        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            const size = player.radius * 3.4;
            ctx.save();
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.radius * 1.18, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(sprite, player.x - size / 2, player.y - size / 2, size, size);
            ctx.restore();
        } else {
            ctx.fillStyle = color.inner;
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.radius * 0.66, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function drawEntities() {
        state.entities.forEach(entity => {
            const config = typeConfig[entity.type];
            const pulse = Math.sin(entity.phase) * 2.5;
            const radius = entity.radius + pulse;
            const gradient = ctx.createRadialGradient(entity.x, entity.y, 2, entity.x, entity.y, radius * 1.8);
            gradient.addColorStop(0, hexToRgba(config.color, 0.95));
            gradient.addColorStop(1, hexToRgba(config.color, 0.05));

            ctx.save();
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(entity.x, entity.y, radius * 1.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = config.color;
            ctx.beginPath();
            ctx.arc(entity.x, entity.y, radius, 0, Math.PI * 2);
            ctx.fill();

            if (entity.type === 'glitch') {
                ctx.strokeStyle = '#ffd8e1';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(entity.x - radius, entity.y - radius);
                ctx.lineTo(entity.x + radius, entity.y + radius);
                ctx.moveTo(entity.x + radius, entity.y - radius);
                ctx.lineTo(entity.x - radius, entity.y + radius);
                ctx.stroke();
            }
            ctx.restore();
        });
    }

    function drawParticles() {
        state.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    function updateGameHud() {
        scoreEl.textContent = String(Math.round(state.score));
        timeEl.textContent = String(Math.max(0, Math.ceil(state.timeLeft)));
        bestEl.textContent = String(bestScore);
    }

    function setOverlay(label, title, text, isPlaying) {
        const labelNode = overlay?.querySelector('.game-overlay-label');
        if (labelNode) {
            labelNode.textContent = label;
        }
        overlayTitle.textContent = title;
        overlayText.textContent = text;
        overlay.classList.toggle('is-playing', Boolean(isPlaying));
    }

    function spawnEntity() {
        const roll = Math.random();
        const type = roll < 0.22
            ? 'glitch'
            : roll < 0.5
                ? 'ai'
                : roll < 0.77
                    ? 'geo'
                    : 'simulation';
        const config = typeConfig[type];
        state.entities.push({
            type,
            radius: config.radius,
            x: randomBetween(config.radius + 12, width - config.radius - 12),
            y: randomBetween(config.radius + 12, height - config.radius - 12),
            vx: randomBetween(-90, 90),
            vy: randomBetween(-90, 90),
            phase: Math.random() * Math.PI * 2,
            phaseSpeed: randomBetween(2, 5)
        });
    }

    function spawnBurst(x, y, color, amount) {
        for (let index = 0; index < amount; index += 1) {
            state.particles.push({
                x,
                y,
                vx: randomBetween(-140, 140),
                vy: randomBetween(-140, 140),
                radius: randomBetween(2, 4),
                color,
                life: randomBetween(0.35, 0.9)
            });
        }
    }

    function createPlayer() {
        return {
            x: width / 2,
            y: height / 2,
            vx: 0,
            vy: 0,
            radius: 18
        };
    }

    function syncCharacterPicker() {
        const selectedPlayer = playerOptions[state.selectedPlayerId] || playerOptions.sakura;

        currentPlayerEl.textContent = selectedPlayer.label;
        canvas.dataset.player = state.selectedPlayerId;
        characterGrid?.querySelectorAll('.game-character-option').forEach(button => {
            const isActive = button.dataset.player === state.selectedPlayerId;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    }

    function syncPauseButtons() {
        const label = state.paused ? '再開' : '一時停止';
        if (pauseButton) {
            pauseButton.textContent = label;
        }
        if (pauseInlineButton) {
            pauseInlineButton.textContent = label;
        }
    }

    function syncFullscreenButton() {
        if (!fullscreenButton) {
            return;
        }

        if (!document.fullscreenEnabled) {
            fullscreenButton.textContent = '全画面非対応';
            fullscreenButton.disabled = true;
            return;
        }

        const isFullscreen = document.fullscreenElement === gameShell;
        fullscreenButton.textContent = isFullscreen ? '全画面解除' : '全画面';
        fullscreenButton.setAttribute('aria-pressed', String(isFullscreen));
        if (exitFullscreenButton) {
            exitFullscreenButton.disabled = !isFullscreen;
        }
    }

    function startRoundTimer() {
        clearRoundTimer();
        state.timerHandle = setInterval(() => {
            if (!state.running || state.paused) {
                return;
            }

            state.remainingMs = Math.max(0, state.roundEndsAt - Date.now());
            state.timeLeft = state.remainingMs / 1000;
            updateGameHud();

            if (state.remainingMs <= 0) {
                endGame();
            }
        }, 100);
    }

    function clearRoundTimer() {
        if (state.timerHandle) {
            clearInterval(state.timerHandle);
            state.timerHandle = null;
        }
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

    window.addEventListener('fsd:apply-filter', event => {
        const filterId = event.detail?.filterId;

        if (!filterId) {
            return;
        }

        searchInput.value = '';
        activeFilter = filterId;
        syncFilterButtons();
        applyFilters();
        document.getElementById('projects-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        const isShowingAllProjects = query === '' && activeFilter === 'all';

        projects.forEach(project => {
            const isVisible = visibleProjects.includes(project);
            project.card.classList.toggle('is-hidden', !isVisible);
            project.card.hidden = !isVisible;
            project.card.setAttribute('aria-hidden', String(!isVisible));
        });

        emptyState.hidden = visibleProjects.length > 0;
        resultsEl.textContent = buildResultsLabel(visibleProjects.length, query, activeFilter);
        if (resetButton) {
            resetButton.textContent = isShowingAllProjects ? 'すべて表示中' : 'すべて表示する';
            resetButton.disabled = isShowingAllProjects;
        }

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

}

function normalizeText(value) {
    return (value || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

function flashButtonState(button, text) {
    if (!button) {
        return;
    }

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

function getCanvasPoint(source, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (source.clientX - rect.left) * scaleX,
        y: (source.clientY - rect.top) * scaleY
    };
}

function getGamePalette(theme) {
    if (theme === 'light') {
        return {
            background: '#eef5ff',
            grid: 'rgba(17, 35, 63, 0.06)',
            scan: 'rgba(17, 35, 63, 0.02)',
            player: {
                inner: 'rgba(13, 110, 253, 0.9)',
                outer: 'rgba(13, 110, 253, 0.05)',
                ring: 'rgba(13, 110, 253, 0.6)'
            }
        };
    }

    if (theme === 'sakura') {
        return {
            background: '#fff5f8',
            grid: 'rgba(145, 69, 103, 0.06)',
            scan: 'rgba(145, 69, 103, 0.02)',
            player: {
                inner: 'rgba(255, 93, 162, 0.92)',
                outer: 'rgba(255, 93, 162, 0.06)',
                ring: 'rgba(255, 93, 162, 0.58)'
            }
        };
    }

    if (theme === 'neon') {
        return {
            background: '#14062e',
            grid: 'rgba(64, 201, 255, 0.08)',
            scan: 'rgba(255, 0, 128, 0.03)',
            player: {
                inner: 'rgba(255, 0, 128, 0.95)',
                outer: 'rgba(255, 0, 128, 0.06)',
                ring: 'rgba(64, 201, 255, 0.72)'
            }
        };
    }

    return {
        background: '#091121',
        grid: 'rgba(255, 255, 255, 0.05)',
        scan: 'rgba(255, 255, 255, 0.02)',
        player: {
            inner: 'rgba(108, 199, 255, 0.92)',
            outer: 'rgba(108, 199, 255, 0.04)',
            ring: 'rgba(108, 199, 255, 0.66)'
        }
    };
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function isColliding(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= a.radius + b.radius;
}

function hexToRgba(hex, alpha) {
    const sanitized = hex.replace('#', '');
    const bigint = parseInt(sanitized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
    const productLinks = document.querySelectorAll('a.product-link');
    const productCards = document.querySelectorAll('.product-card');

    productLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const card = this.closest('.product-card');
            const productName = card?.querySelector('.product-name')?.textContent
                || document.getElementById('spotlight-name')?.textContent
                || 'Product';
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
    let currentTheme = localStorage.getItem('theme') || 'light';
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
    const fab = document.querySelector('.fab');
    const audioButton = document.getElementById('fab-audio');

    if (!fab) {
        return;
    }

    fab.classList.add('game-launcher-ready');

    if (audioButton) {
        syncSoundButton(audioButton);
        audioButton.addEventListener('click', () => {
            toggleSoundEffects();
            playSoundEffect('click');
        });
    }
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
    document.querySelectorAll('audio').forEach(a => (a.muted = !soundEnabled));
    syncSoundButton();
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
  document.querySelectorAll('audio').forEach(a => (a.muted = !soundEnabled));
  syncSoundButton();
}

function syncSoundButton(button = document.getElementById('fab-audio')) {
  if (!button) return;
  button.textContent = soundEnabled ? '🔊' : '🔇';
  button.setAttribute('aria-pressed', String(soundEnabled));
  button.setAttribute('aria-label', soundEnabled ? 'サウンドをミュート' : 'サウンドを有効化');
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
