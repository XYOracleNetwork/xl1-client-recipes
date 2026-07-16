import 'dotenv/config'

import { z } from 'zod'

export const NetworkIdZod = z.enum(['mainnet', 'sequence'])
export type NetworkId = z.infer<typeof NetworkIdZod>

export const ClientNetworkZod = z.object({
  dataLakeUrl: z.url(),
  endpoint: z.url(),
  explorerUrl: z.url(),
  id: NetworkIdZod,
  rpcUrl: z.url(),
})
export type ClientNetwork = z.infer<typeof ClientNetworkZod>

export const ClientNetworks: Readonly<Record<NetworkId, ClientNetwork>> = {
  mainnet: ClientNetworkZod.parse({
    dataLakeUrl: 'https://api.archivist.xyo.network/dataLake',
    endpoint: 'https://mainnet.xyo.space',
    explorerUrl: 'https://explore.xyo.network',
    id: 'mainnet',
    rpcUrl: 'https://api.chain.xyo.network/rpc',
  }),
  sequence: ClientNetworkZod.parse({
    dataLakeUrl: 'https://beta.api.archivist.xyo.network/dataLake',
    endpoint: 'https://sequence.xyo.space',
    explorerUrl: 'https://beta.explore.xyo.network',
    id: 'sequence',
    rpcUrl: 'https://beta.api.chain.xyo.network/rpc',
  }),
}

export function resolveNetworkId(
  value?: unknown,
  environment: NodeJS.ProcessEnv = process.env,
): NetworkId {
  return NetworkIdZod.parse(value ?? environment.XL1_NETWORK ?? 'sequence')
}

export function getClientNetwork(
  value?: unknown,
  environment: NodeJS.ProcessEnv = process.env,
): ClientNetwork {
  return ClientNetworks[resolveNetworkId(value, environment)]
}
