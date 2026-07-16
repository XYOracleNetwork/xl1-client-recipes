import { toAddress } from '@ariestools/sdk'
import type { AttoXL1, XyoGatewayRunner } from '@xyo-network/xl1-sdk'
import { transferXl1 } from '@xyo-network/xl1-sdk'

export interface SendXl1Options {
  amount: AttoXL1
  attempts?: number
  confirm?: boolean
  delay?: number
  recipient: string
  runner: XyoGatewayRunner
}

export async function sendXl1({
  amount,
  attempts = 30,
  confirm = true,
  delay = 10_000,
  recipient,
  runner,
}: SendXl1Options) {
  const transactionHash = await transferXl1(runner, toAddress(recipient), amount)
  if (confirm) {
    await runner.confirmSubmittedTransaction(transactionHash, { attempts, delay })
  }
  return transactionHash
}
