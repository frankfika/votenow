/**
 * Cloudflare Workers Entry Point for VoteNow API
 *
 * Simplified version without Node.js-specific dependencies
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Activity log (in-memory)
const activityLog: any[] = [];

// CORS - Allow all Cloudflare Pages preview URLs
app.use('*', cors({
  origin: (origin) => {
    // Allow production, localhost, and all Cloudflare Pages preview URLs
    if (!origin) return 'https://votenow-86u.pages.dev';
    if (origin.includes('votenow-86u.pages.dev') || origin.includes('localhost')) {
      return origin;
    }
    return 'https://votenow-86u.pages.dev';
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check
app.get('/api/health', (c) => c.json({
  status: 'ok',
  name: 'VoteNow API',
  framework: 'Hono on Cloudflare Workers',
  version: '1.0.0',
}));

// Proposals endpoint - Real Snapshot data
app.get('/api/proposals', async (c) => {
  try {
    const SNAPSHOT_API = 'https://hub.snapshot.org/graphql';

    // Query for active proposals from all DAOs (no filtering)
    const query = `
      query {
        proposals(
          first: 100,
          skip: 0,
          orderBy: "created",
          orderDirection: desc
        ) {
          id
          title
          body
          choices
          start
          end
          state
          scores
          scores_total
          votes
          type
          network
          snapshot
          space {
            id
            name
          }
        }
      }
    `;

    const response = await fetch(SNAPSHOT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    // Map proposals to our format
    const proposals = (data.data?.proposals || []).map((p: any) => ({
      id: p.id,
      daoId: p.space.id,
      daoName: p.space.name,
      title: p.title,
      body: p.body || '',
      description: p.body || '',
      state: p.state,
      choices: p.choices,
      type: p.type || 'single-choice',
      startTime: p.start,
      endTime: p.end,
      scores: p.scores,
      scoresTotal: p.scores_total,
      voteCount: p.votes,
      network: p.network,
      snapshot: p.snapshot,
      source: 'Snapshot',
    }));

    return c.json({
      total: proposals.length,
      proposals,
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// DAOs list - Extract from real Snapshot data
app.get('/api/daos', async (c) => {
  try {
    const SNAPSHOT_API = 'https://hub.snapshot.org/graphql';

    // Get most active spaces
    const query = `
      query {
        spaces(
          first: 50,
          orderBy: "proposalsCount",
          orderDirection: desc
        ) {
          id
          name
          network
          proposalsCount
        }
      }
    `;

    const response = await fetch(SNAPSHOT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    const spaces = data.data?.spaces || [];

    // Map to our DAO format
    const daos = spaces.map((space: any, index: number) => {
      // Assign tiers based on popularity
      let tier = 5;
      let pointsPerVote = 40;

      if (index < 5) {
        tier = 1;
        pointsPerVote = 100;
      } else if (index < 15) {
        tier = 2;
        pointsPerVote = 80;
      } else if (index < 30) {
        tier = 3;
        pointsPerVote = 60;
      } else if (index < 40) {
        tier = 4;
        pointsPerVote = 50;
      }

      return {
        id: space.id,
        name: space.name,
        chain: space.network || 'ethereum',
        tier,
        pointsPerVote,
        proposalsCount: space.proposalsCount,
        isActive: true,
      };
    });

    return c.json({ total: daos.length, daos });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Rewards - Full catalog
app.get('/api/rewards', (c) => {
  const rewards = [
    // Tokens
    { id: 'reward-usdc-10', name: '10 USDC', description: 'Receive 10 USDC to your wallet', type: 'token', pointsCost: 1000, stock: 100, isActive: true },
    { id: 'reward-usdc-50', name: '50 USDC', description: 'Receive 50 USDC to your wallet', type: 'token', pointsCost: 4500, stock: 50, isActive: true },
    { id: 'reward-arb-5', name: '5 ARB Tokens', description: 'Receive 5 ARB on Arbitrum', type: 'token', pointsCost: 500, stock: 200, isActive: true },

    // NFTs
    { id: 'reward-nft-bronze', name: 'Bronze Governance Badge', description: 'NFT badge for active participants', type: 'nft', pointsCost: 2000, stock: 500, isActive: true },
    { id: 'reward-nft-silver', name: 'Silver Governance Badge', description: 'Rare NFT for dedicated voters', type: 'nft', pointsCost: 5000, stock: 100, isActive: true },
    { id: 'reward-nft-gold', name: 'Gold Governance Badge', description: 'Ultra-rare NFT for legends', type: 'nft', pointsCost: 15000, stock: 20, isActive: true },

    // Benefits
    { id: 'reward-voucher-gas', name: 'Gas Fee Voucher', description: 'Reimbursement for 10 transactions', type: 'voucher', pointsCost: 300, stock: -1, isActive: true },
    { id: 'reward-premium', name: '1 Month Premium', description: 'Unlock advanced analytics', type: 'benefit', pointsCost: 1500, stock: -1, isActive: true },
    { id: 'reward-discount', name: '20% Fee Discount', description: '3 months platform fee discount', type: 'benefit', pointsCost: 800, stock: -1, isActive: true },
  ];

  return c.json({ total: rewards.length, rewards });
});

// AI Analysis (simplified - without OpenAI SDK)
app.post('/api/analysis', async (c) => {
  try {
    const { proposalText } = await c.req.json();

    if (!proposalText) {
      return c.json({ error: 'proposalText required' }, 400);
    }

    const DEEPSEEK_API_KEY = c.env?.DEEPSEEK_API_KEY || '';

    if (!DEEPSEEK_API_KEY) {
      // Fallback mock response
      return c.json({
        summary: "AI analysis unavailable. Configure DEEPSEEK_API_KEY.",
        riskLevel: 'Medium',
        recommendation: 'Abstain',
      });
    }

    // Direct fetch to DeepSeek API (no OpenAI SDK)
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a DAO governance analyst. Respond with valid JSON.',
          },
          {
            role: 'user',
            content: `Analyze this proposal and return JSON with: summary, riskLevel, recommendation.\n\n${proposalText.slice(0, 2000)}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return c.json(JSON.parse(jsonMatch[0]));
    }

    return c.json({
      summary: text.slice(0, 200),
      riskLevel: 'Medium',
      recommendation: 'Abstain',
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Points endpoint
app.get('/api/points/:address', (c) => {
  const address = c.req.param('address');

  return c.json({
    userId: address.toLowerCase(),
    walletAddress: address,
    totalPoints: 0,
    availablePoints: 0,
    level: 1,
    streak: 0,
  });
});

// Vote endpoint
app.post('/api/vote', async (c) => {
  try {
    const { proposalId, walletAddress, choice } = await c.req.json();

    if (!proposalId || !walletAddress) {
      return c.json({ error: 'proposalId and walletAddress required' }, 400);
    }

    // Award points (simplified)
    const points = 100;

    return c.json({
      success: true,
      pointsEarned: points,
      message: `Vote recorded! You earned ${points} points.`,
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Leaderboard
app.get('/api/leaderboard', (c) => {
  return c.json({ leaderboard: [] });
});

// Export for Cloudflare Workers
export default app;
