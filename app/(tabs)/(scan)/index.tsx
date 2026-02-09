import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Paywall } from '@/components/Paywall';

export default function ScanScreen() {
  const { canUseFeature, incrementUsage, checkLimit } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  
  const scanLimit = checkLimit('scans');

  const handleScan = async () => {
    // Vérifier si peut utiliser
    if (!canUseFeature('scans')) {
      setShowPaywall(true);
      return;
    }

    // Effectuer le scan
    try {
      // ... votre logique de scan
      
      // Incrémenter usage
      await incrementUsage('scans');
      
    } catch (error) {
      console.error('Scan error:', error);
    }
  };

  return (
    <View>
      {/* Votre UI de scan */} 
      
      {/* Afficher limite restante */}
      {scanLimit.limit !== -1 && (
        <Text>
          {scanLimit.remaining} scans restants ce mois-ci
        </Text>
      )}
      
      <Button onPress={handleScan}>
        Scanner
      </Button>

      {/* Paywall modal */}
      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="scans"
        featureName="scans"
        benefits={[
          'Scans illimités',
          'Reconnaissance 400+ races',
          'Historique complet',
          'Export résultats PDF',
        ]}
      />
    </View>
  );
}