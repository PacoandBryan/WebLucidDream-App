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

const SYSTEM_VAULT_KEY = "4a1b8c2d1e0f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d";

const UI = {
    crt: {
        overlay: document.getElementById('crt-overlay'),
        content: document.getElementById('crt-content'),
        logger: document.getElementById('dream-logger-ui')
    },
    phases: {
        DIAGNOSTIC: document.getElementById('phase-diagnostic'),
        PREVIEW_1: document.getElementById('phase-preview-1'),
        PREVIEW_2: document.getElementById('phase-preview-2'),
        PAYWALL: document.getElementById('phase-paywall'),
        TIMESETUP: document.getElementById('phase-timesetup'),
        DASHBOARD: document.getElementById('phase-dashboard'),
        ARCHIVE: document.getElementById('phase-archive')
    }
};

// --- INITIALIZATION ---
async function init() {
    const savedProtocol = await window.SovereignVault.get('protocol');
    const savedLogs = await window.SovereignVault.get('dreamLogs');
    const licenseVerified = await window.SovereignVault.get('license_verified');
    
    if (savedLogs) STATE.dreamLogs = savedLogs;

    if (savedProtocol && licenseVerified) {
        STATE.protocol = savedProtocol;
        showPhase('DASHBOARD');
        renderDashboard();
    } else if (savedProtocol) {
        // We have a protocol but needs license
        showPhase('PAYWALL');
    } else {
        // Restore diagnostic progress if any
        const savedResponses = localStorage.getItem('SV_diagnostic_responses');
        const savedStep = localStorage.getItem('SV_diagnostic_step');
        if (savedResponses) STATE.responses = JSON.parse(savedResponses);
        if (savedStep) STATE.diagnosticStep = parseInt(savedStep);

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

    // Save progress
    localStorage.setItem('SV_diagnostic_responses', JSON.stringify(STATE.responses));
    localStorage.setItem('SV_diagnostic_step', STATE.diagnosticStep);

    document.getElementById('q-domain').textContent = `Step ${STATE.diagnosticStep + 1} of ${NeuroEngine.diagnosticFlow.length}`;
    document.getElementById('q-text').textContent = q.question;
    
    const prevBtn = document.getElementById('prev-q-btn');
    if (prevBtn) {
        prevBtn.classList.toggle('hidden', STATE.diagnosticStep === 0);
    }

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
    // Clear persistence
    localStorage.removeItem('SV_diagnostic_responses');
    localStorage.removeItem('SV_diagnostic_step');

    const results = NeuroEngine.calculateResults(STATE.responses);
    STATE.results = results;
    STATE.protocol = NeuroEngine.generateProtocol(results);

    renderPlanPreview(results);
    showPhase('PREVIEW_1');
}

function showProtocolPreview() {
    showPhase('PREVIEW_2');
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

    // Habit Preview Injections (Daily Missions)
    const habitContainer = document.getElementById('habit-preview-list');
    habitContainer.innerHTML = '';
    
    if (STATE.protocol.dailyMissions && STATE.protocol.dailyMissions.length > 0) {
        STATE.protocol.dailyMissions.forEach((mission, index) => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'mb-6';
            dayDiv.innerHTML = `<h4 class="font-mono text-[10px] uppercase text-safetyOrange mb-3 pb-1 border-b border-safetyOrange/30">${mission.title}</h4>`;
            
            mission.steps.forEach(step => {
                const stepDiv = document.createElement('div');
                stepDiv.className = 'p-3 neumorph-sunken rounded-xl mb-2';
                stepDiv.innerHTML = `
                    <div class="flex items-start gap-4 text-[10px] font-mono">
                        <span class="text-safetyOrange font-bold whitespace-nowrap">[${step.time}]</span> 
                        <span class="opacity-80">${step.task}</span>
                    </div>
                `;
                dayDiv.appendChild(stepDiv);
            });
            habitContainer.appendChild(dayDiv);
        });
    } else {
        // Fallback for older legacy protocols
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
}

async function verifyAndUnlock() {
    const keyInput = document.getElementById('license-key-input');
    const verifyBtn = document.getElementById('verify-btn');
    const key = keyInput.value.trim();

    if (!key) {
        showCRT("> [ SYSTEM ERROR ]\n> PLEASE ENTER A VALID LICENSE KEY.");
        return;
    }

    verifyBtn.textContent = "[ VERIFYING... ]";
    verifyBtn.disabled = true;

    try {
        // Use a proxy to avoid CORS issues if calling Gumroad directly from frontend
        // For now, we attempt direct call, but usually this needs a small backend or a worker
        const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'product_id': 'FLxE61f1AIbmtoiFHK5gsA==',
                'license_key': key
            })
        });

        const data = await response.json();

        if (data.success && !data.uses_over_limit) { 
            // CELEBRATION SEQUENCE
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ff4757', '#ffffff', '#2d3436']
            });

            await showCRT("> [ ACCESS GRANTED ]\n> INITIALIZING CORE SYSTEMS...\n> FIREWALL DEACTIVATED.\n> WELCOME TO SOVEREIGN MIND.", 3500);
            
            // Second burst
            confetti({
                particleCount: 100,
                spread: 160,
                origin: { y: 1 },
                colors: ['#ff4757', '#c084fc']
            });

            await window.SovereignVault.set('license_verified', true);
            await window.SovereignVault.set('license_key', key);
            
            // UNBLUR RESULTS
            const blurContainer = document.getElementById('results-blur-container');
            if (blurContainer) {
                blurContainer.classList.remove('blur-md', 'pointer-events-none');
                const overlay = blurContainer.querySelector('.bg-black/10');
                if (overlay) overlay.remove();
            }

            showProtocolPreview();
        } else {
            throw new Error(data.message || "Invalid or expired License Key.");
        }
    } catch (err) {
        console.error(err);
        await showCRT("> ERROR: FIREWALL BREACH ATTEMPT.\n> INVALID SECURITY KEY.\n> " + err.message.toUpperCase(), 4000);
    } finally {
        verifyBtn.textContent = "[ VERIFY ]";
        verifyBtn.disabled = false;
    }
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

function showTimeSetup() {
    const list = document.getElementById('time-setup-list');
    list.innerHTML = '';

    STATE.allHabits = [];
    STATE.protocol.phases.forEach(p => {
        p.habits.forEach(h => {
            if (!STATE.allHabits.find(ah => ah.id === h.id)) STATE.allHabits.push(h);
        });
    });

    STATE.allHabits.forEach(habit => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-6 neumorph-sunken rounded-2xl';
        div.innerHTML = `
            <div class="flex flex-col">
                <span class="font-bold text-xs uppercase">${habit.title}</span>
                <span class="text-[9px] opacity-40 uppercase tracking-widest">${habit.id}</span>
            </div>
            <input type="time" value="${habit.target_time}" 
                onchange="updateHabitTime('${habit.id}', this.value)"
                class="bg-chassis neumorph-card px-4 py-2 rounded-lg font-mono text-sm outline-none focus:shadow-pressed transition-all">
        `;
        list.appendChild(div);
    });

    showPhase('TIMESETUP');
}

function updateHabitTime(id, time) {
    STATE.allHabits.find(h => h.id === id).target_time = time;
    // Sync back to protocol phases
    STATE.protocol.phases.forEach(p => {
        p.habits.forEach(h => {
            if (h.id === id) h.target_time = time;
        });
    });
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
    renderProficiencyUI();
    renderHabitCards();
    renderMissionLog(diffDays);

    // Render current daily mission
    if (STATE.protocol.dailyMissions) {
        const mission = STATE.protocol.dailyMissions[diffDays - 1] || { title: "REST DAY", desc: "Maintain baseline protocols.", steps: [] };
        document.getElementById('current-mission-text').textContent = mission.title || "NO MISSION";
        
        const stepsContainer = document.getElementById('current-mission-steps');
        if (stepsContainer && mission.steps) {
            stepsContainer.innerHTML = mission.steps.map(s => 
                `<div class="flex items-start gap-4 text-[11px] font-mono border-l-2 border-safetyOrange pl-3 py-1"><span class="text-safetyOrange font-bold whitespace-nowrap">[${s.time}]</span> <span class="opacity-80">${s.task}</span></div>`
            ).join('');
        }
    }
}

function render90DayHeatmap(currentDay) {
    const grid = document.getElementById('heatmap-grid');
    grid.innerHTML = '';
    grid.className = 'grid grid-cols-10 gap-1'; 

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
            square.style.border = '2px solid #ff4757';
            square.classList.add('animate-pulse');
        }

        square.onclick = () => showDayDiagnostic(i, log);
        grid.appendChild(square);
    }

    const compliancePct = (totalCompleted / 90) * 100;
    document.getElementById('compliance-pct').textContent = `${Math.round(compliancePct)}%`;
}

function renderMissionLog(currentDay) {
    const fullListContainer = document.getElementById('full-plan-list');
    const currentDayContainer = document.getElementById('current-day-log-container');
    
    if (fullListContainer) fullListContainer.innerHTML = '';
    if (currentDayContainer) currentDayContainer.innerHTML = '';

    if (!STATE.protocol.missionData) {
        STATE.protocol.missionData = {};
    }

    const missions = STATE.protocol.dailyMissions || [];
    missions.forEach((mission, idx) => {
        const day = idx + 1;
        const isCurrent = day === currentDay;
        
        if (!STATE.protocol.missionData[day]) {
            STATE.protocol.missionData[day] = {};
        }

        const dayCard = document.createElement('div');
        
        if (isCurrent) {
            dayCard.className = `p-8 rounded-2xl border-2 border-safetyOrange neumorph-card shadow-led-glow relative h-full flex flex-col`;
            dayCard.innerHTML = `
                <div class="absolute -top-3 left-6 px-4 py-1 bg-safetyOrange text-white font-bold text-[9px] uppercase tracking-widest rounded-full shadow-led-glow">TODAY'S MISSIONS</div>
                <h4 class="font-mono text-2xl font-bold uppercase tracking-tighter text-primaryText mb-2">${mission.title}</h4>
                <p class="font-mono text-[11px] opacity-80 mb-6 border-l-2 border-safetyOrange pl-3">${mission.desc}</p>
                <div class="space-y-4 flex-grow custom-scrollbar overflow-y-auto pr-4" id="current-day-steps"></div>
            `;
            if (currentDayContainer) currentDayContainer.appendChild(dayCard);
        } else {
            const past = day < currentDay;
            dayCard.className = `p-6 rounded-2xl transition-all neumorph-sunken relative ${past ? 'opacity-40' : 'opacity-20'}`;
            dayCard.innerHTML = `
                <h4 class="font-mono text-xs font-bold uppercase text-safetyOrange mb-1">${mission.title}</h4>
                <p class="font-mono text-[9px] opacity-80 mb-4">${mission.desc}</p>
                <div class="space-y-2 opacity-80" id="other-day-steps-${day}"></div>
            `;
            if (fullListContainer) fullListContainer.appendChild(dayCard);
        }

        const stepsContainer = isCurrent ? dayCard.querySelector('#current-day-steps') : dayCard.querySelector(`#other-day-steps-${day}`);
        
        if (mission.steps && stepsContainer) {
            mission.steps.forEach((step, stepIdx) => {
                const data = STATE.protocol.missionData[day][stepIdx] || { checked: false, note: '' };
                
                let isLocked = false;
                let statusLabel = '';
                let statusColor = 'text-primaryText';
                let indicatorClass = '';

                if (data.checked) {
                    isLocked = true;
                    statusLabel = 'LOGGED';
                    statusColor = 'text-[#33ff33]';
                    indicatorClass = 'led-active';
                } else if (day < currentDay) {
                    isLocked = true;
                    statusLabel = 'SYS_FAIL';
                    statusColor = 'text-safetyOrange';
                    indicatorClass = 'led-fail';
                } else if (day > currentDay) {
                    isLocked = true;
                    statusLabel = 'OFFLINE';
                    statusColor = 'opacity-40';
                    indicatorClass = 'bg-primaryText/20';
                } else {
                    const lockStatus = checkTimeLock(step.time);
                    isLocked = lockStatus.isLocked;
                    statusLabel = lockStatus.label;
                    if (lockStatus.status === 'ACTIVE') {
                        statusColor = 'text-safetyOrange';
                        indicatorClass = 'led-active animate-pulse';
                    } else if (lockStatus.status === 'FAIL') {
                        statusColor = 'text-safetyOrange';
                        indicatorClass = 'led-fail';
                    } else {
                        statusColor = 'opacity-40';
                        indicatorClass = 'bg-primaryText/20';
                    }
                }

                const checkedAttr = data.checked ? 'checked' : '';
                const disabledAttr = (isLocked && !data.checked) ? 'disabled' : '';
                
                const stepCard = document.createElement('div');
                if (isCurrent) {
                    stepCard.className = `p-5 rounded-xl ${isLocked && !data.checked ? 'neumorph-sunken opacity-60' : 'bg-chassis neumorph-card'} flex flex-col gap-3 transition-all`;
                } else {
                    stepCard.className = `p-3 rounded-lg border border-primaryText/5 bg-transparent flex flex-col gap-2`;
                }

                stepCard.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div class="flex items-start gap-4">
                            <input type="checkbox" ${checkedAttr} ${disabledAttr}
                                onchange="updateMissionData(${day}, ${stepIdx}, 'checked', this.checked)"
                                class="mt-1 w-5 h-5 accent-safetyOrange ${disabledAttr ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}">
                            <div class="flex-grow font-mono ${isCurrent ? 'text-xs' : 'text-[10px]'}">
                                <span class="${statusColor} font-bold whitespace-nowrap">[${step.time}]</span> 
                                <span class="${data.checked ? 'opacity-40 line-through' : 'opacity-80'}">${step.task}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 shrink-0 ml-4 font-mono text-[9px] uppercase tracking-widest font-bold">
                            <span class="${statusColor}">${statusLabel}</span>
                            <div class="led-indicator ${indicatorClass} w-2 h-2 rounded-full"></div>
                        </div>
                    </div>
                    <div class="pl-9">
                        <input type="text" id="mission-note-${day}-${stepIdx}" value="${data.note || ''}" ${disabledAttr}
                            onchange="updateMissionData(${day}, ${stepIdx}, 'note', this.value)"
                            placeholder="${isLocked && !data.checked ? 'Data link offline...' : 'Enter system data / log note...'}" 
                            class="w-full bg-transparent border-b border-primaryText/10 outline-none font-mono text-[10px] text-primaryText focus:border-safetyOrange transition-colors py-1 ${disabledAttr ? 'cursor-not-allowed' : ''}">
                    </div>
                `;
                stepsContainer.appendChild(stepCard);
            });
        }
    });

    if (fullListContainer) {
        setTimeout(() => {
            const firstFutureDay = Array.from(fullListContainer.children).find(card => card.classList.contains('opacity-20'));
            if (firstFutureDay) {
                fullListContainer.scrollTop = firstFutureDay.offsetTop - fullListContainer.offsetTop - 50;
            } else {
                fullListContainer.scrollTop = fullListContainer.scrollHeight;
            }
        }, 200);
    }
}

window.updateMissionData = async function(day, stepIdx, field, value) {
    if (!STATE.protocol.missionData[day]) {
        STATE.protocol.missionData[day] = {};
    }
    if (!STATE.protocol.missionData[day][stepIdx]) {
        STATE.protocol.missionData[day][stepIdx] = { checked: false, note: '' };
    }
    
    if (field === 'checked' && value === true) {
        // Enforce Input Constraint
        const noteInput = document.getElementById(`mission-note-${day}-${stepIdx}`);
        const currentNote = noteInput ? noteInput.value.trim() : STATE.protocol.missionData[day][stepIdx].note.trim();
        
        if (!currentNote) {
            showCRT("> [ SYSTEM ERROR ]\n> DATA LOG NOTE REQUIRED TO COMMIT MISSION.");
            if (noteInput) {
                noteInput.style.borderColor = '#ff4757';
                noteInput.placeholder = '[ SYSTEM ERROR: DATA LOG REQUIRED TO FINISH MISSION ]';
            }
            
            // Revert checkbox check natively
            const startDate = new Date(STATE.protocol.startDate);
            const today = new Date();
            const currentDay = Math.ceil(Math.abs(today - startDate) / (1000 * 60 * 60 * 24)) || 1;
            renderMissionLog(currentDay);
            return;
        }

        // Auto-save the note if it was just typed
        STATE.protocol.missionData[day][stepIdx].note = currentNote;

        if (!STATE.protocol.missionData[day][stepIdx].checked) {
            const { leveledUp, profile } = window.SovereignStore.addXP(100);
            if (leveledUp) triggerLevelUp(profile.Proficiency_Level);
            window.SovereignStore.updateStreak(true);
        }
    }
    
    STATE.protocol.missionData[day][stepIdx][field] = value;
    await window.SovereignVault.set('protocol', STATE.protocol);
    
    const startDate = new Date(STATE.protocol.startDate);
    const today = new Date();
    const currentDay = Math.ceil(Math.abs(today - startDate) / (1000 * 60 * 60 * 24)) || 1;
    renderMissionLog(currentDay);
    renderProficiencyUI();
};

function renderProficiencyUI() {
    const profile = window.SovereignStore.getProfile();
    document.getElementById('user-level-display').textContent = profile.Proficiency_Level;
    document.getElementById('user-xp-display').textContent = `${profile.User_XP} XP`;

    // Calculate LUSK (Average Lucidity) & LuCiD scale (proxy: avg words / 100 max)
    let totalLucidity = 0;
    let totalWords = 0;
    const logs = Object.values(STATE.dreamLogs || {});
    
    if (logs.length > 0) {
        logs.forEach(l => {
            totalLucidity += parseInt(l.lucidity || 1);
            totalWords += (l.words || 0);
        });
        
        const avgLucidity = ((totalLucidity / logs.length) / 10) * 100;
        const avgWordsPercent = Math.min(((totalWords / logs.length) / 100) * 100, 100);
        
        document.getElementById('lusk-text').textContent = `${Math.round(avgLucidity)}%`;
        document.getElementById('lusk-bar').style.width = `${Math.round(avgLucidity)}%`;

        document.getElementById('lucid-text').textContent = `${Math.round(avgWordsPercent)}%`;
        document.getElementById('lucid-bar').style.width = `${Math.round(avgWordsPercent)}%`;
    }

    // Update Elapsed Timeline display
    const startDate = new Date(STATE.protocol.startDate);
    const today = new Date();
    const currentDay = Math.ceil(Math.abs(today - startDate) / (1000 * 60 * 60 * 24)) || 1;
    const elapsedDisplay = document.getElementById('elapsed-time-display');
    const elapsedFill = document.getElementById('elapsed-time-fill');
    if (elapsedDisplay) elapsedDisplay.textContent = `DAY ${String(currentDay).padStart(2, '0')}/90`;
    if (elapsedFill) elapsedFill.style.width = Math.min((currentDay / 90) * 100, 100) + '%';

    const streakWidget = document.getElementById('streak-widget');
    if (streakWidget) {
        if (profile.Current_Streak !== undefined) {
            streakWidget.classList.remove('hidden');
            
            const display = document.getElementById('streak-count-display');
            const pct = Math.min((profile.Current_Streak / 90) * 100, 100);
            
            if (display) display.textContent = `${profile.Current_Streak} / 90 DAYS • ${Math.round(pct)}%`;
            
            // Progress Bar Tracker
            const fill = document.getElementById('streak-progress-fill');
            if (fill) {
                fill.style.width = pct + '%';
            }
        } else {
            streakWidget.classList.add('hidden');
        }
    }
}

async function showDayDiagnostic(day, log) {
    const completed = Object.keys(log).length;
    const mission = STATE.protocol.dailyMissions && STATE.protocol.dailyMissions[day - 1];
    let missionText = "NO_MISSION_DATA";
    if (mission) {
        missionText = `${mission.title}\n> ${mission.desc}\n` + mission.steps.map(s => `>  [${s.time}] ${s.task}`).join('\n');
    }
    
    const text = `> DIAGNOSTIC REPORT: DAY ${day}
> MISSION: ${missionText}
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
    if (!container) return; // Prevent crash if layout is altered
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
                class="w-full py-6 rounded-2xl font-mono text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4
                ${isLocked ? 'neumorph-sunken text-primaryText/20 cursor-not-allowed transition-all duration-300' : 'neumorph-card text-primaryText hover:shadow-pressed active:shadow-pressed active:scale-[0.98] transition-all duration-150'}">
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

    // ACTIVE: Exact -20m to 4 hours window
    if (diffMins >= -20 && diffMins <= 240) {
        return { isLocked: false, status: 'ACTIVE', label: 'ENGAGE' };
    } 
    // FAIL: Permanently lock if more than 4 hours missed
    else if (diffMins > 240) {
        return { isLocked: true, status: 'FAIL', label: 'SYS_FAIL' };
    }
    // OFFLINE: Before Target Window
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

    // Gamification System Rewards
    const { leveledUp: l1, profile: p1 } = window.SovereignStore.addXP(100);
    if (l1) triggerLevelUp(p1.Proficiency_Level);
    window.SovereignStore.updateStreak(true);

    const logArray = Object.values(STATE.protocol.dailyLogs[currentDay]);
    if (logArray.length === 4 && logArray.every(v => v === true)) {
        window.SovereignStore.logCompliance(currentDay, true);
        const { leveledUp: l2, profile: p2 } = window.SovereignStore.addXP(250); // Bonus for perfect day
        if (l2) triggerLevelUp(p2.Proficiency_Level);
    }

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
REFUND UNLOCKED IN ${90 - diffDays} DAYS.` : (compliancePct < 95 ? `[RE-ENGAGE PROTOCOL TO RESTORE ELIGIBILITY]` : `SUCCESS: COMPLIANCE VERIFIED.
GENERATING REFUND KEY...`)}`;

    await showCRT(text, 0, true);
    
    if (diffDays >= 90 && compliancePct >= 95) {
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
    
    // Auto-update word count
    const textarea = document.getElementById('dream-narrative');
    const display = document.getElementById('word-count-display');
    textarea.oninput = () => {
        const count = textarea.value.trim().split(/\s+/).filter(Boolean).length;
        display.textContent = `WORDS_DETECTED: ${count}`;
    };
}

function startSTT() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();
    
    const btn = document.getElementById('stt-btn');
    btn.textContent = '[ LISTENING... ]';
    btn.classList.add('animate-pulse');

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const textarea = document.getElementById('dream-narrative');
        textarea.value += (textarea.value ? ' ' : '') + transcript;
        textarea.oninput();
        btn.textContent = '[ VOICE_TO_TEXT ]';
        btn.classList.remove('animate-pulse');
    };

    recognition.onerror = () => {
        btn.textContent = '[ ERROR_RETRY ]';
        btn.classList.remove('animate-pulse');
    };
}

async function saveDreamLog() {
    const tags = document.getElementById('dream-tags').value;
    const lucidity = document.getElementById('dream-lucidity').value;
    const affect = document.getElementById('dream-affect').value;
    const narrative = document.getElementById('dream-narrative').value;
    const words = narrative.trim().split(/\s+/).filter(Boolean).length;

    if (!lucidity || words < 20) {
        showCRT("> [ MISSION FAILED ]\n> LUCIDITY AND MINIMUM 20 WORDS REQUIRED.");
        return;
    }

    const startDate = new Date(STATE.protocol.startDate);
    const today = new Date();
    const day = Math.ceil(Math.abs(today - startDate) / (1000 * 60 * 60 * 24)) || 1;

    STATE.dreamLogs[day] = { tags, lucidity, affect, words, narrative, timestamp: new Date().toISOString() };
    await window.SovereignVault.set('dreamLogs', STATE.dreamLogs);

    // Gamification Reward logic
    const { leveledUp, profile } = window.SovereignStore.addXP(300); // Higher reward for doing the ledger
    if (leveledUp) triggerLevelUp(profile.Proficiency_Level);

    const rewards = [
        "> SUBCONSCIOUS INSIGHT: Your Phase-A REM latency is shortening.",
        "> REWARD UNLOCKED: Neural Adaptability +1. Acetylcholine binding increased.",
        "> SUBCONSCIOUS INSIGHT: The 'Emotion River' indicates strong pattern formation.",
        "> REWARD UNLOCKED: Baseline reality anchors strengthening.",
        "> SUBCONSCIOUS INSIGHT: Correlating memory fragments to waking triggers."
    ];
    const rewardStr = rewards[Math.floor(Math.random() * rewards.length)];

    // Close and reset
    UI.crt.logger.classList.add('hidden');
    document.getElementById('dream-tags').value = '';
    document.getElementById('dream-lucidity').value = '';
    document.getElementById('dream-affect').value = '';
    document.getElementById('dream-narrative').value = '';
    document.getElementById('word-count-display').textContent = 'WORDS_DETECTED: 0';
    
    await showCRT(`> DATA COMMITTED TO VAULT.\n> CORRELATION ENGINE UPDATED.\n${rewardStr}\n> DISCONNECTING...`, 4000);
    renderDashboard();
}

async function clearAllData() {
    if (confirm("WARNING: PHYSICAL WIPE INITIATED. This will destroy all local logs. Proceed?")) {
        // Show terminal overlay
        UI.crt.overlay.style.display = 'flex';
        UI.crt.content.textContent = '';
        document.getElementById('crt-close').classList.add('hidden');
        UI.crt.logger.classList.add('hidden');

        const logMsg = async (msg, delay = 600) => {
            UI.crt.content.textContent += msg + '\n';
            await new Promise(r => setTimeout(r, delay));
        };

        await logMsg("> INITIATING SYSTEM_WIPE...", 1000);
        await logMsg("> TERMINATING ACTIVE SESSION...", 800);
        await logMsg("> STATUS: LOGGING OUT USER_001... [DONE]", 600);
        await logMsg("> DELETING NEURAL DATA LEDGERS...", 800);
        await logMsg("> STATUS: DATA DELETED. [DONE]", 600);
        await logMsg("> WIPING LOCAL VAULT...", 800);
        await logMsg("> STATUS: VAULT CLEARED. [DONE]", 600);
        await logMsg("> RESTARTING SITE...", 1000);
        await logMsg("> RESTART COMPLETE.", 1500);

        // Perform clearing
        await window.SovereignVault.clear();
        localStorage.clear();
        sessionStorage.clear();
        
        // Final restart
        window.location.reload();
    }
}

async function exportVault() {
    try {
        const password = SYSTEM_VAULT_KEY;
        const exportData = {
            localStorage: {},
            indexedDB: {}
        };

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('SV_')) {
                exportData.localStorage[key] = localStorage.getItem(key);
            }
        }

        exportData.indexedDB = await window.SovereignVault.getAll();

        const jsonStr = JSON.stringify(exportData);
        const encrypted = CryptoJS.AES.encrypt(jsonStr, password).toString();

        const blob = new Blob([encrypted], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sovereign_mind_vault.enc';
        a.click();
        
        await showCRT("> SYSTEM BACKUP SUCCESSFUL.\n> ENCRYPTED VAULT OFFLOADED.", 4000);
    } catch (e) {
        showCRT("> [ SYSTEM ERROR ]\n> ENCRYPTION FAILED: " + e.message.toUpperCase());
    }
}

async function importVault() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.enc';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const password = SYSTEM_VAULT_KEY;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const encrypted = event.target.result;
                const decryptedStr = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
                if (!decryptedStr) throw new Error("Incorrect password or corrupted file.");

                const importedData = JSON.parse(decryptedStr);

                if (importedData.localStorage) {
                    for (const [key, value] of Object.entries(importedData.localStorage)) {
                        localStorage.setItem(key, value);
                    }
                }

                if (importedData.indexedDB) {
                    for (const [key, value] of Object.entries(importedData.indexedDB)) {
                        await window.SovereignVault.set(key, value);
                    }
                }

                await showCRT("> VAULT IMPORT SUCCESSFUL.\n> RELOADING SYSTEM...", 3000);
                window.location.reload();
            } catch (err) {
                showCRT("> [ SYSTEM ERROR ]\n> DECRYPTION FAILED. VERIFY SECURITY KEY.");
                console.error(err);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function prevDiagnostic() {
    if (STATE.diagnosticStep > 0) {
        STATE.diagnosticStep--;
        renderDiagnostic();
    }
}

function triggerLevelUp(level) {
    confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ff4757', '#33ff33', '#c084fc']
    });

    showCRT(`> [ EVOLUTION DETECTED ]\n> PROFICIENCY INCREASED TO LEVEL ${level}.\n> NEURAL PATHWAYS OPTIMIZED.`, 4000);
}

window.onload = init;
window.prevDiagnostic = prevDiagnostic;
window.proceedToPaywall = proceedToPaywall;
window.showProtocolPreview = showProtocolPreview;
window.showTimeSetup = showTimeSetup;
window.updateHabitTime = updateHabitTime;
window.unlockDashboard = unlockDashboard;
window.logHabit = logHabit;
window.handleEmergencyEject = handleEmergencyEject;
window.openDreamLogger = openDreamLogger;
window.saveDreamLog = saveDreamLog;
window.startSTT = startSTT;
window.clearAllData = clearAllData;
window.exportVault = exportVault;
window.importVault = importVault;
window.closeCRT = closeCRT;
window.showPhase = showPhase;
