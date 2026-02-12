/**
 * Hook for managing Snapshot voting lifecycle:
 * - Auto-queries voting power on mount
 * - Checks if user has already voted
 * - Provides castVote() for real EIP-712 signing
 * - Records vote on backend for points
 */

import { useState, useEffect, useCallback } from 'react';
import { castSnapshotVote, getVotingPower, getExistingVote } from '../services/snapshot';
import { useWallet } from './useWallet';

export interface SnapshotVoteState {
  votingPower: number | null;
  vpLoading: boolean;
  existingVote: { id: string; choice: number; created: number; vp: number } | null;
  existingVoteLoading: boolean;
  voting: boolean;
  receipt: { id: string; ipfs: string } | null;
  pointsEarned: number | null;
  error: string | null;
  castVote: (choiceIndex: number, reason?: string) => Promise<void>;
  reset: () => void;
  refreshVotingPower: () => Promise<void>;
}

export function useSnapshotVote(params: {
  space?: string;
  proposal?: string;
  proposalType?: string;
}): SnapshotVoteState {
  const { space, proposal, proposalType } = params;
  const { address, isConnected } = useWallet();

  const [votingPower, setVotingPower] = useState<number | null>(null);
  const [vpLoading, setVpLoading] = useState(!!(isConnected && address && space && proposal));
  const [existingVote, setExistingVote] = useState<{ id: string; choice: number; created: number; vp: number } | null>(null);
  const [existingVoteLoading, setExistingVoteLoading] = useState(!!(isConnected && address && proposal));
  const [voting, setVoting] = useState(false);
  const [receipt, setReceipt] = useState<{ id: string; ipfs: string } | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch voting power when connected
  useEffect(() => {
    if (!isConnected || !address || !space || !proposal) {
      setVotingPower(null);
      return;
    }

    let cancelled = false;
    setVpLoading(true);

    getVotingPower({ address, space, proposal })
      .then((result) => {
        if (!cancelled) {
          setVotingPower(result.vp);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to fetch voting power:', err);
          setVotingPower(0);
        }
      })
      .finally(() => {
        if (!cancelled) setVpLoading(false);
      });

    return () => { cancelled = true; };
  }, [isConnected, address, space, proposal]);

  // Check existing vote
  useEffect(() => {
    if (!isConnected || !address || !proposal) {
      setExistingVote(null);
      return;
    }

    let cancelled = false;
    setExistingVoteLoading(true);

    getExistingVote({ proposal, voter: address })
      .then((vote) => {
        if (!cancelled) setExistingVote(vote);
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to check existing vote:', err);
      })
      .finally(() => {
        if (!cancelled) setExistingVoteLoading(false);
      });

    return () => { cancelled = true; };
  }, [isConnected, address, proposal]);

  const castVote = useCallback(async (choiceIndex: number, reason?: string) => {
    if (!isConnected || !address) {
      setError('Please connect your wallet to vote');
      return;
    }
    if (!space) {
      setError('Missing Snapshot space configuration');
      return;
    }
    if (!proposal) {
      setError('Missing proposal ID');
      return;
    }

    setVoting(true);
    setError(null);
    setPointsEarned(null);

    try {
      // Real EIP-712 signing via MetaMask
      const voteReceipt = await castSnapshotVote({
        space,
        proposal,
        type: proposalType || 'single-choice',
        choice: choiceIndex,
        reason,
        account: address,
      });

      setReceipt(voteReceipt);

      // Record on backend for points
      try {
        const res = await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proposalId: proposal,
            direction: choiceIndex === 1 ? 'For' : choiceIndex === 2 ? 'Against' : 'Abstain',
            walletAddress: address,
            type: 'snapshot',
            snapshotReceipt: voteReceipt,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.points?.amount) {
            setPointsEarned(data.points.amount);
          }
        }
      } catch {
        // Points recording failure is non-critical
      }

      // Update existing vote state
      setExistingVote({
        id: voteReceipt.id,
        choice: choiceIndex,
        created: Math.floor(Date.now() / 1000),
        vp: votingPower ?? 0,
      });
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes('rejected')) {
        setError('Signature rejected by user');
      } else {
        setError(err.message || 'Vote failed');
      }
    } finally {
      setVoting(false);
    }
  }, [isConnected, address, space, proposal, proposalType, votingPower]);

  const reset = useCallback(() => {
    setError(null);
    setReceipt(null);
    setPointsEarned(null);
  }, []);

  const refreshVotingPower = useCallback(async () => {
    if (!isConnected || !address || !space || !proposal) {
      return;
    }

    setVpLoading(true);
    try {
      const result = await getVotingPower({ address, space, proposal });
      setVotingPower(result.vp);
    } catch (err) {
      console.error('Failed to refresh voting power:', err);
    } finally {
      setVpLoading(false);
    }
  }, [isConnected, address, space, proposal]);

  return {
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
  };
}
