import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, arbitrum, optimism, polygon } from 'wagmi/chains';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected, coinbaseWallet } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, arbitrum, optimism, polygon],
  connectors: [
    injected(), // MetaMask, Trust, Coinbase extension, etc.
    coinbaseWallet({
      appName: 'VoteNow',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
  },
  ssr: false,
});

export function useWallet() {
  const account = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();

  // Return both connectWallet (old) and connectors (new) for backwards compatibility
  const connectWallet = async () => {
    // Just connect with the first available connector (usually injected/MetaMask)
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return {
    address: account.address,
    isConnected: account.isConnected,
    chain: account.chain,
    connectWallet,
    connectors, // Expose connectors for manual selection
    connect,    // Expose connect function
    disconnect,
    error,
  };
}
