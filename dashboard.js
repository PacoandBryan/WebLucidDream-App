/**
 * SOVEREIGN MIND - Dashboard & UI Logic
 */

const STATE = {
    currentPhase: 'DIAGNOSTIC',
    diagnosticStep: 0,
    responses: {},
    protocol: null,
    activeView: 'dashboard'
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

// --- PHASE MANAGEMENT ---
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
        await new Promise(r => setTimeout(r, 100));
    }

    return new Promise(resolve => {
        setTimeout(() => {
            UI.crt.overlay.style.display = 'none';
            resolve();
        }, duration);
    });
}

// --- DIAGNOSTIC LOGIC ---
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
                <span class="font-mono text-[8px] opacity-40 uppercase block">${b.severity}_BLOCKER</span>
                <span class="font-bold text-xs uppercase">${b.label}</span>
            </div>
        `;
        blockerList.appendChild(div);
    });

    showPhase('PAYWALL');
}

// --- DASHBOARD ACTIONS ---
async function unlockDashboard() {
    const text = `> INITIALIZING SECURE_HANDSHAKE...
> ESTABLISHING NEURAL_SYNC...
> DECRYPTING NEURO-CHRONOTYPE DATA...
> CALIBRATING 30-DAY SOVEREIGN PROTOCOL...
> ACCESS_GRANTED. WELCOME SUBJECT_001.`;

    await showCRT(text, 3500);

    STATE.protocol = NeuroEngine.generateProtocol(STATE.results.activeBlockers);
    await window.SovereignVault.set('protocol', STATE.protocol);

    showPhase('DASHBOARD');
    renderDashboard();
}

// --- DASHBOARD RENDERING ---
function renderDashboard() {
    if (!STATE.protocol) return;

    // Day label
    const startDate = new Date(STATE.protocol.startDate);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    document.getElementById('current-day-label').textContent = String(diffDays).padStart(2, '0');

    renderHeatmap(diffDays);
    renderHabitCards();
}

function renderHeatmap(currentDay) {
    const grid = document.getElementById('heatmap-grid');
    grid.innerHTML = '';

    for (let i = 1; i <= 30; i++) {
        const square = document.createElement('div');
        const log = STATE.protocol.dailyLogs[i] || {};
        const completedCount = Object.values(log).filter(v => v === true).length;
        const percent = (completedCount / 4) * 100;

        square.className = 'aspect-square rounded-md transition-all duration-500';

        if (percent === 100) {
            square.className += ' bg-safetyOrange shadow-led-glow';
        } else if (percent > 0) {
            // Gradient colors for partial completion
            const opacity = 0.2 + (percent / 100) * 0.8;
            square.style.backgroundColor = `rgba(255, 71, 87, ${opacity})`;
            square.className += ' neumorph-sunken';
        } else {
            square.className += ' neumorph-sunken';
        }

        if (i === currentDay) {
            square.style.border = '2px solid #2d3436';
        }

        grid.appendChild(square);
    }
}

function renderHabitCards() {
    const container = document.getElementById('habit-cards-container');
    container.innerHTML = '';

    STATE.protocol.targetHabits.forEach(habit => {
        const card = document.createElement('div');
        card.className = 'bolted-module p-8';

        // Check time lock
        const { isLocked, status, label } = checkTimeLock(habit.target_time);

        card.innerHTML = `
            <div class="screw top-3 left-3"></div>
            <div class="screw top-3 right-3"></div>
            <div class="flex justify-between items-start mb-6">
                <div>
                    <span class="font-mono text-[9px] opacity-40 uppercase block">HABIT_MODULE</span>
                    <h4 class="text-xl font-bold uppercase tracking-tight">${habit.title}</h4>
                </div>
                <div class="flex flex-col items-end">
                    <span class="font-mono text-[10px] text-safetyOrange">${habit.target_time}</span>
                    <span class="font-mono text-[8px] opacity-40 uppercase">TARGET_WINDOW</span>
                </div>
            </div>

            <div class="flex justify-between items-center mb-8">
                <div class="flex gap-1">
                    <div class="vent-slot"></div><div class="vent-slot"></div><div class="vent-slot"></div>
                </div>
                <div class="font-mono text-xs">
                    <span class="opacity-40">SEQ:</span> ${String(habit.streak).padStart(2, '0')} DAYS
                </div>
            </div>

            <button
                onclick="logHabit('${habit.id}')"
                class="w-full py-4 rounded-xl font-mono text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
                ${isLocked ? 'neumorph-sunken text-primaryText/30 cursor-not-allowed' : 'neumorph-card text-primaryText hover:shadow-pressed active:translate-y-[2px]'}">
                <div class="led-indicator ${status === 'ACTIVE' ? 'led-active animate-pulse' : (status === 'LOCKED' ? '' : 'led-fail')}"></div>
                [${label}]
            </button>
        `;
        container.appendChild(card);
    });
}

function checkTimeLock(targetTime) {
    const [tHour, tMin] = targetTime.split(':').map(Number);
    const now = new Date();
    const h = now.getHours();

    // 4-hour window: 2 hours before, 2 hours after
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

    // Get current day index (1-30)
    const startDate = new Date(STATE.protocol.startDate);
    const today = new Date();
    const currentDay = Math.ceil(Math.abs(today - startDate) / (1000 * 60 * 60 * 24)) || 1;

    if (!STATE.protocol.dailyLogs[currentDay]) {
        STATE.protocol.dailyLogs[currentDay] = {};
    }

    if (STATE.protocol.dailyLogs[currentDay][habitId]) return; // Already logged

    STATE.protocol.dailyLogs[currentDay][habitId] = true;
    habit.streak++;

    await window.SovereignVault.set('protocol', STATE.protocol);
    renderDashboard();
}

// --- REFUND MECHANISM ---
async function handleEmergencyEject() {
    const startDate = new Date(STATE.protocol.startDate);
    const today = new Date();
    const diffDays = Math.ceil(Math.abs(today - startDate) / (1000 * 60 * 60 * 24)) || 1;

    if (diffDays < 90) {
        await showCRT(`ERROR: PROTOCOL INCOMPLETE.
REMAINING_DAYS: ${90 - diffDays}
REFUND MECHANISM UNLOCKS ON DAY 90.
CONSISTENCY IS MANDATORY.`, 5000);
    } else {
        await showCRT(`> INITIATING COMPLIANCE_DUMP...
> ENCRYPTING NEURAL_LOGS...
> GENERATING COMPLIANCE_HASH...
> SYSTEM_DUMP COMPLETE.`, 4000);
        generateComplianceHash();
    }
}

function generateComplianceHash() {
    const logData = JSON.stringify(STATE.protocol);
    const blob = new Blob([btoa(logData)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Sovereign_Compliance_Log.key';
    a.click();

    showCRT(`SYSTEM DUMP COMPLETE.
EMAIL .KEY FILE TO SUPPORT.
WARNING: COMPLIANCE UNDER 95% VOIDS GUARANTEE WARRANTY.`, 8000);
}

// Start app
window.onload = init;
window.unlockDashboard = unlockDashboard;
window.logHabit = logHabit;
window.handleEmergencyEject = handleEmergencyEject;
