import React, { useState, useRef } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Heart, MessageCircle, Send, MapPin } from "lucide-react-native";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { useSocial, type PostComment } from "@/context/social";
import { useAuth } from "@/context/auth";
import { Colors } from "@/constants/colors";

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { posts, likePost, isPostLiked, addComment, getPostComments } = useSocial();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const [commentText, setCommentText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const post = posts.find(p => p.id === postId);
  const comments = getPostComments(postId || "");
  const liked = isPostLiked(postId || "");

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Publication introuvable</Text>
      </View>
    );
  }

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `il y a ${diffMins}m`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login" as any);
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await likePost(post.id);
  };

  const handleComment = async () => {
    if (!commentText.trim() || !isAuthenticated) {
      if (!isAuthenticated) router.push("/auth/login" as any);
      return;
    }

    await addComment(post.id, commentText.trim());
    setCommentText("");
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderComment = ({ item }: { item: PostComment }) => (
    <View style={styles.comment}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>
          {item.userName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.commentContent}>
        <Text style={styles.commentText}>
          <Text style={styles.commentUser}>{item.userName}</Text>{" "}
          {item.text}
        </Text>
        <Text style={styles.commentTime}>{formatDate(item.createdAt)}</Text>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View>
      <View style={styles.header}>
        <Pressable
          style={styles.userInfo}
          onPress={() => router.push(`/(tabs)/community/profile/${post.userId}` as any)}
          accessibilityRole="button"
          accessibilityLabel={`Profil de ${post.userName}`}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {post.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{post.userName}</Text>
            {post.location && (
              <View style={styles.locationRow}>
                <MapPin size={12} color={Colors.textMuted} />
                <Text style={styles.locationText}>{post.location}</Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>

      <Image source={{ uri: post.imageUrl }} style={styles.image} accessibilityRole="image" accessibilityLabel={`Photo publiée par ${post.userName}`} />

      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={handleLike} accessibilityRole="button" accessibilityLabel={liked ? "Ne plus aimer" : "Aimer"} accessibilityState={{ selected: liked }}>
          <Heart
            size={26}
            color={liked ? Colors.heart : Colors.text}
            fill={liked ? Colors.heart : "transparent"}
          />
          <Text style={[styles.actionText, liked && styles.actionTextLiked]}>
            {post.likesCount}
          </Text>
        </Pressable>
        <View style={styles.actionBtn}>
          <MessageCircle size={26} color={Colors.text} />
          <Text style={styles.actionText}>{post.commentsCount}</Text>
        </View>
      </View>

      <View style={styles.captionContainer}>
        {post.catName && (
          <View style={styles.catTag}>
            <Text style={styles.catTagText}>🐱 {post.catName}</Text>
            {post.catBreed && (
              <Text style={styles.catBreedText}>{post.catBreed}</Text>
            )}
          </View>
        )}
        <Text style={styles.caption}>
          <Text style={styles.captionUser}>{post.userName}</Text>{" "}
          {post.caption}
        </Text>
        <Text style={styles.postTime}>{formatDate(post.createdAt)}</Text>
      </View>

      {comments.length > 0 && (
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>
            Commentaires ({comments.length})
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 12 }]}>
        <TextInput
          style={styles.input}
          placeholder="Ajouter un commentaire..."
          placeholderTextColor={Colors.textMuted}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={300}
          accessibilityRole="text"
          accessibilityLabel="Ajouter un commentaire"
        />
        <Pressable
          style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
          onPress={handleComment}
          disabled={!commentText.trim()}
          accessibilityRole="button"
          accessibilityLabel="Envoyer le commentaire"
          accessibilityState={{ disabled: !commentText.trim() }}
        >
          <Send size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  actions: {
    flexDirection: "row",
    padding: 12,
    gap: 20,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  actionTextLiked: {
    color: Colors.heart,
  },
  captionContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  captionUser: {
    fontWeight: "700",
  },
  postTime: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
  },
  commentsHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  commentsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  comment: {
    flexDirection: "row",
    padding: 12,
    gap: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },
  commentContent: {
    flex: 1,
  },
  commentText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  commentUser: {
    fontWeight: "700",
  },
  commentTime: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
