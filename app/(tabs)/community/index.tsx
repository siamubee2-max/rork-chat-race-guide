import React, { useState, useCallback } from "react";
import { router } from "expo-router";
import {
  Heart,
  MessageCircle,
  Plus,
  MapPin,
  Calendar,
  Send,
  Users,
  Sparkles,
} from "lucide-react-native";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";

import { useSocial, type Post } from "@/context/social";
import { useAuth } from "@/context/auth";
import { Colors } from "@/constants/colors";
import { PremiumGate } from "@/components/PremiumGate";

type TabType = "feed" | "events" | "messages";

export default function CommunityScreen() {
  const { posts, events, likePost, isPostLiked, getUserConversations } = useSocial();
  const { currentUser, isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("feed");
  const [refreshing, setRefreshing] = useState(false);
  const { t, i18n } = useTranslation();

  const conversations = getUserConversations();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("discussions.justNow");
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return d.toLocaleDateString(i18n.language, { day: "numeric", month: "short" });
  };

  const formatEventDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString(i18n.language, { 
      weekday: "short",
      day: "numeric", 
      month: "short" 
    });
  };

  const handleLike = async (postId: string) => {
    if (!isAuthenticated) {
      router.push("/auth/login" as any);
      return;
    }
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await likePost(postId);
  };

  const handleNewPost = () => {
    if (!isAuthenticated) {
      router.push("/auth/login" as any);
      return;
    }
    router.push("/(tabs)/community/new-post" as any);
  };

  const getEventTypeLabel = (type: string) => {
    return t(`community.eventTypes.${type}`, { defaultValue: type });
  };

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      meetup: Colors.primary,
      adoption: Colors.success,
      show: Colors.accent,
      workshop: Colors.info,
      charity: "#E85D75",
    };
    return colors[type] || Colors.primary;
  };

  const renderPost = ({ item }: { item: Post }) => {
    const liked = isPostLiked(item.id);

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Pressable 
            style={styles.postUser}
            onPress={() => router.push(`/(tabs)/community/profile/${item.userId}` as any)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{item.userName}</Text>
              <View style={styles.postMeta}>
                <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
                {item.location && (
                  <>
                    <Text style={styles.dot}>•</Text>
                    <MapPin size={12} color={Colors.textMuted} />
                    <Text style={styles.locationText}>{item.location}</Text>
                  </>
                )}
              </View>
            </View>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push(`/(tabs)/community/post/${item.id}` as any)}>
          <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
        </Pressable>

        <View style={styles.postActions}>
          <Pressable 
            style={styles.actionBtn}
            onPress={() => handleLike(item.id)}
          >
            <Heart
              size={24}
              color={liked ? Colors.heart : Colors.text}
              fill={liked ? Colors.heart : "transparent"}
            />
            <Text style={[styles.actionText, liked && styles.actionTextLiked]}>
              {item.likesCount}
            </Text>
          </Pressable>
          <Pressable 
            style={styles.actionBtn}
            onPress={() => router.push(`/(tabs)/community/post/${item.id}` as any)}
          >
            <MessageCircle size={24} color={Colors.text} />
            <Text style={styles.actionText}>{item.commentsCount}</Text>
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Send size={22} color={Colors.text} />
          </Pressable>
        </View>

        <View style={styles.postContent}>
          {item.catName && (
            <View style={styles.catTag}>
              <Text style={styles.catTagText}>🐱 {item.catName}</Text>
              {item.catBreed && (
                <Text style={styles.catBreedText}>{item.catBreed}</Text>
              )}
            </View>
          )}
          <Text style={styles.caption}>
            <Text style={styles.captionUser}>{item.userName}</Text>{" "}
            {item.caption}
          </Text>
          {item.commentsCount > 0 && (
            <Pressable onPress={() => router.push(`/(tabs)/community/post/${item.id}` as any)}>
              <Text style={styles.viewComments}>
                {t("community.viewComments", { count: item.commentsCount })}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const renderEvent = ({ item }: { item: typeof events[0] }) => {
    const typeColor = getEventTypeColor(item.type);

    return (
      <Pressable 
        style={styles.eventCard}
        onPress={() => router.push(`/(tabs)/community/event/${item.id}` as any)}
      >
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.eventImage} />
        )}
        <View style={styles.eventContent}>
          <View style={[styles.eventTypeBadge, { backgroundColor: typeColor + "20" }]}>
            <Text style={[styles.eventTypeText, { color: typeColor }]}>
              {getEventTypeLabel(item.type)}
            </Text>
          </View>
          <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.eventInfo}>
            <View style={styles.eventInfoRow}>
              <Calendar size={14} color={Colors.textMuted} />
              <Text style={styles.eventInfoText}>
                {formatEventDate(item.date)} à {item.time}
              </Text>
            </View>
            <View style={styles.eventInfoRow}>
              <MapPin size={14} color={Colors.textMuted} />
              <Text style={styles.eventInfoText} numberOfLines={1}>{item.location}</Text>
            </View>
            <View style={styles.eventInfoRow}>
              <Users size={14} color={Colors.textMuted} />
              <Text style={styles.eventInfoText}>
                {item.attendeesCount} {t("community.participants")}
                {item.maxAttendees && ` / ${item.maxAttendees}`}
              </Text>
            </View>
          </View>
          {item.price && (
            <Text style={styles.eventPrice}>{item.price}</Text>
          )}
        </View>
      </Pressable>
    );
  };

  const renderConversation = ({ item }: { item: typeof conversations[0] }) => {
    const otherUserId = item.participants.find(p => p !== currentUser?.id) || "";
    const otherUserName = item.participantNames[otherUserId] || t("community.user");

    return (
      <Pressable 
        style={styles.conversationCard}
        onPress={() => router.push(`/(tabs)/community/chat/${item.id}` as any)}
      >
        <View style={styles.conversationAvatar}>
          <Text style={styles.conversationAvatarText}>
            {otherUserName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.conversationContent}>
          <Text style={styles.conversationName}>{otherUserName}</Text>
          {item.lastMessage && (
            <Text style={styles.conversationLastMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          )}
        </View>
        {item.lastMessageAt && (
          <Text style={styles.conversationTime}>
            {formatDate(item.lastMessageAt)}
          </Text>
        )}
      </Pressable>
    );
  };

  const FeedEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Sparkles size={48} color={Colors.primaryMuted} />
      </View>
      <Text style={styles.emptyTitle}>{t("community.welcome")}</Text>
      <Text style={styles.emptyText}>
        {t("community.welcomeText")}
      </Text>
      <Pressable style={styles.emptyBtn} onPress={handleNewPost}>
        <Text style={styles.emptyBtnText}>{t("community.publishPhoto")}</Text>
      </Pressable>
    </View>
  );

  const EventsEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Calendar size={48} color={Colors.primaryMuted} />
      </View>
      <Text style={styles.emptyTitle}>{t("community.noEvents")}</Text>
      <Text style={styles.emptyText}>
        {t("community.noEventsText")}
      </Text>
      <Pressable 
        style={styles.emptyBtn} 
        onPress={() => router.push("/(tabs)/community/new-event" as any)}
      >
        <Text style={styles.emptyBtnText}>{t("community.createEvent")}</Text>
      </Pressable>
    </View>
  );

  const MessagesEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Send size={48} color={Colors.primaryMuted} />
      </View>
      <Text style={styles.emptyTitle}>{t("community.noMessages")}</Text>
      <Text style={styles.emptyText}>
        {t("community.noMessagesText")}
      </Text>
    </View>
  );

  return (
    <PremiumGate>
      <View style={styles.screen}>
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === "feed" && styles.tabActive]}
          onPress={() => setActiveTab("feed")}
        >
          <Sparkles 
            size={18} 
            color={activeTab === "feed" ? Colors.primary : Colors.textMuted} 
          />
          <Text style={[styles.tabText, activeTab === "feed" && styles.tabTextActive]}>
            {t("community.feed")}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "events" && styles.tabActive]}
          onPress={() => setActiveTab("events")}
        >
          <Calendar 
            size={18} 
            color={activeTab === "events" ? Colors.primary : Colors.textMuted} 
          />
          <Text style={[styles.tabText, activeTab === "events" && styles.tabTextActive]}>
            {t("community.events")}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "messages" && styles.tabActive]}
          onPress={() => setActiveTab("messages")}
        >
          <Send 
            size={18} 
            color={activeTab === "messages" ? Colors.primary : Colors.textMuted} 
          />
          <Text style={[styles.tabText, activeTab === "messages" && styles.tabTextActive]}>
            {t("community.messages")}
          </Text>
          {conversations.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{conversations.length}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {activeTab === "feed" && (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={[
            styles.feedContent,
            posts.length === 0 && styles.feedContentEmpty,
          ]}
          ListEmptyComponent={FeedEmptyState}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}

      {activeTab === "events" && (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
          contentContainerStyle={[
            styles.eventsContent,
            events.length === 0 && styles.feedContentEmpty,
          ]}
          ListEmptyComponent={EventsEmptyState}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}

      {activeTab === "messages" && (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          contentContainerStyle={[
            styles.messagesContent,
            conversations.length === 0 && styles.feedContentEmpty,
          ]}
          ListEmptyComponent={MessagesEmptyState}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        />
      )}

      {(activeTab === "feed" || activeTab === "events") && (
        <Pressable
          style={[styles.fab, { bottom: insets.bottom + 16 }]}
          onPress={activeTab === "feed" ? handleNewPost : () => router.push("/(tabs)/community/new-event" as any)}
        >
          <Plus size={24} color="#fff" />
        </Pressable>
        )}
      </View>
    </PremiumGate>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 6,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  feedContent: {
    paddingBottom: 100,
  },
  feedContentEmpty: {
    flex: 1,
    justifyContent: "center",
  },
  eventsContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 100,
  },
  messagesContent: {
    padding: 16,
    gap: 8,
  },
  postCard: {
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  postUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  postMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  dot: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  postImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  postActions: {
    flexDirection: "row",
    padding: 12,
    gap: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  actionTextLiked: {
    color: Colors.heart,
  },
  postContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  catTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  catTagText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
  catBreedText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  caption: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  captionUser: {
    fontWeight: "700",
  },
  viewComments: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 8,
  },
  eventCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventImage: {
    width: "100%",
    height: 160,
    backgroundColor: Colors.backgroundSecondary,
  },
  eventContent: {
    padding: 16,
  },
  eventTypeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  eventInfo: {
    gap: 6,
  },
  eventInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventInfoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 12,
  },
  conversationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    gap: 12,
  },
  conversationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  conversationAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  conversationContent: {
    flex: 1,
  },
  conversationName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  conversationLastMessage: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  conversationTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundWarm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  emptyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
