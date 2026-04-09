/**
 * SOVEREIGN MIND - Dashboard & UI Logic
 * Simplified for Customer-Friendly Interface
 */

const STATE = {
    currentPhase: 'DIAGNOSTIC',
    diagnosticStep: 0,
    responses: {},
    protocol: null,
    dreamLogs: {}
};

const UI = {
    phases: {
        DIAGNOSTIC: document.getElementById('phase-diagnostic'),
        PREVIEW: document.getElementById('phase-preview'),
        PAYWALL: document.getElementById('phase-paywall'),
        DASHBOARD: document.getElementById('phase-dashboard')
    },
    crt: {
        overlay: document.getElementById('crt-overlay'),
        content: document.getElementById('crt-content'),
        logger: document.getElementById('dream-logger-ui')
    }
};

// --- INITIALIZATION ---
async function init() {
    const savedProtocol = await window.SovereignVault.get('protocol');
    const savedLogs = await window.SovereignVault.get('dreamLogs');

    if (savedLogs) STATE.dreamLogs = savedLogs;

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

    document.getElementById('q-domain').textContent = `Step ${STATE.diagnosticStep + 1} of ${NeuroEngine.diagnosticFlow.length}`;
    document.getElementById('q-text').textContent = q.question;

    const optionsContainer = document.getElementById('q-options');
    optionsContainer.innerHTML = '';

    if (q.type === 'time') {
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-2 gap-4';
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'py-6 px-8 bolted-module font-mono font-bold hover:shadow-pressed transition-all active:translate-y-[2px]';
            btn.textContent = opt.label;
            btn.onclick = () => {
                STATE.responses[q.id] = opt.value;
                STATE.diagnosticStep++;
                renderDiagnostic();
            };
            grid.appendChild(btn);
        });
        optionsContainer.appendChild(grid);
    } else {
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
}

function finalizeDiagnostic() {
    const results = NeuroEngine.calculateResults(STATE.responses);
    STATE.results = results;
    STATE.protocol = NeuroEngine.generateProtocol(results);

    renderPlanPreview(results);
    showPhase('PREVIEW');
}

function renderPlanPreview(results) {
    document.getElementById('preview-success-rate').textContent = `${results.percent}%`;

    // Deep Profile Analysis Injections
    const profileContainer = document.getElementById('profile-breakdown');
    profileContainer.innerHTML = '';

    // Aggregate domain stats
    const domainStats = {};
    NeuroEngine.diagnosticFlow.forEach(q => {
        if (!domainStats[q.domain]) domainStats[q.domain] = { count: 0, impact: 0 };
        domainStats[q.domain].count++;

        const selected = (q.options || []).find(o => o.value === STATE.responses[q.id]);
        if (selected && selected.impact) {
            domainStats[q.domain].impact += selected.impact;
        }
    });

    Object.entries(domainStats).forEach(([domain, stats]) => {
        const item = document.createElement('div');
        item.className = 'flex flex-col gap-1';
        const severity = stats.impact > 1 ? 'text-safetyOrange' : 'opacity-60';
        item.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="uppercase tracking-widest text-[9px]">${domain}</span>
                <span class="${severity}">${stats.impact > 1 ? 'CRITICAL' : 'OPTIMAL'}</span>
            </div>
            <div class="w-full h-1 bg-muted neumorph-sunken relative overflow-hidden">
                <div class="absolute h-full bg-safetyOrange transition-all duration-1000" style="width: ${Math.min(100, (stats.impact/2)*100)}%"></div>
            </div>
        `;
        profileContainer.appendChild(item);
    });

    // Habit Preview Injections (Phased)
    const habitContainer = document.getElementById('habit-preview-list');
    habitContainer.innerHTML = '';
    STATE.protocol.phases.forEach(phase => {
        const phaseDiv = document.createElement('div');
        phaseDiv.className = 'mb-4';
        phaseDiv.innerHTML = `<h4 class="font-mono text-[9px] uppercase text-safetyOrange mb-2">${phase.title}</h4>`;

        phase.habits.forEach(habit => {
            const div = document.createElement('div');
            div.className = 'p-3 neumorph-sunken rounded-xl mb-2';
            div.innerHTML = `
                <div class="flex justify-between items-center mb-1">
                    <span class="font-bold text-[9px] uppercase">${habit.title}</span>
                    <span class="font-mono text-[9px] text-safetyOrange">${habit.target_time}</span>
                </div>
                <p class="text-[8px] opacity-40 leading-tight">${habit.desc}</p>
            `;
            phaseDiv.appendChild(div);
        });
        habitContainer.appendChild(phaseDiv);
    });
}

function proceedToPaywall() {
    // Populate Paywall Data
    document.getElementById('lri-display').textContent = `${STATE.results.percent}%`;
    const blockerList = document.getElementById('blocker-list');
    blockerList.innerHTML = '';

    const items = [
        { label: 'Circadian Drift', val: STATE.results.jetlag + 'h' },
        { label: 'T-Min Calculation', val: STATE.results.tMin },
        { label: 'Neuro-Load', val: STATE.results.useSupps ? 'Supps Opt-In' : 'Natural' }
    ];

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'p-4 neumorph-sunken rounded-xl flex justify-between items-center';
        div.innerHTML = `
            <span class="font-bold text-xs uppercase">${item.label}</span>
            <span class="font-mono text-xs opacity-60">${item.val}</span>
        `;
        blockerList.appendChild(div);
    });

    showPhase('PAYWALL');
}

async function unlockDashboard() {
    const text = `> INITIALIZING SOVEREIGN ENGINE...
> CALCULATING T-MIN: ${STATE.results.tMin}
> SYNCHRONIZING CHRONOTYPES...
> ANCHORING MISSION PARAMETERS...
>
> [ PROTOCOL: THREE-TIER RECURSIVE ]
> [ RECOVERY BRANCH: ACTIVE ]
> [ LEDGER: INITIALIZED ]
>
> READY. WELCOME TO SOVEREIGN MIND.`;

    await showCRT(text, 3000);

    // STATE.protocol is already generated in finalizeDiagnostic
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

    // Determine current phase habits
    let activeHabits = [];
    STATE.protocol.phases.forEach(phase => {
        if (currentDay >= phase.days[0] && currentDay <= phase.days[1]) {
            activeHabits = [...activeHabits, ...phase.habits];
        }
    });

    // Always include foundation habits if not already included
    STATE.protocol.phases[0].habits.forEach(h => {
        if (!activeHabits.find(ah => ah.id === h.id)) {
            activeHabits.push(h);
        }
    });

    activeHabits.forEach(habit => {
        const card = document.createElement('div');
        card.className = `bolted-module p-8 relative overflow-hidden ${habit.tier === 3 ? 'border-2 border-safetyOrange/50' : ''}`;

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
                    <span class="font-mono text-[9px] opacity-40 uppercase block tracking-tighter">
                        Tier 0${habit.tier} // ${habit.id.toUpperCase()}
                    </span>
                    <h4 class="text-2xl font-bold uppercase tracking-tighter text-primaryText">
                        ${habit.tier === 3 ? '<span class="text-safetyOrange">RECOVERY:</span> ' : ''}${habit.title}
                    </h4>
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

    // Calculate total compliance
    let totalPossible = diffDays * 4;
    let actualCompleted = 0;
    Object.values(STATE.protocol.dailyLogs).forEach(dayLog => {
        actualCompleted += Object.values(dayLog).filter(v => v === true).length;
    });
    const compliancePct = Math.round((actualCompleted / totalPossible) * 100) || 0;

    const text = `> INITIALIZING PRE-CHECK TERMINAL...
> SCANNING LOCAL VAULT...
>
> MISSION DAY: ${diffDays} / 90
> TOTAL LOGS: ${actualCompleted}
> COMPLIANCE RATE: ${compliancePct}%
>
> [ STATUS: ${diffDays < 90 ? 'INCOMPLETE' : (compliancePct < 95 ? 'NON_COMPLIANT' : 'ELIGIBLE')} ]
>
${diffDays < 90 ? `ERROR: 90-DAY MINIMUM NOT MET.
REFUND UNLOCKED IN ${90 - diffDays} DAYS.` : (compliancePct < 95 ? `ERROR: COMPLIANCE BELOW 95%.
GUARANTEE VOIDED. DATA DUMP STILL AVAILABLE.` : `SUCCESS: COMPLIANCE VERIFIED.
GENERATING REFUND KEY...`)}`;

    await showCRT(text, 0, true);

    if (diffDays >= 90) {
        const dumpBtn = document.createElement('button');
        dumpBtn.className = 'font-mono text-xs border border-[#33ff33] px-4 py-2 hover:bg-[#33ff33] hover:text-black transition-all mt-4';
        dumpBtn.textContent = '[ GENERATE_COMPLIANCE_KEY ]';
        dumpBtn.onclick = generateComplianceHash;
        document.getElementById('crt-controls').appendChild(dumpBtn);
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

// --- DREAM LOGGER (SUBCONSCIOUS LEDGER) ---
function openDreamLogger() {
    UI.crt.overlay.style.display = 'flex';
    UI.crt.content.textContent = '> INITIALIZING SUBCONSCIOUS LEDGER...\n> STANDBY FOR NEURAL INPUT...';
    UI.crt.logger.classList.remove('hidden');
    document.getElementById('crt-close').classList.remove('hidden');
}

async function saveDreamLog() {
    const tags = document.getElementById('dream-tags').value;
    const lucidity = document.getElementById('dream-lucidity').value;
    const words = document.getElementById('dream-words').value;

    if (!lucidity || !words) {
        alert('MISSION FAILED: Lucidity and Word Count required.');
        return;
    }

    const startDate = new Date(STATE.protocol.startDate);
    const today = new Date();
    const day = Math.ceil(Math.abs(today - startDate) / (1000 * 60 * 60 * 24)) || 1;

    STATE.dreamLogs[day] = { tags, lucidity, words, timestamp: new Date().toISOString() };
    await window.SovereignVault.set('dreamLogs', STATE.dreamLogs);

    // Close and reset
    UI.crt.logger.classList.add('hidden');
    document.getElementById('dream-tags').value = '';
    document.getElementById('dream-lucidity').value = '';
    document.getElementById('dream-words').value = '';

    await showCRT('> DATA COMMITTED TO VAULT.\n> CORRELATION ENGINE UPDATED.\n> DISCONNECTING...', 2000);
    renderDashboard();
}

window.onload = init;
window.proceedToPaywall = proceedToPaywall;
window.unlockDashboard = unlockDashboard;
window.logHabit = logHabit;
window.handleEmergencyEject = handleEmergencyEject;
window.openDreamLogger = openDreamLogger;
window.saveDreamLog = saveDreamLog;
window.closeCRT = closeCRT;
