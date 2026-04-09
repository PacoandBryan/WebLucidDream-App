/**
 * NEURO-CHRONOTYPE ENGINE v9.0 - "THE SOMNOLOGIST'S SYNTHESIS"
 * PhD-Level Logic based on Causal Biomarkers and Pharmacological Synergies.
 */

const NeuroEngine = {
    // Sector 1-4 Master Variable Weights (Simplified for JS Engine)
    weights: {
        galantamine_8mg: 4.46,
        galantamine_4mg: 2.29,
        vitamin_b6: 0.64,
        thc_high_dose: -0.85,
        ethanol_high_dose: -0.75,
        blue_light: -0.55,
        social_jetlag: -0.40,
        recall_baseline: 0.90,
        ssri_acute: -0.80,
        wbtb_optimal: 3.50
    },

    blockers: {
        THC_ALCOHOL: { id: 'THC_ALCOHOL', label: 'REM-Suppressive Axis', severity: 'VETO', fix: 'Neurochemical Flush' },
        SOCIAL_JETLAG: { id: 'SOCIAL_JETLAG', label: 'Circadian Phase Delay', severity: 'HIGH', fix: 'Phase Consistency' },
        AMNESIC_GATING: { id: 'AMNESIC_GATING', label: 'Oneiric Memory Blockade', severity: 'HIGH', fix: 'B6 Scaffolding' },
        STRESS_CORTISOL: { id: 'STRESS_CORTISOL', label: 'Autonomic Hyper-Arousal', severity: 'MODERATE', fix: 'Vagus Downreg' }
    },

    diagnosticFlow: [
        {
            id: 'substance_veto',
            domain: 'NEUROCHEMICAL',
            question: 'Ethanol or THC (>10mg) intake within 4 hours of T-minus 0?',
            type: 'choice',
            options: [
                { label: 'Systemic / Nightly', value: 1.0, blocker: 'THC_ALCOHOL' },
                { label: 'Sporadic', value: 0.5, blocker: 'THC_ALCOHOL' },
                { label: 'Zero Compliance', value: 0.0, blocker: null }
            ]
        },
        {
            id: 'circadian_drift',
            domain: 'CHRONOBIOLOGICAL',
            question: 'Social Jetlag: Shift in wake-time between work/free days?',
            type: 'choice',
            options: [
                { label: '> 120 mins', value: 1.0, blocker: 'SOCIAL_JETLAG' },
                { label: '60 - 120 mins', value: 0.6, blocker: 'SOCIAL_JETLAG' },
                { label: '< 30 mins', value: 0.0, blocker: null }
            ]
        },
        {
            id: 'mnemonic_base',
            domain: 'METACOGNITIVE',
            question: 'Dream Recall Frequency (7-day window)?',
            type: 'choice',
            options: [
                { label: '0 Fragments', value: 1.0, blocker: 'AMNESIC_GATING' },
                { label: '1-3 Fragments', value: 0.4, blocker: 'AMNESIC_GATING' },
                { label: 'Daily Narrative', value: 0.0, blocker: null }
            ]
        },
        {
            id: 'light_hygiene',
            domain: 'CHRONOBIOLOGICAL',
            question: 'Blue light exposure (460nm) post-DLMO (9:00 PM)?',
            type: 'choice',
            options: [
                { label: 'High (LED Unfiltered)', value: 0.8, blocker: null },
                { label: 'Medium (Filtered)', value: 0.3, blocker: null },
                { label: 'Total Dark Immersion', value: 0.0, blocker: null }
            ]
        }
    ],

    calculateResults(responses) {
        let activeBlockers = [];
        let totalImpact = 0;

        this.diagnosticFlow.forEach(q => {
            const val = responses[q.id];
            const opt = q.options.find(o => o.value === val);
            if (opt) {
                totalImpact += opt.value;
                if (opt.blocker) activeBlockers.push(this.blockers[opt.blocker]);
            }
        });

        // LRI Calculation: Base probability adjusted by impact
        const probability = Math.max(0.04, 0.95 - (totalImpact / this.diagnosticFlow.length));

        return {
            probability,
            percent: Math.round(probability * 100),
            activeBlockers: [...new Set(activeBlockers)]
        };
    },

    generateProtocol(activeBlockers, responses) {
        const blockerIds = activeBlockers.map(b => b.id);
        const protocol = {
            startDate: new Date().toISOString().split('T')[0],
            targetHabits: [],
            dailyLogs: {},
            config: {
                totalDays: 90,
                phases: [
                    { name: 'Physiological Reset', start: 1, end: 30 },
                    { name: 'Cognitive Scaffolding', start: 31, end: 60 },
                    { name: 'Cholinergic Synergy', start: 61, end: 90 }
                ]
            }
        };

        // Standard 4-Habit Loadout for Phase 1
        protocol.targetHabits = [
            { id: 'substance_veto', title: 'Neurochemical Veto', target_time: '20:00', icon: 'bolt' },
            { id: 'circadian_anchor', title: 'Circadian Anchor', target_time: '07:30', icon: 'sun' },
            { id: 'recall_scaffold', title: 'Mnemonic Journal', target_time: '07:45', icon: 'pen' },
            { id: 'digital_sunset', title: 'Blue Light Veto', target_time: '21:00', icon: 'moon' }
        ];

        return protocol;
    }
};

window.NeuroEngine = NeuroEngine;
