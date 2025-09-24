# Quadratic Voting on Arbitrum

A simple quadratic voting system built with Rust and deployed on Arbitrum using Stylus.

## The Problem

Web3Bridge has a fixed budget of $50K to organize 7 workshops on various blockchain subject matter. The question of how to allocate these scarce resources arises, and Web3Bridge decides to let its students vote on which workshops should take priority.

A regular voting system (1 student, 1 vote) would not accurately capture the intensity of students' preferences. For example, if a student prefers workshop A above the others, they vote for A. However, this system doesn't capture how they feel about workshops B or C compared to the other options. This is not a very efficient system for budget allocation based on preferences.

Using a **Quadratic Voting system**, a student's preference for each workshop is accurately captured and factored into the overall voting result.

## What is Quadratic Voting?

Quadratic voting is a collective decision-making procedure that allows participants to express not just their preferences, but also the intensity of those preferences. Unlike traditional voting where each person gets one vote per issue, quadratic voting allows voters to allocate multiple "credits" to issues they care about most.

**Key Principle**: The cost of votes increases quadratically, but the voting power increases linearly.
- 1 vote costs 1 credit
- 2 votes cost 4 credits  
- 3 votes cost 9 credits
- And so on...

This system ensures that while people can express strong preferences on issues they care deeply about, they cannot simply "buy" elections due to the increasing marginal cost.

## Key Features

- **Session-based voting**: Multiple proposals grouped into voting sessions
- **Per-session credits**: Each voter gets credits allocated per voting session
- **Batch voting**: Vote on multiple proposals in a single transaction
- **Time-limited sessions**: Voting sessions have start and end times
- **Quadratic cost calculation**: Prevents plutocratic domination

## Project Structure

- `src/lib.rs` – The Stylus smart contract with session-based quadratic voting
- `src/main.rs` – Optional CLI interface
- `Cargo.toml` – Build configuration

## Prerequisites

### Install Rust
```bash
rustup default 1.87.0
rustup target add wasm32-unknown-unknown --toolchain 1.87.0
```

### Install Docker
Download from [docker.com](https://www.docker.com/)

### Install cargo-stylus
```bash
cargo install --force cargo-stylus
```

### Set up Arbitrum dev node
```bash
git clone https://github.com/OffchainLabs/nitro-devnode.git
cd nitro-devnode
./run-dev-node.sh
```

### Install Foundry (Optional)
For interacting with the contract. See [Foundry docs](https://book.getfoundry.sh/).

## Building and Testing

Check the contract compiles:
```bash
cargo stylus check
```

Run tests:
```bash
cargo test
```

## Deployment

Deploy to local Arbitrum node:
```bash
cargo stylus deploy \
  --endpoint='http://localhost:8547' \
  --privatekey='0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659'
```

Save the contract address from the output.

## Usage

Replace `[contract-address]` with your deployed contract address.

### Initialize Contract
```bash
cast send --rpc-url 'http://localhost:8547' \
  --private-key '0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659' \
  [contract-address] \
  'initialize()'
```

### Register as Voter
```bash
cast send --rpc-url 'http://localhost:8547' \
  --private-key '0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659' \
  [contract-address] \
  'registerVoter(string)' 'user@example.com'
```

### Create Voting Session
Create a session with 100 credits per voter, lasting 3600 blocks:
```bash
cast send --rpc-url 'http://localhost:8547' \
  --private-key '0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659' \
  [contract-address] \
  'createSession(string,string,uint256,uint256)' 'Budget Vote 2024' 'Annual budget allocation' 100 3600
```

### Add Proposals to Session
```bash
# Add first proposal
cast send --rpc-url 'http://localhost:8547' \
  --private-key '0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659' \
  [contract-address] \
  'addProposal(uint256,string,string)' 1 'Education Budget' 'Increase education funding by 20%'

# Add second proposal
cast send --rpc-url 'http://localhost:8547' \
  --private-key '0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659' \
  [contract-address] \
  'addProposal(uint256,string,string)' 1 'Healthcare Budget' 'Increase healthcare funding by 15%'
```

### Cast Votes
Vote on multiple proposals in session 1 (2 votes on proposal 1, 1 vote on proposal 2):
```bash
cast send --rpc-url 'http://localhost:8547' \
  --private-key '0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659' \
  [contract-address] \
  'vote(uint256,uint256[],uint256[])' 1 '[1,2]' '[2,1]'
```

### Check Results
Get session details:
```bash
cast call --rpc-url 'http://localhost:8547' \
  [contract-address] \
  'getSession(uint256)' 1
```

Get proposal results:
```bash
cast call --rpc-url 'http://localhost:8547' \
  [contract-address] \
  'getProposal(uint256,uint256)' 1 1
```

Get remaining credits:
```bash
cast call --rpc-url 'http://localhost:8547' \
  [contract-address] \
  'getVoterSessionCredits(uint256,address)' 1 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

## Architecture

The contract uses a hierarchical structure:
- **Sessions**: Top-level voting events with time limits and credit allocations
- **Proposals**: Individual items within sessions that can be voted on
- **Votes**: Quadratic-cost votes cast by registered voters
- **Credits**: Per-session budgets that decrease with quadratic voting costs

