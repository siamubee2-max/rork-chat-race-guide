import React, { useMemo, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from "react-native-maps";
import { useUserLocation } from "@/context/user-location";
import { Navigation, MapPin, Phone, Clock, Stethoscope, Home, ShoppingBag, Hotel, Globe, Pill, Building2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Colors } from "@/constants/colors";

type PlaceType = "vet" | "shelter" | "shop" | "boarding" | "pharmacy" | "clinic";

interface Place {
  id: number;
  name: string;
  type: PlaceType;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  hours: string;
  rating: number;
  emoji: string;
  website?: string;
  country: string;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

const PLACES: Place[] = [
  // France
  { id: 1, name: "Clinique Vétérinaire des Chats", type: "vet", latitude: 48.8566, longitude: 2.3522, address: "12 Rue des Chats, 75001 Paris", phone: "01 23 45 67 89", hours: "09:00 - 19:00", rating: 4.8, emoji: "🏥", website: "https://www.veterinaire.fr", country: "France" },
  { id: 2, name: "Urgences Vétérinaires Paris", type: "vet", latitude: 48.8606, longitude: 2.3376, address: "45 Avenue de l'Opéra, 75002 Paris", phone: "01 98 76 54 32", hours: "24h/24", rating: 4.5, emoji: "🏥", website: "https://www.urgences-veterinaires-paris.fr", country: "France" },
  { id: 3, name: "Cabinet Dr. Martin", type: "vet", latitude: 48.864716, longitude: 2.349014, address: "8 Rue Montorgueil, 75002 Paris", phone: "01 42 33 22 11", hours: "08:30 - 18:30", rating: 4.9, emoji: "🏥", website: "https://www.doctolib.fr", country: "France" },
  { id: 4, name: "Clinique Vétérinaire Féline", type: "clinic", latitude: 48.8520, longitude: 2.3480, address: "18 Rue de Rivoli, 75004 Paris", phone: "01 42 78 90 12", hours: "08:00 - 20:00", rating: 4.7, emoji: "🩺", website: "https://www.clinique-feline.fr", country: "France" },
  { id: 5, name: "Centre Hospitalier Vétérinaire", type: "clinic", latitude: 48.8680, longitude: 2.3400, address: "25 Boulevard Haussmann, 75009 Paris", phone: "01 47 70 80 90", hours: "24h/24", rating: 4.9, emoji: "🩺", website: "https://www.chv-paris.fr", country: "France" },
  { id: 6, name: "Pharmacie de Garde Vétérinaire", type: "pharmacy", latitude: 48.8590, longitude: 2.3470, address: "5 Place du Châtelet, 75001 Paris", phone: "01 40 26 30 40", hours: "24h/24", rating: 4.6, emoji: "💊", website: "https://www.pharmacie-veterinaire.fr", country: "France" },
  { id: 7, name: "Pharma-Vet Paris", type: "pharmacy", latitude: 48.8550, longitude: 2.3600, address: "12 Rue Saint-Antoine, 75004 Paris", phone: "01 42 72 60 70", hours: "08:00 - 22:00", rating: 4.5, emoji: "💊", website: "https://www.pharmavet.fr", country: "France" },
  { id: 11, name: "Refuge SPA Paris", type: "shelter", latitude: 48.8545, longitude: 2.3615, address: "22 Avenue de la Liberté, 75004 Paris", phone: "01 43 80 40 66", hours: "14:00 - 18:00", rating: 4.6, emoji: "🏠", website: "https://www.la-spa.fr", country: "France" },
  { id: 12, name: "Association Chats Sans Toit", type: "shelter", latitude: 48.8465, longitude: 2.3456, address: "5 Rue de la Protection, 75006 Paris", phone: "01 42 19 30 55", hours: "10:00 - 17:00", rating: 4.8, emoji: "🏠", website: "https://www.secondechance.org", country: "France" },
  { id: 21, name: "Animalerie Féline Premium", type: "shop", latitude: 48.8505, longitude: 2.3488, address: "30 Rue du Commerce, 75005 Paris", phone: "01 45 87 65 43", hours: "09:30 - 19:30", rating: 4.5, emoji: "🛍️", website: "https://www.zooplus.fr", country: "France" },
  { id: 22, name: "Litière & Compagnie", type: "shop", latitude: 48.8625, longitude: 2.3425, address: "14 Boulevard des Accessoires, 75009 Paris", phone: "01 47 25 36 98", hours: "10:00 - 20:00", rating: 4.4, emoji: "🛍️", website: "https://www.wanimo.com", country: "France" },
  { id: 31, name: "Pension Chat'Teau", type: "boarding", latitude: 48.8445, longitude: 2.3565, address: "25 Avenue du Repos, 75013 Paris", phone: "01 45 65 78 90", hours: "08:00 - 20:00", rating: 4.9, emoji: "🏨", website: "https://www.emprunte-mon-toutou.com", country: "France" },
  { id: 32, name: "Hôtel Félin Luxe", type: "boarding", latitude: 48.8745, longitude: 2.3305, address: "12 Rue du Confort, 75017 Paris", phone: "01 48 88 99 00", hours: "24h/24", rating: 4.8, emoji: "🏨", website: "https://www.garde-animaux.fr", country: "France" },
  
  // Belgium
  { id: 101, name: "Clinique Vétérinaire Bruxelles", type: "vet", latitude: 50.8503, longitude: 4.3517, address: "15 Rue Royale, 1000 Bruxelles", phone: "02 511 22 33", hours: "08:00 - 19:00", rating: 4.7, emoji: "🏥", website: "https://www.veterinaire.be", country: "Belgium" },
  { id: 102, name: "Urgences Vétérinaires Belgique", type: "vet", latitude: 50.8467, longitude: 4.3525, address: "45 Avenue Louise, 1050 Bruxelles", phone: "02 538 45 67", hours: "24h/24", rating: 4.6, emoji: "🏥", website: "https://www.urgences-veterinaires.be", country: "Belgium" },
  { id: 103, name: "Centre Hospitalier Vétérinaire Bruxelles", type: "clinic", latitude: 50.8480, longitude: 4.3600, address: "8 Place Flagey, 1050 Bruxelles", phone: "02 640 50 60", hours: "24h/24", rating: 4.8, emoji: "🩺", website: "https://www.chv-bruxelles.be", country: "Belgium" },
  { id: 104, name: "Pharmacie Vétérinaire Bruxelles", type: "pharmacy", latitude: 50.8490, longitude: 4.3480, address: "22 Rue Neuve, 1000 Bruxelles", phone: "02 217 30 40", hours: "09:00 - 21:00", rating: 4.5, emoji: "💊", website: "https://www.pharma-vet.be", country: "Belgium" },
  { id: 111, name: "Refuge Sans Collier", type: "shelter", latitude: 50.8550, longitude: 4.3450, address: "10 Rue du Refuge, 1030 Bruxelles", phone: "02 242 33 44", hours: "14:00 - 17:00", rating: 4.7, emoji: "🏠", website: "https://www.sanscollier.be", country: "Belgium" },
  { id: 121, name: "Tom & Co Bruxelles", type: "shop", latitude: 50.8520, longitude: 4.3550, address: "30 Rue du Marché, 1000 Bruxelles", phone: "02 512 40 50", hours: "10:00 - 19:00", rating: 4.4, emoji: "🛍️", website: "https://www.tomandco.com", country: "Belgium" },
  { id: 131, name: "Pension Féline Belgique", type: "boarding", latitude: 50.8400, longitude: 4.3400, address: "5 Avenue du Chat, 1180 Bruxelles", phone: "02 375 60 70", hours: "08:00 - 20:00", rating: 4.8, emoji: "🏨", website: "https://www.pension-feline.be", country: "Belgium" },
  
  // Switzerland
  { id: 201, name: "Clinique Vétérinaire Genève", type: "vet", latitude: 46.2044, longitude: 6.1432, address: "12 Rue du Rhône, 1204 Genève", phone: "022 311 22 33", hours: "08:00 - 19:00", rating: 4.8, emoji: "🏥", website: "https://www.veterinaire.ch", country: "Switzerland" },
  { id: 202, name: "Urgences Vétérinaires Suisse", type: "vet", latitude: 46.2000, longitude: 6.1500, address: "25 Quai du Mont-Blanc, 1201 Genève", phone: "022 732 45 67", hours: "24h/24", rating: 4.7, emoji: "🏥", website: "https://www.urgences-vet.ch", country: "Switzerland" },
  { id: 203, name: "Hôpital Vétérinaire Genève", type: "clinic", latitude: 46.2020, longitude: 6.1380, address: "8 Avenue de Champel, 1206 Genève", phone: "022 347 80 90", hours: "24h/24", rating: 4.9, emoji: "🩺", website: "https://www.hopital-veterinaire.ch", country: "Switzerland" },
  { id: 204, name: "Pharmacie Vétérinaire Genève", type: "pharmacy", latitude: 46.2050, longitude: 6.1450, address: "15 Place Bel-Air, 1204 Genève", phone: "022 310 50 60", hours: "08:00 - 20:00", rating: 4.6, emoji: "💊", website: "https://www.pharma-vet.ch", country: "Switzerland" },
  { id: 211, name: "SPA Genève", type: "shelter", latitude: 46.1980, longitude: 6.1400, address: "20 Route de Chêne, 1208 Genève", phone: "022 700 30 40", hours: "14:00 - 18:00", rating: 4.7, emoji: "🏠", website: "https://www.spa-geneve.ch", country: "Switzerland" },
  { id: 221, name: "Qualipet Genève", type: "shop", latitude: 46.2030, longitude: 6.1420, address: "5 Rue du Commerce, 1204 Genève", phone: "022 318 40 50", hours: "09:00 - 19:00", rating: 4.5, emoji: "🛍️", website: "https://www.qualipet.ch", country: "Switzerland" },
  { id: 231, name: "Cat Hotel Suisse", type: "boarding", latitude: 46.1950, longitude: 6.1350, address: "30 Chemin des Chats, 1209 Genève", phone: "022 788 60 70", hours: "07:00 - 21:00", rating: 4.9, emoji: "🏨", website: "https://www.cat-hotel.ch", country: "Switzerland" },
  
  // Canada
  { id: 301, name: "Clinique Vétérinaire Montréal", type: "vet", latitude: 45.5017, longitude: -73.5673, address: "123 Rue Sainte-Catherine, Montréal, QC", phone: "514 555 1234", hours: "08:00 - 20:00", rating: 4.7, emoji: "🏥", website: "https://www.veterinaire-montreal.ca", country: "Canada" },
  { id: 302, name: "Urgences Vétérinaires Montréal", type: "vet", latitude: 45.5050, longitude: -73.5700, address: "456 Boulevard René-Lévesque, Montréal, QC", phone: "514 931 0851", hours: "24h/24", rating: 4.8, emoji: "🏥", website: "https://www.dfrvet.com", country: "Canada" },
  { id: 303, name: "Hôpital Vétérinaire de Montréal", type: "clinic", latitude: 45.5080, longitude: -73.5650, address: "789 Avenue du Parc, Montréal, QC", phone: "514 842 5678", hours: "24h/24", rating: 4.9, emoji: "🩺", website: "https://www.hopital-vet-montreal.ca", country: "Canada" },
  { id: 304, name: "Pharmacie Vétérinaire Québec", type: "pharmacy", latitude: 45.5030, longitude: -73.5680, address: "200 Rue McGill, Montréal, QC", phone: "514 395 4000", hours: "09:00 - 21:00", rating: 4.6, emoji: "💊", website: "https://www.pharmavet.ca", country: "Canada" },
  { id: 311, name: "SPCA Montréal", type: "shelter", latitude: 45.5100, longitude: -73.5750, address: "5215 Rue Jean-Talon O, Montréal, QC", phone: "514 735 2711", hours: "10:00 - 18:00", rating: 4.8, emoji: "🏠", website: "https://www.spca.com", country: "Canada" },
  { id: 321, name: "Mondou Montréal", type: "shop", latitude: 45.5060, longitude: -73.5620, address: "350 Rue Saint-Paul, Montréal, QC", phone: "514 866 3647", hours: "09:00 - 21:00", rating: 4.5, emoji: "🛍️", website: "https://www.mondou.com", country: "Canada" },
  { id: 331, name: "Pension Féline Montréal", type: "boarding", latitude: 45.4980, longitude: -73.5600, address: "100 Rue de la Commune, Montréal, QC", phone: "514 878 9999", hours: "07:00 - 21:00", rating: 4.7, emoji: "🏨", website: "https://www.pension-chat.ca", country: "Canada" },
  
  // USA
  { id: 401, name: "NYC Cat Hospital", type: "vet", latitude: 40.7128, longitude: -74.0060, address: "123 5th Avenue, New York, NY", phone: "212 555 1234", hours: "08:00 - 20:00", rating: 4.8, emoji: "🏥", website: "https://www.nyccathospital.com", country: "United States" },
  { id: 402, name: "BluePearl Emergency Vet", type: "vet", latitude: 40.7150, longitude: -74.0080, address: "456 Broadway, New York, NY", phone: "212 924 3311", hours: "24/7", rating: 4.7, emoji: "🏥", website: "https://www.bluepearlvet.com", country: "United States" },
  { id: 403, name: "Animal Medical Center NYC", type: "clinic", latitude: 40.7180, longitude: -73.9580, address: "510 E 62nd St, New York, NY", phone: "212 838 8100", hours: "24/7", rating: 4.9, emoji: "🩺", website: "https://www.amcny.org", country: "United States" },
  { id: 404, name: "VetRx Pharmacy", type: "pharmacy", latitude: 40.7100, longitude: -74.0050, address: "200 Park Avenue, New York, NY", phone: "212 867 5309", hours: "09:00 - 21:00", rating: 4.5, emoji: "💊", website: "https://www.vetrxpharmacy.com", country: "United States" },
  { id: 411, name: "ASPCA Animal Shelter", type: "shelter", latitude: 40.7200, longitude: -73.9900, address: "424 E 92nd St, New York, NY", phone: "212 876 7700", hours: "11:00 - 19:00", rating: 4.8, emoji: "🏠", website: "https://www.aspca.org", country: "United States" },
  { id: 421, name: "Petco Union Square", type: "shop", latitude: 40.7350, longitude: -73.9900, address: "860 Broadway, New York, NY", phone: "212 358 0692", hours: "09:00 - 21:00", rating: 4.4, emoji: "🛍️", website: "https://www.petco.com", country: "United States" },
  { id: 431, name: "Meow Parlour Cat Hotel", type: "boarding", latitude: 40.7220, longitude: -73.9950, address: "46 Hester St, New York, NY", phone: "212 228 5700", hours: "10:00 - 20:00", rating: 4.9, emoji: "🏨", website: "https://www.meowparlour.com", country: "United States" },
  
  // UK
  { id: 501, name: "London Cat Clinic", type: "vet", latitude: 51.5074, longitude: -0.1278, address: "123 Baker Street, London W1U", phone: "020 7935 1234", hours: "08:00 - 19:00", rating: 4.8, emoji: "🏥", website: "https://www.londoncatclinic.co.uk", country: "United Kingdom" },
  { id: 502, name: "Vets Now London", type: "vet", latitude: 51.5100, longitude: -0.1300, address: "456 Oxford Street, London W1C", phone: "0800 011 9493", hours: "24/7", rating: 4.7, emoji: "🏥", website: "https://www.vets-now.com", country: "United Kingdom" },
  { id: 503, name: "Royal Veterinary College", type: "clinic", latitude: 51.5200, longitude: -0.1100, address: "Royal College St, London NW1", phone: "020 7387 8134", hours: "24/7", rating: 4.9, emoji: "🩺", website: "https://www.rvc.ac.uk", country: "United Kingdom" },
  { id: 504, name: "Vet Pharmacy UK", type: "pharmacy", latitude: 51.5080, longitude: -0.1250, address: "200 Regent Street, London W1B", phone: "020 7287 5050", hours: "09:00 - 20:00", rating: 4.5, emoji: "💊", website: "https://www.vetpharmacy.co.uk", country: "United Kingdom" },
  { id: 511, name: "Battersea Dogs & Cats Home", type: "shelter", latitude: 51.4750, longitude: -0.1450, address: "4 Battersea Park Rd, London SW8", phone: "020 7622 3626", hours: "10:00 - 16:00", rating: 4.8, emoji: "🏠", website: "https://www.battersea.org.uk", country: "United Kingdom" },
  { id: 521, name: "Pets at Home London", type: "shop", latitude: 51.5050, longitude: -0.1200, address: "100 Victoria Street, London SW1E", phone: "020 7828 1234", hours: "09:00 - 20:00", rating: 4.4, emoji: "🛍️", website: "https://www.petsathome.com", country: "United Kingdom" },
  { id: 531, name: "Longcroft Cat Hotel", type: "boarding", latitude: 51.4900, longitude: -0.1350, address: "50 Clapham High St, London SW4", phone: "020 7622 7000", hours: "08:00 - 18:00", rating: 4.9, emoji: "🏨", website: "https://www.longcroftcathotel.co.uk", country: "United Kingdom" },
  
  // Germany
  { id: 601, name: "Tierklinik Berlin", type: "vet", latitude: 52.5200, longitude: 13.4050, address: "Friedrichstraße 123, 10117 Berlin", phone: "030 2065 1234", hours: "08:00 - 19:00", rating: 4.7, emoji: "🏥", website: "https://www.tierklinik-berlin.de", country: "Germany" },
  { id: 602, name: "Tierärztlicher Notdienst Berlin", type: "vet", latitude: 52.5170, longitude: 13.3880, address: "Unter den Linden 50, 10117 Berlin", phone: "030 838 62920", hours: "24h", rating: 4.6, emoji: "🏥", website: "https://www.tiernotdienst-berlin.de", country: "Germany" },
  { id: 603, name: "Freie Universität Tierklinik", type: "clinic", latitude: 52.4500, longitude: 13.2900, address: "Oertzenweg 19b, 14163 Berlin", phone: "030 838 62000", hours: "24h", rating: 4.9, emoji: "🩺", website: "https://www.vetmed.fu-berlin.de", country: "Germany" },
  { id: 604, name: "Vet-Apotheke Berlin", type: "pharmacy", latitude: 52.5180, longitude: 13.4000, address: "Alexanderplatz 5, 10178 Berlin", phone: "030 247 5678", hours: "09:00 - 20:00", rating: 4.5, emoji: "💊", website: "https://www.vet-apotheke.de", country: "Germany" },
  { id: 611, name: "Tierheim Berlin", type: "shelter", latitude: 52.5300, longitude: 13.5100, address: "Hausvaterweg 39, 13057 Berlin", phone: "030 76888 0", hours: "10:00 - 16:00", rating: 4.8, emoji: "🏠", website: "https://www.tierschutz-berlin.de", country: "Germany" },
  { id: 621, name: "Fressnapf Berlin", type: "shop", latitude: 52.5150, longitude: 13.3950, address: "Potsdamer Platz 10, 10785 Berlin", phone: "030 2594 7890", hours: "10:00 - 20:00", rating: 4.4, emoji: "🛍️", website: "https://www.fressnapf.de", country: "Germany" },
  { id: 631, name: "Katzenhotel Berlin", type: "boarding", latitude: 52.4800, longitude: 13.4200, address: "Hermannstraße 200, 12049 Berlin", phone: "030 6251 8000", hours: "08:00 - 19:00", rating: 4.8, emoji: "🏨", website: "https://www.katzenhotel-berlin.de", country: "Germany" },
  
  // Spain
  { id: 701, name: "Hospital Veterinario Madrid", type: "vet", latitude: 40.4168, longitude: -3.7038, address: "Calle Gran Vía 50, 28013 Madrid", phone: "91 555 1234", hours: "08:00 - 21:00", rating: 4.7, emoji: "🏥", website: "https://www.hospitalveterinario.es", country: "Spain" },
  { id: 702, name: "Urgencias Veterinarias Madrid", type: "vet", latitude: 40.4200, longitude: -3.7000, address: "Calle Alcalá 100, 28009 Madrid", phone: "91 562 7890", hours: "24h", rating: 4.6, emoji: "🏥", website: "https://www.urgencias-vet.es", country: "Spain" },
  { id: 703, name: "Clínica Felina Madrid", type: "clinic", latitude: 40.4250, longitude: -3.6900, address: "Paseo de la Castellana 80, 28046 Madrid", phone: "91 578 4567", hours: "24h", rating: 4.8, emoji: "🩺", website: "https://www.clinicafelina.es", country: "Spain" },
  { id: 704, name: "Farmacia Veterinaria Madrid", type: "pharmacy", latitude: 40.4180, longitude: -3.7020, address: "Calle Serrano 25, 28001 Madrid", phone: "91 576 3456", hours: "09:00 - 21:00", rating: 4.5, emoji: "💊", website: "https://www.farmacia-vet.es", country: "Spain" },
  { id: 711, name: "Protectora de Animales Madrid", type: "shelter", latitude: 40.4100, longitude: -3.7100, address: "Calle del Refugio 15, 28019 Madrid", phone: "91 475 2345", hours: "11:00 - 17:00", rating: 4.7, emoji: "🏠", website: "https://www.protectora-madrid.org", country: "Spain" },
  { id: 721, name: "Kiwoko Madrid", type: "shop", latitude: 40.4220, longitude: -3.6950, address: "Centro Comercial ABC, Madrid", phone: "91 594 6789", hours: "10:00 - 22:00", rating: 4.5, emoji: "🛍️", website: "https://www.kiwoko.com", country: "Spain" },
  { id: 731, name: "Hotel Felino Madrid", type: "boarding", latitude: 40.4050, longitude: -3.7200, address: "Avenida de los Gatos 30, 28025 Madrid", phone: "91 469 8765", hours: "08:00 - 20:00", rating: 4.8, emoji: "🏨", website: "https://www.hotelfelino.es", country: "Spain" },
  
  // Italy
  { id: 801, name: "Clinica Veterinaria Roma", type: "vet", latitude: 41.9028, longitude: 12.4964, address: "Via del Corso 150, 00186 Roma", phone: "06 678 1234", hours: "08:00 - 20:00", rating: 4.7, emoji: "🏥", website: "https://www.clinicaveterinaria.it", country: "Italy" },
  { id: 802, name: "Pronto Soccorso Veterinario Roma", type: "vet", latitude: 41.9050, longitude: 12.4900, address: "Piazza Navona 20, 00186 Roma", phone: "06 686 9876", hours: "24h", rating: 4.6, emoji: "🏥", website: "https://www.prontosoccorsovet.it", country: "Italy" },
  { id: 803, name: "Ospedale Veterinario Roma", type: "clinic", latitude: 41.9100, longitude: 12.5000, address: "Via Veneto 100, 00187 Roma", phone: "06 487 5678", hours: "24h", rating: 4.9, emoji: "🩺", website: "https://www.ospedale-vet.it", country: "Italy" },
  { id: 804, name: "Farmacia Veterinaria Roma", type: "pharmacy", latitude: 41.9000, longitude: 12.4950, address: "Via Nazionale 50, 00184 Roma", phone: "06 488 4321", hours: "09:00 - 20:00", rating: 4.5, emoji: "💊", website: "https://www.farmacia-vet.it", country: "Italy" },
  { id: 811, name: "ENPA Roma", type: "shelter", latitude: 41.8950, longitude: 12.4800, address: "Via della Protezione 10, 00153 Roma", phone: "06 575 3456", hours: "10:00 - 17:00", rating: 4.7, emoji: "🏠", website: "https://www.enpa.it", country: "Italy" },
  { id: 821, name: "Arcaplanet Roma", type: "shop", latitude: 41.9020, longitude: 12.4980, address: "Via Cola di Rienzo 200, 00192 Roma", phone: "06 324 7890", hours: "09:00 - 21:00", rating: 4.4, emoji: "🛍️", website: "https://www.arcaplanet.it", country: "Italy" },
  { id: 831, name: "Pensione Felina Roma", type: "boarding", latitude: 41.8900, longitude: 12.5100, address: "Via Appia Nuova 300, 00183 Roma", phone: "06 772 6543", hours: "08:00 - 19:00", rating: 4.8, emoji: "🏨", website: "https://www.pensione-felina.it", country: "Italy" },
];

export default function VetsScreen() {
  const {
    coords,
    address,
    permission,
    error: locationError,
    locateOnce,
    isLocating,
  } = useUserLocation();

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [filter, setFilter] = useState<PlaceType | "all">("all");
  const [hasAskedPermission, setHasAskedPermission] = useState(false);

  const userCountry = address?.country;

  const handleRequestLocation = useCallback(() => {
    console.log("[VetsScreen] user requested location");
    setHasAskedPermission(true);
    void locateOnce();
  }, [locateOnce]);

  const handleCall = (phone: string) => {
    if (Platform.OS === 'web') {
      Alert.alert(
        "Appeler",
        `Composez ce numéro : ${phone}`,
        [{ text: "OK" }]
      );
    } else {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleNavigate = async (latitude: number, longitude: number, name: string) => {
    const googleMapsWebUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    
    if (Platform.OS === 'web') {
      Linking.openURL(googleMapsWebUrl).catch(() => {
        Alert.alert("Erreur", "Impossible d'ouvrir Google Maps");
      });
      return;
    }
    
    if (Platform.OS === 'android') {
      const googleMapsAppUrl = `google.navigation:q=${latitude},${longitude}`;
      try {
        const canOpen = await Linking.canOpenURL(googleMapsAppUrl);
        if (canOpen) {
          await Linking.openURL(googleMapsAppUrl);
          return;
        }
      } catch {}
    }
    
    // iOS: essayer d'ouvrir l'app Google Maps d'abord
    if (Platform.OS === 'ios') {
      const googleMapsAppUrl = `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`;
      try {
        const canOpen = await Linking.canOpenURL(googleMapsAppUrl);
        if (canOpen) {
          await Linking.openURL(googleMapsAppUrl);
          return;
        }
      } catch {}
    }
    
    // Fallback: ouvrir Google Maps dans le navigateur
    Linking.openURL(googleMapsWebUrl).catch(() => {
      Alert.alert("Erreur", "Impossible d'ouvrir Google Maps");
    });
  };

  const handleOpenWebsite = (website: string) => {
    Linking.openURL(website).catch(() => {
      Alert.alert(
        "Erreur",
        "Impossible d'ouvrir le site web"
      );
    });
  };

  const initialRegion = coords
    ? {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : undefined;

  const currentRegion = coords
    ? {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : undefined;

  const sortedAndFilteredPlaces = useMemo(() => {
    if (!coords || !userCountry) return [];
    
    const countryPlaces = PLACES.filter((place) => place.country === userCountry);
    if (countryPlaces.length === 0) return [];
    
    const filtered = countryPlaces.filter((place) => filter === "all" || place.type === filter);
    
    return filtered
      .map(place => ({
        ...place,
        distance: calculateDistance(
          coords.latitude,
          coords.longitude,
          place.latitude,
          place.longitude
        ),
      }))
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }, [filter, coords, userCountry]);

  const webLocationLine = useMemo(() => {
    if (permission === "denied") return "Localisation refusée.";
    if (permission === "unavailable") return "Localisation indisponible.";
    if (locationError?.message) return locationError.message;

    const label = address?.label;
    const acc = coords?.accuracyMeters;

    if (!label && !coords) return "Localisation en cours…";

    const accText =
      typeof acc === "number" ? ` (±${Math.round(acc)} m)` : "";

    if (label) return `Votre position: ${label}${accText}`;

    return `Votre position: ${coords?.latitude.toFixed(6)}, ${coords?.longitude.toFixed(6)}${accText}`;
  }, [address?.label, coords, locationError?.message, permission]);

  const handleRelocate = useCallback(() => {
    console.log("[VetsScreen] handleRelocate");
    void locateOnce();
  }, [locateOnce]);

  if (Platform.OS !== "android") {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.webSafeArea}>
          <ScrollView 
            style={styles.webScrollView}
            contentContainerStyle={styles.webScrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.webTitle}>Services pour chats à proximité</Text>
            <Text style={styles.webSubtitle}>
              {Platform.OS === "web"
                ? "La carte n'est pas entièrement supportée sur la version web."
                : "Sur iPhone, la carte intégrée utilise Apple Plans. Utilisez plutôt l'itinéraire Google Maps ci-dessous."}
            </Text>
            
            {hasAskedPermission && userCountry && (
              <View style={styles.countryBadge}>
                <MapPin size={14} color={Colors.primary} />
                <Text style={styles.countryText}>Pays détecté : {userCountry}</Text>
              </View>
            )}

            {!hasAskedPermission || (!coords && permission !== "denied") ? (
              <View style={styles.permissionCard}>
                <View style={styles.permissionIcon}>
                  <MapPin size={32} color={Colors.primary} />
                </View>
                <Text style={styles.permissionTitle}>Localisation requise</Text>
                <Text style={styles.permissionText}>
                  Pour afficher les services à proximité de votre position, autorisez l&apos;accès à votre localisation.
                </Text>
                <TouchableOpacity
                  testID="vets-request-location"
                  onPress={handleRequestLocation}
                  style={styles.permissionBtn}
                >
                  <Navigation size={18} color="white" />
                  <Text style={styles.permissionBtnText}>
                    {isLocating ? "Localisation..." : "Me localiser"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : coords && userCountry && sortedAndFilteredPlaces.length === 0 ? (
              <View style={styles.noDataCard}>
                <View style={styles.permissionIcon}>
                  <Globe size={32} color={Colors.primary} />
                </View>
                <Text style={styles.permissionTitle}>Pas de données locales</Text>
                <Text style={styles.permissionText}>
                  Nous n&apos;avons pas encore de données pour {userCountry}. Utilisez Google Maps pour trouver des services près de vous.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    const query = filter === "all" ? "veterinaire chat" : 
                      filter === "vet" ? "veterinaire" :
                      filter === "clinic" ? "clinique veterinaire" :
                      filter === "pharmacy" ? "pharmacie veterinaire" :
                      filter === "shelter" ? "refuge animaux" :
                      filter === "shop" ? "animalerie" : "pension chat";
                    Linking.openURL(`https://www.google.com/maps/search/${encodeURIComponent(query)}/@${coords.latitude},${coords.longitude},14z`);
                  }}
                  style={styles.permissionBtn}
                >
                  <Navigation size={18} color="white" />
                  <Text style={styles.permissionBtnText}>Rechercher sur Google Maps</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.locationRow}>
                <Text style={styles.locationText}>{webLocationLine}</Text>
                <TouchableOpacity
                  testID="vets-relocate"
                  onPress={handleRelocate}
                  style={styles.locationBtn}
                >
                  <Text style={styles.locationBtnText}>
                    {isLocating ? "..." : "Actualiser"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.webFilterScroll}
              contentContainerStyle={styles.webFilterContainer}
            >
              <TouchableOpacity
                style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
                onPress={() => setFilter("all")}
              >
                <MapPin size={18} color={filter === "all" ? "white" : Colors.primary} />
                <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>Tout</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterTab, filter === "vet" && styles.filterTabActive]}
                onPress={() => setFilter("vet")}
              >
                <Stethoscope size={18} color={filter === "vet" ? "white" : Colors.primary} />
                <Text style={[styles.filterText, filter === "vet" && styles.filterTextActive]}>Vétérinaires</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterTab, filter === "shelter" && styles.filterTabActive]}
                onPress={() => setFilter("shelter")}
              >
                <Home size={18} color={filter === "shelter" ? "white" : Colors.primary} />
                <Text style={[styles.filterText, filter === "shelter" && styles.filterTextActive]}>Refuges</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterTab, filter === "shop" && styles.filterTabActive]}
                onPress={() => setFilter("shop")}
              >
                <ShoppingBag size={18} color={filter === "shop" ? "white" : Colors.primary} />
                <Text style={[styles.filterText, filter === "shop" && styles.filterTextActive]}>Litière</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterTab, filter === "boarding" && styles.filterTabActive]}
                onPress={() => setFilter("boarding")}
              >
                <Hotel size={18} color={filter === "boarding" ? "white" : Colors.primary} />
                <Text style={[styles.filterText, filter === "boarding" && styles.filterTextActive]}>Pensions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterTab, filter === "clinic" && styles.filterTabActive]}
                onPress={() => setFilter("clinic")}
              >
                <Building2 size={18} color={filter === "clinic" ? "white" : Colors.primary} />
                <Text style={[styles.filterText, filter === "clinic" && styles.filterTextActive]}>Cliniques</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterTab, filter === "pharmacy" && styles.filterTabActive]}
                onPress={() => setFilter("pharmacy")}
              >
                <Pill size={18} color={filter === "pharmacy" ? "white" : Colors.primary} />
                <Text style={[styles.filterText, filter === "pharmacy" && styles.filterTextActive]}>Pharmacies</Text>
              </TouchableOpacity>
            </ScrollView>
            
            <View style={styles.listContainer}>
              {sortedAndFilteredPlaces.map((place) => (
                <View key={place.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardTitle}>{place.emoji} {place.name}</Text>
                      {place.distance !== undefined && (
                        <View style={styles.distanceBadge}>
                          <Navigation size={12} color={Colors.primary} />
                          <Text style={styles.distanceText}>{formatDistance(place.distance)}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>★ {place.rating}</Text>
                    </View>
                  </View>
                  <View style={styles.cardInfo}>
                    <MapPin size={16} color="#666" />
                    <Text style={styles.cardText}>{place.address}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Phone size={16} color="#666" />
                    <Text style={styles.cardText}>{place.phone}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Clock size={16} color="#666" />
                    <Text style={styles.cardText}>{place.hours}</Text>
                  </View>
                  <View style={styles.webActionButtons}>
                    <TouchableOpacity 
                      style={[styles.webActionButton, styles.callButton]}
                      onPress={() => handleCall(place.phone)}
                    >
                      <Phone size={18} color="white" />
                      <Text style={styles.actionButtonText}>Appeler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.webActionButton, styles.routeButton]}
                      onPress={() => handleNavigate(place.latitude, place.longitude, place.name)}
                    >
                      <Navigation size={18} color="white" />
                      <Text style={styles.actionButtonText}>Google Maps</Text>
                    </TouchableOpacity>
                    {place.website && (
                      <TouchableOpacity 
                        style={[styles.webActionButton, styles.websiteButton]}
                        onPress={() => handleOpenWebsite(place.website!)}
                      >
                        <Globe size={18} color="white" />
                        <Text style={styles.actionButtonText}>Site web</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        region={currentRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {sortedAndFilteredPlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.name}
            description={place.address}
            onPress={() => setSelectedPlace(place)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.marker}>
                <Text style={styles.markerText}>{place.emoji}</Text>
              </View>
              <View style={styles.markerArrow} />
            </View>
          </Marker>
        ))}
      </MapView>
      
      <SafeAreaView style={styles.headerOverlay} pointerEvents="box-none">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterContainer}
          style={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
            onPress={() => setFilter("all")}
          >
            <MapPin size={18} color={filter === "all" ? "white" : Colors.primary} />
            <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
              Tout
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === "vet" && styles.filterTabActive]}
            onPress={() => setFilter("vet")}
          >
            <Stethoscope size={18} color={filter === "vet" ? "white" : Colors.primary} />
            <Text style={[styles.filterText, filter === "vet" && styles.filterTextActive]}>
              Vétérinaires
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === "shelter" && styles.filterTabActive]}
            onPress={() => setFilter("shelter")}
          >
            <Home size={18} color={filter === "shelter" ? "white" : Colors.primary} />
            <Text style={[styles.filterText, filter === "shelter" && styles.filterTextActive]}>
              Refuges
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === "shop" && styles.filterTabActive]}
            onPress={() => setFilter("shop")}
          >
            <ShoppingBag size={18} color={filter === "shop" ? "white" : Colors.primary} />
            <Text style={[styles.filterText, filter === "shop" && styles.filterTextActive]}>
              Litière
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === "boarding" && styles.filterTabActive]}
            onPress={() => setFilter("boarding")}
          >
            <Hotel size={18} color={filter === "boarding" ? "white" : Colors.primary} />
            <Text style={[styles.filterText, filter === "boarding" && styles.filterTextActive]}>
              Pensions
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === "clinic" && styles.filterTabActive]}
            onPress={() => setFilter("clinic")}
          >
            <Building2 size={18} color={filter === "clinic" ? "white" : Colors.primary} />
            <Text style={[styles.filterText, filter === "clinic" && styles.filterTextActive]}>
              Cliniques
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === "pharmacy" && styles.filterTabActive]}
            onPress={() => setFilter("pharmacy")}
          >
            <Pill size={18} color={filter === "pharmacy" ? "white" : Colors.primary} />
            <Text style={[styles.filterText, filter === "pharmacy" && styles.filterTextActive]}>
              Pharmacies
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {selectedPlace && (
        <View style={styles.cardWrapper}>
          <BlurView intensity={80} tint="light" style={styles.floatingCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>{selectedPlace.emoji} {selectedPlace.name}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.stars}>{"★".repeat(Math.floor(selectedPlace.rating))}</Text>
                  <Text style={styles.ratingValue}>{selectedPlace.rating}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setSelectedPlace(null)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
              <MapPin size={18} color={Colors.primary} />
              <Text style={styles.detailText} numberOfLines={2}>{selectedPlace.address}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Clock size={18} color={Colors.primary} />
              <Text style={styles.detailText}>{selectedPlace.hours}</Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.callButton]}
                onPress={() => handleCall(selectedPlace.phone)}
              >
                <Phone size={20} color="white" />
                <Text style={styles.actionButtonText}>Appeler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.routeButton]}
                onPress={() => handleNavigate(selectedPlace.latitude, selectedPlace.longitude, selectedPlace.name)}
              >
                <Navigation size={20} color="white" />
                <Text style={styles.actionButtonText}>Y aller</Text>
              </TouchableOpacity>
            </View>
            
            {selectedPlace.website && (
              <TouchableOpacity 
                style={[styles.websiteButtonFull]}
                onPress={() => handleOpenWebsite(selectedPlace.website!)}
              >
                <Globe size={20} color="white" />
                <Text style={styles.actionButtonText}>Visiter le site web</Text>
              </TouchableOpacity>
            )}
          </BlurView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  webSafeArea: {
    flex: 1,
  },
  webScrollView: {
    flex: 1,
  },
  webScrollContent: {
    padding: 20,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  permissionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  permissionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  noDataCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  permissionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  permissionBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    marginBottom: 14,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
  },
  locationBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  locationBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },
  webTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  webSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    lineHeight: 24,
  },
  listContainer: {
    gap: 16,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    fontSize: 20,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid' as const,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 0,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
    marginTop: -2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  cardWrapper: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleRow: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    color: "#FFD700",
    fontSize: 14,
    marginRight: 4,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  detailText: {
    fontSize: 15,
    color: "#444",
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  callButton: {
    backgroundColor: '#1a1a1a',
  },
  routeButton: {
    backgroundColor: Colors.primary,
  },
  websiteButton: {
    backgroundColor: '#6366F1',
  },
  websiteButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    backgroundColor: '#6366F1',
    marginTop: 12,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: "600",
    fontSize: 16,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  filterScroll: {
    marginTop: 10,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  filterTextActive: {
    color: 'white',
  },
  webFilterScroll: {
    marginVertical: 20,
  },
  webFilterContainer: {
    gap: 10,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${Colors.primary}10`,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  countryText: {
    flex: 1,
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  ratingBadge: {
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#FBC02D',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
  },
  webActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  webActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
});
