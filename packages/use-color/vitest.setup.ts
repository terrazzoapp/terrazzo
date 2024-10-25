import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// @see https://github.com/vitest-dev/vitest/issues/1430
afterEach(cleanup);
