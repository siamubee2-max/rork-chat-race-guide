import createContextHook from "@nkzw/create-context-hook";
import * as Location from "expo-location";
import { useCallback, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";

export type LocationPermissionState =
  | "unknown"
  | "granted"
  | "denied"
  | "unavailable";

export type UserCoords = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  altitudeMeters?: number;
  headingDegrees?: number;
  speedMps?: number;
  timestampMs: number;
};

export type UserAddress = {
  label: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
};

type LocationErrorCode =
  | "permission_denied"
  | "timeout"
  | "unavailable"
  | "unknown";

export type LocationError = {
  code: LocationErrorCode;
  message: string;
};

type WebGeolocationPosition = {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
};

type WebGeolocationError = {
  code: number;
  message: string;
};

function toUserCoords(pos: WebGeolocationPosition): UserCoords {
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    accuracyMeters: Number.isFinite(pos.coords.accuracy)
      ? pos.coords.accuracy
      : undefined,
    altitudeMeters:
      pos.coords.altitude == null ? undefined : pos.coords.altitude,
    headingDegrees: pos.coords.heading == null ? undefined : pos.coords.heading,
    speedMps: pos.coords.speed == null ? undefined : pos.coords.speed,
    timestampMs: pos.timestamp,
  };
}

function toAddressLabelFromExpo(r: Location.LocationGeocodedAddress): UserAddress {
  const parts = [
    r.name,
    r.street,
    r.postalCode,
    r.city,
    r.region,
    r.country,
  ].filter(Boolean);

  const label = parts.join(", ") || "Position actuelle";

  return {
    label,
    city: r.city ?? undefined,
    region: r.region ?? undefined,
    postalCode: r.postalCode ?? undefined,
    country: r.country ?? undefined,
  };
}

function mapWebError(e: WebGeolocationError): LocationError {
  if (e.code === 1) {
    return {
      code: "permission_denied",
      message: "Autorisation de localisation refusée.",
    };
  }
  if (e.code === 3) {
    return {
      code: "timeout",
      message: "Délai dépassé pour obtenir votre position.",
    };
  }
  return {
    code: "unknown",
    message: e.message || "Impossible d'obtenir votre position.",
  };
}

export const [UserLocationProvider, useUserLocation] = createContextHook(() => {
  const [permission, setPermission] = useState<LocationPermissionState>("unknown");
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [address, setAddress] = useState<UserAddress | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [error, setError] = useState<LocationError | null>(null);

  const watchSubscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const stopWatching = useCallback(() => {
    console.log("[UserLocation] stopWatching");
    try {
      watchSubscriptionRef.current?.remove();
    } catch (e) {
      console.log("[UserLocation] stopWatching remove error", e);
    } finally {
      watchSubscriptionRef.current = null;
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<LocationPermissionState> => {
    console.log("[UserLocation] requestPermission start", { platform: Platform.OS });

    if (Platform.OS === "web") {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setPermission("unavailable");
        setError({
          code: "unavailable",
          message: "La géolocalisation n'est pas disponible sur cet appareil.",
        });
        console.log("[UserLocation] web geolocation unavailable");
        return "unavailable";
      }

      setError(null);
      setPermission((prev) => (prev === "denied" ? "denied" : "unknown"));
      console.log("[UserLocation] web permission handled by browser prompt");
      return "unknown";
    }

    try {
      const res = await Location.requestForegroundPermissionsAsync();
      const nextPerm: LocationPermissionState =
        res.status === "granted" ? "granted" : "denied";
      setPermission(nextPerm);

      if (nextPerm !== "granted") {
        setError({
          code: "permission_denied",
          message:
            "Autorisez la localisation pour utiliser votre position exacte.",
        });
      }

      console.log("[UserLocation] requestPermission result", res);
      return nextPerm;
    } catch (e) {
      console.log("[UserLocation] requestPermission error", e);
      setPermission("unavailable");
      setError({
        code: "unavailable",
        message: "Impossible d'accéder au service de localisation.",
      });
      return "unavailable";
    }
  }, []);

  const reverseGeocodeIfPossible = useCallback(async (c: UserCoords) => {
    if (Platform.OS === "web") {
      setAddress({ label: `${c.latitude.toFixed(6)}, ${c.longitude.toFixed(6)}` });
      return;
    }

    try {
      console.log("[UserLocation] reverseGeocode start", c);
      const results = await Location.reverseGeocodeAsync({
        latitude: c.latitude,
        longitude: c.longitude,
      });
      const first = results[0];
      if (first) {
        setAddress(toAddressLabelFromExpo(first));
      } else {
        setAddress({ label: `${c.latitude.toFixed(6)}, ${c.longitude.toFixed(6)}` });
      }
      console.log("[UserLocation] reverseGeocode success", results?.[0] ?? null);
    } catch (e) {
      console.log("[UserLocation] reverseGeocode error", e);
      setAddress({ label: `${c.latitude.toFixed(6)}, ${c.longitude.toFixed(6)}` });
    }
  }, []);

  const locateOnce = useCallback(async () => {
    console.log("[UserLocation] locateOnce start");
    setIsLocating(true);
    setError(null);

    if (Platform.OS === "web") {
      const perm = await requestPermission();
      if (perm === "unavailable") {
        setIsLocating(false);
        return;
      }

      try {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (p) => {
              const c = toUserCoords(p as unknown as WebGeolocationPosition);
              console.log("[UserLocation] web locateOnce success", c);
              setPermission("granted");
              setCoords(c);
              void reverseGeocodeIfPossible(c);
              resolve();
            },
            (e) => {
              const mapped = mapWebError(e as unknown as WebGeolocationError);
              console.log("[UserLocation] web locateOnce error", mapped);
              setError(mapped);
              setPermission(mapped.code === "permission_denied" ? "denied" : "unknown");
              resolve();
            },
            {
              enableHighAccuracy: true,
              timeout: 20000,
              maximumAge: 0,
            },
          );
        });
      } catch (e) {
        console.log("[UserLocation] web locateOnce exception", e);
        setError({
          code: "unknown",
          message: "Impossible d'obtenir votre position.",
        });
      } finally {
        setIsLocating(false);
      }

      return;
    }

    const perm = await requestPermission();
    if (perm !== "granted") {
      setIsLocating(false);
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        mayShowUserSettingsDialog: true,
      });

      const c: UserCoords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracyMeters: loc.coords.accuracy ?? undefined,
        altitudeMeters: loc.coords.altitude ?? undefined,
        headingDegrees: loc.coords.heading ?? undefined,
        speedMps: loc.coords.speed ?? undefined,
        timestampMs: loc.timestamp,
      };

      console.log("[UserLocation] native locateOnce success", c);
      setCoords(c);
      void reverseGeocodeIfPossible(c);
    } catch (e) {
      console.log("[UserLocation] locateOnce error", e);
      setError({
        code: "unknown",
        message: "Impossible d'obtenir votre position.",
      });
    } finally {
      setIsLocating(false);
    }
  }, [requestPermission, reverseGeocodeIfPossible]);

  const startWatching = useCallback(async () => {
    console.log("[UserLocation] startWatching start");

    if (Platform.OS === "web") {
      const perm = await requestPermission();
      if (perm === "unavailable") return;

      stopWatching();

      const watchId = navigator.geolocation.watchPosition(
        (p) => {
          const c = toUserCoords(p as unknown as WebGeolocationPosition);
          console.log("[UserLocation] web watch update", c);
          setPermission("granted");
          setCoords(c);
          void reverseGeocodeIfPossible(c);
        },
        (e) => {
          const mapped = mapWebError(e as unknown as WebGeolocationError);
          console.log("[UserLocation] web watch error", mapped);
          setError(mapped);
          setPermission(mapped.code === "permission_denied" ? "denied" : "unknown");
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 20000,
        },
      );

      watchSubscriptionRef.current = {
        remove: () => {
          try {
            navigator.geolocation.clearWatch(watchId);
          } catch {}
        },
      } as unknown as Location.LocationSubscription;

      return;
    }

    const perm = await requestPermission();
    if (perm !== "granted") return;

    stopWatching();

    try {
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 1000,
          distanceInterval: 2,
          mayShowUserSettingsDialog: true,
        },
        (loc) => {
          const c: UserCoords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracyMeters: loc.coords.accuracy ?? undefined,
            altitudeMeters: loc.coords.altitude ?? undefined,
            headingDegrees: loc.coords.heading ?? undefined,
            speedMps: loc.coords.speed ?? undefined,
            timestampMs: loc.timestamp,
          };

          console.log("[UserLocation] native watch update", c);
          setCoords(c);
          void reverseGeocodeIfPossible(c);
        },
      );

      watchSubscriptionRef.current = sub;
    } catch (e) {
      console.log("[UserLocation] startWatching error", e);
      setError({
        code: "unknown",
        message: "Impossible d'activer le suivi de position.",
      });
    }
  }, [requestPermission, reverseGeocodeIfPossible, stopWatching]);

  const value = useMemo(
    () => ({
      permission,
      coords,
      address,
      isLocating,
      error,
      requestPermission,
      locateOnce,
      startWatching,
      stopWatching,
    }),
    [
      address,
      coords,
      error,
      isLocating,
      locateOnce,
      permission,
      requestPermission,
      startWatching,
      stopWatching,
    ],
  );

  return value;
});
