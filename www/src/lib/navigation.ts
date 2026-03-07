export function getAriaCurrent(
  testPathname: string,
  currentPathname: string | URL,
): { 'aria-current'?: boolean | 'page' | 'location' } {
  const currentLocation = new URL(currentPathname);
  if (currentLocation.pathname.replace(/\/?$/, '/') === testPathname.replace(/\/?$/, '/')) {
    return { 'aria-current': 'page' };
  }
  if (testPathname !== '/' && currentLocation.pathname.startsWith(testPathname)) {
    return { 'aria-current': 'location' };
  }
  return {};
}
