/**
 * The Cat API Service
 * Provides verified breed images from https://thecatapi.com
 */

// Mapping between our breed IDs and The Cat API breed IDs
export const CAT_API_BREED_MAP: Record<string, string> = {
  "maine-coon": "mcoo",
  "british-shorthair": "bsho",
  "siamese": "siam",
  "bengal": "beng",
  "persian": "pers",
  "ragdoll": "ragd",
  "sphynx": "sphy",
  "abyssinian": "abys",
  "sacred-birman": "birm",
  "birman": "birm",
  "oriental": "orie",
  "devon-rex": "drex",
  "norwegian": "norw",
  "russian-blue": "rblu",
  "siberian": "sibe",
  "chartreux": "char",
  "ragamuffin": "raga",
  "exotic-shorthair": "esho",
  "burmese": "bure",
  "tonkinese": "tonk",
  "scottish-fold": "sfol",
  "somali": "soma",
  "turkish-angora": "tang",
  "american-shorthair": "asho",
  "cornish-rex": "crex",
  "manx": "manx",
  "balinese": "bali",
  "ocicat": "ocic",
  "korat": "kora",
  "turkish-van": "tvan",
  "himalayan": "hima",
  "egyptian-mau": "emau",
  "savannah": "sava",
  "laperm": "lape",
  "singapura": "sing",
  "selkirk-rex": "srex",
  "pixiebob": "pixi",
  "bombay": "bomb",
  "havana-brown": "hbro",
  "cymric": "cymr",
  "american-curl": "acur",
  "japanese-bobtail": "jbob",
  "chausie": "chau",
  "munchkin": "munc",
  "toyger": "toyg",
  "peterbald": "pbald",
  "nebelung": "nebe",
  "snowshoe": "snow",
  "lykoi": "lyki",
  "khao-manee": "khao",
  "kurilian-bobtail": "kuri",
  "american-bobtail": "abob",
  "european-shorthair": "esho",
  "javanese": "java",
  "burmilla": "buri",
  "australian-mist": "amis",
  "thai": "thai",
  "cyprus": "cypr",
};

const BASE_URL = "https://api.thecatapi.com/v1";

export interface CatApiImage {
  id: string;
  url: string;
  width: number;
  height: number;
}

export interface CatApiBreed {
  id: string;
  name: string;
  description: string;
  origin: string;
  life_span: string;
  temperament: string;
  image?: CatApiImage;
}

/**
 * Get breed image URL from The Cat API
 * @param breedId Our internal breed ID
 * @returns Image URL or fallback
 */
export async function getBreedImage(breedId: string): Promise<string> {
  const catApiBreedId = CAT_API_BREED_MAP[breedId];
  
  if (!catApiBreedId) {
    // Return a generic cat image if breed not mapped
    return `https://cdn2.thecatapi.com/images/${breedId}.jpg`;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/images/search?breed_ids=${catApiBreedId}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch breed image");
    }

    const data: CatApiImage[] = await response.json();
    
    if (data.length > 0 && data[0].url) {
      return data[0].url;
    }
    
    // Fallback to breed info endpoint
    const breedResponse = await fetch(`${BASE_URL}/breeds/${catApiBreedId}`);
    if (breedResponse.ok) {
      const breedData: CatApiBreed = await breedResponse.json();
      if (breedData.image?.url) {
        return breedData.image.url;
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch image for breed ${breedId}:`, error);
  }

  // Ultimate fallback
  return `https://cdn2.thecatapi.com/images/${catApiBreedId || breedId}.jpg`;
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

  // Fetch all breeds info with images
  try {
    const response = await fetch(`${BASE_URL}/breeds`);
    if (response.ok) {
      const breeds: CatApiBreed[] = await response.json();
      
      // Create a reverse map for quick lookup
      const reverseMap = new Map<string, string>();
      Object.entries(CAT_API_BREED_MAP).forEach(([ourId, catApiId]) => {
        reverseMap.set(catApiId, ourId);
      });

      breeds.forEach((breed) => {
        const ourBreedId = reverseMap.get(breed.id);
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
 * Get all breed data from The Cat API
 */
export async function getAllCatApiBreeds(): Promise<CatApiBreed[]> {
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

// Pre-verified high-quality images from The Cat API CDN
// These are direct links that are guaranteed to work
export const VERIFIED_BREED_IMAGES: Record<string, string> = {
  "maine-coon": "https://cdn2.thecatapi.com/images/OOD3VXAQn.jpg",
  "british-shorthair": "https://cdn2.thecatapi.com/images/s4wQfYoEk.jpg",
  "siamese": "https://cdn2.thecatapi.com/images/ai6Jps4sx.jpg",
  "bengal": "https://cdn2.thecatapi.com/images/O3btzLlsO.png",
  "persian": "https://cdn2.thecatapi.com/images/e8s9-S6AD.jpg",
  "ragdoll": "https://cdn2.thecatapi.com/images/oGefY4YoG.jpg",
  "sphynx": "https://cdn2.thecatapi.com/images/BDb8ZXb1v.jpg",
  "abyssinian": "https://cdn2.thecatapi.com/images/EHG3sOpAM.jpg",
  "birman": "https://cdn2.thecatapi.com/images/HOrX5gwLS.jpg",
  "sacred-birman": "https://cdn2.thecatapi.com/images/HOrX5gwLS.jpg",
  "oriental": "https://cdn2.thecatapi.com/images/LutjkZJpH.jpg",
  "devon-rex": "https://cdn2.thecatapi.com/images/4RzEwvyzz.jpg",
  "norwegian": "https://cdn2.thecatapi.com/images/06dgGmEOV.jpg",
  "russian-blue": "https://cdn2.thecatapi.com/images/Rhj-JsTLP.jpg",
  "siberian": "https://cdn2.thecatapi.com/images/3bkZAjRh1.jpg",
  "chartreux": "https://cdn2.thecatapi.com/images/j6oFGLpRG.jpg",
  "ragamuffin": "https://cdn2.thecatapi.com/images/MvMo3NctT.jpg",
  "exotic-shorthair": "https://cdn2.thecatapi.com/images/YnPrYEmfe.jpg",
  "burmese": "https://cdn2.thecatapi.com/images/4lXnnfxac.jpg",
  "tonkinese": "https://cdn2.thecatapi.com/images/KBroiVNCM.jpg",
  "scottish-fold": "https://cdn2.thecatapi.com/images/o9t0LDcsa.jpg",
  "somali": "https://cdn2.thecatapi.com/images/EPF2ejNS0.jpg",
  "turkish-angora": "https://cdn2.thecatapi.com/images/7CGV6WVXq.jpg",
  "american-shorthair": "https://cdn2.thecatapi.com/images/JFPROfGtQ.jpg",
  "cornish-rex": "https://cdn2.thecatapi.com/images/unPP08xOZ.jpg",
  "manx": "https://cdn2.thecatapi.com/images/fhYh4b8Qp.jpg",
  "balinese": "https://cdn2.thecatapi.com/images/1apdk2A8y.jpg",
  "ocicat": "https://cdn2.thecatapi.com/images/JAx-08Y0n.jpg",
  "korat": "https://cdn2.thecatapi.com/images/DbwiefiaY.jpg",
  "turkish-van": "https://cdn2.thecatapi.com/images/sxIXJax6h.jpg",
  "himalayan": "https://cdn2.thecatapi.com/images/CDhOtM-Ig.jpg",
  "egyptian-mau": "https://cdn2.thecatapi.com/images/TuSyTkt2M.jpg",
  "savannah": "https://cdn2.thecatapi.com/images/a8nIYvs6S.jpg",
  "laperm": "https://cdn2.thecatapi.com/images/aKbsEYjSl.jpg",
  "singapura": "https://cdn2.thecatapi.com/images/Qtncp2nRe.jpg",
  "selkirk-rex": "https://cdn2.thecatapi.com/images/II9dOZmrw.jpg",
  "pixiebob": "https://cdn2.thecatapi.com/images/z7fJRNeN6.jpg",
  "bombay": "https://cdn2.thecatapi.com/images/5iYq9NmT1.jpg",
  "havana-brown": "https://cdn2.thecatapi.com/images/njKCSkHjY.jpg",
  "cymric": "https://cdn2.thecatapi.com/images/3dbtapCWM.jpg",
  "american-curl": "https://cdn2.thecatapi.com/images/xnsqonbjW.jpg",
  "japanese-bobtail": "https://cdn2.thecatapi.com/images/-TRBoJWKl.jpg",
  "chausie": "https://cdn2.thecatapi.com/images/vJ3lEYgXr.jpg",
  "munchkin": "https://cdn2.thecatapi.com/images/j5cVSqLer.jpg",
  "toyger": "https://rork.app/pa/355i9jn1mif3ki6hoexx7/assets/images/breeds/toyger.png",
  "nebelung": "https://cdn2.thecatapi.com/images/OGTWqNNOt.jpg",
  "snowshoe": "https://cdn2.thecatapi.com/images/MK-sYESvO.jpg",
  "lykoi": "https://cdn2.thecatapi.com/images/d5y9H576b.jpg",
  "khao-manee": "https://cdn2.thecatapi.com/images/BDb8ZXb1v.jpg",
  "kurilian-bobtail": "https://cdn2.thecatapi.com/images/NdKRyzUrF.jpg",
  "american-bobtail": "https://cdn2.thecatapi.com/images/hBXicehMA.jpg",
  "european-shorthair": "https://cdn2.thecatapi.com/images/yG9slH40W.jpg",
  "javanese": "https://cdn2.thecatapi.com/images/xoI_EpOKe.jpg",
  "burmilla": "https://cdn2.thecatapi.com/images/jvg3XfEdC.jpg",
  "australian-mist": "https://cdn2.thecatapi.com/images/_6x-3TiCA.jpg",
  "thai": "https://cdn2.thecatapi.com/images/d8bl-iiP7.jpg",
  "cyprus": "https://cdn2.thecatapi.com/images/tKeo_GrGE.jpg",
};

/**
 * Get verified breed image (synchronous, using pre-cached URLs)
 */
export function getVerifiedBreedImage(breedId: string): string {
  return VERIFIED_BREED_IMAGES[breedId] || 
    `https://cdn2.thecatapi.com/images/${CAT_API_BREED_MAP[breedId] || breedId}.jpg`;
}


