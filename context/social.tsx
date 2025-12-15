import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { useAuth } from "@/context/auth";

export interface UserProfile {
  id: string;
  userId: string;
  userName: string;
  bio: string;
  avatarUrl?: string;
  location?: string;
  joinedAt: string;
  catsCount: number;
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  imageUrl: string;
  caption: string;
  catName?: string;
  catBreed?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  location?: string;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface PostLike {
  postId: string;
  userId: string;
}

export interface Follow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface CatEvent {
  id: string;
  title: string;
  description: string;
  type: "meetup" | "adoption" | "show" | "workshop" | "charity";
  imageUrl?: string;
  date: string;
  time: string;
  location: string;
  address: string;
  organizerId: string;
  organizerName: string;
  attendeesCount: number;
  maxAttendees?: number;
  price?: string;
  createdAt: string;
}

export interface EventAttendee {
  eventId: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: { [key: string]: string };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

const STORAGE_PROFILES = "social_profiles";
const STORAGE_POSTS = "social_posts";
const STORAGE_COMMENTS = "social_comments";
const STORAGE_LIKES = "social_likes";
const STORAGE_FOLLOWS = "social_follows";
const STORAGE_EVENTS = "social_events";
const STORAGE_ATTENDEES = "social_attendees";
const STORAGE_MESSAGES = "social_messages";
const STORAGE_CONVERSATIONS = "social_conversations";

const SAMPLE_POSTS: Post[] = [
  {
    id: "post1",
    userId: "user1",
    userName: "Marie",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800",
    caption: "Mon petit Luna profite du soleil ☀️ Elle adore se prélasser près de la fenêtre !",
    catName: "Luna",
    catBreed: "British Shorthair",
    likesCount: 47,
    commentsCount: 12,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    location: "Paris, France",
  },
  {
    id: "post2",
    userId: "user2",
    userName: "Thomas",
    imageUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800",
    caption: "Premier jour à la maison pour ce petit bout ! Bienvenue dans la famille 🐱❤️",
    catName: "Milo",
    catBreed: "Maine Coon",
    likesCount: 89,
    commentsCount: 23,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    location: "Lyon, France",
  },
  {
    id: "post3",
    userId: "user3",
    userName: "Sophie",
    imageUrl: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800",
    caption: "Câlins du matin avec mon gros matou 😻 Rien de mieux pour commencer la journée",
    catName: "Oscar",
    catBreed: "Ragdoll",
    likesCount: 156,
    commentsCount: 34,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post4",
    userId: "user4",
    userName: "Julie",
    imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800",
    caption: "Qui dort dîne ? Pas pour cette gourmande qui rêve de croquettes 😴🐟",
    catName: "Nala",
    catBreed: "Siamois",
    likesCount: 72,
    commentsCount: 8,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    location: "Marseille, France",
  },
  {
    id: "post5",
    userId: "user5",
    userName: "Antoine",
    imageUrl: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800",
    caption: "Session de jeu intense ! Ce plumeau ne va pas survivre longtemps 🪶😼",
    catName: "Tigrou",
    catBreed: "Bengal",
    likesCount: 203,
    commentsCount: 45,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const SAMPLE_EVENTS: CatEvent[] = [
  {
    id: "event1",
    title: "Rencontre des félins parisiens",
    description: "Venez avec votre chat pour une après-midi de jeux et de rencontres ! Ambiance conviviale garantie. Nous aurons des jouets, des friandises et beaucoup d'amour à partager.",
    type: "meetup",
    imageUrl: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "14:00",
    location: "Parc Monceau",
    address: "35 Boulevard de Courcelles, 75008 Paris",
    organizerId: "user1",
    organizerName: "Marie",
    attendeesCount: 23,
    maxAttendees: 50,
    createdAt: new Date().toISOString(),
  },
  {
    id: "event2",
    title: "Journée adoption SPA",
    description: "La SPA organise une journée spéciale adoption de chats. Venez rencontrer nos pensionnaires qui cherchent une famille aimante. Tous les chats sont vaccinés et stérilisés.",
    type: "adoption",
    imageUrl: "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=800",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "10:00",
    location: "Refuge SPA",
    address: "30 Avenue du Général Leclerc, 94700 Maisons-Alfort",
    organizerId: "user2",
    organizerName: "Thomas",
    attendeesCount: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: "event3",
    title: "Exposition féline internationale",
    description: "Les plus beaux chats de race se retrouvent pour cette exposition annuelle. Jugements, concours de beauté et nombreux stands de produits pour chats.",
    type: "show",
    imageUrl: "https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=800",
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "09:00",
    location: "Parc des Expositions",
    address: "1 Place de la Porte de Versailles, 75015 Paris",
    organizerId: "user3",
    organizerName: "Sophie",
    attendeesCount: 156,
    price: "15€",
    createdAt: new Date().toISOString(),
  },
  {
    id: "event4",
    title: "Atelier comportement félin",
    description: "Un vétérinaire comportementaliste vous explique comment comprendre et gérer les comportements de votre chat. Questions/réponses à la fin.",
    type: "workshop",
    imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800",
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "18:30",
    location: "Clinique vétérinaire du Chat",
    address: "12 Rue de la Paix, 69002 Lyon",
    organizerId: "user4",
    organizerName: "Dr. Julie Martin",
    attendeesCount: 18,
    maxAttendees: 25,
    price: "25€",
    createdAt: new Date().toISOString(),
  },
];

export const [SocialProvider, useSocial] = createContextHook(() => {
  const { currentUser } = useAuth();
  const [, setProfiles] = useState<UserProfile[]>([]);
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [likes, setLikes] = useState<PostLike[]>([]);
  const [follows, setFollows] = useState<Follow[]>([]);
  const [events, setEvents] = useState<CatEvent[]>(SAMPLE_EVENTS);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        profilesData,
        postsData,
        commentsData,
        likesData,
        followsData,
        eventsData,
        attendeesData,
        messagesData,
        conversationsData,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_PROFILES),
        AsyncStorage.getItem(STORAGE_POSTS),
        AsyncStorage.getItem(STORAGE_COMMENTS),
        AsyncStorage.getItem(STORAGE_LIKES),
        AsyncStorage.getItem(STORAGE_FOLLOWS),
        AsyncStorage.getItem(STORAGE_EVENTS),
        AsyncStorage.getItem(STORAGE_ATTENDEES),
        AsyncStorage.getItem(STORAGE_MESSAGES),
        AsyncStorage.getItem(STORAGE_CONVERSATIONS),
      ]);

      if (profilesData) setProfiles(JSON.parse(profilesData));
      if (postsData) setPosts(JSON.parse(postsData));
      else setPosts(SAMPLE_POSTS);
      if (commentsData) setComments(JSON.parse(commentsData));
      if (likesData) setLikes(JSON.parse(likesData));
      if (followsData) setFollows(JSON.parse(followsData));
      if (eventsData) setEvents(JSON.parse(eventsData));
      else setEvents(SAMPLE_EVENTS);
      if (attendeesData) setAttendees(JSON.parse(attendeesData));
      if (messagesData) setMessages(JSON.parse(messagesData));
      if (conversationsData) setConversations(JSON.parse(conversationsData));
    } catch (error) {
      console.error("Error loading social data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = useCallback(async (imageUrl: string, caption: string, catName?: string, catBreed?: string, location?: string) => {
    if (!currentUser) return;

    const newPost: Post = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      imageUrl,
      caption,
      catName,
      catBreed,
      location,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    await AsyncStorage.setItem(STORAGE_POSTS, JSON.stringify(updatedPosts));
  }, [currentUser, posts]);

  const likePost = useCallback(async (postId: string) => {
    if (!currentUser) return;

    const existingLike = likes.find(l => l.postId === postId && l.userId === currentUser.id);
    
    if (existingLike) {
      const updatedLikes = likes.filter(l => !(l.postId === postId && l.userId === currentUser.id));
      setLikes(updatedLikes);
      await AsyncStorage.setItem(STORAGE_LIKES, JSON.stringify(updatedLikes));
      
      const updatedPosts = posts.map(p => 
        p.id === postId ? { ...p, likesCount: Math.max(0, p.likesCount - 1) } : p
      );
      setPosts(updatedPosts);
      await AsyncStorage.setItem(STORAGE_POSTS, JSON.stringify(updatedPosts));
    } else {
      const newLike: PostLike = { postId, userId: currentUser.id };
      const updatedLikes = [...likes, newLike];
      setLikes(updatedLikes);
      await AsyncStorage.setItem(STORAGE_LIKES, JSON.stringify(updatedLikes));
      
      const updatedPosts = posts.map(p => 
        p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p
      );
      setPosts(updatedPosts);
      await AsyncStorage.setItem(STORAGE_POSTS, JSON.stringify(updatedPosts));
    }
  }, [currentUser, likes, posts]);

  const isPostLiked = useCallback((postId: string) => {
    if (!currentUser) return false;
    return likes.some(l => l.postId === postId && l.userId === currentUser.id);
  }, [currentUser, likes]);

  const addComment = useCallback(async (postId: string, text: string) => {
    if (!currentUser) return;

    const newComment: PostComment = {
      id: Date.now().toString(),
      postId,
      userId: currentUser.id,
      userName: currentUser.name,
      text,
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    await AsyncStorage.setItem(STORAGE_COMMENTS, JSON.stringify(updatedComments));

    const updatedPosts = posts.map(p => 
      p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
    );
    setPosts(updatedPosts);
    await AsyncStorage.setItem(STORAGE_POSTS, JSON.stringify(updatedPosts));
  }, [currentUser, comments, posts]);

  const getPostComments = useCallback((postId: string) => {
    return comments.filter(c => c.postId === postId).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [comments]);

  const followUser = useCallback(async (targetUserId: string) => {
    if (!currentUser || targetUserId === currentUser.id) return;

    const existingFollow = follows.find(
      f => f.followerId === currentUser.id && f.followingId === targetUserId
    );

    if (existingFollow) {
      const updatedFollows = follows.filter(
        f => !(f.followerId === currentUser.id && f.followingId === targetUserId)
      );
      setFollows(updatedFollows);
      await AsyncStorage.setItem(STORAGE_FOLLOWS, JSON.stringify(updatedFollows));
    } else {
      const newFollow: Follow = {
        followerId: currentUser.id,
        followingId: targetUserId,
        createdAt: new Date().toISOString(),
      };
      const updatedFollows = [...follows, newFollow];
      setFollows(updatedFollows);
      await AsyncStorage.setItem(STORAGE_FOLLOWS, JSON.stringify(updatedFollows));
    }
  }, [currentUser, follows]);

  const isFollowing = useCallback((targetUserId: string) => {
    if (!currentUser) return false;
    return follows.some(f => f.followerId === currentUser.id && f.followingId === targetUserId);
  }, [currentUser, follows]);

  const getFollowersCount = useCallback((userId: string) => {
    return follows.filter(f => f.followingId === userId).length;
  }, [follows]);

  const getFollowingCount = useCallback((userId: string) => {
    return follows.filter(f => f.followerId === userId).length;
  }, [follows]);

  const createEvent = useCallback(async (eventData: Omit<CatEvent, "id" | "organizerId" | "organizerName" | "attendeesCount" | "createdAt">) => {
    if (!currentUser) return;

    const newEvent: CatEvent = {
      ...eventData,
      id: Date.now().toString(),
      organizerId: currentUser.id,
      organizerName: currentUser.name,
      attendeesCount: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedEvents = [newEvent, ...events];
    setEvents(updatedEvents);
    await AsyncStorage.setItem(STORAGE_EVENTS, JSON.stringify(updatedEvents));
  }, [currentUser, events]);

  const attendEvent = useCallback(async (eventId: string) => {
    if (!currentUser) return;

    const existingAttendee = attendees.find(
      a => a.eventId === eventId && a.userId === currentUser.id
    );

    if (existingAttendee) {
      const updatedAttendees = attendees.filter(
        a => !(a.eventId === eventId && a.userId === currentUser.id)
      );
      setAttendees(updatedAttendees);
      await AsyncStorage.setItem(STORAGE_ATTENDEES, JSON.stringify(updatedAttendees));

      const updatedEvents = events.map(e => 
        e.id === eventId ? { ...e, attendeesCount: Math.max(0, e.attendeesCount - 1) } : e
      );
      setEvents(updatedEvents);
      await AsyncStorage.setItem(STORAGE_EVENTS, JSON.stringify(updatedEvents));
    } else {
      const newAttendee: EventAttendee = {
        eventId,
        userId: currentUser.id,
        userName: currentUser.name,
        createdAt: new Date().toISOString(),
      };
      const updatedAttendees = [...attendees, newAttendee];
      setAttendees(updatedAttendees);
      await AsyncStorage.setItem(STORAGE_ATTENDEES, JSON.stringify(updatedAttendees));

      const updatedEvents = events.map(e => 
        e.id === eventId ? { ...e, attendeesCount: e.attendeesCount + 1 } : e
      );
      setEvents(updatedEvents);
      await AsyncStorage.setItem(STORAGE_EVENTS, JSON.stringify(updatedEvents));
    }
  }, [currentUser, attendees, events]);

  const isAttending = useCallback((eventId: string) => {
    if (!currentUser) return false;
    return attendees.some(a => a.eventId === eventId && a.userId === currentUser.id);
  }, [currentUser, attendees]);

  const sendMessage = useCallback(async (receiverId: string, receiverName: string, text: string) => {
    if (!currentUser) return;

    const conversationId = [currentUser.id, receiverId].sort().join("_");
    
    const newMessage: DirectMessage = {
      id: Date.now().toString(),
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId,
      text,
      createdAt: new Date().toISOString(),
      read: false,
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    await AsyncStorage.setItem(STORAGE_MESSAGES, JSON.stringify(updatedMessages));

    const existingConversation = conversations.find(c => c.id === conversationId);
    
    if (existingConversation) {
      const updatedConversations = conversations.map(c => 
        c.id === conversationId 
          ? { ...c, lastMessage: text, lastMessageAt: newMessage.createdAt }
          : c
      );
      setConversations(updatedConversations);
      await AsyncStorage.setItem(STORAGE_CONVERSATIONS, JSON.stringify(updatedConversations));
    } else {
      const newConversation: Conversation = {
        id: conversationId,
        participants: [currentUser.id, receiverId],
        participantNames: {
          [currentUser.id]: currentUser.name,
          [receiverId]: receiverName,
        },
        lastMessage: text,
        lastMessageAt: newMessage.createdAt,
        unreadCount: 0,
      };
      const updatedConversations = [...conversations, newConversation];
      setConversations(updatedConversations);
      await AsyncStorage.setItem(STORAGE_CONVERSATIONS, JSON.stringify(updatedConversations));
    }
  }, [currentUser, messages, conversations]);

  const getConversationMessages = useCallback((conversationId: string) => {
    return messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages]);

  const getUserConversations = useCallback(() => {
    if (!currentUser) return [];
    return conversations
      .filter(c => c.participants.includes(currentUser.id))
      .sort((a, b) => {
        const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [currentUser, conversations]);

  return {
    posts,
    events,
    conversations,
    isLoading,
    createPost,
    likePost,
    isPostLiked,
    addComment,
    getPostComments,
    followUser,
    isFollowing,
    getFollowersCount,
    getFollowingCount,
    createEvent,
    attendEvent,
    isAttending,
    sendMessage,
    getConversationMessages,
    getUserConversations,
  };
});
