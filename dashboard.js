/**
 * SOVEREIGN MIND - Dashboard & UI Logic
 * PhD-Level Synthesis Implementation
 */

const STATE = {
    currentPhase: 'DIAGNOSTIC',
    diagnosticStep: 0,
    responses: {},
    protocol: null
};

const UI = {
    phases: {
        DIAGNOSTIC: document.getElementById('phase-diagnostic'),
        PAYWALL: document.getElementById('phase-paywall'),
        DASHBOARD: document.getElementById('phase-dashboard')
    },
    crt: {
        overlay: document.getElementById('crt-overlay'),
        content: document.getElementById('crt-content')
    }
};

// --- INITIALIZATION ---
async function init() {
    const savedProtocol = await window.SovereignVault.get('protocol');
    if (savedProtocol) {
        STATE.protocol = savedProtocol;
        showPhase('DASHBOARD');
        renderDashboard();
    } else {
        renderDiagnostic();
    }
}

function showPhase(phase) {
    Object.keys(UI.phases).forEach(p => {
        UI.phases[p].classList.toggle('active', p === phase);
    });
    STATE.currentPhase = phase;
}

async function showCRT(text, duration = 3000) {
    UI.crt.overlay.style.display = 'flex';
    UI.crt.content.textContent = '';
    const lines = text.split('\n');
    for (let line of lines) {
        UI.crt.content.textContent += line + '\n';
        await new Promise(r => setTimeout(r, 60));
    }
    return new Promise(resolve => {
        setTimeout(() => {
            UI.crt.overlay.style.display = 'none';
            resolve();
        }, duration);
    });
}

// --- DIAGNOSTIC ---
function renderDiagnostic() {
    const q = NeuroEngine.diagnosticFlow[STATE.diagnosticStep];
    if (!q) {
        finalizeDiagnostic();
        return;
    }

    document.getElementById('q-domain').textContent = `DOMAIN_SCAN: ${q.domain}`;
    document.getElementById('q-text').textContent = q.question;

    const optionsContainer = document.getElementById('q-options');
    optionsContainer.innerHTML = '';

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'w-full py-6 px-8 bolted-module text-left font-bold hover:shadow-pressed transition-all active:translate-y-[2px]';
        btn.textContent = opt.label;
        btn.onclick = () => {
            STATE.responses[q.id] = opt.value;
            STATE.diagnosticStep++;
            renderDiagnostic();
        };
        optionsContainer.appendChild(btn);
    });
}

function finalizeDiagnostic() {
    const results = NeuroEngine.calculateResults(STATE.responses);
    STATE.results = results;

    document.getElementById('lri-display').textContent = `${results.percent}%`;
    const blockerList = document.getElementById('blocker-list');
    blockerList.innerHTML = '';

    results.activeBlockers.forEach(b => {
        const div = document.createElement('div');
        div.className = 'p-4 neumorph-sunken rounded-xl flex items-center gap-4';
        div.innerHTML = `
            <div class="w-2 h-2 rounded-full bg-safetyOrange led-glow"></div>
            <div>
                <span class="font-mono text-[8px] opacity-40 uppercase block">${b.severity}_VETO</span>
                <span class="font-bold text-xs uppercase">${b.label}</span>
            </div>
        `;
        blockerList.appendChild(div);
    });

    showPhase('PAYWALL');
}

async function unlockDashboard() {
    const text = `> INITIALIZING NEURO-CHRONOTYPE_HANDSHAKE...
> QUANTIZING CHOLINERGIC_SEROTONERGIC_AXIS...
> CALIBRATING T-MIN COEFFICIENT...
> ENFORCING 90-DAY PROTOCOL_LOCK...
> GENERATING CAUSAL_SYNERGY_MATRIX...
> ACCESS_GRANTED. WELCOME SUBJECT_001.`;

    await showCRT(text, 4000);

    STATE.protocol = NeuroEngine.generateProtocol(STATE.results.activeBlockers, STATE.responses);
    await window.SovereignVault.set('protocol', STATE.protocol);

    showPhase('DASHBOARD');
    renderDashboard();
}

// --- DASHBOARD ---
function renderDashboard() {
    if (!STATE.protocol) return;

    const startDate = new Date(STATE.protocol.startDate);
    const today = new Date();
    const diffDays = Math.ceil(Math.abs(today - startDate) / (1000 * 60 * 60 * 24)) || 1;
    document.getElementById('current-day-label').textContent = String(diffDays).padStart(2, '0');

    render90DayHeatmap(diffDays);
    renderHabitCards();
}

function render90DayHeatmap(currentDay) {
    const grid = document.getElementById('heatmap-grid');
    grid.innerHTML = '';
    grid.className = 'grid grid-cols-6 gap-2';

    let totalCompleted = 0;

    for (let i = 1; i <= 90; i++) {
        const square = document.createElement('div');
        const log = STATE.protocol.dailyLogs[i] || {};
        const completedCount = Object.values(log).filter(v => v === true).length;
        const percent = (completedCount / 4) * 100;

        if (completedCount > 0) totalCompleted += (completedCount / 4);

        square.className = 'aspect-square rounded-sm transition-all duration-300';

        if (percent === 100) {
            square.className += ' bg-safetyOrange shadow-led-glow';
        } else if (percent > 0) {
            const opacity = 0.2 + (percent / 100) * 0.8;
            square.style.backgroundColor = `rgba(255, 71, 87, ${opacity})`;
            square.className += ' neumorph-sunken';
        } else {
            square.className += ' neumorph-sunken';
        }

        if (i === currentDay) {
            square.style.border = '1px solid #2d3436';
            square.classList.add('animate-pulse');
        }

        grid.appendChild(square);
    }

    const compliancePct = (totalCompleted / 90) * 100;
    document.getElementById('compliance-pct').textContent = `${Math.round(compliancePct)}%`;
}

function renderHabitCards() {
    const container = document.getElementById('habit-cards-container');
    container.innerHTML = '';

    STATE.protocol.targetHabits.forEach(habit => {
        const card = document.createElement('div');
        card.className = 'bolted-module p-8';

        const { isLocked, status, label } = checkTimeLock(habit.target_time);

        card.innerHTML = `
            <div class="screw top-3 left-3"></div>
            <div class="screw top-3 right-3"></div>
            <div class="flex justify-between items-start mb-6">
                <div>
                    <span class="font-mono text-[9px] opacity-40 uppercase block">NEURO_MODULE</span>
                    <h4 class="text-xl font-bold uppercase tracking-tight">${habit.title}</h4>
                </div>
                <div class="flex flex-col items-end">
                    <span class="font-mono text-[10px] text-safetyOrange font-bold">${habit.target_time}</span>
                    <span class="font-mono text-[8px] opacity-40 uppercase">T-MIN_TARGET</span>
                </div>
            </div>

            <div class="flex justify-between items-center mb-8">
                <div class="flex gap-1">
                    <div class="vent-slot"></div><div class="vent-slot"></div><div class="vent-slot"></div>
                </div>
                <div class="font-mono text-xs">
                    <span class="opacity-40">SEQ:</span> ${String(habit.streak || 0).padStart(2, '0')} DAYS
                </div>
            </div>

            <button
                onclick="logHabit('${habit.id}')"
                class="w-full py-5 rounded-xl font-mono text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
                ${isLocked ? 'neumorph-sunken text-primaryText/30 cursor-not-allowed' : 'neumorph-card text-primaryText hover:shadow-pressed active:translate-y-[2px]'}">
                <div class="led-indicator ${status === 'ACTIVE' ? 'led-active animate-pulse' : (status === 'LOCKED' ? '' : 'led-fail')}"></div>
                [${label}]
            </button>
        `;
        container.appendChild(card);
    });
}

function checkTimeLock(targetTime) {
    const [tHour] = targetTime.split(':').map(Number);
    const now = new Date();
    const h = now.getHours();
    const diff = h - tHour;

    if (Math.abs(diff) <= 2) {
        return { isLocked: false, status: 'ACTIVE', label: 'ENGAGE' };
    } else {
        return { isLocked: true, status: 'LOCKED', label: 'OFFLINE' };
    }
}

async function logHabit(habitId) {
    const habit = STATE.protocol.targetHabits.find(h => h.id === habitId);
    const { isLocked } = checkTimeLock(habit.target_time);
    if (isLocked) return;

    const startDate = new Date(STATE.protocol.startDate);
    const today = new Date();
    const currentDay = Math.ceil(Math.abs(today - startDate) / (1000 * 60 * 60 * 24)) || 1;

    if (!STATE.protocol.dailyLogs[currentDay]) STATE.protocol.dailyLogs[currentDay] = {};
    if (STATE.protocol.dailyLogs[currentDay][habitId]) return;

    STATE.protocol.dailyLogs[currentDay][habitId] = true;
    habit.streak = (habit.streak || 0) + 1;

    await window.SovereignVault.set('protocol', STATE.protocol);
    renderDashboard();
}

async function handleEmergencyEject() {
    const startDate = new Date(STATE.protocol.startDate);
    const today = new Date();
    const diffDays = Math.ceil(Math.abs(today - startDate) / (1000 * 60 * 60 * 24)) || 1;

    if (diffDays < 90) {
        await showCRT(`ERROR: PROTOCOL_INCOMPLETE.
GUARANTEE_WINDOW: 90 DAYS.
REMAINING: ${90 - diffDays} DAYS.
CONSISTENCY_CHECK: FAILED.
SYSTEM_LOCK: ACTIVE.`, 5000);
    } else {
        await showCRT(`> INITIATING SOMNOLOGICAL_DUMP...
> ENCRYPTING CAUSAL_BIOMARKERS...
> STRINGIFYING NEURO-CHRONOTYPE_LOGS...
> GENERATING COMPLIANCE_HASH...
> DUMP COMPLETE.`, 4500);
        generateComplianceHash();
    }
}

function generateComplianceHash() {
    const logData = JSON.stringify(STATE.protocol);
    const blob = new Blob([btoa(logData)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Sovereign_Compliance_90_Day.key';
    a.click();
    showCRT(`SYSTEM DUMP COMPLETE. EMAIL .KEY FILE TO SUPPORT.
WARNING: COMPLIANCE UNDER 95% VOIDS GUARANTEE WARRANTY.`, 8000);
}

window.onload = init;
window.unlockDashboard = unlockDashboard;
window.logHabit = logHabit;
window.handleEmergencyEject = handleEmergencyEject;
