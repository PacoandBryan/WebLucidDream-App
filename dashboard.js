/**
 * SOVEREIGN MIND - Dashboard & UI Logic
 * Simplified for Customer-Friendly Interface
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

async function showCRT(text, duration = 3000, showClose = false) {
    UI.crt.overlay.style.display = 'flex';
    UI.crt.content.textContent = '';
    document.getElementById('crt-close').classList.toggle('hidden', !showClose);

    const lines = text.split('\n');
    for (let line of lines) {
        UI.crt.content.textContent += line + '\n';
        await new Promise(r => setTimeout(r, 50));
    }

    if (duration > 0) {
        return new Promise(resolve => {
            setTimeout(() => {
                if (!showClose) UI.crt.overlay.style.display = 'none';
                resolve();
            }, duration);
        });
    }
}

function closeCRT() {
    UI.crt.overlay.style.display = 'none';
}

// --- DIAGNOSTIC ---
function renderDiagnostic() {
    const q = NeuroEngine.diagnosticFlow[STATE.diagnosticStep];
    if (!q) {
        finalizeDiagnostic();
        return;
    }

    document.getElementById('q-domain').textContent = `Step ${STATE.diagnosticStep + 1} of 4`;
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
                <span class="font-mono text-[8px] opacity-40 uppercase block">Recommendation</span>
                <span class="font-bold text-xs uppercase">${b.label}</span>
            </div>
        `;
        blockerList.appendChild(div);
    });

    showPhase('PAYWALL');
}

async function unlockDashboard() {
    const text = `> PREPARING YOUR CUSTOM PLAN...
> OPTIMIZING DREAM WINDOWS...
> BUILDING 90-DAY JOURNEY...
> SECURING YOUR DATA...
> READY. WELCOME TO SOVEREIGN MIND.`;

    await showCRT(text, 3000);

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

        square.className = 'aspect-square rounded-sm transition-all duration-300 cursor-pointer hover:scale-110';

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

        square.onclick = () => showDayDiagnostic(i, log);
        grid.appendChild(square);
    }

    const compliancePct = (totalCompleted / 90) * 100;
    document.getElementById('compliance-pct').textContent = `${Math.round(compliancePct)}%`;
}

async function showDayDiagnostic(day, log) {
    const completed = Object.keys(log).length;
    const text = `> DIAGNOSTIC REPORT: DAY ${day}
> STATUS: ${completed === 4 ? 'OPTIMAL' : (completed > 0 ? 'PARTIAL' : 'NO_DATA')}
> COMPLETION: ${Math.round((completed/4)*100)}%

> LOGGED_HABITS:
${STATE.protocol.targetHabits.map(h => `- ${h.title}: ${log[h.id] ? '[OK]' : '[MISSING]'}`).join('\n')}

> ANALYSIS:
${completed === 4 ? 'Neuroplasticity window maximized.' : 'Sub-optimal engagement detected.'}`;

    await showCRT(text, 0, true);
}

function renderHabitCards() {
    const container = document.getElementById('habit-cards-container');
    container.innerHTML = '';

    const startDate = new Date(STATE.protocol.startDate);
    const today = new Date();
    const currentDay = Math.ceil(Math.abs(today - startDate) / (1000 * 60 * 60 * 24)) || 1;

    STATE.protocol.targetHabits.forEach(habit => {
        const card = document.createElement('div');
        card.className = 'bolted-module p-8 relative overflow-hidden';

        const isLogged = STATE.protocol.dailyLogs[currentDay]?.[habit.id];
        const { isLocked, status, label } = isLogged ?
            { isLocked: true, status: 'ACTIVE', label: 'LOGGED' } :
            checkTimeLock(habit.target_time);

        card.innerHTML = `
            <!-- Physical Details -->
            <div class="screw top-4 left-4"></div>
            <div class="screw top-4 right-4"></div>
            <div class="screw bottom-4 left-4"></div>
            <div class="screw bottom-4 right-4"></div>

            <div class="absolute right-10 top-10 flex gap-1 opacity-20">
                <div class="vent-slot"></div><div class="vent-slot"></div><div class="vent-slot"></div>
            </div>

            <div class="flex justify-between items-start mb-10 mt-4">
                <div class="relative tooltip-trigger">
                    <span class="font-mono text-[9px] opacity-40 uppercase block tracking-tighter">Module // ${habit.id.toUpperCase()}</span>
                    <h4 class="text-2xl font-bold uppercase tracking-tighter text-primaryText">${habit.title}</h4>
                    <div class="tooltip-box">${habit.desc}</div>
                </div>
                <div class="flex flex-col items-end">
                    <span class="font-mono text-[12px] text-safetyOrange font-bold">${habit.target_time}</span>
                    <span class="font-mono text-[8px] opacity-40 uppercase">Target_Window</span>
                </div>
            </div>

            <div class="mb-10 p-4 neumorph-sunken rounded-xl flex justify-between items-center">
                <div class="font-mono text-[10px] uppercase opacity-60">Sequence_Streak</div>
                <div class="font-mono text-lg font-bold">${String(habit.streak || 0).padStart(2, '0')} <span class="text-[10px] opacity-40">DAYS</span></div>
            </div>

            <button
                onclick="logHabit('${habit.id}')"
                class="w-full py-6 rounded-2xl font-mono text-[11px] font-bold uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4
                ${isLocked ? 'neumorph-sunken text-primaryText/20 cursor-not-allowed' : 'neumorph-card text-primaryText hover:shadow-pressed active:translate-y-[2px]'}">
                <div class="led-indicator ${status === 'ACTIVE' ? 'led-active animate-pulse' : (status === 'LOCKED' ? '' : 'led-fail')}"></div>
                [${label === 'ENGAGE' ? 'I DID THIS' : label}]
            </button>

            <div class="mt-6 flex justify-between items-center font-mono text-[8px] opacity-20 uppercase tracking-widest">
                <span>Ref_ID: SM-0${Math.floor(Math.random()*900)+100}</span>
                <span>Type: Industrial_Realism_v9</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function checkTimeLock(targetTime) {
    const [tHour, tMin] = targetTime.split(':').map(Number);
    const now = new Date();

    const todayTarget = new Date(now);
    todayTarget.setHours(tHour, tMin, 0, 0);

    const yesterdayTarget = new Date(todayTarget);
    yesterdayTarget.setDate(yesterdayTarget.getDate() - 1);

    const diffMinsToday = (now - todayTarget) / (1000 * 60);
    const diffMinsYesterday = (now - yesterdayTarget) / (1000 * 60);

    // Use whichever is closer to now
    const diffMins = Math.abs(diffMinsToday) < Math.abs(diffMinsYesterday) ? diffMinsToday : diffMinsYesterday;

    // ACTIVE: 20 mins before to 4 hours after
    if (diffMins >= -20 && diffMins <= 240) {
        return { isLocked: false, status: 'ACTIVE', label: 'ENGAGE' };
    }
    // FAIL: Permanently lock if more than 4 hours missed
    else if (diffMins > 240) {
        return { isLocked: true, status: 'FAIL', label: 'SYS_FAIL' };
    }
    // OFFLINE: More than 20 mins before
    else {
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
        await showCRT(`OOPS! PLAN NOT COMPLETE.
YOU ARE ON DAY: ${diffDays} OF 90.
REMAINING: ${90 - diffDays} DAYS.
PLEASE FINISH THE PLAN TO BE ELIGIBLE FOR A REFUND.`, 5000);
    } else {
        await showCRT(`> PREPARING YOUR DATA...
> SAVING YOUR PROGRESS...
> FINALIZING EXPORT...
> DONE.`, 4000);
        generateComplianceHash();
    }
}

function generateComplianceHash() {
    const logData = JSON.stringify(STATE.protocol);
    const blob = new Blob([btoa(logData)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Dream_Compliance_Log.key';
    a.click();
    showCRT(`EXPORT COMPLETE. PLEASE EMAIL THIS FILE TO SUPPORT.
REMEMBER: CONSISTENCY IS KEY FOR THE GUARANTEE!`, 8000);
}

window.onload = init;
window.unlockDashboard = unlockDashboard;
window.logHabit = logHabit;
window.handleEmergencyEject = handleEmergencyEject;
