---
"@terrazzo/cli": minor
---

Drop vite-node for loading terrazzo.config.ts. Loading of .ts configs is still supported in older versions of Node. If your version of Node.js supports .ts execution, it will now run natively for a speedup. If not, it will fall back to tsx. This is not considered a breaking change, because influencing Terrazzo's behavior based on a vite config was never a supported API (in fact the opposite—most folks expect Terrazzo to operate independently of Vite)
