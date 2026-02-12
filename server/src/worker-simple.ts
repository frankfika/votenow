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

// CORS
app.use('*', cors({
  origin: ['https://votenow-86u.pages.dev', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type'],
}));

// Health check
app.get('/api/health', (c) => c.json({
  status: 'ok',
  name: 'VoteNow API',
  framework: 'Hono on Cloudflare Workers',
  version: '1.0.0',
}));

// Proposals endpoint with full DAO list
app.get('/api/proposals', async (c) => {
  try {
    const SNAPSHOT_API = 'https://hub.snapshot.org/graphql';

    const TRACKED_SPACES = [
      'aave.eth', 'uniswapgovernance.eth', 'curve-dao.eth', 'compoundgrants.eth',
      'arbitrumfoundation.eth', 'optimismgov.eth', 'stgdao.eth', 'polygonfoundation.eth',
      'lido-snapshot.eth', 'balancer.eth', 'sushigov.eth', 'hop.eth', '1inch.eth',
      'ens.eth', 'safe.eth', 'gitcoindao.eth', 'thegraph.eth',
      'paraswap-dao.eth', 'olympusdao.eth', 'apecoin.eth'
    ];

    const query = `
      query {
        proposals(
          first: 50,
          skip: 0,
          where: {
            space_in: ${JSON.stringify(TRACKED_SPACES)}
          },
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

    return c.json({
      total: data.data?.proposals?.length || 0,
      proposals: data.data?.proposals || []
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// DAOs list - Full 20 DAOs
app.get('/api/daos', (c) => {
  const daos = [
    // Tier 1 - Major DeFi (100 pts)
    { id: 'aave.eth', name: 'Aave', chain: 'ethereum', tier: 1, pointsPerVote: 100, isActive: true },
    { id: 'uniswapgovernance.eth', name: 'Uniswap', chain: 'ethereum', tier: 1, pointsPerVote: 100, isActive: true },
    { id: 'curve-dao.eth', name: 'Curve DAO', chain: 'ethereum', tier: 1, pointsPerVote: 100, isActive: true },
    { id: 'compoundgrants.eth', name: 'Compound', chain: 'ethereum', tier: 1, pointsPerVote: 100, isActive: true },

    // Tier 2 - L2 & Infrastructure (80 pts)
    { id: 'arbitrumfoundation.eth', name: 'Arbitrum DAO', chain: 'arbitrum', tier: 2, pointsPerVote: 80, isActive: true },
    { id: 'optimismgov.eth', name: 'Optimism', chain: 'optimism', tier: 2, pointsPerVote: 80, isActive: true },
    { id: 'stgdao.eth', name: 'Stargate', chain: 'ethereum', tier: 2, pointsPerVote: 80, isActive: true },
    { id: 'polygonfoundation.eth', name: 'Polygon', chain: 'polygon', tier: 2, pointsPerVote: 80, isActive: true },

    // Tier 3 - DeFi & Liquidity (60 pts)
    { id: 'lido-snapshot.eth', name: 'Lido', chain: 'ethereum', tier: 3, pointsPerVote: 60, isActive: true },
    { id: 'balancer.eth', name: 'Balancer', chain: 'ethereum', tier: 3, pointsPerVote: 60, isActive: true },
    { id: 'sushigov.eth', name: 'SushiSwap', chain: 'ethereum', tier: 3, pointsPerVote: 60, isActive: true },
    { id: 'hop.eth', name: 'Hop Protocol', chain: 'ethereum', tier: 3, pointsPerVote: 60, isActive: true },
    { id: '1inch.eth', name: '1inch', chain: 'ethereum', tier: 3, pointsPerVote: 60, isActive: true },

    // Tier 4 - Infrastructure & Tools (60 pts)
    { id: 'ens.eth', name: 'ENS', chain: 'ethereum', tier: 4, pointsPerVote: 60, isActive: true },
    { id: 'safe.eth', name: 'Safe', chain: 'ethereum', tier: 4, pointsPerVote: 60, isActive: true },
    { id: 'gitcoindao.eth', name: 'Gitcoin', chain: 'ethereum', tier: 4, pointsPerVote: 60, isActive: true },
    { id: 'thegraph.eth', name: 'The Graph', chain: 'ethereum', tier: 4, pointsPerVote: 60, isActive: true },

    // Tier 5 - Emerging (40 pts)
    { id: 'paraswap-dao.eth', name: 'ParaSwap', chain: 'ethereum', tier: 5, pointsPerVote: 40, isActive: true },
    { id: 'olympusdao.eth', name: 'Olympus DAO', chain: 'ethereum', tier: 5, pointsPerVote: 40, isActive: true },
    { id: 'apecoin.eth', name: 'ApeCoin DAO', chain: 'ethereum', tier: 5, pointsPerVote: 40, isActive: true },
  ];

  return c.json({ total: daos.length, daos });
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
