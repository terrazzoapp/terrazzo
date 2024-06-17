import { afterEach } from 'vitest';

// RTL
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

// @see https://github.com/vitest-dev/vitest/issues/1430
afterEach(cleanup);
