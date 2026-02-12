import React, { useState } from 'react';
import { Proposal, isSnapshotProposal, isOnChainProposal } from '../types';
import { ChevronRight, Clock, Network, ArrowRightLeft } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

interface ProposalsQueueProps {
  proposals: Proposal[];
  onSelectProposal: (proposal: Proposal) => void;
}

const CHAIN_FILTERS = [
  { id: 'all', label: 'All' },
  { id: '1', label: 'Ethereum' },
  { id: '42161', label: 'Arbitrum' },
  { id: '10', label: 'Optimism' },
  { id: '137', label: 'Polygon' },
];

/** Get chain ID string for a proposal regardless of type */
function getProposalChainId(p: Proposal): string {
  if (isSnapshotProposal(p)) return p.network || '1';
  if (isOnChainProposal(p)) return String(p.chainId);
  return '1';
}

const ProposalsQueue: React.FC<ProposalsQueueProps> = ({ proposals, onSelectProposal }) => {
  const [chainFilter, setChainFilter] = useState('all');
  const [groupByChain, setGroupByChain] = useState(true);
  const { isConnected, chain } = useWallet();

  const userChainId = chain?.id.toString();

  const filtered = chainFilter === 'all'
    ? proposals
    : proposals.filter((p) => getProposalChainId(p) === chainFilter);

  // Group proposals by chain
  const groupedProposals: Record<string, Proposal[]> = {};
  if (groupByChain) {
    filtered.forEach(p => {
      const chainId = getProposalChainId(p);
      if (!groupedProposals[chainId]) {
        groupedProposals[chainId] = [];
      }
      groupedProposals[chainId].push(p);
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with filters and switch link notice */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Active Mandates</h2>
            <p className="text-xs text-zinc-500 font-medium">
              {isConnected && userChainId
                ? `You're on ${CHAIN_FILTERS.find(c => c.id === userChainId)?.label || 'Unknown'} - proposals on your chain highlighted`
                : 'Prioritized by urgency'}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CHAIN_FILTERS.map((cf) => (
              <button
                key={cf.id}
                onClick={() => setChainFilter(cf.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  chainFilter === cf.id
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : isConnected && cf.id === userChainId
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200'
                    : 'bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-100'
                }`}
              >
                {cf.label}
                {isConnected && cf.id === userChainId && ' ✓'}
              </button>
            ))}
          </div>
        </div>

        {/* Group by chain toggle */}
        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Network size={16} className="text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-900">Group by Network</span>
          </div>
          <button
            onClick={() => setGroupByChain(!groupByChain)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              groupByChain
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-indigo-600 border border-indigo-200'
            }`}
          >
            {groupByChain ? 'Grouped' : 'Flat List'}
          </button>
        </div>

        {/* Switch chain prompt */}
        {isConnected && chainFilter !== 'all' && chainFilter !== userChainId && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <ArrowRightLeft size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 mb-1">
                Switch to {CHAIN_FILTERS.find(c => c.id === chainFilter)?.label}?
              </p>
              <p className="text-xs text-amber-700">
                You're currently on {CHAIN_FILTERS.find(c => c.id === userChainId)?.label}.
                To vote on these proposals, switch your wallet to {CHAIN_FILTERS.find(c => c.id === chainFilter)?.label}.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Proposals List */}
      <div className="space-y-6">
         {filtered.length === 0 ? (
           <div className="text-center py-12 text-zinc-400">
             <p className="text-sm font-medium">No proposals for this chain filter.</p>
           </div>
         ) : groupByChain ? (
           // Grouped by chain
           Object.entries(groupedProposals)
             .sort(([chainA], [chainB]) => {
               // User's chain first
               if (chainA === userChainId) return -1;
               if (chainB === userChainId) return 1;
               return 0;
             })
             .map(([chainId, chainProposals]) => {
               const isUserChain = chainId === userChainId;
               const chainName = CHAIN_FILTERS.find(c => c.id === chainId)?.label || `Chain ${chainId}`;

               return (
                 <div key={chainId} className="space-y-3">
                   {/* Chain Header */}
                   <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                     isUserChain
                       ? 'bg-emerald-100 border border-emerald-200'
                       : 'bg-zinc-100 border border-zinc-200'
                   }`}>
                     <Network size={16} className={isUserChain ? 'text-emerald-600' : 'text-zinc-600'} />
                     <span className={`text-sm font-bold ${isUserChain ? 'text-emerald-900' : 'text-zinc-900'}`}>
                       {chainName}
                       {isUserChain && ' (Your Chain)'}
                     </span>
                     <span className={`text-xs font-semibold ${isUserChain ? 'text-emerald-600' : 'text-zinc-500'}`}>
                       {chainProposals.length} proposal{chainProposals.length !== 1 ? 's' : ''}
                     </span>
                   </div>

                   {/* Proposals in this chain */}
                   {chainProposals.map((proposal) => (
                     <ProposalCard
                       key={proposal.id}
                       proposal={proposal}
                       onSelect={onSelectProposal}
                       isUserChain={isUserChain}
                       userChainId={userChainId}
                     />
                   ))}
                 </div>
               );
             })
         ) : (
           // Flat list
           filtered.map((proposal) => (
             <ProposalCard
               key={proposal.id}
               proposal={proposal}
               onSelect={onSelectProposal}
               isUserChain={getProposalChainId(proposal) === userChainId}
               userChainId={userChainId}
             />
           ))
         )}
      </div>
    </div>
  );
};

// Proposal Card Component
const ProposalCard: React.FC<{
  proposal: Proposal;
  onSelect: (p: Proposal) => void;
  isUserChain: boolean;
  userChainId?: string;
}> = ({ proposal, onSelect, isUserChain }) => {
  return (
    <div
      onClick={() => onSelect(proposal)}
      className={`group bg-white/80 backdrop-blur-sm border rounded-2xl p-5 hover:scale-[1.01] hover:shadow-float transition-all cursor-pointer flex items-center gap-6 ${
        isUserChain
          ? 'border-emerald-200 ring-2 ring-emerald-100'
          : 'border-white/50'
      }`}
    >
      <div className={`w-12 h-12 rounded-full border flex items-center justify-center text-sm font-bold flex-shrink-0 ${
        isUserChain
          ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
          : 'bg-zinc-100 border-zinc-200 text-zinc-600'
      }`}>
        {proposal.daoName[0]}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
            isUserChain
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-zinc-100 text-zinc-500'
          }`}>
            {proposal.daoName}
          </span>
          {(() => {
            const chainId = getProposalChainId(proposal);
            return (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isUserChain
                  ? 'bg-emerald-500 text-white'
                  : chainId !== '1'
                  ? 'bg-indigo-50 text-indigo-500'
                  : 'bg-zinc-100 text-zinc-500'
              }`}>
                {CHAIN_FILTERS.find(c => c.id === chainId)?.label || `Chain ${chainId}`}
              </span>
            );
          })()}
          <span className="text-xs text-zinc-400 font-mono">#{proposal.displayId || proposal.id.slice(0, 8)}</span>
        </div>
        <h3 className={`text-base font-bold truncate transition-colors ${
          isUserChain
            ? 'text-emerald-900 group-hover:text-emerald-600'
            : 'text-zinc-900 group-hover:text-indigo-600'
        }`}>
          {proposal.title}
        </h3>
      </div>

      <div className="hidden sm:block text-right">
        <div className="flex items-center gap-1 text-xs font-medium text-zinc-500 justify-end mb-1">
          <Clock size={12} /> {proposal.endDate}
        </div>
        <div className="w-32 h-2 bg-zinc-100 rounded-full overflow-hidden">
          {(() => {
            const votesFor = isSnapshotProposal(proposal) ? (proposal.scores?.[0] || 0) : proposal.votesFor;
            const votesAgainst = isSnapshotProposal(proposal) ? (proposal.scores?.[1] || 0) : proposal.votesAgainst;
            return (
              <div
                className={`h-full rounded-full ${isUserChain ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                style={{ width: `${(votesFor / Math.max(votesFor + votesAgainst, 1)) * 100}%` }}
              />
            );
          })()}
        </div>
      </div>

      <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
        isUserChain
          ? 'border-emerald-200 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600'
          : 'border-zinc-200 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900'
      }`}>
        <ChevronRight size={16} />
      </div>
    </div>
  );
};

export default ProposalsQueue;
