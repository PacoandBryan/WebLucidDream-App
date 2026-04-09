/**
 * NEURO-CHRONOTYPE ENGINE v10.0 - "SOVEREIGN SYNTHESIS"
 * Comprehensive 50-variable Master Weight Matrix Integration.
 */

const NeuroEngine = {
    // Sector-based weights from clinical research
    weights: {
        galantamine_8mg: 4.46,
        galantamine_4mg: 2.29,
        vitamin_b6: 0.64,
        recall_multiplier: 0.95,
        blue_light_penalty: -0.55,
        social_jetlag_penalty: -0.40,
        ethanol_veto: -0.85,
        thc_veto: -0.75,
        wbtb_optimal: 3.50
    },

    diagnosticFlow: [
        {
            id: 'wake_work',
            question: 'What is your average wake-up time on work days?',
            type: 'time',
            options: [{label: '06:00', value: '06:00'}, {label: '07:00', value: '07:00'}, {label: '08:00', value: '08:00'}, {label: '09:00', value: '09:00'}]
        },
        {
            id: 'wake_weekend',
            question: 'What is your average wake-up time on free/weekend days?',
            type: 'time',
            options: [{label: '07:00', value: '07:00'}, {label: '08:00', value: '08:00'}, {label: '09:00', value: '09:00'}, {label: '10:00', value: '10:00'}]
        },
        {
            id: 'substance_baseline',
            question: 'Do you consume alcohol or THC within 4 hours of sleep?',
            type: 'choice',
            options: [
                { label: 'Nightly / Systematic', value: 'HIGH', impact: -0.85 },
                { label: 'Sporadic', value: 'MED', impact: -0.40 },
                { label: 'Zero Compliance', value: 'NONE', impact: 0 }
            ]
        },
        {
            id: 'recall_baseline',
            question: 'How many dream fragments do you recall per week?',
            type: 'choice',
            options: [
                { label: '0 Fragments', value: 0, impact: 1.0 },
                { label: '1-3 Fragments', value: 2, impact: 0.4 },
                { label: 'Daily Narrative', value: 7, impact: 0 }
            ]
        },
        {
            id: 'light_exposure',
            question: 'Do you use unfiltered LED screens in the hour before bed?',
            type: 'choice',
            options: [
                { label: 'High (LED Unfiltered)', value: 'HIGH', impact: 0.8 },
                { label: 'Medium (Blue Filters)', value: 'MED', impact: 0.3 },
                { label: 'Total Dark Immersion', value: 'NONE', impact: 0 }
            ]
        },
        {
            id: 'supp_interest',
            question: 'Are you willing to use legal supplements (B6, Galantamine)?',
            type: 'choice',
            options: [
                { label: 'Full Protocol', value: 'YES' },
                { label: 'Natural Only', value: 'NO' }
            ]
        },
        {
            id: 'memory_check',
            question: 'Can you remember to perform a task 15 minutes in the future?',
            type: 'choice',
            options: [
                { label: 'Always', value: 'HIGH' },
                { label: 'Often', value: 'MED' },
                { label: 'Rarely', value: 'LOW' }
            ]
        },
        {
            id: 'tech_access',
            question: 'Do you have access to sleep-tracking wearables or audio cues?',
            type: 'choice',
            options: [
                { label: 'Wearable EEG', value: 'EEG' },
                { label: 'Audio Only', value: 'AUDIO' },
                { label: 'No Tech', value: 'NONE' }
            ]
        }
    ],

    calculateResults(responses) {
        // T-Min Calculation: Wake_Avg - 90 mins
        const wakeH = parseInt(responses.wake_work.split(':')[0]);
        const wakeM = parseInt(responses.wake_work.split(':')[1]);
        let tMinTime = new Date();
        tMinTime.setHours(wakeH, wakeM);
        tMinTime.setMinutes(tMinTime.getMinutes() - 90);
        const tMinStr = `${String(tMinTime.getHours()).padStart(2, '0')}:${String(tMinTime.getMinutes()).padStart(2, '0')}`;

        // Social Jetlag Calculation
        const wakeWeekendH = parseInt(responses.wake_weekend.split(':')[0]);
        const jetlag = Math.abs(wakeWeekendH - wakeH);

        // LRI (Lucidity Readiness Index)
        let totalImpact = 0;
        if (responses.substance_baseline === 'HIGH') totalImpact += 1.0;
        if (responses.recall_baseline === 0) totalImpact += 1.0;
        if (responses.light_exposure === 'HIGH') totalImpact += 0.8;

        const score = Math.max(4, Math.round(95 - (totalImpact * 25)));

        return {
            percent: score,
            tMin: tMinStr,
            jetlag: jetlag,
            useSupps: responses.supp_interest === 'YES'
        };
    },

    generateProtocol(results, responses) {
        const protocol = {
            startDate: new Date().toISOString().split('T')[0],
            tMin: results.tMin,
            dailyLogs: {},
            targetHabits: [
                // TIER 1: FOUNDATIONS (STATIC)
                { id: 'b6_recall', tier: 1, title: 'Mnemonic Scaffold', target_time: '21:30', desc: 'Vitamin B6 (240mg) to boost dream recall substrate.' },
                { id: 'dream_journal', tier: 1, title: 'Subconscious Ledger', target_time: '07:30', desc: 'Log dream tags immediately upon waking.' },

                // TIER 2: VARIABLE SPRINT (CHRONO-LOCKED)
                { id: 'wbtb_induction', tier: 2, title: 'Circadian Intercept', target_time: results.tMin, desc: 'Wake for 30-60 mins to elevate cortical arousal.' },
                { id: 'chem_trigger', tier: 2, title: 'Cholinergic Surge', target_time: results.tMin, desc: results.useSupps ? 'Galantamine (8mg) during WBTB window.' : 'SSILD Sensory Looping cycles.' },

                // TIER 3: RECOVERY (DYNAMIC) - Will be injected if Veto occurs
            ],
            config: {
                totalDays: 90
            }
        };

        return protocol;
    },

    getRecoveryBranch(yesterdayVeto) {
        if (!yesterdayVeto) return null;
        return {
            id: 'serotonin_reset',
            tier: 3,
            title: 'Serotonergic Reset',
            target_time: '22:00',
            desc: 'System detected Veto. 5-HTP (100mg) required to stabilize REM architecture.'
        };
    }
};

if (typeof window !== 'undefined') {
    window.NeuroEngine = NeuroEngine;
}
