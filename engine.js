/**
 * NEURO-CHRONOTYPE ENGINE v3.0
 * Third Iteration: Final High-Fidelity Logic & Industrial Mapping
 */

const NeuroEngine = {
    blockers: {
        THC_ALCOHOL: { id: 'THC_ALCOHOL', label: 'REM-Suppressive Substances', severity: 'CRITICAL', fix: 'Neurochemical Reset' },
        INSOMNIA_STRESS: { id: 'INSOMNIA_STRESS', label: 'Cortisol Hyper-Arousal', severity: 'HIGH', fix: 'Vagus Downregulation' },
        VARIABLE_WAKE: { id: 'VARIABLE_WAKE', label: 'Circadian Fragmentation', severity: 'HIGH', fix: 'Circadian Anchoring' },
        SSRI_TIMING: { id: 'SSRI_TIMING', label: 'Pharmacological Blockade', severity: 'MODERATE', fix: 'Med-Timing Calibration' },
        ZERO_RECALL: { id: 'ZERO_RECALL', label: 'Oneiric Amnesia', severity: 'CRITICAL', fix: 'TPJ Activation' }
    },

    diagnosticFlow: [
        {
            id: 'substance_use',
            domain: 'NEUROCHEMICAL',
            question: 'Do you consume THC or Alcohol within 4 hours of your sleep onset?',
            type: 'choice',
            options: [
                { label: 'Frequently', value: 1.0, blocker: 'THC_ALCOHOL' },
                { label: 'Occasionally', value: 0.5, blocker: 'THC_ALCOHOL' },
                { label: 'Never', value: 0.0, blocker: null }
            ]
        },
        {
            id: 'wake_consistency',
            domain: 'CHRONOBIOLOGICAL',
            question: 'How much does your wake-up time vary between weekdays and weekends?',
            type: 'choice',
            options: [
                { label: '> 2 Hours', value: 1.0, blocker: 'VARIABLE_WAKE' },
                { label: '1 - 2 Hours', value: 0.5, blocker: 'VARIABLE_WAKE' },
                { label: '< 30 Mins', value: 0.0, blocker: null }
            ]
        },
        {
            id: 'sleep_latency',
            domain: 'CHRONOBIOLOGICAL',
            question: 'Do you experience "Racing Thoughts" when attempting to initiate sleep?',
            type: 'choice',
            options: [
                { label: 'Every Night', value: 1.0, blocker: 'INSOMNIA_STRESS' },
                { label: 'Sometimes', value: 0.5, blocker: 'INSOMNIA_STRESS' },
                { label: 'Rarely', value: 0.0, blocker: null }
            ]
        },
        {
            id: 'dream_recall_rate',
            domain: 'METACOGNITIVE',
            question: 'How many dreams have you recorded or remembered in the last 7 days?',
            type: 'choice',
            options: [
                { label: '0 Dreams', value: 1.0, blocker: 'ZERO_RECALL' },
                { label: '1 - 2 Dreams', value: 0.5, blocker: 'ZERO_RECALL' },
                { label: '3+ Dreams', value: 0.0, blocker: null }
            ]
        }
    ],

    calculateResults(responses) {
        let activeBlockers = [];
        let totalScore = 0;

        this.diagnosticFlow.forEach(q => {
            const selectedValue = responses[q.id];
            const option = q.options.find(opt => opt.value === selectedValue);

            if (option) {
                totalScore += option.value;
                if (option.blocker && option.value > 0) {
                    activeBlockers.push({
                        ...this.blockers[option.blocker],
                        weight: option.value
                    });
                }
            }
        });

        // Probability of success based on blockers
        const probability = Math.max(0.05, 1 - (totalScore / this.diagnosticFlow.length));

        return {
            probability,
            percent: Math.round(probability * 100),
            activeBlockers: [...new Map(activeBlockers.map(item => [item.id, item])).values()]
        };
    },

    generateProtocol(activeBlockers) {
        const blockerIds = activeBlockers.map(b => b.id);
        const habits = [];

        // 1. Neurochemical Habit
        if (blockerIds.includes('THC_ALCOHOL')) {
            habits.push({ id: 'substance_curfew', title: 'Substance Veto', target_time: '20:00', streak: 0 });
        } else {
            habits.push({ id: 'caffeine_stop', title: 'Caffeine Hard-Stop', target_time: '14:00', streak: 0 });
        }

        // 2. Chronobiological Habit
        if (blockerIds.includes('VARIABLE_WAKE')) {
            habits.push({ id: 'wake_anchor', title: 'Wake-up Anchor', target_time: '07:00', streak: 0 });
        } else {
            habits.push({ id: 'solar_exposure', title: 'Solar Anchoring', target_time: '07:30', streak: 0 });
        }

        // 3. Metacognitive Habit
        if (blockerIds.includes('ZERO_RECALL')) {
            habits.push({ id: 'mnemonic_retention', title: 'Mnemonic Recall', target_time: '07:15', streak: 0 });
        } else {
            habits.push({ id: 'reality_calibration', title: 'Reality Check', target_time: '13:00', streak: 0 });
        }

        // 4. Autonomic Habit
        if (blockerIds.includes('INSOMNIA_STRESS')) {
            habits.push({ id: 'vagus_reset', title: 'Vagus Downreg', target_time: '21:30', streak: 0 });
        } else {
            habits.push({ id: 'digital_sunset', title: 'Digital Sunset', target_time: '22:00', streak: 0 });
        }

        return {
            startDate: new Date().toISOString().split('T')[0],
            targetHabits: habits,
            dailyLogs: {}
        };
    }
};

window.NeuroEngine = NeuroEngine;
