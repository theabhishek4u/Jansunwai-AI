'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Sparkles, User, Lightbulb,
  ArrowRight, Loader2, Table, RotateCcw, X, MessageSquare
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
  'What should I spend ₹5 Crore on?',
  'Which roads need immediate repair?',
];

export function FloatingCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

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
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-[100] group">
        {!isOpen && (
          <div className="absolute -inset-2 bg-blue-600 rounded-full opacity-40 blur-lg animate-pulse" />
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen 
              ? 'bg-slate-800 text-slate-400 rotate-90 hover:bg-slate-700' 
              : 'bg-blue-600 text-white hover:scale-105'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Bot className="w-7 h-7 animate-bounce" style={{ animationDuration: '2s' }} />
          )}
        </button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-28 right-6 w-[800px] h-[80vh] max-h-[900px] max-w-[calc(100vw-3rem)] bg-[#0a0e1a] border border-[#1e293b]/80 rounded-2xl shadow-2xl shadow-blue-900/20 z-[90] flex flex-col overflow-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-slate-900/50 border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white">AI Copilot</h1>
                  <p className="text-[10px] text-slate-400">Ask anything about your constituency</p>
                </div>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-transparent p-4 space-y-6 custom-scrollbar scroll-smooth">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6 opacity-80">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                    <Bot className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-center px-4">
                    <h2 className="text-sm font-bold text-white mb-2">How can I help you today?</h2>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                      Analyze data, suggest budgets, or identify urgent needs.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 w-full px-2">
                    {suggestedQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="flex items-center space-x-2.5 px-4 py-3 rounded-xl bg-[#0f142c] border border-slate-800 text-xs text-slate-300 hover:bg-[#151c38] hover:border-blue-500/30 hover:text-white transition-all text-left group"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500/60 group-hover:text-amber-400 shrink-0" />
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
                            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Bot className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user'
                              ? 'bg-blue-600/20 border border-blue-500/20 text-slate-200'
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
                                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold text-blue-300 hover:bg-blue-500/20 transition-colors"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                    <span>{action}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-slate-800/50 border border-slate-700/30">
                    <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                    <span className="text-xs text-slate-400">Analyzing data...</span>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} className="h-2" />
            </div>

            {/* Input Bar */}
            <div className="shrink-0 p-4 bg-slate-900/50 border-t border-slate-800/80">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                    placeholder="Ask about your constituency..."
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-[#0f142c] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500/40" />
                  </div>
                </div>
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
