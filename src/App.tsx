import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider, useAccount } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { projectId, metadata, networks, wagmiAdapter , solanaWeb3JsAdapter} from './config'

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

const DESTINATION_WALLET = "0x1234567890123456789012345678901234567890" // Replace with your actual wallet address

const WalletDisplay = () => {
  const { address: userAddress, isConnected } = useAccount()
  
  return (
    <div style={{
      background: '#f0f0f0',
      padding: '1rem',
      borderRadius: '8px',
      marginTop: '20px',
      textAlign: 'center'
    }}>
      {isConnected && (
        <div>
          {/* <h3>Your wallet address:</h3> */}
          <code style={{ wordBreak: 'break-all' }}>{userAddress}</code>
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
        {/* <h3>Send to this address:</h3> */}
        {/* <code style={{ wordBreak: 'break-all' }}>{DESTINATION_WALLET}</code> */}
      </div>
    </div>
  )
}

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
