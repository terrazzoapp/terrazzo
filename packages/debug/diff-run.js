import { diffListings } from '@terrazzo/token-diff';

import old from './old.listing.json' with { type: 'json' };
import current from './tokens/terrazzo.listing.json' with { type: 'json' };

const delta = diffListings(old, current, { flat: true, platforms: ['css'] });
const removed = delta.data.filter((entry) => entry.changeType === 'removed');
const added = delta.data.filter((entry) => entry.changeType === 'added');
const modified = delta.data.filter((entry) => entry.changeType === 'modified');

console.log('Removed:', removed.length);
console.log('Added:', added.length);
console.log('Modified:', modified.length);

// console.log(removed[0]);
console.log(modified[0]);
console.log(JSON.stringify(modified[0], null, 2));
