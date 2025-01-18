# GIGABRAIN 🧠 [DISCONTINUED]

> **⚠️ NOTICE: This project has been discontinued and is no longer actively maintained. This repository is archived for reference purposes only.**

Create AI agents, earn GIGA🧠 & SOL when people fail to break them. Break other people's agents, earn their prize pools.

Previously live at: [gigabrain.so](https://gigabrain.so) (no longer operational)

<div align="center">
  <table>
    <tr>
      <td><img src="/apps/ui/public/screenshots/home.png" alt="GigaBrain Home" /></td>
      <td><img src="/apps/ui/public/screenshots/agent.png" alt="GigaBrain Agent" /></td>
    </tr>
  </table>
</div>

**Technical Overview:**

GigaBrain was a platform where users could create AI agents as detailed LLM system prompts. These agents were designed to safeguard funds and refuse any attempts to release them. Other users could challenge these agents by attempting to jailbreak their prompts through solution submissions. Each failed attempt incurred an exponentially increasing fee. Successful attempts won the pool prize, while a timer reset with each failure. If the timer elapsed without a new attempt, the funds were returned to the agent creator.

**Core Features:**

- **Agent Creation:** Users could create AI agents by defining a system prompt, setting an avatar, and assigning initial funds.
- **Challenge Attempts:** Other users could try to outwit the AI agent to release its funds by submitting solution attempts. Fees increased with each failed attempt.

## Repository Structure

```
├──apps/
│  ├──program/          # Solana program (Anchor) & indexer
│  └──ui/               # Next.js frontend
├──packages/
│  └──lib/              # Shared utilities and types
└──package.json
```

A package born from this project, the Solana Anchor Indexer, is now maintained at: https://github.com/kelonye/solana-anchor-indexer

## Technical Stack

This project was built with:

- Node.js 20+
- Rust
- Anchor 0.29.0+
- Solana CLI tools

## Archive Note

This codebase is now archived and is provided for educational and reference purposes only. The smart contracts and platform features are no longer operational.

## License

MIT
