import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useSnapshotVote } from '../hooks/useSnapshotVote';
import { Check, X, Loader2, ExternalLink, AlertTriangle, Award, RefreshCw } from 'lucide-react';

// DAO space -> token contract address mapping (for Uniswap links)
const SPACE_TO_TOKEN_ADDRESS: Record<string, string> = {
  'aave.eth': '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // AAVE
  'aavedao.eth': '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // AAVE
  'uniswapgovernance.eth': '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
  'uniswap': '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
  'ens.eth': '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72', // ENS
  'gitcoindao.eth': '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F', // GTC
  'lido-snapshot.eth': '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32', // LDO
  'compoundgovernance.eth': '0xc00e94Cb662C3520282E6f5717214004A7f26888', // COMP
  'balancer.eth': '0xba100000625a3754423978a60c9317c58a424e3D', // BAL
  'curve.eth': '0xD533a949740bb3306d119CC777fa900bA034cd52', // CRV
  'yearn': '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', // YFI
  'sushigov.eth': '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2', // SUSHI
  'arbitrumfoundation.eth': '0x912CE59144191C1204E64559FE8253a0e49E6548', // ARB
  'opcollective.eth': '0x4200000000000000000000000000000000000042', // OP
  'stgdao.eth': '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6', // STG
  'gmx.eth': '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', // GMX
};

// DAO space -> token symbol (for display)
const SPACE_TO_TOKEN_SYMBOL: Record<string, string> = {
  'aave.eth': 'AAVE',
  'aavedao.eth': 'AAVE',
  'uniswapgovernance.eth': 'UNI',
  'uniswap': 'UNI',
  'ens.eth': 'ENS',
  'gitcoindao.eth': 'GTC',
  'lido-snapshot.eth': 'LDO',
  'compoundgovernance.eth': 'COMP',
  'balancer.eth': 'BAL',
  'curve.eth': 'CRV',
  'yearn': 'YFI',
  'sushigov.eth': 'SUSHI',
  'arbitrumfoundation.eth': 'ARB',
  'opcollective.eth': 'OP',
  'stgdao.eth': 'STG',
  'gmx.eth': 'GMX',
};

// Get token symbol for display
function getTokenSymbol(spaceId?: string): string {
  if (!spaceId) return 'governance';

  // Try direct mapping
  if (SPACE_TO_TOKEN_SYMBOL[spaceId]) {
    return SPACE_TO_TOKEN_SYMBOL[spaceId];
  }

  // Try removing .eth suffix
  const withoutEth = spaceId.replace('.eth', '');
  if (SPACE_TO_TOKEN_SYMBOL[withoutEth]) {
    return SPACE_TO_TOKEN_SYMBOL[withoutEth];
  }

  // Fallback: capitalize first part
  return spaceId.split('.')[0].toUpperCase();
}

// Get token contract address for Uniswap
function getTokenAddress(spaceId?: string): string {
  if (!spaceId) return '';

  // Try direct mapping
  if (SPACE_TO_TOKEN_ADDRESS[spaceId]) {
    return SPACE_TO_TOKEN_ADDRESS[spaceId];
  }

  // Try removing .eth suffix
  const withoutEth = spaceId.replace('.eth', '');
  if (SPACE_TO_TOKEN_ADDRESS[withoutEth]) {
    return SPACE_TO_TOKEN_ADDRESS[withoutEth];
  }

  // No fallback - if we don't know the address, return empty
  return '';
}

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
    refreshVotingPower,
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
            <button
              onClick={refreshVotingPower}
              disabled={vpLoading}
              className="ml-2 p-1 rounded-full hover:bg-zinc-100 transition-colors disabled:opacity-50"
              title="Refresh voting power"
            >
              <RefreshCw size={12} className={`${vpLoading ? 'animate-spin' : ''} text-zinc-400 hover:text-zinc-600`} />
            </button>
          </div>
          {hasNoVP && (
            <div className="text-[10px] text-zinc-500 text-center max-w-sm mx-auto leading-relaxed bg-amber-50 border border-amber-100 rounded-lg p-3 space-y-2">
              <p className="mb-1">
                <span className="font-semibold text-amber-700">Why can't I vote?</span>
              </p>
              <p className="mb-2">
                Snapshot voting uses a <span className="font-bold text-amber-800">historical snapshot</span> from when the proposal was created.
                You need to have owned <span className="font-bold text-amber-800">{getTokenSymbol(spaceId)}</span> tokens <span className="font-bold">at that specific block height</span> to vote.
              </p>
              <p className="text-amber-600 font-semibold mb-2 bg-amber-100 border border-amber-200 rounded px-2 py-1">
                ⚠️ Tokens bought AFTER proposal creation won't count for this vote
              </p>
              <p className="text-[9px] text-zinc-600 mb-2">
                Buy tokens now to vote on <span className="font-semibold">future proposals</span> in this DAO
              </p>
              <div className="flex gap-2 justify-center">
                {getTokenAddress(spaceId) ? (
                  <a
                    href={`https://app.uniswap.org/swap?outputCurrency=${getTokenAddress(spaceId)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold text-xs hover:from-pink-600 hover:to-purple-600 transition-all shadow-sm"
                  >
                    Buy {getTokenSymbol(spaceId)} on Uniswap →
                  </a>
                ) : (
                  <a
                    href={`https://www.google.com/search?q=how+to+buy+${getTokenSymbol(spaceId)}+token`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold text-xs hover:from-pink-600 hover:to-purple-600 transition-all shadow-sm"
                  >
                    Search how to buy {getTokenSymbol(spaceId)} →
                  </a>
                )}
                <a
                  href={`https://app.1inch.io/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold text-xs hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm"
                >
                  1inch DEX →
                </a>
              </div>
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
