import {
  describe, expect, it,
} from 'vitest'

import {
  createDefaultWallet, createWalletAccount, requireSeedPhrase,
} from '../wallet.js'

const TEST_SEED_PHRASE = 'test test test test test test test test test test test junk'

describe('XL1 wallet recipes', () => {
  it('derives the same default address through both documented wallet paths', async () => {
    const directWallet = await createDefaultWallet(TEST_SEED_PHRASE)
    const standardAccount = await createWalletAccount(TEST_SEED_PHRASE)

    expect(directWallet.address).toBe('f39fd6e51aad88f6f4ce6ab8827279cfffb92266')
    expect(standardAccount.address).toBe(directWallet.address)
  })

  it('derives a distinct deterministic account by index', async () => {
    const first = await createWalletAccount(TEST_SEED_PHRASE, '0')
    const second = await createWalletAccount(TEST_SEED_PHRASE, '1')

    expect(second.address).not.toBe(first.address)
    expect((await createWalletAccount(TEST_SEED_PHRASE, '1')).address).toBe(second.address)
  })

  it('fails closed when no seed phrase is configured', () => {
    expect(() => requireSeedPhrase({})).toThrow('XL1_SEED_PHRASE is required')
  })
})
