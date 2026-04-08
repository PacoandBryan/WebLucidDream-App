/**
 * NEURO-CHRONOTYPE ENGINE v6.0 - "THE SPIKY PIVOT"
 * Focused on high-ticket 30-Day Protocol Generation & Veto Logic
 */

const CRITICAL_BLOCKERS = {
  THC_ALCOHOL: { id: "THC_ALCOHOL", weight: 0.15, label: "REM-Suppressive Substances", fix: "Phase 1: Neurochemical Reset (Abstinence Protocol)" },
  INSOMNIA_STRESS: { id: "INSOMNIA_STRESS", weight: 0.20, label: "Hyper-Arousal / Cortisol Spikes", fix: "Phase 1: Autonomic Downregulation (Vagus Stimulation)" },
  VARIABLE_WAKE: { id: "VARIABLE_WAKE", weight: 0.25, label: "Circadian Fragmentation", fix: "Phase 1: Circadian Anchoring (Strict 15-min Window)" },
  SSRI_TIMING: { id: "SSRI_TIMING", weight: 0.30, label: "Pharmacological REM Blockade", fix: "Phase 1: Med-Timing Calibration (Morning Shift)" },
  ZERO_RECALL: { id: "ZERO_RECALL", weight: 0.40, label: "Oneiric Amnesia", fix: "Phase 1: TPJ Activation (Recumbent Retention)" }
};

/**
 * --- ADVANCED PROTOCOL DATA ---
 */
const PHASE_TASKS = {
  THC_ALCOHOL: {
    p1: [
      "Terminate all intake 4h before sleep; Begin Magnesium (300mg) supplementation.",
      "Identify the 48-hour flush window; initiate total abstinence.",
      "Implement 90-min Dark-Phase Transition (Zero Blue Light).",
      "Monitor REM Rebound intensity; log vividness spikes.",
      "Calibrate CNS downregulation via 4-7-8 breathing (10 mins pre-onset)."
    ]
  },
  VARIABLE_WAKE: {
    p1: [
      "Set mandatory 15-min wake anchor; discard all snooze functions.",
      "Execute 'Solar Anchoring': 5 mins of direct sunlight upon waking.",
      "Align evening melatonin onset; initiate 'Digital Sunset' at 9 PM.",
      "Stabilize circadian phase-response curve; no variance allowed.",
      "Verify homeostatic sleep drive buildup via 12 PM caffeine hard-stop."
    ]
  },
  ZERO_RECALL: {
    p1: [
      "Implement 'Recumbent Mnemonic Retention' (90s stillness upon waking).",
      "Execute 3 mandatory 'Mnemonic Back-Traces' during the day.",
      "Initiate the 'Sensory Fragment' retrieval drill at 3 AM awakening.",
      "Strengthen TPJ nodes via prospective memory cue training.",
      "Log 'Micro-Dreams' even if blurry; reward cognitive salience."
    ]
  },
  INSOMNIA_STRESS: {
    p1: [
      "Vagus Nerve Stimulation (cold exposure/deep breathing) pre-sleep.",
      "Implement 'Cognitive Shuffling' to bypass cortical hyper-arousal.",
      "Execute the 'Cortisol Downregulation' protocol (Magnesium + Theanine).",
      "Identify and neutralize 'Dream Friction' triggers in waking life.",
      "Establish a 'Zen-State' sleep sanctuary; remove all non-sleep stimuli."
    ]
  },
  SSRI_TIMING: {
    p1: [
      "Shift medication timing to 8:00 AM to clear REM windows.",
      "Monitor evening cortical arousal; log any 'Zaps' or tension.",
      "Implement the 'Cholinergic Priming' diet (Eggs/Choline-rich foods).",
      "Execute 20 mins of aerobic activity to stabilize neurochemistry.",
      "Verify evening downregulation via the 90-min Dark-Phase protocol."
    ]
  }
};

const INDUCTION_TASKS = [
  "Prospective Memory: Set intent to notice 'State Cues' (doorways/clocks).",
  "MILD: Mentally rehearse the last dream with a 'Lucid Pivot'.",
  "SSILD: Focus on Sight, Sound, and Touch cycles (30s each).",
  "WBTB: 15-min quiet wakefulness followed by Mnemonic State-Priming.",
  "DILD/ADA: Maintain 'All Day Awareness' of your current sensory field."
];

const CONSOLIDATION_TASKS = [
  "Stacking: Execute WBTB + MILD + Reality Check sequence.",
  "DEILD: Practice stationary return-to-sleep immediately upon dream exit.",
  "Stabilization: Spinning and Hand-Rubbing drills inside the dream.",
  "Advanced Visualization: Project a stable dream object in a void space.",
  "High-Fidelity Control: Alter one specific sensory element (color/sound)."
];

const diagnosticFlow = [
  {
    id: "substance_use",
    question: "Do you consume Cannabis or Alcohol within 4 hours of sleep?",
    type: "choice",
    domain: "neurochemical",
    options: [
      { label: "Daily / Frequently", value: 10, blocker: "THC_ALCOHOL" },
      { label: "Occasionally", value: 5, blocker: null },
      { label: "Rarely/Never", value: 0, blocker: null }
    ]
  },
  {
    id: "caffeine_cutoff",
    question: "At what time do you consume your last caffeinated beverage?",
    type: "choice",
    domain: "neurochemical",
    options: [
      { label: "After 4 PM", value: 10 },
      { label: "Noon - 4 PM", value: 5 },
      { label: "Before Noon", value: 0 }
    ]
  },
  {
    id: "ssri_use",
    question: "Do you currently take SSRIs or SNRIs?",
    type: "yesno",
    domain: "neurochemical",
    yesScore: 10,
    noScore: 0,
    next: (val) => (val === "yes" ? "ssri_timing" : "sleep_consistency")
  },
  {
    id: "ssri_timing",
    question: "When do you take your medication?",
    type: "choice",
    domain: "neurochemical",
    options: [
      { label: "Evening / Night", value: 10, blocker: "SSRI_TIMING" },
      { label: "Morning", value: 2, blocker: null }
    ]
  },
  {
    id: "sleep_consistency",
    question: "How much does your wake-up time vary throughout the week?",
    type: "choice",
    domain: "chronobiological",
    options: [
      { label: "More than 2 hours", value: 10, blocker: "VARIABLE_WAKE" },
      { label: "1 - 2 hours", value: 5 },
      { label: "Less than 30 mins", value: 0 }
    ]
  },
  {
    id: "sleep_duration",
    question: "Average total sleep duration per night?",
    type: "choice",
    domain: "chronobiological",
    options: [
      { label: "Under 6 hours", value: 10 },
      { label: "6 - 7.5 hours", value: 4 },
      { label: "8+ hours", value: 0 }
    ]
  },
  {
    id: "blue_light",
    question: "Screen usage (phone/laptop) in the 60 mins before bed?",
    type: "choice",
    domain: "chronobiological",
    options: [
      { label: "Heavy / No Filters", value: 10 },
      { label: "Filtered (Night Shift)", value: 5 },
      { label: "Zero Screen Time", value: 0 }
    ]
  },
  {
    id: "night_awakenings",
    question: "How often do you struggle to fall back asleep after waking up at night?",
    type: "choice",
    domain: "chronobiological",
    options: [
      { label: "Almost every night", value: 10, blocker: "INSOMNIA_STRESS" },
      { label: "2-3 times a week", value: 6 },
      { label: "Rarely", value: 0 }
    ]
  },
  {
    id: "dream_recall",
    question: "How many dreams can you remember per week?",
    type: "choice",
    domain: "metacognitive",
    options: [
      { label: "0 dreams", value: 10, blocker: "ZERO_RECALL" },
      { label: "1-2 dreams", value: 6 },
      { label: "3-5 dreams", value: 2 },
      { label: "Daily", value: 0 }
    ]
  },
  {
    id: "reality_check_habit",
    question: "How often do you question your reality during the day?",
    type: "choice",
    domain: "metacognitive",
    options: [
      { label: "Never", value: 10 },
      { label: "A few times", value: 5 },
      { label: "Constantly", value: 0 }
    ]
  },
  {
    id: "prospective_memory",
    question: "How good are you at remembering to do things in the future?",
    type: "choice",
    domain: "metacognitive",
    options: [
      { label: "Forgetful", value: 10 },
      { label: "Average", value: 5 },
      { label: "Sharp Intention", value: 0 }
    ]
  },
  {
    id: "dream_friction",
    question: "What happens when you realize you might be dreaming?",
    type: "choice",
    domain: "metacognitive",
    options: [
      { label: "I wake up instantly", value: 10 },
      { label: "The dream goes dark/unstable", value: 8 },
      { label: "I lose control immediately", value: 6 },
      { label: "I've never realized it", value: 4 }
    ]
  },
  {
    id: "stress_baseline",
    question: "General stress level during your waking hours?",
    type: "choice",
    domain: "neurochemical",
    options: [
      { label: "Chronic / High", value: 10, blocker: "INSOMNIA_STRESS" },
      { label: "Moderate", value: 5 },
      { label: "Low / Zen", value: 0 }
    ]
  },
  {
    id: "meditation_experience",
    question: "Do you have a consistent mindfulness practice?",
    type: "choice",
    domain: "metacognitive",
    options: [
      { label: "None", value: 8 },
      { label: "Occasional", value: 4 },
      { label: "Daily Practice", value: 0 }
    ]
  },
  {
    id: "false_awakenings",
    question: "Do you ever 'wake up' in your room, only to realize later it was a dream?",
    type: "choice",
    domain: "metacognitive",
    options: [
      { label: "Never", value: 10 },
      { label: "Once or twice", value: 5 },
      { label: "Frequently", value: 0 }
    ]
  },
  {
    id: "sleep_paralysis",
    question: "Have you ever experienced sleep paralysis?",
    type: "yesno",
    domain: "metacognitive",
    yesScore: 0, // Actually often a positive marker for training
    noScore: 5
  },
  {
    id: "internal_monologue",
    question: "Is your internal monologue constant or mostly quiet?",
    type: "choice",
    domain: "metacognitive",
    options: [
      { label: "Non-stop chatter", value: 8 },
      { label: "Balanced", value: 4 },
      { label: "Mostly quiet", value: 0 }
    ]
  },
  {
    id: "creative_output",
    question: "Do you engage in creative work or visualization?",
    type: "choice",
    domain: "metacognitive",
    options: [
      { label: "Rarely", value: 8 },
      { label: "Sometimes", value: 4 },
      { label: "Daily", value: 0 }
    ]
  },
  {
    id: "hypnagogia_awareness",
    question: "Do you see patterns or hear sounds as you fall asleep?",
    type: "choice",
    domain: "metacognitive",
    options: [
      { label: "Never notice them", value: 8 },
      { label: "Occasionally", value: 4 },
      { label: "Very aware of them", value: 0 }
    ]
  },
  {
    id: "vividness_baseline",
    question: "How vivid are your normal, non-lucid dreams?",
    type: "choice",
    domain: "metacognitive",
    options: [
      { label: "Blurry / Faded", value: 10 },
      { label: "Moderate detail", value: 5 },
      { label: "Lifelike / Cinematic", value: 0 }
    ]
  }
];

let lucidityWeightMatrix = null;

async function loadWeightMatrix() {
  if (lucidityWeightMatrix) return lucidityWeightMatrix;
  try {
    const response = await fetch('lucidity_weight_matrix.json');
    const data = await response.json();
    lucidityWeightMatrix = data.LUCIDITY_WEIGHT_MATRIX;
    return lucidityWeightMatrix;
  } catch (e) {
    console.warn("Using internal fallback for Weight Matrix (Local File System detected)");
    lucidityWeightMatrix = {
      "chemical_interference": { 
        "caffeine_late_day": { "weight": -0.75, "scientific_reason": "Antagonism of adenosine A1 receptors..." }
      },
      "chronobiology": {
        "sleep_duration_under_6": { "weight": -0.85, "scientific_reason": "Truncates late-morning REM cycles." }
      },
      "cognitive_baseline": {
        "dream_recall_frequency": { "weight": 0.9, "scientific_reason": "Mnemonic encoding of dream content." }
      }
    };
    return lucidityWeightMatrix;
  }
}

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

function calculateLRI(userInputs) {
  let activeBlockers = [];
  
  // 1. Calculate Domain Raw Scores (0 = perfect, higher = worse)
  const domains = {
    neurochemical: { raw: 0, max: 0 },
    chronobiological: { raw: 0, max: 0 },
    metacognitive: { raw: 0, max: 0 }
  };

  diagnosticFlow.forEach(q => {
    let value = 0;
    if (q.type === 'choice') {
      value = userInputs[q.id] || 0;
      // Identify blockers
      if (q.options) {
        const selectedOpt = q.options.find(opt => opt.value === value);
        if (selectedOpt && selectedOpt.blocker) {
          activeBlockers.push(CRITICAL_BLOCKERS[selectedOpt.blocker]);
        }
      }
      // Max value for normalization
      const maxVal = Math.max(...q.options.map(o => o.value));
      domains[q.domain].max += maxVal;
    } else if (q.type === 'yesno') {
      value = (userInputs[q.id] === 'yes') ? (q.yesScore || 0) : (q.noScore || 0);
      domains[q.domain].max += Math.max(q.yesScore || 0, q.noScore || 0);
    }
    domains[q.domain].raw += value;
  });

  // 2. Normalize Domains to [0, 1] where 1 = optimal (low raw score)
  const N = 1 - (domains.neurochemical.raw / (domains.neurochemical.max || 1));
  const C = 1 - (domains.chronobiological.raw / (domains.chronobiological.max || 1));
  const M = 1 - (domains.metacognitive.raw / (domains.metacognitive.max || 1));

  // 3. Compute Logistic LRI (Recalibrated for v7.0: [4.7%, 98.9%])
  const logit = -3.0 
    + 2.5 * Math.pow(N, 0.6) 
    + 2.0 * Math.pow(C, 0.7) 
    + 3.0 * Math.pow(M, 0.8);

  const probability = sigmoid(logit);

  return {
    probability,
    percent: Math.round(probability * 100),
    activeBlockers: [...new Set(activeBlockers)], // Unique blockers
    rawBase: (N + C + M) / 3 * 100, // Average baseline for motivational text
    N, C, M
  };
}

function generateMotivationalStatement(result) {
  const { score, activeBlockers } = result;
  const primaryBlocker = activeBlockers.length > 0 ? activeBlockers[0].label : "Subconscious Static";
  const baselineStatus = result.rawBase > 70 ? "OPTIMIZED_BASELINE" : "DEVELOPING_FOUNDATION";

  return `
    <div class="glass-card" style="margin-bottom: 2rem; border-color: rgba(255,255,255,0.05);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h2 class="text-gradient" style="font-size: 2rem; margin: 0 0 10px 0;">Index: ${score}%</h2>
          <p class="font-mono" style="font-size: 0.7rem; color: #888; margin: 0;">PRIMARY_BOTTLENECK: <span style="color: #ff4444;">${primaryBlocker.toUpperCase()}</span></p>
        </div>
        <div class="font-mono" style="font-size: 0.6rem; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px;">ESTIMATED_RECOVERY: 90_DAYS</div>
      </div>
      
      <div class="domain-scores" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 2rem;">
        <div class="holographic-container" style="flex-direction: column; padding: 1.5rem;">
          <div style="font-size: 0.6rem; color: #666; font-family: var(--font-mono); margin-bottom: 8px;">NEUROCHEMICAL</div>
          <div style="color: #ff4444; font-size: 1.2rem; font-weight: 800;">${(result.N * 100).toFixed(0)}%</div>
        </div>
        <div class="holographic-container" style="flex-direction: column; padding: 1.5rem;">
          <div style="font-size: 0.6rem; color: #666; font-family: var(--font-mono); margin-bottom: 8px;">CHRONO_SYNC</div>
          <div style="color: #ffbb33; font-size: 1.2rem; font-weight: 800;">${(result.C * 100).toFixed(0)}%</div>
        </div>
        <div class="holographic-container" style="flex-direction: column; padding: 1.5rem;">
          <div style="font-size: 0.6rem; color: #666; font-family: var(--font-mono); margin-bottom: 8px;">META_CONTROL</div>
          <div style="color: #00ffcc; font-size: 1.2rem; font-weight: 800;">${(result.M * 100).toFixed(0)}%</div>
        </div>
      </div>
    </div>
  `;
}

async function generateProtocolData(userInputs) {
  const result = calculateLRI(userInputs);
  const blockers = result.activeBlockers.length > 0 ? result.activeBlockers : [CRITICAL_BLOCKERS.ZERO_RECALL];
  const blockerIds = blockers.map(b => b.id);

  const protocol = {
    phases: [
      { name: "Physiological Reset", days: [] },
      { name: "Cognitive Priming", days: [] },
      { name: "Deep Induction", days: [] }
    ]
  };

  const getDayPlan = (day, phaseIdx) => {
    let tasks = { morning: "", daytime: "", nighttime: "", outcome: "" };
    
    // Check for specific canonical blocker presence
    const hasThc = blockerIds.includes('THC_ALCOHOL');
    const hasStress = blockerIds.includes('INSOMNIA_STRESS');
    const hasRecallGap = blockerIds.includes('ZERO_RECALL');

    if (phaseIdx === 0) { // Phase 1: Reset
      tasks.morning = "Direct sunlight exposure (10 mins) + 300mg Magnesium bisglycinate.";
      tasks.daytime = "Total caffeine cessation after 11:00 AM. Fasting window initialized (16:8).";
      tasks.nighttime = hasThc ? "PROTOCOL_VETO: Absolute abstinence. 0.3mg Melatonin (Circadian Anchor)." : "Dark-room immersion (0 lux) 60 mins before sleep onset.";
      tasks.outcome = "Receptor Sensitivity Restoration";
    } else if (phaseIdx === 1) { // Phase 2: Priming
      tasks.morning = "TPJ Visualization: Mentally 'back-trace' your path from bedroom to kitchen.";
      tasks.daytime = hasStress ? "VAGUS_RESET: Cold shower (30s) + Physiological Sigh (5 cycles) every 4 hours." : "Prospective memory cues: Reality check whenever you pass a doorway.";
      tasks.nighttime = hasRecallGap ? "MNEMONIC_SEED: Record 3 'sensory fragments' from the smallest dream flickers." : "Pre-sleep 'Dream Mapping': Sketch your dream architecture.";
      tasks.outcome = "Phase-Lock REM Stabilization";
    } else { // Phase 3: Induction
      tasks.morning = "Lucidity Anchor: First thought must be 'I am dreaming now'.";
      tasks.daytime = "WBTB Simulation: 15-min stillness session (14:00) with hypnagogic intent.";
      tasks.nighttime = "STG Technique: Focus on the ringing in your ears or the visual static to transition.";
      tasks.outcome = "Conscious Trans-State Entry";
    }

    return tasks;
  };

  for (let day = 1; day <= 30; day++) {
    const phaseIdx = day > 20 ? 2 : (day > 10 ? 1 : 0);
    const dayPlan = getDayPlan(day, phaseIdx);
    
    protocol.phases[phaseIdx].days.push({
      day,
      title: phaseIdx === 0 ? "Receptor Homeostasis" : (phaseIdx === 1 ? "Neural Pathfinding" : "Lucid Gateway"),
      ...dayPlan
    });
  }

  return protocol;
}

window.NeuroEngine = {
  diagnosticFlow,
  calculateLRI,
  generateProtocolData
};
