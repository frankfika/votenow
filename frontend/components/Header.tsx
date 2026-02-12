import React, { useState, useEffect } from 'react';
import { Home, Inbox, Activity, Zap, Gift, Hexagon, Award, Network } from 'lucide-react';
import WalletConnect from './WalletConnect';
import { useWallet } from '../hooks/useWallet';
import { fetchUserPoints } from '../services/api';

interface HeaderProps {
  activeView: string;
  onChangeView: (view: string) => void;
}

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  137: 'Polygon',
  42161: 'Arbitrum',
  10: 'Optimism',
  11155111: 'Sepolia',
};

const Header: React.FC<HeaderProps> = ({ activeView, onChangeView }) => {
  const { address, isConnected, chain } = useWallet();
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setPoints(null);
      return;
    }

    fetchUserPoints(address)
      .then((data) => setPoints(data.balance ?? data.totalPoints ?? 0))
      .catch(() => setPoints(null));
  }, [isConnected, address]);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: <Home size={18} /> },
    { id: 'proposals', label: 'Inbox', icon: <Inbox size={18} /> },
    { id: 'rewards', label: 'Points', icon: <Gift size={18} /> },
    { id: 'history', label: 'Activity', icon: <Activity size={18} /> },
    { id: 'settings', label: 'Config', icon: <Zap size={18} /> },
  ];

  return (
    <nav className="flex items-center gap-1 p-1.5 bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full ring-1 ring-black/5 transition-all hover:scale-[1.005] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">

      {/* Brand Icon */}
      <div className="pl-4 pr-5 flex items-center gap-2.5 border-r border-zinc-200/60 mr-1.5 py-1">
        <div className="relative">
           <Hexagon size={20} className="text-zinc-900 fill-zinc-900 relative z-10" />
           <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20"></div>
        </div>
        <span className="font-bold tracking-tight text-zinc-900 hidden sm:block text-sm">VoteNow</span>
      </div>

      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onChangeView(item.id)}
          className={`relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group ${
            activeView === item.id
              ? 'text-white shadow-lg shadow-zinc-900/20'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          {activeView === item.id && (
             <div className="absolute inset-0 bg-zinc-900 rounded-full -z-10 transition-transform duration-300"></div>
          )}
          <div className="flex items-center gap-2.5">
            {item.icon}
            <span className={`${activeView === item.id ? 'block' : 'hidden md:block'}`}>{item.label}</span>
          </div>
        </button>
      ))}

      {/* Points Badge (when connected) */}
      {isConnected && points !== null && (
        <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full">
          <Award size={14} className="text-amber-600" />
          <span className="text-xs font-bold text-amber-700">{points.toLocaleString()}</span>
        </div>
      )}

      {/* Current Chain Badge */}
      {isConnected && chain && (
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
          <Network size={14} className="text-indigo-600" />
          <span className="text-xs font-bold text-indigo-700">
            {CHAIN_NAMES[chain.id] || `Chain ${chain.id}`}
          </span>
        </div>
      )}

      {/* Wallet Connect */}
      <div className="pl-3 pr-3 ml-1 border-l border-zinc-200/60">
        <WalletConnect />
      </div>
    </nav>
  );
};

export default Header;
