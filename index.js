#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const WORKSPACE = path.resolve(__dirname, '../../');
const DEFAULT_SNIPS_FILE = path.join(WORKSPACE, 'snippets.json');

const args = process.argv.slice(2);

// Extract --file/-f flag from args (can appear anywhere)
let snipsFile = DEFAULT_SNIPS_FILE;
const filteredArgs = [];
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' || args[i] === '-f') {
        snipsFile = args[++i];
        if (snipsFile && !path.isAbsolute(snipsFile)) {
            snipsFile = path.resolve(process.cwd(), snipsFile);
        }
    } else {
        filteredArgs.push(args[i]);
    }
}

const command = filteredArgs[0];

function loadSnips() {
    if (!fs.existsSync(snipsFile)) return [];
    return JSON.parse(fs.readFileSync(snipsFile, 'utf-8'));
}

function saveSnips(snips) {
    // Create directory if it doesn't exist
    const dir = path.dirname(snipsFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(snipsFile, JSON.stringify(snips, null, 2));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

if (command === 'add') {
    // snip add "text" [--tag tag1,tag2] [--source url]
    const text = filteredArgs[1];
    if (!text) {
        console.error('Usage: snip add "text" [--tag tags] [--source url]');
        process.exit(1);
    }

    let tags = [];
    let source = '';
    
    for (let i = 2; i < filteredArgs.length; i++) {
        if (filteredArgs[i] === '--tag' || filteredArgs[i] === '-t') {
            tags = filteredArgs[++i]?.split(',').map(t => t.trim().toLowerCase()) || [];
        } else if (filteredArgs[i] === '--source' || filteredArgs[i] === '-s') {
            source = filteredArgs[++i] || '';
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
    const tagFilter = filteredArgs[1];
    
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
    const query = filteredArgs.slice(1).join(' ').toLowerCase();
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
    const id = filteredArgs[1];
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
    const id = filteredArgs[1];
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

Options:
  --file, -f <path>   Use custom snippets file (default: workspace/snippets.json)

Examples:
  snip add "code snippet" --tag js,util
  snip list --file ~/work-snippets.json
  snip search function -f ./project.json
`);
}
