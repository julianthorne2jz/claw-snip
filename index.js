#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const WORKSPACE = path.resolve(__dirname, '../../');
const SNIPS_FILE = path.join(WORKSPACE, 'snippets.json');

const args = process.argv.slice(2);
const command = args[0];

function loadSnips() {
    if (!fs.existsSync(SNIPS_FILE)) return [];
    return JSON.parse(fs.readFileSync(SNIPS_FILE, 'utf-8'));
}

function saveSnips(snips) {
    fs.writeFileSync(SNIPS_FILE, JSON.stringify(snips, null, 2));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

if (command === 'add') {
    // snip add "text" [--tag tag1,tag2] [--source url]
    const text = args[1];
    if (!text) {
        console.error('Usage: snip add "text" [--tag tags] [--source url]');
        process.exit(1);
    }

    let tags = [];
    let source = '';
    
    for (let i = 2; i < args.length; i++) {
        if (args[i] === '--tag' || args[i] === '-t') {
            tags = args[++i]?.split(',').map(t => t.trim().toLowerCase()) || [];
        } else if (args[i] === '--source' || args[i] === '-s') {
            source = args[++i] || '';
        }
    }

    const snips = loadSnips();
    const snip = {
        id: generateId(),
        text,
        tags,
        source,
        created: new Date().toISOString()
    };
    snips.push(snip);
    saveSnips(snips);
    
    console.log(`✅ Saved: ${snip.id}`);
    console.log(`   "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

} else if (command === 'list' || command === 'ls') {
    const snips = loadSnips();
    const tagFilter = args[1];
    
    let filtered = snips;
    if (tagFilter) {
        filtered = snips.filter(s => s.tags.includes(tagFilter.toLowerCase()));
    }
    
    if (filtered.length === 0) {
        console.log('No snippets found.');
    } else {
        filtered.slice(-20).reverse().forEach(s => {
            console.log(`[${s.id}] ${s.tags.length ? `#${s.tags.join(' #')}` : ''}`);
            console.log(`  "${s.text.substring(0, 80)}${s.text.length > 80 ? '...' : ''}"`);
            if (s.source) console.log(`  Source: ${s.source}`);
            console.log('');
        });
        console.log(`Total: ${filtered.length} snippets`);
    }

} else if (command === 'search' || command === 's') {
    const query = args.slice(1).join(' ').toLowerCase();
    if (!query) {
        console.error('Usage: snip search <query>');
        process.exit(1);
    }
    
    const snips = loadSnips();
    const results = snips.filter(s => 
        s.text.toLowerCase().includes(query) || 
        s.tags.some(t => t.includes(query))
    );
    
    if (results.length === 0) {
        console.log('No matches.');
    } else {
        results.forEach(s => {
            console.log(`[${s.id}] ${s.tags.length ? `#${s.tags.join(' #')}` : ''}`);
            console.log(`  "${s.text.substring(0, 100)}${s.text.length > 100 ? '...' : ''}"`);
            console.log('');
        });
        console.log(`Found: ${results.length} snippets`);
    }

} else if (command === 'get') {
    const id = args[1];
    if (!id) {
        console.error('Usage: snip get <id>');
        process.exit(1);
    }
    
    const snips = loadSnips();
    const snip = snips.find(s => s.id === id);
    
    if (!snip) {
        console.error('Snippet not found.');
        process.exit(1);
    }
    
    console.log(snip.text);
    console.log('');
    console.log(`Tags: ${snip.tags.length ? snip.tags.join(', ') : 'none'}`);
    if (snip.source) console.log(`Source: ${snip.source}`);
    console.log(`Created: ${snip.created}`);

} else if (command === 'rm' || command === 'delete') {
    const id = args[1];
    if (!id) {
        console.error('Usage: snip rm <id>');
        process.exit(1);
    }
    
    const snips = loadSnips();
    const idx = snips.findIndex(s => s.id === id);
    
    if (idx === -1) {
        console.error('Snippet not found.');
        process.exit(1);
    }
    
    snips.splice(idx, 1);
    saveSnips(snips);
    console.log(`Deleted: ${id}`);

} else if (command === 'tags') {
    const snips = loadSnips();
    const tagCounts = {};
    
    snips.forEach(s => {
        s.tags.forEach(t => {
            tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
    });
    
    const sorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
    
    if (sorted.length === 0) {
        console.log('No tags yet.');
    } else {
        sorted.forEach(([tag, count]) => {
            console.log(`#${tag} (${count})`);
        });
    }

} else if (command === 'export') {
    const snips = loadSnips();
    console.log(JSON.stringify(snips, null, 2));

} else {
    console.log(`claw-snip - Snippet manager

Commands:
  add "text" [--tag t1,t2] [--source url]   Save a snippet
  list [tag]                                 List snippets (optionally by tag)
  search <query>                             Search snippets
  get <id>                                   Show full snippet
  rm <id>                                    Delete snippet
  tags                                       List all tags
  export                                     Export as JSON
`);
}
