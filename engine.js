/**
 * NEURO-CHRONOTYPE ENGINE v14.0 - "SOVEREIGN SYNTHESIS"
 * 30-Question Deep Profiling with 3-Phase 90-Day Protocol Generation.
 */

const NeuroEngine = {
    diagnosticFlow: [
        // --- DOMAIN 1: NEURO-CHEMISTRY (REM Suppressors) ---
        { 
            id: 'ethanol_intake', 
            domain: 'Neuro-Chemistry',
            question: 'What is your typical consumption of Ethanol (Alcohol) before sleep?', 
            type: 'choice',
            options: [
                { label: 'Absolute zero intake (Veto-Free)', value: 'NONE', impact: 0 },
                { label: 'Occasional small glass (< 0.5g/kg)', value: 'LOW', impact: 0.5 },
                { label: 'Moderate to high daily intake (REM Veto Active)', value: 'HIGH', impact: 2.5 }
            ]
        },
        { 
            id: 'thc_usage', 
            domain: 'Neuro-Chemistry',
            question: 'What is your current THC / Cannabis usage pattern?', 
            type: 'choice',
            options: [
                { label: 'No usage (Baseline)', value: 'NONE', impact: 0 },
                { label: 'Low dose micro-dosing (< 2.5mg)', value: 'LOW', impact: 0.3 },
                { label: 'Standard or high dose (> 10mg) (REM Veto Active)', value: 'HIGH', impact: 2.2 }
            ]
        },
        { 
            id: 'caffeine_curfew', 
            domain: 'Neuro-Chemistry',
            question: 'When is your last intake of Caffeine (Coffee/Tea/Energy Drinks)?', 
            type: 'choice',
            options: [
                { label: 'Cut-off > 10 hours before bed', value: 'EARLY', impact: 0 },
                { label: 'Intake within 6–10 hours of bed', value: 'MID', impact: 0.6 },
                { label: 'Late-night intake (REM Delay Active)', value: 'LATE', impact: 1.2 }
            ]
        },
        { 
            id: 'ssri_timing', 
            domain: 'Neuro-Chemistry',
            question: 'Are you currently taking SSRIs (Antidepressants)?', 
            type: 'choice',
            options: [
                { label: 'Not taking any SSRIs', value: 'NONE', impact: 0 },
                { label: 'Morning (AM) dosing', value: 'AM', impact: 0.4 },
                { label: 'Evening/Night dosing (REM Veto Active)', value: 'PM', impact: 1.5 }
            ]
        },
        {
            id: 'nicotine_usage',
            domain: 'Neuro-Chemistry',
            question: 'Do you use nicotine products in the evening?',
            type: 'choice',
            options: [
                { label: 'Never', value: 'NONE', impact: 0 },
                { label: 'Occasionally', value: 'MED', impact: 0.3 },
                { label: 'Systematically (High Pulse)', value: 'HIGH', impact: 0.8 }
            ]
        },
        {
            id: 'magnesium_baseline',
            domain: 'Neuro-Chemistry',
            question: 'Do you currently supplement with Magnesium?',
            type: 'choice',
            options: [
                { label: 'Yes, nightly', value: 'YES', impact: -0.2 },
                { label: 'No', value: 'NO', impact: 0.1 }
            ]
        },

        // --- DOMAIN 2: BIO-CLOCK (Circadian Anchors) ---
        { 
            id: 'wake_consistency', 
            domain: 'Bio-Clock',
            question: 'How consistent is your wake-up time between workdays and weekends?', 
            type: 'choice',
            options: [
                { label: 'High Consistency (Shift < 45 mins)', value: 'HIGH', impact: 0 },
                { label: 'Moderate Social Jetlag (1–2 hour shift)', value: 'MED', impact: 0.7 },
                { label: 'Severe Social Jetlag (> 2 hour shift)', value: 'SEVERE', impact: 1.5 }
            ]
        },
        { 
            id: 'blue_light_exposure', 
            domain: 'Bio-Clock',
            question: 'What is your exposure to Blue Light within 2 hours of sleep?', 
            type: 'choice',
            options: [
                { label: 'Zero exposure; Use of Red Light (631nm)', value: 'NONE', impact: 0 },
                { label: 'Low exposure; Blue-light filters active', value: 'LOW', impact: 0.4 },
                { label: 'High exposure; Direct LED use (55% Suppression)', value: 'HIGH', impact: 1.1 }
            ]
        },
        { 
            id: 'wbtb_alertness', 
            domain: 'Bio-Clock',
            question: 'How would you describe your ability to stay awake during a mid-night interruption?', 
            type: 'choice',
            options: [
                { label: 'Alert for 30–60 mins then return to sleep (Optimal)', value: 'OPTIMAL', impact: 0 },
                { label: 'Fall back asleep instantly (< 10 mins)', value: 'FAST', impact: 0.5 },
                { label: 'Once I wake up, I am awake for the day ("Dead Zone")', value: 'INSOMNIA', impact: 0.9 }
            ]
        },
        {
            id: 'wake_work_time',
            domain: 'Bio-Clock',
            question: 'What is your average wake-up time on work days?',
            type: 'time',
            options: [{label: '05:00', value: '05:00'}, {label: '06:00', value: '06:00'}, {label: '07:00', value: '07:00'}, {label: '08:00', value: '08:00'}, {label: '09:00', value: '09:00'}]
        },
        {
            id: 'sleep_latency',
            domain: 'Bio-Clock',
            question: 'How long does it typically take you to fall asleep?',
            type: 'choice',
            options: [
                { label: '< 15 mins', value: 'FAST', impact: 0 },
                { label: '15-45 mins', value: 'MED', impact: 0.3 },
                { label: '1hr+', value: 'SLOW', impact: 0.7 }
            ]
        },
        {
            id: 'nap_frequency',
            domain: 'Bio-Clock',
            question: 'How often do you take daytime naps?',
            type: 'choice',
            options: [
                { label: 'Never', value: 'NONE', impact: 0 },
                { label: 'Occasionally (Power Nap <20m)', value: 'LOW', impact: 0.2 },
                { label: 'Daily (>1hr)', value: 'HIGH', impact: 0.6 }
            ]
        },

        // --- DOMAIN 3: DREAM RECALL (Mnemonic Scaffolding) ---
        { 
            id: 'recall_frequency', 
            domain: 'Dream Recall',
            question: 'How many mornings per week do you remember a dream fragment?', 
            type: 'choice',
            options: [
                { label: 'Nearly every morning (High Signal Strength)', value: 'HIGH', impact: 0 },
                { label: '2–3 mornings per week (Standard Base)', value: 'MED', impact: 0.6 },
                { label: 'Rarely or never (Recall Scaffolding Required)', value: 'LOW', impact: 1.8 }
            ]
        },
        { 
            id: 'b6_supplementation', 
            domain: 'Dream Recall',
            question: 'Do you currently supplement with Vitamin B6?', 
            type: 'choice',
            options: [
                { label: 'Daily pure B6 (240mg)', value: 'PURE', impact: -0.6 },
                { label: 'General B-Complex', value: 'COMPLEX', impact: -0.3 },
                { label: 'No B-vitamin supplementation', value: 'NONE', impact: 0.3 }
            ]
        },
        { 
            id: 'false_awakenings', 
            domain: 'Dream Recall',
            question: 'How often do you experience "False Awakenings"?', 
            type: 'choice',
            options: [
                { label: 'Frequently (Gateway Active)', value: 'HIGH', impact: -0.5 },
                { label: 'Occasionally', value: 'MED', impact: 0 },
                { label: 'Never', value: 'NONE', impact: 0.3 }
            ]
        },
        {
            id: 'nightmare_frequency',
            domain: 'Dream Recall',
            question: 'How often do you experience vivid nightmares?',
            type: 'choice',
            options: [
                { label: 'Rarely', value: 'LOW', impact: 0 },
                { label: 'Monthly', value: 'MED', impact: 0.2 },
                { label: 'Weekly', value: 'HIGH', impact: 0.4 }
            ]
        },
        {
            id: 'dream_journaling_history',
            domain: 'Dream Recall',
            question: 'Have you ever kept a dream journal for >30 days?',
            type: 'choice',
            options: [
                { label: 'Yes, recently', value: 'YES', impact: -0.4 },
                { label: 'In the past', value: 'PAST', impact: 0 },
                { label: 'Never', value: 'NO', impact: 0.3 }
            ]
        },
        {
            id: 'sleep_paralysis_exp',
            domain: 'Dream Recall',
            question: 'Do you experience Sleep Paralysis?',
            type: 'choice',
            options: [
                { label: 'Regularly', value: 'HIGH', impact: -0.6 },
                { label: 'Rarely', value: 'LOW', impact: -0.1 },
                { label: 'Never', value: 'NONE' }
            ]
        },

        // --- DOMAIN 4: COGNITIVE CAPACITY (Induction Readiness) ---
        { 
            id: 'prospective_memory', 
            domain: 'Cognitive',
            question: 'Rate your ability to "remember to remember" a future task.', 
            type: 'choice',
            options: [
                { label: 'High (Strong Intent)', value: 'HIGH', impact: 0 },
                { label: 'Moderate', value: 'MED', impact: 0.4 },
                { label: 'Low (Scaffolding Required)', value: 'LOW', impact: 1.0 }
            ]
        },
        { 
            id: 'hypnagogic_patterns', 
            domain: 'Cognitive',
            question: 'Do you perceive internal "static" or patterns when eyes are closed?', 
            type: 'choice',
            options: [
                { label: 'Vivid imagery (Visual Loop Ready)', value: 'HIGH', impact: -0.6 },
                { label: 'Faint patterns', value: 'MED', impact: 0 },
                { label: 'Total darkness (Auditory Focus)', value: 'NONE', impact: 0.6 }
            ]
        },
        {
            id: 'meditation_habit',
            domain: 'Cognitive',
            question: 'Do you practice meditation?',
            type: 'choice',
            options: [
                { label: 'Daily (>20m)', value: 'HIGH', impact: -0.5 },
                { label: 'Occasionally', value: 'MED', impact: 0 },
                { label: 'Never', value: 'NONE', impact: 0.3 }
            ]
        },
        {
            id: 'visualization_ability',
            domain: 'Cognitive',
            question: 'Can you visualize a 3D object clearly?',
            type: 'choice',
            options: [
                { label: 'Crystal Clear', value: 'HIGH', impact: -0.4 },
                { label: 'Vague', value: 'MED', impact: 0 },
                { label: 'Cannot Visualize (Aphantasia)', value: 'NONE', impact: 0.6 }
            ]
        },
        {
            id: 'lucid_history',
            domain: 'Cognitive',
            question: 'Total lifetime lucid dreams?',
            type: 'choice',
            options: [
                { label: '50+', value: 'EXPERT', impact: -0.8 },
                { label: '1-10', value: 'NOVICE', impact: 0 },
                { label: 'Zero', value: 'NONE', impact: 0.4 }
            ]
        },
        {
            id: 'reading_habits',
            domain: 'Cognitive',
            question: 'Do you read fiction before bed?',
            type: 'choice',
            options: [
                { label: 'Daily', value: 'HIGH', impact: -0.3 },
                { label: 'Occasionally', value: 'MED', impact: 0 },
                { label: 'Never', value: 'NONE', impact: 0.2 }
            ]
        },

        // --- DOMAIN 5: ENVIRONMENT (TLR Calibration) ---
        { 
            id: 'ambient_noise', 
            domain: 'Environment',
            question: 'Ambient noise level of your bedroom?', 
            type: 'choice',
            options: [
                { label: 'Near-silent (< 25 dB)', value: 'SILENT', impact: 0 },
                { label: 'Occasional city noise', value: 'MED', impact: 0.4 },
                { label: 'Constant high noise', value: 'LOUD', impact: 0.8 }
            ]
        },
        { 
            id: 'wearable_readiness', 
            domain: 'Environment',
            question: 'Willingness to wear haptic/EEG wearables?', 
            type: 'choice',
            options: [
                { label: 'Full Wearables', value: 'FULL', impact: -0.4 },
                { label: 'Wristbands only', value: 'WRIST', impact: -0.2 },
                { label: 'No wearables', value: 'NONE', impact: 0.3 }
            ]
        },
        {
            id: 'room_temperature',
            domain: 'Environment',
            question: 'Typical bedroom temperature?',
            type: 'choice',
            options: [
                { label: 'Cool (<18°C)', value: 'COOL', impact: -0.2 },
                { label: 'Moderate (19-22°C)', value: 'MOD', impact: 0 },
                { label: 'Warm (>23°C)', value: 'WARM', impact: 0.4 }
            ]
        },
        {
            id: 'light_control',
            domain: 'Environment',
            question: 'Control over light (Blackout/Mask)?',
            type: 'choice',
            options: [
                { label: 'Total Darkness', value: 'YES', impact: -0.3 },
                { label: 'Partial Leakage', value: 'PARTIAL', impact: 0.1 },
                { label: 'No control', value: 'NO', impact: 0.5 }
            ]
        },
        {
            id: 'mattress_quality',
            domain: 'Environment',
            question: 'How would you rate your mattress?',
            type: 'choice',
            options: [
                { label: 'Orthopedic / Premium', value: 'HIGH', impact: -0.1 },
                { label: 'Average', value: 'MED', impact: 0.1 },
                { label: 'Poor / Aging', value: 'LOW', impact: 0.3 }
            ]
        },
        {
            id: 'room_humidity',
            domain: 'Environment',
            question: 'Is your room typically dry or humid?',
            type: 'choice',
            options: [
                { label: 'Balanced', value: 'BALANCED', impact: 0 },
                { label: 'Very Dry', value: 'DRY', impact: 0.2 },
                { label: 'Very Humid', value: 'HUMID', impact: 0.2 }
            ]
        }
    ],

    calculateResults(responses) {
        // T-Min Calculation: Wake - 120 mins
        const wakeH = parseInt(responses.wake_work_time?.split(':')[0] || '07');
        const wakeM = parseInt(responses.wake_work_time?.split(':')[1] || '00');
        let tMinTime = new Date();
        tMinTime.setHours(wakeH, wakeM);
        tMinTime.setMinutes(tMinTime.getMinutes() - 120);
        const tMinStr = `${String(tMinTime.getHours()).padStart(2, '0')}:${String(tMinTime.getMinutes()).padStart(2, '0')}`;

        let totalImpact = 0;
        this.diagnosticFlow.forEach(q => {
            const selected = (q.options || []).find(o => o.value === responses[q.id]);
            if (selected && selected.impact) totalImpact += selected.impact;
        });

        const score = Math.max(2, Math.min(90, Math.round(98 - (totalImpact * 5))));

        return {
            percent: score,
            tMin: tMinStr,
            responses: responses
        };
    },

    generateProtocol(results) {
        const r = results.responses;
        const isVetoed = r.ethanol_intake === 'HIGH' || r.thc_usage === 'HIGH' || r.ssri_timing === 'PM';
        
        const protocol = {
            startDate: new Date().toISOString().split('T')[0],
            tMin: results.tMin,
            dailyLogs: {},
            isVetoed: isVetoed,
            config: { totalDays: 90 },
            phases: [
                { 
                    id: 'foundation', 
                    title: isVetoed ? 'Phase 1: Neuro-Purge Remediation' : 'Phase 1: Substrate Repair', 
                    days: [1, 30],
                    habits: [
                        { id: 'b6_recall', tier: 1, title: 'Mnemonic Scaffold', target_time: '21:30', desc: 'Vitamin B6 (240mg) to boost dream recall substrate.' },
                        { id: 'fragment_log', tier: 1, title: 'Fragment Ledger', target_time: '07:30', desc: 'Log even the smallest dream fragments within 4h of wake.' }
                    ]
                },
                { 
                    id: 'priming', 
                    title: 'Phase 2: Circadian Anchoring', 
                    days: [31, 60],
                    habits: [
                        { id: 'anchor_wake', tier: 2, title: 'Circadian Anchor', target_time: r.wake_work_time || '07:00', desc: 'Strict ±45m wake variance to stabilize T-min.' },
                        { id: 'prospective_memory', tier: 2, title: 'Intent Priming', target_time: '12:00', desc: 'Reality testing mapped to existing daily triggers.' }
                    ]
                },
                { 
                    id: 'induction', 
                    title: 'Phase 3: ACh Super-Surge', 
                    days: [61, 90],
                    habits: [
                        { id: 'wbtb_intercept', tier: 3, title: 'Circadian Intercept', target_time: results.tMin, desc: 'Wake at T-min to maximize cholinergic REM density.' },
                        { id: 'induction_method', tier: 3, 
                          title: r.hypnagogic_patterns === 'HIGH' ? 'MILD Intensive' : 'SSILD Sensory Loop', 
                          target_time: results.tMin, 
                          desc: r.hypnagogic_patterns === 'HIGH' ? 'Visualization exercises at T-min+60m.' : 'Tactile/Auditory looping cycles.' }
                    ]
                }
            ],
            dailyMissions: this.generateDailyMissions(r, isVetoed)
        };

        if (isVetoed) {
            protocol.phases[0].habits.push({ id: 'detox_compliance', tier: 1, title: 'Veto Compliance', target_time: '22:00', desc: 'Mandatory zero intake of REM suppressors.' });
        }

        protocol.targetHabits = protocol.phases.reduce((acc, phase) => {
            phase.habits.forEach(h => {
                if (!acc.find(ah => ah.id === h.id)) acc.push(h);
            });
            return acc;
        }, []);

        return protocol;
    },

    generateDailyMissions(r, isVetoed) {
        const missions = [];
        const wakeTime = r.wake_work_time || '07:00';
        
        let wakeH = parseInt(wakeTime.split(':')[0]);
        let wakeM = parseInt(wakeTime.split(':')[1]);
        const tMinTime = new Date();
        tMinTime.setHours(wakeH, wakeM);
        tMinTime.setMinutes(tMinTime.getMinutes() - 120);
        const tMin = `${String(tMinTime.getHours()).padStart(2, '0')}:${String(tMinTime.getMinutes()).padStart(2, '0')}`;
        
        for (let i = 1; i <= 90; i++) {
            let dayMissions = [];
            let header = "";

            // Baseline morning task
            dayMissions.push({ time: wakeTime, task: "Fragment Ledger: Log any dream fragments immediately upon waking. Do not move." });
            
            if (i <= 30) {
                // Phase 1
                header = isVetoed && i <= 15 ? "NEURO-PURGE" : "SUBSTRATE REPAIR";
                if (isVetoed && i <= 15) {
                    dayMissions.push({ time: "12:00", task: "Purge Hydration: Drink 1L water to flush neuro-suppressors." });
                    dayMissions.push({ time: "22:00", task: `Veto Compliance: Absolute zero ${r.ethanol_intake === 'HIGH' ? 'alcohol' : 'THC'} tonight.` });
                } else {
                    dayMissions.push({ time: "14:00", task: "Reality Test: 'Pinch' test when entering new rooms." });
                    dayMissions.push({ time: "21:30", task: "Mnemonic Scaffold: Take Vitamin B6 (240mg)." });
                }
                
                if (i === 1) dayMissions.push({ time: "20:00", task: "Blackout Audit: Seal all light sources in the bedroom."});
                else if (i === 2) dayMissions.push({ time: "22:30", task: "Bedside Prep: Ensure your dream journal is reachable."});
                else if (i === 3) dayMissions.push({ time: "22:00", task: "The Vow: Relentlessly repeat 'I will remember my dreams' 5 times before sleep." });
                else if (i % 7 === 0) dayMissions.push({ time: "18:00", task: "Weekly Audit: Count total dream fragments this week."});
                else if (i === 15) dayMissions.push({ time: "22:00", task: "Mid-Phase Stress Test: Extend sleep by going to bed 30m early to boost late REM." });
                else dayMissions.push({ time: "21:00", task: "Screen Discipline: Total screen darkness 60m before sleep." });
                
            } else if (i <= 60) {
                // Phase 2
                header = "CIRCADIAN ANCHORING";
                dayMissions.push({ time: "12:00", task: "Intent Priming: Reality test mapped to digital triggers (e.g. phone checks)." });
                dayMissions.push({ time: "18:00", task: "Circadian Lock: Guard against social jetlag. Stabilize sleep/wake rhythm." });
                
                if (i === 45) dayMissions.push({ time: "15:00", task: "Prospective Memory Target: Choose a specific object (e.g., a red car) and test upon seeing it."});
                else if (i % 5 === 0) dayMissions.push({ time: "22:00", task: "Text Stability Check: Read text, look away, read again. Practice this."});
                else dayMissions.push({ time: "10:30", task: "Gravity Test: Pause and ask 'Does gravity feel normal here?'" });

            } else {
                // Phase 3
                header = "ACH SUPER-SURGE";
                dayMissions.push({ time: "14:00", task: "Targeted Memory: 5 reality checks linked to emotional spikes." });
                dayMissions.push({ time: tMin, task: `WBTB Intercept: Wake up at T-Min, stay alert for 15-45m without bright lights.` });
                
                if (i === 61 || i % 3 === 0) {
                    dayMissions.push({ time: "03:00", task: "MILD Intensive: Visualize your last dream during WBTB, re-entering with lucidity." });
                } else if (i === 90) {
                    dayMissions.push({ time: "03:00", task: "The Sovereign Ascent: Full SSILD/WBTB stack. Tonight is the peak." });
                } else {
                    dayMissions.push({ time: "03:00", task: "Sensory Loop: Cycle through Sight, Sound, and Touch focus in the dark." });
                }
            }

            // Fallback evening task
            dayMissions.push({ time: "23:00", task: "Sleep Window Engagement: Attempt a clean transition into sleep." });

            missions.push({
                title: `DAY ${String(i).padStart(2, '0')} // ${header}`,
                desc: "Complete all sub-missions below for maximum neural plasticity.",
                steps: dayMissions
            });
        }
        return missions;
    }
};

if (typeof window !== 'undefined') {
    window.NeuroEngine = NeuroEngine;
}
