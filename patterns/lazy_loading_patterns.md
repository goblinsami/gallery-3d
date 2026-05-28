# Pattern: Lazy Loading

## Use
- Large optional features (adapters, diagnostics, heavy UI modules).

## Recommended Structure
- split by responsibility (runtime core vs adapters)
- defer non-critical modules until interaction/route trigger
- keep runtime bootstrap minimal (`packages/runtime/src/index.ts`)
- load external runtime script once, cache in map (as done in Framer hook)

## Anti-Patterns
- eager import of optional integration code
- multiple script insertions for same runtime URL
- blocking initial render on non-critical resources
