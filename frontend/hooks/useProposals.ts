import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchProposals } from '../services/api';
import { Proposal, ProposalStatus, ProposalState, isSnapshotProposal } from '../types';

interface UseProposalsReturn {
  proposals: Proposal[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useProposals(dao?: string): UseProposalsReturn {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProposals(dao);
      const mapped: Proposal[] = data.map(mapApiToProposal);
      setProposals(mapped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dao]);

  useEffect(() => {
    load();
  }, [load]);

  return { proposals, loading, error, refresh: load };
}

/**
 * Map API response to Proposal type
 */
function mapApiToProposal(p: any): Proposal {
  const state = mapState(p.state);
  const status = mapStatus(state, p.scores);

  // Common fields
  const title = p.title || 'Untitled';
  const endTime = p.end || p.endTime || Date.now() / 1000;
  const endDate = new Date(endTime * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const base = {
    id: p.id,
    daoId: p.space?.id || p.daoId || 'unknown',
    daoName: p.space?.name || p.daoName || 'Unknown',
    title,
    description: (p.body || p.description || '').slice(0, 200),
    fullContent: p.body || p.description || '',
    state,
    status,
    governanceType: p.governanceType || 'snapshot',
    startTime: p.start || p.startTime || Date.now() / 1000,
    endTime,
    createdAt: p.createdAt || new Date((p.start || p.startTime || Date.now()) * 1000).toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
    displayId: p.id?.slice(0, 8) || p.displayId || 'unknown',
    tags: extractTags(title),
    endDate,
  };

  // OnChain-specific fields
  if (p.source === 'OnChain') {
    return {
      ...base,
      governanceType: 'onchain' as const,
      governorAddress: p.governorAddress || '',
      proposalId: p.proposalId || p.id,
      chainId: p.chainId || 1,
      quorum: p.quorum || 0,
      quorumReached: p.quorumReached || false,
      votesFor: p.votesFor || p.scores?.[0] || 0,
      votesAgainst: p.votesAgainst || p.scores?.[1] || 0,
      votesAbstain: p.votesAbstain || p.scores?.[2] || 0,
    };
  }

  // Snapshot-specific fields (default for source === 'Snapshot' or unknown)
  return {
    ...base,
    governanceType: 'snapshot' as const,
    snapshotId: p.id,
    spaceId: p.space?.id || p.daoId || 'unknown',
    snapshotBlock: String(p.snapshot || ''),
    network: String(p.network || p.snapshotNetwork || '1'),
    choices: p.choices || ['For', 'Against', 'Abstain'],
    scores: p.scores || [0, 0, 0],
    scoresTotal: p.scores_total || p.scoresTotal || 0,
    voteCount: p.votes || p.voteCount || 0,
    type: p.type || 'single-choice',
  };
}

/**
 * Map API state to ProposalState
 */
function mapState(state: string): ProposalState {
  switch (state?.toLowerCase()) {
    case 'active':
      return ProposalState.ACTIVE;
    case 'closed':
      return ProposalState.CLOSED;
    case 'pending':
      return ProposalState.PENDING;
    case 'executed':
      return ProposalState.EXECUTED;
    case 'defeated':
      return ProposalState.DEFEATED;
    case 'queued':
      return ProposalState.QUEUED;
    default:
      return ProposalState.PENDING;
  }
}

/**
 * Map state to ProposalStatus
 */
function mapStatus(state: ProposalState, scores?: number[]): ProposalStatus {
  switch (state) {
    case ProposalState.ACTIVE:
      return ProposalStatus.ACTIVE;
    case ProposalState.PENDING:
      return ProposalStatus.PENDING;
    case ProposalState.CLOSED:
      // Determine if passed based on scores
      if (scores && scores.length >= 2) {
        return scores[0] > scores[1] ? ProposalStatus.PASSED : ProposalStatus.REJECTED;
      }
      return ProposalStatus.REJECTED;
    case ProposalState.EXECUTED:
      return ProposalStatus.EXECUTED;
    case ProposalState.DEFEATED:
      return ProposalStatus.REJECTED;
    default:
      return ProposalStatus.PENDING;
  }
}

/**
 * Extract tags from proposal title
 */
export function extractTags(title: string): string[] {
  const tags: string[] = [];
  const lower = title.toLowerCase();

  const tagMap: [string[], string][] = [
    [['treasury', 'fund', 'budget', 'allocation'], 'Treasury'],
    [['security', 'upgrade', 'patch', 'fix'], 'Security'],
    [['fee', 'reward', 'incentive', 'revenue'], 'Finance'],
    [['governance', 'vote', 'proposal', 'constitution'], 'Governance'],
    [['token', 'airdrop', 'distribution'], 'Tokenomics'],
    [['partnership', 'integration', 'collaboration'], 'Partnership'],
  ];

  for (const [keywords, tag] of tagMap) {
    if (keywords.some(kw => lower.includes(kw))) {
      tags.push(tag);
      if (tags.length >= 3) break;
    }
  }

  if (tags.length === 0) tags.push('Proposal');
  return tags;
}

/**
 * Hook for filtered and sorted proposals
 */
export function useFilteredProposals(
  proposals: Proposal[],
  options: {
    chainFilter?: string;
    daoFilter?: string;
    statusFilter?: ProposalStatus;
    sortBy?: 'newest' | 'endingSoon' | 'mostVotes';
  } = {}
) {
  return useMemo(() => {
    let result = [...proposals];

    // Apply filters
    if (options.chainFilter && options.chainFilter !== 'all') {
      result = result.filter(p => {
        if (isSnapshotProposal(p)) {
          return p.network === options.chainFilter;
        }
        return String(p.chainId) === options.chainFilter;
      });
    }

    if (options.daoFilter && options.daoFilter !== 'all') {
      result = result.filter(p => p.daoId === options.daoFilter || p.daoName === options.daoFilter);
    }

    if (options.statusFilter) {
      result = result.filter(p => p.status === options.statusFilter);
    }

    // Apply sorting
    switch (options.sortBy) {
      case 'endingSoon':
        result.sort((a, b) => a.endTime - b.endTime);
        break;
      case 'mostVotes':
        result.sort((a, b) => {
          const aVotes = isSnapshotProposal(a) ? a.voteCount : (a.votesFor + a.votesAgainst);
          const bVotes = isSnapshotProposal(b) ? b.voteCount : (b.votesFor + b.votesAgainst);
          return bVotes - aVotes;
        });
        break;
      case 'newest':
      default:
        result.sort((a, b) => b.startTime - a.startTime);
    }

    return result;
  }, [proposals, options]);
}
