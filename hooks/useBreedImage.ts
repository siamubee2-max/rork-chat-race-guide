import { useState, useEffect } from "react";
import { getVerifiedBreedImage, getBreedImage, VERIFIED_BREED_IMAGES } from "@/services/dogApi";

/**
 * Hook to get a verified breed image
 * First returns the pre-verified cached image, then optionally fetches a fresh one
 */
export function useBreedImage(breedId: string, fetchFresh = false) {
  const [imageUrl, setImageUrl] = useState<string>(() => 
    getVerifiedBreedImage(breedId)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!fetchFresh) return;
    
    // Only fetch fresh if not already verified
    if (VERIFIED_BREED_IMAGES[breedId]) return;

    let isMounted = true;
    setIsLoading(true);

    getBreedImage(breedId)
      .then((url) => {
        if (isMounted) {
          setImageUrl(url);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [breedId, fetchFresh]);

  return { imageUrl, isLoading, error };
}

/**
 * Get breed image URL synchronously (for initial render)
 */
export function getBreedImageSync(breedId: string): string {
  return getVerifiedBreedImage(breedId);
}


