import React, { useMemo, useLayoutEffect } from "react";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { Image } from "expo-image";
import { HeartPulse, PawPrint, Salad, ShieldAlert, Globe } from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";

import {
  getBreedById,
  BREEDS,
  type BreedProfile,
  type BreedId,
} from "@/constants/breeds";

type Params = {
  breedId?: string | string[];
};

function toId(value: string | string[] | undefined): BreedId | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const exists = BREEDS.some((b) => b.id === raw);
  return exists ? (raw as BreedId) : null;
}

function Section({
  title,
  icon,
  children,
  style,
  testID,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}) {
  return (
    <View style={[styles.section, style]} testID={testID}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>{icon}</View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function BulletList({ items, testID }: { items: string[]; testID?: string }) {
  return (
    <View style={styles.bullets} testID={testID}>
      {items.map((t, idx) => (
        <View key={`${idx}-${t}`} style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <Text style={styles.bulletText}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

export default function BreedDetailsScreen() {
  const params = useLocalSearchParams<Params>();
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= 768;

  const breed = useMemo((): BreedProfile | null => {
    const id = toId(params.breedId);
    return getBreedById(id);
  }, [params.breedId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: breed?.name ?? "Détails",
    });
  }, [breed, navigation]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      testID="breedDetailsScreen"
    >

      {breed ? (
        <>
          <View style={[styles.hero, isTablet && styles.heroTablet]}>
            <Image
              source={{ uri: breed.imageUri }}
              style={styles.heroImage}
              contentFit="cover"
              contentPosition={isTablet ? "center" : "top"}
              transition={120}
            />
            <View style={styles.heroOverlay} />
            <View style={[styles.heroCopy, isTablet && styles.heroCopyTablet]}>
              <Text style={[styles.heroTitle, isTablet && styles.heroTitleTablet]}>{breed.name}</Text>
              <Text style={[styles.heroSubtitle, isTablet && styles.heroSubtitleTablet]}>
                {breed.origin} · {breed.temperament.join(" · ")}
              </Text>
            </View>
          </View>

          <Section
            title="Pelage"
            icon={<PawPrint color="#111" size={18} />}
            testID="breedSectionCoat"
            style={isTablet ? styles.sectionTablet : undefined}
          >
            <View style={styles.pillRow}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Longueur : {breed.coat.length}</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Perte : {breed.coat.shedding}</Text>
              </View>
            </View>
            <BulletList items={breed.coat.notes} testID="breedCoatNotes" />
          </Section>

          <Section
            title="Soins & habitudes"
            icon={<HeartPulse color="#111" size={18} />}
            testID="breedSectionCare"
            style={isTablet ? styles.sectionTablet : undefined}
          >
            <Text style={styles.subheading}>Soins</Text>
            <BulletList items={breed.care.grooming} testID="breedCareGrooming" />
            <Text style={styles.subheading}>Habitudes</Text>
            <BulletList items={breed.care.habits} testID="breedCareHabits" />
            <Text style={styles.subheading}>À surveiller</Text>
            <BulletList items={breed.care.watchouts} testID="breedCareWatchouts" />
          </Section>

          <Section
            title="Santé"
            icon={<ShieldAlert color="#111" size={18} />}
            testID="breedSectionHealth"
            style={isTablet ? styles.sectionTablet : undefined}
          >
            <Text style={styles.subheading}>Maladies fréquentes</Text>
            <BulletList items={breed.health.common} testID="breedHealthCommon" />
            <Text style={styles.subheading}>Spécifiques / risques</Text>
            <BulletList items={breed.health.specific} testID="breedHealthSpecific" />
            <Text style={styles.subheading}>Prévention</Text>
            <BulletList
              items={breed.health.prevention}
              testID="breedHealthPrevention"
            />
            <Text style={styles.subheading}>Consulter si…</Text>
            <BulletList items={breed.health.vetWhen} testID="breedHealthVetWhen" />
          </Section>

          <Section
            title="Alimentation"
            icon={<Salad color="#111" size={18} />}
            testID="breedSectionDiet"
            style={isTablet ? styles.sectionTablet : undefined}
          >
            <Text style={styles.subheading}>Recommandée</Text>
            <BulletList
              items={breed.diet.recommended}
              testID="breedDietRecommended"
            />
            <Text style={styles.subheading}>À éviter</Text>
            <BulletList items={breed.diet.avoid} testID="breedDietAvoid" />
            <Text style={styles.subheading}>Notes</Text>
            <BulletList items={breed.diet.notes} testID="breedDietNotes" />
          </Section>

          <Section
            title="Élevages"
            icon={<Globe color="#111" size={18} />}
            testID="breedSectionBreeders"
            style={isTablet ? styles.sectionTablet : undefined}
          >
             <Text style={styles.breedersText}>
               Trouvez des éleveurs certifiés de {breed.name} dans le monde entier.
             </Text>
             <TouchableOpacity 
                style={styles.breedersButton}
                onPress={() => router.push({
                  pathname: "/(tabs)/(breeds)/breeders" as any,
                  params: { breedId: breed.id }
                })}
             >
                <Globe color="white" size={18} />
                <Text style={styles.breedersButtonText}>Voir les élevages sur la carte</Text>
             </TouchableOpacity>
          </Section>

          <Text style={styles.disclaimer} testID="breedDisclaimer">
            Infos indicatives : chaque chat est unique. En cas de doute (douleur,
            respiration, appétit, selles), contactez un vétérinaire.
          </Text>
        </>
      ) : (
        <View style={styles.empty} testID="breedNotFound">
          <Text style={styles.emptyTitle}>Race introuvable</Text>
          <Text style={styles.emptyText}>
            Cette race n’existe pas encore dans la base. Revenez en arrière et
            choisissez une autre race.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingBottom: 22,
  },
  hero: {
    height: 240,
    margin: 16,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  heroImage: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  heroOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  heroCopy: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 19,
  },
  heroTablet: {
    height: 520,
    margin: 24,
    borderRadius: 28,
  },
  heroCopyTablet: {
    left: 24,
    right: 24,
    bottom: 24,
  },
  heroTitleTablet: {
    fontSize: 36,
  },
  heroSubtitleTablet: {
    fontSize: 16,
    lineHeight: 22,
  },
  sectionTablet: {
    marginHorizontal: 24,
    padding: 20,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#F6F7FB",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "rgba(0,0,0,0.9)",
  },
  sectionBody: {
    marginTop: 10,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  pill: {
    backgroundColor: "rgba(0,0,0,0.06)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "800",
    color: "rgba(0,0,0,0.78)",
  },
  subheading: {
    marginTop: 10,
    marginBottom: 6,
    fontWeight: "900",
    color: "rgba(0,0,0,0.85)",
  },
  bullets: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.35)",
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    color: "rgba(0,0,0,0.7)",
    lineHeight: 19,
  },
  breedersText: {
    fontSize: 14,
    color: "rgba(0,0,0,0.7)",
    marginBottom: 12,
    lineHeight: 20,
  },
  breedersButton: {
    backgroundColor: "#111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  breedersButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  disclaimer: {
    marginTop: 14,
    marginHorizontal: 16,
    color: "rgba(0,0,0,0.55)",
    lineHeight: 18,
    fontSize: 12,
  },
  empty: {
    padding: 20,
    margin: 16,
    borderRadius: 18,
    backgroundColor: "#F6F7FB",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "rgba(0,0,0,0.9)",
  },
  emptyText: {
    marginTop: 8,
    color: "rgba(0,0,0,0.6)",
    lineHeight: 19,
  },
});
