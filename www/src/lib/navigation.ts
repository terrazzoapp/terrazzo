export function getAriaCurrent(testPathname: string, currentPathname: string | URL): 'page' | 'location' | undefined {
  const currentLocation = new URL(currentPathname);
  if (currentLocation.pathname === testPathname) {
    return 'page';
  }
  if (testPathname !== '/' && currentLocation.pathname.startsWith(testPathname)) {
    return 'location';
  }
  return undefined;
}
