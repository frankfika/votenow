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

// Mock proposals endpoint (replace with actual Snapshot integration)
app.get('/api/proposals', async (c) => {
  try {
    const SNAPSHOT_API = 'https://hub.snapshot.org/graphql';

    const query = `
      query {
        proposals(
          first: 20,
          skip: 0,
          where: {
            space_in: ["aave.eth", "uniswapgovernance.eth", "arbitrumfoundation.eth"],
            state: "active"
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

// DAOs list
app.get('/api/daos', (c) => {
  const daos = [
    {
      id: 'aave.eth',
      name: 'Aave',
      chain: 'ethereum',
      tier: 1,
      pointsPerVote: 100,
      isActive: true,
    },
    {
      id: 'uniswapgovernance.eth',
      name: 'Uniswap',
      chain: 'ethereum',
      tier: 1,
      pointsPerVote: 100,
      isActive: true,
    },
    {
      id: 'arbitrumfoundation.eth',
      name: 'Arbitrum DAO',
      chain: 'arbitrum',
      tier: 2,
      pointsPerVote: 80,
      isActive: true,
    },
  ];

  return c.json({ total: daos.length, daos });
});

// Rewards
app.get('/api/rewards', (c) => {
  const rewards = [
    {
      id: 'reward-usdc-10',
      name: '10 USDC',
      type: 'token',
      pointsCost: 1000,
      stock: 100,
    },
    {
      id: 'reward-arb-5',
      name: '5 ARB Tokens',
      type: 'token',
      pointsCost: 500,
      stock: 200,
    },
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
