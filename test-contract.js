// Simple Node.js script to test contract connection
// Run with: node test-contract.js

const { ethers } = require('ethers');

// Contract configuration
const CONTRACT_ADDRESS = '0x44ddf6171263d86f9cea1f0919f738ac6945b035';
const RPC_URL = 'http://localhost:8547';
const ADMIN_PRIVATE_KEY = 'f25960123e3b45f2eb6b9e4857d4eb699d323528d510932816bd0d0ff0f07168';

// Simplified ABI for testing
const TEST_ABI = [
  {
    type: "function",
    name: "register_voter",
    inputs: [{ name: "email", type: "string" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "get_voter",
    inputs: [{ name: "voter", type: "address" }],
    outputs: [
      { name: "email", type: "string" },
      { name: "is_registered", type: "bool" }
    ],
    stateMutability: "view"
  }
];

async function testContract() {
  try {
    console.log('🔍 Testing contract connection...');
    console.log('Contract Address:', CONTRACT_ADDRESS);
    console.log('RPC URL:', RPC_URL);

    // Test provider connection
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const network = await provider.getNetwork();
    console.log('✅ Connected to network:', network.name, 'Chain ID:', network.chainId.toString());

    // Test admin wallet
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const adminAddress = await adminWallet.getAddress();
    console.log('✅ Admin wallet address:', adminAddress);

    // Test contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, TEST_ABI, adminWallet);
    console.log('✅ Contract instance created');

    // Test voter registration
    console.log('📝 Testing voter registration...');
    try {
      const tx = await contract.register_voter('admin@test.com');
      console.log('⏳ Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Registration confirmed in block:', receipt.blockNumber);
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        console.log('ℹ️ Admin already registered (this is expected)');
      } else {
        throw error;
      }
    }

    // Test reading voter info
    console.log('📖 Testing voter info retrieval...');
    const voterInfo = await contract.get_voter(adminAddress);
    console.log('✅ Voter info:', {
      email: voterInfo[0],
      isRegistered: voterInfo[1]
    });

    console.log('🎉 All tests passed! Contract is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testContract();
