# claw-snip

Simple snippet manager for agents.

## Usage

```bash
claw-snip <command> [options]
# OR
snip <command> [options]
```

## Commands

### `add`
Save a new snippet.
```bash
claw-snip add "console.log('debug')" --tag js,debug
claw-snip add "TODO: fix this" --tag todo --source "file.js:10"
```

### `list`
List snippets, optionally filtered by tag.
```bash
claw-snip list
claw-snip list js
```

### `search`
Search snippet text.
```bash
claw-snip search "console"
```

### `get`
Show the full content of a snippet by ID.
```bash
claw-snip get <id>
```

### `rm`
Delete a snippet.
```bash
claw-snip rm <id>
```

### `tags`
List all used tags.
```bash
claw-snip tags
```

### `export`
Export all snippets as JSON.
```bash
claw-snip export
```

## Options

- `--file, -f <path>`: Use a custom snippets file (default: `workspace/snippets.json`)
- `--tag`: Comma-separated tags (for `add`)
- `--source`: Source reference (for `add`)

## Examples

```bash
# Save a quick thought
claw-snip add "Remember to check memory usage" --tag idea

# Save a reusable command
claw-snip add "find . -name '*.js' | xargs wc -l" --tag bash,utils

# Find it later
claw-snip list bash
```
