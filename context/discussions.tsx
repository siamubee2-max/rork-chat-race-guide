import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { useAuth } from "@/context/auth";

export interface Message {
  id: string;
  discussionId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Discussion {
  id: string;
  title: string;
  category: string;
  userId: string;
  userName: string;
  createdAt: string;
  lastMessageAt: string;
  messagesCount: number;
}

const STORAGE_DISCUSSIONS = "discussions";
const STORAGE_MESSAGES = "messages";

export const [DiscussionsProvider, useDiscussions] = createContextHook(() => {
  const { currentUser } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [discussionsData, messagesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_DISCUSSIONS),
        AsyncStorage.getItem(STORAGE_MESSAGES),
      ]);

      if (discussionsData) {
        setDiscussions(JSON.parse(discussionsData));
      }
      if (messagesData) {
        setMessages(JSON.parse(messagesData));
      }
    } catch (error) {
      console.error("Error loading discussions:", error);
    } finally {
      setIsLoading(false);
    }
  };



  const createDiscussion = async (title: string, category: string, firstMessage: string) => {
    if (!currentUser) return;

    const now = new Date().toISOString();
    const discussionId = Date.now().toString();

    const newDiscussion: Discussion = {
      id: discussionId,
      title,
      category,
      userId: currentUser.id,
      userName: currentUser.name,
      createdAt: now,
      lastMessageAt: now,
      messagesCount: 1,
    };

    const newMessage: Message = {
      id: Date.now().toString(),
      discussionId,
      userId: currentUser.id,
      userName: currentUser.name,
      text: firstMessage,
      createdAt: now,
    };

    const updatedDiscussions = [newDiscussion, ...discussions];
    const updatedMessages = [newMessage, ...messages];

    setDiscussions(updatedDiscussions);
    setMessages(updatedMessages);

    await Promise.all([
      AsyncStorage.setItem(STORAGE_DISCUSSIONS, JSON.stringify(updatedDiscussions)),
      AsyncStorage.setItem(STORAGE_MESSAGES, JSON.stringify(updatedMessages)),
    ]);
  };

  const addMessage = async (discussionId: string, text: string) => {
    if (!currentUser) return;

    const now = new Date().toISOString();
    const newMessage: Message = {
      id: Date.now().toString(),
      discussionId,
      userId: currentUser.id,
      userName: currentUser.name,
      text,
      createdAt: now,
    };

    const updatedMessages = [newMessage, ...messages];
    setMessages(updatedMessages);

    const updatedDiscussions = discussions.map((d) => {
      if (d.id === discussionId) {
        return {
          ...d,
          lastMessageAt: now,
          messagesCount: d.messagesCount + 1,
        };
      }
      return d;
    });
    setDiscussions(updatedDiscussions);

    await Promise.all([
      AsyncStorage.setItem(STORAGE_MESSAGES, JSON.stringify(updatedMessages)),
      AsyncStorage.setItem(STORAGE_DISCUSSIONS, JSON.stringify(updatedDiscussions)),
    ]);
  };

  const getDiscussionMessages = (discussionId: string) => {
    return messages
      .filter((m) => m.discussionId === discussionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  return {
    discussions,
    messages,
    currentUser,
    isLoading,
    createDiscussion,
    addMessage,
    getDiscussionMessages,
  };
});
