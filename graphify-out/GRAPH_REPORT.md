# Graph Report - /Volumes/EVO/rork-chat-race-guide  (2026-06-12)

## Corpus Check
- Large corpus: 186 files · ~739,373 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 1351 nodes · 1805 edges · 94 communities (83 shown, 11 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 69 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Tab Navigation & App Shell|Tab Navigation & App Shell]]
- [[_COMMUNITY_Breed Discovery & Breeders|Breed Discovery & Breeders]]
- [[_COMMUNITY_iOS SwiftUI Navigation Shell|iOS SwiftUI Navigation Shell]]
- [[_COMMUNITY_Backend API & Subscription Auth|Backend API & Subscription Auth]]
- [[_COMMUNITY_AI Behavior Analysis|AI Behavior Analysis]]
- [[_COMMUNITY_Home & Onboarding Flow|Home & Onboarding Flow]]
- [[_COMMUNITY_Gamification System|Gamification System]]
- [[_COMMUNITY_Map & Location Features|Map & Location Features]]
- [[_COMMUNITY_Cross-Platform Architecture|Cross-Platform Architecture]]
- [[_COMMUNITY_Discussions & Chat|Discussions & Chat]]
- [[_COMMUNITY_iOS Services Layer|iOS Services Layer]]
- [[_COMMUNITY_Reminders System|Reminders System]]
- [[_COMMUNITY_Expense Tracking|Expense Tracking]]
- [[_COMMUNITY_Daily Health Logging|Daily Health Logging]]
- [[_COMMUNITY_Emergency Alerts Geo|Emergency Alerts Geo]]
- [[_COMMUNITY_AI Assistant Chat|AI Assistant Chat]]
- [[_COMMUNITY_Cat & Alert Forms|Cat & Alert Forms]]
- [[_COMMUNITY_Layout Components|Layout Components]]
- [[_COMMUNITY_Shopping List|Shopping List]]
- [[_COMMUNITY_Health Records|Health Records]]
- [[_COMMUNITY_Signup Screen|Signup Screen]]
- [[_COMMUNITY_Daily Logs Analytics|Daily Logs Analytics]]
- [[_COMMUNITY_Cat Profile Form|Cat Profile Form]]
- [[_COMMUNITY_iOS Glass Design System|iOS Glass Design System]]
- [[_COMMUNITY_Brand & App Icons|Brand & App Icons]]
- [[_COMMUNITY_Subscription Paywall|Subscription Paywall]]
- [[_COMMUNITY_Weight Tracking|Weight Tracking]]
- [[_COMMUNITY_Community Events|Community Events]]
- [[_COMMUNITY_Community Posts|Community Posts]]
- [[_COMMUNITY_Community Feed|Community Feed]]
- [[_COMMUNITY_Onboarding Language UI|Onboarding Language UI]]
- [[_COMMUNITY_Login Screen|Login Screen]]
- [[_COMMUNITY_Auth UI Components|Auth UI Components]]
- [[_COMMUNITY_Navigation Layouts|Navigation Layouts]]
- [[_COMMUNITY_Camera Scanner|Camera Scanner]]
- [[_COMMUNITY_Login UI Screen B|Login UI Screen B]]
- [[_COMMUNITY_Login UI Screen C|Login UI Screen C]]
- [[_COMMUNITY_Notifications & Account|Notifications & Account]]
- [[_COMMUNITY_Scan Image State|Scan Image State]]
- [[_COMMUNITY_Event Detail|Event Detail]]
- [[_COMMUNITY_Direct Messages|Direct Messages]]
- [[_COMMUNITY_Post Comments|Post Comments]]
- [[_COMMUNITY_Paywall Component|Paywall Component]]
- [[_COMMUNITY_Breed Image API|Breed Image API]]
- [[_COMMUNITY_Cat Detail View|Cat Detail View]]
- [[_COMMUNITY_Food Calculator|Food Calculator]]
- [[_COMMUNITY_Premium Gate|Premium Gate]]
- [[_COMMUNITY_Social Data Models|Social Data Models]]
- [[_COMMUNITY_User Profile|User Profile]]
- [[_COMMUNITY_Toyger Breed Image|Toyger Breed Image]]
- [[_COMMUNITY_Savannah Breed Image|Savannah Breed Image]]
- [[_COMMUNITY_App Providers & Config|App Providers & Config]]
- [[_COMMUNITY_Weight Chart Screen|Weight Chart Screen]]
- [[_COMMUNITY_Splash Screen Brand|Splash Screen Brand]]
- [[_COMMUNITY_Thumbnail Marketing|Thumbnail Marketing]]
- [[_COMMUNITY_AsianBirman Breed Image|Asian/Birman Breed Image]]
- [[_COMMUNITY_Ocicat Breed Image|Ocicat Breed Image]]
- [[_COMMUNITY_Error Boundary|Error Boundary]]
- [[_COMMUNITY_FAQ Screen|FAQ Screen]]
- [[_COMMUNITY_Shelters Directory|Shelters Directory]]
- [[_COMMUNITY_Cats Context Models|Cats Context Models]]
- [[_COMMUNITY_First Aid Guides|First Aid Guides]]
- [[_COMMUNITY_Cats List Screen|Cats List Screen]]
- [[_COMMUNITY_Brand Logo Adaptive Icon|Brand Logo Adaptive Icon]]
- [[_COMMUNITY_Splash Icon|Splash Icon]]
- [[_COMMUNITY_Russian Blue Breed Image|Russian Blue Breed Image]]
- [[_COMMUNITY_Save Callbacks|Save Callbacks]]
- [[_COMMUNITY_Toast Component|Toast Component]]
- [[_COMMUNITY_Skeleton Loaders|Skeleton Loaders]]
- [[_COMMUNITY_Logo Asset|Logo Asset]]
- [[_COMMUNITY_Cat Detail Actions|Cat Detail Actions]]
- [[_COMMUNITY_Auth Context & User|Auth Context & User]]
- [[_COMMUNITY_Favicon Icon|Favicon Icon]]
- [[_COMMUNITY_Purrly Brand Mark|Purrly Brand Mark]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Metro Config|Metro Config]]
- [[_COMMUNITY_Emergency Context|Emergency Context]]
- [[_COMMUNITY_Button Component|Button Component]]
- [[_COMMUNITY_Card Component|Card Component]]
- [[_COMMUNITY_About Screen|About Screen]]
- [[_COMMUNITY_Travel Checklist|Travel Checklist]]
- [[_COMMUNITY_Demo Account Script|Demo Account Script]]
- [[_COMMUNITY_iOS App Theme|iOS App Theme]]
- [[_COMMUNITY_Not Found Screen|Not Found Screen]]
- [[_COMMUNITY_iOS App Entry Point|iOS App Entry Point]]
- [[_COMMUNITY_iOS App Environment|iOS App Environment]]
- [[_COMMUNITY_iOS App Configuration|iOS App Configuration]]

## God Nodes (most connected - your core abstractions)
1. `Colors` - 57 edges
2. `navigate()` - 39 edges
3. `navigateWithParams()` - 21 edges
4. `navigateReplace()` - 20 edges
5. `Purrly iOS Native App` - 20 edges
6. `Purrly` - 16 edges
7. `Language Selection Screen` - 14 edges
8. `t` - 13 edges
9. `Login Screen (auth/login)` - 13 edges
10. `Login Screen (auth/login)` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Expo Project (expo/)` --conceptually_related_to--> `Purrly`  [INFERRED]
  ios-native/README.md → expo/README.md
- `RootLayoutNav()` --calls--> `t`  [INFERRED]
  expo/app/_layout.tsx → expo/backend/trpc/create-context.ts
- `RevenueCat` --conceptually_related_to--> `Purrly PREMIUM Plan`  [INFERRED]
  ios-native/README.md → expo/README.md
- `Purrly AI Scanner` --conceptually_related_to--> `ScanHomeView`  [INFERRED]
  expo/README.md → ios-native/README.md
- `Purrly Vet Assistant` --conceptually_related_to--> `AssistantChatView`  [INFERRED]
  expo/README.md → ios-native/README.md

## Communities (94 total, 11 thin omitted)

### Community 0 - "Tab Navigation & App Shell"
Cohesion: 0.05
Nodes (52): MainTab, assistant, cats, community, home, more, data, CaseIterable (+44 more)

### Community 1 - "Breed Discovery & Breeders"
Cohesion: 0.05
Nodes (47): breed, filteredBreeders, initialRegion, navigation, params, [selectedBreeder, setSelectedBreeder], breed, navigation (+39 more)

### Community 2 - "iOS SwiftUI Navigation Shell"
Cohesion: 0.05
Nodes (22): MainTabView, LaunchLoadingView, RootView, AssistantChatView, FlowLayout, LoginView, SignupView, BreedDetailView (+14 more)

### Community 3 - "Backend API & Subscription Auth"
Cohesion: 0.06
Nodes (29): allowedOrigins, app, authHeader, origin, subscriptionStatus, supabase, getOpenAIKey(), Profile (+21 more)

### Community 4 - "AI Behavior Analysis"
Cohesion: 0.05
Nodes (36): { cats }, FREQUENCY_LABELS, handleAnalyze, handleRefresh, { 
    patterns, 
    analyzeBehavior, 
    isAnalyzingBehavior,
    getPatternsForCat,
  }, [refreshing, setRefreshing], selectedCat, [selectedCatId, setSelectedCatId] (+28 more)

### Community 5 - "Home & Onboarding Flow"
Cohesion: 0.05
Nodes (23): goBreeds, goScan, { hasSelectedLanguage, isLoading: isLanguageLoading }, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }, heroHeight, insets, { isAuthenticated, isLoading }, logoUri (+15 more)

### Community 6 - "Gamification System"
Cohesion: 0.06
Nodes (27): Achievement, AchievementId, ACHIEVEMENTS, Challenge, [GamificationContext, useGamification], LeaderboardEntry, LEVELS, UserStats (+19 more)

### Community 7 - "Map & Location Features"
Cohesion: 0.05
Nodes (32): DEFAULT_DELTA, handleCenterOnUser, handleMapPress, handleMarkerPress, handleOpenInMaps, initialRegion, MapMarker, mapRef (+24 more)

### Community 8 - "Cross-Platform Architecture"
Cohesion: 0.07
Nodes (38): AssistantChatView, expo/constants/breeds.ts, CatsListView, expo/constants/colors.ts, CommunityHubView, Expo Project (expo/), KeychainStore, LanguageSelectView (+30 more)

### Community 9 - "Discussions & Chat"
Cohesion: 0.06
Nodes (28): Discussion, [DiscussionsProvider, useDiscussions], Message, discussion, { discussionId }, { discussions, getDiscussionMessages, addMessage, currentUser }, flatListRef, [inputText, setInputText] (+20 more)

### Community 10 - "iOS Services Layer"
Cohesion: 0.07
Nodes (17): Decodable, Encodable, LocalizedError, ObservableObject, AIChatService, ChatPayload, ChatRequest, ChatResponse (+9 more)

### Community 11 - "Reminders System"
Cohesion: 0.07
Nodes (27): Reminder, ReminderFrequency, [RemindersContext, useReminders], ReminderType, { addReminder }, { cats }, [description, setDescription], [dueDate, setDueDate] (+19 more)

### Community 12 - "Expense Tracking"
Cohesion: 0.07
Nodes (25): Expense, ExpenseCategory, [ExpensesContext, useExpenses], { addExpense }, [amount, setAmount], CATEGORIES, [category, setCategory], { cats } (+17 more)

### Community 13 - "Daily Health Logging"
Cohesion: 0.08
Nodes (23): [appetite, setAppetite], AppetiteLevel, cat, { catId }, { cats, updateCat }, [coughing, setCoughing], { currentUser }, [date, setDate] (+15 more)

### Community 14 - "Emergency Alerts Geo"
Cohesion: 0.08
Nodes (19): activeAlerts, { address, locateOnce, isLocating }, { alerts, updateAlert, deleteAlert }, archivedAlerts, cleanPhone, date, EMERGENCY_CONTACTS, EMERGENCY_TYPES (+11 more)

### Community 15 - "AI Assistant Chat"
Cohesion: 0.08
Nodes (23): { addReminder }, birth, { cats }, chatMutation, clearChat, handleSend, [input, setInput], [isLoading, setIsLoading] (+15 more)

### Community 16 - "Cat & Alert Forms"
Cohesion: 0.09
Nodes (18): { addAlert }, [catBreed, setCatBreed], [catImageUri, setCatImageUri], [catName, setCatName], { cats }, [contactEmail, setContactEmail], [contactPhone, setContactPhone], [description, setDescription] (+10 more)

### Community 17 - "Layout Components"
Cohesion: 0.13
Nodes (8): TooltipProps, Colors, { t }, sections, { t }, sections, { t }, { t }

### Community 18 - "Shopping List"
Cohesion: 0.12
Nodes (14): ShoppingCategory, [ShoppingContext, useShopping], ShoppingItem, CATEGORY_INFO, insets, [newItemCategory, setNewItemCategory], [newItemName, setNewItemName], [newItemPriority, setNewItemPriority] (+6 more)

### Community 19 - "Health Records"
Cohesion: 0.11
Nodes (15): cat, { catId, recordId }, { cats, updateCat }, { currentUser }, [date, setDate], existingRecord, hasHealthTracking, insets (+7 more)

### Community 20 - "Signup Screen"
Cohesion: 0.12
Nodes (15): [email, setEmail], handleSignup(), [isLoading, setIsLoading], [name, setName], [password, setPassword], router, { signup }, { width } (+7 more)

### Community 21 - "Daily Logs Analytics"
Cohesion: 0.11
Nodes (16): avgAppetite, avgEnergy, avgWater, cat, { catId }, { cats }, { currentUser }, dailyLogs (+8 more)

### Community 22 - "Cat Profile Form"
Cohesion: 0.11
Nodes (13): [breedId, setBreedId], { catId }, { cats, addCat, updateCat, deleteCat }, existingCat, [gallery, setGallery], [imageUri, setImageUri], insets, [microchip, setMicrochip] (+5 more)

### Community 23 - "iOS Glass Design System"
Cohesion: 0.12
Nodes (12): ButtonStyle, GlassChrome, GlassPrimaryButtonStyle, GlassSecondaryButtonStyle, View, checks, content, failures (+4 more)

### Community 24 - "Brand & App Icons"
Cohesion: 0.18
Nodes (17): Purrly App Icon (iPad 76x76@2x), Purrly Mobile Application, Purrly Brand Identity, Purrly Background Color - Warm Off-White / Cream, Purrly Brand Color - Warm Orange (#E8943A approx), Purrly Brand Identity - Cat/Pet App, Friendly and Playful, Cat Motif - Cat Ears Integrated into Letter P, Purrly Color Palette - Warm Orange on Cream (+9 more)

### Community 25 - "Subscription Paywall"
Cohesion: 0.12
Nodes (14): findRCPackageForPlan, handlePurchase, IconMap, { isAuthenticated, updateSubscription }, LOCAL_PLANS, LocalPlan, matchingRCPkg, offeringsQuery (+6 more)

### Community 26 - "Weight Tracking"
Cohesion: 0.12
Nodes (14): cat, { catId, weightId }, { cats, updateCat }, { currentUser }, [date, setDate], existingWeight, hasHealthTracking, insets (+6 more)

### Community 27 - "Community Events"
Cohesion: 0.12
Nodes (14): [address, setAddress], { createEvent }, [date, setDate], [description, setDescription], EVENT_TYPES, insets, [isSubmitting, setIsSubmitting], [location, setLocation] (+6 more)

### Community 28 - "Community Posts"
Cohesion: 0.13
Nodes (11): [caption, setCaption], { cats }, { createPost }, [imageUrl, setImageUrl], insets, [isSubmitting, setIsSubmitting], [location, setLocation], router (+3 more)

### Community 29 - "Community Feed"
Cohesion: 0.13
Nodes (12): [activeTab, setActiveTab], conversations, { currentUser, isAuthenticated }, insets, liked, onRefresh, { posts, events, likePost, isPostLiked, getUserConversations }, [refreshing, setRefreshing] (+4 more)

### Community 30 - "Onboarding Language UI"
Cohesion: 0.17
Nodes (15): Continuer CTA Button (golden, bottom), Dark Gold UI Theme, Expo Go (iOS Simulator), Globe Icon (language selector header), Internationalization (i18n) Support, Nederlands (language option), English (language option), Français (selected language) (+7 more)

### Community 31 - "Login Screen"
Cohesion: 0.16
Nodes (13): [email, setEmail], goToForgotPassword(), goToSignup(), handleLogin(), [isLoading, setIsLoading], { login }, [password, setPassword], { width } (+5 more)

### Community 32 - "Auth UI Components"
Cohesion: 0.23
Nodes (14): App Logo (cat icon, rounded square), auth/login Route, Authentication Flow, Dark Theme UI, Email Input Field (Adresse email), Expo Go (development runner), Forgot Password Link (Mot de passe oublié?), French Locale (fr) (+6 more)

### Community 33 - "Navigation Layouts"
Cohesion: 0.15
Nodes (10): BreedsStackLayout(), CatsLayout(), formatDate(), getEventTypeLabel(), formatDate(), handleDeleteAccount(), handleToggleNotifications(), SubscriptionLayout() (+2 more)

### Community 34 - "Camera Scanner"
Cohesion: 0.15
Nodes (11): cameraModule, cameraRef, [facing, setFacing], [flash, setFlash], insets, [isTaking, setIsTaking], router, { setImage } (+3 more)

### Community 35 - "Login UI Screen B"
Cohesion: 0.27
Nodes (13): Amber/Gold Accent Color, Auth Route: auth/login, Welcome Heading (Bienvenue), Cat App Logo Icon, Dark Theme UI, Email Address Input Field (Adresse email), Expo Go Runtime, Forgot Password Link (Mot de passe oublié?) (+5 more)

### Community 36 - "Login UI Screen C"
Cohesion: 0.23
Nodes (13): App Logo (cat icon, rounded square), auth/login Route, Dark Theme (black background), Email Input Field (Adresse email), Expo Mobile App, Forgot Password Link (Mot de passe oublié?), French Locale / Language, Golden/Amber Accent Color (+5 more)

### Community 37 - "Notifications & Account"
Cohesion: 0.17
Nodes (9): [NotificationsContext, useNotifications], ScheduledNotification, { currentUser, deleteAccount, logout }, handleNavigation(), MenuItem, { 
    notificationsEnabled, 
    requestPermissions, 
    disableNotifications,
  }, router, { t } (+1 more)

### Community 38 - "Scan Image State"
Cohesion: 0.17
Nodes (10): ScanImageData, [ScanImageProvider, useScanImage], insets, onAbout, openLiveCamera, pickImage, router, { setImage } (+2 more)

### Community 39 - "Event Detail"
Cohesion: 0.17
Nodes (8): attending, event, { eventId }, { events, attendEvent, isAttending }, handleAttend(), insets, { isAuthenticated }, typeColor

### Community 40 - "Direct Messages"
Cohesion: 0.17
Nodes (9): conversation, { conversationId }, { conversations, getConversationMessages, sendMessage }, { currentUser }, flatListRef, insets, messages, [messageText, setMessageText] (+1 more)

### Community 41 - "Post Comments"
Cohesion: 0.17
Nodes (9): comments, [commentText, setCommentText], flatListRef, insets, { isAuthenticated }, liked, post, { postId } (+1 more)

### Community 42 - "Paywall Component"
Cohesion: 0.21
Nodes (8): defaultBenefits, limit, PaywallProps, { subscription, checkLimit }, hasReachedLimit(), SUBSCRIPTION_CONFIG, SubscriptionStatus, useSubscription()

### Community 43 - "Breed Image API"
Cohesion: 0.23
Nodes (7): getBreedImageSync(), CAT_API_BREED_MAP, CatApiBreed, CatApiImage, getBreedImage(), getVerifiedBreedImage(), VERIFIED_BREED_IMAGES

### Community 44 - "Cat Detail View"
Cohesion: 0.18
Nodes (9): cat, { catId }, { cats }, { currentUser }, navigation, onEditCat, [selectedPhotoIndex, setSelectedPhotoIndex], { t } (+1 more)

### Community 45 - "Food Calculator"
Cohesion: 0.18
Nodes (10): ACTIVITY_LEVELS, [activity, setActivity], ActivityLevel, calculations, insets, [isNeutered, setIsNeutered], LIFE_STAGES, LifeStage (+2 more)

### Community 46 - "Premium Gate"
Cohesion: 0.18
Nodes (9): { currentUser }, PremiumGateProps, { t }, FeatureCardProps, insets, { overdueReminders, upcomingReminders }, { t }, { totalThisMonth } (+1 more)

### Community 47 - "Social Data Models"
Cohesion: 0.18
Nodes (10): CatEvent, Conversation, EventAttendee, Follow, PostComment, PostLike, SAMPLE_EVENTS, SAMPLE_POSTS (+2 more)

### Community 48 - "User Profile"
Cohesion: 0.18
Nodes (10): Post, { currentUser, isAuthenticated }, followersCount, following, followingCount, handleFollow(), handleMessage(), { posts, followUser, isFollowing, getFollowersCount, getFollowingCount } (+2 more)

### Community 49 - "Toyger Breed Image"
Cohesion: 0.22
Nodes (11): Toyger, Medium Muscular Body Type, Orange and Black Coat Coloration, Tiger-Striped Coat Pattern, Domestic Cat Breed, Small Rounded Ears, Bright Green Eyes, Broad Rounded Face with Strong Jaw (+3 more)

### Community 50 - "Savannah Breed Image"
Cohesion: 0.27
Nodes (10): Savannah Cat Breed, Savannah Long Lean Athletic Body Type, Savannah Tawny Brown Black Spot Coloring, Savannah Green-Gold Eyes, Savannah Long Slender Legs, Savannah Medium Length Banded Tail, Savannah Small Triangular Head Relative to Body, Savannah Bold Spotted Tabby Coat Pattern (+2 more)

### Community 51 - "App Providers & Config"
Cohesion: 0.25
Nodes (6): queryClient, rcKey, RevenueCatSyncWrapper(), RootLayoutNav(), useRevenueCatSync(), SubscriptionTier

### Community 52 - "Weight Chart Screen"
Cohesion: 0.22
Nodes (8): cat, { catId }, { cats }, maxWeight, minWeight, navigation, onAddWeight, weights

### Community 53 - "Splash Screen Brand"
Cohesion: 0.33
Nodes (9): Purrly App, Background Color: Off-White / Warm Cream, Brand Color: Orange (#D4782A approx.), Cat / Feline Theme, Expo / React Native App, iOS Status Bar (22:06, signal, battery), Purrly Logo (cat-ear stylized 'p'), Boot / Splash Screen (+1 more)

### Community 54 - "Thumbnail Marketing"
Cohesion: 0.36
Nodes (9): Cat or Pet-Focused Mobile App Category, Warm Cream Background with Flowing Wave Shapes, Purrly - App Brand Name, Warm Peach and Orange Color Palette, App Thumbnail - Purrly Brand Marketing Image, Purrly Logo Icon - Orange Cat Face with Stylized P, Illustrated Happy Cat Mascot - Bottom Right, Decorative Orange Paw Print Motifs (+1 more)

### Community 55 - "Asian/Birman Breed Image"
Cohesion: 0.33
Nodes (9): Asian Cat Breed – Ragdoll/Birman (Seal Colorpoint, Blue Eyes, Semi-longhair), Asian Cat Breed Group – Southeast/South Asian domestic cat breeds, Birman Cat Breed, Blue Eyes – striking vivid blue eye color, Broad Rounded Head – wide skull, full cheeks, medium-sized ears, Ragdoll Cat Breed, Seal Colorpoint Coat Pattern – dark seal brown points on face, ears; cream/white body, Semi-longhair Coat – plush, silky, medium-long fur with chest ruff (+1 more)

### Community 56 - "Ocicat Breed Image"
Cohesion: 0.28
Nodes (9): Ocicat, Athletic Medium-Large Body, Well-Muscled Build, Tawny/Cinnamon Spotted Tabby Coat, Large Almond-Shaped Amber-Gold Eyes, Wedge-Shaped Head with Prominent Whisker Pads and Large Ears, Short, Tight, Satiny Coat with Slight Sheen, Distinct Dark Spots on Golden-Tan Ground Color, Medium-Length Tapering Tail (+1 more)

### Community 57 - "Error Boundary"
Cohesion: 0.25
Nodes (4): ErrorBoundary, Props, State, { t }

### Community 58 - "FAQ Screen"
Cohesion: 0.25
Nodes (6): FaqItem, faqItems, filteredItems, handleContactSupport, [searchQuery, setSearchQuery], { t }

### Community 59 - "Shelters Directory"
Cohesion: 0.38
Nodes (4): DIRECTORIES, Directory, Shelter, SHELTERS

### Community 60 - "Cats Context Models"
Cohesion: 0.29
Nodes (6): CatPhoto, [CatsContext, useCats], DailyLog, FeedingSchedule, MedicalRecord, WeightEntry

### Community 61 - "First Aid Guides"
Cohesion: 0.29
Nodes (5): EMERGENCY_GUIDES, EmergencyGuide, [expandedId, setExpandedId], insets, SEVERITY_INFO

### Community 62 - "Cats List Screen"
Cohesion: 0.29
Nodes (6): { cats }, insets, onAddCat, onOpenCat, { t }, { width: INITIAL_WIDTH }

### Community 63 - "Brand Logo Adaptive Icon"
Cohesion: 0.38
Nodes (7): Purrly Brand Identity, Cream/Off-White Background Color, Orange Brand Color (#E8863A-like warm orange), Cat Ears Logo Element, Stylised Letter P Logo Element, Purrly App Icon, Purrly Wordmark (lowercase sans-serif)

### Community 64 - "Splash Icon"
Cohesion: 0.38
Nodes (7): Purrly Splash Screen Icon, Purrly Brand Identity, Cream/Off-White Background Color, Warm Orange Brand Color (#E8833A approx), Cat-Ear P Logomark, Cat / Feline Theme, Purrly Wordmark Typography

### Community 65 - "Russian Blue Breed Image"
Cohesion: 0.38
Nodes (7): Cat Breed, Russian Blue, Semi-Foreign Body Type — Slender, Muscular, Long-Legged, Blue-Grey Double Coat (Slate Blue with Silver Sheen), Large Wide-Set Pointed Ears, Vivid Green Almond-Shaped Eyes, Wedge-Shaped Head with Prominent Whisker Pads (Smiling Expression)

### Community 66 - "Save Callbacks"
Cohesion: 0.33
Nodes (5): onSave(), onSave(), onSave(), onSave(), generateUUID()

### Community 67 - "Toast Component"
Cohesion: 0.33
Nodes (3): timer, ToastProps, ToastType

### Community 69 - "Logo Asset"
Cohesion: 0.47
Nodes (6): Purrly App Logo, Purrly, Cat Face / Cat Ears Design Motif, Warm Orange on Cream Color Scheme, Stylized Cat-P Lettermark, Purrly Wordmark Typography

### Community 70 - "Cat Detail Actions"
Cohesion: 0.4
Nodes (5): onAddDailyLog(), onAddWeight(), onViewDailyLogs(), onViewWeightChart(), navigateWithParams()

### Community 71 - "Auth Context & User"
Cohesion: 0.4
Nodes (3): [AuthProvider, useAuth], User, VIP_EMAILS

### Community 72 - "Favicon Icon"
Cohesion: 0.5
Nodes (5): Bear / Animal Face Icon Element, Light Orange / Amber Icon Color, Beige / Tan Background Color, Favicon / App Icon, Minimal Rounded Mobile App Icon Style

### Community 73 - "Purrly Brand Mark"
Cohesion: 0.6
Nodes (5): Purrly Brand Identity, Cat / Feline Theme, Warm Orange on Off-White Color Palette, Purrly Logo - Cat Ear P Lettermark, Purrly App Icon (60x60@2x)

### Community 74 - "ESLint Config"
Cohesion: 0.5
Nodes (3): { defineConfig }, expoConfig, ignores

### Community 75 - "Metro Config"
Cohesion: 0.5
Nodes (3): config, { getDefaultConfig }, { withRorkMetro }

### Community 76 - "Emergency Context"
Cohesion: 0.5
Nodes (3): EmergencyAlert, [EmergencyContext, useEmergency], EmergencyType

## Ambiguous Edges - Review These
- `Asian Cat Breed – Ragdoll/Birman (Seal Colorpoint, Blue Eyes, Semi-longhair)` → `Asian Cat Breed Group – Southeast/South Asian domestic cat breeds`  [AMBIGUOUS]
  expo/assets/images/breeds/asian.png · relation: references

## Knowledge Gaps
- **726 isolated node(s):** `{ defineConfig }`, `expoConfig`, `ignores`, `{ getDefaultConfig }`, `{ withRorkMetro }` (+721 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Asian Cat Breed – Ragdoll/Birman (Seal Colorpoint, Blue Eyes, Semi-longhair)` and `Asian Cat Breed Group – Southeast/South Asian domestic cat breeds`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `Colors` connect `Layout Components` to `Breed Discovery & Breeders`, `AI Behavior Analysis`, `Home & Onboarding Flow`, `Gamification System`, `Map & Location Features`, `Reminders System`, `Expense Tracking`, `Emergency Alerts Geo`, `AI Assistant Chat`, `Shopping List`, `Signup Screen`, `Subscription Paywall`, `Community Events`, `Community Posts`, `Community Feed`, `Login Screen`, `Camera Scanner`, `Notifications & Account`, `Scan Image State`, `Event Detail`, `Direct Messages`, `Post Comments`, `Food Calculator`, `Premium Gate`, `User Profile`, `FAQ Screen`, `First Aid Guides`, `Cats List Screen`, `Toast Component`, `Skeleton Loaders`, `Button Component`, `Card Component`, `About Screen`, `Travel Checklist`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Why does `data` connect `Tab Navigation & App Shell` to `Breed Discovery & Breeders`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `navigate()` connect `Login Screen` to `Breed Discovery & Breeders`, `Gamification System`, `Discussions & Chat`, `Reminders System`, `Expense Tracking`, `Daily Health Logging`, `Emergency Alerts Geo`, `Health Records`, `Signup Screen`, `Daily Logs Analytics`, `Subscription Paywall`, `Weight Tracking`, `Community Feed`, `Camera Scanner`, `Notifications & Account`, `Scan Image State`, `Event Detail`, `Post Comments`, `Paywall Component`, `Cat Detail View`, `Premium Gate`, `User Profile`, `Weight Chart Screen`, `Cats List Screen`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **What connects `{ defineConfig }`, `expoConfig`, `ignores` to the rest of the system?**
  _726 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Tab Navigation & App Shell` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Breed Discovery & Breeders` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._