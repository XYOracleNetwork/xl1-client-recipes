import {
  describe, expect, it,
} from 'vitest'

import { ClientNetworks, getClientNetwork } from './networks.js'

describe('XL1 client networks', () => {
  it('defaults to Sequence', () => {
    expect(getClientNetwork()).toEqual(ClientNetworks.sequence)
  })

  it('contains the REST and RPC endpoints from the client recipe', () => {
    expect(ClientNetworks.mainnet.endpoint).toBe('https://mainnet.xyo.space')
    expect(ClientNetworks.mainnet.rpcUrl).toBe('https://api.chain.xyo.network/rpc')
    expect(ClientNetworks.sequence.endpoint).toBe('https://sequence.xyo.space')
    expect(ClientNetworks.sequence.rpcUrl).toBe('https://beta.api.chain.xyo.network/rpc')
  })

  it('rejects unknown networks', () => {
    expect(() => getClientNetwork('production')).toThrow()
  })
})
