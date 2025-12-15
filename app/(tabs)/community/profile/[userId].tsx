import React from "react";
import { useLocalSearchParams, router } from "expo-router";
import { MessageCircle, UserPlus, UserCheck, Grid3x3, MapPin } from "lucide-react-native";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";

import { useSocial, type Post } from "@/context/social";
import { useAuth } from "@/context/auth";
import { Colors } from "@/constants/colors";

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { posts, followUser, isFollowing, getFollowersCount, getFollowingCount } = useSocial();
  const { currentUser, isAuthenticated } = useAuth();

  const userPosts = posts.filter(p => p.userId === userId);
  const firstPost = userPosts[0];
  const userName = firstPost?.userName || "Utilisateur";
  const following = isFollowing(userId || "");
  const followersCount = getFollowersCount(userId || "");
  const followingCount = getFollowingCount(userId || "");
  const isOwnProfile = currentUser?.id === userId;

  const handleFollow = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login" as any);
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await followUser(userId || "");
  };

  const handleMessage = () => {
    if (!isAuthenticated) {
      router.push("/auth/login" as any);
      return;
    }
    router.push(`/(tabs)/community/chat/${[currentUser?.id, userId].sort().join("_")}` as any);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <Pressable 
      style={styles.gridItem}
      onPress={() => router.push(`/(tabs)/community/post/${item.id}` as any)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
    </Pressable>
  );

  const ProfileHeader = () => (
    <View style={styles.header}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{userName}</Text>
        {firstPost?.location && (
          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.textMuted} />
            <Text style={styles.locationText}>{firstPost.location}</Text>
          </View>
        )}
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userPosts.length}</Text>
          <Text style={styles.statLabel}>Publications</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{followersCount}</Text>
          <Text style={styles.statLabel}>Abonnés</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{followingCount}</Text>
          <Text style={styles.statLabel}>Abonnements</Text>
        </View>
      </View>

      {!isOwnProfile && (
        <View style={styles.actions}>
          <Pressable
            style={[styles.followBtn, following && styles.followBtnActive]}
            onPress={handleFollow}
          >
            {following ? (
              <>
                <UserCheck size={18} color={Colors.primary} />
                <Text style={styles.followBtnTextActive}>Abonné</Text>
              </>
            ) : (
              <>
                <UserPlus size={18} color="#fff" />
                <Text style={styles.followBtnText}>Suivre</Text>
              </>
            )}
          </Pressable>
          <Pressable style={styles.messageBtn} onPress={handleMessage}>
            <MessageCircle size={18} color={Colors.text} />
            <Text style={styles.messageBtnText}>Message</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.gridHeader}>
        <Grid3x3 size={20} color={Colors.primary} />
        <Text style={styles.gridHeaderText}>Publications</Text>
      </View>
    </View>
  );

  const EmptyPosts = () => (
    <View style={styles.emptyContainer}>
      <Grid3x3 size={48} color={Colors.textMuted} />
      <Text style={styles.emptyText}>Aucune publication</Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={userPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        numColumns={3}
        ListHeaderComponent={ProfileHeader}
        ListEmptyComponent={EmptyPosts}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#fff",
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  stats: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  followBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  followBtnActive: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  followBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  followBtnTextActive: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary,
  },
  messageBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  gridHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  gridHeaderText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  gridItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 1,
  },
  gridImage: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: 12,
  },
});
