import 'dotenv/config'

import { parseArgs } from 'node:util'

import {
  formatXl1, parseAttoXl1, parseXl1,
} from './amount.js'
import { readAccountBalance } from './balance.js'
import { createGatewayRunner, createReadOnlyGateway } from './gateway.js'
import {
  ClientNetworks, getClientNetwork, resolveNetworkId,
} from './networks.js'
import { sendXl1 } from './transfer.js'
import { createWalletAccount, requireSeedPhrase } from './wallet.js'

const USAGE = `XL1 client recipes

Usage:
  pnpm wallet [--account 0]
  pnpm head [--network sequence|mainnet]
  pnpm balance [--address <address>] [--account 0] [--network sequence|mainnet]
  pnpm send --to <address> (--amount <XL1> | --atto <atto>) [--no-confirm]
            [--account 0] [--network sequence|mainnet] [--allow-mainnet]
  pnpm networks

Environment:
  XL1_SEED_PHRASE   Required for wallet and send; required for balance without --address
  XL1_ACCOUNT_INDEX Optional account index, default 0
  XL1_NETWORK       Optional network, default sequence
`

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    'account': { type: 'string' },
    'allow-mainnet': { type: 'boolean' },
    'amount': { type: 'string' },
    'atto': { type: 'string' },
    'address': { type: 'string' },
    'help': { short: 'h', type: 'boolean' },
    'network': { type: 'string' },
    'no-confirm': { type: 'boolean' },
    'to': { type: 'string' },
  },
  strict: true,
})

function writeLine(value: string): void {
  process.stdout.write(`${value}\n`)
}

function selectedNetwork() {
  return resolveNetworkId(values.network)
}

function selectedAccountIndex(): string {
  return values.account ?? process.env.XL1_ACCOUNT_INDEX ?? '0'
}

async function walletCommand(): Promise<void> {
  const account = await createWalletAccount(requireSeedPhrase(), selectedAccountIndex())
  writeLine(`Address: ${account.address}`)
}

async function headCommand(): Promise<void> {
  const networkId = selectedNetwork()
  const gateway = await createReadOnlyGateway(networkId)
  const viewer = gateway.connection.viewer
  if (!viewer) throw new Error('The gateway did not provide a chain viewer')
  const blockNumber = await viewer.currentBlockNumber()
  writeLine(`${getClientNetwork(networkId).id} head: ${blockNumber}`)
}

async function balanceCommand(): Promise<void> {
  const networkId = selectedNetwork()
  const address = values.address ?? (await createWalletAccount(requireSeedPhrase(), selectedAccountIndex())).address
  const gateway = await createReadOnlyGateway(networkId)
  const balance = await readAccountBalance(gateway, address)
  writeLine(`Address: ${address}`)
  writeLine(`Balance: ${formatXl1(balance)} XL1 (${balance} atto)`)
}

function sendAmount() {
  if (values.amount && values.atto) throw new Error('Use either --amount or --atto, not both')
  if (values.amount) return parseXl1(values.amount)
  if (values.atto) return parseAttoXl1(values.atto)
  throw new Error('send requires --amount <XL1> or --atto <atto>')
}

async function sendCommand(): Promise<void> {
  const networkId = selectedNetwork()
  if (networkId === 'mainnet' && !values['allow-mainnet']) {
    throw new Error('Mainnet sends require the explicit --allow-mainnet flag')
  }
  if (!values.to) throw new Error('send requires --to <address>')

  const { account, runner } = await createGatewayRunner({
    accountIndex: selectedAccountIndex(),
    networkId,
    seedPhrase: requireSeedPhrase(),
  })
  const amount = sendAmount()
  const transactionHash = await sendXl1({
    amount,
    confirm: !values['no-confirm'],
    recipient: values.to,
    runner,
  })

  writeLine(`From: ${account.address}`)
  writeLine(`Transaction: ${transactionHash}`)
  writeLine(`Explorer: ${getClientNetwork(networkId).explorerUrl}`)
}

function networksCommand(): void {
  for (const network of Object.values(ClientNetworks)) {
    writeLine(`${network.id}:`)
    writeLine(`  REST: ${network.endpoint}`)
    writeLine(`  RPC: ${network.rpcUrl}`)
    writeLine(`  Data lake: ${network.dataLakeUrl}`)
    writeLine(`  Explorer: ${network.explorerUrl}`)
  }
}

async function main(): Promise<void> {
  const command = positionals[0]
  if (values.help || !command) {
    writeLine(USAGE)
    return
  }

  switch (command) {
    case 'balance':
      await balanceCommand()
      break
    case 'head':
      await headCommand()
      break
    case 'networks':
      networksCommand()
      break
    case 'send':
      await sendCommand()
      break
    case 'wallet':
      await walletCommand()
      break
    default: throw new Error(`Unknown command "${command}"\n\n${USAGE}`)
  }
}

try {
  await main()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`Error: ${message}\n`)
  process.exitCode = 1
}
