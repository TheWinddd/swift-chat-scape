import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "user" | "ai" | "system" | "error";
  content: string;
  timestamp: Date;
}

const TypingIndicator = () => (
  <div className="flex items-center gap-1 p-4">
    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce-dot" style={{ animationDelay: "0ms" }} />
    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce-dot" style={{ animationDelay: "200ms" }} />
    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce-dot" style={{ animationDelay: "400ms" }} />
  </div>
);

const MessageBubble = ({ message, index }: { message: Message; index: number }) => {
  const isUser = message.type === "user";
  const isSystem = message.type === "system";
  const isError = message.type === "error";

  const formattedTime = message.timestamp.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex gap-3 animate-slide-up opacity-0",
        isUser ? "flex-row-reverse" : "flex-row",
        isSystem && "justify-center"
      )}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
    >
      {!isSystem && !isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
      
      {!isSystem && isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-md">
          <User className="w-5 h-5 text-primary-foreground" />
        </div>
      )}

      <div className={cn("flex flex-col max-w-[75%]", isSystem && "max-w-full")}>
        {isSystem ? (
          <div className="px-4 py-2 rounded-full bg-chat-system text-chat-system-foreground text-sm text-center">
            {message.content}
          </div>
        ) : isError ? (
          <div className="px-4 py-3 rounded-2xl bg-chat-error text-chat-error-foreground shadow-md">
            <p className="text-sm font-medium">{message.content}</p>
          </div>
        ) : (
          <div
            className={cn(
              "px-4 py-3 rounded-2xl shadow-md transition-all hover:shadow-lg",
              isUser
                ? "bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-tr-sm"
                : "bg-chat-ai text-chat-ai-foreground border border-border rounded-tl-sm"
            )}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        )}
        
        {!isSystem && (
          <span className={cn(
            "text-xs text-muted-foreground mt-1 px-2",
            isUser ? "text-right" : "text-left"
          )}>
            {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
};

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "system",
      content: "Chat started",
      timestamp: new Date(),
    },
    {
      id: "2",
      type: "ai",
      content: "Hello! How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "This is a demo response. In a real application, this would be connected to an AI backend!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "1",
        type: "system",
        content: "Chat cleared",
        timestamp: new Date(),
      },
      {
        id: "2",
        type: "ai",
        content: "Hello! How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-background/80 border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg animate-pulse-glow">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">AI Assistant</h1>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
          </div>
          <Button
            onClick={handleClearChat}
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-muted transition-all"
            title="Clear chat"
          >
            <Eraser className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))}
          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="px-4 py-2 rounded-2xl bg-chat-ai border border-border shadow-md">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur-lg shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="pr-4 py-6 text-base rounded-2xl border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              size="icon"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
