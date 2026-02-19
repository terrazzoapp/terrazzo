import { CachedWildcardMatcher } from '@terrazzo/token-tools';

/**
 * Share one cached matcher factory for all lint plugins.
 *
 * Creating matchers is CPU-intensive, however, if we made one matcher for very
 * getTransform plugin query, we could end up with tens of thousands of
 * matchers, all taking up space in memory, but without providing any caching
 * benefits if a matcher is used only once. So a reasonable balance is we
 * maintain one cache per task category, and we garbage-collect everything after
 * it’s done. Lint tasks are likely to have frequently-occurring patterns. So
 * we’d expect for most use cases a shared lint cache has benefits, but only
 * so long as this doesn’t spread to other plugins and other task categories.
 */
export const cachedLintMatcher = new CachedWildcardMatcher();
