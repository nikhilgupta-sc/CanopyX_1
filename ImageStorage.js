import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, deleteDoc } from 'firebase/firestore';
import { setLogLevel } from 'firebase/firestore';

// Environment Global Variables
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const apiKey = ""; // API key is provided by the environment

// Image Generation Model Details
const IMAGE_GENERATION_MODEL = 'imagen-4.0-generate-001';

// --- INLINE SVG ICONS (Replaces lucide-react) ---
const RefreshCcw = ({ size = 24, className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.76 2.76L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9 0 0 0 6.76-2.76L21 16" /><path d="M21 21v-5h-5" /></svg>);
const Leaf = ({ size = 24, className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 16 11.6 15.5 14c-.6 2.3-3.6 5.5-5.8 5.9-1.4.3-2.5-.4-2.8-1.7C5.8 17.5 7 13.5 11 20z" /><path d="M2 21c3.5-3 6-5.5 11.5-6" /></svg>);
const Droplet = ({ size = 24, className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>);
const Snowflake = ({ size = 24, className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="2" x2="22" y1="12" y2="12" /><line x1="12" x2="12" y1="2" y2="22" /><path d="m20 16-8-4-8 4" /><path d="m4 8 8 4 8-4" /><path d="m16 4-4 8-4-8" /><path d="m8 20 4-8 4 8" /></svg>);
const Sun = ({ size = 24, className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M22 12h-2" /><path d="M4 12H2" /><path d="M18.36 5.64l-1.48 1.48" /><path d="M6.07 17.93l-1.48 1.48" /><path d="M17.93 17.93l1.48 1.48" /><path d="M5.64 5.64l1.48 1.48" /></svg>);
const Flame = ({ size = 24, className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.24.7-2.65 1.7-3.66 1.48-1.6 4.5-1.9 4.5-1.9H12s-3.5 1.5-3.5 3c0 1.25.9 2.5 2 3.5.5.5 1 1.2 1.5 2-.45.92-1.4 1.5-2.5 1.5z" /><path d="M22 21.5-14-14" /></svg>);
const Zap = ({ size = 24, className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>);
const Star = ({ size = 24, className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
const X = ({ size = 24, className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>);
const Database = ({ size = 24, className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>);
const Loader = ({ size = 24, className = '' }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`animate-spin ${className}`}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>);
// --- END INLINE SVG ICONS ---

// Fallback Placeholder SVG
const PLACEHOLDER_IMG_BASE64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5NjAiIGhlaWdodD0iNTQwIiB2aWV3Qm94PSIwIDAgOTYwIDU0MCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzk5OTk5OSIgLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiNmZmYiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkhpdCBHZW5lcmF0ZTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjY1JSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmYiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkF1dG9tYXRpY2FsbHkgR2VuZXJhdGluZyBWaXN1YWw8L3RleHQ+PC9zdmc+";

const PLACES = [
  { id: 'amazon', name: 'Amazon Rainforest', Icon: Leaf, color: 'text-green-600' },
  { id: 'gbr', name: 'Great Barrier Reef', Icon: Droplet, color: 'text-cyan-500' },
  { id: 'arctic', name: 'Arctic Sea Ice', Icon: Snowflake, color: 'text-sky-400' },
  { id: 'maldives', name: 'The Maldives', Icon: Sun, color: 'text-yellow-500' },
  { id: 'yosemite', name: 'Yosemite, CA', Icon: Flame, color: 'text-orange-500' }, 
];

const YEARS = [5, 10, 25, 50, 100];

// --- SCENARIOS data (abbreviated) ---
const SCENARIOS = {
    amazon: {
        5: { description: "In just 5 years, the Amazon begins to face increased fragmentation due to illegal logging and agricultural roads...", bubbles: [{ x: 30, y: 40, title: "Canopy Thinning", text: "Trees at the newly formed edges lose moisture...", Icon: RefreshCcw },] },
        10: { description: "Agricultural expansion and cattle ranching have pushed deeper into the forest, leading to severe drought and fire risk.", bubbles: [{ x: 50, y: 50, title: "Road Expansion", text: "New unpaved roads open up previously inaccessible forest...", Icon: Zap },] },
        25: { description: "The 'Tipping Point' is within sight. Global heating and local deforestation cause rainfall patterns to dramatically disrupt, leaving large areas as dry shrubland.", bubbles: [{ x: 20, y: 60, title: "Dry Riverbeds", text: "Small tributaries and streams begin to dry up...", Icon: Zap },] },
        50: { description: "Savannization is now the dominant feature. Large, contiguous swathes of the rainforest have converted to semi-arid scrubland, with fire being a constant threat.", bubbles: [{ x: 40, y: 40, title: "Canopy Collapse", text: "Drought-intolerant hardwood trees die off...", Icon: RefreshCcw },] },
        100: { description: "The ecosystem has changed fundamentally. The Amazon rainforest is reduced to isolated pockets (refugia) surrounded by desert, with few native species remaining.", bubbles: [{ x: 50, y: 50, title: "Scrubland", text: "The former forest floor is now dominated by dry dirt...", Icon: RefreshCcw },] },
    },
    gbr: {
        5: { description: "Marine heatwaves cause frequent, sporadic coral bleaching events. While some corals recover, others die, leaving large sections patchy and brittle.", bubbles: [{ x: 40, y: 60, title: "Pale Tips", text: "Coral tips turn white...", Icon: Sun },] },
        10: { description: "Bleaching events now occur every two to three years, giving the coral insufficient time to fully recover, with large parts of the reef visibly dead and gray.", bubbles: [{ x: 20, y: 40, title: "Ghost Coral", text: "Large, visible colonies turn stark white...", Icon: Zap },] },
        25: { description: "Widespread structural collapse is evident across the central and northern sectors, turning once vibrant reef structures into fields of sand and rubble.", bubbles: [{ x: 60, y: 70, title: "Coral Rubble", text: "Dead coral breaks down into sand...", Icon: RefreshCcw },] },
        50: { description: "Algae and slime now dominate. Without living coral to compete, slimy green and brown turf algae smother the remaining reef structure, creating a dull, lifeless seafloor.", bubbles: [{ x: 50, y: 50, title: "Algal Bloom", text: "Thick mats of algae cover the remaining dead...", Icon: Leaf },] },
        100: { description: "A relic ecosystem. The Great Barrier Reef, as a massive, complex biological structure, has effectively ceased to exist, replaced by deep, muddy water.", bubbles: [{ x: 30, y: 30, title: "Empty Waters", text: "Fish populations plummet...", Icon: Zap },] },
    },
    arctic: {
        5: { description: "The Arctic ice pack sees a sharp decline in multi-year ice, replaced by thinner, younger ice that melts easily, with large pools of meltwater visible everywhere.", bubbles: [{ x: 20, y: 70, title: "Melt Ponds", text: "Pools of dark blue water form on top of the ice...", Icon: Sun },] },
        10: { description: "Summer sea ice extent hits record lows almost every year. Polar bears, seals, and walruses are negatively impacted, forced to congregate on diminishing ice floes or land.", bubbles: [{ x: 60, y: 50, title: "Land Migration", text: "Animals dependent on the sea ice are seen scavenging...", Icon: Zap },] },
        25: { description: "Seasonal 'Blue Ocean Events' begin to occur regularly. The Arctic Ocean is functionally ice-free for several weeks during the summer, revealing dark, open water.", bubbles: [{ x: 50, y: 50, title: "Open Water", text: "Vast expanses of dark ocean water replace white ice...", Icon: RefreshCcw },] },
        50: { description: "The surrounding permafrost thaws rapidly, destabilizing coastlines and releasing enormous quantities of methane, causing large coastal slumps.", bubbles: [{ x: 80, y: 60, title: "Coastal Erosion", text: "Shorelines collapse into the sea...", Icon: Zap },] },
        100: { description: "A permanently altered North Pole. The Arctic has become a new, seasonal ocean, resembling a cold, northern sea for much of the year, covered by only thin ice in winter.", bubbles: [{ x: 50, y: 50, title: "New Ecosystem", text: "Temperate marine species migrate north...", Icon: RefreshCcw },] },
    },
    maldives: {
        5: { description: "Increased sea level rise means that king tides cause nuisance flooding in low-lying streets and coastal roads, temporarily halting transit.", bubbles: [{ x: 20, y: 80, title: "Street Flooding", text: "High tides push water through storm drains...", Icon: Droplet },] },
        10: { description: "Beach and coastline erosion accelerates dramatically, becoming a major economic crisis, with sea defenses constantly required but failing.", bubbles: [{ x: 70, y: 60, title: "Eroded Palms", text: "Coconut palms lean precariously or fall...", Icon: Zap },] },
        25: { description: "A nationwide freshwater crisis hits as the groundwater is largely contaminated by saltwater intrusion, destroying wells and making agriculture impossible.", bubbles: [{ x: 40, y: 50, title: "Dead Gardens", text: "Local, salt-intolerant vegetation dies off...", Icon: RefreshCcw },] },
        50: { description: "Mass abandonment begins. Lower-lying, outer-lying islands are deemed uninhabitable due to chronic flooding, forcing relocation to higher, protected islands.", bubbles: [{ x: 50, y: 70, title: "Submerged Infrastructure", text: "Old jetties, docks, and walkways are permanently underwater...", Icon: Droplet },] },
        100: { description: "The archipelago is functionally lost. Most natural islands are submerged reefs, with only a few artificial, high-rise islands remaining as the last habitat.", bubbles: [{ x: 50, y: 50, title: "Underwater Ruins", text: "Remnants of former homes and buildings...", Icon: Zap },] },
    },
    yosemite: {
        5: { description: "Multi-year drought conditions have stressed the iconic pine forests, making them highly susceptible to bark beetle infestations and early die-off.", bubbles: [{ x: 30, y: 40, title: "Brown Needles", text: "Dying pine trees turn rust-red...", Icon: Leaf },] },
        10: { description: "Mega-fire impact becomes the defining ecological event. Scars from massive, high-intensity fires leave entire valleys charred, with little chance of tree recovery.", bubbles: [{ x: 50, y: 50, title: "Charred Trunks", text: "Blackened tree skeletons stand...", Icon: Flame },] },
        25: { description: "Forest retreat accelerates. Conifer forests, unable to withstand the chronic heat and drought, migrate to higher elevations, leaving the valley floor bare.", bubbles: [{ x: 70, y: 70, title: "Shrub Invasion", text: "Low-lying chaparral bushes replace the majestic Ponderosa...", Icon: RefreshCcw },] },
        50: { description: "The vital winter snowpack disappears almost completely. Without this natural, slow-release reservoir, the famous waterfalls dry up by mid-summer.", bubbles: [{ x: 50, y: 30, title: "Dry Cliffside", text: "The famous waterfalls are reduced to a seasonal trickle...", Icon: Droplet },] },
        100: { description: "A high-desert landscape is established. The lush, verdant Yosemite of the 20th century is gone, replaced by dry, cracked granite and sparse, low-lying shrubs.", bubbles: [{ x: 50, y: 50, title: "Arid Rock", text: "Exposed granite dominates...", Icon: Sun },] },
    },
};

// --- REACT COMPONENTS ---

const TimelinePoint = ({ year, index, activeIndex, onSelect }) => (
  <div className="flex flex-col items-center w-1/5 relative z-10">
    <button 
      onClick={() => onSelect(index)}
      className={`
        w-6 h-6 rounded-full border-4 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2
        ${index <= activeIndex 
          ? 'bg-red-600 border-red-800 focus:ring-red-400' 
          : 'bg-white border-gray-300 hover:border-red-400 focus:ring-gray-300'}
        ${activeIndex === index ? 'scale-125 shadow-lg' : 'hover:scale-110'}
      `}
      aria-label={`Select year +${year}`}
    />
    <span className={`text-sm mt-3 whitespace-nowrap transition-colors duration-300
      ${activeIndex === index ? 'font-extrabold text-red-700' : 'text-gray-600 font-medium'}
    `}>
      +{year}
    </span>
  </div>
);

const PlaceCard = ({ place, selectedId, onSelect }) => (
  <button
    onClick={() => onSelect(place.id)}
    className={`
      flex flex-col items-center p-3 rounded-xl transition-all duration-300 shadow-md min-w-[140px] mx-1.5 md:mx-2 focus:outline-none
      ${selectedId === place.id 
        ? 'bg-red-600 border-2 border-red-800 shadow-xl shadow-red-300/50 transform scale-[1.02]' 
        : 'bg-white border border-gray-200 hover:bg-gray-50 hover:shadow-lg'}
    `}
  >
    <div className={`p-2 rounded-full mb-2 transition-colors duration-300
      ${selectedId === place.id ? 'bg-white' : 'bg-gray-100'}
    `}>
      <place.Icon size={24} className={selectedId === place.id ? 'text-red-600' : place.color} />
    </div>
    <span className={`text-sm font-semibold text-center leading-tight transition-colors duration-300
      ${selectedId === place.id ? 'text-white' : 'text-gray-800'}
    `}>
      {place.name}
    </span>
  </button>
);

const HotspotBubble = ({ bubble, index, activeBubble, setActiveBubble }) => {
  const isActive = activeBubble === index;
  
  const style = {
    top: `${bubble.y}%`,
    left: `${bubble.x}%`,
  };

  return (
    <div 
      className="absolute z-20" 
      style={style}
    >
      <button
        onClick={() => setActiveBubble(isActive ? null : index)}
        className={`
          relative w-7 h-7 rounded-full border-3 transition-all duration-300 flex items-center justify-center 
          ${isActive 
            ? 'bg-blue-600 border-blue-800 scale-125 shadow-xl ring-4 ring-blue-300 animate-pulse' 
            : 'bg-white/70 border-blue-500 hover:scale-110 hover:bg-white'}
          focus:outline-none
        `}
      >
        <bubble.Icon size={16} className={isActive ? 'text-white' : 'text-blue-600'} />
      </button>

      {/* Tooltip */}
      {isActive && (
        <div 
          className="absolute p-4 rounded-xl bg-gray-900 text-white shadow-2xl min-w-[250px] max-w-xs z-30 opacity-95 transition-opacity duration-300 border-t-4 border-blue-500"
          style={{
            transform: `translate(${bubble.x > 50 ? '-100% -50%' : '20px -50%'})`,
            [bubble.x > 50 ? 'right' : 'left']: bubble.x > 50 ? '10px' : '0px',
            top: '50%',
          }}
        >
          <p className="font-bold text-base mb-1 text-blue-300 flex items-center">
            <Zap size={16} className="mr-2" />{bubble.title}
          </p>
          <p className="text-sm">{bubble.text}</p>
        </div>
      )}
    </div>
  );
};

export default function ImageGeneratorApp() {
  const [selectedPlaceId, setSelectedPlaceId] = useState('amazon');
  const [yearIndex, setYearIndex] = useState(0); 
  const [activeBubble, setActiveBubble] = useState(null);
  
  // State for Dynamic Image Generation & Display
  const [currentImageBase64, setCurrentImageBase64] = useState(PLACEHOLDER_IMG_BASE64);
  const [isGenerating, setIsGenerating] = useState(false);

  // Firestore States
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [message, setMessage] = useState('Welcome! Select a scenario to automatically load or generate its visualization.');

  const currentYear = YEARS[yearIndex];
  const scenarioKey = `${selectedPlaceId}_${currentYear}`;
  const currentScenario = SCENARIOS[selectedPlaceId][currentYear];
  const currentPlaceName = PLACES.find(p => p.id === selectedPlaceId)?.name || 'Region';
  
  // --- API CALL UTILITY: Exponential Backoff Retry Logic ---
  const fetchWithRetry = useCallback(async (url, options, maxRetries = 3) => {
    let lastError = null;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        } catch (error) {
            lastError = error;
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError;
  }, []);

  // --- FIRESTORE ACTION: Save Generated Image (runs automatically) ---
  const saveGeneratedScenario = async (generatedBase64) => {
    if (!db || !userId || !generatedBase64 || generatedBase64 === PLACEHOLDER_IMG_BASE64) {
      console.error("Cannot save: DB/User/Image not ready.");
      return;
    }

    try {
        const docRef = doc(db, `artifacts/${appId}/users/${userId}/bookmarkedScenarios`, scenarioKey);
        
        await setDoc(docRef, {
            scenarioKey: scenarioKey,
            placeId: selectedPlaceId,
            year: currentYear,
            placeName: currentPlaceName,
            timestamp: Date.now(),
            imageData: generatedBase64, 
        });
        setMessage(`Visualization for "${currentPlaceName} +${currentYear}" successfully generated and saved to your bookmarks!`);
    } catch (error) {
        console.error("Error saving scenario:", error);
        setMessage("Error saving generated image. Check console for details.");
    }
  };


  // --- IMAGE GENERATION FUNCTION (Wrapped in useCallback) ---
  const autoGenerateAndSaveImage = useCallback(async () => {
    if (!db || !userId) return;

    setIsGenerating(true);
    setCurrentImageBase64(PLACEHOLDER_IMG_BASE64);
    setMessage(`Generating cinematic visualization for ${currentPlaceName} in +${currentYear} years...`);
    setActiveBubble(null);

    const prompt = `Generate a photorealistic, cinematic wide-shot image of the ${currentPlaceName} in the year +${currentYear} with the following severe environmental conditions: "${currentScenario.description}". Use a dramatic, dystopian, and high-contrast art style. Focus on the environmental damage and change.`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_GENERATION_MODEL}:predict?key=${apiKey}`;
    const payload = { 
        instances: { prompt: prompt }, 
        parameters: { 
            sampleCount: 1, 
            aspectRatio: '16:9' 
        } 
    };

    try {
        const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        const base64Data = result?.predictions?.[0]?.bytesBase64Encoded;

        if (base64Data) {
            const finalImage = `data:image/png;base64,${base64Data}`;
            setCurrentImageBase64(finalImage);
            // Automatically save the image upon successful generation
            await saveGeneratedScenario(finalImage); 
        } else {
            console.error("API response missing image data:", result);
            setMessage("Image generation failed. Please try again or select another scenario.");
            setCurrentImageBase64(PLACEHOLDER_IMG_BASE64); // Reset to generic placeholder on failure
        }
    } catch (error) {
        console.error("Fetch or API error during image generation:", error);
        setMessage("A network error occurred. Please check your connection or try again later.");
        setCurrentImageBase64(PLACEHOLDER_IMG_BASE64); // Reset on error
    } finally {
        setIsGenerating(false);
    }
  }, [fetchWithRetry, currentPlaceName, currentYear, currentScenario.description, db, userId, scenarioKey, appId, selectedPlaceId]);


  // --- 1. FIREBASE INITIALIZATION AND AUTHENTICATION ---
  useEffect(() => {
    if (!firebaseConfig) {
      console.error("Firebase config is missing.");
      return;
    }
    setLogLevel('Debug');
    
    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);
      setDb(firestore);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          // Fallback to anonymous sign-in if token is missing
          if (initialAuthToken) {
            signInWithCustomToken(firebaseAuth, initialAuthToken)
              .then(userCredential => setUserId(userCredential.user.uid))
              .catch(error => {
                console.error("Custom token sign-in failed:", error);
                signInAnonymously(firebaseAuth)
                  .then(userCredential => setUserId(userCredential.user.uid))
                  .catch(e => console.error("Anonymous sign-in failed:", e));
              });
          } else {
            signInAnonymously(firebaseAuth)
              .then(userCredential => setUserId(userCredential.user.uid))
              .catch(e => console.error("Anonymous sign-in failed:", e));
          }
        }
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Firebase initialization failed:", e);
    }
  }, []);
  
  // --- 2. FIRESTORE DATA LISTENER (Bookmarks) ---
  useEffect(() => {
    if (!isAuthReady || !db || !userId) return;

    const bookmarksCollectionPath = `artifacts/${appId}/users/${userId}/bookmarkedScenarios`;
    const q = collection(db, bookmarksCollectionPath);
    
    // Listen for real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const savedScenarios = [];
      snapshot.forEach((doc) => {
        savedScenarios.push({ id: doc.id, ...doc.data() });
      });
      setBookmarks(savedScenarios);
    }, (error) => {
        console.error("Error listening to bookmarks:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, db, userId]);

  // --- 3. SCENARIO/IMAGE SELECTION LOGIC (Auto-Generation Trigger) ---
  useEffect(() => {
    if (!isAuthReady || !db || !userId) return;

    const bookmarkedScenario = bookmarks.find(b => b.scenarioKey === scenarioKey);

    if (bookmarkedScenario) {
        // SCENARIO 1: Bookmarked -> Load saved image from Firestore
        setCurrentImageBase64(bookmarkedScenario.imageData);
        setMessage(`Loaded saved image for ${currentPlaceName} +${currentYear} from your bookmarks.`);
    } else {
        // SCENARIO 2: Not Bookmarked -> Auto-Generate and Save
        if (!isGenerating) {
            autoGenerateAndSaveImage();
        }
    }
    setActiveBubble(null);

    // Dependencies carefully managed to prevent infinite loop. autoGenerateAndSaveImage is memoized.
  }, [selectedPlaceId, yearIndex, bookmarks, scenarioKey, currentPlaceName, currentYear, isAuthReady, db, userId, isGenerating, autoGenerateAndSaveImage]);


  // --- 4. FIRESTORE ACTIONS (Only removal remains manual) ---
  const removeScenario = async (key) => {
    if (!db || !userId) return;

    try {
        const docRef = doc(db, `artifacts/${appId}/users/${userId}/bookmarkedScenarios`, key);
        await deleteDoc(docRef);
        setMessage(`Bookmark for ${key} removed.`);
    } catch (error) {
        console.error("Error removing scenario:", error);
        setMessage("Error removing bookmark.");
    }
  };

  const handleBookmarkClick = (key) => {
      const bookmark = bookmarks.find(b => b.id === key);
      if (bookmark) {
          const newPlace = PLACES.find(p => p.id === bookmark.placeId);
          const newYearIndex = YEARS.indexOf(bookmark.year);
          if (newPlace && newYearIndex !== -1) {
              setSelectedPlaceId(newPlace.id);
              setYearIndex(newYearIndex);
              setActiveBubble(null);
          }
      }
  }

  // Utility functions
  const handlePlaceSelect = (id) => {
    setSelectedPlaceId(id);
  };

  const handleYearChange = (index) => {
    setYearIndex(index);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-inter">
      
      {/* Container for content */}
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-8 border-t-8 border-red-600">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Future World Visualizer</h1>
          <p className="text-lg text-gray-500 mt-2 font-medium">AI-powered generation and persistent storage for climate-impacted future scenarios.</p>
          <div className="text-xs mt-3 text-gray-400">
             User ID: {userId || 'Authenticating...'}
          </div>
        </header>

        {/* System Message Box */}
        {message && (
             <div className="p-3 mb-6 rounded-lg bg-indigo-100 border-l-4 border-indigo-500 text-indigo-800 font-semibold shadow-md flex justify-between items-center">
                <span>{message}</span>
                <button onClick={() => setMessage('')} className="text-indigo-600 hover:text-indigo-900 rounded-full p-1"><X size={18} /></button>
            </div>
        )}

        {/* 1. TOP SLIDER: Places */}
        <div className="mb-10 p-4 bg-white rounded-xl shadow-lg">
          <h2 className="text-lg font-bold uppercase text-gray-700 mb-4 tracking-wider border-b pb-2">
            Select a Region
          </h2>
          <div className="flex overflow-x-auto pb-3 -mx-2 px-2 space-x-3 md:space-x-5 scrollbar-hide">
            {PLACES.map((place) => (
              <PlaceCard 
                key={place.id}
                place={place}
                selectedId={selectedPlaceId}
                onSelect={handlePlaceSelect}
              />
            ))}
          </div>
        </div>

        {/* Current State Indicator */}
        <div className="flex justify-between items-center gap-4 mb-6 p-4 bg-white rounded-xl shadow-md border-b-2 border-gray-200">
          <div className="text-xl md:text-3xl font-extrabold text-gray-800">
            <span className="text-red-600">{currentPlaceName}</span>: Projection <span className="text-red-600">+{currentYear} Years</span>
          </div>
        </div>

        {/* 2. MIDDLE: Image & Bubbles */}
        <div className="relative w-full aspect-video rounded-2xl shadow-2xl overflow-hidden bg-gray-300 mb-4 border-4 border-gray-400">
          {isGenerating ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-white z-50">
                <Loader size={64} className="text-red-500 mb-4" />
                <p className="text-2xl font-bold">Visualizing the Future...</p>
                <p className="text-sm text-gray-400 mt-1">This image is being automatically generated and saved. Please wait.</p>
            </div>
          ) : (
            <>
              <img
                src={currentImageBase64}
                alt={`${selectedPlaceId} scenario at +${currentYear} years`}
                className="w-full h-full object-cover transition-opacity duration-500" 
              />
              {/* Interactive Hotspots */}
              {currentImageBase64 !== PLACEHOLDER_IMG_BASE64 && currentScenario.bubbles.map((bubble, index) => (
                <HotspotBubble
                  key={index}
                  bubble={bubble}
                  index={index}
                  activeBubble={activeBubble}
                  setActiveBubble={setActiveBubble}
                />
              ))}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900/70 text-white text-base font-medium z-10">
                 <p className="text-sm italic">{currentScenario.description}</p>
              </div>
            </>
          )}
        </div>
        
        {/* AI Citation (Point 3) */}
        <div className="mb-8 p-3 rounded-lg bg-gray-800 text-sm text-gray-300 shadow-xl border-l-4 border-red-500 flex items-center">
            <Zap size={18} className="mr-2 text-red-400" />
            Image generated by AI (Imagen 4.0). AI models may make conceptual mistakes or generate artifacts.
        </div>


        {/* 3. BOTTOM SLIDER: Years (Stepped Timeline) */}
        <div className="p-8 bg-white rounded-xl shadow-2xl mb-8 border-b-4 border-gray-300">
          <h2 className="text-lg font-bold uppercase text-gray-700 mb-6 tracking-wider">
            Projection Timeline
          </h2>
          <div className="relative flex justify-between items-center px-4">
            {/* Timeline Track Line */}
            <div className="absolute top-[27px] left-0 right-0 h-1 bg-gray-200 mx-4 -translate-y-1/2 z-0">
                {/* Active Progress Line */}
                <div 
                    className="h-full bg-red-500 transition-all duration-300 rounded-full" 
                    style={{ width: `${(yearIndex / (YEARS.length - 1)) * 100}%` }}
                />
            </div>

            {YEARS.map((year, index) => (
              <TimelinePoint
                key={year}
                year={year}
                index={index}
                activeIndex={yearIndex}
                onSelect={handleYearChange}
              />
            ))}
          </div>
        </div>
        
        {/* 4. BOOKMARKS / SAVED SCENARIOS (The persistent storage view) */}
        <div className="p-8 bg-white rounded-xl shadow-2xl border-l-8 border-blue-500">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Database size={24} className="mr-2 text-blue-500" />
            My Bookmarks (Loaded from Firestore)
          </h3>
          {isAuthReady && bookmarks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {bookmarks.sort((a,b) => b.timestamp - a.timestamp).map(b => (
                      <div key={b.id} className="relative bg-gray-50 p-3 rounded-lg shadow-md border border-gray-200 hover:bg-blue-50 transition-colors">
                          <button 
                              className="absolute top-1 right-1 p-1 text-gray-500 hover:text-red-500 rounded-full bg-white/70"
                              onClick={(e) => { e.stopPropagation(); removeScenario(b.id); }}
                          >
                            <X size={14} />
                          </button>
                          <button
                            className="w-full text-left"
                            onClick={() => handleBookmarkClick(b.id)}
                          >
                            <img 
                                // This loads the saved Base64 image directly from Firestore
                                src={b.imageData} 
                                alt={`Bookmark for ${b.placeName}`} 
                                className="w-full h-16 object-cover rounded-md mb-2 border border-gray-300"
                            />
                            <p className="font-semibold text-gray-800 text-sm">{b.placeName}</p>
                            <p className="text-xs text-red-600 font-bold">+{b.year} Years</p>
                          </button>
                      </div>
                  ))}
              </div>
          ) : isAuthReady ? (
              <p className="text-gray-500 italic">No bookmarks found. Select a scenario on the timeline to generate and save one automatically.</p>
          ) : (
              <p className="text-gray-500">Loading user data...</p>
          )}
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}