import { recommendedConfig } from '@ariestools/eslint-config-flat'
import type { Linter } from 'eslint'

const config: Linter.Config[] = [
  { ignores: ['.xy/**', 'coverage/**', 'dist/**', 'node_modules/**'] },
  ...recommendedConfig({ tier: 2, isTypeChecked: false }),
  {
    files: ['.agents/**/*.md', '.claude/**/*.md'],
    rules: {
      // Installed skill checklists use GitHub task-list syntax that this rule misparses as empty label references.
      'markdown/no-missing-label-refs': 'off',
    },
  },
]

export default config
