import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Heart,
  AlertTriangle,
  Phone,
  ChevronDown,
  ChevronUp,
  Thermometer,
  Droplets,
  Wind,
  Bug,
  Pill,
  Bone,
  Eye,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";

type EmergencyGuide = {
  id: string;
  title: string;
  icon: typeof Heart;
  color: string;
  severity: "critical" | "urgent" | "moderate";
  symptoms: string[];
  steps: string[];
  warning?: string;
};

const EMERGENCY_GUIDES: EmergencyGuide[] = [
  {
    id: "poisoning",
    title: "Empoisonnement",
    icon: AlertTriangle,
    color: "#DC2626",
    severity: "critical",
    symptoms: [
      "Vomissements répétés",
      "Diarrhée",
      "Salivation excessive",
      "Tremblements",
      "Convulsions",
      "Pupilles dilatées",
    ],
    steps: [
      "Ne faites PAS vomir le chat",
      "Identifiez le produit ingéré si possible",
      "Appelez immédiatement le centre antipoison",
      "Gardez l'emballage du produit",
      "Notez l'heure d'ingestion estimée",
      "Transportez le chat chez le vétérinaire",
    ],
    warning: "Ne donnez jamais de lait ! Certains produits aggravent les brûlures.",
  },
  {
    id: "choking",
    title: "Étouffement",
    icon: Wind,
    color: "#EF4444",
    severity: "critical",
    symptoms: [
      "Difficulté à respirer",
      "Halètement excessif",
      "Gencives bleues ou grises",
      "Chat qui se gratte la bouche",
      "Incapacité à miauler",
    ],
    steps: [
      "Restez calme, parlez doucement au chat",
      "Ouvrez délicatement la gueule",
      "Cherchez l'objet visible",
      "Retirez-le avec une pince si accessible",
      "Si invisible, manœuvre de Heimlich adaptée",
      "Consultez un vétérinaire même si résolu",
    ],
  },
  {
    id: "heatstroke",
    title: "Coup de chaleur",
    icon: Thermometer,
    color: "#F97316",
    severity: "critical",
    symptoms: [
      "Halètement intense",
      "Bave excessive",
      "Gencives rouge vif",
      "Léthargie extrême",
      "Vomissements",
      "Perte de conscience",
    ],
    steps: [
      "Déplacez le chat dans un endroit frais",
      "Appliquez des linges humides frais (pas glacés)",
      "Mouillez les pattes et les oreilles",
      "Proposez de l'eau fraîche (ne forcez pas)",
      "Ventilez doucement",
      "Transport vétérinaire urgent",
    ],
    warning: "N'utilisez jamais d'eau glacée ! Le refroidissement doit être progressif.",
  },
  {
    id: "bleeding",
    title: "Hémorragie",
    icon: Droplets,
    color: "#DC2626",
    severity: "urgent",
    symptoms: [
      "Saignement visible",
      "Plaie ouverte",
      "Sang dans les urines/selles",
      "Gencives pâles",
      "Faiblesse soudaine",
    ],
    steps: [
      "Appliquez une pression ferme avec un tissu propre",
      "Maintenez pendant 5-10 minutes",
      "Ne retirez pas le tissu imbibé, ajoutez par-dessus",
      "Surélevez la zone si possible",
      "Gardez le chat au chaud",
      "Consultez un vétérinaire rapidement",
    ],
  },
  {
    id: "fracture",
    title: "Fracture / Trauma",
    icon: Bone,
    color: "#9333EA",
    severity: "urgent",
    symptoms: [
      "Boiterie sévère",
      "Membre déformé",
      "Gonflement important",
      "Chat qui refuse de bouger",
      "Cris de douleur",
    ],
    steps: [
      "Ne manipulez pas le membre blessé",
      "Gardez le chat immobile",
      "Placez-le dans une caisse de transport",
      "Maintenez-le au chaud",
      "Ne donnez pas de médicaments humains",
      "Transport vétérinaire urgent",
    ],
    warning: "Ne tentez pas de replacer un os ! Cela peut aggraver les lésions.",
  },
  {
    id: "eye_injury",
    title: "Blessure oculaire",
    icon: Eye,
    color: "#0EA5E9",
    severity: "urgent",
    symptoms: [
      "Œil fermé",
      "Larmoiement excessif",
      "Écoulement coloré",
      "Rougeur intense",
      "Chat qui se frotte l'œil",
    ],
    steps: [
      "Empêchez le chat de se gratter (collerette)",
      "Rincez à l'eau tiède si corps étranger",
      "Ne retirez pas un objet planté",
      "Gardez l'œil propre",
      "Consultez rapidement un vétérinaire",
    ],
  },
  {
    id: "insect_sting",
    title: "Piqûre d'insecte",
    icon: Bug,
    color: "#EAB308",
    severity: "moderate",
    symptoms: [
      "Gonflement localisé",
      "Douleur, léchage de la zone",
      "Rougeur",
      "Réaction allergique possible",
    ],
    steps: [
      "Retirez le dard si visible (avec une carte)",
      "Appliquez du froid (glaçon dans un tissu)",
      "Surveillez les réactions allergiques",
      "Si gonflement du visage/gorge : urgence",
      "Consultez si symptômes persistent",
    ],
    warning: "Attention aux réactions allergiques : gonflement du visage, difficultés respiratoires = URGENCE.",
  },
  {
    id: "vomiting",
    title: "Vomissements répétés",
    icon: Pill,
    color: "#8B5CF6",
    severity: "moderate",
    symptoms: [
      "Plus de 3 vomissements en 24h",
      "Présence de sang",
      "Léthargie",
      "Refus de manger/boire",
      "Douleur abdominale",
    ],
    steps: [
      "Retirez eau et nourriture pendant 2h",
      "Proposez de petites quantités d'eau",
      "Si pas de vomissement, proposez un peu de nourriture",
      "Surveillez la fréquence",
      "Consultez si sang ou persistance > 24h",
    ],
  },
];

const SEVERITY_INFO = {
  critical: { label: "Critique", color: "#DC2626" },
  urgent: { label: "Urgent", color: "#F97316" },
  moderate: { label: "Modéré", color: "#EAB308" },
};

export default function FirstAidScreen() {
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCallEmergency = () => {
    Linking.openURL("tel:0148943100");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Heart size={32} color="#E91E63" />
          </View>
          <Text style={styles.headerTitle}>Premiers secours</Text>
          <Text style={styles.headerSubtitle}>
            Guide d&apos;urgence pour réagir rapidement en cas de problème
          </Text>
        </View>

        <Pressable style={styles.emergencyCard} onPress={handleCallEmergency} accessibilityRole="button" accessibilityLabel="Appeler le Centre Antipoison Animal au 01 48 94 31 00" accessibilityHint="Disponible 24h/24">
          <View style={styles.emergencyLeft}>
            <Phone size={24} color="#fff" />
            <View>
              <Text style={styles.emergencyTitle}>Centre Antipoison Animal</Text>
              <Text style={styles.emergencyNumber}>01 48 94 31 00</Text>
            </View>
          </View>
          <Text style={styles.emergencyHours}>24h/24</Text>
        </Pressable>

        <View style={styles.importantCard}>
          <Text style={styles.importantTitle}>⚠️ Important</Text>
          <Text style={styles.importantText}>
            Ces informations sont un guide de premiers secours et ne remplacent pas une consultation vétérinaire. 
            En cas de doute, consultez toujours un professionnel.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Situations d&apos;urgence</Text>

        {EMERGENCY_GUIDES.map((guide) => {
          const IconComponent = guide.icon;
          const isExpanded = expandedId === guide.id;
          const severityInfo = SEVERITY_INFO[guide.severity];

          return (
            <View key={guide.id} style={styles.guideCard}>
              <Pressable
                style={styles.guideHeader}
                onPress={() => setExpandedId(isExpanded ? null : guide.id)}
                accessibilityRole="button"
                accessibilityLabel={`${guide.title} - ${severityInfo.label}`}
                accessibilityState={{ expanded: isExpanded }}
                accessibilityHint="Appuyez pour voir les détails"
              >
                <View style={[styles.guideIcon, { backgroundColor: guide.color + "20" }]}>
                  <IconComponent size={22} color={guide.color} />
                </View>
                <View style={styles.guideHeaderContent}>
                  <Text style={styles.guideTitle}>{guide.title}</Text>
                  <View style={[styles.severityBadge, { backgroundColor: severityInfo.color + "20" }]}>
                    <Text style={[styles.severityText, { color: severityInfo.color }]}>
                      {severityInfo.label}
                    </Text>
                  </View>
                </View>
                {isExpanded ? (
                  <ChevronUp size={20} color={Colors.textMuted} />
                ) : (
                  <ChevronDown size={20} color={Colors.textMuted} />
                )}
              </Pressable>

              {isExpanded && (
                <View style={styles.guideContent}>
                  <View style={styles.guideSection}>
                    <Text style={styles.guideSectionTitle}>🔍 Symptômes</Text>
                    {guide.symptoms.map((symptom, index) => (
                      <Text key={index} style={styles.listItem}>• {symptom}</Text>
                    ))}
                  </View>

                  <View style={styles.guideSection}>
                    <Text style={styles.guideSectionTitle}>✅ Que faire</Text>
                    {guide.steps.map((step, index) => (
                      <View key={index} style={styles.stepRow}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </View>

                  {guide.warning && (
                    <View style={styles.warningBox}>
                      <AlertTriangle size={18} color={Colors.error} />
                      <Text style={styles.warningText}>{guide.warning}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.kitCard}>
          <Text style={styles.kitTitle}>🩹 Trousse de secours recommandée</Text>
          <View style={styles.kitList}>
            <Text style={styles.kitItem}>• Compresses stériles</Text>
            <Text style={styles.kitItem}>• Bandes de gaze</Text>
            <Text style={styles.kitItem}>• Sparadrap médical</Text>
            <Text style={styles.kitItem}>• Solution antiseptique (Bétadine)</Text>
            <Text style={styles.kitItem}>• Sérum physiologique</Text>
            <Text style={styles.kitItem}>• Pince à épiler</Text>
            <Text style={styles.kitItem}>• Ciseaux à bout rond</Text>
            <Text style={styles.kitItem}>• Collerette de protection</Text>
            <Text style={styles.kitItem}>• Couverture de survie</Text>
            <Text style={styles.kitItem}>• Numéros d&apos;urgence</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E91E6320",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  emergencyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#DC2626",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  emergencyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  emergencyNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
  emergencyHours: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  importantCard: {
    backgroundColor: Colors.warning + "20",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.warning + "40",
  },
  importantTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
  },
  importantText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 14,
  },
  guideCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  guideIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  guideHeaderContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  severityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 11,
    fontWeight: "700",
  },
  guideContent: {
    padding: 14,
    paddingTop: 0,
    gap: 14,
  },
  guideSection: {
    gap: 6,
  },
  guideSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  listItem: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    paddingLeft: 4,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.error + "15",
    borderRadius: 10,
    padding: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: Colors.error,
    lineHeight: 18,
    fontWeight: "500",
  },
  kitCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  kitTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  kitList: {
    gap: 6,
  },
  kitItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
