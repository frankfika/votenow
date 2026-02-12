/**
 * Hook for on-chain governance voting
 * - Queries current token balance (no snapshot needed!)
 * - Submits votes to Governor contract
 * - Works with Compound Governor, Aave Governor, etc.
 */

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi } from 'viem';

// Governor ABI (standard from OpenZeppelin/Compound)
const GOVERNOR_ABI = parseAbi([
  'function getVotes(address account) view returns (uint256)',
  'function castVote(uint256 proposalId, uint8 support) returns (uint256)',
  'function hasVoted(uint256 proposalId, address account) view returns (bool)',
]);

export interface OnChainVoteState {
  votingPower: bigint | null;
  vpLoading: boolean;
  hasVoted: boolean;
  hasVotedLoading: boolean;
  voting: boolean;
  txHash: string | null;
  error: string | null;
  castVote: (support: number) => Promise<void>;
  refreshVotingPower: () => Promise<void>;
}

export function useOnChainVote(params: {
  governorAddress?: `0x${string}`;
  proposalId?: bigint;
  chainId?: number;
}): OnChainVoteState {
  const { governorAddress, proposalId, chainId } = params;
  const { address, isConnected, chain } = useWallet();

  const [votingPower, setVotingPower] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Check if we're on the right chain
  const isRightChain = chain?.id === chainId;

  // Query voting power (current balance!)
  const { data: vpData, isLoading: vpLoading, refetch: refetchVP } = useReadContract({
    address: governorAddress,
    abi: GOVERNOR_ABI,
    functionName: 'getVotes',
    args: address ? [address] : undefined,
    query: {
      enabled: !!governorAddress && !!address && isConnected && isRightChain,
    },
  });

  // Check if already voted
  const { data: hasVotedData, isLoading: hasVotedLoading } = useReadContract({
    address: governorAddress,
    abi: GOVERNOR_ABI,
    functionName: 'hasVoted',
    args: proposalId && address ? [proposalId, address] : undefined,
    query: {
      enabled: !!governorAddress && !!proposalId && !!address && isConnected && isRightChain,
    },
  });

  // Write contract hook
  const { writeContractAsync, isPending: voting } = useWriteContract();

  // Wait for transaction
  const { isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  });

  useEffect(() => {
    if (vpData !== undefined) {
      setVotingPower(vpData as bigint);
    }
  }, [vpData]);

  const castVote = useCallback(async (support: number) => {
    if (!isConnected || !address) {
      setError('Please connect your wallet to vote');
      return;
    }
    if (!governorAddress) {
      setError('Missing governor contract address');
      return;
    }
    if (!proposalId) {
      setError('Missing on-chain proposal ID');
      return;
    }

    if (!isRightChain) {
      setError(`Please switch to ${chainId ? `chain ${chainId}` : 'the correct chain'}`);
      return;
    }

    setError(null);

    try {
      const hash = await writeContractAsync({
        address: governorAddress,
        abi: GOVERNOR_ABI,
        functionName: 'castVote',
        args: [proposalId, support],
      });

      setTxHash(hash);

      // Record on backend for points
      try {
        await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proposalId: proposalId.toString(),
            direction: support === 1 ? 'For' : support === 0 ? 'Against' : 'Abstain',
            walletAddress: address,
            type: 'onchain',
            txHash: hash,
          }),
        });
      } catch {
        // Non-critical
      }
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes('rejected')) {
        setError('Transaction rejected by user');
      } else {
        setError(err.message || 'Vote failed');
      }
    }
  }, [isConnected, address, governorAddress, proposalId, chainId, isRightChain, writeContractAsync]);

  const refreshVotingPower = useCallback(async () => {
    if (refetchVP) {
      await refetchVP();
    }
  }, [refetchVP]);

  return {
    votingPower,
    vpLoading,
    hasVoted: hasVotedData as boolean || false,
    hasVotedLoading,
    voting,
    txHash,
    error,
    castVote,
    refreshVotingPower,
  };
}
