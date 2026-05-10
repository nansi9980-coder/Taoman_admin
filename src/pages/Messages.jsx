import { useState, useEffect, useMemo } from "react";
import clsx from "clsx";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export default function Messages() {
  const { messages, fetchMessages, loading } = useApp();
  const { user, token } = useAuth();
  
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Group messages by the OTHER user
  const groupedConversations = useMemo(() => {
    const groups = {};
    const myId = user?.id;

    messages.forEach((msg) => {
      const otherId = msg.fromId === myId ? msg.toId : msg.fromId;
      if (!otherId) return; // if it was broadcast, handle differently?
      
      const otherEmail = msg.fromId === myId ? `Utilisateur #${msg.toId}` : (msg.from?.email || `Utilisateur #${msg.fromId}`);
      
      if (!groups[otherId]) {
        groups[otherId] = {
          id: otherId,
          name: otherEmail,
          messages: [],
          lastTime: msg.createdAt,
          unread: 0,
        };
      }
      
      groups[otherId].messages.push({
        id: msg.id,
        text: msg.content,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(msg.createdAt),
        isOwn: msg.fromId === myId,
      });

      if (!msg.read && msg.fromId !== myId) {
        groups[otherId].unread += 1;
      }
    });

    return Object.values(groups).map(g => {
      // Sort messages ascending
      g.messages.sort((a, b) => a.date - b.date);
      g.lastMessage = g.messages[g.messages.length - 1]?.text;
      return g;
    }).sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));
  }, [messages, user?.id]);

  const filteredConversations = groupedConversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const conversation = groupedConversations.find((c) => c.id === selectedUserId) || filteredConversations[0] || null;
  const activeMessages = conversation?.messages || [];

  // Automatically select first conversation if none selected
  useEffect(() => {
    if (!selectedUserId && filteredConversations.length > 0) {
      setSelectedUserId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedUserId]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversation) return;
    
    setIsSending(true);
    try {
      await apiFetch("/messages", {
        method: "POST",
        token,
        body: {
          toId: conversation.id,
          subject: "Message",
          content: messageInput
        }
      });
      setMessageInput("");
      fetchMessages(); // Refresh messages
    } catch (err) {
      alert("Erreur lors de l'envoi: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] gap-lg p-lg">
      {/* Conversations Sidebar */}
      <div className="w-72 flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] overflow-hidden">
        {/* Search */}
        <div className="p-md border-b border-outline-variant">
          <input
            type="text"
            placeholder="Chercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={clsx(
              "w-full px-md py-sm rounded-lg border border-outline-variant",
              "bg-surface-container-low dark:bg-[#282a36] text-on-surface dark:text-[#e4e4ef]",
              "focus:outline-none focus:border-primary"
            )}
          />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading && groupedConversations.length === 0 ? (
             <div className="p-md text-center text-outline">Chargement...</div>
          ) : filteredConversations.length === 0 ? (
             <div className="p-md text-center text-outline">Aucune conversation</div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedUserId(conv.id)}
                className={clsx(
                  "w-full p-md border-b border-outline-variant text-left transition-colors duration-150",
                  selectedUserId === conv.id
                    ? "bg-primary-fixed dark:bg-[#0040a2]"
                    : "hover:bg-surface-container-low dark:hover:bg-[#282a36]"
                )}
              >
                <div className="flex items-center justify-between mb-xs">
                  <h3 className={clsx(
                    "font-semibold text-body-sm truncate",
                    selectedUserId === conv.id
                      ? "text-primary dark:text-[#b2c5ff]"
                      : "text-on-surface dark:text-[#e4e4ef]"
                  )}>
                    {conv.name}
                  </h3>
                  {conv.unread > 0 && (
                    <span className="badge badge-error text-label-sm">{conv.unread}</span>
                  )}
                </div>
                <p className={clsx(
                  "text-label-sm truncate",
                  selectedUserId === conv.id
                    ? "text-primary-container dark:text-[#b2c5ff]/80"
                    : "text-on-surface-variant dark:text-[#8e90a2]"
                )}>
                  {conv.lastMessage}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-[#1e1f2a] overflow-hidden">
        {/* Header */}
        {conversation ? (
          <>
            <div className="p-md border-b border-outline-variant flex items-center justify-between">
              <div>
                <h2 className="text-headline-md font-semibold text-on-surface dark:text-[#e4e4ef]">
                  {conversation.name}
                </h2>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-md space-y-md flex flex-col">
              {activeMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={clsx("flex gap-sm", msg.isOwn ? "justify-end" : "justify-start")}
                >
                  {!msg.isOwn && (
                    <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 text-primary text-label-md font-bold">
                      {conversation.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={clsx(
                    "max-w-md px-md py-sm rounded-lg",
                    msg.isOwn
                      ? "bg-primary dark:bg-[#b2c5ff] text-on-primary dark:text-primary"
                      : "bg-surface-container-low dark:bg-[#282a36] text-on-surface dark:text-[#e4e4ef]"
                  )}>
                    <p className="text-body-sm whitespace-pre-wrap">{msg.text}</p>
                    <p className={clsx(
                      "text-label-sm mt-xs text-right",
                      msg.isOwn
                        ? "text-on-primary/80 dark:text-primary/80"
                        : "text-on-surface-variant dark:text-[#8e90a2]"
                    )}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-md border-t border-outline-variant flex gap-md">
              <input
                type="text"
                placeholder="Écrire un message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isSending}
                className={clsx(
                  "flex-1 px-md py-sm rounded-lg border border-outline-variant",
                  "bg-surface-container-low dark:bg-[#282a36] text-on-surface dark:text-[#e4e4ef]",
                  "focus:outline-none focus:border-primary disabled:opacity-50"
                )}
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !messageInput.trim()}
                className={clsx(
                  "px-md py-sm rounded-lg font-label-md transition-colors duration-150",
                  "bg-primary text-on-primary dark:bg-[#b2c5ff] dark:text-primary",
                  "hover:bg-primary-container dark:hover:bg-[#c4d2ff] disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-outline-variant">
            Sélectionnez une conversation pour commencer
          </div>
        )}
      </div>
    </div>
  );
}
