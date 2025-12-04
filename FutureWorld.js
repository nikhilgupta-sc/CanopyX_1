import React, { useState, useEffect, useCallback } from 'react';
// Note: Removed the lucide-react import to resolve the 'unable to resolve' error.
// The icons are now defined as inline SVG components below.

const API_KEY = ""; // Managed by the environment
const IMAGE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=" + API_KEY;

// --- INLINE SVG ICONS (Replaces lucide-react) ---
// Define each icon as a functional component that returns SVG markup
const RefreshCcw = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.76 2.76L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.76-2.76L21 16" /><path d="M21 21v-5h-5" />
  </svg>
);
const Leaf = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 16 11.6 15.5 14c-.6 2.3-3.6 5.5-5.8 5.9-1.4.3-2.5-.4-2.8-1.7C5.8 17.5 7 13.5 11 20z" /><path d="M2 21c3.5-3 6-5.5 11.5-6" />
  </svg>
);
const Droplet = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);
const Snowflake = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="2" x2="22" y1="12" y2="12" /><line x1="12" x2="12" y1="2" y2="22" /><path d="m20 16-8-4-8 4" /><path d="m4 8 8 4 8-4" /><path d="m16 4-4 8-4-8" /><path d="m8 20 4-8 4 8" />
  </svg>
);
const Sun = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M22 12h-2" /><path d="M4 12H2" /><path d="M18.36 5.64l-1.48 1.48" /><path d="M6.07 17.93l-1.48 1.48" /><path d="M17.93 17.93l1.48 1.48" /><path d="M5.64 5.64l1.48 1.48" />
  </svg>
);
const Flame = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.24.7-2.65 1.7-3.66 1.48-1.6 4.5-1.9 4.5-1.9H12s-3.5 1.5-3.5 3c0 1.25.9 2.5 2 3.5.5.5 1 1.2 1.5 2-.45.92-1.4 1.5-2.5 1.5z" /><path d="M22 21.5-14-14" />
  </svg>
);
const MessageSquare = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const AlertTriangle = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);
const Zap = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const CloudOff = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.61 10.21A5 5 0 0 0 18 6H9a5 5 0 0 0-3.8-1.58M3 3l18 18" /><path d="M7.5 17.16a5 5 0 0 0 6.64-6.32" />
  </svg>
);
const Loader2 = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
// --- END INLINE SVG ICONS ---


// --- CONFIGURATION ---
const PLACES = [
  { id: 'amazon', name: 'Amazon Rainforest', Icon: Leaf, color: 'text-green-600' },
  { id: 'gbr', name: 'Great Barrier Reef', Icon: Droplet, color: 'text-cyan-500' },
  { id: 'arctic', name: 'Arctic Sea Ice', Icon: Snowflake, color: 'text-sky-400' },
  { id: 'maldives', name: 'The Maldives', Icon: Sun, color: 'text-yellow-500' },
  { id: 'yosemite', name: 'Yosemite, CA', Icon: Flame, color: 'text-orange-500' }, 
];

const YEARS = [5, 10, 25, 50, 100];

// Detailed image generation prompts for all 25 scenarios (No change)
const IMAGE_PROMPTS = {
  amazon: {
    5: "Cinematic, realistic photo of a fragmenting Amazon Rainforest edge. Show subtle signs of stress: slightly dry leaves, a new dirt road cutting into the dense jungle. Deep green and brown tones. Professional aesthetic.",
    10: "Aerial shot showing the 'fishbone' pattern of deforestation in the Amazon. Clear cuts and newly converted pastureland contrasting sharply with the remaining, dense jungle. Desolate and alarming mood. High resolution.",
    25: "Photo of the Amazon during a severe drought. Riverbeds are exposed and dry. The canopy looks sparse and sickly yellow-green. Filtered light, high contrast, emphasizing dry heat and vulnerability.",
    50: "A view of 'Savannization' in the Amazon. The landscape is now dominated by dry, tall grasses and scattered, fire-resistant shrubs, with only small, isolated stands of the original rainforest in the background. Arid, orange-brown landscape. Realistic photo.",
    100: "Post-apocalyptic landscape of what was the Amazon. Vast, dry scrubland and dust, with enormous, dead, standing tree trunks forming silhouettes against a hot, dry sky. Remnants of life only in hidden gullies. High detail.",
  },
  gbr: {
    5: "Macro underwater photo of coral showing early bleaching signs. Some vibrant colors remain, but patches of white or pale, stressed coral tips are visible, signaling heat stress. Bright, clear water, professional marine photography style.",
    10: "Underwater scene of the Great Barrier Reef with extensive bleaching. Most large, complex branching corals are stark white or covered in algae. A few fish swim over the ghost-like structure. Eerie, pale cyan tones.",
    25: "Wide underwater shot showing the physical collapse of the coral reef structure. Piles of broken, dead coral rubble cover the ocean floor. The biodiversity is visibly lower. Murky, flat color palette. Realistic photo.",
    50: "Underwater view dominated by slimy green and brown turf algae smothering all the reef rock. The scene is green and brown, with very few vibrant colors. An algal-dominated ecosystem. High contrast.",
    100: "A deep blue ocean with only low-lying, scattered rubble remaining on the seafloor of the former reef. The complexity is gone. Very few fish, signifying a profound ecosystem loss. Cinematic style.",
  },
  arctic: {
    5: "Aerial shot of the Arctic sea ice showing numerous dark blue melt ponds pooling on the surface of the ice sheet. The surrounding ocean is dark, absorbing sunlight. High-contrast white and dark blue. Realistic satellite image style.",
    10: "Photo of a distressed polar bear standing on a small, fragmented piece of thin, first-year sea ice, looking out at vast open water. A sense of isolation and imminent danger. Cold, blue tones.",
    25: "Wide aerial view of the Arctic Ocean in late summer, showing a 'Blue Ocean Event'—vast expanses of dark, open water with almost no ice visible. Commercial ships are traversing the new open route. High resolution.",
    50: "Scene showing an Arctic coastline suffering from permafrost thaw and coastal erosion. Slumping, muddy banks collapsing into the cold ocean water. Evidence of methane bubbling up from the thawing ground. Moody light.",
    100: "A completely ice-free Arctic ocean in winter. The scene is dark, stormy, and cold, but the sea surface is water, not ice. Waves crash against shorelines, showcasing the permanent shift. Cinematic, hyper-realistic.",
  },
  maldives: {
    5: "Street-level view in the Maldives during a king tide. Saltwater is flowing through the streets, covering the ankles of people. Buildings are damp at the base. Subtle nuisance flooding. Realistic photo.",
    10: "Photo of a beautiful beach resort area in the Maldives, but with prominent, newly constructed concrete sea walls and sand pumping equipment trying to counteract severe beach erosion. The effort looks futile. Desperate mood.",
    25: "A scene focused on a desalination plant in the Maldives. Large concrete storage tanks dominate the foreground. The natural vegetation around the edges of the island is visibly dead due to saltwater intrusion. Arid look.",
    50: "Aerial view showing Maldivian populations consolidated on a few high-ground, fortified islands, while many smaller, outer-lying islands are visibly submerged or reduced to small sandbanks. Stark contrast between old and new.",
    100: "Underwater photo showing the submerged ruins of former buildings (homes, jetties) on a Maldivian atoll. The ocean has completely claimed the land. A haunting, blue-green underwater scene. Highly detailed.",
  },
  yosemite: {
    5: "A drought-stressed Yosemite landscape. A few iconic Ponderosa pines show large patches of brown, dying needles due to bark beetle infestation. The forest floor is dry and brittle. Warm, dry lighting.",
    10: "The Yosemite Valley filled with thick, orange-brown wildfire smoke, obscuring the view of El Capitan and Half Dome. The mood is oppressive and hazardous. Photojournalistic style.",
    25: "A scene showing forest retreat in Yosemite. The lower valley is turning into arid, rocky scrubland with oak and chaparral replacing the previously dense conifer forest. Visible signs of past high-intensity fires. Dry, pale colors.",
    50: "A close-up of Yosemite Falls in early summer, showing the cliffside completely dry or with only a tiny, faint trickle of water, contrasting with historical images. The riverbed below is rocky and exposed. High detail.",
    100: "A desertified Yosemite Valley. The grand rock features are visible, but the valley floor is now rocky, high-desert scrubland, completely transformed from a lush forest to an arid biome. Hot, extreme lighting.",
  },
};

// Scientific Explanations & Hotspot Data (Icon references updated to use inline SVGs)
const SCENARIOS = {
  amazon: {
    5: {
      description: "In just 5 years, the Amazon begins to face increased fragmentation due to illegal logging and agricultural roads. These roads create 'edge effects,' drying out the surrounding forest, making trees vulnerable to insect infestation and small, human-caused fires. The subtle changes are often only visible to experts, but the ecosystem is already under stress.",
      bubbles: [
        { x: 30, y: 40, title: "Canopy Thinning", text: "Trees at the newly formed edges lose moisture and shed leaves prematurely due to exposure.", Icon: CloudOff },
      ],
    },
    10: {
      description: "Agricultural expansion and cattle ranching have pushed deeper into the forest. The distinct 'fishbone' pattern of deforestation is now widely visible from satellite imagery as the forest is systematically cleared. This scale of loss significantly impacts the region's ability to recycle moisture, shortening the wet season.",
      bubbles: [
        { x: 50, y: 50, title: "Road Expansion", text: "New unpaved roads open up previously inaccessible forest to human activity and degradation.", Icon: Zap },
        { x: 75, y: 60, title: "Cattle Grazing", text: "Cleared land turns into pasture, which compacts soil and prevents forest regeneration.", Icon: RefreshCcw },
      ],
    },
    25: {
      description: "The 'Tipping Point' is within sight. Global heating and local deforestation cause rainfall patterns to dramatically disrupt, leading to exceptionally long dry seasons. The rainforest is struggling to generate its own moisture, placing deep-rooted trees under extreme mortality risk. The threat of large-scale wildfires becomes constant.",
      bubbles: [
        { x: 20, y: 60, title: "Dry Riverbeds", text: "Small tributaries and streams begin to dry up seasonally due to the lack of forest transpiration and reduced rainfall.", Icon: AlertTriangle },
        { x: 70, y: 30, title: "Fire Scars", text: "Evidence of understory fires that have weakened tree root systems and degraded overall forest resilience.", Icon: Flame },
      ],
    },
    50: {
      description: "Savannization is now the dominant feature. Large, contiguous swathes of the rainforest have converted to semi-arid scrubland and savanna. The dense, multi-layered canopy has been broken, replaced by grass and fire-resistant shrubs. The former carbon sink is now close to becoming a major carbon emitter.",
      bubbles: [
        { x: 40, y: 40, title: "Canopy Collapse", text: "Drought-intolerant hardwood trees die off, replaced by grass and low-density savanna foliage.", Icon: CloudOff },
        { x: 60, y: 70, title: "Flash Droughts", text: "Soil moisture is critically low, leading to rapid die-offs of remaining forest patches.", Icon: Droplet },
      ],
    },
    100: {
      description: "The ecosystem has changed fundamentally. The Amazon rainforest is reduced to isolated pockets (refugia) in the wettest regions, while the vast majority is now a dry savanna. This massive ecosystem change drastically reduces global carbon storage, acting as a powerful feedback loop that accelerates global warming further.",
      bubbles: [
        { x: 50, y: 50, title: "Scrubland", text: "The former forest floor is now dominated by dry dirt and hardy, drought-tolerant grasses.", Icon: RefreshCcw },
        { x: 30, y: 70, title: "Wildlife Loss", text: "Endemic species relying on the high canopy are extinct or functionally extinct.", Icon: AlertTriangle },
      ],
    },
  },
  gbr: {
    5: {
      description: "Marine heatwaves cause frequent, sporadic coral bleaching events. While some corals recover from mild events, the stress makes them extremely vulnerable to disease and impedes their growth. The overall reef structure remains intact, but the vibrant colors are starting to be replaced by patches of pale or sickly white coral.",
      bubbles: [
        { x: 40, y: 60, title: "Pale Tips", text: "Coral tips turn white as they expel symbiotic algae (zooxanthellae) due to heat stress.", Icon: Sun },
      ],
    },
    10: {
      description: "Bleaching events now occur every two to three years, giving the coral insufficient time to fully recover. The slow-growing, complex branching corals are the first to die, leading to a significant drop in biodiversity as their specialized habitats disappear. Overall reef health is declining rapidly.",
      bubbles: [
        { x: 20, y: 40, title: "Ghost Coral", text: "Large, visible colonies turn stark white during summer heat spikes, with mortality rates rising.", Icon: AlertTriangle },
        { x: 70, y: 55, title: "Weedy Coral", text: "Fast-growing, less complex species dominate the remaining living areas.", Icon: Zap },
      ],
    },
    25: {
      description: "Widespread structural collapse is evident across the central and northern sectors. The dead coral skeletons, which form the reef's structure, become weak and crumble, removing hiding places, nurseries, and feeding grounds for thousands of fish and invertebrate species. The reef profile flattens out, impacting coastal protection.",
      bubbles: [
        { x: 60, y: 70, title: "Coral Rubble", text: "Dead coral breaks down into sand and rubble, drastically reducing habitable space.", Icon: CloudOff },
        { x: 35, y: 75, title: "Ocean Acidification", text: "Corals struggle to build new calcium carbonate skeletons due to increasingly acidic waters.", Icon: Droplet },
      ],
    },
    50: {
      description: "Algae and slime now dominate. Without living coral to compete, slimy green and brown turf algae smother the remaining reef structure, turning the once vibrant colors to a murky, uniform green. The system has shifted from a coral-dominated ecosystem to an algal-dominated one, profoundly changing the food web.",
      bubbles: [
        { x: 50, y: 50, title: "Algal Bloom", text: "Thick mats of algae cover the remaining dead and dying rock structures.", Icon: Leaf },
        { x: 25, y: 30, title: "Herbivore Decline", text: "Grazing fish can't keep up with the rate of algal growth.", Icon: RefreshCcw },
      ],
    },
    100: {
      description: "A relic ecosystem. The Great Barrier Reef, as a massive, complex biological structure, has effectively ceased to exist. While some heat-resistant 'super corals' or small patches may survive in deep water or sheltered pockets, the once biodiverse ecosystem is replaced by scattered, low-complexity habitats. The fishing and tourism industries are gone.",
      bubbles: [
        { x: 30, y: 30, title: "Empty Waters", text: "Fish populations plummet as their complex nursery grounds disappear entirely.", Icon: AlertTriangle },
      ],
    },
  },
  arctic: {
    5: {
      description: "The Arctic ice pack sees a sharp decline in multi-year ice—the thick, old ice that survives multiple summers. The ice remaining is younger, thinner, and far more prone to melting completely. This is the period where visible changes accelerate rapidly due to the loss of reflective white surfaces.",
      bubbles: [
        { x: 20, y: 70, title: "Melt Ponds", text: "Pools of dark blue water form on top of the ice, significantly absorbing more heat from the sun.", Icon: Sun },
      ],
    },
    10: {
      description: "Summer sea ice extent hits record lows almost every year. Polar bears, seals, and walruses are negatively impacted, as they rely on the ice for hunting and resting. Polar bears are forced onto land for longer periods, leading to greater human-wildlife conflict and starvation.",
      bubbles: [
        { x: 60, y: 50, title: "Land Migration", text: "Animals dependent on the sea ice are seen scavenging on rocky shores for food.", Icon: AlertTriangle },
        { x: 40, y: 30, title: "Thinner Ice", text: "Ice sheets break up earlier in the spring, making travel treacherous.", Icon: Zap },
      ],
    },
    25: {
      description: "Seasonal 'Blue Ocean Events' begin to occur regularly. The Arctic Ocean is functionally ice-free for several weeks in September. This profound environmental shift opens up the region to new international shipping lanes and resource extraction, introducing significant pollution and geopolitical risk.",
      bubbles: [
        { x: 50, y: 50, title: "Open Water", text: "Vast expanses of dark ocean water replace white ice, accelerating global warming through increased heat absorption.", Icon: CloudOff },
      ],
    },
    50: {
      description: "The surrounding permafrost thaws rapidly, destabilizing coastlines and releasing enormous quantities of methane, a potent greenhouse gas, into the atmosphere. Coastal erosion becomes catastrophic, destroying indigenous villages and infrastructure as the lack of sea ice removes the natural wave buffer.",
      bubbles: [
        { x: 80, y: 60, title: "Coastal Erosion", text: "Shorelines collapse into the sea without the protective barrier of permanent ice.", Icon: AlertTriangle },
        { x: 15, y: 50, title: "Methane Release", text: "Bubbles of methane gas rise from thawing tundra and frozen lakes.", Icon: Zap },
      ],
    },
    100: {
      description: "A permanently altered North Pole. The Arctic has become a new, seasonal ocean. The disappearance of year-round ice has fundamentally changed ocean currents and weather patterns globally. Traditional indigenous ways of life dependent on ice hunting and stable environments are now impossible, forcing mass cultural displacement.",
      bubbles: [
        { x: 50, y: 50, title: "New Ecosystem", text: "Temperate marine species migrate north, displacing native polar life and changing the entire food web.", Icon: RefreshCcw },
      ],
    },
  },
  maldives: {
    5: {
      description: "Increased sea level rise means that king tides cause nuisance flooding in low-lying streets several times a year. The thin lens of freshwater beneath the islands begins to taste subtly saltier due to seawater intrusion, challenging local drinking water supplies.",
      bubbles: [
        { x: 20, y: 80, title: "Street Flooding", text: "High tides push water through storm drains and onto streets in inhabited areas.", Icon: Droplet },
      ],
    },
    10: {
      description: "Beach and coastline erosion accelerates dramatically, becoming a major economic crisis. Resorts and local communities spend millions on reinforcement walls and pumping sand to maintain beaches, but the effort is often temporary. Some small, uninhabited islands begin to disappear completely.",
      bubbles: [
        { x: 70, y: 60, title: "Eroded Palms", text: "Coconut palms lean precariously or fall as the sand and soil beneath them washes away.", Icon: AlertTriangle },
      ],
    },
    25: {
      description: "A nationwide freshwater crisis hits as the groundwater is largely contaminated by saltwater. The islands are completely dependent on costly desalination plants. Frequent and intense storm surges regularly damage critical infrastructure, forcing significant investment in coastal defenses.",
      bubbles: [
        { x: 40, y: 50, title: "Dead Gardens", text: "Local, salt-intolerant vegetation dies off as the groundwater becomes too saline.", Icon: CloudOff },
        { x: 65, y: 30, title: "Taller Sea Walls", text: "Concrete flood barriers are constantly being reinforced and raised.", Icon: Zap },
      ],
    },
    50: {
      description: "Mass abandonment begins. Lower-lying, outer-lying islands are deemed uninhabitable due to the frequency of severe wave overwash. Populations consolidate onto a few larger, protected natural islands or move entirely to elevated, artificial 'City Islands,' creating a major internal migration challenge.",
      bubbles: [
        { x: 50, y: 70, title: "Submerged Infrastructure", text: "Old jetties, docks, and walkways are permanently underwater, decaying rapidly.", Icon: Droplet },
      ],
    },
    100: {
      description: "The archipelago is functionally lost. Most natural islands are submerged reefs or have eroded away. The Maldivian people are forced to exist primarily on engineered, elevated concrete platforms, or have become climate refugees, migrating to other nations as their homeland can no longer support life.",
      bubbles: [
        { x: 50, y: 50, title: "Underwater Ruins", text: "Remnants of former homes and buildings are visible beneath the clear, rising ocean water.", Icon: AlertTriangle },
        { x: 30, y: 30, title: "Erosion Scars", text: "Only the highest central points of the largest islands remain above sea level.", Icon: RefreshCcw },
      ],
    },
  },
  yosemite: {
    5: {
      description: "Multi-year drought conditions have stressed the iconic pine forests, making them vulnerable to infestation. Bark beetles rapidly infect the weakened trees. Patches of brown, dead foliage appear amidst the green, transforming healthy forest into dangerous fuel for the next fire season.",
      bubbles: [
        { x: 30, y: 40, title: "Brown Needles", text: "Dying pine trees turn rust-red as they succumb to beetles and chronic water stress.", Icon: Leaf },
      ],
    },
    10: {
      description: "Mega-fire impact becomes the defining ecological event. Scars from massive, high-intensity fires leave entire valleys charred. Smoke fills the valley floor for weeks every summer, causing public health alerts and forcing extended park closures during peak season.",
      bubbles: [
        { x: 50, y: 50, title: "Charred Trunks", text: "Blackened tree skeletons stand where dense, mixed-conifer forest once thrived.", Icon: Flame },
        { x: 70, y: 20, title: "Dusty Air", text: "Haze and smoke reduce visibility, obscuring famous landmarks like El Capitan.", Icon: CloudOff },
      ],
    },
    25: {
      description: "Forest retreat accelerates. Conifer forests, unable to withstand the chronic heat and drought, migrate to higher elevations. The lower elevations, including the valley floor, transition rapidly to more fire-tolerant scrub, oak, and chaparral ecosystems, fundamentally changing the landscape's character.",
      bubbles: [
        { x: 70, y: 70, title: "Shrub Invasion", text: "Low-lying chaparral bushes replace the majestic Ponderosa and Sugar Pine forests.", Icon: RefreshCcw },
        { x: 25, y: 60, title: "Erosion Risk", text: "Heavy rains on fire-scorched, unstable slopes lead to dangerous mudslides.", Icon: AlertTriangle },
      ],
    },
    50: {
      description: "The vital winter snowpack disappears almost completely. Without this natural, slow-release reservoir, famous waterfalls like Yosemite Falls dry up entirely by early summer. The valley floor becomes arid and extremely hot, and the remaining giant sequoia groves face unprecedented mortality risk from intense ground fires.",
      bubbles: [
        { x: 50, y: 30, title: "Dry Cliffside", text: "The famous waterfalls are reduced to a seasonal trickle or completely absent by June.", Icon: Droplet },
      ],
    },
    100: {
      description: "A high-desert landscape is established. The lush, verdant Yosemite of the 20th century is gone, replaced by a biome resembling current-day Southern California chaparral or high-desert shrubland. The ecosystem is dominated by fire and drought, challenging the very existence of the National Park as we know it.",
      bubbles: [
        { x: 50, y: 50, title: "Arid Rock", text: "Exposed granite dominates without the softening frame of green forests.", Icon: Sun },
        { x: 20, y: 40, title: "Flash Flood Tracks", text: "Evidence of rare, intense rainstorms washing through dry riverbeds.", Icon: Zap },
      ],
    },
  },
};

// --- REACT COMPONENTS ---

const TimelinePoint = ({ year, index, activeIndex, onSelect }) => (
  <div className="flex flex-col items-center w-1/5 relative z-10">
    <button 
      onClick={() => onSelect(index)}
      className={`
        w-5 h-5 rounded-full border-2 transition-all duration-300 mb-1 focus:outline-none
        ${index <= activeIndex ? 'bg-green-500 border-green-700' : 'bg-white border-gray-400'}
        ${activeIndex === index ? 'ring-4 ring-green-300 scale-125' : 'hover:scale-110'}
      `}
      aria-label={`Select year +${year}`}
    />
    <span className={`text-xs mt-1 ${activeIndex === index ? 'font-bold text-green-700' : 'text-gray-500'}`}>
      +{year}
    </span>
  </div>
);

const PlaceCard = ({ place, selectedId, onSelect }) => (
  <button
    onClick={() => onSelect(place.id)}
    className={`
      flex flex-col items-center p-3 rounded-xl transition-all duration-300 shadow-lg min-w-[120px] mx-1 focus:outline-none
      ${selectedId === place.id ? 'bg-green-50 border-2 border-green-500 shadow-green-200' : 'bg-white border border-gray-200 hover:bg-gray-50'}
    `}
  >
    <div className={`p-2 rounded-full mb-2 ${selectedId === place.id ? 'bg-green-500' : 'bg-gray-100'}`}>
      <place.Icon size={24} className={selectedId === place.id ? 'text-white' : place.color} />
    </div>
    <span className={`text-sm font-semibold text-center ${selectedId === place.id ? 'text-green-800' : 'text-gray-700'}`}>
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
          relative w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center 
          ${isActive ? 'bg-red-500 border-red-700 scale-125 shadow-xl' : 'bg-white/50 border-red-500 hover:scale-110'}
          focus:outline-none focus:ring-2 focus:ring-red-400
        `}
      >
        <bubble.Icon size={14} className={isActive ? 'text-white' : 'text-red-500'} />
      </button>

      {/* Tooltip */}
      {isActive && (
        <div 
          className="absolute p-3 rounded-lg bg-gray-900 text-white shadow-2xl min-w-[220px] max-w-xs z-30 opacity-95 transition-opacity duration-300"
          style={{
            transform: `translate(${bubble.x > 50 ? '-100% -50%' : '20px -50%'})`,
            [bubble.x > 50 ? 'right' : 'left']: bubble.x > 50 ? '10px' : '0px',
            top: '50%',
          }}
        >
          <p className="font-bold text-sm mb-1 text-red-300">{bubble.title}</p>
          <p className="text-xs">{bubble.text}</p>
        </div>
      )}
    </div>
  );
};


export default function App() {
  const [selectedPlaceId, setSelectedPlaceId] = useState('amazon');
  const [yearIndex, setYearIndex] = useState(0); // 0 to 4 (5, 10, 25, 50, 100)
  const [activeBubble, setActiveBubble] = useState(null);
  const [generatedImages, setGeneratedImages] = useState({}); // Cache for generated images
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  const currentYear = YEARS[yearIndex];
  const scenarioKey = `${selectedPlaceId}_${currentYear}`;
  const currentScenario = SCENARIOS[selectedPlaceId][currentYear];
  const currentPrompt = IMAGE_PROMPTS[selectedPlaceId][currentYear];
  const currentImage = generatedImages[scenarioKey];

  // Function to handle image generation with exponential backoff (No change)
  const generateImage = useCallback(async (prompt, key) => {
    if (generatedImages[key]) return; // Already cached
    
    setIsLoadingImage(true);
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        const payload = { 
          instances: [{ prompt: prompt }], 
          parameters: { 
            "sampleCount": 1,
            "aspectRatio": "16:9" // Cinematic aspect ratio for impact
          } 
        };
        
        const response = await fetch(IMAGE_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const result = await response.json();
        
        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
          const base64Data = result.predictions[0].bytesBase64Encoded;
          const imageUrl = `data:image/png;base64,${base64Data}`;
          setGeneratedImages(prev => ({ ...prev, [key]: imageUrl }));
          setIsLoadingImage(false);
          return;
        } else {
           throw new Error("Image prediction failed or returned no data.");
        }

      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          console.error(`Failed to generate image for ${key} after ${maxAttempts} attempts:`, error);
          // Set a failure placeholder
          setGeneratedImages(prev => ({ ...prev, [key]: 'error' })); 
          setIsLoadingImage(false);
          return;
        }
        const delay = Math.pow(2, attempts) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, [generatedImages]);

  // Effect to trigger image generation when scenario changes and image is not cached (No change)
  useEffect(() => {
    if (!generatedImages[scenarioKey] || generatedImages[scenarioKey] === 'error') {
      generateImage(currentPrompt, scenarioKey);
    }
  }, [scenarioKey, currentPrompt, generateImage, generatedImages]);

  // Reset active bubble when place or year changes (No change)
  useEffect(() => {
    setActiveBubble(null);
  }, [selectedPlaceId, yearIndex]);

  const handlePlaceSelect = (id) => {
    setSelectedPlaceId(id);
  };

  const handleYearChange = (index) => {
    setYearIndex(index);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      
      {/* Header */}
      <header className="bg-white rounded-xl shadow-lg p-6 mb-8 border-b-4 border-green-500">
        <h1 className="text-3xl font-extrabold text-gray-800">Future World Simulator</h1>
        <p className="text-lg text-gray-500 mt-1">Visualize climate impact based on current scientific trajectories for key global regions.</p>
      </header>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto">
        
        {/* 1. TOP SLIDER: Places */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase text-gray-500 mb-3 tracking-wider ml-1">Select a Region</h2>
          <div className="flex overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
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
        <div className="text-center mb-6">
          <p className="text-xl font-bold text-gray-700">
            {PLACES.find(p => p.id === selectedPlaceId)?.name}: <span className="text-green-600">+{currentYear} Years</span>
          </p>
        </div>

        {/* 2. MIDDLE: Image & Bubbles */}
        <div className="relative w-full aspect-video rounded-xl shadow-2xl overflow-hidden bg-gray-200 mb-6">
          
          {isLoadingImage ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
              <Loader2 className="animate-spin text-green-500" size={48} />
              <p className="mt-4 text-gray-600 font-semibold">Generating Scenario Image...</p>
              <p className="text-sm text-gray-500 max-w-xs text-center mt-2">
                Creating the unique visual projection for +{currentYear} years in {PLACES.find(p => p.id === selectedPlaceId)?.name}.
              </p>
            </div>
          ) : currentImage === 'error' ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-100 z-10 p-4">
              <AlertTriangle className="text-red-500" size={32} />
              <p className="mt-4 text-red-700 font-semibold">Image Generation Failed</p>
              <p className="text-sm text-red-500 max-w-xs text-center mt-2">
                Could not load the projection. Please try switching scenarios and try again.
              </p>
            </div>
          ) : currentImage ? (
            <>
              <img
                src={currentImage}
                alt={`${selectedPlaceId} scenario at +${currentYear} years`}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              {/* Interactive Hotspots */}
              {currentScenario.bubbles.map((bubble, index) => (
                <HotspotBubble
                  key={index}
                  bubble={bubble}
                  index={index}
                  activeBubble={activeBubble}
                  setActiveBubble={setActiveBubble}
                />
              ))}
              <p className="absolute bottom-2 right-2 bg-gray-900/70 text-white text-xs p-1 px-2 rounded-lg z-10">
                Tap the red circles for local change details.
              </p>
            </>
          ) : null}
        </div>

        {/* 3. BOTTOM SLIDER: Years (Stepped Timeline) */}
        <div className="p-6 bg-white rounded-xl shadow-md mb-8">
          <h2 className="text-sm font-semibold uppercase text-gray-500 mb-5 tracking-wider">Timeline (Projection)</h2>
          <div className="relative flex justify-between items-center px-4">
            {/* Timeline Track Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 mx-4 -translate-y-1/2 z-0">
                {/* Active Progress Line */}
                <div 
                    className="h-full bg-green-500 transition-all duration-300 rounded-full" 
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

        {/* 4. EXPLANATION TEXT */}
        <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-red-500">
          <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
            <MessageSquare size={20} className="mr-2 text-red-500" />
            Detailed Scientific Explanation
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {currentScenario.description}
          </p>
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}