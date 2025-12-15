import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { generateObject, generateText } from "@rork-ai/toolkit-sdk";
import { z } from "zod";
import { useCats, CatProfile } from "./cats";

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

const healthInsightSchema = z.object({
  insights: z.array(z.object({
    type: z.enum(["warning", "tip", "alert", "positive"]),
    category: z.enum(["weight", "behavior", "nutrition", "health", "general"]),
    title: z.string(),
    description: z.string(),
    priority: z.enum(["low", "medium", "high"]),
  })),
});

const photoAnalysisSchema = z.object({
  mood: z.string().describe("The cat's apparent mood (e.g., relaxed, playful, anxious, sleepy)"),
  bodyCondition: z.string().describe("Body condition assessment (underweight, ideal, overweight)"),
  healthObservations: z.array(z.string()).describe("Any visible health observations"),
  recommendations: z.array(z.string()).describe("Care recommendations based on the photo"),
});

const behaviorAnalysisSchema = z.object({
  patterns: z.array(z.object({
    pattern: z.string(),
    frequency: z.enum(["daily", "weekly", "occasional"]),
    sentiment: z.enum(["positive", "neutral", "concerning"]),
    insights: z.array(z.string()),
  })),
});

export const [AIContext, useAI] = createContextHook(() => {
  const queryClient = useQueryClient();
  const { cats } = useCats();

  const insightsQuery = useQuery({
    queryKey: ["ai_insights"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(INSIGHTS_KEY);
        return stored ? (JSON.parse(stored) as HealthInsight[]) : [];
      } catch (e) {
        console.error("Failed to load AI insights", e);
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
      } catch (e) {
        console.error("Failed to load photo analyses", e);
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
      } catch (e) {
        console.error("Failed to load behavior patterns", e);
        return [];
      }
    },
    initialData: [],
  });

  const generateHealthInsightsMutation = useMutation({
    mutationFn: async (cat: CatProfile) => {
      const recentLogs = (cat.dailyLogs || []).slice(-14);
      const weightHistory = (cat.weightHistory || []).slice(-10);
      
      const prompt = `Analyze this cat's health data and provide insights:
Cat: ${cat.name}
Age: ${cat.birthDate ? calculateAge(cat.birthDate) : "Unknown"}
Recent daily logs (last 14 days): ${JSON.stringify(recentLogs)}
Weight history: ${JSON.stringify(weightHistory)}
Medical records: ${JSON.stringify(cat.medicalRecords || [])}

Provide helpful health insights, tips, and any warnings based on patterns in the data. Focus on actionable advice.`;

      const result = await generateObject({
        messages: [{ role: "user", content: prompt }],
        schema: healthInsightSchema,
      });

      const newInsights: HealthInsight[] = result.insights.map((insight, index) => ({
        id: `${cat.id}-${Date.now()}-${index}`,
        catId: cat.id,
        ...insight,
        createdAt: new Date().toISOString(),
      }));

      const currentInsights = insightsQuery.data || [];
      const filteredInsights = currentInsights.filter(i => i.catId !== cat.id);
      const updatedInsights = [...filteredInsights, ...newInsights];
      
      await AsyncStorage.setItem(INSIGHTS_KEY, JSON.stringify(updatedInsights));
      return updatedInsights;
    },
    onSuccess: (updatedInsights) => {
      queryClient.setQueryData(["ai_insights"], updatedInsights);
    },
  });

  const analyzePhotoMutation = useMutation({
    mutationFn: async ({ imageBase64, catId }: { imageBase64: string; catId?: string }) => {
      try {
        const cat = catId ? cats.find(c => c.id === catId) : null;
        
        const prompt = cat 
          ? `Analyze this photo of ${cat.name} (${cat.birthDate ? calculateAge(cat.birthDate) : "unknown age"}). Assess mood, body condition, and any visible health observations.`
          : "Analyze this cat photo. Assess mood, body condition, and any visible health observations.";

        console.log("Starting photo analysis...");
        
        const result = await generateObject({
          messages: [{ 
            role: "user", 
            content: [
              { type: "text", text: prompt },
              { type: "image", image: imageBase64 }
            ]
          }],
          schema: photoAnalysisSchema,
        });

        console.log("Photo analysis result:", result);

        const newAnalysis: PhotoAnalysis = {
          id: `analysis-${Date.now()}`,
          catId,
          imageUri: imageBase64,
          mood: result?.mood || "Inconnu",
          bodyCondition: result?.bodyCondition || "Non déterminé",
          healthObservations: result?.healthObservations || [],
          recommendations: result?.recommendations || [],
          analyzedAt: new Date().toISOString(),
        };

        const currentAnalyses = analysesQuery.data || [];
        const updatedAnalyses = [newAnalysis, ...currentAnalyses.slice(0, 19)];
        
        await AsyncStorage.setItem(ANALYSES_KEY, JSON.stringify(updatedAnalyses));
        return { analysis: newAnalysis, allAnalyses: updatedAnalyses };
      } catch (error) {
        console.error("Photo analysis error:", error);
        throw new Error("L'analyse de la photo a échoué. Veuillez réessayer.");
      }
    },
    onSuccess: ({ allAnalyses }) => {
      queryClient.setQueryData(["ai_photo_analyses"], allAnalyses);
    },
  });

  const analyzeBehaviorMutation = useMutation({
    mutationFn: async (cat: CatProfile) => {
      const logs = cat.dailyLogs || [];
      
      if (logs.length < 3) {
        throw new Error("Not enough data for behavior analysis. Log at least 3 days.");
      }

      const prompt = `Analyze behavior patterns for cat ${cat.name}:
Daily logs: ${JSON.stringify(logs)}

Identify behavioral patterns, their frequency, and provide insights about what they might indicate about the cat's wellbeing.`;

      const result = await generateObject({
        messages: [{ role: "user", content: prompt }],
        schema: behaviorAnalysisSchema,
      });

      const newPatterns: BehaviorPattern[] = result.patterns.map((pattern, index) => ({
        id: `${cat.id}-pattern-${Date.now()}-${index}`,
        catId: cat.id,
        ...pattern,
        detectedAt: new Date().toISOString(),
      }));

      const currentPatterns = patternsQuery.data || [];
      const filteredPatterns = currentPatterns.filter(p => p.catId !== cat.id);
      const updatedPatterns = [...filteredPatterns, ...newPatterns];
      
      await AsyncStorage.setItem(PATTERNS_KEY, JSON.stringify(updatedPatterns));
      return updatedPatterns;
    },
    onSuccess: (updatedPatterns) => {
      queryClient.setQueryData(["ai_behavior_patterns"], updatedPatterns);
    },
  });

  const dismissInsightMutation = useMutation({
    mutationFn: async (insightId: string) => {
      const currentInsights = insightsQuery.data || [];
      const updatedInsights = currentInsights.map(i => 
        i.id === insightId ? { ...i, dismissed: true } : i
      );
      await AsyncStorage.setItem(INSIGHTS_KEY, JSON.stringify(updatedInsights));
      return updatedInsights;
    },
    onSuccess: (updatedInsights) => {
      queryClient.setQueryData(["ai_insights"], updatedInsights);
    },
  });

  const getQuickAdviceMutation = useMutation({
    mutationFn: async (question: string) => {
      const catsContext = cats.length > 0 
        ? `User has ${cats.length} cat(s): ${cats.map(c => `${c.name} (${c.birthDate ? calculateAge(c.birthDate) : "unknown age"})`).join(", ")}.`
        : "User doesn't have any cats registered yet.";

      const response = await generateText({
        messages: [{ 
          role: "user", 
          content: `${catsContext}\n\nQuestion about cats: ${question}\n\nProvide a helpful, concise answer in French.`
        }],
      });

      return response;
    },
  });

  const insights = useMemo(() => 
    (insightsQuery.data || []).filter(i => !i.dismissed),
    [insightsQuery.data]
  );

  const analyses = useMemo(() => analysesQuery.data || [], [analysesQuery.data]);
  const patterns = useMemo(() => patternsQuery.data || [], [patternsQuery.data]);

  const getInsightsForCat = (catId: string) => insights.filter(i => i.catId === catId);
  const getPatternsForCat = (catId: string) => patterns.filter(p => p.catId === catId);

  return {
    insights,
    analyses,
    patterns,
    isLoadingInsights: insightsQuery.isLoading,
    getInsightsForCat,
    getPatternsForCat,
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
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  
  if (months < 12) {
    return `${months} mois`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths > 0 ? `${years} an${years > 1 ? "s" : ""} et ${remainingMonths} mois` : `${years} an${years > 1 ? "s" : ""}`;
}
