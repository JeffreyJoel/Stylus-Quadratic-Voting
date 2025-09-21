# Quadratic Voting on Arbitrum

A simple quadratic voting system built with Rust and deployed on Arbitrum using Stylus.

## What is Quadratic Voting?

Quadratic voting is a voting mechanism where participants can express the intensity of their preferences. Voters get a budget of credits to spend on votes, with costs increasing quadratically:

- **1 vote** costs **1 credit**
- **2 votes** cost **4 credits**  
- **3 votes** cost **9 credits**

This makes it expensive to dominate outcomes while allowing strong preferences to be expressed.

## Project Structure

- `src/contract.rs` – The Stylus smart contract
- `src/main.rs` – Optional CLI interface
- `tests/` – Unit tests
- `build.rs` / `Cargo.toml` – Build configuration

## Prerequisites

### Install Rust
```bash
rustup default 1.80
rustup target add wasm32-unknown-unknown --toolchain 1.80
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

### Register a Voter
```bash
cast send --rpc-url 'http://localhost:8547' \
  --private-key '0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659' \
  [contract-address] \
  'registerVoter(string)' 'Alice'
```

### Add a Proposal
```bash
cast send --rpc-url 'http://localhost:8547' \
  --private-key '0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659' \
  [contract-address] \
  'addProposal(string,string)' 'Community Event' 'Organize a meetup'
```

### Cast a Vote
Vote on proposal 0 with 25 credits:
```bash
cast send --rpc-url 'http://localhost:8547' \
  --private-key '0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659' \
  [contract-address] \
  'vote(uint256,uint256,uint256)' 1 0 25
```

### View Results
```bash
cast call --rpc-url 'http://localhost:8547' \
  [contract-address] \
  'getResults()(uint256[])'
```

## Features

- **On-chain storage** for transparency
- **Wallet-based authentication** 
- **Quadratic pricing** prevents vote buying
- **Concurrent voting** support

## License

MIT License
