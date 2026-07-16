# XL1 Client Recipes

Runnable Node.js implementations of the XL1 wallet, gateway, balance, transfer,
and network recipes from
[`xyo-chain/recipes/xl1-client-recipes.md`](../xyo-chain/recipes/xl1-client-recipes.md).

The project uses `@xyo-network/xl1-sdk` for every chain operation:

- static REST/S3 readers for balances and chain state;
- the XL1 gateway runner for signed transaction submission;
- local signing through an HD wallet;
- no hand-written JSON-RPC calls and no Ethereum chain client.

SDK logging is set to `error`, so REST gateway initialization does not emit
informational messages or time-budget warnings.

## Requirements

- Node.js 24 or newer
- pnpm 11

## Setup

```sh
pnpm install
cp .env.example .env
```

Set `XL1_SEED_PHRASE` in `.env` only when you need wallet-derived commands.
The seed phrase is never printed, and `.env` is ignored by Git.

Sequence is the default network. It uses test XL1, but the derived account still
needs a balance before it can send.

## 1. Create an HD wallet

```sh
pnpm wallet
pnpm wallet --account 1
```

The direct recipe is exported as `createDefaultWallet(seedPhrase)`. The CLI uses
`createWalletAccount(seedPhrase, index)`, which explicitly derives the standard
`m/44'/60'/0'/0/<index>` account path shared by XL1 and the XYO browser wallet.

## 2. Create a REST gateway

The reusable functions are:

```ts
import { createGatewayRunner, createReadOnlyGateway } from './src/index.js'

const gateway = await createReadOnlyGateway('sequence')

const { account, runner } = await createGatewayRunner({
  networkId: 'sequence',
  seedPhrase: process.env.XL1_SEED_PHRASE!,
})
```

Omit `networkId` to use `XL1_NETWORK` from `.env` (falling back to `sequence`):

```ts
const gateway = await createReadOnlyGateway()
const { runner } = await createGatewayRunner({
  seedPhrase: process.env.XL1_SEED_PHRASE!,
})
```

An explicit `networkId` or CLI `--network` flag takes precedence over `.env`.

Verify the read-only path against the network selected in `.env`:

```sh
pnpm head
```

Override it explicitly when needed:

```sh
pnpm head --network sequence
```

## 3. Get a balance

Read any address without configuring a seed phrase:

```sh
pnpm balance --address 9858effd232b4033e47d90003d41ec34ecaeda94
```

Or read the configured wallet account:

```sh
pnpm balance
pnpm balance --account 1
```

The output includes both human-readable XL1 and the exact atto-XL1 integer.

## 4. Send XL1

Send a decimal XL1 amount:

```sh
pnpm send --to 2222222222222222222222222222222222222222 --amount 0.1
```

Or provide the exact atto amount:

```sh
pnpm send --to 2222222222222222222222222222222222222222 \
  --atto 100000000000000000
```

By default the command waits for inclusion using a Sequence-safe confirmation
budget of 30 attempts at 10-second intervals. Use `--no-confirm` to submit and
return immediately.

Mainnet sends are blocked unless both the network and the safety flag are
explicit:

```sh
pnpm send --network mainnet --allow-mainnet \
  --to 2222222222222222222222222222222222222222 --amount 0.1
```

## 5. Network URLs

```sh
pnpm networks
```

| Network | REST reads | RPC writes | Data lake | Explorer |
|---|---|---|---|---|
| Mainnet | `https://mainnet.xyo.space` | `https://api.chain.xyo.network/rpc` | `https://api.archivist.xyo.network/dataLake` | `https://explore.xyo.network` |
| Sequence | `https://sequence.xyo.space` | `https://beta.api.chain.xyo.network/rpc` | `https://beta.api.archivist.xyo.network/dataLake` | `https://beta.explore.xyo.network` |

## Development

```sh
pnpm check
pnpm build
```

`pnpm check` runs lint, TypeScript compilation, and the offline unit suite.
`pnpm head` is the opt-in live-network smoke test.
