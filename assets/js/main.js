const state = {
    theme: 'retro-light',
    lessons: [],
    activeLesson: null,
    lessonStepIndex: 0,
    exercise: null,
    streak: 0,
    xp: 0,
    badges: new Set(),
    journal: [],
    modal: null,
    alert: null
};

const PROGRESS_STORAGE_KEY = 'theblock-progress';

const lessonData = [
    {
        id: 'definicion',
        title: '¿Qué es un conjunto?',
        overview: 'Comprende la idea fundamental de un conjunto y cómo describimos sus elementos.',
        tags: ['Concepto base', 'Notación'],
        steps: [
            {
                heading: 'La intuición',
                body: 'Un conjunto es una colección bien definida de objetos llamados elementos. "Bien definida" significa que podemos decidir claramente si algo pertenece o no al conjunto.',
                diagram: { mode: 'basic', highlights: [] }
            },
            {
                heading: 'Notación por extensión',
                body: 'Listamos todos los elementos entre llaves. Por ejemplo: A = {1, 2, 3, 5}.',
                diagram: { mode: 'list', highlights: ['A'], sample: { A: [1, 2, 3, 5] } }
            },
            {
                heading: 'Notación por comprensión',
                body: 'Describimos las propiedades de los elementos. Por ejemplo: B = { x ∈ ℕ | x es par y x ≤ 10 }.',
                diagram: { mode: 'rule', highlights: ['B'], sample: { B: ['x es par', 'x ≤ 10'] } }
            }
        ]
    },
    {
        id: 'tipos',
        title: 'Tipos de conjuntos',
        overview: 'Distingue entre conjuntos finitos, infinitos, vacíos y universales.',
        tags: ['Clasificación'],
        steps: [
            {
                heading: 'Conjunto vacío',
                body: 'El conjunto vacío (∅) no contiene elementos. Es único y se representa como ∅ o { }.',
                diagram: { mode: 'empty', highlights: [] }
            },
            {
                heading: 'Conjuntos finitos',
                body: 'Contienen un número contable de elementos. Por ejemplo, C = {manzana, pera, uva}.',
                diagram: { mode: 'list', highlights: ['C'], sample: { C: ['manzana', 'pera', 'uva'] } }
            },
            {
                heading: 'Conjuntos infinitos',
                body: 'No tienen un último elemento. Ejemplo: ℕ = {1, 2, 3, ...}.',
                diagram: { mode: 'infinite', highlights: ['ℕ'] }
            }
        ]
    },
    {
        id: 'operaciones',
        title: 'Operaciones fundamentales',
        overview: 'Observa cómo se combinan conjuntos con unión, intersección, diferencia, diferencia simétrica y complemento.',
        tags: ['Operaciones'],
        steps: [
            {
                heading: 'Unión (∪)',
                body: 'A ∪ B contiene todos los elementos que están en A, en B o en ambos. Es la operación que junta todo.',
                diagram: { mode: 'venn2', highlights: ['A', 'B', 'A∩B'] }
            },
            {
                heading: 'Intersección (∩)',
                body: 'A ∩ B toma solo los elementos que comparten ambos conjuntos. Visualmente es la región superpuesta.',
                diagram: { mode: 'venn2', highlights: ['A∩B'] }
            },
            {
                heading: 'Diferencia (∖) y complemento',
                body: 'A ∖ B conserva lo que está en A pero no en B. El complemento A′ incluye lo que está fuera de A respecto al universo U.',
                diagram: { mode: 'venn2', highlights: ['A\B'], complement: true }
            },
            {
                heading: 'Diferencia simétrica (Δ)',
                body: 'A Δ B conserva lo exclusivo: los elementos de A o de B, pero no de ambos.',
                diagram: { mode: 'venn2', highlights: ['soloA', 'soloB'] }
            }
        ]
    },
    {
        id: 'relaciones',
        title: 'Relaciones de pertenencia y contención',
        overview: 'Diferencia entre pertenecer a un conjunto y ser subconjunto de otro.',
        tags: ['Relaciones'],
        steps: [
            {
                heading: 'Pertenencia (∈)',
                body: 'Si a ∈ A, entonces "a" es un elemento del conjunto A.',
                diagram: { mode: 'membership', highlights: ['a∈A'] }
            },
            {
                heading: 'Contención (⊂)',
                body: 'Si A ⊂ B, todos los elementos de A también están en B.',
                diagram: { mode: 'subset', highlights: ['A⊂B'] }
            },
            {
                heading: 'Igualdad de conjuntos',
                body: 'Dos conjuntos son iguales si contienen los mismos elementos. No importa el orden ni la repetición.',
                diagram: { mode: 'equal', highlights: ['A=B'] }
            }
        ]
    }
];

const badgeCatalog = [
    { id: 'first-win', label: 'Primer acierto', icon: '▲', condition: s => s.xp >= 10 },
    { id: 'streak-3', label: 'Racha x3', icon: '✦', condition: s => s.streak >= 3 },
    { id: 'venn-guru', label: 'Amante del diagrama', icon: '◎', condition: s => s.journal.filter(j => j.mode === 'diagram' && j.correct).length >= 3 },
    { id: 'advanced-ace', label: 'Avanzado dominado', icon: '✷', condition: s => s.journal.some(j => j.difficulty === 'advanced' && j.correct) }
];

const xpByDifficulty = {
    beginner: 20,
    intermediate: 35,
    advanced: 55
};

const universeByDifficulty = {
    beginner: Array.from({ length: 9 }, (_, i) => i + 1),
    intermediate: Array.from({ length: 12 }, (_, i) => i - 5),
    advanced: ['-3', '-1', '0', '1/2', '1', '√2', 'π', 'e', '4', '5']
};

const operationLabels = {
    union: '∪',
    intersection: '∩',
    difference: '∖',
    symmetricDifference: 'Δ',
    complement: "'"
};

const responseModeLabels = {
    multipleChoice: 'Opción múltiple',
    fillSet: 'Completar conjunto',
    diagram: 'Diagrama'
};

const vennConfigs = {
    base: {
        2: {
            viewBox: '0 0 220 220',
            radius: 70,
            positions: [
                { cx: 90, cy: 110 },
                { cx: 130, cy: 110 }
            ]
        },
        3: {
            viewBox: '0 0 220 220',
            radius: 70,
            positions: [
                { cx: 90, cy: 110 },
                { cx: 130, cy: 110 },
                { cx: 110, cy: 80 }
            ]
        },
        4: {
            viewBox: '0 0 220 220',
            radius: 60,
            positions: [
                { cx: 80, cy: 110 },
                { cx: 140, cy: 110 },
                { cx: 110, cy: 80 },
                { cx: 110, cy: 140 }
            ]
        }
    },
    interactive: {
        2: {
            viewBox: '0 0 320 240',
            radius: 100,
            positions: [
                { cx: 120, cy: 120 },
                { cx: 200, cy: 120 }
            ]
        },
        3: {
            viewBox: '0 0 320 240',
            radius: 100,
            positions: [
                { cx: 140, cy: 120 },
                { cx: 200, cy: 120 },
                { cx: 170, cy: 80 }
            ]
        },
        4: {
            viewBox: '0 0 320 240',
            radius: 90,
            positions: [
                { cx: 130, cy: 120 },
                { cx: 210, cy: 120 },
                { cx: 170, cy: 70 },
                { cx: 170, cy: 170 }
            ]
        }
    }
};

function getVennConfig(count, mode = 'base') {
    return vennConfigs[mode]?.[count] || null;
}

document.addEventListener('DOMContentLoaded', () => {
    loadPersistedProgress();
    initSplashScreen();
    wireNavigation();
    setupTheme();
    initLearnModule();
    setupResultModal();
    setupAlertModal();
    setupPracticeGenerator();
    hydrateGamification();
});

function loadPersistedProgress() {
    try {
        const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
        if (!raw) {
            renderScoreboard();
            return;
        }
        const data = JSON.parse(raw);
        if (typeof data.xp === 'number' && data.xp >= 0) {
            state.xp = data.xp;
        }
        if (typeof data.streak === 'number' && data.streak >= 0) {
            state.streak = data.streak;
        }
        if (Array.isArray(data.badges)) {
            state.badges = new Set(data.badges);
        }
        if (Array.isArray(data.journal)) {
            state.journal = data.journal.slice(0, 12).map(entry => ({
                ...entry,
                timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date()
            }));
        }
    } catch (error) {
        console.warn('No se pudo restaurar el progreso almacenado.', error);
    } finally {
        renderScoreboard();
    }
}

function saveProgressToStorage() {
    try {
        const payload = {
            xp: state.xp,
            streak: state.streak,
            badges: [...state.badges],
            journal: state.journal.slice(0, 12).map(entry => ({
                ...entry,
                timestamp: entry.timestamp instanceof Date ? entry.timestamp.toISOString() : entry.timestamp
            }))
        };
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
        console.warn('No se pudo guardar el progreso.', error);
    }
}

function renderScoreboard() {
    const streakCounter = document.getElementById('streakCounter');
    const xpCounter = document.getElementById('xpCounter');
    const badgeCounter = document.getElementById('badgeCounter');
    if (streakCounter) {
        streakCounter.textContent = state.streak;
    }
    if (xpCounter) {
        xpCounter.textContent = `${state.xp} XP`;
    }
    if (badgeCounter) {
        const count = state.badges.size;
        badgeCounter.textContent = count
            ? `${count} insignia${count > 1 ? 's' : ''}`
            : 'Sin insignias';
    }
}

function initSplashScreen() {
    const splash = document.getElementById('splashScreen');
    if (!splash) {
        const body = document.body;
        body.classList.remove('content-preload');
        body.classList.add('content-reveal');
        return;
    }

    const body = document.body;
    let dismissed = false;

    const handleKey = event => {
        if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            hideSplash();
        }
    };

    const hideSplash = () => {
        if (dismissed) return;
        dismissed = true;
        splash.classList.add('is-hidden');
        body.classList.remove('splash-active');
        body.classList.add('content-reveal');
        body.classList.remove('content-preload');
        document.removeEventListener('keydown', handleKey);
        window.setTimeout(() => {
            const focusTarget = document.querySelector('.nav-link, .cta-button, #themeToggle');
            if (focusTarget && typeof focusTarget.focus === 'function') {
                focusTarget.focus({ preventScroll: true });
            }
            splash.remove();
        }, 650);
    };

    body.classList.add('splash-active');
    window.setTimeout(hideSplash, 3400);
    splash.addEventListener('click', hideSplash, { once: true });
    document.addEventListener('keydown', handleKey);

    window.setTimeout(() => {
        if (typeof splash.focus === 'function') {
            splash.focus({ preventScroll: true });
        }
    }, 0);
}

function cacheLessons() {
    state.lessons = lessonData;
}

function wireNavigation() {
    const navButtons = document.querySelectorAll('[data-target]');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            const section = document.getElementById(target);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function setupTheme() {
    const savedTheme = localStorage.getItem('theblock-theme');
    const toggle = document.getElementById('themeToggle');
    const label = document.getElementById('themeToggleLabel');

    const applyTheme = (theme, options = {}) => {
        state.theme = theme;
        document.body.dataset.theme = theme;
        if (label) {
            label.textContent = theme === 'retro-light' ? 'Modo claro' : 'Modo oscuro';
        }
        if (toggle) {
            toggle.setAttribute('aria-pressed', theme === 'retro-dark' ? 'true' : 'false');
        }
        if (options.persist !== false) {
            try {
                localStorage.setItem('theblock-theme', theme);
            } catch (error) {
                console.warn('No se pudo guardar el tema seleccionado.', error);
            }
        }
    };

    applyTheme(savedTheme || state.theme, { persist: false });

    if (!toggle) {
        return;
    }

    toggle.addEventListener('click', () => {
        const nextTheme = state.theme === 'retro-light' ? 'retro-dark' : 'retro-light';
        applyTheme(nextTheme);
    });
}

function buildLessonMenu() {
    const menu = document.getElementById('lessonMenu');
    menu.innerHTML = '';

    state.lessons.forEach((lesson, index) => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.className = 'lesson-card fade-in';
        button.type = 'button';
        button.setAttribute('data-lesson-id', lesson.id);
        button.innerHTML = `
            <h3>${lesson.title}</h3>
            <p>${lesson.overview}</p>
            <div class="lesson-tags">${lesson.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
        `;
        button.addEventListener('click', () => openLesson(lesson.id));
        if (index === 0) {
            setTimeout(() => button.classList.add('is-active'), 150);
        }
        li.appendChild(button);
        menu.appendChild(li);
    });
}

function openLesson(lessonId) {
    const lesson = state.lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    state.activeLesson = lesson;
    state.lessonStepIndex = 0;

    document.querySelectorAll('.lesson-card').forEach(card => {
        card.classList.toggle('is-active', card.dataset.lessonId === lessonId);
    });

    document.getElementById('lessonPlaceholder').hidden = true;
    document.getElementById('lessonContent').hidden = false;

    updateLessonView();
}

function setupLessonControls() {
    const prev = document.getElementById('lessonPrev');
    const next = document.getElementById('lessonNext');
    if (!prev || !next) return;
    prev.addEventListener('click', () => {
        if (!state.activeLesson) return;
        state.lessonStepIndex = Math.max(0, state.lessonStepIndex - 1);
        updateLessonView();
    });
    next.addEventListener('click', () => {
        if (!state.activeLesson) return;
        state.lessonStepIndex = Math.min(state.activeLesson.steps.length - 1, state.lessonStepIndex + 1);
        updateLessonView();
    });
}

function initLearnModule() {
    const menu = document.getElementById('lessonMenu');
    const content = document.getElementById('lessonContent');
    const prev = document.getElementById('lessonPrev');
    const next = document.getElementById('lessonNext');
    if (!menu || !content || !prev || !next) {
        state.lessons = [];
        return;
    }
    cacheLessons();
    buildLessonMenu();
    setupLessonControls();
}

function updateLessonView() {
    if (!state.activeLesson) return;

    const { steps, title, overview } = state.activeLesson;
    const step = steps[state.lessonStepIndex];

    document.getElementById('lessonTitle').textContent = title;
    document.getElementById('lessonOverview').textContent = overview;
    document.getElementById('lessonProgress').textContent = `Paso ${state.lessonStepIndex + 1} de ${steps.length}`;

    const lessonText = document.getElementById('lessonText');
    lessonText.innerHTML = `
        <h4>${step.heading}</h4>
        <p>${step.body}</p>
    `;

    renderLessonDiagram(step.diagram);

    const prev = document.getElementById('lessonPrev');
    const next = document.getElementById('lessonNext');
    prev.disabled = state.lessonStepIndex === 0;
    next.disabled = state.lessonStepIndex === steps.length - 1;
}

function renderLessonDiagram(diagram) {
    const venn = document.getElementById('lessonVenn');
    const controls = document.getElementById('lessonVisualControls');
    venn.innerHTML = '';
    controls.innerHTML = '';

    switch (diagram.mode) {
        case 'basic':
            venn.innerHTML = `<div class="venn-diagram" aria-hidden="true">Elige un paso para visualizar.</div>`;
            break;
        case 'list':
            venn.innerHTML = buildListDiagram(diagram.sample || {});
            break;
        case 'rule':
            venn.innerHTML = buildRuleDiagram(diagram.sample || {});
            break;
        case 'empty':
            venn.innerHTML = `<div class="venn-diagram" aria-live="polite">
                <p>∅ = { }</p>
                <p>No hay elementos dentro, pero es un conjunto válido.</p>
            </div>`;
            break;
        case 'infinite':
            venn.innerHTML = `<div class="venn-diagram">
                <p>ℕ = {1, 2, 3, …}</p>
                <p>Siempre podemos encontrar un número natural siguiente.</p>
            </div>`;
            break;
        case 'venn2':
            venn.appendChild(buildVennSVG(2, { highlights: diagram.highlights, complement: diagram.complement }));
            controls.append(...['A ∪ B', 'A ∩ B', 'A ∖ B', 'B ∖ A', 'A Δ B'].map(label => {
                const btn = document.createElement('button');
                btn.textContent = label;
                btn.addEventListener('click', () => highlightLessonOperation(label, venn));
                return btn;
            }));
            break;
        case 'membership':
            venn.innerHTML = `<div class="venn-diagram"><p>Si a ∈ A, entonces a está dentro del conjunto A.</p></div>`;
            break;
        case 'subset':
            venn.appendChild(buildSubsetSVG());
            break;
        case 'equal':
            venn.innerHTML = `<div class="venn-diagram"><p>A = B porque comparten exactamente los mismos elementos.</p></div>`;
            break;
        default:
            venn.innerHTML = `<div class="venn-diagram">Visualización próximamente.</div>`;
    }
}

function buildListDiagram(sample) {
    const entries = Object.entries(sample);
    if (!entries.length) return '<div class="venn-diagram">Añade elementos a tu conjunto.</div>';
    return `
        <div class="venn-diagram">
            ${entries.map(([name, elements]) => `
                <div><strong>${name}</strong> = { ${elements.join(', ')} }</div>
            `).join('')}
        </div>
    `;
}

function buildRuleDiagram(sample) {
    const entries = Object.entries(sample);
    return `
        <div class="venn-diagram">
            ${entries.map(([name, rules]) => `
                <div><strong>${name}</strong> = { x | ${rules.join(' y ')} }</div>
            `).join('')}
        </div>
    `;
}

function buildVennSVG(count = 2, options = {}) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    const config = getVennConfig(count, 'base');
    svg.setAttribute('viewBox', config?.viewBox || '0 0 220 220');
    svg.classList.add('venn-diagram-svg');

    const palette = ['rgba(255, 107, 107, 0.58)', 'rgba(76, 201, 240, 0.58)', 'rgba(110, 250, 204, 0.58)', 'rgba(255, 214, 102, 0.58)'];

    if (!config) {
        return svg;
    }

    config.positions.forEach((pos, index) => {
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', pos.cx);
        circle.setAttribute('cy', pos.cy);
        circle.setAttribute('r', config.radius);
        circle.setAttribute('fill', palette[index]);
        circle.setAttribute('fill-opacity', '0.55');
        circle.setAttribute('class', 'venn-region');
        svg.appendChild(circle);
        const label = document.createElementNS(svgNS, 'text');
        label.textContent = String.fromCharCode(65 + index);
        label.setAttribute('x', pos.cx);
        label.setAttribute('y', pos.cy);
        label.setAttribute('class', 'region-label');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('dominant-baseline', 'middle');
        svg.appendChild(label);
    });

    if (options.highlights) {
        const text = document.createElementNS(svgNS, 'text');
        text.textContent = options.highlights.join(' · ');
        text.setAttribute('x', 18);
        text.setAttribute('y', 208);
        text.setAttribute('class', 'region-label');
        svg.appendChild(text);
    }

    if (options.complement) {
        const frame = document.createElementNS(svgNS, 'rect');
        frame.setAttribute('x', 10);
        frame.setAttribute('y', 10);
        frame.setAttribute('width', 200);
        frame.setAttribute('height', 200);
        frame.setAttribute('fill', 'none');
        frame.setAttribute('stroke', 'rgba(255, 255, 255, 0.4)');
        frame.setAttribute('stroke-dasharray', '6 6');
        svg.appendChild(frame);
    }

    return svg;
}

function highlightLessonOperation(label, container) {
    container.classList.add('highlighted');
    setTimeout(() => container.classList.remove('highlighted'), 400);
    const feedback = document.createElement('div');
    feedback.className = 'fade-in';
    feedback.textContent = `Mostrando ${label}`;
    container.appendChild(feedback);
    setTimeout(() => feedback.remove(), 1400);
}

function buildSubsetSVG() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 220 220');
    svg.classList.add('venn-diagram-svg');

    const outer = document.createElementNS(svgNS, 'rect');
    outer.setAttribute('x', 20);
    outer.setAttribute('y', 20);
    outer.setAttribute('width', 180);
    outer.setAttribute('height', 180);
    outer.setAttribute('rx', 24);
    outer.setAttribute('fill', 'rgba(76, 201, 240, 0.28)');
    svg.appendChild(outer);

    const inner = document.createElementNS(svgNS, 'rect');
    inner.setAttribute('x', 60);
    inner.setAttribute('y', 60);
    inner.setAttribute('width', 100);
    inner.setAttribute('height', 100);
    inner.setAttribute('rx', 20);
    inner.setAttribute('fill', 'rgba(255, 107, 107, 0.55)');
    svg.appendChild(inner);

    const text = document.createElementNS(svgNS, 'text');
    text.textContent = 'A ⊂ B';
    text.setAttribute('x', 80);
    text.setAttribute('y', 120);
    text.setAttribute('class', 'region-label');
    svg.appendChild(text);

    return svg;
}

function setupPracticeGenerator() {
    const form = document.getElementById('exerciseForm');
    const responseForm = document.getElementById('responseForm');
    const configNotice = document.getElementById('configNotice');
    form.addEventListener('submit', event => {
        event.preventDefault();
        const config = extractExerciseConfig(new FormData(form));
        if (configNotice) {
            configNotice.hidden = true;
            configNotice.textContent = '';
        }
        if (!config.operations.length) {
            showAlertModal('Selecciona al menos una operación para generar un ejercicio.');
            return;
        }
        if (config.operations.length === 1 && config.operations[0] === 'complement') {
            showAlertModal('El complemento necesita combinarse con otra operación. Activa al menos otra opción además de complemento.');
            return;
        }
        const exercise = generateExercise(config);
        state.exercise = exercise;
        renderExercise(exercise);
    });
    responseForm.addEventListener('submit', handleResponseSubmission);
}

function extractExerciseConfig(formData) {
    const operations = formData.getAll('operations');
    const setCount = Number(formData.get('setCount'));
    const difficulty = formData.get('difficulty');
    const responseMode = formData.get('responseMode');

    return { operations, setCount, difficulty, responseMode };
}

function generateExercise(config) {
    const universe = universeByDifficulty[config.difficulty];
    const setNames = ['A', 'B', 'C', 'D'].slice(0, config.setCount);
    const sets = generateSets(universe, setNames, config.difficulty);
    const expression = buildExpressionTree(config.operations, config.setCount);
    const evaluation = evaluateExpression(expression, sets, universe);

    const prompt = formatExpression(expression);
    const answerRegions = computeAnswerRegions(expression, setNames);
    const response = buildResponseOptions(evaluation, config.responseMode, universe, sets, expression, setNames, answerRegions);

    return {
        config,
        sets,
        setNames,
        universe,
        expression,
        prompt,
        response,
        evaluation,
        answerRegions,
        timestamp: new Date()
    };
}

function generateSets(universe, setNames, difficulty) {
    const sets = {};
    const multiplier = difficulty === 'beginner' ? 0.4 : difficulty === 'intermediate' ? 0.6 : 0.75;
    const size = Math.max(2, Math.round(universe.length * multiplier * 0.4));

    setNames.forEach((name, index) => {
        sets[name] = new Set(pickRandomSubset(universe, size + index));
    });

    return sets;
}

function pickRandomSubset(universe, size) {
    const shuffled = [...universe].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(size, shuffled.length)).map(String);
}

function buildExpressionTree(operations, setCount) {
    const setNames = ['A', 'B', 'C', 'D'].slice(0, setCount);

    function build(depth = 0) {
        const useSet = depth > 2 || Math.random() < 0.35;
        if (useSet) {
            return { type: 'set', name: randomItem(setNames) };
        }
        const op = randomItem(operations);
        if (op === 'complement') {
            return { type: 'operation', op, left: build(depth + 1) };
        }
        return { type: 'operation', op, left: build(depth + 1), right: build(depth + 1) };
    }

    let tree = build();

    // Guarantee at least two sets in tree
    const setsUsed = new Set();
    traverse(tree, node => {
        if (node.type === 'set') setsUsed.add(node.name);
    });
    if (setsUsed.size < 2 && setCount > 1) {
        tree = {
            type: 'operation',
            op: randomItem(operations.filter(o => o !== 'complement') || ['union']),
            left: { type: 'set', name: setNames[0] },
            right: { type: 'set', name: setNames[1] }
        };
    }

    return tree;
}

function traverse(node, fn) {
    fn(node);
    if (node.type === 'operation') {
        traverse(node.left, fn);
        if (node.right) traverse(node.right, fn);
    }
}

function evaluateExpression(node, sets, universe) {
    const steps = [];

    function evalNode(current) {
        if (current.type === 'set') {
            return new Set(sets[current.name]);
        }
    const opLabel = operationLabels[current.op] ?? current.op ?? '?';
        if (current.op === 'complement') {
            const left = evalNode(current.left);
            const result = new Set(universe.map(String).filter(el => !left.has(el)));
            steps.push({
                label: `${formatExpression(current.left)}'`,
                description: `Complemento respecto a U: tomamos los elementos que no pertenecen a ${formatExpression(current.left)}.`,
                result
            });
            return result;
        }
        const left = evalNode(current.left);
        const right = evalNode(current.right);
        let result;
        switch (current.op) {
            case 'union':
                result = new Set([...left, ...right]);
                break;
            case 'intersection':
                result = new Set([...left].filter(x => right.has(x)));
                break;
            case 'difference':
                result = new Set([...left].filter(x => !right.has(x)));
                break;
            case 'symmetricDifference':
                result = new Set([...left].filter(x => !right.has(x)).concat([...right].filter(x => !left.has(x))));
                break;
            default:
                result = new Set(left);
        }
        steps.push({
            label: `${formatExpression(current.left)} ${opLabel} ${formatExpression(current.right)}`,
            description: describeOperation(current.op, left, right),
            result
        });
        return result;
    }

    const result = evalNode(node);
    return { result, steps };
}

function describeOperation(op, left, right) {
    const toList = set => `{ ${[...set].join(', ')} }`;
    switch (op) {
        case 'union':
            return `Unimos todos los elementos: ${toList(left)} ∪ ${toList(right)}`;
        case 'intersection':
            return `Tomamos los elementos comunes: ${toList(left)} ∩ ${toList(right)}`;
        case 'difference':
            return `Mantenemos lo exclusivo del primer conjunto: ${toList(left)} ∖ ${toList(right)}`;
        case 'symmetricDifference':
            return `Conservamos lo exclusivo de cada lado: ${toList(left)} Δ ${toList(right)}`;
        default:
            return 'Operación aplicada.';
    }
}

function formatExpression(node) {
    if (!node) return '?';
    if (node.type === 'set') return node.name;
    if (node.op === 'complement') {
        const inner = formatExpression(node.left);
        const wrap = node.left && node.left.type === 'operation' && !inner.startsWith('(');
        return `${wrap ? `(${inner})` : inner}'`;
    }
    const opSymbol = operationLabels[node.op] ?? node.op ?? '?';
    const left = formatExpression(node.left);
    const right = formatExpression(node.right);
    return `(${left} ${opSymbol} ${right})`;
}

function buildResponseOptions(evaluation, mode, universe, sets, expression, setNames, answerRegions) {
    const correct = [...evaluation.result].sort();

    if (mode === 'multipleChoice') {
        const options = new Set();
        options.add(stringifySet(correct));
        while (options.size < 4) {
            const variant = perturbSet(correct, universe);
            options.add(stringifySet(variant));
        }
        const entries = [...options].sort(() => Math.random() - 0.5);
        return {
            mode,
            prompt: 'Selecciona el conjunto resultado.',
            options: entries,
            correct: stringifySet(correct)
        };
    }

    if (mode === 'fillSet') {
        return {
            mode,
            prompt: 'Escribe el conjunto resultado (separa con coma).',
            correct,
            placeholder: 'Ej: 1, 2, 3'
        };
    }

    if (mode === 'diagram') {
        return {
            mode,
            prompt: 'Marca las regiones correctas en el diagrama.',
            regions: answerRegions,
            setNames,
            correct: answerRegions.filter(r => r.active).map(r => r.id)
        };
    }

    return { mode: 'multipleChoice', options: [], correct: stringifySet(correct) };
}

function stringifySet(elements) {
    if (!elements || elements.length === 0) {
        return '∅';
    }
    return `{ ${elements.join(', ')} }`;
}

function perturbSet(base, universe) {
    const set = new Set(base);
    const action = Math.random();
    if (action < 0.33 && set.size) {
        const arr = [...set];
        set.delete(randomItem(arr));
    } else if (action < 0.66) {
        const candidates = universe.filter(el => !set.has(String(el)));
        if (candidates.length) {
            set.add(String(randomItem(candidates)));
        }
    } else if (set.size && universe.length) {
        const remove = randomItem([...set]);
        set.delete(remove);
        const add = randomItem(universe.map(String));
        set.add(add);
    }
    return [...set].sort();
}

function computeAnswerRegions(expression, setNames) {
    const regions = [];
    const combos = Math.pow(2, setNames.length);

    for (let mask = 0; mask < combos; mask++) {
        const membership = {};
        setNames.forEach((name, idx) => {
            membership[name] = Boolean(mask & (1 << idx));
        });
        const code = mask.toString(2).padStart(setNames.length, '0');
        const active = evaluateExpressionBoolean(expression, membership);
        regions.push({ id: code, membership, active });
    }

    return regions;
}

function evaluateExpressionBoolean(node, membership) {
    if (node.type === 'set') {
        return Boolean(membership[node.name]);
    }
    if (node.op === 'complement') {
        return !evaluateExpressionBoolean(node.left, membership);
    }
    const left = evaluateExpressionBoolean(node.left, membership);
    const right = evaluateExpressionBoolean(node.right, membership);
    switch (node.op) {
        case 'union':
            return left || right;
        case 'intersection':
            return left && right;
        case 'difference':
            return left && !right;
        case 'symmetricDifference':
            return (left && !right) || (!left && right);
        default:
            return false;
    }
}

function renderExercise(exercise) {
    const meta = document.getElementById('exerciseMeta');
    const prompt = document.getElementById('exercisePrompt');
    const venn = document.getElementById('practiceVenn');
    const response = document.getElementById('responseForm');
    const srFeedback = document.getElementById('srFeedback');

    closeResultModal({ silent: true });
    if (srFeedback) {
        srFeedback.textContent = '';
    }

    meta.innerHTML = `
        <span>${exercise.config.difficulty.toUpperCase()}</span>
        <span>${exercise.config.setCount} conjuntos</span>
        <span>${responseModeLabels[exercise.config.responseMode]}</span>
        <span>${new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(exercise.timestamp)}</span>
    `;

    prompt.textContent = `${exercise.prompt} = ?`;

    venn.innerHTML = '';
    const vennDiagram = buildVennSVG(exercise.config.setCount, {});
    venn.appendChild(vennDiagram);
    annotateVennWithSets(venn, exercise.sets);

    buildResponseUI(response, exercise.response);
}

function annotateVennWithSets(container, sets) {
    const legend = document.createElement('div');
    legend.className = 'venn-legend';
    legend.innerHTML = Object.entries(sets).map(([name, values]) => `
        <div><strong>${name}</strong> = ${stringifySet([...values].sort())}</div>
    `).join('');
    container.appendChild(legend);
}

function buildResponseUI(form, response) {
    form.innerHTML = '';
    form.hidden = false;
    form.classList.remove('is-locked');
    form.dataset.locked = 'false';
    delete form.dataset.selectedRegions;
    delete form.dataset.correctRegions;

    const prompt = document.createElement('p');
    prompt.textContent = response.prompt;
    form.appendChild(prompt);

    if (response.mode === 'multipleChoice') {
        response.options.forEach(option => {
            const id = `option-${Math.random().toString(36).slice(2, 8)}`;
            const wrapper = document.createElement('label');
            wrapper.className = 'option-card';
            wrapper.setAttribute('for', id);
            wrapper.innerHTML = `
                <input type="radio" name="answer" id="${id}" value="${option}">
                <span>${option}</span>
            `;
            form.appendChild(wrapper);
        });
    } else if (response.mode === 'fillSet') {
        const input = document.createElement('input');
        input.type = 'text';
        input.name = 'answer';
        input.className = 'fill-input';
        input.autocomplete = 'off';
        input.placeholder = response.placeholder;
        form.appendChild(input);
    } else if (response.mode === 'diagram') {
        buildDiagramResponse(form, response);
    }

    const notice = document.createElement('p');
    notice.id = 'responseNotice';
    notice.className = 'form-notice';
    notice.setAttribute('role', 'alert');
    notice.hidden = true;
    form.appendChild(notice);

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'cta-button';
    submit.textContent = 'Validar respuesta';
    form.appendChild(submit);
}

function disableResponseInputs(form) {
    form.classList.add('is-locked');
    Array.from(form.elements).forEach(el => {
        if (el.tagName === 'BUTTON') {
            el.disabled = true;
        } else if ('disabled' in el) {
            el.disabled = true;
        }
    });
}

function buildDiagramResponse(form, response) {
    const wrapper = document.createElement('div');
    wrapper.className = 'diagram-response';
    const help = document.createElement('div');
    help.className = 'diagram-help';
    help.textContent = 'Haz clic en las regiones que corresponden al resultado.';
    wrapper.appendChild(help);

    const svg = buildInteractiveDiagram(response.setNames.length);
    wrapper.appendChild(svg);

    const selectedRegions = new Set();

    svg.querySelectorAll('[data-region-id]').forEach(region => {
        region.addEventListener('click', () => {
            if (form.dataset.locked === 'true') return;
            const id = region.getAttribute('data-region-id');
            if (selectedRegions.has(id)) {
                selectedRegions.delete(id);
                region.classList.remove('is-active');
            } else {
                selectedRegions.add(id);
                region.classList.add('is-active');
            }
            form.dataset.selectedRegions = JSON.stringify([...selectedRegions]);
        });
    });

    form.appendChild(wrapper);
    form.dataset.selectedRegions = JSON.stringify([]);

    form.dataset.correctRegions = JSON.stringify(response.correct);
}

function buildInteractiveDiagram(count) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    const config = getVennConfig(count, 'interactive');
    svg.setAttribute('viewBox', config?.viewBox || '0 0 320 240');
    svg.classList.add('venn-diagram-svg');

    const palette = ['rgba(255, 107, 107, 0.4)', 'rgba(76, 201, 240, 0.4)', 'rgba(110, 250, 204, 0.4)', 'rgba(255, 214, 102, 0.4)'];

    if (!config) {
        return svg;
    }

    config.positions.forEach((pos, index) => {
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', pos.cx);
        circle.setAttribute('cy', pos.cy);
        circle.setAttribute('r', config.radius);
        circle.setAttribute('fill', palette[index]);
        circle.setAttribute('fill-opacity', '0.42');
        circle.setAttribute('stroke', 'rgba(255,255,255,0.4)');
        circle.setAttribute('stroke-dasharray', '4 6');
        svg.appendChild(circle);

        const label = document.createElementNS(svgNS, 'text');
        label.textContent = String.fromCharCode(65 + index);
        label.setAttribute('x', pos.cx);
        label.setAttribute('y', pos.cy);
        label.setAttribute('class', 'region-label');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('dominant-baseline', 'middle');
        svg.appendChild(label);
    });

    const regionCount = Math.pow(2, count);

    for (let mask = 0; mask < regionCount; mask++) {
        const region = document.createElementNS(svgNS, 'circle');
        region.setAttribute('cx', 170 + Math.cos((mask / regionCount) * Math.PI * 2) * 40);
        region.setAttribute('cy', 120 + Math.sin((mask / regionCount) * Math.PI * 2) * 40);
        region.setAttribute('r', 16);
        region.setAttribute('fill', 'transparent');
        region.setAttribute('class', 'diagram-hotspot');
        region.setAttribute('data-region-id', mask.toString(2).padStart(count, '0'));
        svg.appendChild(region);
    }

    return svg;
}

function handleResponseSubmission(event) {
    event.preventDefault();
    const form = event.target;
    if (form.dataset.locked === 'true') {
        return;
    }
    const { exercise } = state;
    if (!exercise) return;

    const srFeedback = document.getElementById('srFeedback');
    const notice = document.getElementById('responseNotice');
    if (notice) {
        notice.textContent = '';
        notice.hidden = true;
    }

    let correct = false;
    const answerPayload = { mode: exercise.response.mode, value: null };

    if (exercise.response.mode === 'multipleChoice') {
        const choice = form.elements['answer'];
        if (!choice || !choice.value) {
            const message = 'Selecciona una opción antes de validar.';
            if (notice) {
                notice.textContent = message;
                notice.hidden = false;
            }
            if (srFeedback) {
                srFeedback.textContent = message;
            }
            return;
        }
        answerPayload.value = choice.value;
        correct = choice.value === exercise.response.correct;
    } else if (exercise.response.mode === 'fillSet') {
        const input = form.elements['answer'];
        const parsed = parseUserSet(input.value);
        answerPayload.value = parsed;
        correct = compareSets(parsed, exercise.response.correct);
    } else if (exercise.response.mode === 'diagram') {
        const selected = JSON.parse(form.dataset.selectedRegions || '[]');
        answerPayload.value = selected;
        const correctRegions = JSON.parse(form.dataset.correctRegions || '[]');
        correct = compareRegionSelections(selected, correctRegions);
    }

    form.dataset.locked = 'true';
    disableResponseInputs(form);

    const summary = updateFeedback(correct, srFeedback, exercise, answerPayload);
    updateProgress(correct, exercise);

    logJournalEntry(correct, exercise);
    updateGamificationPanels();
    showResultModal(summary, exercise);
}

function parseUserSet(input) {
    if (!input.trim()) return [];
    return input.split(/[;,]/).map(el => el.trim()).filter(Boolean);
}

function compareSets(user, correct) {
    const normalizedUser = new Set(user.map(String));
    const normalizedCorrect = new Set(correct.map(String));
    if (normalizedUser.size !== normalizedCorrect.size) return false;
    for (const value of normalizedCorrect) {
        if (!normalizedUser.has(value)) return false;
    }
    return true;
}

function compareRegionSelections(selected, correct) {
    if (selected.length !== correct.length) return false;
    const s = new Set(selected);
    return correct.every(id => s.has(id));
}

function updateFeedback(correct, srFeedback, exercise, answer) {
    const correctResult = stringifySet([...exercise.evaluation.result].sort());
    const userDisplay = formatUserAnswer(exercise, answer);

    const summary = {
        correct,
        status: correct ? 'success' : 'error',
        title: correct ? '¡Respuesta correcta!' : 'Revisemos la estrategia',
        subtitle: correct
            ? 'Excelente lectura de los conjuntos y sus operaciones.'
            : 'No pasa nada, repasemos la construcción del conjunto esperado.',
        correctResult,
        userAnswer: userDisplay,
        answerMode: answer?.mode || exercise.response.mode,
        answerValue: answer?.value,
        srMessage: correct
            ? `Respuesta correcta. El resultado es ${correctResult}.`
            : `Respuesta incorrecta. Tu respuesta fue ${userDisplay || 'sin respuesta'}. El resultado correcto es ${correctResult}.`
    };

    if (srFeedback) {
        srFeedback.textContent = summary.srMessage;
    }

    return summary;
}

function populateStepGuide(list, exercise) {
    if (!list) return;
    list.innerHTML = '';
    exercise.evaluation.steps.forEach((step, index) => {
        const li = document.createElement('li');
        const title = document.createElement('strong');
        title.textContent = `Paso ${index + 1}: ${step.label}`;
        const description = document.createElement('div');
        description.className = 'step-description';
        description.textContent = step.description;
        const result = document.createElement('small');
        result.textContent = `Resultado: ${stringifySet([...step.result].sort())}`;
        li.appendChild(title);
        li.appendChild(description);
        li.appendChild(result);
        list.appendChild(li);
    });
}

function updateProgress(correct, exercise) {
    const streakCounter = document.getElementById('streakCounter');
    const xpCounter = document.getElementById('xpCounter');

    if (correct) {
        state.streak += 1;
        state.xp += xpByDifficulty[exercise.config.difficulty];
    } else {
        state.streak = 0;
        state.xp = Math.max(0, state.xp - 10);
    }

    streakCounter.textContent = state.streak;
    xpCounter.textContent = `${state.xp} XP`;

    checkBadges();
}

function checkBadges() {
    const badgeCounter = document.getElementById('badgeCounter');
    const before = state.badges.size;
    badgeCatalog.forEach(badge => {
        if (!state.badges.has(badge.id) && badge.condition(state)) {
            state.badges.add(badge.id);
            addJournalEntry(`Has desbloqueado la insignia «${badge.label}»`, 'badge');
        }
    });
    if (state.badges.size > before) {
        badgeCounter.textContent = `${state.badges.size} insignia${state.badges.size > 1 ? 's' : ''}`;
    } else if (state.badges.size) {
        badgeCounter.textContent = `${state.badges.size} insignia${state.badges.size > 1 ? 's' : ''}`;
    } else {
        badgeCounter.textContent = 'Sin insignias';
    }
}

function logJournalEntry(correct, exercise) {
    state.journal.unshift({
        timestamp: new Date(),
        correct,
        difficulty: exercise.config.difficulty,
        mode: exercise.config.responseMode,
        prompt: exercise.prompt
    });
    if (state.journal.length > 12) {
        state.journal.length = 12;
    }
    saveProgressToStorage();
}

function hydrateGamification() {
    updateGamificationPanels();
}

function updateGamificationPanels() {
    highlightTimeline();
    renderBadgeWall();
    renderJournal();
}

function highlightTimeline() {
    const timeline = document.getElementById('xpTimeline');
    timeline.querySelectorAll('li').forEach(item => {
        const threshold = Number(item.dataset.xp);
        item.classList.toggle('is-active', state.xp >= threshold);
    });
}

function renderBadgeWall() {
    const wall = document.getElementById('badgeWall');
    wall.innerHTML = '';
    badgeCatalog.forEach(badge => {
        const card = document.createElement('div');
        card.className = 'badge-card';
        if (state.badges.has(badge.id)) {
            card.classList.add('badge-earned');
        }
        card.innerHTML = `
            <span class="badge-icon">${badge.icon}</span>
            <strong>${badge.label}</strong>
            <span>${state.badges.has(badge.id) ? '¡Obtenida!' : 'Aún por desbloquear'}</span>
        `;
        wall.appendChild(card);
    });
}

function renderJournal() {
    const journal = document.getElementById('journalEntries');
    journal.innerHTML = '';
    state.journal.forEach(entry => {
        const li = document.createElement('li');
        const time = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(entry.timestamp);
        li.innerHTML = `
            <strong>${entry.correct ? '✔️ Acierto' : '✖️ Revisión'}</strong> — ${entry.prompt}
            <br><small>${time} · ${responseModeLabels[entry.mode]} · ${entry.difficulty}</small>
        `;
        journal.appendChild(li);
    });
}

function addJournalEntry(text, type = 'note') {
    state.journal.unshift({
        timestamp: new Date(),
        correct: type === 'badge',
        difficulty: '-',
        mode: type,
        prompt: text
    });
    if (state.journal.length > 12) {
        state.journal.length = 12;
    }
    saveProgressToStorage();
}

function setupResultModal() {
    const overlay = document.getElementById('resultModal');
    if (!overlay) return;
    const content = overlay.querySelector('.modal-content');
    const closeBtn = document.getElementById('modalClose');
    const continueBtn = document.getElementById('modalContinue');
    const icon = document.getElementById('modalStatusIcon');
    const title = document.getElementById('modalTitle');
    const subtitle = document.getElementById('modalSubtitle');
    const feedback = document.getElementById('modalFeedback');
    const steps = document.getElementById('modalSteps');
    const diagram = document.getElementById('modalDiagram');

    state.modal = {
        overlay,
        content,
        closeBtn,
        continueBtn,
        icon,
        title,
        subtitle,
        feedback,
        steps,
        diagram,
        previousActive: null
    };

    const closeHandler = () => closeResultModal();
    closeBtn.addEventListener('click', closeHandler);
    continueBtn.addEventListener('click', closeHandler);
    overlay.addEventListener('click', event => {
        if (event.target === overlay) {
            closeResultModal();
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !overlay.classList.contains('hidden')) {
            closeResultModal();
        }
    });
}

function setupAlertModal() {
    const overlay = document.getElementById('alertModal');
    if (!overlay) return;
    const content = overlay.querySelector('.modal-content');
    const closeBtn = document.getElementById('alertClose');
    const acknowledgeBtn = document.getElementById('alertAcknowledge');
    const title = document.getElementById('alertTitle');
    const message = document.getElementById('alertMessage');

    state.alert = {
        overlay,
        content,
        closeBtn,
        acknowledgeBtn,
        title,
        message,
        previousActive: null
    };

    const closeHandler = () => closeAlertModal();
    closeBtn.addEventListener('click', closeHandler);
    acknowledgeBtn.addEventListener('click', closeHandler);
    overlay.addEventListener('click', event => {
        if (event.target === overlay) {
            closeAlertModal();
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !overlay.classList.contains('hidden')) {
            closeAlertModal();
        }
    });
}

function showResultModal(summary, exercise) {
    if (!state.modal) return;
    const { overlay, content, icon, title, subtitle, feedback, steps, diagram, continueBtn } = state.modal;

    state.modal.previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    overlay.classList.remove('hidden');
    overlay.removeAttribute('hidden');
    content.classList.remove('is-success', 'is-error');
    content.classList.add(summary.status === 'success' ? 'is-success' : 'is-error');
    document.body.classList.add('modal-open');

    const bodySection = content.querySelector('.modal-body');
    if (bodySection) {
        bodySection.scrollTop = 0;
    }

    icon.textContent = summary.status === 'success' ? '✔' : '✖';
    title.textContent = summary.title;
    subtitle.textContent = summary.subtitle;

    renderModalFeedback(feedback, summary);
    populateStepGuide(steps, exercise);
    renderModalDiagram(diagram, exercise);

    window.setTimeout(() => {
        continueBtn.focus({ preventScroll: true });
    }, 0);
}

function showAlertModal(message, title = 'Ajusta tu selección') {
    if (!state.alert) return;
    const { overlay, content, closeBtn, acknowledgeBtn } = state.alert;

    state.alert.previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    overlay.classList.remove('hidden');
    overlay.removeAttribute('hidden');
    content.classList.remove('is-success', 'is-error');
    document.body.classList.add('modal-open');

    state.alert.title.textContent = title;
    state.alert.message.textContent = message;

    window.setTimeout(() => {
        acknowledgeBtn.focus({ preventScroll: true });
    }, 0);
}

function renderModalFeedback(container, summary) {
    if (!container) return;
    container.innerHTML = '';

    const answerCard = document.createElement('div');
    answerCard.className = 'modal-result-card';
    const answerChip = document.createElement('span');
    answerChip.className = 'modal-chip';
    answerChip.textContent = 'Tu respuesta';
    const answerValue = document.createElement('p');
    answerValue.className = 'modal-result-set';
    answerValue.textContent = summary.userAnswer || 'Sin respuesta';
    answerCard.append(answerChip, answerValue);
    container.appendChild(answerCard);

    const correctCard = document.createElement('div');
    correctCard.className = 'modal-result-card';
    const correctChip = document.createElement('span');
    correctChip.className = 'modal-chip';
    correctChip.textContent = summary.correct ? 'Resultado' : 'Resultado esperado';
    const correctValue = document.createElement('p');
    correctValue.className = 'modal-result-set';
    correctValue.textContent = summary.correctResult;
    correctCard.append(correctChip, correctValue);
    container.appendChild(correctCard);

    const guidance = document.createElement('p');
    guidance.className = 'modal-guidance';
    guidance.textContent = summary.correct
        ? '¡Excelente! Puedes aumentar la dificultad o probar otro modo de respuesta.'
        : 'Revisa los pasos detallados para comprender cómo se construyó el resultado.';
    container.appendChild(guidance);
}

function renderModalDiagram(container, exercise) {
    if (!container) return;
    container.innerHTML = '';
    if (!exercise) return;

    const count = exercise.config.setCount;
    const config = getVennConfig(count, 'base');
    if (!config) return;

    const svg = buildVennSVG(count, {});
    svg.classList.add('solution-venn');
    svg.setAttribute('aria-hidden', 'true');

    const svgNS = 'http://www.w3.org/2000/svg';
    const highlightGroup = document.createElementNS(svgNS, 'g');
    highlightGroup.setAttribute('class', 'solution-highlight');

    const activeCodes = new Set((exercise.answerRegions || []).filter(region => region.active).map(region => region.id));
    const setNames = exercise.setNames || ['A', 'B', 'C', 'D'].slice(0, config.positions.length);

    if (activeCodes.size > 0 && setNames.length) {
        const viewBoxParts = (config.viewBox || '0 0 220 220').split(' ').map(Number);
        const width = viewBoxParts[2] || 220;
        const height = viewBoxParts[3] || 220;
        const step = Math.max(6, Math.round(config.radius / 10));

        for (let x = 0; x <= width; x += step) {
            for (let y = 0; y <= height; y += step) {
                const membership = {};
                config.positions.forEach((pos, index) => {
                    const name = setNames[index];
                    if (!name) return;
                    const distance = Math.hypot(x - pos.cx, y - pos.cy);
                    membership[name] = distance <= config.radius;
                });
                const code = setNames.map(name => (membership[name] ? '1' : '0')).join('');
                if (activeCodes.has(code)) {
                    const dot = document.createElementNS(svgNS, 'circle');
                    dot.setAttribute('cx', x);
                    dot.setAttribute('cy', y);
                    dot.setAttribute('r', step / 2.6);
                    highlightGroup.appendChild(dot);
                }
            }
        }
    }

    if (highlightGroup.childElementCount > 0) {
        svg.appendChild(highlightGroup);
        svg.querySelectorAll('text').forEach(label => svg.appendChild(label));
        container.appendChild(svg);
    } else {
        container.appendChild(svg);
        svg.querySelectorAll('text').forEach(label => svg.appendChild(label));
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'modal-guidance subtle';
        emptyMessage.textContent = 'El resultado es el conjunto vacío (∅).';
        container.appendChild(emptyMessage);
    }
}

function closeResultModal(options = {}) {
    if (!state.modal) return;
    const { overlay, content, diagram } = state.modal;
    const wasOpen = overlay && !overlay.classList.contains('hidden');

    if (overlay) {
        overlay.classList.add('hidden');
        overlay.setAttribute('hidden', '');
    }
    if (content) {
        content.classList.remove('is-success', 'is-error');
    }
    document.body.classList.remove('modal-open');

    if (diagram) {
        diagram.innerHTML = '';
    }

    if (wasOpen && !options.silent) {
        const target = state.modal.previousActive instanceof HTMLElement
            ? state.modal.previousActive
            : document.querySelector('#exerciseForm button[type="submit"]') || document.querySelector('[data-target="practica"]');
        if (target && typeof target.focus === 'function') {
            target.focus({ preventScroll: true });
        }
    }

    state.modal.previousActive = null;
}

function closeAlertModal() {
    if (!state.alert) return;
    const { overlay } = state.alert;
    const wasOpen = overlay && !overlay.classList.contains('hidden');

    if (overlay) {
        overlay.classList.add('hidden');
        overlay.setAttribute('hidden', '');
    }
    document.body.classList.remove('modal-open');

    if (wasOpen) {
        const target = state.alert.previousActive instanceof HTMLElement
            ? state.alert.previousActive
            : document.getElementById('exerciseForm')?.querySelector('button[type="submit"]');
        if (target && typeof target.focus === 'function') {
            target.focus({ preventScroll: true });
        }
    }

    state.alert.previousActive = null;
}

function formatUserAnswer(exercise, answer) {
    const mode = answer?.mode || exercise.response.mode;
    const value = answer?.value ?? answer;

    if (mode === 'multipleChoice') {
        return typeof value === 'string' && value.trim() ? value : 'Sin respuesta';
    }

    if (mode === 'fillSet') {
        if (!Array.isArray(value) || value.length === 0) {
            return '∅';
        }
        const normalized = [...new Set(value.map(String).map(v => v.trim()).filter(Boolean))].sort();
        return stringifySet(normalized);
    }

    if (mode === 'diagram') {
        if (!Array.isArray(value) || value.length === 0) {
            return 'Sin regiones seleccionadas';
        }
        const setNames = exercise.response.setNames || [];
        return value.map(code => formatRegionDescriptor(code, setNames)).join(', ');
    }

    return String(value ?? '').trim() || 'Sin respuesta';
}

function formatRegionDescriptor(code, setNames = []) {
    if (!setNames.length) return code;
    return setNames
        .map((name, index) => code[index] === '1' ? name : `¬${name}`)
        .join(' ∩ ');
}

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
