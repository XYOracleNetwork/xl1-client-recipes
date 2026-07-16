import { toAddress } from '@ariestools/sdk'
import type { XyoGateway, XyoGatewayRunner } from '@xyo-network/xl1-sdk'
import { getAccountBalance } from '@xyo-network/xl1-sdk'

export async function readAccountBalance(
  gateway: XyoGateway | XyoGatewayRunner,
  address: string,
) {
  return await getAccountBalance(gateway, toAddress(address))
}
