'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Sparkles, User, Lightbulb,
  ArrowRight, Loader2, Table, RotateCcw
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  data?: Record<string, unknown>[];
  actions?: string[];
  timestamp: Date;
}

const suggestedQuestions = [
  'Which villages need urgent attention?',
  'Top 5 citizen priorities this month',
  'Show education-related requests',
  'What should I spend ₹5 Crore on?',
  'Which roads need immediate repair?',
  'How many suggestions are pending review?',
  'What are the infrastructure gaps?',
  'Show constituency health summary'
];

export default function CopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: question.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API}/api/mp/ai-copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() })
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: data.answer || 'I could not process that question. Please try rephrasing.',
        data: data.data,
        actions: data.actions,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: `ai-err-${Date.now()}`,
        role: 'ai',
        text: 'Sorry, I encountered an error processing your question. Please check if the server is running.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">AI Copilot</h1>
            <p className="text-[11px] text-slate-400">Ask anything about your constituency — powered by Gemini AI</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl bg-[#111827] border border-slate-800/50 p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center border border-violet-500/20">
                <Bot className="w-8 h-8 text-violet-400" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-white mb-1">How can I help you today?</h2>
                <p className="text-xs text-slate-400 max-w-md">
                  I can analyze your constituency data, suggest budget allocations, identify urgent development needs, and provide actionable intelligence.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl w-full">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="flex items-center space-x-2.5 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 hover:bg-slate-800 hover:border-slate-600 hover:text-white transition-all text-left group"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500/60 group-hover:text-amber-400 flex-shrink-0" />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                  <div className="flex items-start space-x-3">
                    {msg.role === 'ai' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user'
                        ? 'bg-amber-600/20 border border-amber-500/20 text-slate-200'
                        : 'bg-slate-800/50 border border-slate-700/30 text-slate-200'
                        }`}>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>

                      {/* Data Table */}
                      {msg.data && msg.data.length > 0 && (
                        <div className="mt-3 rounded-xl bg-slate-900/60 border border-slate-700/30 overflow-hidden">
                          <div className="px-3 py-2 border-b border-slate-700/30 flex items-center space-x-1.5">
                            <Table className="w-3 h-3 text-cyan-400" />
                            <span className="text-[10px] font-semibold text-slate-400">Data</span>
                          </div>
                          <div className="max-h-48 overflow-auto">
                            <table className="w-full text-[10px]">
                              <thead>
                                <tr className="border-b border-slate-800">
                                  {Object.keys(msg.data[0]).map((key) => (
                                    <th key={key} className="px-3 py-2 text-left font-bold text-slate-400 uppercase tracking-wider">{key}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {msg.data.map((row, ri) => (
                                  <tr key={ri} className="border-b border-slate-800/30 hover:bg-slate-800/30">
                                    {Object.values(row).map((val, vi) => (
                                      <td key={vi} className="px-3 py-2 text-slate-300">{String(val)}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Suggested Actions */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.actions.map((action, ai) => (
                            <button
                              key={ai}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[10px] font-semibold text-violet-300 hover:bg-violet-500/20 transition-colors"
                            >
                              <ArrowRight className="w-3 h-3" />
                              <span>{action}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-amber-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start space-x-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-slate-800/50 border border-slate-700/30">
              <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
              <span className="text-xs text-slate-400">Analyzing constituency data...</span>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="shrink-0 mt-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask about your constituency..."
              className="w-full px-5 py-3.5 rounded-xl bg-[#111827] border border-slate-700/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all"
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-violet-500/40" />
            </div>
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white hover:shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>
        <p className="text-center text-[9px] text-slate-600 mt-2">
          AI responses are generated from constituency data. Always verify critical decisions.
        </p>
      </div>
    </div>
  );
}
