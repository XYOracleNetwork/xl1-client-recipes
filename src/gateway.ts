import {
  buildSimpleXyoSigner,
  ConfigZod,
  getRestGateway,
  getRestGatewayRunner,
  restGatewayConfigFromEndpoint,
} from '@xyo-network/xl1-sdk'

import { errorLogger } from './logger.js'
import { getClientNetwork, type NetworkId } from './networks.js'
import { createWalletAccount } from './wallet.js'

export interface CreateRunnerOptions {
  accountIndex?: string
  networkId?: NetworkId
  seedPhrase: string
}

export async function createReadOnlyGateway(networkId?: NetworkId) {
  const network = getClientNetwork(networkId)
  return await getRestGateway({
    ...restGatewayConfigFromEndpoint(network.endpoint),
    dataLakeEndpoint: network.dataLakeUrl,
    initRewardsCache: false,
    logger: errorLogger,
    name: `xl1-client-recipes-${network.id}`,
  })
}

export async function createGatewayRunner({
  accountIndex = '0',
  networkId,
  seedPhrase,
}: CreateRunnerOptions) {
  const network = getClientNetwork(networkId)
  const account = await createWalletAccount(seedPhrase, accountIndex)
  const signer = await buildSimpleXyoSigner(
    {
      caches: {}, config: ConfigZod.parse({ log: { logLevel: 'error' } }), logger: errorLogger, singletons: {},
    },
    account,
  )

  const runner = await getRestGatewayRunner({
    dataLakeEndpoint: network.dataLakeUrl,
    endpoint: network.endpoint,
    initRewardsCache: false,
    logger: errorLogger,
    name: `xl1-client-recipes-${network.id}`,
    rpcUrl: network.rpcUrl,
    signer,
  })

  return { account, runner }
}
