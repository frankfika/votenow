import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useSnapshotVote } from '../hooks/useSnapshotVote';
import { Check, X, Loader2, ExternalLink, AlertTriangle, Award } from 'lucide-react';

interface VoteButtonProps {
  proposalId: string;
  recommendation: string;
  spaceId?: string;
  snapshotId?: string;
  choices?: string[];
  proposalType?: string;
}

const VoteButton: React.FC<VoteButtonProps> = ({
  proposalId,
  recommendation,
  spaceId,
  snapshotId,
  choices,
  proposalType,
}) => {
  const { address, isConnected, connectWallet } = useWallet();
  const {
    votingPower,
    vpLoading,
    existingVote,
    existingVoteLoading,
    voting,
    receipt,
    pointsEarned,
    error,
    castVote,
    reset,
  } = useSnapshotVote({
    space: spaceId,
    proposal: snapshotId || proposalId,
    proposalType,
  });

  const [showPointsAnim, setShowPointsAnim] = useState(false);

  useEffect(() => {
    if (pointsEarned && pointsEarned > 0) {
      setShowPointsAnim(true);
      const timer = setTimeout(() => setShowPointsAnim(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [pointsEarned]);

  const handleVote = async (choiceIndex: number) => {
    if (!isConnected) {
      connectWallet();
      return;
    }
    await castVote(choiceIndex);
  };

  // Already voted (from Snapshot query or just voted)
  if (existingVote || receipt) {
    const choiceIdx = existingVote?.choice ?? 1;
    const votedChoice = choices?.[choiceIdx - 1] || `Choice ${choiceIdx}`;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 relative overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-800">
              Vote Recorded: {votedChoice}
            </p>
            <p className="text-xs text-emerald-600">
              Signed by {address?.slice(0, 6)}...{address?.slice(-4)}
              {existingVote?.vp ? ` · VP: ${Math.round(existingVote.vp).toLocaleString()}` : ''}
            </p>
          </div>

          {showPointsAnim && pointsEarned && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-bounce">
              <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold border border-amber-200">
                <Award size={14} />
                +{pointsEarned} pts
              </div>
            </div>
          )}
        </div>

        {snapshotId && spaceId && (
          <a
            href={`https://snapshot.org/#/${spaceId}/proposal/${snapshotId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View on Snapshot <ExternalLink size={12} />
          </a>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
          <X size={16} className="text-rose-500" />
          <p className="text-sm font-medium text-rose-700">{error}</p>
        </div>
        <button
          onClick={reset}
          className="w-full py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (existingVoteLoading || vpLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-zinc-400">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-xs font-medium">Checking voting status...</span>
      </div>
    );
  }

  const hasNoVP = isConnected && votingPower !== null && votingPower === 0;

  return (
    <div className="space-y-2">
      {!isConnected && (
        <p className="text-xs text-zinc-400 text-center mb-2">Connect wallet to vote</p>
      )}

      {isConnected && votingPower !== null && (
        <div className="mb-2 space-y-1">
          <div className={`flex items-center justify-center gap-2 text-xs font-medium ${hasNoVP ? 'text-amber-600' : 'text-zinc-500'}`}>
            {hasNoVP ? (
              <>
                <AlertTriangle size={12} />
                No voting power in this space
              </>
            ) : (
              <>VP: {Math.round(votingPower).toLocaleString()}</>
            )}
          </div>
          {hasNoVP && (
            <div className="text-[10px] text-zinc-500 text-center max-w-sm mx-auto leading-relaxed bg-amber-50 border border-amber-100 rounded-lg p-3 space-y-2">
              <p className="mb-1">
                <span className="font-semibold text-amber-700">Why can't I vote?</span>
              </p>
              <p className="mb-2">
                Snapshot voting requires holding the DAO's governance tokens at the proposal's snapshot block height.
                You need to own {spaceId ? `${spaceId.toUpperCase().split('.')[0]} governance tokens` : 'the DAO governance token'} to participate in voting.
              </p>
              <a
                href={`https://app.uniswap.org/#/swap?outputCurrency=${spaceId ? spaceId.split('.')[0] : 'token'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold text-xs hover:from-pink-600 hover:to-purple-600 transition-all shadow-sm"
              >
                Buy on Uniswap →
              </a>
            </div>
          )}
        </div>
      )}

      {choices && choices.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {choices.map((choice, index) => {
            const choiceIndex = index + 1;
            const isFor = choice.toLowerCase().includes('for') || choice.toLowerCase().includes('yes') || index === 0;
            const isAgainst = choice.toLowerCase().includes('against') || choice.toLowerCase().includes('no') || index === 1;

            let btnClass = 'bg-zinc-600 hover:bg-zinc-700 shadow-zinc-600/20';
            if (isFor && index === 0) btnClass = 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20';
            else if (isAgainst && index === 1) btnClass = 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20';

            return (
              <button
                key={index}
                onClick={() => handleVote(choiceIndex)}
                disabled={voting || hasNoVP}
                className={`flex-1 min-w-[100px] py-3 ${btnClass} text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50`}
              >
                {voting ? <Loader2 size={16} className="animate-spin" /> : null}
                {choice}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => handleVote(1)}
            disabled={voting || hasNoVP}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {voting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Vote For
          </button>
          <button
            onClick={() => handleVote(2)}
            disabled={voting || hasNoVP}
            className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {voting ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
            Against
          </button>
        </div>
      )}

      {recommendation && (
        <p className="text-xs text-center text-zinc-400">
          AI recommends: <span className="font-bold text-zinc-600">{recommendation}</span>
        </p>
      )}
    </div>
  );
};

export default VoteButton;
