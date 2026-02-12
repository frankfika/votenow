import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from './hooks/useWallet';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProposalDetail from './components/ProposalDetail';
import AgentConfig from './components/AgentConfig';
import ActionLog from './components/ActionLog';
import ProposalsQueue from './components/ProposalsQueue';
import RewardsShop from './components/RewardsShop';
import { useProposals } from './hooks/useProposals';
import { Proposal } from './types';

const queryClient = new QueryClient();

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const { proposals, loading, error } = useProposals();

  const handleSelectProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setCurrentView('proposal-detail');
  };

  const handleBack = () => {
    setSelectedProposal(null);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-indigo-500 selection:text-white relative">

      {/* Texture Overlay */}
      <div className="bg-noise"></div>

      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
         <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
         <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-indigo-100/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 min-h-screen flex flex-col relative z-10">
        {/* Floating Navigation */}
        <div className="sticky top-6 z-50 flex justify-center mb-10">
           <Header
             activeView={currentView}
             onChangeView={setCurrentView}
           />
        </div>

        <main className="flex-1 w-full transition-all duration-500 ease-in-out">
            {currentView === 'dashboard' && (
              <>
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/60 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                      <span className="text-sm font-medium text-zinc-500">Loading live proposals from Snapshot...</span>
                    </div>
                  </div>
                )}
                {error && !loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 bg-rose-50/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-rose-200/60 shadow-sm">
                      <span className="text-sm font-medium text-rose-600">Failed to load proposals: {error}</span>
                    </div>
                  </div>
                )}
                <Dashboard
                  proposals={proposals}
                  onSelectProposal={handleSelectProposal}
                  onChangeView={setCurrentView}
                />
              </>
            )}

            {currentView === 'proposals' && (
              <>
                {loading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/60 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                      <span className="text-sm font-medium text-zinc-500">Fetching proposals...</span>
                    </div>
                  </div>
                )}
                {error && !loading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-3 bg-rose-50/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-rose-200/60 shadow-sm">
                      <span className="text-sm font-medium text-rose-600">Failed to load proposals: {error}</span>
                    </div>
                  </div>
                )}
                <ProposalsQueue
                  proposals={proposals}
                  onSelectProposal={handleSelectProposal}
                />
              </>
            )}

            {currentView === 'rewards' && (
               <RewardsShop />
            )}

            {currentView === 'history' && (
               <ActionLog />
            )}

            {currentView === 'settings' && (
               <AgentConfig />
            )}

            {currentView === 'proposal-detail' && selectedProposal && (
              <div className="animate-in slide-in-from-bottom-12 duration-700 fade-in fill-mode-forwards">
                <ProposalDetail
                  key={selectedProposal.id}
                  proposal={selectedProposal}
                  onBack={handleBack}
                />
              </div>
            )}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
