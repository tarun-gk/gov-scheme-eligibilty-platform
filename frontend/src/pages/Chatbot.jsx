import { useState, useRef, useEffect } from "react";
import { askChatbot } from "../services/platformApi";
import { useUserProfile } from "../hooks/useUserProfile";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

const STARTER_QUESTIONS = [
  "Which schemes are for farmers in Telangana?",
  "Am I eligible for PM Kisan?",
  "What scholarships are available for students?",
  "Government schemes for women entrepreneurs",
];

export default function Chatbot() {
  const { profile } = useUserProfile();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function submitQuestion(text) {
    const q = (text || question).trim();
    if (!q) return;

    const userMessage = { role: "user", text: q };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await askChatbot(q, profile || {});
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: response?.answer || "No answer available",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: error.message || "Chat request failed",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitQuestion();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">AI Scheme Assistant</h1>
        <p className="page-subtitle">
          Ask questions about government schemes, eligibility, and application
          processes.
        </p>
      </div>

      {/* Chat container */}
      <div className="card flex flex-col" style={{ height: "580px" }}>
        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto px-1 py-2"
        >
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Bot className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-medium text-navy-700">
                Start a conversation
              </p>
              <p className="mt-1 text-sm text-navy-400">
                Try one of the suggested questions below.
              </p>

              {/* Starter chips */}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => submitQuestion(q)}
                    className="rounded-full border border-navy-200 px-3 py-1.5 text-xs font-medium text-navy-600 transition-colors hover:bg-navy-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={`${msg.role}-${i}`}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""
                }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "user"
                    ? "bg-navy-800 text-white"
                    : "bg-brand-50 text-brand-700"
                  }`}
              >
                {msg.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                    ? "bg-navy-800 text-white"
                    : "border border-navy-200 bg-navy-50 text-navy-800"
                  }`}
              >
                {msg.role === "user" ? (
                  msg.text
                ) : (
                  <div className="prose prose-sm prose-navy max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>ul]:list-outside [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&_a]:text-brand-600 [&_a]:underline hover:[&_a]:text-brand-700">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-lg border border-navy-200 bg-navy-50 px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-navy-400" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-navy-400" style={{ animationDelay: "0.2s" }} />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-navy-400" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 border-t border-navy-200 pt-4"
        >
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className="input"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="btn-primary shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
