/**
 * NEURAL ARCHIVE - Dream Clustering Engine
 * 2D Force-Directed Graph using HTML5 Canvas
 */

class DreamClusterEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.edges = [];
        this.tags = {}; // Tag frequency
        this.running = false;
        
        this.hoveredNode = null;
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.onClick(e));
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        this.hoveredNode = null;
        this.canvas.style.cursor = 'default';

        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            const dx = mouseX - node.x;
            const dy = mouseY - node.y;
            if (Math.sqrt(dx*dx + dy*dy) <= node.size + 8) { // Generous hit area
                this.hoveredNode = node;
                this.canvas.style.cursor = 'pointer';
                break;
            }
        }
    }

    onClick(e) {
        if (this.hoveredNode) {
            window.openLedgerView(this.hoveredNode.logData);
        }
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    loadData(dreamLogs) {
        this.nodes = [];
        this.edges = [];
        this.tags = {};
        
        const logs = Object.values(dreamLogs);
        if (logs.length === 0) return;

        // Process Tags and Create Nodes
        logs.forEach(log => {
            const rawTags = log.tags ? log.tags.split(',').map(t => t.trim().toLowerCase().replace('#', '')) : [];
            const tags = rawTags.filter(Boolean);
            
            tags.forEach(t => {
                this.tags[t] = (this.tags[t] || 0) + 1;
            });

            // Map Lucidity to Color
            const lucidity = parseInt(log.lucidity || 1);
            // 1 = Deep Purple (#4F0876), 10 = Electric Cyan (#00f3ff)
            const color = this.getLucidityColor(lucidity);
            
            // Map Words to Size (Obsidian style - much smaller, pristine nodes)
            const size = Math.max(3, Math.min(12, (log.words || 20) / 40));

            this.nodes.push({
                x: this.canvas.width / 2 + (Math.random() - 0.5) * 500,
                y: this.canvas.height / 2 + (Math.random() - 0.5) * 500,
                vx: 0,
                vy: 0,
                size: size,
                color: color,
                lucidity: lucidity,
                tags: tags,
                logData: log
            });
        });

        // Generate Attractive Edges between nodes sharing tags
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const sharedTags = this.nodes[i].tags.filter(t => this.nodes[j].tags.includes(t));
                if (sharedTags.length > 0) {
                    this.edges.push({
                        source: this.nodes[i],
                        target: this.nodes[j],
                        strength: sharedTags.length * 0.1, // More tags = stronger pull
                        distance: 100 - (sharedTags.length * 10)
                    });
                }
            }
        }
    }

    getLucidityColor(level) {
        // Simple lerp from purple to pink to cyan based on 1-10 string
        const t = (level - 1) / 9;
        if (t < 0.5) {
            // Purple to Pink
            return '#c084fc'; 
        } else if (t < 0.8) {
            // Pink to White
            return '#e9d5ff';
        } else {
            return '#00f3ff'; // Core lucid
        }
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.loop();
    }

    stop() {
        this.running = false;
    }

    update(dt) {
        if (this.nodes.length === 0) return;
        
        const sec = Math.min(dt / 1000, 0.1);
        const center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };

        // 1. Center Gravity
        this.nodes.forEach(node => {
            const dx = center.x - node.x;
            const dy = center.y - node.y;
            node.vx += dx * 0.1 * sec;
            node.vy += dy * 0.1 * sec;
        });

        // 2. Repulsion (All nodes push each other)
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const n1 = this.nodes[i];
                const n2 = this.nodes[j];
                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                const distSq = dx*dx + dy*dy;
                
                if (distSq > 0 && distSq < 40000) { // Only repulse if close
                    const dist = Math.sqrt(distSq);
                    const force = (40000 - distSq) / 40000 * 50; 
                    const fx = (dx / dist) * force * sec;
                    const fy = (dy / dist) * force * sec;
                    
                    n1.vx -= fx;
                    n1.vy -= fy;
                    n2.vx += fx;
                    n2.vy += fy;
                }
            }
        }

        // 3. Attraction (Edges)
        this.edges.forEach(edge => {
            const dx = edge.target.x - edge.source.x;
            const dy = edge.target.y - edge.source.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist > edge.distance) {
                const force = (dist - edge.distance) * edge.strength * sec;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                
                edge.source.vx += fx;
                edge.source.vy += fy;
                edge.target.vx -= fx;
                edge.target.vy -= fy;
            }
        });

        // 4. Integrate Physics
        this.nodes.forEach(node => {
            node.vx *= 0.9; // Friction
            node.vy *= 0.9;
            node.x += node.vx;
            node.y += node.vy;

            // Bounds
            node.x = Math.max(node.size, Math.min(this.canvas.width - node.size, node.x));
            node.y = Math.max(node.size, Math.min(this.canvas.height - node.size, node.y));
        });
    }

    setSearchQuery(query) {
        this.searchQuery = query ? query.toLowerCase() : '';
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw Edges (Thinner, subtle lines)
        this.ctx.globalCompositeOperation = 'lighter';
        this.edges.forEach(edge => {
            this.ctx.beginPath();
            this.ctx.moveTo(edge.source.x, edge.source.y);
            this.ctx.lineTo(edge.target.x, edge.target.y);
            this.ctx.strokeStyle = `rgba(192, 132, 252, ${Math.min(0.3, edge.strength * 0.3)})`;
            this.ctx.lineWidth = 0.5 + (edge.strength * 0.5);
            this.ctx.stroke();
        });

        // Draw Nodes
        this.nodes.forEach(node => {
            this.ctx.save();

            // Handle Search Filtering
            let isMatch = true;
            if (this.searchQuery) {
                const d = node.logData;
                const pool = `${d.narrative || ''} ${d.tags || ''} ${d.affect || ''}`.toLowerCase();
                isMatch = pool.includes(this.searchQuery);
            }
            
            // Dim out nodes that do not match the search query!
            this.ctx.globalAlpha = isMatch ? 1.0 : 0.05;
            
            // Subtle, pristine look
            this.ctx.shadowBlur = node.lucidity; // Small blur instead of massive bloom
            this.ctx.shadowColor = node.color;
            this.ctx.fillStyle = node.color;
            
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Hover Overlay
            if (this.hoveredNode === node) {
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 1.5;
                this.ctx.stroke();
                
                // Tooltip text
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '10px "JetBrains Mono", monospace';
                this.ctx.shadowBlur = 0;
                this.ctx.fillText(`${node.logData.words} w`, node.x + node.size + 4, node.y + 3);
            }

            this.ctx.restore();
        });
    }

    loop() {
        if (!this.running) return;
        const now = performance.now();
        const dt = now - this.lastTime;
        this.lastTime = now;
        
        this.update(dt);
        this.draw();
        
        requestAnimationFrame(() => this.loop());
    }
}

let archiveEngine = null;

window.openArchive = function() {
    window.showPhase('ARCHIVE');
    renderArchive();
};

function renderArchive() {
    const logs = STATE.dreamLogs || {};
    const logArray = Object.values(logs);
    
    // Calculate Analytics
    let totalWords = 0;
    let totalLucidity = 0;
    const tagCounts = {};

    logArray.forEach(log => {
        totalWords += (log.words || 0);
        totalLucidity += parseInt(log.lucidity || 1);
        
        const tags = log.tags ? log.tags.split(',').map(t => t.trim().toLowerCase().replace('#', '')) : [];
        tags.filter(Boolean).forEach(t => {
            tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
    });

    const avgLucidity = logArray.length > 0 ? (totalLucidity / logArray.length).toFixed(1) : 0;

    // Update UI
    document.getElementById('archive-total-logs').textContent = logArray.length;
    document.getElementById('archive-total-words').textContent = totalWords;
    document.getElementById('archive-avg-lucidity').textContent = avgLucidity;

    // Dominant Tags
    const dominantTagsContainer = document.getElementById('archive-dominant-tags');
    dominantTagsContainer.innerHTML = '';
    const sortedTags = Object.entries(tagCounts).sort((a,b) => b[1] - a[1]).slice(0, 10);
    
    if (sortedTags.length === 0) {
        dominantTagsContainer.innerHTML = '<span class="text-white/30 text-xs font-mono">No tags detected in ledger.</span>';
    } else {
        sortedTags.forEach(([tag, count]) => {
            const el = document.createElement('span');
            el.className = 'px-3 py-1 bg-[#c084fc]/20 border border-[#c084fc]/50 text-[#e9d5ff] font-mono text-[10px] rounded-full';
            el.textContent = `#${tag} (${count})`;
            dominantTagsContainer.appendChild(el);
        });
    }

    // Start Simulation
    if (!archiveEngine) {
        archiveEngine = new DreamClusterEngine('dream-cluster-canvas');
    }
    archiveEngine.loadData(logs);
    archiveEngine.start();
    
    // Auto-populate ledger
    window.filterLedger('');
    window.showLedgerList();
    document.getElementById('archive-ledger-panel').classList.remove('translate-x-full');
}

window.generateDummyDreamData = async function() {
    if (!STATE.dreamLogs) STATE.dreamLogs = {};
    
    const possibleTags = ['lucid', 'flying', 'nightmare', 'school', 'combat', 'ocean', 'space', 'falling', 'family', 'future', 'void'];
    const possibleAffects = ['Euphoria', 'Fear', 'Awe', 'Confusion', 'Peace', 'Nostalgia'];
    
    const count = 40;
    
    for (let i = 0; i < count; i++) {
        // Random days elapsed
        const day = Math.floor(Math.random() * 90) + 1;
        
        // Gen 1-3 random tags
        const numTags = Math.floor(Math.random() * 3) + 1;
        const selectedTags = [];
        for (let j = 0; j < numTags; j++) {
            const t = possibleTags[Math.floor(Math.random() * possibleTags.length)];
            if (!selectedTags.includes(t)) selectedTags.push(t);
        }

        const lucidity = Math.floor(Math.random() * 10) + 1;
        const words = Math.floor(Math.random() * 500) + 20; // 20 to 520 words
        const affect = possibleAffects[Math.floor(Math.random() * possibleAffects.length)];

        STATE.dreamLogs[`dummy_${i}`] = {
            tags: selectedTags.map(t => `#${t}`).join(', '),
            lucidity: lucidity,
            words: words,
            affect: affect,
            narrative: "SYNTHETIC_DATA_DUMP. This ledger was auto-generated to simulate data.",
            timestamp: new Date().toISOString()
        };
    }

    await window.SovereignVault.set('dreamLogs', STATE.dreamLogs);
    renderArchive();
};

// --- LEDGER SIDEBAR LOGIC ---

window.filterLedger = function(query) {
    if (archiveEngine) archiveEngine.setSearchQuery(query);
    
    const listContainer = document.getElementById('ledger-list-mode');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    
    const logs = Object.entries(STATE.dreamLogs || {}).map(([id, data]) => ({ id, ...data }));
    
    // Sort by timestamp descending
    logs.sort((a,b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    const lowerQuery = query.toLowerCase();
    
    const filtered = logs.filter(log => {
        if (!query) return true;
        const searchPool = `${log.narrative} ${log.tags}`.toLowerCase();
        return searchPool.includes(lowerQuery);
    });

    if (filtered.length === 0) {
        listContainer.innerHTML = `<p class="text-[10px] uppercase font-mono opacity-50 text-center mt-10">No matching clusters found.</p>`;
        return;
    }

    filtered.forEach(log => {
        const d = new Date(log.timestamp);
        const dateStr = isNaN(d.getTime()) ? 'UNKNOWN DATE' : d.toISOString().split('T')[0];
        
        const previewText = (log.narrative || '').slice(0, 80) + '...';
        
        const div = document.createElement('div');
        div.className = 'cursor-pointer p-5 bg-[#121010]/80 border border-[#c084fc]/20 hover:border-[#c084fc] hover:bg-[#c084fc]/10 transition-colors flex flex-col gap-2 relative';
        div.onclick = () => window.openLedgerView(log);
        
        div.innerHTML = `
            <div class="flex justify-between items-baseline mb-1">
                <span class="font-bold text-safetyOrange font-mono text-xs">LUSK: ${log.lucidity}/10</span>
                <span class="font-mono text-[9px] opacity-40">${dateStr}</span>
            </div>
            <p class="font-mono text-[10px] text-[#e9d5ff]/80 leading-relaxed">${previewText}</p>
            <div class="font-mono text-[8.5px] text-[#33ff33] mt-2 opacity-80 uppercase tracking-widest">${(log.tags||'').substring(0, 50)}${(log.tags||'').length > 50 ? '...' : ''}</div>
        `;
        listContainer.appendChild(div);
    });
};

window.openLedgerView = function(logData) {
    const panel = document.getElementById('archive-ledger-panel');
    panel.classList.remove('translate-x-full');
    
    document.getElementById('ledger-list-mode').classList.add('hidden');
    document.getElementById('ledger-read-mode').classList.remove('hidden');

    const d = new Date(logData.timestamp);
    document.getElementById('ledger-read-date').textContent = isNaN(d.getTime()) ? 'DATE: UNKNOWN' : `DATE: ${d.toISOString().split('T')[0]}`;
    document.getElementById('ledger-read-lucidity').textContent = logData.lucidity;
    document.getElementById('ledger-read-words').textContent = logData.words;
    document.getElementById('ledger-read-narrative').textContent = logData.narrative;
    
    const tagsContainer = document.getElementById('ledger-read-tags');
    tagsContainer.innerHTML = '';
    const tags = (logData.tags || '').split(',').map(t => t.trim().replace('#', '')).filter(Boolean);
    tags.forEach(t => {
        const el = document.createElement('span');
        el.className = 'px-3 py-1 bg-[#121010] border border-[#c084fc]/30 text-[#e9d5ff] font-mono text-[9px] rounded-full uppercase tracking-widest';
        el.textContent = `#${t}`;
        tagsContainer.appendChild(el);
    });
};

window.showLedgerList = function() {
    const list = document.getElementById('ledger-list-mode');
    const read = document.getElementById('ledger-read-mode');
    
    if (list.childElementCount === 0) {
        window.filterLedger(document.getElementById('ledger-search-input').value);
    }
    
    list.classList.remove('hidden');
    read.classList.add('hidden');
};

window.closeLedgerView = function() {
    document.getElementById('archive-ledger-panel').classList.add('translate-x-full');
};

window.exportDreamsPlaintext = function() {
    const logs = Object.entries(STATE.dreamLogs || {}).map(([id, data]) => data);
    logs.sort((a,b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    let txt = "== SOVEREIGN MIND // NEURAL LEDGER EXPORT ==\n";
    txt += `EXPORT DATE: ${new Date().toISOString()}\n`;
    txt += `TOTAL LOGS: ${logs.length}\n\n`;
    
    logs.forEach(log => {
        const d = new Date(log.timestamp);
        const dateStr = isNaN(d.getTime()) ? 'UNKNOWN DATE' : d.toISOString().split('T')[0];
        
        txt += `DATE: ${dateStr}\n`;
        txt += `LUCIDITY: ${log.lucidity}/10\n`;
        txt += `WORDS: ${log.words}\n`;
        txt += `TAGS: ${log.tags || 'NONE'}\n`;
        txt += `\n[ NARRATIVE ]\n${log.narrative}\n`;
        txt += `\n---------------------------------------\n\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neural_ledger_export_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
