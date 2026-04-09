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
        THC_ALCOHOL: {
            id: 'THC_ALCOHOL',
            label: 'Dream-Suppressive Axis',
            severity: 'VETO',
            fix: 'Neurochemical Flush',
            description: 'Alcohol and THC suppress REM sleep, the stage where vivid dreams occur.'
        },
        SOCIAL_JETLAG: {
            id: 'SOCIAL_JETLAG',
            label: 'Sleep-Wake Misalignment',
            severity: 'HIGH',
            fix: 'Phase Consistency',
            description: 'Irregular sleep schedules confuse your internal clock, making dream recall harder.'
        },
        AMNESIC_GATING: {
            id: 'AMNESIC_GATING',
            label: 'Memory Blockade',
            severity: 'HIGH',
            fix: 'Recall Scaffolding',
            description: 'A lack of dream recall is often a cognitive "gate" that needs to be trained open.'
        },
        LIGHT_HYGIENE: {
            id: 'LIGHT_HYGIENE',
            label: 'Digital Interference',
            severity: 'MODERATE',
            fix: 'Blue Light Veto',
            description: 'Screen use late at night delays melatonin, pushing your dream cycles into a shorter window.'
        }
    },

    diagnosticFlow: [
        {
            id: 'substance_veto',
            domain: 'NEUROCHEMICAL',
            question: 'Do you consume alcohol or THC within 4 hours of bedtime?',
            type: 'choice',
            options: [
                { label: 'Daily / Often', value: 1.0, blocker: 'THC_ALCOHOL' },
                { label: 'Sometimes', value: 0.5, blocker: 'THC_ALCOHOL' },
                { label: 'Never', value: 0.0, blocker: null }
            ]
        },
        {
            id: 'circadian_drift',
            domain: 'CHRONOBIOLOGICAL',
            question: 'Does your wake-up time change by more than an hour on weekends?',
            type: 'choice',
            options: [
                { label: 'Yes, significantly', value: 1.0, blocker: 'SOCIAL_JETLAG' },
                { label: 'Sometimes', value: 0.6, blocker: 'SOCIAL_JETLAG' },
                { label: 'Always the same', value: 0.0, blocker: null }
            ]
        },
        {
            id: 'mnemonic_base',
            domain: 'METACOGNITIVE',
            question: 'How often do you remember your dreams?',
            type: 'choice',
            options: [
                { label: 'Never', value: 1.0, blocker: 'AMNESIC_GATING' },
                { label: 'Occasionally', value: 0.4, blocker: 'AMNESIC_GATING' },
                { label: 'Almost every morning', value: 0.0, blocker: null }
            ]
        },
        {
            id: 'light_hygiene',
            domain: 'CHRONOBIOLOGICAL',
            question: 'Do you use screens (phone, laptop) in the hour before sleep?',
            type: 'choice',
            options: [
                { label: 'Yes, without filters', value: 0.8, blocker: 'LIGHT_HYGIENE' },
                { label: 'Yes, with night mode', value: 0.3, blocker: 'LIGHT_HYGIENE' },
                { label: 'No screens at all', value: 0.0, blocker: null }
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
        const protocol = {
            startDate: new Date().toISOString().split('T')[0],
            targetHabits: [],
            dailyLogs: {},
            config: {
                totalDays: 90,
                phases: [
                    { name: 'Foundation', start: 1, end: 30 },
                    { name: 'Intensity', start: 31, end: 60 },
                    { name: 'Optimization', start: 61, end: 90 }
                ]
            }
        };

        // Dynamic Habit Mapping
        const habitTemplates = {
            THC_ALCOHOL: { id: 'chem_curfew', title: 'Chemical Curfew', target_time: '20:00', desc: 'Stop alcohol/THC intake to allow REM pressure to build.' },
            SOCIAL_JETLAG: { id: 'wake_anchor', title: 'Wake-Up Anchor', target_time: '07:30', desc: 'Set a consistent wake-up time to stabilize your dream cycles.' },
            AMNESIC_GATING: { id: 'dream_journal', title: 'Mnemonic Journal', target_time: '07:45', desc: 'Record anything you remember immediately upon waking.' },
            LIGHT_HYGIENE: { id: 'digital_sunset', title: 'Digital Sunset', target_time: '21:30', desc: 'Turn off all screens to trigger natural melatonin release.' }
        };

        // Ensure we always have 4 habits. If blocker is missing, use default.
        Object.keys(this.blockers).forEach(key => {
            const template = habitTemplates[key];
            protocol.targetHabits.push({
                ...template,
                streak: 0,
                impact: this.blockers[key].label
            });
        });

        return protocol;
    }
};

window.NeuroEngine = NeuroEngine;
