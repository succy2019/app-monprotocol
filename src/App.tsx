import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { ActionButtonList } from './components/ActionButtonList'
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
            <ActionButtonList />
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  )
}

export default App
