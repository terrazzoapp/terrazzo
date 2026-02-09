import { CachedWildcardMatcher } from '@terrazzo/token-tools';

/**
 * Share one cached matcher factory for all lint plugins.
 *
 * The tricky part here is creating new wildcard matchers is expensive, so we
 * want to reuse as much as possible.  However, think about all the different
 * contexts a user may need wildcard matchers across all plugins and contexts.
 * We don’t want to end up with a memory leak, potentially keeping around
 * thousands upon thousands of these things needlessly.
 *
 * A happy medium is keeping a cached wildcard matcher, but limiting its scope
 * among common codepaths. Keeping one linter cache like this yields the
 * performance benefits we want, without being a memory concern because within
 * all the linter rules this likely won’t have hundreds upon hundreds of
 * programmatically-generated instances. It will only have as many instances as
 * the user has lint rules, give or take. For other things like plugins, we want
 * to have the cache be garbage-collected more regularly, etc.
 */
export const cachedLintMatcher = new CachedWildcardMatcher();
