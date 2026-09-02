import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, NavigationTab } from '../types';
import { ASSETS } from '../data/mockData';

interface AiCommandViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onNavigate: (tab: NavigationTab) => void;
  onScheduleInspectionFromAi: (mineName: string) => void;
}

export const AiCommandView: React.FC<AiCommandViewProps> = ({
  messages,
  onSendMessage,
  onNavigate,
  onScheduleInspectionFromAi,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Which mines are high risk?',
    'What could go wrong next?',
    'Why is Korba Deep Mine high risk?',
    'Show overdue compliance.',
    'What preventive action is recommended?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText('');
    onSendMessage(userText);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col bg-white rounded-2xl border border-[#e0e3e5] shadow-xs overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#e0e3e5] bg-[#ffffff] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#131b2e] to-[#2e3b5e] flex items-center justify-center text-white shadow-sm ring-1 ring-black/5">
            <span className="material-symbols-outlined text-[22px] ai-glow">psychology</span>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#191c1e] flex items-center gap-2">
              Ask CoalGuard
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                AI Active
              </span>
            </h2>
            <p className="text-xs text-[#76777d]">
              Predictive risk assistant • DGMS Compliance & Governance Intelligence
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs font-bold text-gray-500 hover:text-black p-2 rounded-lg"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Suggested Quick Queries */}
      <div className="px-4 py-2 bg-[#f7f9fb] border-b border-[#eceef0] flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#76777d]">
          Suggested:
        </span>
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSendMessage(prompt)}
            className="px-3 py-1 bg-white border border-[#c6c6cd]/50 rounded-full text-xs font-semibold text-[#191c1e] hover:bg-[#eceef0] hover:border-black transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#fafbfc]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 md:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-[#131b2e] flex items-center justify-center text-white shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] space-y-3 ${
                  isUser ? 'items-end' : 'items-start'
                }`}
              >
                {/* Text Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-[#0F172A] text-white rounded-tr-none font-medium'
                      : 'bg-white border border-[#e0e3e5] text-[#191c1e] rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Rich Data Card if present */}
                {msg.richData && (
                  <div className="bg-white border border-[#e0e3e5] rounded-xl p-4 shadow-sm space-y-4 text-xs">
                    {/* Score Bar & Mine Name */}
                    {msg.richData.mineName && (
                      <div className="flex justify-between items-center pb-2 border-b border-[#eceef0]">
                        <div className="font-bold text-sm text-[#191c1e]">
                          {msg.richData.mineName}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-gray-500 uppercase">
                            Risk Score
                          </span>
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono font-extrabold">
                            {msg.richData.riskScore} / 100
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Breakdown bars */}
                    {msg.richData.factorBreakdown && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Risk Factor Attribution
                        </span>
                        {msg.richData.factorBreakdown.map((item) => (
                          <div key={item.label} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span>{item.label}</span>
                              <span className="font-mono">{item.value}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${item.value}%`,
                                  backgroundColor: item.color,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Recommendation box */}
                    {msg.richData.recommendation && (
                      <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-2.5">
                        <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                          <span className="material-symbols-outlined text-[16px] text-indigo-600">
                            auto_awesome
                          </span>
                          {msg.richData.recommendation.title}
                        </div>
                        <p className="text-gray-700 text-xs leading-relaxed">
                          {msg.richData.recommendation.text}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {msg.richData.recommendation.actionText && (
                            <button
                              onClick={() =>
                                onScheduleInspectionFromAi(
                                  msg.richData?.mineName || 'Jharia Main Colliery'
                                )
                              }
                              className="px-3 py-1.5 bg-[#0F172A] hover:bg-[#1e293b] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                            >
                              {msg.richData.recommendation.actionText}
                            </button>
                          )}
                          <button
                            onClick={() => setShowComplianceModal(true)}
                            className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold transition-colors"
                          >
                            View Compliance Records
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`text-[10px] text-gray-400 ${
                    isUser ? 'text-right' : 'text-left'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <img
                  src={ASSETS.adminProfile}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover border border-[#c6c6cd] shrink-0 mt-0.5"
                />
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-[#131b2e] flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-100" />
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-200" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 md:p-4 bg-white border-t border-[#e0e3e5]">
        <div className="relative flex items-center bg-[#f2f4f6] rounded-full pl-4 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-black/10 focus-within:bg-white transition-all border border-[#e0e3e5]">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask a question or request risk analysis..."
            className="w-full bg-transparent border-none text-xs sm:text-sm text-[#191c1e] placeholder:text-[#76777d] focus:outline-none"
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSendMessage('Which mines are high risk?')}
              className="p-1.5 rounded-full text-gray-500 hover:text-black hover:bg-gray-200 transition-colors"
              title="Voice / Quick prompt shortcut"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-8 h-8 rounded-full bg-[#0F172A] hover:bg-[#1e293b] text-white flex items-center justify-center disabled:opacity-40 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </button>
          </div>
        </div>
      </form>

      {/* Compliance Records Modal */}
      {showComplianceModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Compliance Records Summary
                </h3>
                <p className="text-xs text-gray-500">DGMS Compliance Data • Last Updated: Today</p>
              </div>
              <button onClick={() => setShowComplianceModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-700">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-bold text-gray-900 mb-1">Inspection History (Last 90 Days)</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• 3 recurring ventilation findings at Korba Deep Mine</li>
                  <li>• 2 overdue compliance actions at Jharia Main Colliery</li>
                  <li>• 1 pending environmental audit at Singrauli North</li>
                </ul>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-bold text-gray-900 mb-1">Contractor Compliance Status</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Bharat Coal Mining Services: 8 expiring certifications</li>
                  <li>• Eastern Mining Contractors: 12 expiring certifications</li>
                  <li>• Central Mine Ventilation Services: Compliant</li>
                </ul>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-bold text-gray-900 mb-1">Environmental Data</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Groundwater sampling: Current at all sites</li>
                  <li>• Emissions audit: Pending at Singrauli North</li>
                  <li>• Dust suppression: Calibration due at Jharia Main</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setShowComplianceModal(false)}
              className="mt-4 w-full py-2.5 bg-[#0F172A] text-white rounded-lg text-xs font-bold"
            >
              Close Records
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
