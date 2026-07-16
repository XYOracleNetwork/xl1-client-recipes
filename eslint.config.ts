import { recommendedConfig } from '@ariestools/eslint-config-flat'
import type { Linter } from 'eslint'

const config: Linter.Config[] = [
  { ignores: ['coverage/**', 'dist/**', 'node_modules/**'] },
  ...recommendedConfig({ tier: 2, isTypeChecked: false }),
]

export default config
