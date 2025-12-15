import { CatProfile } from "@/context/cats";

export const SAMPLE_CATS: CatProfile[] = [
  {
    id: "cat-maine-coon-001",
    name: "Simba",
    breedId: "maine-coon",
    microchip: "250268500123456",
    birthDate: "2022-03-15",
    imageUri: "https://r2-pub.rork.com/generated-images/3c47be32-2876-414e-a2bd-9497e808ce6c.png",
    weight: "7.2",
    notes: "Chat très affectueux, adore jouer avec l'eau",
    medicalRecords: [
      {
        id: "vac-001",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-03-15",
        nextDueDate: "2025-03-15",
        notes: "Rappel annuel",
        vetName: "Dr. Martin"
      },
      {
        id: "vac-002",
        type: "vaccine",
        title: "Rage",
        date: "2024-03-15",
        nextDueDate: "2025-03-15",
        notes: "Rappel annuel",
        vetName: "Dr. Martin"
      },
      {
        id: "par-001",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-01",
        nextDueDate: "2025-02-01",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Martin"
      },
      {
        id: "par-002",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Bravecto - protection 3 mois",
        vetName: "Dr. Martin"
      }
    ]
  },
  {
    id: "cat-british-002",
    name: "Luna",
    breedId: "british-shorthair",
    microchip: "250268500234567",
    birthDate: "2021-08-22",
    imageUri: "https://r2-pub.rork.com/generated-images/35869335-bbab-4b73-ad46-287a81cf1f26.png",
    weight: "5.8",
    notes: "Calme et indépendante, dort beaucoup",
    medicalRecords: [
      {
        id: "vac-003",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-08-22",
        nextDueDate: "2025-08-22",
        notes: "Rappel annuel",
        vetName: "Dr. Dubois"
      },
      {
        id: "par-003",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-15",
        nextDueDate: "2025-01-15",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Dubois"
      },
      {
        id: "par-004",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-11-20",
        nextDueDate: "2024-12-20",
        notes: "Frontline - mensuel",
        vetName: "Dr. Dubois"
      }
    ]
  },
  {
    id: "cat-siamese-003",
    name: "Mochi",
    breedId: "siamese",
    microchip: "250268500345678",
    birthDate: "2023-01-10",
    imageUri: "https://r2-pub.rork.com/generated-images/d9b891e1-ab4b-468a-9383-0bd02130e3a2.png",
    weight: "4.5",
    notes: "Très bavard, aime être au centre de l'attention",
    medicalRecords: [
      {
        id: "vac-004",
        type: "vaccine",
        title: "Typhus, Coryza",
        date: "2024-01-10",
        nextDueDate: "2025-01-10",
        notes: "Rappel annuel",
        vetName: "Dr. Lefebvre"
      },
      {
        id: "par-005",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-10",
        nextDueDate: "2025-02-10",
        notes: "Profender - spot-on",
        vetName: "Dr. Lefebvre"
      },
      {
        id: "par-006",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Lefebvre"
      }
    ]
  },
  {
    id: "cat-bengal-004",
    name: "Tiger",
    breedId: "bengal",
    microchip: "250268500456789",
    birthDate: "2022-06-05",
    imageUri: "https://r2-pub.rork.com/generated-images/c0ecf67f-0d79-4741-9e0f-8243a59bee30.png",
    weight: "6.1",
    notes: "Très actif, chasseur né, aime grimper",
    medicalRecords: [
      {
        id: "vac-005",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-06-05",
        nextDueDate: "2025-06-05",
        notes: "Vaccin complet",
        vetName: "Dr. Bernard"
      },
      {
        id: "par-007",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-20",
        nextDueDate: "2024-12-20",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Bernard"
      },
      {
        id: "par-008",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-15",
        nextDueDate: "2024-12-15",
        notes: "Seresto - collier 8 mois",
        vetName: "Dr. Bernard"
      }
    ]
  },
  {
    id: "cat-persian-005",
    name: "Nala",
    breedId: "persian",
    microchip: "250268500567890",
    birthDate: "2021-11-30",
    imageUri: "https://r2-pub.rork.com/generated-images/25cc47f4-74b7-49cf-877e-3ba3d6226203.png",
    weight: "4.8",
    notes: "Nécessite toilettage régulier, yeux qui coulent",
    medicalRecords: [
      {
        id: "vac-006",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-11-30",
        nextDueDate: "2025-11-30",
        notes: "Rappel annuel",
        vetName: "Dr. Petit"
      },
      {
        id: "care-001",
        type: "care",
        title: "Toilettage",
        date: "2024-11-25",
        nextDueDate: "2025-02-25",
        notes: "Toilettage complet tous les 3 mois",
        vetName: "Salon Félin"
      },
      {
        id: "par-009",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-30",
        nextDueDate: "2025-01-30",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Petit"
      }
    ]
  },
  {
    id: "cat-ragdoll-006",
    name: "Felix",
    breedId: "ragdoll",
    microchip: "250268500678901",
    birthDate: "2022-04-18",
    imageUri: "https://r2-pub.rork.com/generated-images/8f47dd73-cb16-41aa-b7cb-d085c27b83a7.png",
    weight: "6.9",
    notes: "Très docile, se laisse tomber quand on le porte",
    medicalRecords: [
      {
        id: "vac-007",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-04-18",
        nextDueDate: "2025-04-18",
        notes: "Rappel annuel",
        vetName: "Dr. Rousseau"
      },
      {
        id: "par-010",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-01",
        nextDueDate: "2025-01-01",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Rousseau"
      },
      {
        id: "par-011",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-05",
        nextDueDate: "2025-01-05",
        notes: "Frontline - mensuel",
        vetName: "Dr. Rousseau"
      }
    ]
  },
  {
    id: "cat-sphynx-007",
    name: "Oscar",
    breedId: "sphynx",
    microchip: "250268500789012",
    birthDate: "2023-07-20",
    imageUri: "https://r2-pub.rork.com/generated-images/92b3545d-0ba0-4626-b5cf-dbe2aa29afb2.png",
    weight: "4.2",
    notes: "Nécessite bains réguliers, sensible au froid",
    medicalRecords: [
      {
        id: "vac-008",
        type: "vaccine",
        title: "Typhus, Coryza",
        date: "2024-07-20",
        nextDueDate: "2025-07-20",
        notes: "Rappel annuel",
        vetName: "Dr. Moreau"
      },
      {
        id: "care-002",
        type: "care",
        title: "Bain et nettoyage peau",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Bain mensuel obligatoire",
        vetName: "Dr. Moreau"
      },
      {
        id: "par-012",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-01",
        nextDueDate: "2025-02-01",
        notes: "Profender - spot-on",
        vetName: "Dr. Moreau"
      }
    ]
  },
  {
    id: "cat-abyssinian-008",
    name: "Cleo",
    breedId: "abyssinian",
    microchip: "250268500890123",
    birthDate: "2022-09-12",
    imageUri: "https://r2-pub.rork.com/generated-images/b8f7ed60-b7ad-4b83-bcd9-929068e6eaa0.png",
    weight: "4.1",
    notes: "Très curieuse et joueuse, adore explorer",
    medicalRecords: [
      {
        id: "vac-009",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-09-12",
        nextDueDate: "2025-09-12",
        notes: "Vaccin complet",
        vetName: "Dr. Lambert"
      },
      {
        id: "par-013",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-12",
        nextDueDate: "2025-02-12",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Lambert"
      },
      {
        id: "par-014",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Lambert"
      }
    ]
  },
  {
    id: "cat-birman-009",
    name: "Milo",
    breedId: "birman",
    microchip: "250268500901234",
    birthDate: "2021-12-08",
    imageUri: "https://r2-pub.rork.com/generated-images/7cfeb1ac-22fd-42f8-89f6-4e464bdf3ae6.png",
    weight: "5.5",
    notes: "Très doux et sociable, adore les câlins",
    medicalRecords: [
      {
        id: "vac-010",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-12-08",
        nextDueDate: "2025-12-08",
        notes: "Rappel annuel",
        vetName: "Dr. Girard"
      },
      {
        id: "par-015",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-08",
        nextDueDate: "2024-12-08",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Girard"
      },
      {
        id: "par-016",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2024-12-01",
        notes: "Bravecto - protection 3 mois",
        vetName: "Dr. Girard"
      }
    ]
  },
  {
    id: "cat-oriental-010",
    name: "Bella",
    breedId: "oriental",
    microchip: "250268501012345",
    birthDate: "2023-02-14",
    imageUri: "https://r2-pub.rork.com/generated-images/681552f9-8666-46fa-a190-05d4ba5ed4d6.png",
    weight: "3.8",
    notes: "Très vocale, demande beaucoup d'attention",
    medicalRecords: [
      {
        id: "vac-011",
        type: "vaccine",
        title: "Typhus, Coryza",
        date: "2024-02-14",
        nextDueDate: "2025-02-14",
        notes: "Rappel annuel",
        vetName: "Dr. Fontaine"
      },
      {
        id: "par-017",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-14",
        nextDueDate: "2025-02-14",
        notes: "Profender - spot-on",
        vetName: "Dr. Fontaine"
      },
      {
        id: "par-018",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Fontaine"
      }
    ]
  },
  {
    id: "cat-devon-rex-011",
    name: "Charlie",
    breedId: "devon-rex",
    microchip: "250268501123456",
    birthDate: "2022-10-25",
    imageUri: "https://r2-pub.rork.com/generated-images/a2fceb96-5954-4bc5-984f-daf4c87dc443.png",
    weight: "3.5",
    notes: "Pelage ondulé unique, très joueur",
    medicalRecords: [
      {
        id: "vac-012",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-10-25",
        nextDueDate: "2025-10-25",
        notes: "Rappel annuel",
        vetName: "Dr. Chevalier"
      },
      {
        id: "par-019",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-01",
        nextDueDate: "2025-01-01",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Chevalier"
      },
      {
        id: "par-020",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-11-25",
        nextDueDate: "2024-12-25",
        notes: "Advantage - mensuel",
        vetName: "Dr. Chevalier"
      }
    ]
  },
  {
    id: "cat-norwegian-012",
    name: "Max",
    breedId: "norwegian",
    microchip: "250268501234567",
    birthDate: "2021-05-17",
    imageUri: "https://r2-pub.rork.com/generated-images/0c6235f0-8194-41f0-8e00-3ae67c902bb8.png",
    weight: "7.8",
    notes: "Grand et majestueux, excellent grimpeur",
    medicalRecords: [
      {
        id: "vac-013",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-05-17",
        nextDueDate: "2025-05-17",
        notes: "Vaccin complet",
        vetName: "Dr. Blanc"
      },
      {
        id: "par-021",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-17",
        nextDueDate: "2025-02-17",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Blanc"
      },
      {
        id: "par-022",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-10-01",
        nextDueDate: "2025-01-01",
        notes: "Seresto - collier 8 mois",
        vetName: "Dr. Blanc"
      }
    ]
  },
  {
    id: "cat-russian-blue-013",
    name: "Sophie",
    breedId: "russian-blue",
    microchip: "250268501345678",
    birthDate: "2023-03-22",
    imageUri: "https://r2-pub.rork.com/generated-images/ecae1d1b-ad1e-4246-9022-bf108ecf11c1.png",
    weight: "4.3",
    notes: "Timide mais affectueuse, pelage argenté magnifique",
    medicalRecords: [
      {
        id: "vac-014",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-03-22",
        nextDueDate: "2025-03-22",
        notes: "Rappel annuel",
        vetName: "Dr. Mercier"
      },
      {
        id: "par-023",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-22",
        nextDueDate: "2024-12-22",
        notes: "Profender - spot-on",
        vetName: "Dr. Mercier"
      },
      {
        id: "par-024",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Mercier"
      }
    ]
  },
  {
    id: "cat-siberian-014",
    name: "Boris",
    breedId: "siberian",
    microchip: "250268501456789",
    birthDate: "2022-01-30",
    imageUri: "https://r2-pub.rork.com/generated-images/e259b685-ad8e-4ee5-93f5-035ef2ea39a0.png",
    weight: "6.7",
    notes: "Hypoallergénique, très athlétique et joueur",
    medicalRecords: [
      {
        id: "vac-015",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-01-30",
        nextDueDate: "2025-01-30",
        notes: "Vaccin complet",
        vetName: "Dr. Leroy"
      },
      {
        id: "par-025",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-30",
        nextDueDate: "2025-01-30",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Leroy"
      },
      {
        id: "par-026",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-15",
        nextDueDate: "2024-12-15",
        notes: "Bravecto - protection 3 mois",
        vetName: "Dr. Leroy"
      }
    ]
  },
  {
    id: "cat-chartreux-015",
    name: "Grisou",
    breedId: "chartreux",
    microchip: "250268501567890",
    birthDate: "2021-07-11",
    imageUri: "https://r2-pub.rork.com/generated-images/38f00a5d-0b9c-40f3-b160-75f312cae754.png",
    weight: "5.9",
    notes: "Sourire permanent, très tranquille",
    medicalRecords: [
      {
        id: "vac-016",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-07-11",
        nextDueDate: "2025-07-11",
        notes: "Rappel annuel",
        vetName: "Dr. Garnier"
      },
      {
        id: "par-027",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-11",
        nextDueDate: "2025-01-11",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Garnier"
      },
      {
        id: "par-028",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Garnier"
      }
    ]
  },
  {
    id: "cat-ragamuffin-016",
    name: "Teddy",
    breedId: "ragamuffin",
    microchip: "250268501678901",
    birthDate: "2022-11-03",
    imageUri: "https://r2-pub.rork.com/generated-images/308335eb-45f4-4700-a6a2-b5d357d58b20.png",
    weight: "7.5",
    notes: "Très gros et doux comme une peluche",
    medicalRecords: [
      {
        id: "vac-017",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-11-03",
        nextDueDate: "2025-11-03",
        notes: "Rappel annuel",
        vetName: "Dr. Bonnet"
      },
      {
        id: "par-029",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-03",
        nextDueDate: "2025-02-03",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Bonnet"
      },
      {
        id: "par-030",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Bonnet"
      }
    ]
  },
  {
    id: "cat-exotic-017",
    name: "Choupette",
    breedId: "exotic-shorthair",
    microchip: "250268501789012",
    birthDate: "2023-04-28",
    imageUri: "https://r2-pub.rork.com/generated-images/a238bc82-87e7-4cfa-95b2-ad9468622c8d.png",
    weight: "4.9",
    notes: "Face plate adorable, très câline",
    medicalRecords: [
      {
        id: "vac-018",
        type: "vaccine",
        title: "Typhus, Coryza",
        date: "2024-04-28",
        nextDueDate: "2025-04-28",
        notes: "Rappel annuel",
        vetName: "Dr. Faure"
      },
      {
        id: "care-003",
        type: "care",
        title: "Nettoyage yeux et nez",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Nettoyage hebdomadaire requis",
        vetName: "Dr. Faure"
      },
      {
        id: "par-031",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-28",
        nextDueDate: "2025-01-28",
        notes: "Profender - spot-on",
        vetName: "Dr. Faure"
      }
    ]
  },
  {
    id: "cat-burmese-018",
    name: "Caramel",
    breedId: "burmese",
    microchip: "250268501890123",
    birthDate: "2022-08-15",
    imageUri: "https://r2-pub.rork.com/generated-images/8bb837cf-356b-4c37-82f9-633c8297f356.png",
    weight: "5.2",
    notes: "Couleur sable magnifique, très sociable",
    medicalRecords: [
      {
        id: "vac-019",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-08-15",
        nextDueDate: "2025-08-15",
        notes: "Vaccin complet",
        vetName: "Dr. Caron"
      },
      {
        id: "par-032",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-15",
        nextDueDate: "2025-02-15",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Caron"
      },
      {
        id: "par-033",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Caron"
      }
    ]
  },
  {
    id: "cat-tonkinese-019",
    name: "Jade",
    breedId: "tonkinese",
    microchip: "250268501901234",
    birthDate: "2023-06-09",
    imageUri: "https://r2-pub.rork.com/generated-images/af6ca70a-fff1-4c74-b3c5-68fb1549151b.png",
    weight: "4.6",
    notes: "Yeux bleu-vert uniques, très joueuse",
    medicalRecords: [
      {
        id: "vac-020",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-06-09",
        nextDueDate: "2025-06-09",
        notes: "Rappel annuel",
        vetName: "Dr. Moulin"
      },
      {
        id: "par-034",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-09",
        nextDueDate: "2024-12-09",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Moulin"
      },
      {
        id: "par-035",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2024-12-01",
        notes: "Bravecto - protection 3 mois",
        vetName: "Dr. Moulin"
      }
    ]
  },
  {
    id: "cat-scottish-fold-020",
    name: "Muffin",
    breedId: "scottish-fold",
    microchip: "250268502012345",
    birthDate: "2021-09-26",
    imageUri: "https://r2-pub.rork.com/generated-images/0cb0f42e-0473-484c-a7c8-b9e5667341a7.png",
    weight: "5.1",
    notes: "Oreilles pliées adorables, très calme",
    medicalRecords: [
      {
        id: "vac-021",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-09-26",
        nextDueDate: "2025-09-26",
        notes: "Rappel annuel",
        vetName: "Dr. Andre"
      },
      {
        id: "par-036",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-26",
        nextDueDate: "2024-12-26",
        notes: "Profender - spot-on",
        vetName: "Dr. Andre"
      },
      {
        id: "par-037",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Andre"
      },
      {
        id: "care-004",
        type: "care",
        title: "Contrôle articulations",
        date: "2024-09-26",
        nextDueDate: "2025-03-26",
        notes: "Surveillance ostéochondrodysplasie",
        vetName: "Dr. Andre"
      }
    ]
  },
  {
    id: "cat-turkish-angora-021",
    name: "Neige",
    breedId: "turkish-angora",
    microchip: "250268502123456",
    birthDate: "2023-05-14",
    imageUri: "https://r2-pub.rork.com/generated-images/65ad3988-2789-4b5a-89fb-a1b2ce201ec3.png",
    weight: "4.0",
    notes: "Élégante et gracieuse, très active",
    medicalRecords: [
      {
        id: "vac-022",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-05-14",
        nextDueDate: "2025-05-14",
        notes: "Rappel annuel",
        vetName: "Dr. Vincent"
      },
      {
        id: "par-038",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-14",
        nextDueDate: "2025-02-14",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Vincent"
      },
      {
        id: "par-039",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Vincent"
      }
    ]
  },
  {
    id: "cat-american-shorthair-022",
    name: "Rocky",
    breedId: "american-shorthair",
    microchip: "250268502234567",
    birthDate: "2022-07-08",
    imageUri: "https://r2-pub.rork.com/generated-images/d23ad2c8-0f28-4af4-94b4-bcb078d26ae3.png",
    weight: "6.3",
    notes: "Robuste et joueur, excellent chasseur",
    medicalRecords: [
      {
        id: "vac-023",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-07-08",
        nextDueDate: "2025-07-08",
        notes: "Vaccin complet",
        vetName: "Dr. Philippe"
      },
      {
        id: "par-040",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-08",
        nextDueDate: "2025-01-08",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Philippe"
      },
      {
        id: "par-041",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2025-02-01",
        notes: "Bravecto - protection 3 mois",
        vetName: "Dr. Philippe"
      }
    ]
  },
  {
    id: "cat-savannah-023",
    name: "Sahara",
    breedId: "savannah",
    microchip: "250268502345678",
    birthDate: "2023-08-19",
    imageUri: "https://r2-pub.rork.com/generated-images/0875a5c4-789a-4a90-93d1-c270c3156b43.png",
    weight: "8.5",
    notes: "Apparence sauvage, très énergique et intelligente",
    medicalRecords: [
      {
        id: "vac-024",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-08-19",
        nextDueDate: "2025-08-19",
        notes: "Rappel annuel",
        vetName: "Dr. Renaud"
      },
      {
        id: "par-042",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-19",
        nextDueDate: "2025-02-19",
        notes: "Profender - spot-on",
        vetName: "Dr. Renaud"
      },
      {
        id: "par-043",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Seresto - collier 8 mois",
        vetName: "Dr. Renaud"
      }
    ]
  },
  {
    id: "cat-somali-024",
    name: "Foxy",
    breedId: "somali",
    microchip: "250268502456789",
    birthDate: "2022-04-03",
    imageUri: "https://r2-pub.rork.com/generated-images/a77b8bb0-487f-430a-8c49-cf6137ac563c.png",
    weight: "5.3",
    notes: "Queue touffue de renard, très vif",
    medicalRecords: [
      {
        id: "vac-025",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-04-03",
        nextDueDate: "2025-04-03",
        notes: "Vaccin complet",
        vetName: "Dr. Dupont"
      },
      {
        id: "par-044",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-03",
        nextDueDate: "2025-01-03",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Dupont"
      },
      {
        id: "par-045",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Dupont"
      }
    ]
  },
  {
    id: "cat-munchkin-025",
    name: "Peanut",
    breedId: "munchkin",
    microchip: "250268502567890",
    birthDate: "2023-11-21",
    imageUri: "https://r2-pub.rork.com/generated-images/1b87a924-e46a-42ad-a1d1-ea2c70dc2040.png",
    weight: "3.7",
    notes: "Courtes pattes adorables, très joueur",
    medicalRecords: [
      {
        id: "vac-026",
        type: "vaccine",
        title: "Typhus, Coryza",
        date: "2024-11-21",
        nextDueDate: "2025-11-21",
        notes: "Rappel annuel",
        vetName: "Dr. Masson"
      },
      {
        id: "par-046",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-21",
        nextDueDate: "2025-02-21",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Masson"
      },
      {
        id: "par-047",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Masson"
      }
    ]
  },
  {
    id: "cat-egyptian-mau-026",
    name: "Cléopâtre",
    breedId: "egyptian-mau",
    microchip: "250268502678901",
    birthDate: "2022-12-29",
    imageUri: "https://r2-pub.rork.com/generated-images/483388d8-4695-46c8-b824-2291ceed3e47.png",
    weight: "4.5",
    notes: "Taches naturelles léopard, très rapide",
    medicalRecords: [
      {
        id: "vac-027",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-12-29",
        nextDueDate: "2025-12-29",
        notes: "Rappel annuel",
        vetName: "Dr. Lucas"
      },
      {
        id: "par-048",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-29",
        nextDueDate: "2024-12-29",
        notes: "Profender - spot-on",
        vetName: "Dr. Lucas"
      },
      {
        id: "par-049",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Lucas"
      }
    ]
  },
  {
    id: "cat-selkirk-rex-027",
    name: "Poodle",
    breedId: "selkirk-rex",
    microchip: "250268502789012",
    birthDate: "2021-10-16",
    imageUri: "https://r2-pub.rork.com/generated-images/b436e004-9ddc-4c78-9ea5-4652724774b9.png",
    weight: "5.6",
    notes: "Pelage bouclé unique, allure de peluche",
    medicalRecords: [
      {
        id: "vac-028",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-10-16",
        nextDueDate: "2025-10-16",
        notes: "Vaccin complet",
        vetName: "Dr. Leclerc"
      },
      {
        id: "par-050",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-16",
        nextDueDate: "2025-01-16",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Leclerc"
      },
      {
        id: "par-051",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2024-12-01",
        notes: "Bravecto - protection 3 mois",
        vetName: "Dr. Leclerc"
      }
    ]
  },
  {
    id: "cat-korat-028",
    name: "Silver",
    breedId: "korat",
    microchip: "250268502890123",
    birthDate: "2023-02-07",
    imageUri: "https://r2-pub.rork.com/generated-images/325ffc11-1c55-458a-85b6-0abd2a2d96aa.png",
    weight: "4.2",
    notes: "Pelage argenté chatoyant, porte-bonheur",
    medicalRecords: [
      {
        id: "vac-029",
        type: "vaccine",
        title: "Typhus, Coryza",
        date: "2024-02-07",
        nextDueDate: "2025-02-07",
        notes: "Rappel annuel",
        vetName: "Dr. Roussel"
      },
      {
        id: "par-052",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-07",
        nextDueDate: "2025-02-07",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Roussel"
      },
      {
        id: "par-053",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Roussel"
      }
    ]
  },
  {
    id: "cat-laperm-029",
    name: "Boucle",
    breedId: "laperm",
    microchip: "250268502901234",
    birthDate: "2022-06-24",
    imageUri: "https://r2-pub.rork.com/generated-images/495d3c71-bc9c-469d-acdf-7b060aaf2b12.png",
    weight: "4.1",
    notes: "Boucles adorables, très affectueux",
    medicalRecords: [
      {
        id: "vac-030",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-06-24",
        nextDueDate: "2025-06-24",
        notes: "Rappel annuel",
        vetName: "Dr. Prevost"
      },
      {
        id: "par-054",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-24",
        nextDueDate: "2024-12-24",
        notes: "Profender - spot-on",
        vetName: "Dr. Prevost"
      },
      {
        id: "par-055",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Prevost"
      }
    ]
  },
  {
    id: "cat-nebelung-030",
    name: "Brume",
    breedId: "nebelung",
    microchip: "250268503012345",
    birthDate: "2021-08-11",
    imageUri: "https://r2-pub.rork.com/generated-images/1457b09c-a572-4023-8f7c-52d6dc743a9a.png",
    weight: "5.4",
    notes: "Pelage argenté-bleu long et soyeux",
    medicalRecords: [
      {
        id: "vac-031",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-08-11",
        nextDueDate: "2025-08-11",
        notes: "Vaccin complet",
        vetName: "Dr. Roux"
      },
      {
        id: "par-056",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-11",
        nextDueDate: "2025-02-11",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Roux"
      },
      {
        id: "par-057",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-10-01",
        nextDueDate: "2025-01-01",
        notes: "Seresto - collier 8 mois",
        vetName: "Dr. Roux"
      }
    ]
  },
  {
    id: "cat-balinese-031",
    name: "Saphir",
    breedId: "balinese",
    microchip: "250268503123456",
    birthDate: "2023-09-05",
    imageUri: "https://r2-pub.rork.com/generated-images/39176651-f0e2-403d-85cb-e578522ff21e.png",
    weight: "4.4",
    notes: "Élégant point crème, queue panachée",
    medicalRecords: [
      {
        id: "vac-032",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-09-05",
        nextDueDate: "2025-09-05",
        notes: "Rappel annuel",
        vetName: "Dr. Gillet"
      },
      {
        id: "par-058",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-05",
        nextDueDate: "2024-12-05",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Gillet"
      },
      {
        id: "par-059",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Gillet"
      }
    ]
  },
  {
    id: "cat-ocicat-032",
    name: "Léopard",
    breedId: "ocicat",
    microchip: "250268503234567",
    birthDate: "2022-03-28",
    imageUri: "https://r2-pub.rork.com/generated-images/629fd1e5-2fab-4dc4-8f81-a597acce346a.png",
    weight: "6.4",
    notes: "Taches sauvages, très athlétique",
    medicalRecords: [
      {
        id: "vac-033",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-03-28",
        nextDueDate: "2025-03-28",
        notes: "Vaccin complet",
        vetName: "Dr. Perrin"
      },
      {
        id: "par-060",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-28",
        nextDueDate: "2024-12-28",
        notes: "Profender - spot-on",
        vetName: "Dr. Perrin"
      },
      {
        id: "par-061",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-15",
        nextDueDate: "2024-12-15",
        notes: "Bravecto - protection 3 mois",
        vetName: "Dr. Perrin"
      }
    ]
  },
  {
    id: "cat-cornish-rex-033",
    name: "Velours",
    breedId: "cornish-rex",
    microchip: "250268503345678",
    birthDate: "2023-01-17",
    imageUri: "https://r2-pub.rork.com/generated-images/1b7dde11-36d8-487e-b13f-972474cc4d3e.png",
    weight: "3.9",
    notes: "Pelage ondulé court, grandes oreilles",
    medicalRecords: [
      {
        id: "vac-034",
        type: "vaccine",
        title: "Typhus, Coryza",
        date: "2024-01-17",
        nextDueDate: "2025-01-17",
        notes: "Rappel annuel",
        vetName: "Dr. Jacquet"
      },
      {
        id: "par-062",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-17",
        nextDueDate: "2025-01-17",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Jacquet"
      },
      {
        id: "par-063",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Jacquet"
      }
    ]
  },
  {
    id: "cat-havana-brown-034",
    name: "Chocolat",
    breedId: "havana-brown",
    microchip: "250268503456789",
    birthDate: "2022-11-12",
    imageUri: "https://r2-pub.rork.com/generated-images/877a2064-cb91-4e2c-8ba6-6f336d16cc5b.png",
    weight: "4.7",
    notes: "Robe acajou riche, yeux verts intenses",
    medicalRecords: [
      {
        id: "vac-035",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-11-12",
        nextDueDate: "2025-11-12",
        notes: "Rappel annuel",
        vetName: "Dr. Lemoine"
      },
      {
        id: "par-064",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-12",
        nextDueDate: "2025-02-12",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Lemoine"
      },
      {
        id: "par-065",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Lemoine"
      }
    ]
  },
  {
    id: "cat-singapura-035",
    name: "Pixie",
    breedId: "singapura",
    microchip: "250268503567890",
    birthDate: "2023-07-30",
    imageUri: "https://r2-pub.rork.com/generated-images/6d805ce3-be81-408a-8982-293598fe78d9.png",
    weight: "2.9",
    notes: "Plus petite race, grands yeux expressifs",
    medicalRecords: [
      {
        id: "vac-036",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-07-30",
        nextDueDate: "2025-07-30",
        notes: "Rappel annuel",
        vetName: "Dr. Colin"
      },
      {
        id: "par-066",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-30",
        nextDueDate: "2025-01-30",
        notes: "Profender - spot-on",
        vetName: "Dr. Colin"
      },
      {
        id: "par-067",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Colin"
      }
    ]
  },
  {
    id: "cat-cymric-036",
    name: "Pompon",
    breedId: "cymric",
    microchip: "250268503678901",
    birthDate: "2021-04-22",
    imageUri: "https://r2-pub.rork.com/generated-images/c3cad427-9931-4a03-bf64-e0ce5a7de6aa.png",
    weight: "5.8",
    notes: "Sans queue, pelage long et touffu",
    medicalRecords: [
      {
        id: "vac-037",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-04-22",
        nextDueDate: "2025-04-22",
        notes: "Vaccin complet",
        vetName: "Dr. Henry"
      },
      {
        id: "par-068",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-22",
        nextDueDate: "2025-01-22",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Henry"
      },
      {
        id: "par-069",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2024-12-01",
        notes: "Bravecto - protection 3 mois",
        vetName: "Dr. Henry"
      }
    ]
  },
  {
    id: "cat-japanese-bobtail-037",
    name: "Sakura",
    breedId: "japanese-bobtail",
    microchip: "250268503789012",
    birthDate: "2023-03-16",
    imageUri: "https://r2-pub.rork.com/generated-images/f2e0270d-a474-4bf6-8c4a-da475a440300.png",
    weight: "4.3",
    notes: "Queue pompon unique, tricolore",
    medicalRecords: [
      {
        id: "vac-038",
        type: "vaccine",
        title: "Typhus, Coryza",
        date: "2024-03-16",
        nextDueDate: "2025-03-16",
        notes: "Rappel annuel",
        vetName: "Dr. Morel"
      },
      {
        id: "par-070",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-16",
        nextDueDate: "2024-12-16",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Morel"
      },
      {
        id: "par-071",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Morel"
      }
    ]
  },
  {
    id: "cat-american-curl-038",
    name: "Twist",
    breedId: "american-curl",
    microchip: "250268503890123",
    birthDate: "2022-09-09",
    imageUri: "https://r2-pub.rork.com/generated-images/0d6246ec-f785-45e3-8e64-0d2dec611049.png",
    weight: "4.8",
    notes: "Oreilles recourbées uniques, doux",
    medicalRecords: [
      {
        id: "vac-039",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-09-09",
        nextDueDate: "2025-09-09",
        notes: "Rappel annuel",
        vetName: "Dr. Picard"
      },
      {
        id: "par-072",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-09",
        nextDueDate: "2024-12-09",
        notes: "Profender - spot-on",
        vetName: "Dr. Picard"
      },
      {
        id: "par-073",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Picard"
      }
    ]
  },
  {
    id: "cat-manx-039",
    name: "Boule",
    breedId: "manx",
    microchip: "250268503901234",
    birthDate: "2021-12-04",
    imageUri: "https://r2-pub.rork.com/generated-images/df2e1adb-5414-451c-b154-85f74b581579.png",
    weight: "5.5",
    notes: "Sans queue, corps rond et compact",
    medicalRecords: [
      {
        id: "vac-040",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-12-04",
        nextDueDate: "2025-12-04",
        notes: "Vaccin complet",
        vetName: "Dr. Brunet"
      },
      {
        id: "par-074",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-04",
        nextDueDate: "2024-12-04",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Brunet"
      },
      {
        id: "par-075",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-10-01",
        nextDueDate: "2025-01-01",
        notes: "Seresto - collier 8 mois",
        vetName: "Dr. Brunet"
      }
    ]
  },
  {
    id: "cat-pixiebob-040",
    name: "Lynx",
    breedId: "pixiebob",
    microchip: "250268504012345",
    birthDate: "2022-05-27",
    imageUri: "https://r2-pub.rork.com/generated-images/1049ebfd-26a8-4ad1-bbe9-33715b182647.png",
    weight: "7.1",
    notes: "Apparence de lynx, queue courte",
    medicalRecords: [
      {
        id: "vac-041",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-05-27",
        nextDueDate: "2025-05-27",
        notes: "Vaccin complet",
        vetName: "Dr. Simon"
      },
      {
        id: "par-076",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-27",
        nextDueDate: "2025-02-27",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Simon"
      },
      {
        id: "par-077",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2024-12-01",
        notes: "Bravecto - protection 3 mois",
        vetName: "Dr. Simon"
      }
    ]
  },
  {
    id: "cat-bombay-041",
    name: "Panthère",
    breedId: "bombay",
    microchip: "250268504123456",
    birthDate: "2023-10-14",
    imageUri: "https://r2-pub.rork.com/generated-images/28d111a1-1241-4482-b38e-83109bbbcd21.png",
    weight: "4.6",
    notes: "Robe noire brillante, yeux cuivre, allure de panthère miniature",
    medicalRecords: [
      {
        id: "vac-042",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-10-14",
        nextDueDate: "2025-10-14",
        notes: "Rappel annuel",
        vetName: "Dr. Noir"
      },
      {
        id: "par-078",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-14",
        nextDueDate: "2025-01-14",
        notes: "Profender - spot-on",
        vetName: "Dr. Noir"
      },
      {
        id: "par-079",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Noir"
      }
    ]
  },
  {
    id: "cat-turkish-van-042",
    name: "Neige d'Été",
    breedId: "turkish-van",
    microchip: "250268504234567",
    birthDate: "2022-07-19",
    imageUri: "https://r2-pub.rork.com/generated-images/722cce9b-2242-46d1-9117-05fa4a7cbaca.png",
    weight: "6.8",
    notes: "Adore l'eau, motif van roux, excellent nageur",
    medicalRecords: [
      {
        id: "vac-043",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-07-19",
        nextDueDate: "2025-07-19",
        notes: "Vaccin complet",
        vetName: "Dr. Lac"
      },
      {
        id: "par-080",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-19",
        nextDueDate: "2025-01-19",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Lac"
      },
      {
        id: "par-081",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2024-12-01",
        notes: "Bravecto - protection 3 mois",
        vetName: "Dr. Lac"
      }
    ]
  },
  {
    id: "cat-himalayan-043",
    name: "Nuage",
    breedId: "himalayan",
    microchip: "250268504345678",
    birthDate: "2021-05-08",
    imageUri: "https://r2-pub.rork.com/generated-images/4e61df7a-c536-4dfe-866a-8ed39d0859a0.png",
    weight: "5.3",
    notes: "Face écrasée, yeux bleus intenses, très calme",
    medicalRecords: [
      {
        id: "vac-044",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-05-08",
        nextDueDate: "2025-05-08",
        notes: "Rappel annuel",
        vetName: "Dr. Montagne"
      },
      {
        id: "care-005",
        type: "care",
        title: "Toilettage et nettoyage yeux",
        date: "2024-11-08",
        nextDueDate: "2025-02-08",
        notes: "Toilettage trimestriel obligatoire",
        vetName: "Salon Himalaya"
      },
      {
        id: "par-082",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-08",
        nextDueDate: "2025-02-08",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Montagne"
      }
    ]
  },
  {
    id: "cat-chausie-044",
    name: "Safari",
    breedId: "chausie",
    microchip: "250268504456789",
    birthDate: "2023-04-12",
    imageUri: "https://r2-pub.rork.com/generated-images/17e74011-4679-443a-a07e-821c7e7ff728.png",
    weight: "7.9",
    notes: "Apparence de chat de jungle, très actif et intelligent",
    medicalRecords: [
      {
        id: "vac-045",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-04-12",
        nextDueDate: "2025-04-12",
        notes: "Vaccin complet",
        vetName: "Dr. Savane"
      },
      {
        id: "par-083",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-12",
        nextDueDate: "2025-01-12",
        notes: "Profender - spot-on",
        vetName: "Dr. Savane"
      },
      {
        id: "par-084",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2025-02-01",
        notes: "Seresto - collier 8 mois",
        vetName: "Dr. Savane"
      }
    ]
  },
  {
    id: "cat-toyger-045",
    name: "Tigrou",
    breedId: "toyger",
    microchip: "250268504567890",
    birthDate: "2022-09-23",
    imageUri: "https://r2-pub.rork.com/generated-images/41725806-d307-42e1-997b-814f2f09ee20.png",
    weight: "6.5",
    notes: "Rayures de tigre parfaites, très joueur",
    medicalRecords: [
      {
        id: "vac-046",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-09-23",
        nextDueDate: "2025-09-23",
        notes: "Rappel annuel",
        vetName: "Dr. Tigre"
      },
      {
        id: "par-085",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-23",
        nextDueDate: "2024-12-23",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Tigre"
      },
      {
        id: "par-086",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Tigre"
      }
    ]
  },
  {
    id: "cat-peterbald-046",
    name: "Sphinx",
    breedId: "peterbald",
    microchip: "250268504678901",
    birthDate: "2023-06-17",
    imageUri: "https://r2-pub.rork.com/generated-images/cf699093-a321-4048-be94-d3faec56f44b.png",
    weight: "3.8",
    notes: "Élégant et sans poils, sensible au froid",
    medicalRecords: [
      {
        id: "vac-047",
        type: "vaccine",
        title: "Typhus, Coryza",
        date: "2024-06-17",
        nextDueDate: "2025-06-17",
        notes: "Rappel annuel",
        vetName: "Dr. Pierre"
      },
      {
        id: "care-006",
        type: "care",
        title: "Nettoyage peau",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Nettoyage hebdomadaire",
        vetName: "Dr. Pierre"
      },
      {
        id: "par-087",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-17",
        nextDueDate: "2024-12-17",
        notes: "Profender - spot-on",
        vetName: "Dr. Pierre"
      }
    ]
  },
  {
    id: "cat-york-chocolate-047",
    name: "Cacao",
    breedId: "york-chocolate",
    microchip: "250268504789012",
    birthDate: "2022-02-28",
    imageUri: "https://r2-pub.rork.com/generated-images/36f825ba-6aaf-4932-bdf2-9075ee15be51.png",
    weight: "6.2",
    notes: "Robe chocolat soyeuse, très affectueux",
    medicalRecords: [
      {
        id: "vac-048",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-02-28",
        nextDueDate: "2025-02-28",
        notes: "Vaccin complet",
        vetName: "Dr. York"
      },
      {
        id: "par-088",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-28",
        nextDueDate: "2025-02-28",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. York"
      },
      {
        id: "par-089",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. York"
      }
    ]
  },
  {
    id: "cat-snowshoe-048",
    name: "Chaussons",
    breedId: "snowshoe",
    microchip: "250268504890123",
    birthDate: "2023-08-05",
    imageUri: "https://r2-pub.rork.com/generated-images/95eccfb5-fd48-47bc-b9bf-bd556f20b3ba.png",
    weight: "5.1",
    notes: "Pattes blanches magnifiques, yeux bleus, V inversé",
    medicalRecords: [
      {
        id: "vac-049",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-08-05",
        nextDueDate: "2025-08-05",
        notes: "Rappel annuel",
        vetName: "Dr. Neige"
      },
      {
        id: "par-090",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-05",
        nextDueDate: "2025-02-05",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Neige"
      },
      {
        id: "par-091",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Neige"
      }
    ]
  },
  {
    id: "cat-lykoi-049",
    name: "Loup-Garou",
    breedId: "lykoi",
    microchip: "250268504901234",
    birthDate: "2023-10-31",
    imageUri: "https://r2-pub.rork.com/generated-images/179fb991-c967-45a5-b1ab-0bc45a2b89f4.png",
    weight: "4.2",
    notes: "Apparence de loup-garou unique, très rare",
    medicalRecords: [
      {
        id: "vac-050",
        type: "vaccine",
        title: "Typhus, Coryza",
        date: "2024-10-31",
        nextDueDate: "2025-10-31",
        notes: "Rappel annuel",
        vetName: "Dr. Lune"
      },
      {
        id: "par-092",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-31",
        nextDueDate: "2025-01-31",
        notes: "Profender - spot-on",
        vetName: "Dr. Lune"
      },
      {
        id: "par-093",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Lune"
      }
    ]
  },
  {
    id: "cat-khao-manee-050",
    name: "Diamant",
    breedId: "khao-manee",
    microchip: "250268505012345",
    birthDate: "2022-11-20",
    imageUri: "https://r2-pub.rork.com/generated-images/61082d2b-a442-43a7-9173-a481a26b9c43.png",
    weight: "4.5",
    notes: "Yeux vairons (un bleu, un doré), robe blanche pure",
    medicalRecords: [
      {
        id: "vac-051",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-11-20",
        nextDueDate: "2025-11-20",
        notes: "Vaccin complet",
        vetName: "Dr. Bijou"
      },
      {
        id: "par-094",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-20",
        nextDueDate: "2025-02-20",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Bijou"
      },
      {
        id: "par-095",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Bijou"
      }
    ]
  },
  {
    id: "cat-neva-masquerade-051",
    name: "Masque",
    breedId: "neva-masquerade",
    microchip: "250268505123456",
    birthDate: "2021-01-15",
    imageUri: "https://r2-pub.rork.com/generated-images/aecaab3c-2717-44db-b2b0-306209b65017.png",
    weight: "6.3",
    notes: "Sibérien colorpoint, très joueur et sociable",
    medicalRecords: [
      {
        id: "vac-052",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-01-15",
        nextDueDate: "2025-01-15",
        notes: "Rappel annuel",
        vetName: "Dr. Neva"
      },
      {
        id: "par-096",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-15",
        nextDueDate: "2025-01-15",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Neva"
      },
      {
        id: "par-097",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2024-12-01",
        notes: "Bravecto - protection 3 mois",
        vetName: "Dr. Neva"
      }
    ]
  },
  {
    id: "cat-highlander-052",
    name: "Highland",
    breedId: "highlander",
    microchip: "250268505234567",
    birthDate: "2023-05-29",
    imageUri: "https://r2-pub.rork.com/generated-images/6fe0b3af-e6a5-4bed-80eb-019a9c5432ec.png",
    weight: "7.3",
    notes: "Oreilles courbées, pattes polydactyles, allure sauvage",
    medicalRecords: [
      {
        id: "vac-053",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-05-29",
        nextDueDate: "2025-05-29",
        notes: "Vaccin complet",
        vetName: "Dr. Haute"
      },
      {
        id: "par-098",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-29",
        nextDueDate: "2025-02-28",
        notes: "Profender - spot-on",
        vetName: "Dr. Haute"
      },
      {
        id: "par-099",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2025-02-01",
        notes: "Seresto - collier 8 mois",
        vetName: "Dr. Haute"
      }
    ]
  },
  {
    id: "cat-kurilian-bobtail-053",
    name: "Pompon Sauvage",
    breedId: "kurilian-bobtail",
    microchip: "250268505345678",
    birthDate: "2022-08-07",
    imageUri: "https://r2-pub.rork.com/generated-images/8571db79-59fa-4151-aa11-dc9f2b2374bc.png",
    weight: "6.9",
    notes: "Queue pompom unique, très robuste",
    medicalRecords: [
      {
        id: "vac-054",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-08-07",
        nextDueDate: "2025-08-07",
        notes: "Rappel annuel",
        vetName: "Dr. Kuriles"
      },
      {
        id: "par-100",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-07",
        nextDueDate: "2025-02-07",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Kuriles"
      },
      {
        id: "par-101",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2024-12-01",
        notes: "Bravecto - protection 3 mois",
        vetName: "Dr. Kuriles"
      }
    ]
  },
  {
    id: "cat-dragon-li-054",
    name: "Dragon",
    breedId: "dragon-li",
    microchip: "250268505456789",
    birthDate: "2023-03-03",
    imageUri: "https://r2-pub.rork.com/generated-images/205bdf7e-46f6-401c-bd97-1ab6fa8f1159.png",
    weight: "5.8",
    notes: "Race chinoise naturelle, robe dorée tigrée",
    medicalRecords: [
      {
        id: "vac-055",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-03-03",
        nextDueDate: "2025-03-03",
        notes: "Vaccin complet",
        vetName: "Dr. Chine"
      },
      {
        id: "par-102",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-03",
        nextDueDate: "2024-12-03",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Chine"
      },
      {
        id: "par-103",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Chine"
      }
    ]
  },
  {
    id: "cat-california-spangled-055",
    name: "Spots",
    breedId: "california-spangled",
    microchip: "250268505567890",
    birthDate: "2022-06-16",
    imageUri: "https://r2-pub.rork.com/generated-images/0b74a0f3-c8b5-462c-8aed-f86199ac1b5c.png",
    weight: "6.4",
    notes: "Taches léopard, race très rare, athlétique",
    medicalRecords: [
      {
        id: "vac-056",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-06-16",
        nextDueDate: "2025-06-16",
        notes: "Rappel annuel",
        vetName: "Dr. Californie"
      },
      {
        id: "par-104",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-16",
        nextDueDate: "2024-12-16",
        notes: "Profender - spot-on",
        vetName: "Dr. Californie"
      },
      {
        id: "par-105",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2024-12-01",
        notes: "Bravecto - protection 3 mois",
        vetName: "Dr. Californie"
      }
    ]
  },
  {
    id: "cat-american-bobtail-056",
    name: "Bob",
    breedId: "american-bobtail",
    microchip: "250268505678901",
    birthDate: "2021-09-11",
    imageUri: "https://r2-pub.rork.com/generated-images/4d087096-15c2-4068-bd4e-f73c8020e598.png",
    weight: "7.6",
    notes: "Queue courte naturelle, très robuste et joueur",
    medicalRecords: [
      {
        id: "vac-057",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-09-11",
        nextDueDate: "2025-09-11",
        notes: "Vaccin complet",
        vetName: "Dr. Amérique"
      },
      {
        id: "par-106",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-11",
        nextDueDate: "2024-12-11",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Amérique"
      },
      {
        id: "par-107",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-10-01",
        nextDueDate: "2025-01-01",
        notes: "Seresto - collier 8 mois",
        vetName: "Dr. Amérique"
      }
    ]
  },
  {
    id: "cat-donskoy-057",
    name: "Don",
    breedId: "donskoy",
    microchip: "250268505789012",
    birthDate: "2023-07-25",
    imageUri: "https://r2-pub.rork.com/generated-images/20832792-a7cf-4c76-a13c-a0869a8719b7.png",
    weight: "4.1",
    notes: "Sphynx russe, peau ridée, très affectueux",
    medicalRecords: [
      {
        id: "vac-058",
        type: "vaccine",
        title: "Typhus, Coryza",
        date: "2024-07-25",
        nextDueDate: "2025-07-25",
        notes: "Rappel annuel",
        vetName: "Dr. Russie"
      },
      {
        id: "care-007",
        type: "care",
        title: "Bain et hydratation peau",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Bain mensuel requis",
        vetName: "Dr. Russie"
      },
      {
        id: "par-108",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-25",
        nextDueDate: "2025-01-25",
        notes: "Profender - spot-on",
        vetName: "Dr. Russie"
      }
    ]
  },
  {
    id: "cat-bambino-058",
    name: "Petit",
    breedId: "bambino",
    microchip: "250268505890123",
    birthDate: "2023-11-02",
    imageUri: "https://r2-pub.rork.com/generated-images/8d9ff752-b4d7-4e03-b63b-04ba272c3834.png",
    weight: "3.2",
    notes: "Pattes courtes et sans poils, adorable miniature",
    medicalRecords: [
      {
        id: "vac-059",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-11-02",
        nextDueDate: "2025-11-02",
        notes: "Rappel annuel",
        vetName: "Dr. Bambou"
      },
      {
        id: "care-008",
        type: "care",
        title: "Nettoyage peau et oreilles",
        date: "2024-12-02",
        nextDueDate: "2025-01-02",
        notes: "Soins hebdomadaires",
        vetName: "Dr. Bambou"
      },
      {
        id: "par-109",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-02",
        nextDueDate: "2025-02-02",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Bambou"
      }
    ]
  },
  {
    id: "cat-dwelf-059",
    name: "Elfe",
    breedId: "dwelf",
    microchip: "250268505901234",
    birthDate: "2022-12-18",
    imageUri: "https://r2-pub.rork.com/generated-images/3a3ca928-eacf-4b7d-9f0f-217e4c84eed5.png",
    weight: "3.4",
    notes: "Oreilles courbées, pattes courtes, sans poils",
    medicalRecords: [
      {
        id: "vac-060",
        type: "vaccine",
        title: "Typhus, Coryza",
        date: "2024-12-18",
        nextDueDate: "2025-12-18",
        notes: "Rappel annuel",
        vetName: "Dr. Féérie"
      },
      {
        id: "care-009",
        type: "care",
        title: "Soins peau et protection froid",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Soins spécifiques race nue",
        vetName: "Dr. Féérie"
      },
      {
        id: "par-110",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-18",
        nextDueDate: "2024-12-18",
        notes: "Profender - spot-on",
        vetName: "Dr. Féérie"
      }
    ]
  },
  {
    id: "cat-minskin-060",
    name: "Mini",
    breedId: "minskin",
    microchip: "250268506012345",
    birthDate: "2023-02-09",
    imageUri: "https://r2-pub.rork.com/generated-images/ddb07423-3bda-42a4-ad10-ace48dba6857.png",
    weight: "3.0",
    notes: "Très petite taille, poils aux extrémités seulement",
    medicalRecords: [
      {
        id: "vac-061",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-02-09",
        nextDueDate: "2025-02-09",
        notes: "Rappel annuel",
        vetName: "Dr. Minime"
      },
      {
        id: "par-111",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-09",
        nextDueDate: "2025-02-09",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Minime"
      },
      {
        id: "par-112",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Minime"
      }
    ]
  },
  {
    id: "cat-ukrainian-levkoy-061",
    name: "Levko",
    breedId: "ukrainian-levkoy",
    microchip: "250268506123456",
    birthDate: "2023-04-18",
    imageUri: "https://r2-pub.rork.com/generated-images/b4b40928-bdbb-41ad-87fe-8f9f8a408c6c.png",
    weight: "3.6",
    notes: "Oreilles pliées et sans poils, très rare",
    medicalRecords: [
      {
        id: "vac-062",
        type: "vaccine",
        title: "Typhus, Coryza",
        date: "2024-04-18",
        nextDueDate: "2025-04-18",
        notes: "Rappel annuel",
        vetName: "Dr. Ukraine"
      },
      {
        id: "care-010",
        type: "care",
        title: "Nettoyage peau et oreilles",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Soins hebdomadaires requis",
        vetName: "Dr. Ukraine"
      },
      {
        id: "par-113",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-18",
        nextDueDate: "2025-01-18",
        notes: "Profender - spot-on",
        vetName: "Dr. Ukraine"
      }
    ]
  },
  {
    id: "cat-ojos-azules-062",
    name: "Azul",
    breedId: "ojos-azules",
    microchip: "250268506234567",
    birthDate: "2022-05-12",
    imageUri: "https://r2-pub.rork.com/generated-images/089029eb-df6d-4a6f-aeb5-610a600a49b1.png",
    weight: "4.9",
    notes: "Yeux bleus profonds uniques, très rare",
    medicalRecords: [
      {
        id: "vac-063",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-05-12",
        nextDueDate: "2025-05-12",
        notes: "Rappel annuel",
        vetName: "Dr. Bleu"
      },
      {
        id: "par-114",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-12",
        nextDueDate: "2025-02-12",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Bleu"
      },
      {
        id: "par-115",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Bleu"
      }
    ]
  },
  {
    id: "cat-german-rex-063",
    name: "Rex",
    breedId: "german-rex",
    microchip: "250268506345678",
    birthDate: "2023-08-27",
    imageUri: "https://r2-pub.rork.com/generated-images/ee12cbfd-f7c2-4792-b7f5-d6a8be9b78d4.png",
    weight: "4.3",
    notes: "Pelage ondulé unique, très doux",
    medicalRecords: [
      {
        id: "vac-064",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-08-27",
        nextDueDate: "2025-08-27",
        notes: "Vaccin complet",
        vetName: "Dr. Allemagne"
      },
      {
        id: "par-116",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-27",
        nextDueDate: "2025-02-27",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Allemagne"
      },
      {
        id: "par-117",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Allemagne"
      }
    ]
  },
  {
    id: "cat-sokoke-064",
    name: "Safari",
    breedId: "sokoke",
    microchip: "250268506456789",
    birthDate: "2022-03-09",
    imageUri: "https://r2-pub.rork.com/generated-images/329fd77b-5adf-426c-bd11-70660289b8d2.png",
    weight: "5.1",
    notes: "Motif bois unique, origine africaine",
    medicalRecords: [
      {
        id: "vac-065",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-03-09",
        nextDueDate: "2025-03-09",
        notes: "Vaccin complet",
        vetName: "Dr. Afrique"
      },
      {
        id: "par-118",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-09",
        nextDueDate: "2024-12-09",
        notes: "Profender - spot-on",
        vetName: "Dr. Afrique"
      },
      {
        id: "par-119",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2024-12-01",
        notes: "Bravecto - protection 3 mois",
        vetName: "Dr. Afrique"
      }
    ]
  },
  {
    id: "cat-arabian-mau-065",
    name: "Sahara",
    breedId: "arabian-mau",
    microchip: "250268506567890",
    birthDate: "2023-01-24",
    imageUri: "https://r2-pub.rork.com/generated-images/704ac5eb-2f25-42be-8474-a1e679ebbf51.png",
    weight: "5.4",
    notes: "Chat du désert, très résistant",
    medicalRecords: [
      {
        id: "vac-066",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-01-24",
        nextDueDate: "2025-01-24",
        notes: "Rappel annuel",
        vetName: "Dr. Arabie"
      },
      {
        id: "par-120",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-24",
        nextDueDate: "2025-01-24",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Arabie"
      },
      {
        id: "par-121",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Arabie"
      }
    ]
  },
  {
    id: "cat-asian-066",
    name: "Thaï",
    breedId: "asian",
    microchip: "250268506678901",
    birthDate: "2022-11-07",
    imageUri: "https://r2-pub.rork.com/generated-images/bf1ac54e-274b-4311-88b6-edf7be7cf89e.png",
    weight: "5.2",
    notes: "Élégant et sociable, robe brillante",
    medicalRecords: [
      {
        id: "vac-067",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-11-07",
        nextDueDate: "2025-11-07",
        notes: "Vaccin complet",
        vetName: "Dr. Asie"
      },
      {
        id: "par-122",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-07",
        nextDueDate: "2025-02-07",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Asie"
      },
      {
        id: "par-123",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Asie"
      }
    ]
  },
  {
    id: "cat-serengeti-067",
    name: "Serval",
    breedId: "serengeti",
    microchip: "250268506789012",
    birthDate: "2023-06-15",
    imageUri: "https://r2-pub.rork.com/generated-images/ff1b49c9-382d-442b-8bf5-0019a7c7e032.png",
    weight: "8.2",
    notes: "Apparence de serval, très énergique",
    medicalRecords: [
      {
        id: "vac-068",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-06-15",
        nextDueDate: "2025-06-15",
        notes: "Vaccin complet",
        vetName: "Dr. Serengeti"
      },
      {
        id: "par-124",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-15",
        nextDueDate: "2024-12-15",
        notes: "Profender - spot-on",
        vetName: "Dr. Serengeti"
      },
      {
        id: "par-125",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2025-02-01",
        notes: "Seresto - collier 8 mois",
        vetName: "Dr. Serengeti"
      }
    ]
  },
  {
    id: "cat-european-shorthair-068",
    name: "Europa",
    breedId: "european-shorthair",
    microchip: "250268506890123",
    birthDate: "2021-07-22",
    imageUri: "https://r2-pub.rork.com/generated-images/c1c1e4d2-d801-4e12-8d0a-9a1c16db6c03.png",
    weight: "5.7",
    notes: "Chat européen naturel, robuste",
    medicalRecords: [
      {
        id: "vac-069",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-07-22",
        nextDueDate: "2025-07-22",
        notes: "Rappel annuel",
        vetName: "Dr. Europe"
      },
      {
        id: "par-126",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-22",
        nextDueDate: "2025-01-22",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Europe"
      },
      {
        id: "par-127",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Europe"
      }
    ]
  },
  {
    id: "cat-aegean-069",
    name: "Athéna",
    breedId: "aegean",
    microchip: "250268506901234",
    birthDate: "2023-09-30",
    imageUri: "https://r2-pub.rork.com/generated-images/50ece54d-bdd2-4636-b1bb-dd04ac9d1f0c.png",
    weight: "4.8",
    notes: "Chat des îles grecques, aime l'eau",
    medicalRecords: [
      {
        id: "vac-070",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-09-30",
        nextDueDate: "2025-09-30",
        notes: "Vaccin complet",
        vetName: "Dr. Grèce"
      },
      {
        id: "par-128",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-30",
        nextDueDate: "2024-12-30",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Grèce"
      },
      {
        id: "par-129",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Grèce"
      }
    ]
  },
  {
    id: "cat-chantilly-070",
    name: "Tiffany",
    breedId: "chantilly-tiffany",
    microchip: "250268507012345",
    birthDate: "2022-04-14",
    imageUri: "https://r2-pub.rork.com/generated-images/87c4db1b-d209-4bd1-89e6-2935dca30462.png",
    weight: "5.6",
    notes: "Robe chocolat luxueuse, queue panachée",
    medicalRecords: [
      {
        id: "vac-071",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-04-14",
        nextDueDate: "2025-04-14",
        notes: "Rappel annuel",
        vetName: "Dr. Chantilly"
      },
      {
        id: "par-130",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-14",
        nextDueDate: "2025-01-14",
        notes: "Profender - spot-on",
        vetName: "Dr. Chantilly"
      },
      {
        id: "par-131",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Chantilly"
      }
    ]
  },
  {
    id: "cat-javanese-071",
    name: "Java",
    breedId: "javanese",
    microchip: "250268507123456",
    birthDate: "2023-12-06",
    imageUri: "https://r2-pub.rork.com/generated-images/717c48c9-65c3-4c67-83f8-a480451a7845.png",
    weight: "4.4",
    notes: "Élégant oriental, queue panachée",
    medicalRecords: [
      {
        id: "vac-072",
        type: "vaccine",
        title: "Typhus, Coryza",
        date: "2024-12-06",
        nextDueDate: "2025-12-06",
        notes: "Rappel annuel",
        vetName: "Dr. Javane"
      },
      {
        id: "par-132",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-06",
        nextDueDate: "2024-12-06",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Javane"
      },
      {
        id: "par-133",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Javane"
      }
    ]
  },
  {
    id: "cat-colorpoint-072",
    name: "Ruby",
    breedId: "colorpoint-shorthair",
    microchip: "250268507234567",
    birthDate: "2022-08-19",
    imageUri: "https://r2-pub.rork.com/generated-images/fe9d83b4-6e44-4900-ae39-4a4c8f4b26f0.png",
    weight: "4.2",
    notes: "Points roux, très bavard",
    medicalRecords: [
      {
        id: "vac-073",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-08-19",
        nextDueDate: "2025-08-19",
        notes: "Vaccin complet",
        vetName: "Dr. Point"
      },
      {
        id: "par-134",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-19",
        nextDueDate: "2025-02-19",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Point"
      },
      {
        id: "par-135",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Point"
      }
    ]
  },
  {
    id: "cat-burmilla-073",
    name: "Argent",
    breedId: "burmilla",
    microchip: "250268507345678",
    birthDate: "2023-05-03",
    imageUri: "https://r2-pub.rork.com/generated-images/68db96d4-37fe-458b-b769-5bf3bf6944ef.png",
    weight: "4.9",
    notes: "Pelage argenté scintillant, yeux verts",
    medicalRecords: [
      {
        id: "vac-074",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-05-03",
        nextDueDate: "2025-05-03",
        notes: "Rappel annuel",
        vetName: "Dr. Argent"
      },
      {
        id: "par-136",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-03",
        nextDueDate: "2025-02-03",
        notes: "Profender - spot-on",
        vetName: "Dr. Argent"
      },
      {
        id: "par-137",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Argent"
      }
    ]
  },
  {
    id: "cat-australian-mist-074",
    name: "Sydney",
    breedId: "australian-mist",
    microchip: "250268507456789",
    birthDate: "2022-10-28",
    imageUri: "https://r2-pub.rork.com/generated-images/0dff6202-cfe4-4a08-aa87-6f465ab5cc35.png",
    weight: "5.3",
    notes: "Motif brumeux doré, très gentil",
    medicalRecords: [
      {
        id: "vac-075",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-10-28",
        nextDueDate: "2025-10-28",
        notes: "Vaccin complet",
        vetName: "Dr. Australie"
      },
      {
        id: "par-138",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-28",
        nextDueDate: "2025-01-28",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Australie"
      },
      {
        id: "par-139",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2024-12-01",
        notes: "Bravecto - protection 3 mois",
        vetName: "Dr. Australie"
      }
    ]
  },
  {
    id: "cat-tiffanie-075",
    name: "Tiffany",
    breedId: "tiffanie",
    microchip: "250268507567890",
    birthDate: "2023-02-21",
    imageUri: "https://r2-pub.rork.com/generated-images/d2a1ac4b-7518-439a-b438-b5bb72596e1c.png",
    weight: "5.1",
    notes: "Asian à poil long, très élégant",
    medicalRecords: [
      {
        id: "vac-076",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-02-21",
        nextDueDate: "2025-02-21",
        notes: "Rappel annuel",
        vetName: "Dr. Tiffanie"
      },
      {
        id: "par-140",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-21",
        nextDueDate: "2025-02-21",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Tiffanie"
      },
      {
        id: "par-141",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Tiffanie"
      }
    ]
  },
  {
    id: "cat-foldex-076",
    name: "Fold",
    breedId: "foldex",
    microchip: "250268507678901",
    birthDate: "2022-06-10",
    imageUri: "https://r2-pub.rork.com/generated-images/63e4ddb6-bc15-4615-b5d4-23450684a100.png",
    weight: "5.4",
    notes: "Oreilles pliées et face écrasée",
    medicalRecords: [
      {
        id: "vac-077",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-06-10",
        nextDueDate: "2025-06-10",
        notes: "Vaccin complet",
        vetName: "Dr. Fold"
      },
      {
        id: "care-011",
        type: "care",
        title: "Contrôle articulations et oreilles",
        date: "2024-06-10",
        nextDueDate: "2024-12-10",
        notes: "Surveillance semestrielle",
        vetName: "Dr. Fold"
      },
      {
        id: "par-142",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-10",
        nextDueDate: "2024-12-10",
        notes: "Profender - spot-on",
        vetName: "Dr. Fold"
      }
    ]
  },
  {
    id: "cat-napoleon-077",
    name: "Napoléon",
    breedId: "napoleon",
    microchip: "250268507789012",
    birthDate: "2023-11-15",
    imageUri: "https://r2-pub.rork.com/generated-images/0964d8a8-da69-41f9-bd73-04d968f1779f.png",
    weight: "3.8",
    notes: "Pattes courtes, face persane adorable",
    medicalRecords: [
      {
        id: "vac-078",
        type: "vaccine",
        title: "Typhus, Coryza",
        date: "2024-11-15",
        nextDueDate: "2025-11-15",
        notes: "Rappel annuel",
        vetName: "Dr. Empire"
      },
      {
        id: "par-143",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-15",
        nextDueDate: "2025-02-15",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Empire"
      },
      {
        id: "par-144",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Empire"
      }
    ]
  },
  {
    id: "cat-kinkalow-078",
    name: "Kink",
    breedId: "kinkalow",
    microchip: "250268507890123",
    birthDate: "2023-07-08",
    imageUri: "https://r2-pub.rork.com/generated-images/99d6aa8f-6b2c-4909-ab6c-4240c85a485e.png",
    weight: "3.3",
    notes: "Pattes courtes et oreilles recourbées",
    medicalRecords: [
      {
        id: "vac-079",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-07-08",
        nextDueDate: "2025-07-08",
        notes: "Rappel annuel",
        vetName: "Dr. Unique"
      },
      {
        id: "par-145",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-08",
        nextDueDate: "2025-01-08",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Unique"
      },
      {
        id: "par-146",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Unique"
      }
    ]
  },
  {
    id: "cat-lambkin-079",
    name: "Agneau",
    breedId: "lambkin",
    microchip: "250268507901234",
    birthDate: "2022-12-02",
    imageUri: "https://r2-pub.rork.com/generated-images/4e542cc9-b7d3-48e3-87eb-aa4b5dd21b4b.png",
    weight: "3.5",
    notes: "Pelage bouclé et pattes courtes",
    medicalRecords: [
      {
        id: "vac-080",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-12-02",
        nextDueDate: "2025-12-02",
        notes: "Vaccin complet",
        vetName: "Dr. Mouton"
      },
      {
        id: "par-147",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-02",
        nextDueDate: "2024-12-02",
        notes: "Profender - spot-on",
        vetName: "Dr. Mouton"
      },
      {
        id: "par-148",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Mouton"
      }
    ]
  },
  {
    id: "cat-skookum-080",
    name: "Skook",
    breedId: "skookum",
    microchip: "250268508012345",
    birthDate: "2023-03-25",
    imageUri: "https://r2-pub.rork.com/generated-images/76de859e-675f-472f-9c47-fcc9a4bb3c60.png",
    weight: "3.6",
    notes: "Pattes courtes et pelage ondulé",
    medicalRecords: [
      {
        id: "vac-081",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-03-25",
        nextDueDate: "2025-03-25",
        notes: "Rappel annuel",
        vetName: "Dr. Curly"
      },
      {
        id: "par-149",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-25",
        nextDueDate: "2024-12-25",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Curly"
      },
      {
        id: "par-150",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Curly"
      }
    ]
  },
  {
    id: "cat-suphalak-081",
    name: "Cuivre",
    breedId: "suphalak",
    microchip: "250268508123456",
    birthDate: "2022-01-14",
    imageUri: "https://r2-pub.rork.com/generated-images/dcda2431-dea2-4219-b969-834a0b73085d.png",
    weight: "5.0",
    notes: "Robe acajou uniforme, race thaïlandaise ancienne",
    medicalRecords: [
      {
        id: "vac-082",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-01-14",
        nextDueDate: "2025-01-14",
        notes: "Rappel annuel",
        vetName: "Dr. Thaï"
      },
      {
        id: "par-151",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-14",
        nextDueDate: "2025-01-14",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Thaï"
      },
      {
        id: "par-152",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Thaï"
      }
    ]
  },
  {
    id: "cat-raas-082",
    name: "Java",
    breedId: "raas",
    microchip: "250268508234567",
    birthDate: "2023-04-08",
    imageUri: "https://r2-pub.rork.com/generated-images/85250d68-0534-4ac9-831d-f65b6f794097.png",
    weight: "5.1",
    notes: "Queue courte naturelle, apparence sauvage d'Indonésie",
    medicalRecords: [
      {
        id: "vac-083",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-04-08",
        nextDueDate: "2025-04-08",
        notes: "Vaccin complet",
        vetName: "Dr. Insulaire"
      },
      {
        id: "par-153",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-08",
        nextDueDate: "2025-01-08",
        notes: "Profender - spot-on",
        vetName: "Dr. Insulaire"
      },
      {
        id: "par-154",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2024-12-01",
        notes: "Bravecto - protection 3 mois",
        vetName: "Dr. Insulaire"
      }
    ]
  },
  {
    id: "cat-cyprus-083",
    name: "Chypre",
    breedId: "cyprus",
    microchip: "250268508345678",
    birthDate: "2022-09-19",
    imageUri: "https://r2-pub.rork.com/generated-images/3a7aafaa-4984-4293-9778-ed2ae419a2dd.png",
    weight: "5.7",
    notes: "Chat naturel de Chypre, robuste et adaptable",
    medicalRecords: [
      {
        id: "vac-084",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-09-19",
        nextDueDate: "2025-09-19",
        notes: "Rappel annuel",
        vetName: "Dr. Méditerranée"
      },
      {
        id: "par-155",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-19",
        nextDueDate: "2024-12-19",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Méditerranée"
      },
      {
        id: "par-156",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Méditerranée"
      }
    ]
  },
  {
    id: "cat-sam-sawet-084",
    name: "Or",
    breedId: "sam-sawet",
    microchip: "250268508456789",
    birthDate: "2023-07-13",
    imageUri: "https://r2-pub.rork.com/generated-images/9410177a-8f09-45bb-bb4d-b23c1edd5b15.png",
    weight: "4.9",
    notes: "Robe dorée-argentée scintillante, race thaïlandaise rare",
    medicalRecords: [
      {
        id: "vac-085",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-07-13",
        nextDueDate: "2025-07-13",
        notes: "Rappel annuel",
        vetName: "Dr. Précieux"
      },
      {
        id: "par-157",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-13",
        nextDueDate: "2025-01-13",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Précieux"
      },
      {
        id: "par-158",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Précieux"
      }
    ]
  },
  {
    id: "cat-german-longhair-085",
    name: "Ludwig",
    breedId: "german-longhair",
    microchip: "250268508567890",
    birthDate: "2021-03-27",
    imageUri: "https://r2-pub.rork.com/generated-images/4d8082f8-4b75-4899-bbeb-2d0d4b2ccfa4.png",
    weight: "6.1",
    notes: "Poil semi-long soyeux, race allemande recréée",
    medicalRecords: [
      {
        id: "vac-086",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-03-27",
        nextDueDate: "2025-03-27",
        notes: "Vaccin complet",
        vetName: "Dr. Allemand"
      },
      {
        id: "par-159",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-27",
        nextDueDate: "2024-12-27",
        notes: "Profender - spot-on",
        vetName: "Dr. Allemand"
      },
      {
        id: "par-160",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Allemand"
      }
    ]
  },
  {
    id: "cat-ural-rex-086",
    name: "Oural",
    breedId: "ural-rex",
    microchip: "250268508678901",
    birthDate: "2023-10-05",
    imageUri: "https://r2-pub.rork.com/generated-images/6036b2e7-09c6-4a04-b007-1bfead206ef0.png",
    weight: "4.1",
    notes: "Pelage ondulé naturel des monts Oural",
    medicalRecords: [
      {
        id: "vac-087",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-10-05",
        nextDueDate: "2025-10-05",
        notes: "Rappel annuel",
        vetName: "Dr. Russe"
      },
      {
        id: "par-161",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-10-05",
        nextDueDate: "2025-01-05",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Russe"
      },
      {
        id: "par-162",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Russe"
      }
    ]
  },
  {
    id: "cat-mekong-bobtail-087",
    name: "Mékong",
    breedId: "mekong-bobtail",
    microchip: "250268508789012",
    birthDate: "2022-05-21",
    imageUri: "https://r2-pub.rork.com/generated-images/223ed04c-9089-428a-badc-f5c09f150cdb.png",
    weight: "5.3",
    notes: "Queue courte tordue, colorpoint, comportement canin",
    medicalRecords: [
      {
        id: "vac-088",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-05-21",
        nextDueDate: "2025-05-21",
        notes: "Vaccin complet",
        vetName: "Dr. Asiatique"
      },
      {
        id: "par-163",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-21",
        nextDueDate: "2025-02-21",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Asiatique"
      },
      {
        id: "par-164",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Asiatique"
      },
      {
        id: "care-012",
        type: "care",
        title: "Contrôle dentaire",
        date: "2024-11-21",
        nextDueDate: "2025-05-21",
        notes: "Hygiène dentaire semestrielle",
        vetName: "Dr. Asiatique"
      }
    ]
  },
  {
    id: "cat-genetta-088",
    name: "Genet",
    breedId: "genetta",
    microchip: "250268508890123",
    birthDate: "2023-08-16",
    imageUri: "https://r2-pub.rork.com/generated-images/dbfd8362-ac1c-4424-8f2a-e942f38c45c5.png",
    weight: "3.7",
    notes: "Pattes courtes, taches léopard, apparence exotique",
    medicalRecords: [
      {
        id: "vac-089",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-08-16",
        nextDueDate: "2025-08-16",
        notes: "Rappel annuel",
        vetName: "Dr. Exotique"
      },
      {
        id: "par-165",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-16",
        nextDueDate: "2025-02-16",
        notes: "Profender - spot-on",
        vetName: "Dr. Exotique"
      },
      {
        id: "par-166",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Exotique"
      }
    ]
  },
  {
    id: "cat-thai-089",
    name: "Siam",
    breedId: "thai",
    microchip: "250268508901234",
    birthDate: "2022-11-23",
    imageUri: "https://r2-pub.rork.com/generated-images/c1aed1ea-6737-4872-8ad1-5ac438db17d2.png",
    weight: "4.8",
    notes: "Siamois traditionnel, tête ronde, yeux bleus",
    medicalRecords: [
      {
        id: "vac-090",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-11-23",
        nextDueDate: "2025-11-23",
        notes: "Rappel annuel",
        vetName: "Dr. Traditionnel"
      },
      {
        id: "par-167",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-23",
        nextDueDate: "2025-02-23",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Traditionnel"
      },
      {
        id: "par-168",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Traditionnel"
      }
    ]
  },
  {
    id: "cat-aphrodite-giant-090",
    name: "Aphrodite",
    breedId: "aphrodite-giant",
    microchip: "250268509012345",
    birthDate: "2021-06-11",
    imageUri: "https://r2-pub.rork.com/generated-images/3c7b766b-fda4-47da-9f02-0e759e5a2ab3.png",
    weight: "8.3",
    notes: "Grande taille, race naturelle de Chypre, très robuste",
    medicalRecords: [
      {
        id: "vac-091",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose, Rage",
        date: "2024-06-11",
        nextDueDate: "2025-06-11",
        notes: "Vaccin complet",
        vetName: "Dr. Géant"
      },
      {
        id: "par-169",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-11",
        nextDueDate: "2024-12-11",
        notes: "Drontal - tous les 3 mois",
        vetName: "Dr. Géant"
      },
      {
        id: "par-170",
        type: "parasite",
        title: "Anti-puces et tiques",
        date: "2024-11-01",
        nextDueDate: "2025-02-01",
        notes: "Seresto - collier 8 mois",
        vetName: "Dr. Géant"
      }
    ]
  },
  {
    id: "cat-brazilian-shorthair-091",
    name: "Rio",
    breedId: "european-shorthair",
    microchip: "250268509123456",
    birthDate: "2023-02-17",
    imageUri: "https://r2-pub.rork.com/generated-images/7e399c03-b781-4a78-a5e1-e4901d41eb20.png",
    weight: "5.4",
    notes: "Chat naturel, athlétique et sociable",
    medicalRecords: [
      {
        id: "vac-092",
        type: "vaccine",
        title: "Typhus, Coryza, Leucose",
        date: "2024-02-17",
        nextDueDate: "2025-02-17",
        notes: "Rappel annuel",
        vetName: "Dr. Brésil"
      },
      {
        id: "par-171",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-11-17",
        nextDueDate: "2025-02-17",
        notes: "Profender - spot-on",
        vetName: "Dr. Brésil"
      },
      {
        id: "par-172",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Frontline - mensuel",
        vetName: "Dr. Brésil"
      }
    ]
  },
  {
    id: "cat-minuet-092",
    name: "Minuet",
    breedId: "napoleon",
    microchip: "250268509234567",
    birthDate: "2023-12-09",
    imageUri: "https://r2-pub.rork.com/generated-images/7fb58d3f-1d6e-4393-ab8b-8f11a78d9e92.png",
    weight: "3.9",
    notes: "Pattes courtes, face persane, pelage long et doux",
    medicalRecords: [
      {
        id: "vac-093",
        type: "vaccine",
        title: "Typhus, Coryza",
        date: "2024-12-09",
        nextDueDate: "2025-12-09",
        notes: "Rappel annuel",
        vetName: "Dr. Petit"
      },
      {
        id: "care-013",
        type: "care",
        title: "Toilettage et nettoyage yeux",
        date: "2024-12-09",
        nextDueDate: "2025-03-09",
        notes: "Toilettage trimestriel",
        vetName: "Salon Minuet"
      },
      {
        id: "par-173",
        type: "parasite",
        title: "Vermifuge",
        date: "2024-09-09",
        nextDueDate: "2024-12-09",
        notes: "Milbemax - tous les 3 mois",
        vetName: "Dr. Petit"
      },
      {
        id: "par-174",
        type: "parasite",
        title: "Anti-puces",
        date: "2024-12-01",
        nextDueDate: "2025-01-01",
        notes: "Advantage - mensuel",
        vetName: "Dr. Petit"
      }
    ]
  }
];
