# claw-snip

## Install

```bash
git clone https://github.com/julianthorne2jz/claw-snip
cd claw-snip
npm link
```

Now you can use `claw-snip` from anywhere.


Simple snippet/quote manager. Save text with tags, search later.

## Usage

```bash
# Add a snippet
claw-snip add "The quote text" --tag wisdom,quotes --source "Author"

# List all (or by tag)
claw-snip list
claw-snip list wisdom

# Search
claw-snip search "keyword"

# Get full snippet
claw-snip get <id>

# Delete
claw-snip rm <id>

# List all tags
claw-snip tags

# Export JSON
claw-snip export
```

## Storage

Snippets are saved to `snippets.json` in your workspace root.

## License

MIT
