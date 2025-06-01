
"use client";

import { useState, type Dispatch, type SetStateAction, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Send, Bot, UserCircle, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import type { ChatMessage } from '@/ai/flows/chat-with-persona-flow';
import type { GeneratePersonaProfileOutput } from '@/ai/flows/generate-persona-profile-flow';

interface PersonaChatPanelProps {
  activePersona: GeneratePersonaProfileOutput['personaProfile'] | null;
  chatMessages: ChatMessage[];
  handleSendMessage: (message: string) => Promise<void>;
  isSendingMessage: boolean;
  currentLanguage: string;
  labels: {
    personaLabChatTitle: string;
    personaLabChatDescription: string;
    personaLabChatNoActivePersona: string;
    chatWithPersonaPlaceholder: string;
    sendMessageButton: string;
    sendingMessageButton: string;
    youLabel: string;
  };
}

export function PersonaChatPanel({
  activePersona,
  chatMessages,
  handleSendMessage,
  isSendingMessage,
  currentLanguage,
  labels,
}: PersonaChatPanelProps) {
  const [currentMessage, setCurrentMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const { scrollHeight, clientHeight } = scrollAreaRef.current;
      scrollAreaRef.current.scrollTo({ top: scrollHeight - clientHeight, behavior: 'smooth' });
    }
  }, [chatMessages, isSendingMessage]); // Added isSendingMessage to scroll when typing indicator appears

  const onSendMessage = () => {
    if (!currentMessage.trim()) return;
    handleSendMessage(currentMessage);
    setCurrentMessage('');
  };
  
  const chatPanelHeight = "h-[calc(100vh-var(--header-height,150px)-var(--tabs-height,70px)-var(--footer-height,50px)-5rem)]";

  if (!activePersona) {
    return (
      <Card className={`w-full shadow-lg ${chatPanelHeight} flex flex-col`}>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2 text-primary">
            <Bot className="h-5 w-5" />
            {labels.personaLabChatTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertTriangle className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{labels.personaLabChatNoActivePersona}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full shadow-lg flex flex-col ${chatPanelHeight} max-h-[80vh]`}>
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2 text-primary">
          <Bot className="h-5 w-5" />
          {labels.personaLabChatTitle}: <span className="text-accent">{activePersona.name}</span>
        </CardTitle>
        <CardDescription>{activePersona.tagline || labels.personaLabChatDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'model' && <Bot className="h-6 w-6 text-primary flex-shrink-0 mt-1" />}
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2.5 shadow-md ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && <UserCircle className="h-6 w-6 text-secondary-foreground flex-shrink-0 mt-1" />}
              </div>
            ))}
            {isSendingMessage && chatMessages[chatMessages.length -1]?.role === 'user' && (
                 <div className="flex items-start gap-3 justify-start animate-fadeIn">
                    <Bot className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div className="max-w-[75%] rounded-lg px-4 py-2.5 shadow-md bg-muted text-muted-foreground">
                        <LoadingSpinner size="sm" />
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4 bg-background/80 sticky bottom-0">
        <div className="flex w-full items-center gap-2">
          <Input
            type="text"
            placeholder={`${labels.chatWithPersonaPlaceholder}${activePersona.name}...`}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isSendingMessage && onSendMessage()}
            disabled={isSendingMessage}
            className="flex-grow"
          />
          <Button onClick={onSendMessage} disabled={isSendingMessage || !currentMessage.trim()}>
            {isSendingMessage ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">{labels.sendMessageButton}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
