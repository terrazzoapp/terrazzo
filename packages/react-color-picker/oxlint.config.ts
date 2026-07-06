import { defineConfig } from 'oxlint'

import base from '../../oxlint.config.ts'

export default defineConfig ({
  extends: [base],
  rules: {
    'unicorn/filename-case': 'off',
  },
})
