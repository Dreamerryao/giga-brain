# Puzzle Protocol

A decentralized protocol for creating and solving puzzles on Solana with support for both native SOL and SPL tokens.

## Overview

The Puzzle Protocol enables users to create puzzles with prize pools, where solvers can attempt solutions and claim rewards upon successful verification. The protocol includes features like:

- Support for both SOL and SPL token prizes
- Dynamic fee structure that scales with attempt count
- Configurable timeouts and attempt limits
- Secure prize escrow system
- Admin-controlled service fees
- Multi-stage verification process

## Core Components

### Game Configuration

The global game state is managed through a `Game` account that stores:

- Admin authority
- Puzzle verification authority
- Prompt verification authority
- Timeout configurations
- Maximum attempt limits

### Puzzle Currencies

Each supported currency (SOL or SPL token) has a `PuzzleCurrency` configuration that defines:

- Token mint address
- Service fee basis points:
  - Set to zero for GIGA🧠 to incentivize more creation of agents in this currency
  - Set to 20% for others
  - Configurable by admin through `set_puzzle_currency_config` ix
- Minimum initial prize amount
- Fee structure for attempts

### Individual Puzzles

Each puzzle is represented by a `Puzzle` account containing:

- Unique identifier (nonce)
- Creator's address
- Current status
- Prize configuration
- Attempt history
- Timeout settings

## Puzzle Lifecycle

1. **Creation**: Creator initializes puzzle with prize pool
2. **Active**: Puzzle accepts solution attempts
3. **Attempted**: Solution submitted and awaiting verification
4. **Approved/Rejected**: Verifier reviews solution
5. **Completed/TimedOut**: Final state after successful solve or timeout

## Instructions

### Admin Instructions

- `set_game_config` - Update global game parameters
- `set_puzzle_currency_config` - Configure supported currencies
- `transfer_admin` - Transfer admin privileges

### Puzzle Management

- `create_puzzle` - Create new puzzle with SOL prize
- `create_puzzle_token` - Create new puzzle with SPL token prize
- `record_attempt` - Submit a solution attempt
- `approve_transfer` - Approve successful solution
- `reject_transfer` - Reject invalid solution

### Prize Claims

- `claim_prize` - Claim SOL prize after successful solve
- `claim_prize_token` - Claim SPL token prize after successful solve
- `claim_timeout` - Recover funds after puzzle timeout

## Fee Structure

The protocol implements a dynamic fee structure where:

- Base fee applies to first attempt
- Fees increase exponentially with each attempt
- Maximum fee cap prevents excessive costs
- Service fees are split between admin and creator

## Security Features

- PDA-based escrow accounts
- Required signer verification
- Timeout enforcement
- Maximum attempt limits
- Two-stage verification process

## Account Seeds

- Game: `["game"]`
- Puzzle: `["puzzle", creator, nonce]`
- Puzzle Currency: `["puzzle_currency", mint]`
- Escrow: `["puzzle_escrow", creator, nonce]`

## Error Handling

The protocol includes comprehensive error checking for:

- Invalid account permissions
- Insufficient funds
- Timeout violations
- State transition errors
- Fee calculation errors

## Events

The protocol emits events for key actions:

- Puzzle attempts
- Solution verification
- Prize claims
- Timeout claims
- Final timer activation

## Development

### Prerequisites

- Solana Tool Suite
- Anchor Framework
- Node.js >= 20
- PNPM: `npm install -g pnpm`
- Postgres installed or in Docker

### Setup

1. In repo root, run `npm install`
2. In `apps/program`, copy `.env.example` to `.env.test` and fill in the values

### Building

```bash
make build
```

### Testing

Enable a test spec in `jest` of Makefile

```bash
make test
```

TODO: Better testing setup

## License

MIT
