import React, { useRef, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { MapPin, Navigation, ExternalLink } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export type MapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  color?: string;
  emoji?: string;
  onPress?: () => void;
};

type NativeMapProps = {
  latitude: number;
  longitude: number;
  markers?: MapMarker[];
  showUserLocation?: boolean;
  zoomLevel?: number;
  height?: number;
  onMarkerPress?: (marker: MapMarker) => void;
  onMapPress?: (coords: { latitude: number; longitude: number }) => void;
  style?: object;
};

const DEFAULT_DELTA = {
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function NativeMap({
  latitude,
  longitude,
  markers = [],
  showUserLocation = true,
  zoomLevel = 14,
  height = 300,
  onMarkerPress,
  onMapPress,
  style,
}: NativeMapProps) {
  const mapRef = useRef<MapView>(null);

  const initialRegion: Region = useMemo(() => {
    const delta = 0.5 / Math.pow(2, zoomLevel - 10);
    return {
      latitude,
      longitude,
      latitudeDelta: delta,
      longitudeDelta: delta,
    };
  }, [latitude, longitude, zoomLevel]);

  const handleCenterOnUser = useCallback(() => {
    console.log("[NativeMap] centering on user location");
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        ...DEFAULT_DELTA,
      },
      500
    );
  }, [latitude, longitude]);

  const handleOpenInMaps = useCallback(() => {
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
      default: `https://www.google.com/maps/@${latitude},${longitude},${zoomLevel}z`,
    });

    Linking.openURL(url || `https://www.google.com/maps/@${latitude},${longitude},${zoomLevel}z`).catch((err) => {
      console.log("[NativeMap] error opening maps", err);
    });
  }, [latitude, longitude, zoomLevel]);

  const handleMarkerPress = useCallback(
    (marker: MapMarker) => {
      console.log("[NativeMap] marker pressed", marker.id);
      if (marker.onPress) {
        marker.onPress();
      } else if (onMarkerPress) {
        onMarkerPress(marker);
      }
    },
    [onMarkerPress]
  );

  const handleMapPress = useCallback(
    (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
      if (onMapPress) {
        onMapPress(event.nativeEvent.coordinate);
      }
    },
    [onMapPress]
  );

  if (Platform.OS === "web") {
    return (
      <View style={[styles.webContainer, { height }, style]}>
        <View style={styles.webMapPlaceholder}>
          <MapPin size={48} color={Colors.primary} />
          <Text style={styles.webMapTitle}>Carte</Text>
          <Text style={styles.webMapText}>
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </Text>
          <TouchableOpacity
            style={styles.webOpenMapBtn}
            onPress={handleOpenInMaps}
            activeOpacity={0.8}
          >
            <ExternalLink size={18} color="#fff" />
            <Text style={styles.webOpenMapBtnText}>Ouvrir Google Maps</Text>
          </TouchableOpacity>
        </View>

        {markers.length > 0 && (
          <View style={styles.webMarkersList}>
            <Text style={styles.webMarkersTitle}>
              📍 {markers.length} lieu{markers.length > 1 ? "x" : ""}
            </Text>
            {markers.slice(0, 5).map((marker) => (
              <TouchableOpacity
                key={marker.id}
                style={styles.webMarkerItem}
                onPress={() => handleMarkerPress(marker)}
                activeOpacity={0.7}
              >
                <Text style={styles.webMarkerEmoji}>{marker.emoji || "📍"}</Text>
                <View style={styles.webMarkerInfo}>
                  <Text style={styles.webMarkerTitle}>{marker.title}</Text>
                  {marker.description && (
                    <Text style={styles.webMarkerDesc} numberOfLines={1}>
                      {marker.description}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onPress={handleMapPress}
        mapType="standard"
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            description={marker.description}
            pinColor={marker.color || Colors.primary}
            onPress={() => handleMarkerPress(marker)}
          />
        ))}
      </MapView>

      <View style={styles.mapControls}>
        <TouchableOpacity
          style={styles.mapControlBtn}
          onPress={handleCenterOnUser}
          activeOpacity={0.8}
        >
          <Navigation size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mapControlBtn}
          onPress={handleOpenInMaps}
          activeOpacity={0.8}
        >
          <ExternalLink size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function MapLoadingPlaceholder({ height = 300 }: { height?: number }) {
  return (
    <View style={[styles.loadingContainer, { height }]}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>Chargement de la carte...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.backgroundCard,
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: "absolute",
    right: 12,
    top: 12,
    gap: 8,
  },
  mapControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  webContainer: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.backgroundCard,
  },
  webMapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundSecondary,
    padding: 24,
    gap: 12,
  },
  webMapTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  webMapText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  webOpenMapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 8,
  },
  webOpenMapBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  webMarkersList: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  webMarkersTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  webMarkerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
  },
  webMarkerEmoji: {
    fontSize: 20,
  },
  webMarkerInfo: {
    flex: 1,
  },
  webMarkerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  webMarkerDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  loadingContainer: {
    borderRadius: 16,
    backgroundColor: Colors.backgroundCard,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
