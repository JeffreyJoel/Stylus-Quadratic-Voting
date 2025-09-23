# Quadratic Voting on Arbitrum

A session-based quadratic voting system built with Rust and deployed on Arbitrum using Stylus.

## What is Quadratic Voting?

Quadratic voting is a voting mechanism where participants can express the intensity of their preferences. Voters get a budget of credits to spend on votes, with costs increasing quadratically:

- **1 vote** costs **1 credit**
- **2 votes** cost **4 credits**
- **3 votes** cost **9 credits**

This makes it expensive to dominate outcomes while allowing strong preferences to be expressed.

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

## API Reference

### Session Management
- `initialize()` - Initialize the contract
- `createSession(string name, string description, uint256 creditsPerVoter, uint256 duration)` - Create new voting session
- `getSession(uint256 sessionId)` - Get session details

### Voter Management
- `registerVoter(string email)` - Register as a voter with email
- `getVoter(address voter)` - Get voter information

### Proposal Management
- `addProposal(uint256 sessionId, string title, string description)` - Add proposal to session
- `getProposal(uint256 sessionId, uint256 proposalId)` - Get proposal details
- `getSessionProposals(uint256 sessionId)` - Get all proposals in session

### Voting
- `vote(uint256 sessionId, uint256[] proposalIds, uint256[] voteCounts)` - Cast votes on multiple proposals
- `getVote(uint256 sessionId, address voter, uint256 proposalId)` - Get voter's vote on proposal
- `getVoterSessionCredits(uint256 sessionId, address voter)` - Get remaining credits in session

## Architecture

The contract uses a hierarchical structure:
- **Sessions**: Top-level voting events with time limits and credit allocations
- **Proposals**: Individual items within sessions that can be voted on
- **Votes**: Quadratic-cost votes cast by registered voters
- **Credits**: Per-session budgets that decrease with quadratic voting costs

## License

MIT License
