import {
  describe, expect, it,
} from 'vitest'

import {
  ClientNetworks, getClientNetwork, resolveNetworkId,
} from './networks.js'

describe('XL1 client networks', () => {
  it('defaults to Sequence when the environment does not select a network', () => {
    expect(getClientNetwork(undefined, {})).toEqual(ClientNetworks.sequence)
  })

  it('uses XL1_NETWORK when no explicit network is supplied', () => {
    const environment = { XL1_NETWORK: 'mainnet' }

    expect(resolveNetworkId(undefined, environment)).toBe('mainnet')
    expect(getClientNetwork(undefined, environment)).toEqual(ClientNetworks.mainnet)
  })

  it('gives an explicit network precedence over XL1_NETWORK', () => {
    expect(resolveNetworkId('sequence', { XL1_NETWORK: 'mainnet' })).toBe('sequence')
  })

  it('contains the REST and RPC endpoints from the client recipe', () => {
    expect(ClientNetworks.mainnet.endpoint).toBe('https://mainnet.xyo.space')
    expect(ClientNetworks.mainnet.rpcUrl).toBe('https://api.chain.xyo.network/rpc')
    expect(ClientNetworks.sequence.endpoint).toBe('https://sequence.xyo.space')
    expect(ClientNetworks.sequence.rpcUrl).toBe('https://beta.api.chain.xyo.network/rpc')
  })

  it('rejects unknown networks', () => {
    expect(() => getClientNetwork('production', {})).toThrow()
  })
})
