import { BreedId } from "./breeds";

export type Breeder = {
  id: string;
  name: string;
  breedId: BreedId;
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

export const BREEDERS: Breeder[] = [
  // Maine Coon
  {
    id: "mc-1",
    name: "Maine Coon Kingdom",
    breedId: "maine-coon",
    address: "123 Highland Road",
    city: "Portland",
    country: "USA",
    latitude: 43.6591,
    longitude: -70.2568,
    phone: "+1 207-555-0123",
    rating: 4.9,
    imageUri: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "mc-2",
    name: "Chatterie du Géant",
    breedId: "maine-coon",
    address: "45 Route de Lyon",
    city: "Lyon",
    country: "France",
    latitude: 45.764,
    longitude: 4.8357,
    phone: "+33 4 78 55 55 55",
    rating: 4.8,
    imageUri: "https://images.unsplash.com/photo-1561948205-12d5a3b3510c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "mc-3",
    name: "Nordic Coons",
    breedId: "maine-coon",
    address: "Fjord Lane 8",
    city: "Oslo",
    country: "Norway",
    latitude: 59.9139,
    longitude: 10.7522,
    phone: "+47 22 33 44 55",
    rating: 5.0,
    imageUri: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80",
  },

  // Bengal
  {
    id: "bg-1",
    name: "Wild Spots Bengal",
    breedId: "bengal",
    address: "789 Jungle Ave",
    city: "Miami",
    country: "USA",
    latitude: 25.7617,
    longitude: -80.1918,
    phone: "+1 305-555-0199",
    rating: 4.7,
    imageUri: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "bg-2",
    name: "Bengal de Paris",
    breedId: "bengal",
    address: "12 Avenue Montaigne",
    city: "Paris",
    country: "France",
    latitude: 48.8656,
    longitude: 2.3068,
    phone: "+33 1 44 55 66 77",
    rating: 4.9,
    imageUri: "https://images.unsplash.com/photo-1610243659424-320c918c0c99?auto=format&fit=crop&w=800&q=80",
  },

  // Siamese
  {
    id: "sm-1",
    name: "Siam Royal",
    breedId: "siamese",
    address: "Sukhumvit Road",
    city: "Bangkok",
    country: "Thailand",
    latitude: 13.7563,
    longitude: 100.5018,
    phone: "+66 2 123 4567",
    rating: 4.8,
    imageUri: "https://images.unsplash.com/photo-1542736140-1b8f6d1e4802?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "sm-2",
    name: "Blue Eyes Cattery",
    breedId: "siamese",
    address: "10 Downing St",
    city: "London",
    country: "UK",
    latitude: 51.5034,
    longitude: -0.1276,
    phone: "+44 20 7930 4433",
    rating: 4.6,
    imageUri: "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=800&q=80",
  },

  // Persian
  {
    id: "ps-1",
    name: "Persian Palace",
    breedId: "persian",
    address: "Sheikh Zayed Road",
    city: "Dubai",
    country: "UAE",
    latitude: 25.2048,
    longitude: 55.2708,
    phone: "+971 4 333 4444",
    rating: 4.9,
    imageUri: "https://images.unsplash.com/photo-1626244229671-11d4d2325c38?auto=format&fit=crop&w=800&q=80",
  },

  // Ragdoll
  {
    id: "rg-1",
    name: "Fluffy Dolls",
    breedId: "ragdoll",
    address: "Sunset Blvd",
    city: "Los Angeles",
    country: "USA",
    latitude: 34.0522,
    longitude: -118.2437,
    phone: "+1 310-555-9988",
    rating: 4.8,
    imageUri: "https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?auto=format&fit=crop&w=800&q=80",
  },
  
  // Sphynx
  {
    id: "sp-1",
    name: "Naked Cats Toronto",
    breedId: "sphynx",
    address: "Queen St W",
    city: "Toronto",
    country: "Canada",
    latitude: 43.65107,
    longitude: -79.347015,
    phone: "+1 416-555-0122",
    rating: 4.7,
    imageUri: "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=800&q=80",
  }
];
