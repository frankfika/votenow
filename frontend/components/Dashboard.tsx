import React, { useState, useEffect } from 'react';
import { Proposal } from '../types';
import { ArrowUpRight, Check, Flame, Box, ShieldCheck, Activity, Sparkles, Inbox, HelpCircle, Wallet, Vote, Filter } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import PointsPanel from './PointsPanel';
import Leaderboard from './Leaderboard';
import { useWallet } from '../hooks/useWallet';
import WalletConnect from './WalletConnect';

interface DashboardProps {
  proposals: Proposal[];
  onSelectProposal: (proposal: Proposal) => void;
  onChangeView?: (view: string) => void;
}

// Animated Number Component
const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }: { end: number, duration?: number, prefix?: string, suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Easing function (easeOutExpo)
      const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);

      setCount(Math.floor(end * ease));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{prefix}{count.toLocaleString()}{suffix}</>;
};

const CHAIN_FILTERS = [
  { id: 'all', label: 'All' },
  { id: '1', label: 'Ethereum' },
  { id: '42161', label: 'Arbitrum' },
  { id: '10', label: 'Optimism' },
  { id: '137', label: 'Polygon' },
];

const Dashboard: React.FC<DashboardProps> = ({ proposals, onSelectProposal, onChangeView }) => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [chainFilter, setChainFilter] = useState('all');
  const [daoFilter, setDaoFilter] = useState('all');
  const { isConnected } = useWallet();

  // Get unique DAOs for filter
  const uniqueDAOsList = Array.from(new Set(proposals.map(p => p.daoName))).sort();

  // Filter proposals
  const filteredProposals = proposals.filter(p => {
    const chainMatch = chainFilter === 'all' || p.snapshotNetwork === chainFilter;
    const daoMatch = daoFilter === 'all' || p.daoName === daoFilter;
    return chainMatch && daoMatch;
  });

  // Compute dynamic stats from filtered proposals
  const uniqueDAOs = new Set(filteredProposals.map(p => p.daoName)).size;
  const totalVotes = filteredProposals.reduce((sum, p) => sum + p.votesFor + p.votesAgainst, 0);
  const activeProposals = filteredProposals.length;
  const queueCount = Math.max(0, filteredProposals.length - 1);

  // Generate activity data from proposals
  const activityData = filteredProposals.length > 0
    ? filteredProposals.slice(0, 7).map((p, i) => ({
        name: p.daoName.slice(0, 3),
        value: p.votesFor + p.votesAgainst,
      }))
    : [
        { name: '-', value: 0 },
        { name: '-', value: 0 },
        { name: '-', value: 0 },
      ];

  const firstProposal = filteredProposals[0];
  const isDismissed = firstProposal ? dismissedIds.has(firstProposal.id) : true;

  const handleDismiss = () => {
    if (firstProposal) {
      setDismissedIds(prev => new Set(prev).add(firstProposal.id));
    }
  };

  // Get the next non-dismissed proposal for the hero card
  const heroProposal = filteredProposals.find(p => !dismissedIds.has(p.id));

  return (
    <div className="space-y-8">

      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
         <div className="animate-in slide-in-from-left-4 fade-in duration-700">
            <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
               Good morning, <br className="hidden md:block"/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 animate-shimmer bg-[length:200%_100%]">Commander.</span>
            </h1>
         </div>
         <div className="flex items-center gap-3 animate-in slide-in-from-right-4 fade-in duration-700 delay-100">
             <div className="px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-white/60 shadow-sm flex items-center gap-2 text-sm font-semibold text-zinc-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Nominal
             </div>
             <div className="px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-white/60 shadow-sm text-sm font-semibold text-zinc-600">
                {activeProposals} Active
             </div>
         </div>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-gradient-to-r from-indigo-50 via-violet-50 to-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-sm animate-in fade-in duration-700 delay-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500 rounded-2xl">
            <HelpCircle size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-zinc-900 mb-2">How VoteNow Works</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-700 mb-1">Browse Proposals</p>
                  <p className="text-xs text-zinc-500">View real governance proposals from 50+ DAOs, aggregated from Snapshot</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-violet-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-700 mb-1">Get AI Analysis</p>
                  <p className="text-xs text-zinc-500">Click any proposal to see AI-powered risk analysis and voting recommendations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-700 mb-1">Vote & Earn Points</p>
                  <p className="text-xs text-zinc-500">If you hold the DAO's tokens, vote directly and earn rewards</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-600 bg-white/60 rounded-lg px-3 py-2 border border-indigo-100">
              <strong>Note:</strong> To vote, you need governance tokens from the specific DAO.
              Don't have tokens? <a href="https://www.google.com/search?q=how+to+buy+DAO+governance+tokens" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline font-semibold">Learn how to get started →</a>
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={14} className="text-zinc-500" />
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Filter by Network</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CHAIN_FILTERS.map(chain => (
              <button
                key={chain.id}
                onClick={() => setChainFilter(chain.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  chainFilter === chain.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white/70 text-zinc-600 hover:bg-white border border-zinc-200'
                }`}
              >
                {chain.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={14} className="text-zinc-500" />
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Filter by DAO</span>
          </div>
          <div className="relative">
            <select
              value={daoFilter}
              onChange={(e) => setDaoFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-xl text-sm font-semibold bg-white/70 border border-zinc-200 hover:bg-white transition-all appearance-none pr-10"
            >
              <option value="all">All DAOs ({uniqueDAOsList.length})</option>
              {uniqueDAOsList.map(dao => (
                <option key={dao} value={dao}>{dao}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-5 auto-rows-[minmax(180px,auto)]">

         {/* 1. Large Hero Card: Platform Stats */}
         <div className="col-span-1 md:col-span-2 row-span-2 bg-zinc-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-xl transition-all hover:scale-[1.01] duration-500 hover:shadow-2xl">
            {/* Subtle Gradient Mesh */}
            <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] bg-indigo-600/30 rounded-full blur-[100px] group-hover:bg-indigo-600/40 transition-colors duration-500"></div>
            <div className="absolute bottom-[-50%] left-[-50%] w-[100%] h-[100%] bg-violet-600/20 rounded-full blur-[100px] group-hover:bg-violet-600/30 transition-colors duration-500"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
               <div className="flex justify-between items-start">
                  <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 shadow-inner-light">
                     Total Votes Tracked
                  </div>
                  <div className="p-3 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 group-hover:rotate-12 transition-transform duration-500">
                     <ShieldCheck size={24} className="text-zinc-300 group-hover:text-white transition-colors" />
                  </div>
               </div>

               <div>
                  <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-4 tabular-nums">
                     <AnimatedCounter end={totalVotes} />
                  </h2>
                  <div className="flex items-center gap-4">
                     <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 backdrop-blur-md border border-emerald-500/10">
                        <ArrowUpRight size={16} /> {activeProposals} proposals
                     </span>
                     <span className="text-zinc-400 font-medium tracking-wide">across {uniqueDAOs} DAOs</span>
                  </div>
               </div>
            </div>
         </div>

         {/* 2. Participation Chart (Small) */}
         <div className="col-span-1 md:col-span-2 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden">
            <div className="flex justify-between items-center mb-2 relative z-10">
               <h3 className="font-bold text-zinc-800 flex items-center gap-2">
                  <Activity size={18} className="text-indigo-500" /> Activity Pulse
               </h3>
            </div>
            <div className="absolute inset-0 top-10 left-0 right-0 bottom-0 opacity-80">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                     <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorVal)"
                     />
                     <Tooltip
                        cursor={false}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* 3. High Priority Item (Tall) -- with empty state protection */}
         <div className="col-span-1 md:col-span-2 row-span-2 bg-gradient-to-b from-white to-zinc-50 border border-white/80 rounded-[2.5rem] p-0 shadow-float overflow-hidden flex flex-col group hover:ring-2 hover:ring-indigo-500/20 transition-all">
            {heroProposal ? (
              <>
                <div className="p-7 pb-2 relative z-10">
                   <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-orange-50 rounded-lg">
                        <Flame size={18} className="text-orange-500 fill-orange-500 animate-pulse" />
                      </div>
                      <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Critical Priority</span>
                   </div>
                   <h3 className="text-2xl font-bold text-zinc-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                      {heroProposal.title}
                   </h3>
                   <p className="text-zinc-500 line-clamp-2 leading-relaxed font-medium text-sm">{heroProposal.description}</p>
                </div>

                <div className="mt-auto p-5 relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
                   <div className="relative z-10 flex gap-3">
                      <button
                         onClick={() => onSelectProposal(heroProposal)}
                         className="flex-1 relative overflow-hidden bg-zinc-900 text-white py-3.5 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-zinc-900/20 group/btn"
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] w-full h-full transform"></div>
                         <span className="flex items-center justify-center gap-2">
                            Review & Sign <Sparkles size={14} />
                         </span>
                      </button>
                      <button
                         onClick={handleDismiss}
                         className="px-5 py-3.5 bg-white text-zinc-600 border border-zinc-200 rounded-2xl font-bold text-sm hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                      >
                         Dismiss
                      </button>
                   </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4 p-8">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                  <Inbox size={28} className="text-zinc-300" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-zinc-500 mb-1">No Active Proposals</p>
                  <p className="text-sm text-zinc-400">Proposals from tracked DAOs will appear here.</p>
                </div>
              </div>
            )}
         </div>

         {/* 4. Mini Stat: DAOs */}
         <div className="col-span-1 bg-orange-50/50 border border-orange-100/50 backdrop-blur-sm rounded-[2.5rem] p-6 flex flex-col justify-between hover:rotate-1 hover:bg-orange-50 transition-all cursor-default group">
            <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
               <Box size={20} />
            </div>
            <div>
               <div className="text-4xl font-extrabold text-zinc-900 mb-1"><AnimatedCounter end={uniqueDAOs} /></div>
               <div className="text-xs font-bold text-orange-700/60 uppercase tracking-wider">Active DAOs</div>
            </div>
         </div>

         {/* 5. Mini Stat: Proposals */}
         <div className="col-span-1 bg-blue-50/50 border border-blue-100/50 backdrop-blur-sm rounded-[2.5rem] p-6 flex flex-col justify-between hover:-rotate-1 hover:bg-blue-50 transition-all cursor-default group">
            <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
               <Check size={20} />
            </div>
            <div>
               <div className="text-4xl font-extrabold text-zinc-900 mb-1"><AnimatedCounter end={activeProposals} /></div>
               <div className="text-xs font-bold text-blue-700/60 uppercase tracking-wider">Active Proposals</div>
            </div>
         </div>

      </div>

      {/* --- Horizontal Scroll Feed for other proposals --- */}
      <div className="pt-8">
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 px-2">
            <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
               Upcoming Queue
               <span className="bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full text-xs">{queueCount}</span>
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-1">
                {CHAIN_FILTERS.map((cf) => (
                  <button
                    key={cf.id}
                    onClick={() => setChainFilter(cf.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                      chainFilter === cf.id
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-100'
                    }`}
                  >
                    {cf.label}
                  </button>
                ))}
              </div>
              <button
                 onClick={() => onChangeView?.('proposals')}
                 className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1 rounded-full"
              >
                 View All
              </button>
            </div>
         </div>

         {(() => {
           const queueProposals = proposals.slice(1);
           const filteredQueue = chainFilter === 'all'
             ? queueProposals
             : queueProposals.filter(p => p.snapshotNetwork === chainFilter);

           return filteredQueue.length === 0 ? (
           <div className="flex items-center justify-center py-12">
             <div className="text-center text-zinc-400">
               <Inbox size={32} className="mx-auto mb-3 text-zinc-300" />
               <p className="text-sm font-medium">No additional proposals in queue.</p>
             </div>
           </div>
         ) : (
           <div className="flex overflow-x-auto gap-5 pb-8 no-scrollbar snap-x px-1">
              {filteredQueue.map((p) => (
                 <div
                    key={p.id}
                    onClick={() => onSelectProposal(p)}
                    className="min-w-[320px] bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-sm hover:shadow-float hover:-translate-y-1 transition-all duration-300 cursor-pointer snap-center group"
                 >
                    <div className="flex justify-between items-start mb-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                          p.source === 'Snapshot'
                          ? 'bg-yellow-100/80 text-yellow-700 border-yellow-200'
                          : 'bg-purple-100/80 text-purple-700 border-purple-200'
                       }`}>
                          {p.source}
                       </span>
                       <span className="text-xs font-mono text-zinc-400 bg-white/50 px-2 py-1 rounded-md border border-zinc-100">#{p.displayId || p.id.slice(0, 8)}</span>
                    </div>

                    <h4 className="text-lg font-bold text-zinc-900 mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                       {p.title}
                    </h4>
                    <p className="text-sm text-zinc-500 line-clamp-2 mb-5 font-medium">
                       {p.description}
                    </p>

                    <div className="flex items-center gap-3 border-t border-zinc-100 pt-4">
                       <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 border border-zinc-200 shadow-inner">
                          {p.daoName[0]}
                       </div>
                       <span className="text-sm font-bold text-zinc-700">{p.daoName}</span>
                    </div>
                 </div>
              ))}

              {/* View More Card */}
              <div className="min-w-[120px] flex items-center justify-center">
                 <div
                    onClick={() => onChangeView?.('proposals')}
                    className="w-16 h-16 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-300 shadow-sm cursor-pointer hover:bg-zinc-50 hover:scale-110 hover:text-indigo-500 hover:border-indigo-200 transition-all duration-300 group"
                 >
                    <ArrowUpRight size={24} className="group-hover:rotate-45 transition-transform duration-300" />
                 </div>
              </div>
           </div>
         );
         })()}
      </div>

      {/* Points & Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
        {isConnected ? (
          <>
            <PointsPanel />
            <Leaderboard />
          </>
        ) : (
          <div className="md:col-span-2 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 border-2 border-indigo-200 rounded-3xl p-8 shadow-lg">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <div className="inline-flex p-4 bg-indigo-100 rounded-2xl">
                <Wallet size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900">Connect Your Wallet to Get Started</h3>
              <p className="text-zinc-600 leading-relaxed">
                Connect your wallet to view your voting power, earn points by participating in governance, and redeem rewards.
                You can browse all proposals without connecting, but you'll need a wallet to vote.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Check size={16} className="text-emerald-500" />
                  <span>Browse proposals anytime</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Check size={16} className="text-emerald-500" />
                  <span>Get AI analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Check size={16} className="text-emerald-500" />
                  <span>Vote & earn rewards</span>
                </div>
              </div>
              <div className="pt-4">
                <WalletConnect />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
