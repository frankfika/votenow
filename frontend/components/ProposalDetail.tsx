import React, { useState, useEffect, useRef } from 'react';
import { Proposal, AnalysisResult, ChatMessage, isSnapshotProposal } from '../types';
import { analyzeProposal, chatWithAgent } from '../services/api';
import RiskBadge from './RiskBadge';
import VoteButton from './VoteButton';
import { getExplorerUrl } from '../../shared/config';
import {
  ArrowLeft, Cpu, Send, Sparkles, X, FileText, MessageCircle, Network, ExternalLink
} from 'lucide-react';

interface ProposalDetailProps {
  proposal: Proposal;
  onBack: () => void;
}

const ProposalDetail: React.FC<ProposalDetailProps> = ({ proposal, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [mobileTab, setMobileTab] = useState<'chat' | 'document'>('chat');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Generate proposal URL based on type
  const getProposalUrl = (): { url: string; label: string } => {
    if (isSnapshotProposal(proposal)) {
      return {
        url: `https://snapshot.org/#/${proposal.spaceId}/proposal/${proposal.snapshotId}`,
        label: 'View on Snapshot'
      };
    } else {
      const explorerUrl = getExplorerUrl(proposal.chainId);
      return {
        url: `${explorerUrl}/tx/${proposal.id}`,
        label: 'View on Explorer'
      };
    }
  };

  // Get governance type label
  const getGovernanceTypeLabel = () => {
    return isSnapshotProposal(proposal) ? 'Snapshot' : 'OnChain';
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    runAutoAnalysis();
  }, [proposal]);

  const runAutoAnalysis = async () => {
    setIsTyping(true);
    const result = await analyzeProposal(proposal.fullContent);
    setAnalysis(result);
    setIsTyping(false);

    setMessages([{
      id: 'result-' + Date.now(),
      role: 'agent',
      content: result.summary,
      type: 'intent-action',
      data: result,
      timestamp: Date.now()
    }]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role === 'agent' ? 'model' : 'user', content: m.content }));

    const responseText = await chatWithAgent(history, proposal.fullContent);

    setIsTyping(false);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'agent',
      content: responseText,
      timestamp: Date.now()
    }]);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const DocumentPanel = () => (
    <div className="h-full overflow-y-auto custom-scrollbar p-10 bg-gradient-to-b from-white/50 to-zinc-50/50">
      <div className="max-w-2xl mx-auto pb-10">
        {/* Network Badge & DAO Info */}
        <div className="mb-6 flex items-center gap-2 text-xs flex-wrap">
          {/* Governance Type Badge */}
          <span className={`px-2 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider ${
            isSnapshotProposal(proposal)
              ? 'bg-amber-100 text-amber-700 border border-amber-200'
              : 'bg-purple-100 text-purple-700 border border-purple-200'
          }`}>
            {getGovernanceTypeLabel()}
          </span>
          <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-2">
            <Network size={12} className="text-indigo-600" />
            <span className="font-semibold text-indigo-700">
              Network: {isSnapshotProposal(proposal)
                ? (proposal.network === '1' ? 'Ethereum' :
                   proposal.network === '137' ? 'Polygon' :
                   proposal.network === '42161' ? 'Arbitrum' :
                   proposal.network === '10' ? 'Optimism' :
                   `Chain ${proposal.network}`)
                : (proposal.chainId === 1 ? 'Ethereum' :
                   proposal.chainId === 137 ? 'Polygon' :
                   proposal.chainId === 42161 ? 'Arbitrum' :
                   proposal.chainId === 10 ? 'Optimism' :
                   `Chain ${proposal.chainId}`)
              }
            </span>
          </div>
          <span className="text-zinc-400">•</span>
          <span className="text-zinc-500 font-medium">{proposal.daoName}</span>
          <span className="text-zinc-400">•</span>
          <a
            href={getProposalUrl().url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors"
          >
            {getProposalUrl().label}
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="flex gap-2 mb-8">
          {proposal.tags.map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full bg-white border border-zinc-200 text-xs font-bold text-zinc-500 shadow-sm">
              {tag}
            </span>
          ))}
        </div>
        <article className="prose prose-zinc prose-lg">
          <div className="whitespace-pre-line text-zinc-800 leading-loose font-serif">
            {proposal.fullContent}
          </div>
        </article>
      </div>
    </div>
  );

  const ChatPanel = () => (
    <div className="h-full flex flex-col bg-white/60 border-l border-white/50 relative backdrop-blur-xl">

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && isTyping && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4 animate-pulse">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-50 to-white border border-indigo-100 flex items-center justify-center shadow-lg">
              <Cpu className="text-indigo-500" size={28} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Scanning Contract Bytecode...</span>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-4 duration-500`}>
            <div className={`max-w-[85%] p-5 shadow-sm transition-all hover:shadow-md ${
              msg.role === 'user'
              ? 'bg-zinc-900 text-white rounded-[1.5rem] rounded-br-sm'
              : 'bg-white border border-white/80 rounded-[1.5rem] rounded-bl-sm'
            }`}>
              {msg.role === 'agent' && (
                <div className="flex items-center gap-2 mb-3 text-indigo-600">
                  <div className="p-1 bg-indigo-50 rounded-md">
                    <Sparkles size={12} fill="currentColor" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">AI Insight</span>
                </div>
              )}

              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>

              {/* Intent Widget */}
              {msg.type === 'intent-action' && msg.data && (
                <div className="mt-5 pt-5 border-t border-zinc-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Analysis Result</span>
                    <RiskBadge level={msg.data.riskLevel} />
                  </div>
                  <div className="bg-zinc-50/80 rounded-2xl p-4 mb-4 border border-zinc-100">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-3xl font-bold text-zinc-900 tracking-tighter">{msg.data.strategyMatchScore}%</span>
                      <span className="text-xs font-bold text-zinc-500 uppercase">Strategy Alignment</span>
                    </div>
                    <div className="w-full bg-zinc-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${msg.data.strategyMatchScore}%` }}></div>
                    </div>
                    <p className="text-xs text-zinc-500 mt-3 font-medium leading-normal">
                      {msg.data.strategyReasoning}
                    </p>
                  </div>
                  <VoteButton
                    proposalId={proposal.id}
                    recommendation={msg.data.recommendation}
                    {...(isSnapshotProposal(proposal)
                      ? {
                          source: 'Snapshot' as const,
                          spaceId: proposal.spaceId,
                          snapshotId: proposal.snapshotId,
                          choices: proposal.choices,
                          proposalType: proposal.type,
                          snapshotBlock: proposal.snapshotBlock,
                        }
                      : {
                          source: 'OnChain' as const,
                          governorAddress: proposal.governorAddress as `0x${string}`,
                          onChainProposalId: proposal.proposalId,
                          chainId: proposal.chainId,
                        }
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && messages.length > 0 && (
          <div className="flex items-center gap-1 ml-4 p-3 bg-white/50 rounded-2xl w-fit">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Floating Input Bar */}
      <div className="p-6 pt-2 bg-gradient-to-t from-white via-white/90 to-transparent z-10">
        <div className="relative shadow-float rounded-[1.2rem] bg-white border border-white/50 ring-4 ring-zinc-50/50 transition-all focus-within:ring-indigo-50/50 focus-within:scale-[1.01]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask VoteNow..."
            className="w-full bg-transparent border-none text-zinc-900 rounded-[1.2rem] pl-6 pr-14 py-4 focus:ring-0 placeholder:text-zinc-400 font-medium"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-zinc-900 transition-all shadow-md"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[85vh] w-full bg-white/70 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden flex flex-col relative ring-1 ring-white/60 ring-offset-2 ring-offset-black/5 animate-in zoom-in-95 duration-500">

      {/* Window Controls / Header */}
      <div className="h-18 px-8 py-5 flex items-center justify-between border-b border-zinc-100 bg-white/40 backdrop-blur-md z-20">
         <div className="flex items-center gap-5">
            <button
               onClick={onBack}
               className="w-10 h-10 rounded-full bg-white border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center transition-all hover:scale-105 text-zinc-600 shadow-sm"
            >
               <ArrowLeft size={18} />
            </button>
            <div className="flex flex-col">
               <h2 className="font-bold text-zinc-900 text-sm tracking-tight">{proposal.title}</h2>
               <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Session</span>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <a
               href={getProposalUrl().url}
               target="_blank"
               rel="noopener noreferrer"
               className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-lg border border-zinc-200 text-xs font-mono text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-2 group"
               title={getProposalUrl().label}
            >
               <span>ID: {proposal.displayId || proposal.id.slice(0, 8)}</span>
               <ExternalLink size={12} className="text-zinc-400 group-hover:text-zinc-600" />
            </a>
            <div className="h-4 w-px bg-zinc-300 mx-1"></div>
            <div className="w-8 h-8 rounded-full hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-colors text-zinc-400" onClick={onBack}>
              <X size={16} />
            </div>
         </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-zinc-100 bg-white/40 backdrop-blur-md">
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${
            mobileTab === 'chat'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <MessageCircle size={16} /> Chat
        </button>
        <button
          onClick={() => setMobileTab('document')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${
            mobileTab === 'document'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <FileText size={16} /> Document
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* LEFT: Document Area — hidden on mobile, visible on lg+ */}
         <div className="hidden lg:block w-[55%] h-full">
           <DocumentPanel />
         </div>

         {/* Mobile: show based on tab */}
         <div className="lg:hidden w-full h-full">
           {mobileTab === 'document' ? <DocumentPanel /> : <ChatPanel />}
         </div>

         {/* RIGHT: Agent Chat Interface — visible on lg+ */}
         <div className="hidden lg:flex w-[45%] h-full">
           <ChatPanel />
         </div>
      </div>
    </div>
  );
};

export default ProposalDetail;
