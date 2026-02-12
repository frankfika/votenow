/**
 * Shared Configuration
 * Single source of truth for DAO configurations, rewards, and API settings
 */

import { DAOConfig, GovernanceType } from './types';

// ============ DAO Configurations ============

export const DAO_CONFIGS: Omit<DAOConfig, 'addedAt'>[] = [
  // Tier 1 - Major DeFi Protocols (High points: 100 per vote)
  {
    id: 'aave.eth',
    name: 'Aave',
    chain: 'ethereum',
    governanceType: GovernanceType.BOTH,
    snapshotSpace: 'aave.eth',
    governorAddress: '0xEC568fffba86c094cf06b22134B23074DFE2252c',
    tokenAddress: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    tier: 1,
    pointsPerVote: 100,
    isActive: true,
    metadata: {
      website: 'https://aave.com',
      description: 'Leading DeFi lending protocol',
      logo: 'https://cryptologos.cc/logos/aave-aave-logo.png',
      socials: {
        twitter: 'https://twitter.com/aave',
        discord: 'https://discord.gg/aave',
        forum: 'https://governance.aave.com',
      },
    },
    supportedChains: [1, 137, 42161],
  },
  {
    id: 'uniswapgovernance.eth',
    name: 'Uniswap',
    chain: 'ethereum',
    governanceType: GovernanceType.BOTH,
    snapshotSpace: 'uniswapgovernance.eth',
    governorAddress: '0x408ED6354d4973f66138C91495F2f2FCbd8724C3',
    tokenAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    tier: 1,
    pointsPerVote: 100,
    isActive: true,
    metadata: {
      website: 'https://uniswap.org',
      description: 'Leading decentralized exchange protocol',
      logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
      socials: {
        twitter: 'https://twitter.com/Uniswap',
        discord: 'https://discord.gg/uniswap',
        forum: 'https://gov.uniswap.org',
      },
    },
    supportedChains: [1, 137, 42161, 10],
  },
  {
    id: 'curve-dao.eth',
    name: 'Curve DAO',
    chain: 'ethereum',
    governanceType: GovernanceType.BOTH,
    snapshotSpace: 'curve-dao.eth',
    tokenAddress: '0xD533a949740bb3306d119CC777fa900bA034cd52', // CRV
    tier: 1,
    pointsPerVote: 100,
    isActive: true,
    metadata: {
      website: 'https://curve.fi',
      description: 'DEX optimized for stablecoin trading',
      logo: 'https://cryptologos.cc/logos/curve-dao-crv-logo.png',
      socials: {
        twitter: 'https://twitter.com/CurveFinance',
      },
    },
    supportedChains: [1, 137],
  },
  {
    id: 'compound-community.eth',
    name: 'Compound',
    chain: 'ethereum',
    governanceType: GovernanceType.BOTH,
    snapshotSpace: 'compound-community.eth',
    governorAddress: '0xc0Da02939E1441F497fd74F78cE7Decb17B66529',
    tokenAddress: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    tier: 1,
    pointsPerVote: 100,
    isActive: true,
    metadata: {
      website: 'https://compound.finance',
      description: 'Autonomous interest rate protocol',
      logo: 'https://cryptologos.cc/logos/compound-comp-logo.png',
      socials: {
        twitter: 'https://twitter.com/compoundfinance',
        discord: 'https://discord.gg/compound',
        forum: 'https://www.comp.xyz',
      },
    },
    supportedChains: [1],
  },

  // Tier 2 - L2 & Infrastructure (Medium-High points: 80 per vote)
  {
    id: 'arbitrumfoundation.eth',
    name: 'Arbitrum DAO',
    chain: 'arbitrum',
    governanceType: GovernanceType.BOTH,
    snapshotSpace: 'arbitrumfoundation.eth',
    governorAddress: '0xf07DeD9dC292157749B6Fd268E37DF6EA38395B9',
    tokenAddress: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    tier: 2,
    pointsPerVote: 80,
    isActive: true,
    metadata: {
      website: 'https://arbitrum.io',
      description: 'Leading Ethereum L2 scaling solution',
      logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
      socials: {
        twitter: 'https://twitter.com/arbitrum',
        discord: 'https://discord.gg/arbitrum',
        forum: 'https://forum.arbitrum.foundation',
      },
    },
    supportedChains: [42161],
  },
  {
    id: 'optimismgov.eth',
    name: 'Optimism',
    chain: 'optimism',
    governanceType: GovernanceType.BOTH,
    snapshotSpace: 'optimismgov.eth',
    tokenAddress: '0x4200000000000000000000000000000000000042',
    tier: 2,
    pointsPerVote: 80,
    isActive: true,
    metadata: {
      website: 'https://optimism.io',
      description: 'Ethereum L2 scaling with retroactive public goods funding',
      logo: 'https://cryptologos.cc/logos/optimism-op-logo.png',
      socials: {
        twitter: 'https://twitter.com/optimism',
        discord: 'https://discord.gg/optimism',
      },
    },
    supportedChains: [10],
  },
  {
    id: 'stgdao.eth',
    name: 'Stargate',
    chain: 'ethereum',
    governanceType: GovernanceType.SNAPSHOT,
    snapshotSpace: 'stgdao.eth',
    tokenAddress: '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6',
    tier: 2,
    pointsPerVote: 80,
    isActive: true,
    metadata: {
      website: 'https://stargate.finance',
      description: 'Omnichain liquidity transport protocol',
      logo: 'https://cryptologos.cc/logos/stargate-finance-stg-logo.png',
      socials: {
        twitter: 'https://twitter.com/StargateFinance',
      },
    },
    supportedChains: [1, 42161, 10, 137, 56],
  },
  {
    id: 'polygonfoundation.eth',
    name: 'Polygon',
    chain: 'polygon',
    governanceType: GovernanceType.SNAPSHOT,
    snapshotSpace: 'polygonfoundation.eth',
    tokenAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', // MATIC
    tier: 2,
    pointsPerVote: 80,
    isActive: true,
    metadata: {
      website: 'https://polygon.technology',
      description: 'Ethereum scaling and infrastructure platform',
      logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
      socials: {
        twitter: 'https://twitter.com/0xPolygon',
      },
    },
    supportedChains: [137],
  },

  // Tier 3 - Established DeFi (Medium points: 60 per vote)
  {
    id: 'lido-snapshot.eth',
    name: 'Lido',
    chain: 'ethereum',
    governanceType: GovernanceType.BOTH,
    snapshotSpace: 'lido-snapshot.eth',
    tokenAddress: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32', // LDO
    tier: 3,
    pointsPerVote: 60,
    isActive: true,
    metadata: {
      website: 'https://lido.fi',
      description: 'Leading liquid staking protocol',
      logo: 'https://cryptologos.cc/logos/lido-dao-ldo-logo.png',
      socials: {
        twitter: 'https://twitter.com/lidofinance',
        discord: 'https://discord.gg/lido',
      },
    },
    supportedChains: [1],
  },
  {
    id: 'balancer.eth',
    name: 'Balancer',
    chain: 'ethereum',
    governanceType: GovernanceType.SNAPSHOT,
    snapshotSpace: 'balancer.eth',
    tokenAddress: '0xba100000625a3754423978a60c9317c58a424e3D',
    tier: 3,
    pointsPerVote: 60,
    isActive: true,
    metadata: {
      website: 'https://balancer.fi',
      description: 'Automated portfolio manager and liquidity provider',
      logo: 'https://cryptologos.cc/logos/balancer-bal-logo.png',
      socials: {
        twitter: 'https://twitter.com/Balancer',
      },
    },
    supportedChains: [1, 137, 42161],
  },
  {
    id: 'sushigov.eth',
    name: 'SushiSwap',
    chain: 'ethereum',
    governanceType: GovernanceType.SNAPSHOT,
    snapshotSpace: 'sushigov.eth',
    tokenAddress: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
    tier: 3,
    pointsPerVote: 60,
    isActive: true,
    metadata: {
      website: 'https://sushi.com',
      description: 'Community-driven DEX and DeFi platform',
      logo: 'https://cryptologos.cc/logos/sushiswap-sushi-logo.png',
      socials: {
        twitter: 'https://twitter.com/SushiSwap',
      },
    },
    supportedChains: [1, 137, 42161],
  },
  {
    id: '1inch.eth',
    name: '1inch',
    chain: 'ethereum',
    governanceType: GovernanceType.SNAPSHOT,
    snapshotSpace: '1inch.eth',
    tokenAddress: '0x111111111117dC0aa78b770fA6A738034120C302',
    tier: 3,
    pointsPerVote: 60,
    isActive: true,
    metadata: {
      website: 'https://1inch.io',
      description: 'DEX aggregator',
      logo: 'https://cryptologos.cc/logos/1inch-1inch-logo.png',
      socials: {
        twitter: 'https://twitter.com/1inch',
      },
    },
    supportedChains: [1, 137, 42161],
  },

  // Tier 4 - Infrastructure & Tools (Medium points: 60 per vote)
  {
    id: 'ens.eth',
    name: 'ENS',
    chain: 'ethereum',
    governanceType: GovernanceType.BOTH,
    snapshotSpace: 'ens.eth',
    tokenAddress: '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',
    tier: 4,
    pointsPerVote: 60,
    isActive: true,
    metadata: {
      website: 'https://ens.domains',
      description: 'Ethereum Name Service',
      logo: 'https://cryptologos.cc/logos/ethereum-name-service-ens-logo.png',
      socials: {
        twitter: 'https://twitter.com/ensdomains',
      },
    },
    supportedChains: [1],
  },
  {
    id: 'safe.eth',
    name: 'Safe',
    chain: 'ethereum',
    governanceType: GovernanceType.SNAPSHOT,
    snapshotSpace: 'safe.eth',
    tokenAddress: '0x5aFE3855358E112B5647B952709E6165e1c1eEEe',
    tier: 4,
    pointsPerVote: 60,
    isActive: true,
    metadata: {
      website: 'https://safe.global',
      description: 'Smart contract wallet infrastructure',
      logo: 'https://cryptologos.cc/logos/safe-safe-logo.png',
      socials: {
        twitter: 'https://twitter.com/safe',
      },
    },
    supportedChains: [1, 137, 42161],
  },
  {
    id: 'gitcoindao.eth',
    name: 'Gitcoin',
    chain: 'ethereum',
    governanceType: GovernanceType.SNAPSHOT,
    snapshotSpace: 'gitcoindao.eth',
    tokenAddress: '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F',
    tier: 4,
    pointsPerVote: 60,
    isActive: true,
    metadata: {
      website: 'https://gitcoin.co',
      description: 'Public goods funding platform',
      logo: 'https://cryptologos.cc/logos/gitcoin-gtc-logo.png',
      socials: {
        twitter: 'https://twitter.com/gitcoin',
      },
    },
    supportedChains: [1],
  },
  {
    id: 'thegraph.eth',
    name: 'The Graph',
    chain: 'ethereum',
    governanceType: GovernanceType.SNAPSHOT,
    snapshotSpace: 'thegraph.eth',
    tokenAddress: '0xc944E90C64B2c07662A292be6244BDf05Cda44a7',
    tier: 4,
    pointsPerVote: 60,
    isActive: true,
    metadata: {
      website: 'https://thegraph.com',
      description: 'Decentralized indexing protocol',
      logo: 'https://cryptologos.cc/logos/the-graph-grt-logo.png',
      socials: {
        twitter: 'https://twitter.com/graphprotocol',
      },
    },
    supportedChains: [1, 137, 42161],
  },

  // Tier 5 - Emerging & Community (Lower points: 40 per vote)
  {
    id: 'paraswap-dao.eth',
    name: 'ParaSwap',
    chain: 'ethereum',
    governanceType: GovernanceType.SNAPSHOT,
    snapshotSpace: 'paraswap-dao.eth',
    tokenAddress: '0xcAfE001067cDEF266AfB7Eb5A286dCFD277f3dE5',
    tier: 5,
    pointsPerVote: 40,
    isActive: true,
    metadata: {
      website: 'https://paraswap.io',
      description: 'DEX aggregator with governance',
      logo: 'https://cryptologos.cc/logos/paraswap-psp-logo.png',
    },
    supportedChains: [1, 137],
  },
  {
    id: 'olympusdao.eth',
    name: 'Olympus DAO',
    chain: 'ethereum',
    governanceType: GovernanceType.SNAPSHOT,
    snapshotSpace: 'olympusdao.eth',
    tokenAddress: '0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5',
    tier: 5,
    pointsPerVote: 40,
    isActive: true,
    metadata: {
      website: 'https://olympusdao.finance',
      description: 'Decentralized reserve currency protocol',
      logo: 'https://cryptologos.cc/logos/olympus-ohm-logo.png',
    },
    supportedChains: [1],
  },
  {
    id: 'apecoin.eth',
    name: 'ApeCoin DAO',
    chain: 'ethereum',
    governanceType: GovernanceType.SNAPSHOT,
    snapshotSpace: 'apecoin.eth',
    tokenAddress: '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
    tier: 5,
    pointsPerVote: 40,
    isActive: true,
    metadata: {
      website: 'https://apecoin.com',
      description: 'Community token for Bored Ape ecosystem',
      logo: 'https://cryptologos.cc/logos/apecoin-ape-logo.png',
      socials: {
        twitter: 'https://twitter.com/apecoin',
      },
    },
    supportedChains: [1],
  },
];

// ============ Helper Functions ============

export function getTrackedSpaceIds(): string[] {
  return DAO_CONFIGS
    .filter(dao => dao.snapshotSpace)
    .map(dao => dao.snapshotSpace!);
}

export function getDAOBySpaceId(spaceId: string): typeof DAO_CONFIGS[0] | undefined {
  return DAO_CONFIGS.find(dao => dao.snapshotSpace === spaceId);
}

export function getDAOById(id: string): typeof DAO_CONFIGS[0] | undefined {
  return DAO_CONFIGS.find(dao => dao.id === id);
}

export function getPointsForDAO(spaceId: string): number {
  const dao = getDAOBySpaceId(spaceId);
  return dao?.pointsPerVote || 20; // Default 20 points
}

export function getDAOTier(spaceId: string): { tier: number; points: number; name: string } {
  const dao = getDAOBySpaceId(spaceId);
  const points = dao?.pointsPerVote || 20;
  let tier = 5;
  let tierName = 'Emerging';

  if (points >= 100) {
    tier = 1;
    tierName = 'Major DeFi';
  } else if (points >= 80) {
    tier = 2;
    tierName = 'L2 & Infrastructure';
  } else if (points >= 60) {
    tier = dao?.tier || 3;
    tierName = tier === 4 ? 'Infrastructure & Tools' : 'Established DeFi';
  }

  return { tier, points, name: tierName };
}

// ============ API Configuration ============

export const API_CONFIG = {
  SNAPSHOT_GRAPHQL_URL: 'https://hub.snapshot.org/graphql',
  SNAPSHOT_SEQUENCER_URL: 'https://seq.snapshot.org',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// ============ Chain Configuration ============

export const CHAIN_CONFIG: Record<number, { name: string; shortName: string; color: string }> = {
  1: { name: 'Ethereum', shortName: 'ETH', color: '#627EEA' },
  137: { name: 'Polygon', shortName: 'MATIC', color: '#8247E5' },
  42161: { name: 'Arbitrum', shortName: 'ARB', color: '#28A0F0' },
  10: { name: 'Optimism', shortName: 'OP', color: '#FF0420' },
  56: { name: 'BNB Chain', shortName: 'BNB', color: '#F3BA2F' },
  8453: { name: 'Base', shortName: 'BASE', color: '#0052FF' },
  324: { name: 'zkSync', shortName: 'ZKS', color: '#8C8DFC' },
};

export function getChainName(chainId: string | number): string {
  const id = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;
  return CHAIN_CONFIG[id]?.name || `Chain ${chainId}`;
}

export function getChainColor(chainId: string | number): string {
  const id = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;
  return CHAIN_CONFIG[id]?.color || '#6366F1';
}

// ============ Block Explorer Configuration ============

export const EXPLORER_URLS: Record<number, { name: string; url: string }> = {
  1: { name: 'Etherscan', url: 'https://etherscan.io' },
  137: { name: 'PolygonScan', url: 'https://polygonscan.com' },
  42161: { name: 'Arbiscan', url: 'https://arbiscan.io' },
  10: { name: 'Optimistic Etherscan', url: 'https://optimistic.etherscan.io' },
  56: { name: 'BscScan', url: 'https://bscscan.com' },
  8453: { name: 'Basescan', url: 'https://basescan.org' },
  324: { name: 'zkSync Explorer', url: 'https://explorer.zksync.io' },
};

export function getExplorerUrl(chainId: number): string {
  return EXPLORER_URLS[chainId]?.url || 'https://etherscan.io';
}

// ============ AI Configuration ============

export const AI_CONFIG = {
  DEFAULT_MODEL: 'deepseek-chat',
  DEFAULT_TEMPERATURE: 0.3,
  DEFAULT_MAX_TOKENS: 1500,
  CHAT_TEMPERATURE: 0.5,
  CHAT_MAX_TOKENS: 800,
  TIMEOUT_MS: 60000,
  RETRY_ATTEMPTS: 2,
};
