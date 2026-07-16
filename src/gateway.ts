import {
  basicRestRunnerLocator,
  basicRestViewerLocator,
  buildSimpleXyoSigner,
  ConfigZod,
  resolveFinalizedAlias,
  restConnectionFromS3Bucket,
  restGatewayConfigFromEndpoint,
  type XyoGateway,
  XyoGatewayMoniker,
  type XyoGatewayRunner,
  XyoGatewayRunnerMoniker,
  XyoSignerWrapper,
} from '@xyo-network/xl1-sdk'

import { errorLogger } from './logger.js'
import { getClientNetwork, type NetworkId } from './networks.js'
import { createWalletAccount } from './wallet.js'

export interface CreateRunnerOptions {
  accountIndex?: string
  networkId?: NetworkId
  seedPhrase: string
}

function restRemoteConfig(endpoint: string) {
  const buckets = restGatewayConfigFromEndpoint(endpoint)
  return {
    chainState: buckets.chainState ? restConnectionFromS3Bucket(buckets.chainState) : undefined,
    finalized: restConnectionFromS3Bucket(resolveFinalizedAlias(buckets, 'xl1-client-recipes')),
    index: buckets.index ? restConnectionFromS3Bucket(buckets.index) : undefined,
  }
}

export async function createReadOnlyGateway(networkId: NetworkId = 'sequence') {
  const network = getClientNetwork(networkId)
  const locator = await basicRestViewerLocator(
    `xl1-client-recipes-${network.id}`,
    restRemoteConfig(network.endpoint),
    network.dataLakeUrl,
    { initRewardsCache: false },
  )
  locator.context.logger = errorLogger
  return await locator.getInstance<XyoGateway>(XyoGatewayMoniker)
}

export async function createGatewayRunner({
  accountIndex = '0',
  networkId = 'sequence',
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

  const locator = await basicRestRunnerLocator(
    `xl1-client-recipes-${network.id}`,
    restRemoteConfig(network.endpoint),
    network.dataLakeUrl,
    {
      initRewardsCache: false,
      rpcUrl: network.rpcUrl,
      signerFactory: XyoSignerWrapper.factory<XyoSignerWrapper>(XyoSignerWrapper.dependencies, { signer }),
    },
  )
  locator.context.logger = errorLogger
  const runner = await locator.getInstance<XyoGatewayRunner>(XyoGatewayRunnerMoniker)

  return { account, runner }
}
