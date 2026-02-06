export type BreederProvider = {
  id: string;
  name: string;
  type: string;
  searchUrl?: string;
  membersUrl?: string;
  catteryNamesUrl?: string;
  notes: string;
};

export type BreedEntry = {
  id: string;
  label: string;
  catApiId: string | null;
  catApiVerified: boolean;
  verifiedImageUrl: string | null;
  aliases: string[];
};

export type Breeder = {
  id: string;
  name: string;
  breedId: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  website?: string;
  rating: number;
  imageUri: string;
};

export const BREEDER_PROVIDERS: BreederProvider[] = [
  {
    id: "tica",
    name: "TICA (The International Cat Association)",
    type: "registry-directory",
    searchUrl: "https://tica.org/browse-all-breeders/",
    notes: "Annuaire de breeders enregistrés TICA (filtrable par race / lieu).",
  },
  {
    id: "cfa",
    name: "CFA (Cat Fanciers' Association)",
    type: "registry-directory",
    searchUrl: "https://find-a-breeder.cfa.org/",
    notes: "Annuaire CFA 'Find a Breeder'.",
  },
  {
    id: "gccf",
    name: "GCCF (Governing Council of the Cat Fancy)",
    type: "registry-directory",
    searchUrl: "https://www.gccfcats.org/breeding-cats/the-experienced-breeder/breeder-scheme/",
    notes: "Breeder scheme (UK) avec accès via carte/outil.",
  },
  {
    id: "fife",
    name: "FIFe (Fédération Internationale Féline)",
    type: "federation",
    membersUrl: "https://fifeweb.org/organisation/members/",
    catteryNamesUrl: "https://fifeweb.org/cats/cattery-names/",
    notes: "FIFe fonctionne via fédérations membres (annuaire éleveurs souvent au niveau des clubs/fédérations).",
  },
  {
    id: "wcf",
    name: "WCF (World Cat Federation)",
    type: "registry-search",
    catteryNamesUrl: "https://wcf.de/en/cattery-names/",
    notes: "Recherche de noms de chatteries enregistrées WCF.",
  },
];

export const BREED_ENTRIES: BreedEntry[] = [
  { id: "abyssinian", label: "Abyssinian", catApiId: "abys", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/EHG3sOpAM.jpg", aliases: [] },
  { id: "aegean", label: "Aegean", catApiId: "aege", catApiVerified: true, verifiedImageUrl: null, aliases: [] },
  { id: "american-bobtail", label: "American Bobtail", catApiId: "abob", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/hBXicehMA.jpg", aliases: [] },
  { id: "american-curl", label: "American Curl", catApiId: "acur", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/xnsqonbjW.jpg", aliases: [] },
  { id: "american-shorthair", label: "American Shorthair", catApiId: "asho", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/JFPROfGtQ.jpg", aliases: [] },
  { id: "american-wirehair", label: "American Wirehair", catApiId: "awir", catApiVerified: true, verifiedImageUrl: null, aliases: [] },
  { id: "arabian-mau", label: "Arabian Mau", catApiId: "amau", catApiVerified: true, verifiedImageUrl: null, aliases: [] },
  { id: "australian-mist", label: "Australian Mist", catApiId: "amis", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/_6x-3TiCA.jpg", aliases: [] },
  { id: "balinese", label: "Balinese", catApiId: "bali", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/1apdk2A8y.jpg", aliases: [] },
  { id: "bambino", label: "Bambino", catApiId: "bamb", catApiVerified: true, verifiedImageUrl: null, aliases: [] },
  { id: "bengal", label: "Bengal", catApiId: "beng", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/O3btzLlsO.png", aliases: [] },
  { id: "birman", label: "Birman", catApiId: "birm", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/HOrX5gwLS.jpg", aliases: ["sacred-birman"] },
  { id: "bombay", label: "Bombay", catApiId: "bomb", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/5iYq9NmT1.jpg", aliases: [] },
  { id: "british-longhair", label: "British Longhair", catApiId: "bslo", catApiVerified: true, verifiedImageUrl: null, aliases: [] },
  { id: "british-shorthair", label: "British Shorthair", catApiId: "bsho", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/s4wQfYoEk.jpg", aliases: [] },
  { id: "burmese", label: "Burmese", catApiId: "bure", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/4lXnnfxac.jpg", aliases: [] },
  { id: "burmilla", label: "Burmilla", catApiId: "buri", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/jvg3XfEdC.jpg", aliases: [] },
  { id: "california-spangled", label: "California Spangled", catApiId: "cspa", catApiVerified: true, verifiedImageUrl: null, aliases: [] },
  { id: "chantilly-tiffany", label: "Chantilly-Tiffany", catApiId: "ctif", catApiVerified: true, verifiedImageUrl: null, aliases: [] },
  { id: "chartreux", label: "Chartreux", catApiId: "char", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/j6oFGLpRG.jpg", aliases: [] },
  { id: "chausie", label: "Chausie", catApiId: "chau", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/vJ3lEYgXr.jpg", aliases: [] },
  { id: "cheetoh", label: "Cheetoh", catApiId: "chee", catApiVerified: true, verifiedImageUrl: null, aliases: [] },
  { id: "colorpoint-shorthair", label: "Colorpoint Shorthair", catApiId: "csho", catApiVerified: true, verifiedImageUrl: null, aliases: [] },
  { id: "cornish-rex", label: "Cornish Rex", catApiId: "crex", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/unPP08xOZ.jpg", aliases: [] },
  { id: "cymric", label: "Cymric", catApiId: "cymr", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/3dbtapCWM.jpg", aliases: [] },
  { id: "cyprus", label: "Cyprus", catApiId: "cypr", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/tKeo_GrGE.jpg", aliases: [] },
  { id: "devon-rex", label: "Devon Rex", catApiId: "drex", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/4RzEwvyzz.jpg", aliases: [] },
  { id: "donskoy", label: "Donskoy", catApiId: "dons", catApiVerified: true, verifiedImageUrl: null, aliases: [] },
  { id: "dragon-li", label: "Dragon Li", catApiId: "lihu", catApiVerified: true, verifiedImageUrl: null, aliases: [] },
  { id: "egyptian-mau", label: "Egyptian Mau", catApiId: "emau", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/TuSyTkt2M.jpg", aliases: [] },
  { id: "european-burmese", label: "European Burmese", catApiId: "ebur", catApiVerified: true, verifiedImageUrl: null, aliases: [] },
  { id: "european-shorthair", label: "European Shorthair (FIFe: European)", catApiId: null, catApiVerified: false, verifiedImageUrl: null, aliases: [] },
  { id: "exotic-shorthair", label: "Exotic Shorthair", catApiId: "esho", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/YnPrYEmfe.jpg", aliases: [] },
  { id: "havana-brown", label: "Havana Brown", catApiId: "hbro", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/njKCSkHjY.jpg", aliases: [] },
  { id: "himalayan", label: "Himalayan", catApiId: "hima", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/CDhOtM-Ig.jpg", aliases: [] },
  { id: "japanese-bobtail", label: "Japanese Bobtail", catApiId: "jbob", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/-TRBoJWKl.jpg", aliases: [] },
  { id: "javanese", label: "Javanese", catApiId: "java", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/xoI_EpOKe.jpg", aliases: [] },
  { id: "khao-manee", label: "Khao Manee", catApiId: "khao", catApiVerified: true, verifiedImageUrl: null, aliases: [] },
  { id: "korat", label: "Korat", catApiId: "kora", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/DbwiefiaY.jpg", aliases: [] },
  { id: "kurilian-bobtail", label: "Kurilian (Bobtail)", catApiId: "kuri", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/NdKRyzUrF.jpg", aliases: [] },
  { id: "laperm", label: "LaPerm", catApiId: "lape", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/aKbsEYjSl.jpg", aliases: [] },
  { id: "maine-coon", label: "Maine Coon", catApiId: "mcoo", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/OOD3VXAQn.jpg", aliases: [] },
  { id: "malayan", label: "Malayan", catApiId: "mala", catApiVerified: true, verifiedImageUrl: null, aliases: [] },
  { id: "manx", label: "Manx", catApiId: "manx", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/fhYh4b8Qp.jpg", aliases: [] },
  { id: "munchkin", label: "Munchkin", catApiId: "munc", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/j5cVSqLer.jpg", aliases: [] },
  { id: "nebelung", label: "Nebelung", catApiId: "nebe", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/OGTWqNNOt.jpg", aliases: [] },
  { id: "norwegian", label: "Norwegian Forest Cat", catApiId: "norw", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/06dgGmEOV.jpg", aliases: ["norwegian-forest-cat"] },
  { id: "ocicat", label: "Ocicat", catApiId: "ocic", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/JAx-08Y0n.jpg", aliases: [] },
  { id: "oriental", label: "Oriental", catApiId: "orie", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/LutjkZJpH.jpg", aliases: ["oriental-shorthair"] },
  { id: "persian", label: "Persian", catApiId: "pers", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/e8s9-S6AD.jpg", aliases: [] },
  { id: "pixiebob", label: "Pixie-bob", catApiId: "pixi", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/z7fJRNeN6.jpg", aliases: ["pixie-bob"] },
  { id: "ragamuffin", label: "Ragamuffin", catApiId: "raga", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/MvMo3NctT.jpg", aliases: [] },
  { id: "ragdoll", label: "Ragdoll", catApiId: "ragd", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/oGefY4YoG.jpg", aliases: [] },
  { id: "russian-blue", label: "Russian Blue", catApiId: "rblu", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/Rhj-JsTLP.jpg", aliases: [] },
  { id: "savannah", label: "Savannah", catApiId: "sava", catApiVerified: true, verifiedImageUrl: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/d09blop80gudztvlx1a8n", aliases: [] },
  { id: "scottish-fold", label: "Scottish Fold", catApiId: "sfol", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/o9t0LDcsa.jpg", aliases: [] },
  { id: "selkirk-rex", label: "Selkirk Rex", catApiId: "srex", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/II9dOZmrw.jpg", aliases: [] },
  { id: "siamese", label: "Siamese", catApiId: "siam", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/ai6Jps4sx.jpg", aliases: [] },
  { id: "siberian", label: "Siberian", catApiId: "sibe", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/3bkZAjRh1.jpg", aliases: [] },
  { id: "singapura", label: "Singapura", catApiId: "sing", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/Qtncp2nRe.jpg", aliases: [] },
  { id: "snowshoe", label: "Snowshoe", catApiId: "snow", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/MK-sYESvO.jpg", aliases: [] },
  { id: "somali", label: "Somali", catApiId: "soma", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/EPF2ejNS0.jpg", aliases: [] },
  { id: "sphynx", label: "Sphynx", catApiId: "sphy", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/BDb8ZXb1v.jpg", aliases: [] },
  { id: "tonkinese", label: "Tonkinese", catApiId: "tonk", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/KBroiVNCM.jpg", aliases: [] },
  { id: "toyger", label: "Toyger", catApiId: "toyg", catApiVerified: true, verifiedImageUrl: "https://rork.app/pa/355i9jn1mif3ki6hoexx7/assets/images/breeds/toyger.png", aliases: [] },
  { id: "turkish-angora", label: "Turkish Angora", catApiId: "tang", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/7CGV6WVXq.jpg", aliases: [] },
  { id: "turkish-van", label: "Turkish Van", catApiId: "tvan", catApiVerified: true, verifiedImageUrl: "https://cdn2.thecatapi.com/images/sxIXJax6h.jpg", aliases: [] },
  { id: "york-chocolate", label: "York Chocolate", catApiId: "ycho", catApiVerified: true, verifiedImageUrl: null, aliases: [] },
  { id: "lykoi", label: "Lykoi", catApiId: "lyki", catApiVerified: false, verifiedImageUrl: "https://cdn2.thecatapi.com/images/d5y9H576b.jpg", aliases: [] },
  { id: "peterbald", label: "Peterbald", catApiId: "pbald", catApiVerified: false, verifiedImageUrl: null, aliases: [] },
  { id: "thai", label: "Thai", catApiId: "thai", catApiVerified: false, verifiedImageUrl: "https://cdn2.thecatapi.com/images/d8bl-iiP7.jpg", aliases: [] },
];

export const BREEDERS: Breeder[] = [];
