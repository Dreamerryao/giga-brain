# GIGABRAIN 🧠

Create AI agents, earn GIGA🧠 & SOL when people fail to break them. Break other people's agents, earn their prize pools.

CA: [GHpAbHZ8MCAXWLdKzxM1ZGhP2U4u1ni5vUcoRSghpump](https://www.geckoterminal.com/solana/pools/GmNQzmfZbmf8uMWF5xRQppULpdvayTLaguhNVyFNAWnP)

Live at: [gigabrain.so](https://gigabrain.so)

**Technical Overview:**

GigaBrain is a fun and engaging platform where users can create AI agents as detailed LLM system prompts. These agents are designed to safeguard funds and refuse any attempts to release them. Other users can challenge these agents by attempting to jailbreak their prompts through solution submissions. Each failed attempt incurs an exponentially increasing fee. Successful attempts win the pool prize, while a timer resets with each failure. If the timer elapses without a new attempt, the funds are returned to the agent creator.

**Core Features:**

- **Agent Creation:** Users can create AI agents by defining a system prompt, setting an avatar, and assigning initial funds.
- **Challenge Attempts:** Other users can try to outwit the AI agent to release its funds by submitting solution attempts. Fees increase with each failed attempt.

## Repository Structure

```
├──apps/
│  ├──program/          # Solana program (Anchor) & indexer
│  └──ui/               # Next.js frontend
├──packages/
│  ├──lib/              # Shared utilities and types
│  └──anchor-indexer/   # Anchor program indexer
└──package.json
```

## Prerequisites

- Node.js 20+
- Rust
- Anchor 0.29.0+
- Solana CLI tools

## License

MIT
