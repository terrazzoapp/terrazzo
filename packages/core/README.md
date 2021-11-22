# 💎 Cobalt UI

Schemas and tools for managing design tokens

## Getting Started

```
npm install @cobalt-ui/cli
```

Create a `tokens.yaml` file with your tokens (docs)

Add to `package.json`:

```
"scripts": {
  "tokens:build": "cobalt build",
  "tokens:validate": "cobalt validate tokens.yaml"
}
```

### Building

```
npm run tokens:build
```

### Validating

```
npm run tokens:validate
```
