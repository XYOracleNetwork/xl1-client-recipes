import { LogLevel } from '@ariestools/sdk'
import {
  describe, expect, it,
} from 'vitest'

import { errorLogger } from '../logger.js'

describe('client logger', () => {
  it('only emits error-level messages', () => {
    expect(errorLogger.level).toBe(LogLevel.error)
  })
})
