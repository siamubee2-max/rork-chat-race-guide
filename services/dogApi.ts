/**
 * The Dog API Service
 * Provides verified breed images from https://thedogapi.com
 */

// Mapping between our breed IDs and The Dog API breed IDs
export const DOG_API_BREED_MAP: Record<string, string> = {
  "labrador-retriever": "149",
  "golden-retriever": "103",
  "french-bulldog": "86",
  "german-shepherd": "96",
  "poodle": "179",
  "bulldog": "40",
  "beagle": "16",
  "rottweiler": "194",
  "yorkshire-terrier": "230",
  "dachshund": "65",
  "siberian-husky": "204",
  "doberman": "76",
  "great-dane": "108",
  "shih-tzu": "203",
  "australian-shepherd": "11",
  "border-collie": "26",
  "cavalier-king-charles": "51",
  "maltese": "158",
  "chihuahua": "55",
  "boxer": "30",
  "bernese-mountain-dog": "22",
  "pomeranian": "178",
  "havanese": "120",
  "shetland-sheepdog": "199",
  "english-springer-spaniel": "80",
  "brittany": "36",
  "cocker-spaniel": "58",
  "miniature-schnauzer": "163",
  "weimaraner": "226",
  "saint-bernard": "196",
  "belgian-malinois": "18",
  "basset-hound": "14",
  "pembroke-welsh-corgi": "172",
  "vizsla": "222",
  "newfoundland": "167",
  "bichon-frise": "24",
  "bloodhound": "25",
  "dalmatian": "67",
  "akita": "1",
  "alaskan-malamute": "2",
  "american-staffordshire-terrier": "7",
  "american-bulldog": "4",
  "australian-cattle-dog": "10",
  "chow-chow": "57",
  "collie": "60",
  "english-cocker-spaniel": "79",
  "english-setter": "81",
  "flat-coated-retriever": "85",
  "german-shorthaired-pointer": "98",
  "greyhound": "110",
  "irish-setter": "132",
  "jack-russell-terrier": "137",
  "labradoodle": "148",
  "lhasa-apso": "152",
  "mastiff": "161",
  "miniature-pinscher": "162",
  "old-english-sheepdog": "169",
  "papillon": "171",
  "pug": "189",
  "rhodesian-ridgeback": "192",
  "samoyed": "197",
  "shiba-inu": "200",
  "soft-coated-wheaten-terrier": "211",
  "standard-schnauzer": "214",
  "bull-terrier": "41",
  "west-highland-white-terrier": "227",
  "whippet": "228",
};

const BASE_URL = "https://api.thedogapi.com/v1";

export interface DogApiImage {
  id: string;
  url: string;
  width: number;
  height: number;
}

export interface DogApiBreed {
  id: string;
  name: string;
  description?: string;
  origin?: string;
  life_span: string;
  temperament: string;
  image?: DogApiImage;
}

/**
 * Get breed image URL from The Dog API
 * @param breedId Our internal breed ID
 * @returns Image URL or fallback
 */
export async function getBreedImage(breedId: string): Promise<string> {
  const dogApiBreedId = DOG_API_BREED_MAP[breedId];

  if (!dogApiBreedId) {
    return `https://cdn2.thedogapi.com/images/${breedId}.jpg`;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/images/search?breed_ids=${dogApiBreedId}&limit=1`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch breed image");
    }

    const data: DogApiImage[] = await response.json();

    if (data.length > 0 && data[0].url) {
      return data[0].url;
    }

    const breedResponse = await fetch(`${BASE_URL}/breeds/${dogApiBreedId}`);
    if (breedResponse.ok) {
      const breedData: DogApiBreed = await breedResponse.json();
      if (breedData.image?.url) {
        return breedData.image.url;
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch image for breed ${breedId}:`, error);
  }

  return `https://cdn2.thedogapi.com/images/${dogApiBreedId || breedId}.jpg`;
}

/**
 * Get multiple breed images in batch
 * @param breedIds Array of our internal breed IDs
 * @returns Map of breedId to image URL
 */
export async function getBreedImages(
  breedIds: string[]
): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();

  try {
    const response = await fetch(`${BASE_URL}/breeds`);
    if (response.ok) {
      const breeds: DogApiBreed[] = await response.json();

      const reverseMap = new Map<string, string>();
      Object.entries(DOG_API_BREED_MAP).forEach(([ourId, dogApiId]) => {
        reverseMap.set(dogApiId, ourId);
      });

      breeds.forEach((breed) => {
        const ourBreedId = reverseMap.get(String(breed.id));
        if (ourBreedId && breed.image?.url && breedIds.includes(ourBreedId)) {
          imageMap.set(ourBreedId, breed.image.url);
        }
      });
    }
  } catch (error) {
    console.warn("Failed to fetch breed images batch:", error);
  }

  return imageMap;
}

/**
 * Get all breed data from The Dog API
 */
export async function getAllDogApiBreeds(): Promise<DogApiBreed[]> {
  try {
    const response = await fetch(`${BASE_URL}/breeds`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn("Failed to fetch all breeds:", error);
  }
  return [];
}

// Alias for backward compatibility
export const getAllCatApiBreeds = getAllDogApiBreeds;

// Pre-verified high-quality dog breed images
export const VERIFIED_BREED_IMAGES: Record<string, string> = {
  "labrador-retriever": "https://cdn2.thedogapi.com/images/HyWNfxc47.jpg",
  "golden-retriever": "https://cdn2.thedogapi.com/images/HJ6XSKS47.jpg",
  "french-bulldog": "https://cdn2.thedogapi.com/images/HyRzNEdEm.jpg",
  "german-shepherd": "https://cdn2.thedogapi.com/images/SJyBfg5Nm.jpg",
  "poodle": "https://cdn2.thedogapi.com/images/SJTRsVcNQ.jpg",
  "bulldog": "https://cdn2.thedogapi.com/images/B1uW7l5VX.jpg",
  "beagle": "https://cdn2.thedogapi.com/images/Syd4xxqEm.jpg",
  "rottweiler": "https://cdn2.thedogapi.com/images/ry1bSxqN7.jpg",
  "yorkshire-terrier": "https://cdn2.thedogapi.com/images/B1-llgcEQ.jpg",
  "dachshund": "https://cdn2.thedogapi.com/images/SkDCcl5Em.jpg",
  "siberian-husky": "https://cdn2.thedogapi.com/images/S17nr-qNm.jpg",
  "doberman": "https://cdn2.thedogapi.com/images/B1E6Nl5V7.jpg",
  "great-dane": "https://cdn2.thedogapi.com/images/HJRzcgcEm.jpg",
  "shih-tzu": "https://cdn2.thedogapi.com/images/HkC62lqNm.jpg",
  "australian-shepherd": "https://cdn2.thedogapi.com/images/rJ3Xx35V7.jpg",
  "border-collie": "https://cdn2.thedogapi.com/images/sGQvQUpsp.jpg",
  "cavalier-king-charles": "https://cdn2.thedogapi.com/images/HJxTIg5N7.jpg",
  "maltese": "https://cdn2.thedogapi.com/images/rkMNke5V7.jpg",
  "chihuahua": "https://cdn2.thedogapi.com/images/4GVhQ5lGO.jpg",
  "boxer": "https://cdn2.thedogapi.com/images/rkb1Hl9E7.jpg",
  "bernese-mountain-dog": "https://cdn2.thedogapi.com/images/S13_qx94X.jpg",
  "pomeranian": "https://cdn2.thedogapi.com/images/BJ6KSl94Q.jpg",
  "havanese": "https://cdn2.thedogapi.com/images/HkGf8l5Vm.jpg",
  "shetland-sheepdog": "https://cdn2.thedogapi.com/images/SyH5Ie547.jpg",
  "english-springer-spaniel": "https://cdn2.thedogapi.com/images/SJU52gcNm.jpg",
  "brittany": "https://cdn2.thedogapi.com/images/HyTwIg947.jpg",
  "cocker-spaniel": "https://cdn2.thedogapi.com/images/HkY8El547.jpg",
  "miniature-schnauzer": "https://cdn2.thedogapi.com/images/HkRREl9N7.jpg",
  "weimaraner": "https://cdn2.thedogapi.com/images/BJhiUx5V7.jpg",
  "saint-bernard": "https://cdn2.thedogapi.com/images/Hk27Il947.jpg",
  "belgian-malinois": "https://cdn2.thedogapi.com/images/rJmuBl9VQ.jpg",
  "basset-hound": "https://cdn2.thedogapi.com/images/HJRPBlqNm.jpg",
  "pembroke-welsh-corgi": "https://cdn2.thedogapi.com/images/ry1A8e5EQ.jpg",
  "vizsla": "https://cdn2.thedogapi.com/images/ByF_Ux9N7.jpg",
  "newfoundland": "https://cdn2.thedogapi.com/images/ryQdLlcV7.jpg",
  "bichon-frise": "https://cdn2.thedogapi.com/images/HJFv8x5V7.jpg",
  "dalmatian": "https://cdn2.thedogapi.com/images/HJRKUx5Vm.jpg",
  "akita": "https://cdn2.thedogapi.com/images/BFRYBufpm.jpg",
  "alaskan-malamute": "https://cdn2.thedogapi.com/images/B1Io8g9Nm.jpg",
  "chow-chow": "https://cdn2.thedogapi.com/images/Bk5n8lcVm.jpg",
  "collie": "https://cdn2.thedogapi.com/images/BHBz8e5Nm.jpg",
  "greyhound": "https://cdn2.thedogapi.com/images/SJrQ8l9Vm.jpg",
  "irish-setter": "https://cdn2.thedogapi.com/images/S1gHLlcNm.jpg",
  "jack-russell-terrier": "https://cdn2.thedogapi.com/images/S1ojIx5E7.jpg",
  "lhasa-apso": "https://cdn2.thedogapi.com/images/HkHcLg9Vm.jpg",
  "mastiff": "https://cdn2.thedogapi.com/images/r1MFLecNm.jpg",
  "old-english-sheepdog": "https://cdn2.thedogapi.com/images/r1s3LxqNm.jpg",
  "papillon": "https://cdn2.thedogapi.com/images/B1hpUxcNm.jpg",
  "pug": "https://cdn2.thedogapi.com/images/H1b3Nl94Q.jpg",
  "rhodesian-ridgeback": "https://cdn2.thedogapi.com/images/Byxp8gqVQ.jpg",
  "samoyed": "https://cdn2.thedogapi.com/images/BJ4D8lqE7.jpg",
  "shiba-inu": "https://cdn2.thedogapi.com/images/Zn3IIoS7C.jpg",
  "bull-terrier": "https://cdn2.thedogapi.com/images/Ber2LecVm.jpg",
  "west-highland-white-terrier": "https://cdn2.thedogapi.com/images/ByZ98gqNm.jpg",
  "whippet": "https://cdn2.thedogapi.com/images/BJl-Ux547.jpg",
};

/**
 * Get verified breed image (synchronous, using pre-cached URLs)
 */
export function getVerifiedBreedImage(breedId: string): string {
  return VERIFIED_BREED_IMAGES[breedId] ||
    `https://cdn2.thedogapi.com/images/${DOG_API_BREED_MAP[breedId] || breedId}.jpg`;
}

// Aliases for backward compatibility with catApi imports
export const CAT_API_BREED_MAP = DOG_API_BREED_MAP;
export const CatApiImage = DogApiImage;
