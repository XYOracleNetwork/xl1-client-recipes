import type { AttoXL1 } from '@xyo-network/xl1-sdk'
import { asAttoXL1, XL1Amount } from '@xyo-network/xl1-sdk'

const ATTO_PER_XL1 = 1_000_000_000_000_000_000n
const XL1_DECIMAL_PATTERN = /^(?:0|[1-9]\d*)(?:\.(\d{1,18}))?$/

export function parseAttoXl1(value: string): AttoXL1 {
  if (!/^(?:0|[1-9]\d*)$/.test(value)) {
    throw new Error(`Invalid atto-XL1 amount "${value}"; expected a non-negative integer`)
  }
  return asAttoXL1(BigInt(value))
}

export function parseXl1(value: string): AttoXL1 {
  const match = XL1_DECIMAL_PATTERN.exec(value)
  if (!match) {
    throw new Error(`Invalid XL1 amount "${value}"; use at most 18 decimal places`)
  }

  const [whole = '0'] = value.split('.')
  const fractional = (match[1] ?? '').padEnd(18, '0')
  return asAttoXL1(BigInt(whole) * ATTO_PER_XL1 + BigInt(fractional || '0'))
}

export function formatXl1(value: AttoXL1): string {
  return new XL1Amount(value).toString(18)
}
