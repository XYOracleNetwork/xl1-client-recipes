/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Integration reproduction for XL1 SDK init loop.
 *
 * Repeatedly initializes the REST gateway to surface transient
 * "Failed to start provider instance [AccountBalanceViewer]" errors.
 *
 * Default mode clears globalThis.xyoServiceSingletons before each attempt
 * (the fix applied in rpc-helper.ts). Without that reset, a single failed
 * init can poison the singleton cache so every later attempt fails too.
 */

import {
  AbstractCreatableProvider,
  getRestGateway,
  restGatewayConfigFromEndpoint,
} from '@xyo-network/xl1-sdk'
import {
  afterEach, describe, expect, it,
} from 'vitest'

const DEFAULT_NODE_URL = 'https://mainnet.xyo.space/'
const DEFAULT_ITERATIONS = 5
const TEST_TIMEOUT_MS = 120_000

interface InitSuccess {
  elapsed: number
  ok: true
}

interface InitFailure {
  elapsed: number
  error: string
  ok: false
}

type InitResult = InitFailure | InitSuccess

/** Last underlying error from SDK provider start failures (often swallowed). */
let lastSdkStartError: string | undefined
let patched = false

/**
 * Monkey-patch the SDK creatable prototype chain so swallowed internal
 * provider start errors are visible in failure messages.
 */
function patchToCaptureErrors() {
  if (patched) {
    return
  }
  patched = true

  let proto = AbstractCreatableProvider.prototype as any
  for (let i = 0; i < 10 && proto; i++) {
    const setStatusDesc = Object.getOwnPropertyDescriptor(proto, 'setStatus')
    if (setStatusDesc?.value) {
      const origSetStatus = setStatusDesc.value
      setStatusDesc.value = function (
        this: any,
        value: string,
        progressOrError: unknown,
      ) {
        if (value === 'error' && progressOrError instanceof Error) {
          lastSdkStartError = `[${this.constructor?.name}] ${progressOrError.message}`
        }
        return origSetStatus.call(this, value, progressOrError)
      }
      Object.defineProperty(proto, 'setStatus', setStatusDesc)
    }
    proto = Object.getPrototypeOf(proto)
  }
}

function clearXyoServiceSingletons() {
  delete (globalThis as Record<string, unknown>).xyoServiceSingletons
}

async function initSdk(nodeUrl: string): Promise<InitResult> {
  lastSdkStartError = undefined
  const start = Date.now()
  try {
    patchToCaptureErrors()

    await getRestGateway({
      ...restGatewayConfigFromEndpoint(nodeUrl),
      initRewardsCache: false,
    })

    return { elapsed: Date.now() - start, ok: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      elapsed: Date.now() - start,
      error: lastSdkStartError
        ? `${message} (internal: ${lastSdkStartError})`
        : message,
      ok: false,
    }
  }
}

describe('XL1 SDK init loop', () => {
  const nodeUrl = process.env.XL1_NODE_URL ?? DEFAULT_NODE_URL
  const iterations = Number(process.env.XL1_INIT_LOOP_ITERATIONS ?? DEFAULT_ITERATIONS)

  afterEach(() => {
    clearXyoServiceSingletons()
    lastSdkStartError = undefined
  })

  it(
    'initializes getRestGateway successfully across repeated attempts when singletons are reset',
    async () => {
      const failures: string[] = []

      for (let i = 0; i < iterations; i++) {
        // Clear cached singleton providers before each attempt (rpc-helper fix).
        clearXyoServiceSingletons()

        const result = await initSdk(nodeUrl)
        if (!result.ok) {
          failures.push(`[${i + 1}/${iterations}] ${result.error} (${result.elapsed}ms)`)
        }
      }

      expect(failures, failures.join('\n')).toEqual([])
    },
    TEST_TIMEOUT_MS,
  )
})
