import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { X, Crown, Zap } from 'lucide-react-native';
import { useSubscription } from '@/hooks/useSubscription';
import { navigate } from '@/utils/navigate';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  feature: string;
  featureName: string;
  benefits?: string[];
}

export function Paywall({
  visible,
  onClose,
  feature,
  featureName,
  benefits = [],
}: PaywallProps) {
  const { subscription, checkLimit } = useSubscription();
  const limit = checkLimit(feature);

  const defaultBenefits = [
    'Scans illimités',
    'Assistant IA illimité',
    'Communauté complète',
    'Support prioritaire',
    'Sans publicité',
  ];

  const allBenefits = benefits.length > 0 ? benefits : defaultBenefits;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6b7280" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Crown size={48} color="#8b5cf6" />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>
              🔒 Limite atteinte
            </Text>
            <Text style={styles.subtitle}>
              Vous avez utilisé {limit.limit} {featureName} ce mois-ci
            </Text>

            {/* Stats */}
            <View style={styles.statsCard}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Plan actuel</Text>
                <Text style={styles.statValue}>
                  {subscription?.tier.toUpperCase() || 'FREE'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Limite mensuelle</Text>
                <Text style={styles.statValue}>
                  {limit.limit === -1 ? 'Illimité' : limit.limit}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Utilisé</Text>
                <Text style={[styles.statValue, { color: '#ef4444' }]}>  
                  {limit.limit}
                </Text>
              </View>
            </View>

            {/* Benefits */}
            <Text style={styles.benefitsTitle}>
              Avec Premium, profitez de :
            </Text>
            {allBenefits.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <Zap size={20} color="#8b5cf6" fill="#8b5cf6" />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}

            {/* Pricing highlight */}
            <View style={styles.pricingCard}>
              <Text style={styles.pricingLabel}>Seulement</Text>
              <Text style={styles.pricingValue}>14,99 $/mois</Text>
              <Text style={styles.pricingSavings}>  
                Économisez 250 $/an vs concurrents
              </Text>
            </View>

            {/* CTA */}
            <Pressable
              style={styles.ctaButton}
              onPress={() => {
                onClose();
                navigate('/(tabs)/subscription');
              }}
            >
              <Crown size={20} color="#fff" />
              <Text style={styles.ctaText}>
                Passer à Premium
              </Text>
            </Pressable>

            {/* Secondary CTA */}
            <Pressable style={styles.secondaryCTA} onPress={onClose}>
              <Text style={styles.secondaryCTAText}>
                Peut-être plus tard
              </Text>
            </Pressable>

            {/* Trust badges */}
            <View style={styles.trustRow}>
              <Text style={styles.trustText}>✓ Essai 14 jours</Text>
              <Text style={styles.trustText}>✓ Sans CB</Text>
              <Text style={styles.trustText}>✓ Annulation 1 clic</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  header: {
    alignItems: 'flex-end',
    paddingVertical: 16,
  },
  closeButton: {
    padding: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  pricingCard: {
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#e9d5ff',
    marginBottom: 4,
  },
  pricingValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  pricingSavings: {
    fontSize: 14,
    color: '#e9d5ff',
  },
  ctaButton: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  secondaryCTA: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryCTAText: {
    fontSize: 14,
    color: '#6b7280',
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  trustText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
});
