import { useState, useEffect, useCallback } from 'react';
import { fetchProposals } from '../services/api';
import { Proposal, ProposalStatus } from '../types';

export function useProposals(dao?: string) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProposals(dao);
      // Map Snapshot API response to our Proposal type
      const mapped: Proposal[] = data.map((p: any) => ({
        id: p.id,
        snapshotId: p.id,
        displayId: p.id?.slice(0, 8) || p.id,
        daoName: p.space?.name || p.daoName || 'Unknown',
        source: 'Snapshot' as const,
        title: p.title || 'Untitled',
        description: (p.description || p.body || '').slice(0, 200),
        fullContent: p.description || p.body || '',
        status: p.state === 'active' ? ProposalStatus.ACTIVE
          : p.state === 'closed' ? ProposalStatus.PASSED
          : p.status || ProposalStatus.PENDING,
        endDate: p.end ? new Date(p.end * 1000).toISOString().split('T')[0]
          : p.endTime ? new Date(p.endTime * 1000).toISOString().split('T')[0]
          : p.endDate || '',
        votesFor: p.scores?.[0] || p.votesFor || 0,
        votesAgainst: p.scores?.[1] || p.votesAgainst || 0,
        participationRate: p.votes || p.participationRate || 0,
        tags: p.tags || extractTags(p.title || ''),
        // Snapshot-specific fields for voting
        spaceId: p.space?.id || p.daoId,
        snapshotNetwork: p.network,
        choices: p.choices,
        snapshot: p.snapshot,
        type: p.type,
      }));
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

function extractTags(title: string): string[] {
  const tags: string[] = [];
  const lower = title.toLowerCase();
  if (lower.includes('treasury') || lower.includes('fund')) tags.push('Treasury');
  if (lower.includes('security') || lower.includes('upgrade')) tags.push('Security');
  if (lower.includes('fee') || lower.includes('reward')) tags.push('Finance');
  if (lower.includes('governance') || lower.includes('vote')) tags.push('Governance');
  if (tags.length === 0) tags.push('Proposal');
  return tags;
}
