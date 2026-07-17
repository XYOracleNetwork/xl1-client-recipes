import {
  describe, expect, it,
} from 'vitest'

import {
  formatXl1, parseAttoXl1, parseXl1,
} from '../amount.js'

describe('XL1 amount conversion', () => {
  it('converts whole and fractional XL1 without floating-point loss', () => {
    expect(parseXl1('1')).toBe(1_000_000_000_000_000_000n)
    expect(parseXl1('0.1')).toBe(100_000_000_000_000_000n)
    expect(parseXl1('1.000000000000000001')).toBe(1_000_000_000_000_000_001n)
  })

  it('rejects negative values and fractions smaller than one atto', () => {
    expect(() => parseXl1('-1')).toThrow('Invalid XL1 amount')
    expect(() => parseXl1('0.0000000000000000001')).toThrow('Invalid XL1 amount')
  })

  it('accepts integer atto amounts and formats them for display', () => {
    const amount = parseAttoXl1('100000000000000000')

    expect(amount).toBe(100_000_000_000_000_000n)
    expect(formatXl1(amount)).toBe('0.1')
  })
})
