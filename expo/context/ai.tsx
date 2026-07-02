import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCats, CatProfile } from "./cats";
import { trpc } from "@/lib/trpc";

export type HealthInsight = {
  id: string;
  catId: string;
  type: "warning" | "tip" | "alert" | "positive";
  category: "weight" | "behavior" | "nutrition" | "health" | "general";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  dismissed?: boolean;
};

export type PhotoAnalysis = {
  id: string;
  catId?: string;
  imageUri: string;
  mood?: string;
  bodyCondition?: string;
  healthObservations?: string[];
  recommendations?: string[];
  analyzedAt: string;
};

export type BehaviorPattern = {
  id: string;
  catId: string;
  pattern: string;
  frequency: "daily" | "weekly" | "occasional";
  sentiment: "positive" | "neutral" | "concerning";
  insights: string[];
  detectedAt: string;
};

const INSIGHTS_KEY = "ai_insights";
const ANALYSES_KEY = "ai_photo_analyses";
const PATTERNS_KEY = "ai_behavior_patterns";

export const [AIContext, useAI] = createContextHook(() => {
  const queryClient = useQueryClient();
  const { cats } = useCats();

  // tRPC mutations
  const aiHealthInsights = trpc.ai.generateHealthInsights.useMutation();
  const aiAnalyzeImage = trpc.ai.analyzeImage.useMutation();
  const aiChat = trpc.ai.chat.useMutation();

  // ---------------------------------------------------------------------------
  // Local storage queries
  // ---------------------------------------------------------------------------
  const insightsQuery = useQuery({
    queryKey: ["ai_insights"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(INSIGHTS_KEY);
        return stored ? (JSON.parse(stored) as HealthInsight[]) : [];
      } catch {
        return [];
      }
    },
    initialData: [],
  });

  const analysesQuery = useQuery({
    queryKey: ["ai_photo_analyses"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(ANALYSES_KEY);
        return stored ? (JSON.parse(stored) as PhotoAnalysis[]) : [];
      } catch {
        return [];
      }
    },
    initialData: [],
  });

  const patternsQuery = useQuery({
    queryKey: ["ai_behavior_patterns"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(PATTERNS_KEY);
        return stored ? (JSON.parse(stored) as BehaviorPattern[]) : [];
      } catch {
        return [];
      }
    },
    initialData: [],
  });

  // ---------------------------------------------------------------------------
  // Generate health insights via OpenAI backend
  // ---------------------------------------------------------------------------
  const generateHealthInsightsMutation = useMutation({
    mutationFn: async (cat: CatProfile) => {
      const recentLogs = (cat.dailyLogs || []).slice(-14);
      const weightHistory = (cat.weightHistory || []).slice(-10);

      const result = await aiHealthInsights.mutateAsync({
        catName: cat.name,
        catAge: cat.birthDate ? calculateAge(cat.birthDate) : undefined,
        recentLogs,
        weightHistory,
        medicalRecords: cat.medicalRecords || [],
      });

      const newInsights: HealthInsight[] = (result.insights || []).map((insight: any, index: number) => ({
        id: `${cat.id}-${Date.now()}-${index}`,
        catId: cat.id,
        type: insight.type as HealthInsight["type"],
        category: insight.category as HealthInsight["category"],
        title: insight.title,
        description: insight.description,
        priority: insight.priority as HealthInsight["priority"],
        createdAt: new Date().toISOString(),
      }));

      const currentInsights = insightsQuery.data || [];
      const filteredInsights = currentInsights.filter((i) => i.catId !== cat.id);
      const updatedInsights = [...filteredInsights, ...newInsights];

      await AsyncStorage.setItem(INSIGHTS_KEY, JSON.stringify(updatedInsights));
      return updatedInsights;
    },
    onSuccess: (updatedInsights) => {
      queryClient.setQueryData(["ai_insights"], updatedInsights);
    },
  });

  // ---------------------------------------------------------------------------
  // Analyze photo via OpenAI Vision backend
  // ---------------------------------------------------------------------------
  const analyzePhotoMutation = useMutation({
    mutationFn: async ({
      imageBase64,
      catId,
    }: {
      imageBase64: string;
      catId?: string;
    }) => {
      const cat = catId ? cats.find((c) => c.id === catId) : null;

      const result = await aiAnalyzeImage.mutateAsync({
        imageBase64,
        catName: cat?.name,
        catAge: cat?.birthDate ? calculateAge(cat.birthDate) : undefined,
      });

      const newAnalysis: PhotoAnalysis = {
        id: `analysis-${Date.now()}`,
        catId,
        imageUri: imageBase64,
        mood: result.mood,
        bodyCondition: result.bodyCondition,
        healthObservations: result.healthObservations,
        recommendations: result.recommendations,
        analyzedAt: new Date().toISOString(),
      };

      const currentAnalyses = analysesQuery.data || [];
      const updatedAnalyses = [newAnalysis, ...currentAnalyses.slice(0, 19)];
      await AsyncStorage.setItem(ANALYSES_KEY, JSON.stringify(updatedAnalyses));
      return { analysis: newAnalysis, allAnalyses: updatedAnalyses };
    },
    onSuccess: ({ allAnalyses }) => {
      queryClient.setQueryData(["ai_photo_analyses"], allAnalyses);
    },
  });

  // ---------------------------------------------------------------------------
  // Behavior analysis — uses chat endpoint with structured prompt
  // ---------------------------------------------------------------------------
  const analyzeBehaviorMutation = useMutation({
    mutationFn: async (cat: CatProfile) => {
      const logs = cat.dailyLogs || [];
      if (logs.length < 3) {
        throw new Error("Not enough data for behavior analysis. Log at least 3 days.");
      }

      const prompt = `Analyze behavior patterns for cat ${cat.name}. Logs: ${JSON.stringify(logs.slice(-30))}. Respond in JSON: {"patterns":[{"pattern":"string","frequency":"daily"|"weekly"|"occasional","sentiment":"positive"|"neutral"|"concerning","insights":["string"]}]}`;

      const result = await aiChat.mutateAsync({
        messages: [{ role: "user", content: prompt }],
        systemPrompt: "You are a veterinary AI. Analyze cat behavior patterns. Return ONLY valid JSON. Respond in French.",
        model: "gpt-4o-mini",
      });

      let parsed: { patterns: any[] } = { patterns: [] };
      try {
        parsed = JSON.parse(result.content);
      } catch {
        console.error("Failed to parse behavior response");
      }

      const newPatterns: BehaviorPattern[] = (parsed.patterns || []).map(
        (p: any, index: number) => ({
          id: `${cat.id}-pattern-${Date.now()}-${index}`,
          catId: cat.id,
          pattern: p.pattern,
          frequency: p.frequency,
          sentiment: p.sentiment,
          insights: p.insights || [],
          detectedAt: new Date().toISOString(),
        })
      );

      const currentPatterns = patternsQuery.data || [];
      const filteredPatterns = currentPatterns.filter((p) => p.catId !== cat.id);
      const updatedPatterns = [...filteredPatterns, ...newPatterns];
      await AsyncStorage.setItem(PATTERNS_KEY, JSON.stringify(updatedPatterns));
      return updatedPatterns;
    },
    onSuccess: (updatedPatterns) => {
      queryClient.setQueryData(["ai_behavior_patterns"], updatedPatterns);
    },
  });

  // ---------------------------------------------------------------------------
  // Dismiss insight
  // ---------------------------------------------------------------------------
  const dismissInsightMutation = useMutation({
    mutationFn: async (insightId: string) => {
      const currentInsights = insightsQuery.data || [];
      const updatedInsights = currentInsights.map((i) =>
        i.id === insightId ? { ...i, dismissed: true } : i
      );
      await AsyncStorage.setItem(INSIGHTS_KEY, JSON.stringify(updatedInsights));
      return updatedInsights;
    },
    onSuccess: (updatedInsights) => {
      queryClient.setQueryData(["ai_insights"], updatedInsights);
    },
  });

  // ---------------------------------------------------------------------------
  // Quick advice
  // ---------------------------------------------------------------------------
  const getQuickAdviceMutation = useMutation({
    mutationFn: async (question: string) => {
      const catsCtx =
        cats.length > 0
          ? `L'utilisateur a ${cats.length} chat(s): ${cats.map((c) => c.name).join(", ")}.`
          : "L'utilisateur n'a pas de chats enregistrés.";

      const result = await aiChat.mutateAsync({
        messages: [{ role: "user", content: `${catsCtx}\n\nQuestion: ${question}` }],
        systemPrompt: "Tu es un assistant vétérinaire. Réponds de manière concise en français.",
        model: "gpt-4o-mini",
      });
      return result.content;
    },
  });

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------
  const insights = useMemo(
    () => (insightsQuery.data || []).filter((i) => !i.dismissed),
    [insightsQuery.data]
  );
  const analyses = useMemo(() => analysesQuery.data || [], [analysesQuery.data]);
  const patterns = useMemo(() => patternsQuery.data || [], [patternsQuery.data]);

  return {
    insights,
    analyses,
    patterns,
    isLoadingInsights: insightsQuery.isLoading,
    getInsightsForCat: (catId: string) => insights.filter((i) => i.catId === catId),
    getPatternsForCat: (catId: string) => patterns.filter((p) => p.catId === catId),
    generateHealthInsights: generateHealthInsightsMutation.mutateAsync,
    isGeneratingInsights: generateHealthInsightsMutation.isPending,
    analyzePhoto: analyzePhotoMutation.mutateAsync,
    isAnalyzingPhoto: analyzePhotoMutation.isPending,
    analyzeBehavior: analyzeBehaviorMutation.mutateAsync,
    isAnalyzingBehavior: analyzeBehaviorMutation.isPending,
    dismissInsight: dismissInsightMutation.mutateAsync,
    getQuickAdvice: getQuickAdviceMutation.mutateAsync,
    isGettingAdvice: getQuickAdviceMutation.isPending,
  };
});

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 12) return `${months} mois`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0
    ? `${years} an${years > 1 ? "s" : ""} et ${rem} mois`
    : `${years} an${years > 1 ? "s" : ""}`;
}
