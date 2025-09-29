# Terrazzo Copilot Instructions

## Project Overview

Terrazzo is a DTCG (Design Tokens Community Group) token processor monorepo. It transforms W3C design tokens into platform-specific code via a plugin system. The project was formerly "Cobalt UI" and uses pnpm workspaces with Turbo for builds.

**DTCG Token Format**: Follows the latest W3C DTCG specification (September 2025):
- Tokens use `$value`, `$type`, `$description` properties with `$` prefix
- Aliases use `{group.token}` syntax for references
- Composite types include `shadow`, `border`, `typography`, `gradient`
- Color tokens use `colorSpace`, `components`, optional `alpha` properties
- Dimension tokens use `{value, unit}` objects with `px`/`rem` units

**Core Architecture:**
- `@terrazzo/cli` - CLI entry point (`tz` command)
- `@terrazzo/parser` - Core token parsing, validation, and plugin orchestration
- `@terrazzo/token-tools` - Token utilities and type definitions
- `packages/plugin-*` - Code generation plugins (CSS, Sass, JS, Swift, etc.)

## Essential Patterns

### Plugin Architecture
Plugins implement the `Plugin` interface with lifecycle hooks:
```typescript
export default function myPlugin(options?: PluginOptions): Plugin {
  return {
    name: '@terrazzo/plugin-my-plugin',
    async transform({ tokens, getTransforms, setTransform }) {
      // Transform tokens into target format
    },
    build({ outputFile, getTransforms }) {
      // Generate output files
    }
  };
}
```

**Key Plugin Hooks:**
- `config()` - Modify configuration during initialization
- `transform()` - Transform token values (called once per plugin)
- `build()` - Generate output files using transformed values
- `buildEnd()` - Post-processing after all plugins run

### Token Processing Flow
1. **Parse** - Load tokens from JSON/YAML via `@terrazzo/parser`
2. **Transform** - Plugins convert tokens to target formats via `setTransform()`
3. **Build** - Plugins query transforms via `getTransforms()` and generate files
4. **Output** - Write files to `outDir` via `outputFile()`

### Configuration System
Use `defineConfig()` from `@terrazzo/cli` (wraps `@terrazzo/parser` with Node.js resolution):
```typescript
import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';

export default defineConfig({
  tokens: ['./tokens.json'],
  outDir: './dist',
  plugins: [css({ filename: 'styles.css' })]
});
```

## Development Workflows

### Building
- `pnpm build` - Build all packages (uses Turbo)
- `pnpm test` - Run all tests
- **Avoid `pnpm dev`** - File watch can be buggy

### Package Dependencies
Packages use workspace dependencies (`workspace:^`). Build order matters - `@terrazzo/token-tools` → `@terrazzo/parser` → plugins → CLI.

### Testing Patterns
- **Snapshot Testing**: Use `toMatchFileSnapshot()` for generated output
- **Fixture-based**: Test data in `test/fixtures/` directories
- **Integration Tests**: Full token → output pipeline testing

Example test structure:
```typescript
const config = defineConfig({ plugins: [myPlugin()] }, { cwd });
const { tokens, sources } = await parse([tokenFile], { config });
const result = await build(tokens, { sources, config });
expect(result.outputFiles[0]?.contents).toMatchFileSnapshot('./want.css');
```

## Critical Conventions

### Token Transformation
- Use `TokenNormalized` type for processed tokens
- Transform values via `transformCSSValue()`, `transformJSValue()` etc. from `@terrazzo/token-tools`
- Handle aliases via `transformAlias()` functions
- Support mode-specific values through `token.mode[modeName]`

### File Generation
- Always use `outputFile(filename, contents)` in build hooks
- Relative paths resolve to `config.outDir`
- Use `Buffer` for binary content, `string` for text

### Error Handling
- Use provided `logger` for consistent output
- Plugin errors should be descriptive with context
- Validate user options in plugin constructors

### Import/Export Patterns
- Use `.js` extensions in TypeScript imports (`./file.js`)
- Export plugin as default function
- Re-export types and utilities for plugin consumers

## Linting & Code Style

- **Biome** for formatting and linting (not Prettier/ESLint)
- 2-space indentation, 120 character lines
- Single quotes for JS, no trailing commas
- `useImportExtensions: error` - always use `.js` extensions
- `noConsole: error` - use logger instead of console

## Key Files to Reference

- `packages/parser/src/types.ts` - Core interfaces and Plugin type
- `packages/token-tools/src/` - Token utilities and transformers
- `packages/plugin-css/` - Reference plugin implementation
- `packages/cli/src/build.ts` - Build orchestration logic
- Test fixtures across plugin packages for real-world examples