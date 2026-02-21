/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, BookOpen, MessageCircle, Send, Loader2, Info, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getAIResponse } from './services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getAIResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-300",
      isDarkMode ? "bg-[#121212] text-white" : "bg-[#fdfaf6] text-stone-800"
    )}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-10 backdrop-blur-md border-b px-4 py-3 transition-colors duration-300",
        isDarkMode ? "bg-[#1a1a1a]/80 border-white/10" : "bg-white/80 border-stone-200"
      )}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              isDarkMode ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700"
            )}>
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className={cn("text-xl font-bold", isDarkMode ? "text-white" : "text-stone-800")}>نور الهداية</h1>
              <p className={cn("text-xs font-sans", isDarkMode ? "text-stone-400" : "text-stone-500")}>مساعدك الذكي</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isDarkMode ? "hover:bg-white/10 text-stone-400" : "hover:bg-stone-100 text-stone-500"
                )}
                title="مسح المحادثة"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                "p-2 rounded-full transition-all duration-300",
                isDarkMode ? "bg-amber-900/30 text-amber-400" : "bg-stone-100 text-stone-600"
              )}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
        <div 
          ref={scrollRef}
          className="flex-1 space-y-6 overflow-y-auto pb-32 pt-4 scroll-smooth"
        >
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12"
            >
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner transition-colors",
                isDarkMode ? "bg-amber-900/20 text-amber-500" : "bg-amber-50 text-amber-600"
              )}>
                <MessageCircle size={40} />
              </div>
              <div className="max-w-md">
                <h2 className={cn("text-2xl font-bold mb-2", isDarkMode ? "text-white" : "text-stone-800")}>
                  كيف يمكنني مساعدتك اليوم؟
                </h2>
                <p className={cn("leading-relaxed", isDarkMode ? "text-stone-400" : "text-stone-600")}>
                  أنا هنا للإجابة على تساؤلاتك الدينية والعامة بكل رحابة صدر.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  'حديث عن الصدق والأمانة',
                  'ما هي أركان الإيمان؟',
                  'آية تدعو للمحبة والتسامح',
                  'كيف أطور من نفسي دينياً؟'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className={cn(
                      "p-3 text-right text-sm border rounded-xl transition-all",
                      isDarkMode 
                        ? "bg-[#1a1a1a] border-white/10 text-stone-300 hover:border-amber-500/50 hover:bg-amber-900/10" 
                        : "bg-white border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-amber-50"
                    )}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === 'user' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex w-full",
                  msg.role === 'user' ? "justify-start" : "justify-end"
                )}
              >
                <div className={cn(
                  "max-w-[85%] p-4 rounded-2xl shadow-sm transition-colors duration-300",
                  msg.role === 'user' 
                    ? (isDarkMode ? "bg-amber-700 text-white rounded-tr-none" : "bg-stone-800 text-white rounded-tr-none")
                    : (isDarkMode ? "bg-[#1a1a1a] border border-white/10 text-stone-200 rounded-tl-none" : "bg-white border border-stone-200 text-stone-800 rounded-tl-none")
                )}>
                  <div className="markdown-body">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex justify-end">
              <div className={cn(
                "p-4 rounded-2xl rounded-tl-none flex items-center gap-3 border transition-colors",
                isDarkMode ? "bg-[#1a1a1a] border-white/10" : "bg-white border-stone-200"
              )}>
                <Loader2 className="animate-spin text-amber-600" size={20} />
                <span className={cn("text-sm", isDarkMode ? "text-stone-400" : "text-stone-500")}>جاري التفكير...</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 pt-10 pb-6 px-4 transition-colors duration-300",
        isDarkMode 
          ? "bg-gradient-to-t from-[#121212] via-[#121212] to-transparent" 
          : "bg-gradient-to-t from-[#fdfaf6] via-[#fdfaf6] to-transparent"
      )}>
        <div className="max-w-4xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className={cn(
              "relative flex items-center rounded-2xl border shadow-lg p-1.5 transition-all duration-300",
              isDarkMode 
                ? "bg-[#1a1a1a] border-white/10 focus-within:border-amber-500/50" 
                : "bg-white border-stone-200 focus-within:border-amber-400"
            )}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك هنا..."
              className={cn(
                "flex-1 bg-transparent px-4 py-3 outline-none transition-colors",
                isDarkMode ? "text-white placeholder:text-stone-600" : "text-stone-800 placeholder:text-stone-400"
              )}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-3 rounded-xl transition-all",
                input.trim() && !isLoading 
                  ? "bg-amber-600 text-white hover:bg-amber-700 shadow-md" 
                  : (isDarkMode ? "bg-white/5 text-stone-700" : "bg-stone-100 text-stone-400")
              )}
            >
              <Send size={20} className="rotate-180" />
            </button>
          </form>
          <div className={cn(
            "flex items-center justify-center gap-2 mt-3 text-[10px] uppercase tracking-widest font-sans transition-colors",
            isDarkMode ? "text-stone-600" : "text-stone-400"
          )}>
            <Info size={12} />
            <span>هذا المساعد يستخدم الذكاء الاصطناعي، يرجى مراجعة المصادر الموثوقة</span>
          </div>
        </div>
      </div>
    </div>
  );
}
