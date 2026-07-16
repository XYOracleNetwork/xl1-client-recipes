import { HDWallet } from '@xyo-network/sdk'
import { generateXyoBaseWalletFromPhrase } from '@xyo-network/xl1-sdk'

const AccountIndexZodPattern = /^(?:0|[1-9]\d*)$/

export function requireSeedPhrase(environment: NodeJS.ProcessEnv = process.env): string {
  const phrase = environment.XL1_SEED_PHRASE?.trim()
  if (!phrase) {
    throw new Error('XL1_SEED_PHRASE is required; copy .env.example to .env and set it')
  }
  return phrase
}

/** Implements the recipe's direct HDWallet.fromPhrase example. */
export async function createDefaultWallet(seedPhrase: string) {
  return await HDWallet.fromPhrase(seedPhrase)
}

/**
 * Derives a standard XL1 account by index. The base helper pins the BIP-44 path
 * shared by XL1, the XYO browser wallet, and MetaMask.
 */
export async function createWalletAccount(seedPhrase: string, accountIndex = '0') {
  if (!AccountIndexZodPattern.test(accountIndex)) {
    throw new Error(`Invalid account index "${accountIndex}"; expected a non-negative integer`)
  }
  const baseWallet = await generateXyoBaseWalletFromPhrase(seedPhrase)
  return await baseWallet.derivePath(accountIndex)
}
