export type BreedId =
  | "maine-coon"
  | "british-shorthair"
  | "siamese"
  | "bengal"
  | "persian"
  | "ragdoll"
  | "sphynx"
  | "abyssinian"
  | "birman"
  | "oriental"
  | "devon-rex"
  | "norwegian"
  | "russian-blue"
  | "siberian"
  | "chartreux"
  | "sacred-birman"
  | "ragamuffin"
  | "exotic-shorthair"
  | "burmese"
  | "tonkinese"
  | "scottish-fold"
  | "somali"
  | "turkish-angora"
  | "american-shorthair"
  | "cornish-rex"
  | "manx"
  | "balinese"
  | "ocicat"
  | "korat"
  | "turkish-van"
  | "himalayan"
  | "egyptian-mau"
  | "savannah"
  | "laperm"
  | "singapura"
  | "selkirk-rex"
  | "pixiebob"
  | "bombay"
  | "havana-brown"
  | "cymric"
  | "american-curl"
  | "japanese-bobtail"
  | "chausie"
  | "munchkin"
  | "toyger"
  | "peterbald"
  | "nebelung"
  | "york-chocolate"
  | "snowshoe"
  | "lykoi"
  | "khao-manee"
  | "neva-masquerade"
  | "highlander"
  | "kurilian-bobtail"
  | "dragon-li"
  | "california-spangled"
  | "american-bobtail"
  | "donskoy"
  | "bambino"
  | "dwelf"
  | "minskin"
  | "ukrainian-levkoy"
  | "ojos-azules"
  | "german-rex"
  | "sokoke"
  | "arabian-mau"
  | "asian"
  | "serengeti"
  | "european-shorthair"
  | "aegean"
  | "chantilly-tiffany"
  | "javanese"
  | "colorpoint-shorthair"
  | "burmilla"
  | "australian-mist"
  | "tiffanie"
  | "foldex"
  | "napoleon"
  | "kinkalow"
  | "lambkin"
  | "skookum"
  | "genetta"
  | "thai"
  | "aphrodite-giant"
  | "suphalak"
  | "raas"
  | "cyprus"
  | "sam-sawet"
  | "german-longhair"
  | "ural-rex"
  | "mekong-bobtail"
  | "gouttiere"
  | "gouttiere-poil-long"
  | "gouttiere-blanc-brun-roux"
  | "gouttiere-blanc-chartreux"
  | "gouttiere-noir-blanc"
  | "gouttiere-roux";

export type BreedCoat = {
  length: "court" | "mi-long" | "long" | "sans poils";
  shedding: "faible" | "modéré" | "élevé";
  notes: string[];
};

export type BreedCare = {
  grooming: string[];
  habits: string[];
  watchouts: string[];
};

export type BreedHealth = {
  common: string[];
  specific: string[];
  prevention: string[];
  vetWhen: string[];
};

export type BreedDiet = {
  recommended: string[];
  avoid: string[];
  notes: string[];
};

export type BreedProfile = {
  id: BreedId;
  name: string;
  origin: string;
  temperament: string[];
  coat: BreedCoat;
  care: BreedCare;
  health: BreedHealth;
  diet: BreedDiet;
  imageUri: string;
};

export const BREEDS: BreedProfile[] = [
  {
    id: "maine-coon",
    name: "Maine Coon",
    origin: "États-Unis",
    temperament: ["sociable", "doux", "curieux"],
    coat: {
      length: "long",
      shedding: "modéré",
      notes: [
        "Sous-poil présent, frange au cou (collerette)",
        "Risque de nœuds derrière les oreilles et aux aisselles",
      ],
    },
    care: {
      grooming: [
        "Brossage 2–3×/semaine (quotidien en mue)",
        "Peigne métallique pour démêler en profondeur",
        "Contrôle des oreilles et de la queue (zones à nœuds)",
      ],
      habits: [
        "Aime la compagnie humaine, souvent “chien-like”",
        "Jeu intelligent : puzzles, chasse, canne à pêche",
      ],
      watchouts: [
        "Surveiller la prise de poids (grand gabarit)",
        "Signes d’essoufflement ou fatigue inhabituelle",
      ],
    },
    health: {
      common: [
        "Problèmes dentaires (comme beaucoup de chats)",
        "Obésité si sédentaire",
      ],
      specific: [
        "Cardiomyopathie hypertrophique (HCM)",
        "Dysplasie de la hanche",
      ],
      prevention: [
        "Contrôle vétérinaire annuel + auscultation",
        "Maintenir une activité régulière",
        "Hygiène dentaire (friandises dentaires + brossage si possible)",
      ],
      vetWhen: [
        "Respiration rapide au repos",
        "Boiterie persistante",
        "Perte d’appétit > 24h",
      ],
    },
    diet: {
      recommended: [
        "Alimentation riche en protéines animales",
        "Croquettes + pâtée (hydratation)",
        "Portions adaptées au poids idéal",
      ],
      avoid: [
        "Restes salés/gras",
        "Changements brusques d’alimentation",
      ],
      notes: [
        "Grande taille : attention aux apports caloriques",
        "L’eau est clé : fontaine recommandée",
      ],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/qk5dl0megpp1u5o0lxxiv",
  },
  {
    id: "british-shorthair",
    name: "British Shorthair",
    origin: "Royaume-Uni",
    temperament: ["calme", "affectueux", "indépendant"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: [
        "Pelage très dense type “peluche”",
        "Mue saisonnière marquée",
      ],
    },
    care: {
      grooming: [
        "Brossage 1–2×/semaine (plus en mue)",
        "Brosse douce + gant pour enlever le sous-poil",
      ],
      habits: [
        "Aime les routines, jeux courts mais réguliers",
        "Supporte bien la vie en appartement",
      ],
      watchouts: [
        "Tendance au surpoids : surveiller la ration",
        "Peut bouder l’activité : stimuler par le jeu",
      ],
    },
    health: {
      common: ["Obésité", "Maladie parodontale"],
      specific: ["Cardiomyopathie hypertrophique (HCM)"],
      prevention: [
        "Pesée mensuelle",
        "Jeu quotidien 10–15 min",
        "Contrôles réguliers (cœur)",
      ],
      vetWhen: [
        "Prise de poids rapide",
        "Intolérance à l’effort",
        "Toux/respiration bruyante",
      ],
    },
    diet: {
      recommended: [
        "Formules “stérilisé”/contrôle du poids si nécessaire",
        "Pâtée pour l’hydratation",
      ],
      avoid: ["Friandises en excès", "Libre-service illimité"],
      notes: [
        "Privilégier la satiété : fibres + protéines",
        "Gamelles anti-glouton si besoin",
      ],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/w6kxsafpnchycxa6nz08m",
  },
  {
    id: "siamese",
    name: "Siamois",
    origin: "Thaïlande",
    temperament: ["bavard", "actif", "très attaché"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Pelage fin", "Peu de sous-poil"],
    },
    care: {
      grooming: [
        "Brossage léger 1×/semaine",
        "Nettoyage des yeux si larmoiement",
      ],
      habits: [
        "Demande beaucoup d’interaction",
        "Apprend vite : clicker, tricks",
      ],
      watchouts: [
        "Anxiété de séparation possible",
        "Besoin de stimulation mentale",
      ],
    },
    health: {
      common: ["Problèmes dentaires"],
      specific: [
        "Affections respiratoires (sensibilité)",
        "Strabisme (selon lignées)",
      ],
      prevention: [
        "Hygiène dentaire",
        "Environnement peu poussiéreux",
        "Jeux interactifs",
      ],
      vetWhen: [
        "Éternuements persistants",
        "Bave/gingivite",
        "Changement de comportement brutal",
      ],
    },
    diet: {
      recommended: [
        "Protéines élevées (chat actif)",
        "Répartir en 2–3 repas",
      ],
      avoid: ["Sous-alimentation (perte de poids)"],
      notes: ["Surveiller la silhouette : chat naturellement élancé"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ws0ydy8nj68q7pkk6l2gf",
  },
  {
    id: "bengal",
    name: "Bengal",
    origin: "États-Unis",
    temperament: ["énergique", "curieux", "athlétique"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: [
        "Robe tachetée/rosettes",
        "Pelage souvent satiné",
      ],
    },
    care: {
      grooming: ["Brossage 1×/semaine", "Coupe des griffes régulière"],
      habits: [
        "Besoin de grimper : arbres à chat hauts",
        "Aime l’eau chez certains individus",
      ],
      watchouts: [
        "Peut s’ennuyer vite : enrichissement indispensable",
        "Attention aux fuites si curieux (sécuriser fenêtres/balcon)",
      ],
    },
    health: {
      common: ["Troubles digestifs si alimentation inadaptée"],
      specific: [
        "Sensibilité intestinale (variable)",
        "Problèmes dentaires",
      ],
      prevention: [
        "Transition alimentaire progressive",
        "Jeu quotidien + parcours",
        "Suivi du transit (selles)",
      ],
      vetWhen: [
        "Diarrhée/vomissements répétés",
        "Perte d’énergie",
        "Refus de s’alimenter",
      ],
    },
    diet: {
      recommended: [
        "Protéines animales de qualité",
        "Fractionner les repas",
        "Hydratation (pâtée)",
      ],
      avoid: ["Excès de céréales", "Gâteries très sucrées"],
      notes: ["Observer le transit : ajuster fibres/qualité"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/p7z20p7rm4vwrne9ry79p",
  },
  {
    id: "persian",
    name: "Persan",
    origin: "Iran",
    temperament: ["calme", "doux", "réservé"],
    coat: {
      length: "long",
      shedding: "élevé",
      notes: ["Poil très abondant", "Nécessite entretien quotidien"],
    },
    care: {
      grooming: [
        "Brossage quotidien impératif",
        "Nettoyage des yeux (canaux lacrymaux)",
      ],
      habits: ["Peu actif, aime le confort", "Miaulements discrets"],
      watchouts: ["Nœuds fréquents si négligé", "Problèmes oculaires"],
    },
    health: {
      common: ["Problèmes rénaux (PKD)", "Problèmes respiratoires"],
      specific: ["Yeux larmoyants", "Sensibilité à la chaleur"],
      prevention: ["Brossage régulier", "Nettoyage des yeux"],
      vetWhen: ["Difficultés respiratoires", "Perte de poids"],
    },
    diet: {
      recommended: ["Alimentation facile à saisir (face plate)", "Riche en oméga-3"],
      avoid: ["Aliments trop durs", "Excès de friandises"],
      notes: ["Surveiller la prise de boisson"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/9x517o954pf5zxl2hbveg",
  },
  {
    id: "ragdoll",
    name: "Ragdoll",
    origin: "États-Unis",
    temperament: ["détendu", "affectueux", "docile"],
    coat: {
      length: "mi-long",
      shedding: "modéré",
      notes: ["Texture soyeuse", "Peu de sous-poil"],
    },
    care: {
      grooming: ["Brossage 2×/semaine", "Coupe des griffes"],
      habits: ["Suit son propriétaire", "Se relâche complètement quand porté"],
      watchouts: ["Peu méfiant (garder en intérieur)", "Tendance à l'embonpoint"],
    },
    health: {
      common: ["Calculs urinaires", "Gingivite"],
      specific: ["HCM (cœur)", "PKD (reins)"],
      prevention: ["Hydratation (pâtée)", "Contrôle annuel"],
      vetWhen: ["Difficulté à uriner", "Léthargie"],
    },
    diet: {
      recommended: ["Équilibrée et rationnée", "Humide favorisée"],
      avoid: ["Nourriture à volonté"],
      notes: ["Gros gabarit, croissance lente"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/35pewrd3gapfnsx8y14mu",
  },
  {
    id: "sphynx",
    name: "Sphynx",
    origin: "Canada",
    temperament: ["affectueux", "pot de colle", "énergique"],
    coat: {
      length: "sans poils",
      shedding: "faible",
      notes: ["Duvet très fin possible", "Produit du sébum"],
    },
    care: {
      grooming: ["Bain ou gant de toilette régulier", "Nettoyage des oreilles"],
      habits: ["Recherche la chaleur", "Très joueur"],
      watchouts: ["Coups de soleil", "Froid"],
    },
    health: {
      common: ["Problèmes de peau", "Problèmes digestifs"],
      specific: ["CMH (cœur)", "Sensibilité cutanée"],
      prevention: ["Protection solaire", "Pull en hiver"],
      vetWhen: ["Rougeurs cutanées", "Fatigue cardiaque"],
    },
    diet: {
      recommended: ["Riche en calories (métabolisme élevé)", "Protéines de qualité"],
      avoid: ["Aliments bas de gamme"],
      notes: ["Appétit souvent vorace"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/k1l09itpvaqp2wzgi90gi",
  },
  {
    id: "abyssinian",
    name: "Abyssin",
    origin: "Éthiopie / Égypte",
    temperament: ["vif", "intelligent", "joueur"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Ticking (poil agouti)", "Texture élastique"],
    },
    care: {
      grooming: ["Brossage 1×/semaine", "Jeu quotidien intense"],
      habits: ["Grimpe partout", "Curieux de tout"],
      watchouts: ["Besoin d'espace", "N'aime pas la solitude"],
    },
    health: {
      common: ["Gingivite", "Amyloïdose"],
      specific: ["Déficit en pyruvate kinase", "Luxation rotule"],
      prevention: ["Soins dentaires", "Tests génétiques"],
      vetWhen: ["Boiterie", "Mauvaise haleine"],
    },
    diet: {
      recommended: ["Protéines pour la masse musculaire", "Équilibrée"],
      avoid: ["Excès de glucides"],
      notes: ["Chat très actif, besoins énergétiques"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/eecgweoqpr4nc9m6v8ed5",
  },
  {
    id: "sacred-birman",
    name: "Sacré de Birmanie",
    origin: "France",
    temperament: ["doux", "équilibré", "sociable"],
    coat: {
      length: "mi-long",
      shedding: "modéré",
      notes: ["Poil soyeux", "Gants blancs aux pattes"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Peu de nœuds"],
      habits: ["Aime suivre son maître", "Voix douce"],
      watchouts: ["N'aime pas être seul trop longtemps"],
    },
    health: {
      common: ["Problèmes digestifs (boules de poils)"],
      specific: ["Sensibilité rénale (parfois)"],
      prevention: ["Brossage régulier", "Pâte au malt"],
      vetWhen: ["Vomissements fréquents"],
    },
    diet: {
      recommended: ["Mixte (croquettes + pâtée)", "Fibres"],
      avoid: ["Changements brutaux"],
      notes: ["Gourmand mais régulé"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/1oq7b9aa27u7lioat2sat",
  },
  {
    id: "oriental",
    name: "Oriental Shorthair",
    origin: "Thaïlande / USA",
    temperament: ["bavard", "possessif", "dynamique"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Très fin", "Couleurs variées"],
    },
    care: {
      grooming: ["Gant de massage", "Nettoyage oreilles"],
      habits: ["Pot de colle", "Miaule beaucoup"],
      watchouts: ["Supporte mal la solitude"],
    },
    health: {
      common: ["Amyloïdose", "Atrophie rétinienne"],
      specific: ["Syndrome vestibulaire"],
      prevention: ["Check-up annuel", "Jeux d'intelligence"],
      vetWhen: ["Perte d'équilibre", "Troubles visuels"],
    },
    diet: {
      recommended: ["Riche et digestible", "Plusieurs petits repas"],
      avoid: ["Monotonie (aime varier)"],
      notes: ["Métabolisme rapide"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/tdr48u430s3ai1y6kgat0",
  },
  {
    id: "devon-rex",
    name: "Devon Rex",
    origin: "Royaume-Uni",
    temperament: ["espiègle", "affectueux", "clown"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Ondulé/frisé", "Moustaches cassantes"],
    },
    care: {
      grooming: ["Pas de brosse (gant doux)", "Nettoyage oreilles (cérumen)"],
      habits: ["Perché sur les épaules", "Chaleur humaine"],
      watchouts: ["Sensible au froid"],
    },
    health: {
      common: ["Luxation rotule", "Problèmes de peau"],
      specific: ["Myopathie"],
      prevention: ["Nettoyage régulier", "Pull en hiver"],
      vetWhen: ["Faiblesse musculaire", "Grattage excessif"],
    },
    diet: {
      recommended: ["Énergétique", "Bien hydratée"],
      avoid: ["Excès (gourmand)"],
      notes: ["A tendance à quémander"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/8snglh2i3vp8v1yypdw7l",
  },
  {
    id: "norwegian",
    name: "Norvégien",
    origin: "Norvège",
    temperament: ["rustique", "calme", "autonome"],
    coat: {
      length: "long",
      shedding: "élevé",
      notes: ["Double pelage imperméable", "Mue impressionnante"],
    },
    care: {
      grooming: ["Brossage régulier", "Renforcé au printemps"],
      habits: ["Grimpe très haut", "Aime l'extérieur (sécurisé)"],
      watchouts: ["Boules de poils"],
    },
    health: {
      common: ["Dysplasie hanche", "GSD IV (génétique)"],
      specific: ["Cardiomyopathie"],
      prevention: ["Tests ADN élevage", "Échographie"],
      vetWhen: ["Difficulté à sauter", "Essoufflement"],
    },
    diet: {
      recommended: ["Riche en protéines", "Fibres (boules poils)"],
      avoid: ["Surpoids (articulations)"],
      notes: ["Chat robuste, gros mangeur"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/685v5en2mxafx9eom10at",
  },
  {
    id: "russian-blue",
    name: "Bleu Russe",
    origin: "Russie",
    temperament: ["réservé", "doux", "fidèle"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Double épaisseur", "Reflets argentés"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Facile d'entretien"],
      habits: ["Aime le calme", "Routine importante"],
      watchouts: ["Stress si changement brutal"],
    },
    health: {
      common: ["Obésité", "Calculs urinaires"],
      specific: ["Peu de maladies génétiques"],
      prevention: ["Environnement apaisé", "Eau fraîche"],
      vetWhen: ["Troubles urinaires", "Anxiété visible"],
    },
    diet: {
      recommended: ["Light si stérilisé", "Qualité premium"],
      avoid: ["Trop de friandises"],
      notes: ["Appétit souvent grand pour peu d'activité"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/owciofcvjqh9mv4olcpb7",
  },
  {
    id: "siberian",
    name: "Sibérien",
    origin: "Russie",
    temperament: ["intelligent", "puissant", "affectueux"],
    coat: {
      length: "long",
      shedding: "modéré",
      notes: ["Hypoallergénique (souvent)", "Poil hydrofuge"],
    },
    care: {
      grooming: ["Brossage 2×/semaine", "Bain rare"],
      habits: ["Aime l'eau", "Très agile"],
      watchouts: ["Besoin de se dépenser"],
    },
    health: {
      common: ["CMH", "Déficit en PK"],
      specific: ["Calculs"],
      prevention: ["Échographie cœur", "Hydratation"],
      vetWhen: ["Fatigue anormale", "Sang urines"],
    },
    diet: {
      recommended: ["Riche (croissance longue)", "Protéines variées"],
      avoid: ["Carence en taurine"],
      notes: ["Peut manger beaucoup pendant la croissance"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/7ty3p3tlvamfhypu5g3ln",
  },
  {
    id: "chartreux",
    name: "Chartreux",
    origin: "France",
    temperament: ["calme", "observateur", "casanier"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: ["Laineux", "Bleu uniforme"],
    },
    care: {
      grooming: ["Brossage (carde)", "Attention mue"],
      habits: ["Suit sans être envahissant", "Peu bavard"],
      watchouts: ["Prise de poids"],
    },
    health: {
      common: ["Calculs de struvite", "Gingivite"],
      specific: ["Rotules"],
      prevention: ["Alimentation urinary", "Contrôle poids"],
      vetWhen: ["Malpropreté", "Douleur pattes"],
    },
    diet: {
      recommended: ["Contrôle du poids", "Spécial urinary"],
      avoid: ["Excès de magnésium"],
      notes: ["Chat robuste mais gourmand"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/i40xohotb5ndziomh4v2v",
  },
  {
    id: "ragamuffin",
    name: "Ragamuffin",
    origin: "États-Unis",
    temperament: ["doux", "pucelle", "calin"],
    coat: {
      length: "long",
      shedding: "modéré",
      notes: ["Texture lapin", "Ne s'emmêle pas trop"],
    },
    care: {
      grooming: ["Brossage 2×/semaine", "Hygiène dentaire"],
      habits: ["Chat de canapé", "Ok avec enfants"],
      watchouts: ["Obésité"],
    },
    health: {
      common: ["Reins (PKD)", "Cœur (HCM)"],
      specific: ["Parodontite"],
      prevention: ["Brossage dents", "Check-up"],
      vetWhen: ["Mauvaise haleine", "Soif excessive"],
    },
    diet: {
      recommended: ["Rationnée", "Faible en gras"],
      avoid: ["Restes de table"],
      notes: ["Tendance à engraisser facilement"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/x1k2l4cwcac008ptl21qf",
  },
  {
    id: "exotic-shorthair",
    name: "Exotic Shorthair",
    origin: "États-Unis",
    temperament: ["paisible", "affectueux", "joueur"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: ["Dense et pelucheux", "Entretien plus simple que Persan"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Nettoyage yeux"],
      habits: ["Siestes", "Moments de folie"],
      watchouts: ["Canaux lacrymaux"],
    },
    health: {
      common: ["PKD", "Respiration (brachycéphale)"],
      specific: ["Yeux"],
      prevention: ["Nettoyage yeux quotidien", "Pas de chaleur excessive"],
      vetWhen: ["Ronflements forts", "Écoulements yeux"],
    },
    diet: {
      recommended: ["Croquettes forme adaptée", "Humide"],
      avoid: ["Trop calorique"],
      notes: ["Mange parfois salement (face plate)"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/j0fmvbmmas246pqu9l6h8",
  },
  {
    id: "burmese",
    name: "Burmese",
    origin: "Thaïlande",
    temperament: ["extraverti", "charismatique", "tenace"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Satiné", "Couleur zibeline freq."],
    },
    care: {
      grooming: ["Peau de chamois", "Main"],
      habits: ["Explore tout", "Dort avec humains"],
      watchouts: ["Ne supporte pas la solitude"],
    },
    health: {
      common: ["Diabète", "Hypokaliémie"],
      specific: ["Syndrome douleur orofaciale"],
      prevention: ["Surveillance glycémie (âgé)", "Suppléments si besoin"],
      vetWhen: ["Soif intense", "Léchage excessif"],
    },
    diet: {
      recommended: ["Protéines haute qualité", "Peu de glucides"],
      avoid: ["Sucres cachés"],
      notes: ["Musculaire et lourd pour sa taille"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/m0q117vej20nq83592gsw",
  },
  {
    id: "tonkinese",
    name: "Tonkinois",
    origin: "Canada / USA",
    temperament: ["social", "intelligent", "actif"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Vison (mink)", "Doux"],
    },
    care: {
      grooming: ["Brossage simple", "Jeu"],
      habits: ["Rapporteur d'objets", "Aime les épaules"],
      watchouts: ["Besoin d'attention"],
    },
    health: {
      common: ["Gingivite", "Infections respiratoires"],
      specific: ["Sensibilité anesthésie (parfois)"],
      prevention: ["Vaccins à jour", "Hygiène buccale"],
      vetWhen: ["Toux", "Dents rouges"],
    },
    diet: {
      recommended: ["Équilibrée activité normale", "Variée"],
      avoid: ["Ennui alimentaire"],
      notes: ["Compromis entre Siamois et Burmese"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/kcsiimvr0hlbce0fquwxa",
  },
  {
    id: "scottish-fold",
    name: "Scottish Fold",
    origin: "Écosse",
    temperament: ["doux", "adaptable", "sociable"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: ["Pelage dense", "Oreilles pliées caractéristiques"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Nettoyage des oreilles délicat"],
      habits: ["Position assise inhabituelle", "Joueur modéré"],
      watchouts: ["Problèmes articulaires", "Surveiller les oreilles"],
    },
    health: {
      common: ["Ostéochondrodysplasie", "Arthrite précoce"],
      specific: ["Problèmes articulaires génétiques", "Infections auriculaires"],
      prevention: [
        "Sélection éleveur responsable",
        "Suppléments articulaires",
        "Éviter le surpoids",
      ],
      vetWhen: [
        "Raideur des pattes",
        "Boiterie",
        "Réticence à sauter",
        "Queue épaisse/rigide",
      ],
    },
    diet: {
      recommended: [
        "Alimentation équilibrée",
        "Suppléments pour articulations",
        "Oméga-3",
      ],
      avoid: ["Surpoids (stress articulaire)"],
      notes: ["Contrôler le poids régulièrement"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/xq00ouigds409z6hs6yay",
  },
  {
    id: "somali",
    name: "Somali",
    origin: "États-Unis / Somalie",
    temperament: ["actif", "joueur", "curieux"],
    coat: {
      length: "mi-long",
      shedding: "modéré",
      notes: ["Poil ticking comme Abyssin", "Queue en panache", "Collerette au cou"],
    },
    care: {
      grooming: ["Brossage 2×/semaine", "Peigne pour la queue"],
      habits: ["Très actif", "Aime l'eau", "Explorateur"],
      watchouts: ["Besoin d'espace", "Stimulation mentale"],
    },
    health: {
      common: ["Gingivite", "Amyloïdose rénale"],
      specific: ["Déficit en pyruvate kinase", "Atrophie rétinienne"],
      prevention: ["Hygiène dentaire", "Tests génétiques", "Contrôles réguliers"],
      vetWhen: ["Fatigue anormale", "Problèmes urinaires", "Perte de vision"],
    },
    diet: {
      recommended: ["Riche en protéines", "Taurine", "Plusieurs petits repas"],
      avoid: ["Aliments de basse qualité"],
      notes: ["Chat très actif, besoins énergétiques élevés"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/17e8grmx7k7ifjyd2jg9x",
  },
  {
    id: "turkish-angora",
    name: "Angora Turc",
    origin: "Turquie",
    temperament: ["élégant", "vif", "affectueux"],
    coat: {
      length: "mi-long",
      shedding: "modéré",
      notes: ["Soyeux et fin", "Pas de sous-poil", "Queue en plume"],
    },
    care: {
      grooming: ["Brossage 2×/semaine", "Plus facile que Persan"],
      habits: ["Grimpe haut", "Intelligent", "Aime nager"],
      watchouts: ["Hyperactivité", "Besoin de stimulation"],
    },
    health: {
      common: ["Cardiomyopathie hypertrophique", "Surdité (blancs aux yeux bleus)"],
      specific: ["Ataxie (selon lignées)"],
      prevention: ["Tests auditifs pour chats blancs", "Échographie cardiaque"],
      vetWhen: ["Perte d'équilibre", "Essoufflement", "Léthargie"],
    },
    diet: {
      recommended: ["Protéines de qualité", "Équilibrée", "Hydratation"],
      avoid: ["Sous-alimentation (chat actif)"],
      notes: ["Chat élancé et athlétique"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/qoxud8bnd94mxbmpaguh9",
  },
  {
    id: "american-shorthair",
    name: "American Shorthair",
    origin: "États-Unis",
    temperament: ["équilibré", "chasseur", "sociable"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: ["Dense et épais", "Résistant aux intempéries"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Plus fréquent en mue"],
      habits: ["Instinct de chasse développé", "Indépendant mais affectueux"],
      watchouts: ["Tendance au surpoids", "Besoin d'exercice"],
    },
    health: {
      common: ["Obésité", "Cardiomyopathie hypertrophique"],
      specific: ["Dysplasie de la hanche (rare)"],
      prevention: ["Activité quotidienne", "Contrôle du poids", "Check-up annuel"],
      vetWhen: ["Prise de poids rapide", "Essoufflement", "Boiterie"],
    },
    diet: {
      recommended: ["Contrôle calorique", "Protéines de qualité", "Rations mesurées"],
      avoid: ["Libre-service", "Friandises excessives"],
      notes: ["Race robuste mais gourmande"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/xmcusvpq0f8wjmdtd3iyi",
  },
  {
    id: "cornish-rex",
    name: "Cornish Rex",
    origin: "Royaume-Uni (Cornouailles)",
    temperament: ["énergique", "acrobatique", "affectueux"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Ondulé/frisé", "Très doux", "Pas de poils de garde"],
    },
    care: {
      grooming: ["Nettoyage à la peau de chamois", "Pas de brossage"],
      habits: ["Sauts impressionnants", "Aime la chaleur", "Pot de colle"],
      watchouts: ["Sensible au froid", "Coups de soleil possibles"],
    },
    health: {
      common: ["Luxation rotule", "Cardiomyopathie"],
      specific: ["Calvitie congénitale", "Hypotrichose"],
      prevention: ["Protection contre le froid", "Écran solaire si nécessaire"],
      vetWhen: ["Boiterie", "Problèmes respiratoires", "Lésions cutanées"],
    },
    diet: {
      recommended: ["Riche en calories (métabolisme rapide)", "Protéines élevées"],
      avoid: ["Restriction calorique"],
      notes: ["Mange beaucoup pour maintenir température corporelle"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/lja5n5ozl69aiu8o8owe1",
  },
  {
    id: "manx",
    name: "Manx",
    origin: "Île de Man",
    temperament: ["chasseur", "loyal", "intelligent"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: ["Double pelage épais", "Sans queue ou courte queue"],
    },
    care: {
      grooming: ["Brossage régulier", "Attention à la zone caudale"],
      habits: ["Aime rapporter", "Bond comme un lapin", "Excellent chasseur"],
      watchouts: ["Problèmes de colonne vertébrale", "Constipation possible"],
    },
    health: {
      common: ["Syndrome de Manx", "Problèmes intestinaux"],
      specific: [
        "Spina bifida",
        "Mégacôlon",
        "Incontinence (selon gravité)",
      ],
      prevention: [
        "Sélection éleveur responsable",
        "Alimentation riche en fibres",
        "Suivi vétérinaire",
      ],
      vetWhen: [
        "Constipation sévère",
        "Incontinence",
        "Problèmes de locomotion",
        "Douleur au dos",
      ],
    },
    diet: {
      recommended: ["Fibres pour le transit", "Protéines de qualité", "Hydratation"],
      avoid: ["Aliments constipants"],
      notes: ["Surveillance du transit essentielle"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/i3s9gxx7yq0axccowswqv",
  },
  {
    id: "balinese",
    name: "Balinais",
    origin: "États-Unis",
    temperament: ["vocal", "gracieux", "affectueux"],
    coat: {
      length: "mi-long",
      shedding: "faible",
      notes: ["Soyeux", "Queue en plume", "Peu de sous-poil"],
    },
    care: {
      grooming: ["Brossage 2×/semaine", "Entretien facile"],
      habits: ["Très bavard", "Actif", "Suit son maître"],
      watchouts: ["Anxiété de séparation", "Besoin d'interaction"],
    },
    health: {
      common: ["Amyloïdose", "Problèmes dentaires"],
      specific: ["Atrophie rétinienne progressive", "Nystagmus"],
      prevention: ["Hygiène dentaire", "Tests oculaires", "Stimulation mentale"],
      vetWhen: ["Problèmes de vision", "Gingivite", "Changement comportement"],
    },
    diet: {
      recommended: ["Protéines élevées", "Plusieurs repas", "Qualité premium"],
      avoid: ["Sous-nutrition"],
      notes: ["Chat élancé et actif"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/oeokaokrjghvaxrq3rgr3",
  },
  {
    id: "ocicat",
    name: "Ocicat",
    origin: "États-Unis",
    temperament: ["sociable", "confiant", "athlétique"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Tacheté comme un ocelot", "Brillant", "Texture satinée"],
    },
    care: {
      grooming: ["Brossage léger hebdomadaire", "Gant de toilettage"],
      habits: ["Très social avec étrangers", "Aime apprendre tricks", "Joueur"],
      watchouts: ["Besoin de compagnie", "S'ennuie facilement"],
    },
    health: {
      common: ["Gingivite", "Cardiomyopathie"],
      specific: ["Amyloïdose rénale", "Atrophie rétinienne"],
      prevention: ["Hygiène dentaire", "Check-up réguliers", "Tests génétiques"],
      vetWhen: ["Problèmes urinaires", "Fatigue cardiaque", "Perte de vision"],
    },
    diet: {
      recommended: ["Riche en protéines", "Équilibrée", "Adaptée activité"],
      avoid: ["Excès de glucides"],
      notes: ["Chat musclé et athlétique"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/vvc8ggasq6r3ujchc91dd",
  },
  {
    id: "korat",
    name: "Korat",
    origin: "Thaïlande",
    temperament: ["loyal", "intelligent", "doux"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Bleu-argent", "Pointe des poils argentée", "Peu de sous-poil"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Facile d'entretien"],
      habits: ["Sensible aux bruits", "Attaché à sa famille", "Calme"],
      watchouts: ["Stress si environnement bruyant", "N'aime pas le changement"],
    },
    health: {
      common: ["Gangliosidose GM1/GM2", "Problèmes respiratoires"],
      specific: ["Maladies génétiques (tests disponibles)"],
      prevention: [
        "Tests ADN (éleveurs)",
        "Environnement calme",
        "Vaccinations à jour",
      ],
      vetWhen: ["Problèmes neurologiques", "Difficultés respiratoires"],
    },
    diet: {
      recommended: ["Équilibrée", "Protéines de qualité", "Contrôle portions"],
      avoid: ["Suralimentation"],
      notes: ["Race rare, précieuse"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/jbc02vkt1yhl2zoqer49i",
  },
  {
    id: "turkish-van",
    name: "Van Turc",
    origin: "Turquie",
    temperament: ["nageur", "énergique", "indépendant"],
    coat: {
      length: "mi-long",
      shedding: "modéré",
      notes: [
        "Semi-long et soyeux",
        "Résistant à l'eau",
        "Patron coloré unique (tête/queue)",
      ],
    },
    care: {
      grooming: ["Brossage 2×/semaine", "Aime les bains"],
      habits: ["Adore l'eau", "Très actif", "Grimpe partout"],
      watchouts: ["Besoin d'espace", "Peut être territorial"],
    },
    health: {
      common: ["Cardiomyopathie hypertrophique"],
      specific: ["Surdité (chats blancs)"],
      prevention: ["Tests auditifs", "Échographie cardiaque", "Activité régulière"],
      vetWhen: ["Essoufflement", "Léthargie", "Perte d'équilibre"],
    },
    diet: {
      recommended: ["Protéines élevées", "Oméga-3 pour le pelage", "Hydratation"],
      avoid: ["Restriction calorique (chat actif)"],
      notes: ["Grand chat athlétique"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/5dzxtwevmoulbfhehze92",
  },
  {
    id: "himalayan",
    name: "Himalayen",
    origin: "États-Unis / Royaume-Uni",
    temperament: ["calme", "doux", "affectueux"],
    coat: {
      length: "long",
      shedding: "élevé",
      notes: [
        "Poil persan avec patron colorpoint siamois",
        "Très dense",
        "Nécessite entretien quotidien",
      ],
    },
    care: {
      grooming: [
        "Brossage quotidien obligatoire",
        "Nettoyage yeux/visage",
        "Toilettage pro recommandé",
      ],
      habits: ["Très calme", "Aime le confort", "Peu actif"],
      watchouts: ["Nœuds fréquents", "Problèmes respiratoires (face plate)"],
    },
    health: {
      common: [
        "PKD (maladie rénale polykystique)",
        "Problèmes respiratoires",
        "Problèmes oculaires",
      ],
      specific: ["Séborrhée", "Dermatite"],
      prevention: [
        "Tests ADN pour PKD",
        "Brossage quotidien",
        "Nettoyage facial",
        "Éviter chaleur excessive",
      ],
      vetWhen: [
        "Difficultés respiratoires",
        "Écoulements yeux",
        "Problèmes rénaux",
      ],
    },
    diet: {
      recommended: [
        "Croquettes adaptées face plate",
        "Riche en oméga-3",
        "Soutien rénal",
      ],
      avoid: ["Aliments durs", "Excès de phosphore"],
      notes: ["Surveiller la fonction rénale régulièrement"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/8ak1b81w7anmjtlmsv78v",
  },
  {
    id: "egyptian-mau",
    name: "Mau Égyptien",
    origin: "Égypte",
    temperament: ["rapide", "loyal", "sensible"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: [
        "Taches naturelles (non créées)",
        "Brillant",
        "Seule race tachetée naturellement",
      ],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Facile d'entretien"],
      habits: [
        "Chat le plus rapide (50 km/h)",
        "Voix musicale",
        "Aime la chaleur",
      ],
      watchouts: ["Timide avec étrangers", "Besoin de se dépenser"],
    },
    health: {
      common: ["Sensibilité température", "Allergies cutanées"],
      specific: ["Leucodystrophie", "Cardiomyopathie"],
      prevention: [
        "Maintenir au chaud",
        "Tests génétiques",
        "Échographie cardiaque",
      ],
      vetWhen: ["Problèmes cutanés", "Essoufflement", "Troubles neurologiques"],
    },
    diet: {
      recommended: ["Protéines élevées", "Équilibrée", "Plusieurs petits repas"],
      avoid: ["Allergènes courants"],
      notes: ["Race athlétique et musclée"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/mpotqplduy2r1w7fvjs8i",
  },
  {
    id: "savannah",
    name: "Savannah",
    origin: "États-Unis",
    temperament: ["aventurier", "loyal", "énergique"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Tacheté comme serval", "Texture variable", "Grandes oreilles"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Coupe des griffes régulière"],
      habits: [
        "Saute très haut",
        "Aime l'eau",
        "Peut être promené en laisse",
        "Très actif",
      ],
      watchouts: [
        "Besoin d'espace important",
        "Législation stricte (hybride)",
        "Ne convient pas à tous",
      ],
    },
    health: {
      common: ["Cardiomyopathie hypertrophique", "Atrophie rétinienne"],
      specific: ["Problèmes de foie (selon génération)"],
      prevention: [
        "Tests génétiques",
        "Vétérinaire spécialisé hybrides",
        "Vaccinations adaptées",
      ],
      vetWhen: ["Fatigue anormale", "Problèmes digestifs", "Perte d'appétit"],
    },
    diet: {
      recommended: [
        "Riche en protéines animales",
        "Régime proche du carnivore strict",
        "Taurine",
      ],
      avoid: ["Céréales en excès", "Aliments transformés"],
      notes: ["Grand chat, besoins nutritionnels spécifiques"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/d09blop80gudztvlx1a8n",
  },
  {
    id: "laperm",
    name: "LaPerm",
    origin: "États-Unis",
    temperament: ["affectueux", "curieux", "actif"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Bouclé ou ondulé", "Hypoallergénique (souvent)", "Texture unique"],
    },
    care: {
      grooming: [
        "Brossage délicat hebdomadaire",
        "Éviter le sur-brossage",
        "Peut perdre/regagner poil",
      ],
      habits: ["Tactile", "Suit partout", "Aime être tenu"],
      watchouts: ["Besoin d'attention", "Peut être vocal"],
    },
    health: {
      common: ["Peu de problèmes génétiques"],
      specific: ["Race généralement saine"],
      prevention: ["Check-up annuels", "Hygiène de base"],
      vetWhen: ["Changement d'appétit", "Léthargie", "Problèmes cutanés"],
    },
    diet: {
      recommended: ["Équilibrée", "Protéines de qualité", "Hydratation"],
      avoid: ["Aliments de basse qualité"],
      notes: ["Race robuste avec peu d'exigences spéciales"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/fxla62rbyscjjiql19wn7",
  },
  {
    id: "singapura",
    name: "Singapura",
    origin: "Singapour",
    temperament: ["petit", "vif", "affectueux"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Sepia agouti", "Très fin", "Proche du corps"],
    },
    care: {
      grooming: ["Brossage léger hebdomadaire", "Facile d'entretien"],
      habits: [
        "Plus petit chat domestique",
        "Très actif",
        "Curieux",
        "Aime la chaleur",
      ],
      watchouts: ["Sensible au froid", "Peut être timide"],
    },
    health: {
      common: ["Inertie utérine (femelles)", "Déficit en pyruvate kinase"],
      specific: ["Problèmes de reproduction"],
      prevention: [
        "Maintenir au chaud",
        "Tests génétiques pour éleveurs",
        "Suivi vétérinaire grossesse",
      ],
      vetWhen: ["Difficultés respiratoires", "Anémie", "Fatigue extrême"],
    },
    diet: {
      recommended: [
        "Protéines de qualité",
        "Portions adaptées petite taille",
        "Plusieurs repas",
      ],
      avoid: ["Suralimentation"],
      notes: ["Petit chat mais très actif"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/q3yfcsn2yxi48oeay02z6",
  },
  {
    id: "selkirk-rex",
    name: "Selkirk Rex",
    origin: "États-Unis",
    temperament: ["patient", "tolérant", "affectueux"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: ["Bouclé/ondulé", "Texture mouton", "Moustaches bouclées"],
    },
    care: {
      grooming: ["Brossage délicat 2×/semaine", "Éviter peigne fin", "Bain occasionnel"],
      habits: ["Très câlin", "S'adapte bien", "Bon avec enfants"],
      watchouts: ["Nœuds possibles", "Accumulation sébum"],
    },
    health: {
      common: ["Polykystose rénale (PKD)", "Cardiomyopathie"],
      specific: ["Problèmes cutanés (peau sensible)"],
      prevention: ["Tests génétiques", "Toilettage régulier", "Contrôle cœur/reins"],
      vetWhen: ["Problèmes de peau", "Fatigue inhabituelle", "Problèmes urinaires"],
    },
    diet: {
      recommended: ["Équilibrée", "Oméga-3 pour le pelage", "Protéines de qualité"],
      avoid: ["Aliments allergènes"],
      notes: ["Race généralement robuste"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/2s2rym7dcmkkybf1bal93",
  },
  {
    id: "pixiebob",
    name: "Pixiebob",
    origin: "États-Unis",
    temperament: ["chien-like", "fidèle", "calme"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: ["Tacheté/spotted", "Aspect sauvage", "Queue courte naturelle"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Coupe des griffes"],
      habits: ["Apprend tricks", "Aime l'eau", "Vocal avec sons bizarres"],
      watchouts: ["Besoin d'interaction", "Polydactylie acceptée (7 doigts)"],
    },
    health: {
      common: ["Cryptorchidie", "Dystocie (femelles)"],
      specific: ["Cardiomyopathie hypertrophique"],
      prevention: ["Check-up réguliers", "Tests cardiaques", "Suivi reproduction"],
      vetWhen: ["Problèmes cardiaques", "Difficultés reproduction"],
    },
    diet: {
      recommended: ["Riche en protéines", "Équilibrée", "Portions généreuses (grand gabarit)"],
      avoid: ["Sous-nutrition"],
      notes: ["Chat musclé et puissant"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/kdki9e9yiejhygjz2rsrf",
  },
  {
    id: "bombay",
    name: "Bombay",
    origin: "États-Unis",
    temperament: ["pot de colle", "joueur", "sociable"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Noir de jais", "Brillant comme cuir verni", "Yeux cuivre/or"],
    },
    care: {
      grooming: ["Peau de chamois pour briller", "Brossage léger"],
      habits: ["Suit partout", "Aime être centre d'attention", "Ronronne fort"],
      watchouts: ["N'aime pas solitude", "Peut prendre froid"],
    },
    health: {
      common: ["Cardiomyopathie hypertrophique", "Gingivite"],
      specific: ["Problèmes respiratoires (face ronde)", "Larmoiement excessif"],
      prevention: ["Hygiène dentaire", "Nettoyage yeux", "Check-up cardiaques"],
      vetWhen: ["Essoufflement", "Écoulements oculaires", "Mauvaise haleine"],
    },
    diet: {
      recommended: ["Protéines de qualité", "Contrôle portions", "Mixte"],
      avoid: ["Surpoids (tendance gourmande)"],
      notes: ["Musclé mais compact"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/1rbm8ihixgks03juwni5m",
  },
  {
    id: "havana-brown",
    name: "Havana Brown",
    origin: "Royaume-Uni",
    temperament: ["affectueux", "curieux", "intelligent"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Chocolat/acajou", "Brillant", "Moustaches brunes"],
    },
    care: {
      grooming: ["Brossage léger", "Facile d'entretien"],
      habits: ["Utilise ses pattes pour toucher", "Très interactif", "Voix douce"],
      watchouts: ["Race rare", "Besoin de compagnie"],
    },
    health: {
      common: ["Infections respiratoires", "Problèmes dentaires"],
      specific: ["Cardiomyopathie"],
      prevention: ["Vaccins à jour", "Soins dentaires", "Environnement sain"],
      vetWhen: ["Symptômes respiratoires", "Gingivite", "Léthargie"],
    },
    diet: {
      recommended: ["Protéines élevées", "Équilibrée", "Qualité premium"],
      avoid: ["Aliments bas de gamme"],
      notes: ["Chat élancé et musclé"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/pxwmjcxizm51pcspzrobh",
  },
  {
    id: "cymric",
    name: "Cymric",
    origin: "Canada",
    temperament: ["joueur", "intelligent", "chasseur"],
    coat: {
      length: "mi-long",
      shedding: "modéré",
      notes: ["Manx à poil long", "Double pelage épais", "Sans queue"],
    },
    care: {
      grooming: ["Brossage 2-3×/semaine", "Attention zone caudale"],
      habits: ["Saute haut", "Bond de lapin", "Aime rapporter"],
      watchouts: ["Problèmes spinaux", "Surveillance transit"],
    },
    health: {
      common: ["Syndrome de Manx", "Spina bifida", "Mégacôlon"],
      specific: ["Problèmes intestinaux/urinaires"],
      prevention: ["Fibres alimentaires", "Suivi vétérinaire régulier", "Sélection éleveur"],
      vetWhen: ["Constipation sévère", "Incontinence", "Douleurs dos"],
    },
    diet: {
      recommended: ["Fibres pour transit", "Protéines", "Hydratation élevée"],
      avoid: ["Aliments constipants"],
      notes: ["Transit à surveiller de près"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/4tlhp2069wiuco33bn1eo",
  },
  {
    id: "american-curl",
    name: "American Curl",
    origin: "États-Unis",
    temperament: ["affectueux", "adaptable", "joueur"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Oreilles recourbées vers l'arrière", "Soyeux", "Peu de sous-poil"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "JAMAIS plier les oreilles", "Nettoyage oreilles doux"],
      habits: ["Chaton éternel", "Curieux", "S'entend avec tous"],
      watchouts: ["Cartilage des oreilles fragile", "Manipuler avec soin"],
    },
    health: {
      common: ["Infections auriculaires (rare)"],
      specific: ["Race généralement saine"],
      prevention: ["Nettoyage oreilles délicat", "Check-up annuels"],
      vetWhen: ["Rougeur/douleur oreilles", "Problèmes d'équilibre"],
    },
    diet: {
      recommended: ["Équilibrée", "Protéines de qualité", "Adaptée activité"],
      avoid: ["Suralimentation"],
      notes: ["Chat de taille moyenne, actif"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/v68me0v6vts7936863ti9",
  },
  {
    id: "japanese-bobtail",
    name: "Japanese Bobtail",
    origin: "Japon",
    temperament: ["actif", "vocal", "social"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Queue en pompon (bobtail)", "Peu de sous-poil", "Souvent bicolore"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Facile d'entretien"],
      habits: ["Aime porter objets", "Voix mélodieuse", "Adore l'eau"],
      watchouts: ["Très bavard", "Besoin de stimulation"],
    },
    health: {
      common: ["Peu de problèmes génétiques"],
      specific: ["Race ancienne et robuste"],
      prevention: ["Soins de base", "Activité régulière"],
      vetWhen: ["Changement comportement", "Perte appétit"],
    },
    diet: {
      recommended: ["Protéines élevées", "Équilibrée", "Plusieurs repas"],
      avoid: ["Monotonie alimentaire"],
      notes: ["Chat élancé et musclé"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/u1a1qxu49hraayjl66akn",
  },
  {
    id: "chausie",
    name: "Chausie",
    origin: "États-Unis",
    temperament: ["énergique", "athlétique", "intelligent"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Aspect sauvage (jungle cat)", "Ticking possible", "Grandes oreilles"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Coupe griffes"],
      habits: ["Saute très haut (2m+)", "Besoin d'espace", "Aime grimper"],
      watchouts: ["Hybride (F1-F4)", "Législation variable", "Très actif"],
    },
    health: {
      common: ["Sensibilité digestive", "Déficit en enzyme (céréales)"],
      specific: ["Intestin court (type carnivore strict)"],
      prevention: ["Alimentation carnée pure", "Éviter céréales", "Activité intense"],
      vetWhen: ["Vomissements", "Diarrhée", "Perte de poids"],
    },
    diet: {
      recommended: ["100% protéines animales", "Sans céréales", "BARF possible"],
      avoid: ["Céréales", "Légumineuses", "Végétaux en excès"],
      notes: ["Besoins nutritionnels proches chat sauvage"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/f2530gbxaqj6iqlonk2ou",
  },
  {
    id: "munchkin",
    name: "Munchkin",
    origin: "États-Unis",
    temperament: ["joueur", "confiant", "affectueux"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: ["Pattes courtes (mutation)", "Pelage varié", "Aspect unique"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Varie selon longueur poil"],
      habits: ["Court vite malgré pattes", "Cache des objets", "Debout comme suricate"],
      watchouts: ["Controverse éthique", "Problèmes articulaires possibles"],
    },
    health: {
      common: ["Lordose", "Pectus excavatum"],
      specific: ["Problèmes spinaux", "Arthrite précoce possible"],
      prevention: ["Contrôle poids strict", "Éviter sauts trop hauts", "Suivi orthopédique"],
      vetWhen: ["Douleur au dos", "Difficulté respiration", "Boiterie"],
    },
    diet: {
      recommended: ["Contrôle calorique strict", "Protéines", "Suppléments articulaires"],
      avoid: ["Surpoids (articulations fragiles)"],
      notes: ["Poids optimal crucial pour la santé"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/yhlaf1z3ifak7o60oh929",
  },
  {
    id: "toyger",
    name: "Toyger",
    origin: "États-Unis",
    temperament: ["détendu", "amical", "intelligent"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Rayures comme tigre miniature", "Brillant", "Marquages précis"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Facile entretien"],
      habits: ["Calme mais joueur", "Apprend tours", "Aime promenades"],
      watchouts: ["Race récente", "Prix élevé"],
    },
    health: {
      common: ["Souffle cardiaque", "Cardiomyopathie"],
      specific: ["Race encore en développement"],
      prevention: ["Tests cardiaques", "Sélection éleveur responsable", "Check-up réguliers"],
      vetWhen: ["Essoufflement", "Fatigue", "Léthargie"],
    },
    diet: {
      recommended: ["Protéines de qualité", "Équilibrée", "Contrôle portions"],
      avoid: ["Surpoids"],
      notes: ["Chat musclé de taille moyenne"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/gkaht67x60tjwl8z0021r",
  },
  {
    id: "peterbald",
    name: "Peterbald",
    origin: "Russie",
    temperament: ["affectueux", "pacifique", "curieux"],
    coat: {
      length: "sans poils",
      shedding: "faible",
      notes: ["Nu ou duvet léger", "Peau chaude", "Aspect élégant"],
    },
    care: {
      grooming: ["Bain/nettoyage régulier", "Crème hydratante parfois", "Protection solaire"],
      habits: ["Très câlin (cherche chaleur)", "Sociable", "Élégant"],
      watchouts: ["Sensible température", "Coups de soleil", "Peau grasse"],
    },
    health: {
      common: ["Problèmes dentaires", "Sensibilité cutanée"],
      specific: ["Hyperplasie gingivale"],
      prevention: ["Hygiène dentaire stricte", "Soins peau", "Température stable"],
      vetWhen: ["Problèmes cutanés", "Gingivite sévère", "Hypothermie"],
    },
    diet: {
      recommended: ["Riche en calories", "Protéines élevées", "Plusieurs repas"],
      avoid: ["Aliments bas de gamme"],
      notes: ["Métabolisme élevé comme Sphynx"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/h9doouy6w3edxi5snpvkh",
  },
  {
    id: "nebelung",
    name: "Nebelung",
    origin: "États-Unis",
    temperament: ["réservé", "loyal", "doux"],
    coat: {
      length: "mi-long",
      shedding: "modéré",
      notes: ["Bleu-gris argenté", "Soyeux", "Yeux verts"],
    },
    care: {
      grooming: ["Brossage 2×/semaine", "Peu de nœuds"],
      habits: ["Timide avec étrangers", "Très attaché famille", "Routine importante"],
      watchouts: ["Stress si changements", "Période d'adaptation longue"],
    },
    health: {
      common: ["Obésité si sédentaire", "Calculs urinaires"],
      specific: ["Race généralement saine"],
      prevention: ["Environnement calme", "Activité régulière", "Hydratation"],
      vetWhen: ["Problèmes urinaires", "Anxiété excessive", "Perte appétit"],
    },
    diet: {
      recommended: ["Équilibrée", "Contrôle portions", "Pâtée pour hydratation"],
      avoid: ["Suralimentation"],
      notes: ["Similaire au Bleu Russe mais poil long"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/azik5y1ln01wwrv3vurbb",
  },
  {
    id: "york-chocolate",
    name: "York Chocolate",
    origin: "États-Unis",
    temperament: ["affectueux", "énergique", "sociable"],
    coat: {
      length: "mi-long",
      shedding: "modéré",
      notes: ["Chocolat ou lilas", "Soyeux", "Queue touffue"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Entretien facile"],
      habits: ["Aime l'eau", "Chasseur", "Très vocal"],
      watchouts: ["Race rare", "Besoin d'activité"],
    },
    health: {
      common: ["Peu de problèmes génétiques connus"],
      specific: ["Race robuste"],
      prevention: ["Soins standards", "Activité régulière"],
      vetWhen: ["Symptômes inhabituels", "Changement comportement"],
    },
    diet: {
      recommended: ["Protéines de qualité", "Équilibrée", "Adaptée activité"],
      avoid: ["Aliments de basse qualité"],
      notes: ["Chat actif et musclé"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/9hkdnk1nym5iw9gwdum02",
  },
  {
    id: "snowshoe",
    name: "Snowshoe",
    origin: "États-Unis",
    temperament: ["vocal", "social", "affectueux"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Colorpoint avec gants blancs", "Yeux bleus", "Patron unique"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Facile d'entretien"],
      habits: ["Aime l'eau", "Bavard mais moins que Siamois", "Suit partout"],
      watchouts: ["N'aime pas solitude", "Besoin de compagnie"],
    },
    health: {
      common: ["Problèmes dentaires", "Cardiomyopathie"],
      specific: ["Queue tordue (défaut génétique possible)"],
      prevention: ["Hygiène dentaire", "Check-up cardiaques", "Sélection éleveur"],
      vetWhen: ["Gingivite", "Essoufflement", "Léthargie"],
    },
    diet: {
      recommended: ["Protéines élevées", "Équilibrée", "Contrôle portions"],
      avoid: ["Surpoids"],
      notes: ["Chat actif et musclé"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/gch118lqajlcu27fx0dsa",
  },
  {
    id: "lykoi",
    name: "Lykoi",
    origin: "États-Unis",
    temperament: ["affectueux", "joueur", "loyal"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: ["Chat loup-garou", "Pelage clairsemé", "Perd son poil périodiquement"],
    },
    care: {
      grooming: ["Brossage doux", "Nettoyage peau", "Protection solaire"],
      habits: ["Instinct de chasseur fort", "Curieux", "Aime jouer"],
      watchouts: ["Peau sensible", "Sensible au soleil et froid"],
    },
    health: {
      common: ["Problèmes cutanés", "Sensibilité température"],
      specific: ["Mutation naturelle", "Race récente"],
      prevention: ["Protection contre éléments", "Soins de peau réguliers"],
      vetWhen: ["Irritations cutanées", "Hypothermie", "Coups de soleil"],
    },
    diet: {
      recommended: ["Riche en protéines", "Oméga-3 pour la peau", "Équilibrée"],
      avoid: ["Allergènes"],
      notes: ["Métabolisme normal"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/0n0vlfb0m79bt4lave2mp",
  },
  {
    id: "khao-manee",
    name: "Khao Manee",
    origin: "Thaïlande",
    temperament: ["sociable", "intelligent", "actif"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Blanc pur", "Yeux vairons fréquents", "Brillant"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Nettoyage yeux"],
      habits: ["Très vocal", "Curieux", "Aime être au centre attention"],
      watchouts: ["Surdité possible (yeux bleus)", "Protection solaire"],
    },
    health: {
      common: ["Surdité congénitale", "Sensibilité UV"],
      specific: ["Tests auditifs recommandés"],
      prevention: ["Écran solaire", "Tests génétiques", "Protection extérieure"],
      vetWhen: ["Problèmes auditifs", "Lésions cutanées", "Infections oculaires"],
    },
    diet: {
      recommended: ["Protéines de qualité", "Équilibrée", "Taurine"],
      avoid: ["Colorants artificiels"],
      notes: ["Chat de taille moyenne, actif"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/u0dbonnr5z06j6hfiqud8",
  },
  {
    id: "neva-masquerade",
    name: "Neva Masquerade",
    origin: "Russie",
    temperament: ["doux", "loyal", "calme"],
    coat: {
      length: "long",
      shedding: "modéré",
      notes: ["Sibérien colorpoint", "Hypoallergénique", "Masque sur le visage"],
    },
    care: {
      grooming: ["Brossage 2×/semaine", "Plus en mue"],
      habits: ["Affectueux", "Patient avec enfants", "Aime l'eau"],
      watchouts: ["Besoin d'espace", "Actif"],
    },
    health: {
      common: ["Cardiomyopathie hypertrophique", "Polykystose rénale"],
      specific: ["Déficit en pyruvate kinase"],
      prevention: ["Tests génétiques", "Échographie cardiaque", "Hydratation"],
      vetWhen: ["Essoufflement", "Problèmes urinaires", "Fatigue"],
    },
    diet: {
      recommended: ["Protéines élevées", "Oméga-3", "Riche et équilibrée"],
      avoid: ["Sous-alimentation"],
      notes: ["Grand chat, croissance lente"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/7wz57arjgrak39h1ia9wk",
  },
  {
    id: "highlander",
    name: "Highlander",
    origin: "États-Unis",
    temperament: ["joueur", "affectueux", "énergique"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Tacheté/marbré", "Oreilles recourbées", "Queue courte/tordue"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Attention aux oreilles"],
      habits: ["Très actif", "Aime l'eau", "Polydactylie fréquente"],
      watchouts: ["Besoin d'espace", "Très énergique"],
    },
    health: {
      common: ["Cardiomyopathie"],
      specific: ["Race hybride récente"],
      prevention: ["Tests cardiaques", "Activité intense", "Suivi régulier"],
      vetWhen: ["Essoufflement", "Léthargie inhabituelle"],
    },
    diet: {
      recommended: ["Riche en protéines", "Haute énergie", "Plusieurs repas"],
      avoid: ["Céréales en excès"],
      notes: ["Chat très actif, besoins énergétiques élevés"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/2a87n2zi3ig9zx3dl5un2",
  },
  {
    id: "kurilian-bobtail",
    name: "Kurilian Bobtail",
    origin: "Russie / Îles Kouriles",
    temperament: ["chasseur", "loyal", "intelligent"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: ["Queue en pompon naturelle", "Dense", "Imperméable"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Plus en version poil long"],
      habits: ["Excellent pêcheur", "Aime l'eau", "Bond puissant"],
      watchouts: ["Instinct de chasse fort", "Besoin d'activité"],
    },
    health: {
      common: ["Peu de problèmes génétiques"],
      specific: ["Race naturelle robuste"],
      prevention: ["Soins standards", "Activité régulière"],
      vetWhen: ["Changement comportement", "Problèmes digestifs"],
    },
    diet: {
      recommended: ["Riche en protéines", "Poisson inclus", "Équilibrée"],
      avoid: ["Aliments bas de gamme"],
      notes: ["Chat robuste et musclé"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/kek1hyjrdquzfpkg3nqqr",
  },
  {
    id: "dragon-li",
    name: "Dragon Li (Li Hua)",
    origin: "Chine",
    temperament: ["loyal", "intelligent", "indépendant"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Brun doré tabby", "Ticking", "Aspect sauvage"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Facile d'entretien"],
      habits: ["Excellent chasseur", "Fidèle", "Aime explorer"],
      watchouts: ["Besoin d'activité", "Territorial"],
    },
    health: {
      common: ["Peu de problèmes"],
      specific: ["Race naturelle ancienne", "Très robuste"],
      prevention: ["Soins de base", "Vaccinations"],
      vetWhen: ["Symptômes inhabituels"],
    },
    diet: {
      recommended: ["Protéines élevées", "Équilibrée", "Qualité premium"],
      avoid: ["Excès de glucides"],
      notes: ["Chat musclé et actif"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/mtq44pjaufwmsji72wh19",
  },
  {
    id: "california-spangled",
    name: "California Spangled",
    origin: "États-Unis",
    temperament: ["actif", "affectueux", "social"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Tacheté comme léopard", "Brillant", "Marquages précis"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Facile"],
      habits: ["Très actif", "Intelligent", "Curieux"],
      watchouts: ["Race rare", "Prix élevé"],
    },
    health: {
      common: ["Peu de données (race rare)"],
      specific: ["Généralement sain"],
      prevention: ["Soins standards", "Activité régulière"],
      vetWhen: ["Problèmes inhabituels"],
    },
    diet: {
      recommended: ["Protéines de qualité", "Équilibrée", "Adaptée activité"],
      avoid: ["Aliments bas de gamme"],
      notes: ["Chat athlétique"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/b6nxmfsvel8j7nek62lt7",
  },
  {
    id: "american-bobtail",
    name: "American Bobtail",
    origin: "États-Unis",
    temperament: ["adaptable", "intelligent", "affectueux"],
    coat: {
      length: "mi-long",
      shedding: "modéré",
      notes: ["Queue courte naturelle", "Pelage dense", "Aspect sauvage"],
    },
    care: {
      grooming: ["Brossage 2×/semaine", "Attention nœuds"],
      habits: ["Aime les jeux", "S'adapte aux voyages", "Chien-like"],
      watchouts: ["Besoin d'interaction", "Peut être vocal"],
    },
    health: {
      common: ["Dysplasie de la hanche"],
      specific: ["Problèmes spinaux (rares)"],
      prevention: ["Contrôle poids", "Activité modérée", "Sélection éleveur"],
      vetWhen: ["Boiterie", "Douleur au dos", "Difficulté locomotion"],
    },
    diet: {
      recommended: ["Équilibrée", "Protéines de qualité", "Contrôle portions"],
      avoid: ["Surpoids"],
      notes: ["Chat de taille moyenne à grande"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/4kdc48r5yc4z9220nfaec",
  },
  {
    id: "donskoy",
    name: "Donskoy (Don Sphynx)",
    origin: "Russie",
    temperament: ["affectueux", "social", "intelligent"],
    coat: {
      length: "sans poils",
      shedding: "faible",
      notes: ["Nu ou duvet", "Peau plissée", "Chaud au toucher"],
    },
    care: {
      grooming: ["Bain régulier", "Nettoyage peau", "Protection solaire/froid"],
      habits: ["Très câlin", "Cherche la chaleur", "Social avec autres animaux"],
      watchouts: ["Sensible température", "Peau grasse"],
    },
    health: {
      common: ["Problèmes dentaires", "Sensibilité cutanée"],
      specific: ["Hyperplasie gingivale", "Ectodermal dysplasia"],
      prevention: ["Hygiène dentaire stricte", "Soins peau", "Température stable"],
      vetWhen: ["Problèmes cutanés", "Gingivite", "Hypothermie"],
    },
    diet: {
      recommended: ["Riche en calories", "Protéines élevées", "Plusieurs repas"],
      avoid: ["Aliments de basse qualité"],
      notes: ["Métabolisme très élevé"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/lpsuiecdd8aq08njkimc7",
  },
  {
    id: "bambino",
    name: "Bambino",
    origin: "États-Unis",
    temperament: ["joueur", "affectueux", "énergique"],
    coat: {
      length: "sans poils",
      shedding: "faible",
      notes: ["Sphynx + Munchkin", "Nu", "Pattes courtes"],
    },
    care: {
      grooming: ["Bain régulier", "Soins peau", "Protection température"],
      habits: ["Très joueur", "Chaton éternel", "Sociable"],
      watchouts: ["Double sensibilité (peau + pattes)", "Controverse éthique"],
    },
    health: {
      common: ["Lordose", "Pectus excavatum", "Problèmes cutanés"],
      specific: ["Problèmes spinaux", "Arthrite"],
      prevention: [
        "Contrôle poids strict",
        "Soins peau",
        "Température stable",
        "Suivi orthopédique",
      ],
      vetWhen: ["Douleur dos", "Problèmes respiratoires", "Lésions cutanées"],
    },
    diet: {
      recommended: ["Riche en calories", "Protéines", "Suppléments articulaires"],
      avoid: ["Surpoids (critique pour pattes)"],
      notes: ["Métabolisme élevé + articulations fragiles"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/juc6pw0z7ac87sj2zpveo",
  },
  {
    id: "dwelf",
    name: "Dwelf",
    origin: "États-Unis",
    temperament: ["affectueux", "social", "joueur"],
    coat: {
      length: "sans poils",
      shedding: "faible",
      notes: ["Munchkin + Sphynx + American Curl", "Oreilles recourbées", "Pattes courtes"],
    },
    care: {
      grooming: [
        "Bain régulier",
        "Soins peau",
        "Protection oreilles",
        "Protection température",
      ],
      habits: ["Très affectueux", "Demande attention", "Énergique"],
      watchouts: ["Triple sensibilité", "Controverse éthique forte"],
    },
    health: {
      common: [
        "Lordose",
        "Problèmes cutanés",
        "Infections auriculaires",
        "Arthrite",
      ],
      specific: ["Multiples problèmes potentiels"],
      prevention: [
        "Soins intensifs",
        "Vétérinaire spécialisé",
        "Température contrôlée",
        "Poids optimal",
      ],
      vetWhen: ["Tout symptôme inhabituel"],
    },
    diet: {
      recommended: ["Haute qualité", "Riche en calories", "Suppléments"],
      avoid: ["Surpoids"],
      notes: ["Race controversée, besoins spéciaux multiples"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/jeaws6hskgjueu9pm4dbo",
  },
  {
    id: "minskin",
    name: "Minskin",
    origin: "États-Unis",
    temperament: ["affectueux", "joueur", "social"],
    coat: {
      length: "sans poils",
      shedding: "faible",
      notes: ["Munchkin + Sphynx", "Points de fourrure", "Pattes courtes"],
    },
    care: {
      grooming: ["Nettoyage peau", "Protection température", "Soins points de poils"],
      habits: ["Affectueux", "Aime la compagnie", "Actif"],
      watchouts: ["Sensibilité température + articulations"],
    },
    health: {
      common: ["Lordose", "Pectus excavatum", "Problèmes cutanés"],
      specific: ["Problèmes spinaux"],
      prevention: ["Poids optimal", "Température stable", "Suivi régulier"],
      vetWhen: ["Douleur dos", "Problèmes peau", "Difficulté locomotion"],
    },
    diet: {
      recommended: ["Riche en calories", "Protéines", "Suppléments articulaires"],
      avoid: ["Surpoids"],
      notes: ["Métabolisme élevé"],
    },
    imageUri:
      "https://r2-pub.rork.com/generated-images/f2f79232-0eae-4b51-b1ac-1cb8786f8707.png",
  },
  {
    id: "ukrainian-levkoy",
    name: "Ukrainian Levkoy",
    origin: "Ukraine",
    temperament: ["doux", "intelligent", "social"],
    coat: {
      length: "sans poils",
      shedding: "faible",
      notes: ["Nu ou duvet", "Oreilles pliées vers l'avant", "Apparence unique"],
    },
    care: {
      grooming: ["Bain régulier", "Nettoyage oreilles", "Protection température"],
      habits: ["Affectueux", "Curieux", "S'entend avec autres animaux"],
      watchouts: ["Sensibilité température", "Oreilles délicates"],
    },
    health: {
      common: ["Problèmes cutanés", "Infections auriculaires"],
      specific: ["Race récente, peu de données"],
      prevention: ["Soins peau", "Nettoyage oreilles", "Température stable"],
      vetWhen: ["Problèmes peau/oreilles", "Hypothermie"],
    },
    diet: {
      recommended: ["Riche en calories", "Protéines élevées", "Qualité premium"],
      avoid: ["Aliments bas de gamme"],
      notes: ["Métabolisme élevé"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/0si84lkgtj2tjr3wsvps2",
  },
  {
    id: "german-rex",
    name: "German Rex",
    origin: "Allemagne",
    temperament: ["affectueux", "joueur", "patient"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Ondulé/bouclé", "Doux", "Moustaches frisées"],
    },
    care: {
      grooming: ["Caresses (pas de brosse)", "Gant doux", "Bain rare"],
      habits: ["Câlin", "Joueur", "S'adapte bien"],
      watchouts: ["Sensible au froid"],
    },
    health: {
      common: ["Peu de problèmes"],
      specific: ["Race robuste"],
      prevention: ["Maintenir au chaud", "Soins standards"],
      vetWhen: ["Symptômes inhabituels"],
    },
    diet: {
      recommended: ["Équilibrée", "Protéines de qualité"],
      avoid: ["Excès de friandises"],
      notes: ["Besoins standards"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/diej1henijnthk8xarayw",
  },
  {
    id: "sokoke",
    name: "Sokoke",
    origin: "Kenya",
    temperament: ["actif", "social", "intelligent"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Patron unique 'wood grain'", "Brillant", "Aspect sauvage"],
    },
    care: {
      grooming: ["Brossage minimal", "Facile d'entretien"],
      habits: ["Très actif", "Aime grimper", "Social (aime vivre en groupe)"],
      watchouts: ["Besoin d'activité intense", "Race rare"],
    },
    health: {
      common: ["Peu de problèmes génétiques"],
      specific: ["Race naturelle robuste"],
      prevention: ["Soins de base", "Activité régulière"],
      vetWhen: ["Changement comportement"],
    },
    diet: {
      recommended: ["Protéines élevées", "Équilibrée", "Plusieurs petits repas"],
      avoid: ["Aliments transformés"],
      notes: ["Chat très actif"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/v6k7796do7bcpk1khn2to",
  },
  {
    id: "arabian-mau",
    name: "Arabian Mau",
    origin: "Péninsule Arabique",
    temperament: ["affectueux", "loyal", "adaptable"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Pelage adapté désert", "Texture fine", "Protège de la chaleur"],
    },
    care: {
      grooming: ["Brossage minimal", "Très facile"],
      habits: ["Actif le soir", "Chasseur", "Indépendant mais affectueux"],
      watchouts: ["Besoin d'exercice", "Instinct de chasse"],
    },
    health: {
      common: ["Très peu de problèmes"],
      specific: ["Race naturelle, très robuste"],
      prevention: ["Soins standards", "Vaccinations"],
      vetWhen: ["Symptômes inhabituels"],
    },
    diet: {
      recommended: ["Protéines élevées", "Hydratation importante", "Équilibrée"],
      avoid: ["Excès de glucides"],
      notes: ["Chat musclé et résistant"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/e52ac2xbjoxa7xcs462q6",
  },
  {
    id: "asian",
    name: "Asian",
    origin: "Royaume-Uni",
    temperament: ["sociable", "joueur", "curieux"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Type Burmese", "Brillant", "Couleurs variées"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Peau de chamois"],
      habits: ["Très vocal", "Suit son maître", "Intelligent"],
      watchouts: ["N'aime pas la solitude", "Besoin d'interaction"],
    },
    health: {
      common: ["Problèmes dentaires", "Diabète (âgé)"],
      specific: ["Hypokaliémie (rare)"],
      prevention: ["Hygiène dentaire", "Contrôle glycémie", "Poids optimal"],
      vetWhen: ["Gingivite", "Soif excessive", "Faiblesse musculaire"],
    },
    diet: {
      recommended: ["Protéines élevées", "Contrôle glucides", "Équilibrée"],
      avoid: ["Surpoids"],
      notes: ["Chat musclé et compact"],
    },
    imageUri:
      "https://images.unsplash.com/photo-1528659529456-1188448eb36d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "serengeti",
    name: "Serengeti",
    origin: "États-Unis",
    temperament: ["énergique", "confiant", "vocal"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Tacheté comme serval", "Longues pattes", "Grandes oreilles"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Facile"],
      habits: ["Très actif", "Saute haut", "Bavard", "Curieux"],
      watchouts: ["Besoin d'espace", "Très énergique"],
    },
    health: {
      common: ["Peu de données (race récente)"],
      specific: ["Généralement sain"],
      prevention: ["Activité intense", "Check-up réguliers"],
      vetWhen: ["Symptômes inhabituels"],
    },
    diet: {
      recommended: ["Riche en protéines", "Haute énergie", "Plusieurs repas"],
      avoid: ["Céréales en excès"],
      notes: ["Chat athlétique, besoins élevés"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/04hqwd9iftptfiev1ec53",
  },
  {
    id: "european-shorthair",
    name: "Européen (European Shorthair)",
    origin: "Europe",
    temperament: ["équilibré", "chasseur", "indépendant"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: ["Pelage dense", "Très variable en couleurs", "Chat naturel"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Facile d'entretien"],
      habits: ["Excellent chasseur", "Adapté à l'extérieur sécurisé", "Équilibré"],
      watchouts: ["Instinct de chasse fort", "Besoin d'activité"],
    },
    health: {
      common: ["Peu de problèmes génétiques"],
      specific: ["Race naturelle très robuste"],
      prevention: ["Soins de base", "Vaccinations", "Antiparasitaires"],
      vetWhen: ["Blessures de bagarre", "Changement comportement"],
    },
    diet: {
      recommended: ["Équilibrée", "Protéines de qualité", "Adaptée activité"],
      avoid: ["Aliments de basse qualité"],
      notes: ["Chat robuste, peu d'exigences spéciales"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ssyqd03sfmlz5q5fm5l0w",
  },
  {
    id: "aegean",
    name: "Égéen (Aegean)",
    origin: "Grèce (Îles de la mer Égée)",
    temperament: ["social", "intelligent", "athlétique"],
    coat: {
      length: "mi-long",
      shedding: "modéré",
      notes: ["Semi-long", "Bicolore ou tricolore fréquent", "Résistant"],
    },
    care: {
      grooming: ["Brossage 2×/semaine", "Entretien modéré"],
      habits: ["Adore l'eau et la pêche", "Très communicatif", "Grimpeur agile"],
      watchouts: ["Besoin d'espace", "Aime explorer"],
    },
    health: {
      common: ["Peu de problèmes"],
      specific: ["Race naturelle ancienne", "Très robuste"],
      prevention: ["Soins standards", "Activité régulière"],
      vetWhen: ["Symptômes inhabituels"],
    },
    diet: {
      recommended: ["Protéines élevées", "Poisson inclus", "Équilibrée"],
      avoid: ["Monotonie alimentaire"],
      notes: ["Chat musclé et actif"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/95lzg0a9z97sosskz11z6",
  },
  {
    id: "chantilly-tiffany",
    name: "Chantilly-Tiffany",
    origin: "États-Unis",
    temperament: ["doux", "loyal", "modéré"],
    coat: {
      length: "mi-long",
      shedding: "modéré",
      notes: ["Soyeux", "Chocolat fréquent", "Collerette au cou"],
    },
    care: {
      grooming: ["Brossage 2×/semaine", "Entretien modéré", "Peu de nœuds"],
      habits: ["Modérément actif", "Aime la compagnie", "Voix douce"],
      watchouts: ["N'aime pas la solitude prolongée"],
    },
    health: {
      common: ["Peu de problèmes spécifiques"],
      specific: ["Race rare, peu de données"],
      prevention: ["Soins standards", "Check-up réguliers"],
      vetWhen: ["Symptômes respiratoires", "Changement comportement"],
    },
    diet: {
      recommended: ["Équilibrée", "Protéines de qualité", "Oméga-3"],
      avoid: ["Surpoids"],
      notes: ["Chat de taille moyenne"],
    },
    imageUri:
      "https://images.unsplash.com/photo-1568152950566-c1bf43f4ab28?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "javanese",
    name: "Javanais",
    origin: "États-Unis",
    temperament: ["vocal", "actif", "affectueux"],
    coat: {
      length: "mi-long",
      shedding: "faible",
      notes: ["Soyeux", "Pas de sous-poil", "Colorpoint"],
    },
    care: {
      grooming: ["Brossage 2×/semaine", "Facile d'entretien"],
      habits: ["Très bavard", "Joueur", "Suit son maître"],
      watchouts: ["Besoin d'attention", "Anxiété de séparation possible"],
    },
    health: {
      common: ["Amyloïdose", "Problèmes dentaires"],
      specific: ["Atrophie rétinienne progressive"],
      prevention: ["Hygiène dentaire", "Tests oculaires", "Stimulation"],
      vetWhen: ["Problèmes de vision", "Gingivite"],
    },
    diet: {
      recommended: ["Protéines élevées", "Plusieurs repas", "Équilibrée"],
      avoid: ["Sous-nutrition"],
      notes: ["Chat élancé et actif"],
    },
    imageUri:
      "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "colorpoint-shorthair",
    name: "Colorpoint Shorthair",
    origin: "États-Unis",
    temperament: ["extraverti", "vocal", "affectueux"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Type Siamois", "Colorpoint", "Fin et soyeux"],
    },
    care: {
      grooming: ["Brossage léger hebdomadaire", "Facile"],
      habits: ["Très bavard", "Demande attention", "Intelligent"],
      watchouts: ["Anxiété si seul", "Besoin d'interaction"],
    },
    health: {
      common: ["Problèmes dentaires", "Sensibilité respiratoire"],
      specific: ["Amyloïdose", "Problèmes cardiaques"],
      prevention: ["Hygiène dentaire", "Environnement sain", "Stimulation"],
      vetWhen: ["Gingivite", "Difficultés respiratoires"],
    },
    diet: {
      recommended: ["Protéines élevées", "Plusieurs repas", "Chat actif"],
      avoid: ["Sous-alimentation"],
      notes: ["Silhouette élancée naturelle"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/aloay4j2pahcvx5az965t",
  },
  {
    id: "burmilla",
    name: "Burmilla",
    origin: "Royaume-Uni",
    temperament: ["doux", "joueur", "sociable"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Argenté/shaded", "Yeux verts", "Brillant"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Facile d'entretien"],
      habits: ["Équilibré", "Aime jouer", "Bon avec enfants"],
      watchouts: ["Besoin d'attention modérée"],
    },
    health: {
      common: ["Polykystose rénale (PKD)", "Problèmes rénaux"],
      specific: ["Allergies cutanées"],
      prevention: ["Tests génétiques", "Contrôles rénaux", "Hydratation"],
      vetWhen: ["Problèmes urinaires", "Soif excessive", "Perte de poids"],
    },
    diet: {
      recommended: ["Équilibrée", "Soutien rénal si besoin", "Hydratation"],
      avoid: ["Excès de phosphore"],
      notes: ["Surveiller fonction rénale"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/46awtdshkoucre2yl0wwy",
  },
  {
    id: "australian-mist",
    name: "Australian Mist",
    origin: "Australie",
    temperament: ["doux", "tolérant", "joueur"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Tacheté ou marbré", "Aspect brumeux", "Doux"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Très facile"],
      habits: ["Parfait pour intérieur", "Patient avec enfants", "Calme"],
      watchouts: ["Peu"],
    },
    health: {
      common: ["Peu de problèmes"],
      specific: ["Race développée pour la santé"],
      prevention: ["Soins standards", "Check-up annuels"],
      vetWhen: ["Symptômes inhabituels"],
    },
    diet: {
      recommended: ["Équilibrée", "Contrôle portions", "Activité modérée"],
      avoid: ["Surpoids"],
      notes: ["Chat d'appartement calme"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ayw5bqv6jgu04213kkbmv",
  },
  {
    id: "tiffanie",
    name: "Tiffanie (Asian Longhair)",
    origin: "Royaume-Uni",
    temperament: ["affectueux", "joueur", "sociable"],
    coat: {
      length: "mi-long",
      shedding: "modéré",
      notes: ["Soyeux", "Type Burmese poil long", "Queue panache"],
    },
    care: {
      grooming: ["Brossage 2-3×/semaine", "Entretien modéré"],
      habits: ["Communicatif", "Aime la compagnie", "Actif"],
      watchouts: ["N'aime pas solitude"],
    },
    health: {
      common: ["Diabète (âgé)", "Problèmes dentaires"],
      specific: ["Hypokaliémie (rare)"],
      prevention: ["Contrôle glycémie", "Hygiène dentaire", "Poids optimal"],
      vetWhen: ["Soif excessive", "Gingivite", "Faiblesse"],
    },
    diet: {
      recommended: ["Protéines élevées", "Contrôle glucides", "Équilibrée"],
      avoid: ["Sucres", "Surpoids"],
      notes: ["Chat musclé et élégant"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/cvh65jiz96cr9c2nr5gxw",
  },
  {
    id: "foldex",
    name: "Foldex",
    origin: "Canada",
    temperament: ["doux", "calme", "affectueux"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: ["Scottish Fold + Exotic", "Dense", "Oreilles pliées"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Nettoyage oreilles", "Nettoyage yeux"],
      habits: ["Calme", "Bon en appartement", "Affectueux"],
      watchouts: ["Problèmes articulaires", "Problèmes respiratoires"],
    },
    health: {
      common: ["Ostéochondrodysplasie", "PKD", "Problèmes respiratoires"],
      specific: ["Cumul problèmes Fold + Persan"],
      prevention: [
        "Sélection éleveur responsable",
        "Suppléments articulaires",
        "Contrôle poids",
      ],
      vetWhen: ["Raideur pattes", "Difficultés respiratoires", "Douleur"],
    },
    diet: {
      recommended: ["Équilibrée", "Oméga-3", "Suppléments articulaires"],
      avoid: ["Surpoids (articulations)"],
      notes: ["Double vigilance nécessaire"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/esldipox5twsr59krmipk",
  },
  {
    id: "napoleon",
    name: "Napoleon (Minuet)",
    origin: "États-Unis",
    temperament: ["affectueux", "joueur", "doux"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: ["Munchkin + Persan/Exotic", "Dense", "Pattes courtes"],
    },
    care: {
      grooming: ["Brossage régulier", "Nettoyage visage", "Varie selon poil"],
      habits: ["Joueur", "Affectueux", "Bon avec enfants"],
      watchouts: ["Problèmes articulaires + respiratoires"],
    },
    health: {
      common: ["Lordose", "PKD", "Problèmes respiratoires"],
      specific: ["Cumul Munchkin + brachycéphale"],
      prevention: [
        "Contrôle poids strict",
        "Tests génétiques",
        "Éviter chaleur",
      ],
      vetWhen: ["Douleur dos", "Ronflements", "Difficultés respiration"],
    },
    diet: {
      recommended: ["Contrôle calorique", "Suppléments articulaires", "Équilibrée"],
      avoid: ["Surpoids (critique)"],
      notes: ["Poids optimal essentiel"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/26x0lf3otta8k6pjseeki",
  },
  {
    id: "kinkalow",
    name: "Kinkalow",
    origin: "États-Unis",
    temperament: ["joueur", "affectueux", "social"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Munchkin + American Curl", "Oreilles recourbées", "Pattes courtes"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Attention oreilles", "Ne pas plier"],
      habits: ["Très joueur", "Curieux", "Sociable"],
      watchouts: ["Problèmes articulaires", "Cartilage oreilles fragile"],
    },
    health: {
      common: ["Lordose", "Pectus excavatum", "Problèmes articulaires"],
      specific: ["Double mutation génétique"],
      prevention: ["Contrôle poids", "Manipulation douce oreilles", "Suivi ortho"],
      vetWhen: ["Douleur dos", "Problèmes oreilles", "Boiterie"],
    },
    diet: {
      recommended: ["Contrôle calorique", "Suppléments articulaires", "Protéines"],
      avoid: ["Surpoids"],
      notes: ["Poids crucial pour articulations"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/x6emwt0bjluciuunjwdin",
  },
  {
    id: "lambkin",
    name: "Lambkin (Nanus Rex)",
    origin: "États-Unis",
    temperament: ["doux", "joueur", "affectueux"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Munchkin + Selkirk Rex", "Bouclé", "Aspect agneau"],
    },
    care: {
      grooming: ["Brossage doux 2×/semaine", "Éviter sur-brossage"],
      habits: ["Doux", "Joueur", "Patient"],
      watchouts: ["Problèmes articulaires", "Peau sensible"],
    },
    health: {
      common: ["Lordose", "Pectus excavatum", "PKD (Selkirk)"],
      specific: ["Problèmes spinaux"],
      prevention: [
        "Contrôle poids strict",
        "Tests génétiques",
        "Soins peau",
      ],
      vetWhen: ["Douleur dos", "Problèmes peau", "Difficulté locomotion"],
    },
    diet: {
      recommended: ["Contrôle calorique", "Oméga-3", "Suppléments articulaires"],
      avoid: ["Surpoids"],
      notes: ["Poids optimal crucial"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ttvj6k5ute07hm73ggugh",
  },
  {
    id: "skookum",
    name: "Skookum",
    origin: "États-Unis",
    temperament: ["joueur", "affectueux", "énergique"],
    coat: {
      length: "mi-long",
      shedding: "faible",
      notes: ["Munchkin + LaPerm", "Bouclé", "Pattes courtes"],
    },
    care: {
      grooming: ["Brossage doux 2×/semaine", "Peut perdre/regagner poil"],
      habits: ["Très actif", "Affectueux", "Curieux"],
      watchouts: ["Problèmes articulaires", "Peau sensible"],
    },
    health: {
      common: ["Lordose", "Pectus excavatum"],
      specific: ["Problèmes spinaux"],
      prevention: ["Contrôle poids strict", "Activité adaptée", "Suivi ortho"],
      vetWhen: ["Douleur dos", "Boiterie", "Problèmes respiratoires"],
    },
    diet: {
      recommended: ["Contrôle calorique", "Protéines", "Suppléments articulaires"],
      avoid: ["Surpoids (articulations fragiles)"],
      notes: ["Petit chat actif"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/d8fskhd88hktnzgbm33qi",
  },
  {
    id: "genetta",
    name: "Genetta",
    origin: "États-Unis",
    temperament: ["énergique", "affectueux", "joueur"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Munchkin + Bengal + Savannah", "Tacheté", "Pattes courtes"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Coupe griffes"],
      habits: ["Très actif", "Grimpe malgré pattes courtes", "Curieux"],
      watchouts: ["Besoin d'enrichissement", "Problèmes articulaires"],
    },
    health: {
      common: ["Lordose", "Pectus excavatum", "Problèmes articulaires"],
      specific: ["Hybride complexe"],
      prevention: [
        "Contrôle poids strict",
        "Activité adaptée",
        "Suivi vétérinaire régulier",
      ],
      vetWhen: ["Douleur dos", "Boiterie", "Difficulté locomotion"],
    },
    diet: {
      recommended: [
        "Protéines animales élevées",
        "Contrôle calorique",
        "Suppléments articulaires",
      ],
      avoid: ["Surpoids (critique)", "Céréales en excès"],
      notes: ["Chat actif, articulations fragiles"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/qhpfmd41hb4gkel6tbtl4",
  },
  {
    id: "thai",
    name: "Thai (Traditional Siamese)",
    origin: "Thaïlande",
    temperament: ["affectueux", "vocal", "intelligent"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Type siamois traditionnel", "Colorpoint", "Plus rond que Siamois moderne"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Facile d'entretien"],
      habits: ["Bavard", "Affectueux", "Intelligent"],
      watchouts: ["Besoin d'attention", "Anxiété de séparation possible"],
    },
    health: {
      common: ["Problèmes dentaires"],
      specific: ["Moins de problèmes que Siamois moderne"],
      prevention: ["Hygiène dentaire", "Check-up réguliers"],
      vetWhen: ["Gingivite", "Changement comportement"],
    },
    diet: {
      recommended: ["Protéines élevées", "Équilibrée", "Plusieurs repas"],
      avoid: ["Sous-alimentation"],
      notes: ["Chat actif et musclé"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/z3kboxdofsvtsq7iacopv",
  },
  {
    id: "aphrodite-giant",
    name: "Aphrodite Giant",
    origin: "Chypre",
    temperament: ["doux", "affectueux", "social"],
    coat: {
      length: "mi-long",
      shedding: "modéré",
      notes: ["Race naturelle ancienne", "Poil soyeux", "Grand gabarit"],
    },
    care: {
      grooming: ["Brossage 2×/semaine", "Entretien modéré"],
      habits: ["Calme et affectueux", "Bon chasseur", "S'entend avec tous"],
      watchouts: ["Besoin d'espace (grand chat)"],
    },
    health: {
      common: ["Peu de problèmes génétiques"],
      specific: ["Race naturelle très robuste"],
      prevention: ["Soins standards", "Activité régulière"],
      vetWhen: ["Symptômes inhabituels"],
    },
    diet: {
      recommended: ["Protéines de qualité", "Portions adaptées grande taille", "Équilibrée"],
      avoid: ["Surpoids"],
      notes: ["Un des plus grands chats domestiques naturels"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/24cfafnqw2vt29y1edsqu",
  },
  {
    id: "suphalak",
    name: "Suphalak",
    origin: "Thaïlande",
    temperament: ["loyal", "affectueux", "calme"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Robe acajou/cuivre uniforme", "Brillant", "Race ancienne"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Facile d'entretien"],
      habits: ["Calme", "Attaché à sa famille", "Moins vocal que Siamois"],
      watchouts: ["Race très rare"],
    },
    health: {
      common: ["Peu de données (race rare)"],
      specific: ["Race naturelle ancienne"],
      prevention: ["Soins standards", "Check-up réguliers"],
      vetWhen: ["Symptômes inhabituels"],
    },
    diet: {
      recommended: ["Équilibrée", "Protéines de qualité"],
      avoid: ["Aliments de basse qualité"],
      notes: ["Chat de taille moyenne"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/p845gruir6kum40jegoyc",
  },
  {
    id: "raas",
    name: "Raas",
    origin: "Indonésie (Île de Raas)",
    temperament: ["énergique", "social", "intelligent"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Queue courte naturelle", "Aspect sauvage", "Musculeux"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Facile"],
      habits: ["Très actif", "Aime grimper", "Social avec congénères"],
      watchouts: ["Besoin d'activité intense", "Race rare hors Indonésie"],
    },
    health: {
      common: ["Peu de données"],
      specific: ["Race naturelle insulaire"],
      prevention: ["Soins de base", "Activité régulière"],
      vetWhen: ["Symptômes inhabituels"],
    },
    diet: {
      recommended: ["Protéines élevées", "Équilibrée", "Adaptée activité"],
      avoid: ["Aliments transformés"],
      notes: ["Chat musclé et athlétique"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/6qbvk4uh55yotkd9qcpgt",
  },
  {
    id: "cyprus",
    name: "Cyprus (Cypriot)",
    origin: "Chypre",
    temperament: ["affectueux", "adaptable", "social"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Toutes couleurs", "Résistant", "Race naturelle"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Très facile"],
      habits: ["Équilibré", "Bon chasseur", "Aime l'extérieur sécurisé"],
      watchouts: ["Instinct de chasse"],
    },
    health: {
      common: ["Peu de problèmes"],
      specific: ["Race naturelle robuste"],
      prevention: ["Soins standards", "Vaccinations", "Antiparasitaires"],
      vetWhen: ["Changement comportement"],
    },
    diet: {
      recommended: ["Équilibrée", "Protéines de qualité"],
      avoid: ["Aliments de basse qualité"],
      notes: ["Chat rustique"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/svz73i5pr3i2f4c0f08u9",
  },
  {
    id: "sam-sawet",
    name: "Sam Sawet",
    origin: "Thaïlande",
    temperament: ["affectueux", "calme", "loyal"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Robe dorée/argentée", "Brillant", "Race ancienne"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Facile"],
      habits: ["Calme", "Voix douce", "Attaché à sa famille"],
      watchouts: ["Race extrêmement rare"],
    },
    health: {
      common: ["Peu de données (très rare)"],
      specific: ["Race naturelle ancienne"],
      prevention: ["Soins standards"],
      vetWhen: ["Symptômes inhabituels"],
    },
    diet: {
      recommended: ["Équilibrée", "Protéines de qualité"],
      avoid: ["Aliments de basse qualité"],
      notes: ["Chat de taille moyenne"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/e7ycflzl58q0foff42nfw",
  },
  {
    id: "german-longhair",
    name: "German Longhair",
    origin: "Allemagne",
    temperament: ["calme", "affectueux", "équilibré"],
    coat: {
      length: "long",
      shedding: "modéré",
      notes: ["Poil semi-long soyeux", "Toutes couleurs", "Aspect élégant"],
    },
    care: {
      grooming: ["Brossage 2-3×/semaine", "Entretien régulier"],
      habits: ["Calme", "Bon en famille", "Équilibré"],
      watchouts: ["Boules de poils"],
    },
    health: {
      common: ["Peu de problèmes spécifiques"],
      specific: ["Race recréée récemment"],
      prevention: ["Brossage régulier", "Pâte au malt", "Check-up"],
      vetWhen: ["Vomissements fréquents", "Symptômes inhabituels"],
    },
    diet: {
      recommended: ["Équilibrée", "Fibres pour boules de poils", "Protéines"],
      avoid: ["Changements brutaux"],
      notes: ["Chat de taille moyenne à grande"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/0ki3ezb6blurf62n9afz3",
  },
  {
    id: "ural-rex",
    name: "Ural Rex",
    origin: "Russie (Monts Oural)",
    temperament: ["affectueux", "joueur", "doux"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Ondulé/bouclé", "Mutation naturelle", "Doux"],
    },
    care: {
      grooming: ["Brossage doux hebdomadaire", "Gant de toilettage"],
      habits: ["Affectueux", "Joueur", "Patient avec enfants"],
      watchouts: ["Race rare hors Russie"],
    },
    health: {
      common: ["Peu de problèmes"],
      specific: ["Mutation naturelle différente de Cornish/Devon"],
      prevention: ["Soins standards", "Température stable"],
      vetWhen: ["Symptômes inhabituels"],
    },
    diet: {
      recommended: ["Équilibrée", "Protéines de qualité"],
      avoid: ["Aliments de basse qualité"],
      notes: ["Chat de taille moyenne"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/8yokp55nzty6yye9q87eo",
  },
  {
    id: "mekong-bobtail",
    name: "Mekong Bobtail",
    origin: "Russie / Asie du Sud-Est",
    temperament: ["loyal", "chien-like", "vocal"],
    coat: {
      length: "court",
      shedding: "faible",
      notes: ["Colorpoint", "Queue courte/tordue", "Type siamois ancien"],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Facile"],
      habits: ["Comportement canin", "Apporte objets", "Très loyal"],
      watchouts: ["Très vocal", "Besoin d'interaction"],
    },
    health: {
      common: ["Problèmes dentaires"],
      specific: ["Longévité exceptionnelle (20+ ans fréquent)"],
      prevention: ["Hygiène dentaire", "Soins standards"],
      vetWhen: ["Gingivite", "Changement comportement"],
    },
    diet: {
      recommended: ["Protéines élevées", "Équilibrée", "Adaptée âge"],
      avoid: ["Surpoids"],
      notes: ["Race robuste et longévive"],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/euh1eauf9h4ct2364cces",
  },
  {
    id: "ojos-azules",
    name: "Ojos Azules",
    origin: "États-Unis (Nouveau-Mexique)",
    temperament: ["affectueux", "calme", "sociable"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: [
        "Toutes couleurs et motifs acceptés",
        "Poil doux et soyeux",
        "Yeux bleu intense caractéristiques",
      ],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Entretien facile"],
      habits: [
        "Calme et posé",
        "Bon avec les enfants",
        "S'adapte à la vie en appartement",
      ],
      watchouts: [
        "Race extrêmement rare",
        "Reproduction délicate (gène létal si homozygote)",
      ],
    },
    health: {
      common: ["Problèmes dentaires", "Peu de données disponibles"],
      specific: [
        "Gène des yeux bleus lié à des anomalies crâniennes si homozygote",
        "Ne jamais croiser deux Ojos Azules ensemble",
        "Chatons à tache blanche sur la queue viables",
      ],
      prevention: [
        "Sélection génétique rigoureuse",
        "Suivi vétérinaire régulier",
        "Tests génétiques recommandés",
      ],
      vetWhen: [
        "Problèmes de coordination",
        "Anomalies faciales chez chatons",
        "Changement de comportement",
      ],
    },
    diet: {
      recommended: [
        "Alimentation équilibrée de qualité",
        "Protéines de haute qualité",
        "Adaptée à l'âge et l'activité",
      ],
      avoid: ["Aliments de basse qualité", "Changements alimentaires brutaux"],
      notes: [
        "Chat de taille moyenne",
        "Pas de besoins nutritionnels spécifiques",
      ],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/4xfwlbq670m31rgee60tn",
  },
  {
    id: "gouttiere",
    name: "Chat de gouttière",
    origin: "Mondial",
    temperament: ["adaptable", "unique", "attachant"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: [
        "Pelage très variable (tabby, uni, bicolore, tricolore...)",
        "Texture et densité variées selon l'individu",
        "Chat métissé, le plus répandu au monde",
      ],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Adapté au type de poil"],
      habits: [
        "Personnalité unique et imprévisible",
        "Souvent excellent chasseur",
        "Très adaptable à différents environnements",
      ],
      watchouts: [
        "Chaque chat est différent",
        "Observer son tempérament individuel",
      ],
    },
    health: {
      common: ["Parasites si extérieur", "Problèmes dentaires"],
      specific: [
        "Diversité génétique = robustesse générale",
        "Moins de maladies héréditaires que les races pures",
      ],
      prevention: [
        "Vaccinations à jour",
        "Antiparasitaires réguliers",
        "Stérilisation recommandée",
        "Check-up annuel",
      ],
      vetWhen: [
        "Changement de comportement",
        "Perte d'appétit",
        "Symptômes inhabituels",
      ],
    },
    diet: {
      recommended: [
        "Alimentation équilibrée de qualité",
        "Adaptée à l'âge et l'activité",
        "Mixte (croquettes + pâtée)",
      ],
      avoid: ["Aliments de très basse qualité", "Restes de table"],
      notes: [
        "Pas de besoins spécifiques particuliers",
        "Surveiller le poids si stérilisé",
      ],
    },
    imageUri:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "gouttiere-poil-long",
    name: "Chat de gouttière poil long",
    origin: "Mondial",
    temperament: ["adaptable", "unique", "attachant"],
    coat: {
      length: "long",
      shedding: "élevé",
      notes: [
        "Pelage mi-long à long, très variable",
        "Souvent avec collerette et culotte",
        "Mue saisonnière importante",
      ],
    },
    care: {
      grooming: [
        "Brossage 2-3×/semaine minimum",
        "Démêlage régulier",
        "Attention aux nœuds (aisselles, derrière oreilles)",
      ],
      habits: [
        "Personnalité unique et imprévisible",
        "Souvent excellent chasseur",
        "Très adaptable à différents environnements",
      ],
      watchouts: [
        "Boules de poils fréquentes",
        "Nœuds si négligé",
        "Observer son tempérament individuel",
      ],
    },
    health: {
      common: [
        "Boules de poils (tricobézoards)",
        "Parasites si extérieur",
        "Problèmes dentaires",
      ],
      specific: [
        "Diversité génétique = robustesse générale",
        "Moins de maladies héréditaires que les races pures",
      ],
      prevention: [
        "Brossage régulier",
        "Pâte au malt pour boules de poils",
        "Vaccinations et antiparasitaires",
        "Stérilisation recommandée",
      ],
      vetWhen: [
        "Vomissements de poils fréquents",
        "Constipation",
        "Changement de comportement",
      ],
    },
    diet: {
      recommended: [
        "Alimentation riche en fibres",
        "Formule spéciale poil long si disponible",
        "Oméga-3 pour le pelage",
      ],
      avoid: ["Aliments de très basse qualité", "Restes de table"],
      notes: [
        "Fibres importantes pour le transit",
        "Surveiller le poids si stérilisé",
      ],
    },
    imageUri:
      "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "gouttiere-blanc-brun-roux",
    name: "Chat de gouttière Blanc Brun et Roux",
    origin: "Mondial",
    temperament: ["adaptable", "joueur", "affectueux"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: [
        "Pelage tricolore (calico/écaille de tortue avec blanc)",
        "Motifs uniques à chaque individu",
        "Généralement femelle (génétique liée au sexe)",
      ],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Adapté au type de poil"],
      habits: [
        "Personnalité souvent affirmée",
        "Réputation de caractère fort",
        "Très adaptable",
      ],
      watchouts: [
        "Chaque chat est différent",
        "Observer son tempérament individuel",
      ],
    },
    health: {
      common: ["Parasites si extérieur", "Problèmes dentaires"],
      specific: [
        "Diversité génétique = robustesse générale",
        "Moins de maladies héréditaires que les races pures",
      ],
      prevention: [
        "Vaccinations à jour",
        "Antiparasitaires réguliers",
        "Stérilisation recommandée",
        "Check-up annuel",
      ],
      vetWhen: [
        "Changement de comportement",
        "Perte d'appétit",
        "Symptômes inhabituels",
      ],
    },
    diet: {
      recommended: [
        "Alimentation équilibrée de qualité",
        "Adaptée à l'âge et l'activité",
        "Mixte (croquettes + pâtée)",
      ],
      avoid: ["Aliments de très basse qualité", "Restes de table"],
      notes: [
        "Pas de besoins spécifiques particuliers",
        "Surveiller le poids si stérilisé",
      ],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/6iqi12tphogqr5s73pyj1",
  },
  {
    id: "gouttiere-blanc-chartreux",
    name: "Chat de gouttière Blanc et Chartreux",
    origin: "Mondial",
    temperament: ["calme", "doux", "attachant"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: [
        "Pelage bicolore gris et blanc",
        "Ressemblance avec le Chartreux",
        "Texture dense et douce",
      ],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Adapté au type de poil"],
      habits: [
        "Souvent calme et posé",
        "Bon compagnon de vie",
        "Adaptable",
      ],
      watchouts: [
        "Chaque chat est différent",
        "Observer son tempérament individuel",
      ],
    },
    health: {
      common: ["Parasites si extérieur", "Problèmes dentaires"],
      specific: [
        "Diversité génétique = robustesse générale",
        "Moins de maladies héréditaires que les races pures",
      ],
      prevention: [
        "Vaccinations à jour",
        "Antiparasitaires réguliers",
        "Stérilisation recommandée",
        "Check-up annuel",
      ],
      vetWhen: [
        "Changement de comportement",
        "Perte d'appétit",
        "Symptômes inhabituels",
      ],
    },
    diet: {
      recommended: [
        "Alimentation équilibrée de qualité",
        "Adaptée à l'âge et l'activité",
        "Mixte (croquettes + pâtée)",
      ],
      avoid: ["Aliments de très basse qualité", "Restes de table"],
      notes: [
        "Pas de besoins spécifiques particuliers",
        "Surveiller le poids si stérilisé",
      ],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/mp3pyzhnstb0dpf7azscc",
  },
  {
    id: "gouttiere-noir-blanc",
    name: "Chat de gouttière Noir et Blanc",
    origin: "Mondial",
    temperament: ["sociable", "curieux", "joueur"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: [
        "Pelage bicolore noir et blanc (tuxedo, vache, etc.)",
        "Motifs très variés",
        "Souvent très photogénique",
      ],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Adapté au type de poil"],
      habits: [
        "Réputé sociable et joueur",
        "Souvent très expressif",
        "Adaptable à tous environnements",
      ],
      watchouts: [
        "Chaque chat est différent",
        "Observer son tempérament individuel",
      ],
    },
    health: {
      common: ["Parasites si extérieur", "Problèmes dentaires"],
      specific: [
        "Diversité génétique = robustesse générale",
        "Moins de maladies héréditaires que les races pures",
      ],
      prevention: [
        "Vaccinations à jour",
        "Antiparasitaires réguliers",
        "Stérilisation recommandée",
        "Check-up annuel",
      ],
      vetWhen: [
        "Changement de comportement",
        "Perte d'appétit",
        "Symptômes inhabituels",
      ],
    },
    diet: {
      recommended: [
        "Alimentation équilibrée de qualité",
        "Adaptée à l'âge et l'activité",
        "Mixte (croquettes + pâtée)",
      ],
      avoid: ["Aliments de très basse qualité", "Restes de table"],
      notes: [
        "Pas de besoins spécifiques particuliers",
        "Surveiller le poids si stérilisé",
      ],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/tl0u38mzs2zhqd3n4ywob",
  },
  {
    id: "gouttiere-roux",
    name: "Chat de gouttière Roux",
    origin: "Mondial",
    temperament: ["affectueux", "sociable", "gourmand"],
    coat: {
      length: "court",
      shedding: "modéré",
      notes: [
        "Pelage roux tigré (tabby orange)",
        "Majoritairement mâles (80%)",
        "Teintes du crème au roux vif",
      ],
    },
    care: {
      grooming: ["Brossage hebdomadaire", "Adapté au type de poil"],
      habits: [
        "Réputé très affectueux et câlin",
        "Souvent gourmand",
        "Personnalité attachante",
      ],
      watchouts: [
        "Tendance à l'embonpoint",
        "Surveiller l'alimentation",
        "Observer son tempérament individuel",
      ],
    },
    health: {
      common: ["Parasites si extérieur", "Problèmes dentaires", "Surpoids"],
      specific: [
        "Diversité génétique = robustesse générale",
        "Moins de maladies héréditaires que les races pures",
      ],
      prevention: [
        "Vaccinations à jour",
        "Antiparasitaires réguliers",
        "Stérilisation recommandée",
        "Surveillance du poids",
      ],
      vetWhen: [
        "Changement de comportement",
        "Perte d'appétit",
        "Prise de poids excessive",
      ],
    },
    diet: {
      recommended: [
        "Alimentation équilibrée de qualité",
        "Portions contrôlées",
        "Mixte (croquettes + pâtée)",
      ],
      avoid: ["Suralimentation", "Friandises excessives", "Restes de table"],
      notes: [
        "Attention aux calories (tendance gourmande)",
        "Surveiller le poids si stérilisé",
      ],
    },
    imageUri:
      "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/04hwjqrgpj2aah58z83e2",
  },
];

export function getBreedById(id: string | null | undefined): BreedProfile | null {
  const safe = (id ?? "") as BreedId;
  return BREEDS.find((b) => b.id === safe) ?? null;
}
