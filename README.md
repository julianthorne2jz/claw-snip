# claw-snip

Simple snippet/quote manager. Save text with tags, search later.

## Usage

```bash
# Add a snippet
node index.js add "The quote text" --tag wisdom,quotes --source "Author"

# List all (or by tag)
node index.js list
node index.js list wisdom

# Search
node index.js search "keyword"

# Get full snippet
node index.js get <id>

# Delete
node index.js rm <id>

# List all tags
node index.js tags

# Export JSON
node index.js export
```

## Storage

Snippets are saved to `snippets.json` in your workspace root.

## License

MIT
