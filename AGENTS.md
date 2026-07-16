# AGENTS.md

Use the installed `xy-development`, `xy-toolchain`, `xyo-knowledge`,
`xl1-knowledge`, and `xl1-patterns` skills for changes in this repository.

This is a Node.js recipe project. Chain reads must use the XL1 SDK gateway
viewer, and writes must use gateway runner methods. Never add hand-written
JSON-RPC requests or Ethereum chain clients.

Keep secrets in `.env`; `.env.example` must remain non-secret.
