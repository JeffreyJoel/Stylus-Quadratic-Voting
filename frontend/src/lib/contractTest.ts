import { ethers } from 'ethers'
import { getProvider, getContract, CONTRACT_ADDRESS, RPC_URL, ADMIN_PRIVATE_KEY } from './contract'

/**
 * Test contract connection and basic functionality
 */
export async function testContractConnection() {
  try {
    console.log('🔍 Testing contract connection...')
    console.log('Contract Address:', CONTRACT_ADDRESS)
    console.log('RPC URL:', RPC_URL)

    // Test provider connection
    const provider = getProvider()
    const network = await provider.getNetwork()
    console.log('✅ Connected to network:', network.name, 'Chain ID:', network.chainId.toString())

    // Test contract instance
    const contract = getContract(provider)
    console.log('✅ Contract instance created')

    // Test admin wallet
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider)
    const adminAddress = await adminWallet.getAddress()
    console.log('✅ Admin wallet address:', adminAddress)

    // Test contract with admin signer
    const contractWithSigner = getContract(adminWallet)
    console.log('✅ Contract with admin signer created')

    return {
      success: true,
      network: {
        name: network.name,
        chainId: network.chainId.toString()
      },
      contractAddress: CONTRACT_ADDRESS,
      adminAddress
    }
  } catch (error) {
    console.error('❌ Contract connection test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test basic contract read operations
 */
export async function testContractReads() {
  try {
    console.log('🔍 Testing contract read operations...')
    
    const provider = getProvider()
    const contract = getContract(provider)

    // Test getting a non-existent session (should fail gracefully)
    try {
      const session = await contract.get_session(1)
      console.log('📖 Session 1 data:', session)
    } catch (error) {
      console.log('📖 Session 1 not found (expected for new contract)')
    }

    // Test getting voter info for admin
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, getProvider())
    const adminAddress = await adminWallet.getAddress()
    
    try {
      const voterInfo = await contract.get_voter(adminAddress)
      console.log('📖 Admin voter info:', voterInfo)
    } catch (error) {
      console.log('📖 Admin not registered yet (expected)')
    }

    return { success: true }
  } catch (error) {
    console.error('❌ Contract read test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test voter registration
 */
export async function testVoterRegistration() {
  try {
    console.log('🔍 Testing voter registration...')
    
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, getProvider())
    const contract = getContract(adminWallet)

    // Register admin as voter
    console.log('📝 Registering admin as voter...')
    const tx = await contract.register_voter('admin@quadraticvote.com')
    console.log('⏳ Transaction sent:', tx.hash)
    
    const receipt = await tx.wait()
    console.log('✅ Voter registration confirmed in block:', receipt.blockNumber)

    // Verify registration
    const voterInfo = await contract.get_voter(await adminWallet.getAddress())
    console.log('📖 Registered voter info:', voterInfo)

    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      voterInfo
    }
  } catch (error) {
    console.error('❌ Voter registration test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Run all contract tests
 */
export async function runAllContractTests() {
  console.log('🚀 Starting comprehensive contract tests...')
  
  const connectionTest = await testContractConnection()
  if (!connectionTest.success) {
    return { success: false, step: 'connection', error: connectionTest.error }
  }

  const readTest = await testContractReads()
  if (!readTest.success) {
    return { success: false, step: 'reads', error: readTest.error }
  }

  const registrationTest = await testVoterRegistration()
  if (!registrationTest.success) {
    return { success: false, step: 'registration', error: registrationTest.error }
  }

  console.log('🎉 All contract tests passed!')
  return {
    success: true,
    results: {
      connection: connectionTest,
      reads: readTest,
      registration: registrationTest
    }
  }
}
