import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Pressable, 
  Dimensions, 
  ActivityIndicator, 
  Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, Feather } from '@expo/vector-icons'; 

// --- CONFIGURATION ---
// Note: Icons are mapped to Ionicons/Feather for React Native compatibility
const PLACES = [
  // Mapping inline SVGs to Ionicons or Feather
  { id: 'amazon', name: 'Amazon Rainforest', Icon: ({ size, color }) => <Ionicons name="leaf-outline" size={size} color={color} />, color: '#16A34A' }, // green-600
  { id: 'gbr', name: 'Great Barrier Reef', Icon: ({ size, color }) => <Ionicons name="water-outline" size={size} color={color} />, color: '#06B6D4' }, // cyan-500
  { id: 'arctic', name: 'Arctic Sea Ice', Icon: ({ size, color }) => <Ionicons name="snow-outline" size={size} color={color} />, color: '#38BDF8' }, // sky-400
  { id: 'maldives', name: 'The Maldives', Icon: ({ size, color }) => <Ionicons name="sunny-outline" size={size} color={color} />, color: '#F59E0B' }, // yellow-500
  { id: 'yosemite', name: 'Yosemite, CA', Icon: ({ size, color }) => <Ionicons name="flame-outline" size={size} color={color} />, color: '#EA580C' }, // orange-500
];

const YEARS = [5, 10, 25, 50, 100];
const API_KEY = "AIzaSyBz3TMrqBB3g3odwi8Folb5neDiuGlalTo"; // 🛑 UPDATE THIS WITH YOUR KEY
const IMAGE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=" + API_KEY;

// Detailed image generation prompts for all 25 scenarios (COPIED FROM YOUR FILE)
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

// Scientific Explanations & Hotspot Data (COPIED AND MAPPED ICONS FROM YOUR FILE)
const SCENARIOS = {
  amazon: {
    5: {
      description: "In just 5 years, the Amazon begins to face increased fragmentation due to illegal logging and agricultural roads. These roads create 'edge effects,' drying out the surrounding forest, making trees vulnerable to insect infestation and small, human-caused fires. The subtle changes are often only visible to experts, but the ecosystem is already under stress.",
      bubbles: [
        { x: 30, y: 40, title: "Canopy Thinning", text: "Trees at the newly formed edges lose moisture and shed leaves prematurely due to exposure.", Icon: ({ size, color }) => <Feather name="cloud-off" size={size} color={color} /> },
      ],
    },
    10: {
      description: "Agricultural expansion and cattle ranching have pushed deeper into the forest. The distinct 'fishbone' pattern of deforestation is now widely visible from satellite imagery as the forest is systematically cleared. This scale of loss significantly impacts the region's ability to recycle moisture, shortening the wet season.",
      bubbles: [
        { x: 50, y: 50, title: "Road Expansion", text: "New unpaved roads open up previously inaccessible forest to human activity and degradation.", Icon: ({ size, color }) => <Feather name="zap" size={size} color={color} /> },
        { x: 75, y: 60, title: "Cattle Grazing", text: "Cleared land turns into pasture, which compacts soil and prevents forest regeneration.", Icon: ({ size, color }) => <Feather name="refresh-ccw" size={size} color={color} /> },
      ],
    },
    25: {
      description: "The 'Tipping Point' is within sight. Global heating and local deforestation cause rainfall patterns to dramatically disrupt, leading to exceptionally long dry seasons. The rainforest is struggling to generate its own moisture, placing deep-rooted trees under extreme mortality risk. The threat of large-scale wildfires becomes constant.",
      bubbles: [
        { x: 20, y: 60, title: "Dry Riverbeds", text: "Small tributaries and streams begin to dry up seasonally due to the lack of forest transpiration and reduced rainfall.", Icon: ({ size, color }) => <Feather name="alert-triangle" size={size} color={color} /> },
        { x: 70, y: 30, title: "Fire Scars", text: "Evidence of understory fires that have weakened tree root systems and degraded overall forest resilience.", Icon: ({ size, color }) => <Feather name="thermometer" size={size} color={color} /> }, // Mapped Flame to Thermometer
      ],
    },
    50: {
      description: "Savannization is now the dominant feature. Large, contiguous swathes of the rainforest have converted to semi-arid scrubland and savanna. The dense, multi-layered canopy has been broken, replaced by grass and fire-resistant shrubs. The former carbon sink is now close to becoming a major carbon emitter.",
      bubbles: [
        { x: 40, y: 40, title: "Canopy Collapse", text: "Drought-intolerant hardwood trees die off, replaced by grass and low-density savanna foliage.", Icon: ({ size, color }) => <Feather name="cloud-off" size={size} color={color} /> },
        { x: 60, y: 70, title: "Flash Droughts", text: "Soil moisture is critically low, leading to rapid die-offs of remaining forest patches.", Icon: ({ size, color }) => <Feather name="droplet" size={size} color={color} /> },
      ],
    },
    100: {
      description: "The ecosystem has changed fundamentally. The Amazon rainforest is reduced to isolated pockets (refugia) in the wettest regions, while the vast majority is now a dry savanna. This massive ecosystem change drastically reduces global carbon storage, acting as a powerful feedback loop that accelerates global warming further.",
      bubbles: [
        { x: 50, y: 50, title: "Scrubland", text: "The former forest floor is now dominated by dry dirt and hardy, drought-tolerant grasses.", Icon: ({ size, color }) => <Feather name="refresh-ccw" size={size} color={color} /> },
        { x: 30, y: 70, title: "Wildlife Loss", text: "Endemic species relying on the high canopy are extinct or functionally extinct.", Icon: ({ size, color }) => <Feather name="alert-triangle" size={size} color={color} /> },
      ],
    },
  },
  gbr: {
    5: {
      description: "Marine heatwaves cause frequent, sporadic coral bleaching events. While some corals recover from mild events, the stress makes them extremely vulnerable to disease and impedes their growth. The overall reef structure remains intact, but the vibrant colors are starting to be replaced by patches of pale or sickly white coral.",
      bubbles: [
        { x: 40, y: 60, title: "Pale Tips", text: "Coral tips turn white as they expel symbiotic algae (zooxanthellae) due to heat stress.", Icon: ({ size, color }) => <Feather name="sun" size={size} color={color} /> },
      ],
    },
    10: {
      description: "Bleaching events now occur every two to three years, giving the coral insufficient time to fully recover. The slow-growing, complex branching corals are the first to die, leading to a significant drop in biodiversity as their specialized habitats disappear. Overall reef health is declining rapidly.",
      bubbles: [
        { x: 20, y: 40, title: "Ghost Coral", text: "Large, visible colonies turn stark white during summer heat spikes, with mortality rates rising.", Icon: ({ size, color }) => <Feather name="alert-triangle" size={size} color={color} /> },
        { x: 70, y: 55, title: "Weedy Coral", text: "Fast-growing, less complex species dominate the remaining living areas.", Icon: ({ size, color }) => <Feather name="zap" size={size} color={color} /> },
      ],
    },
    25: {
      description: "Widespread structural collapse is evident across the central and northern sectors. The dead coral skeletons, which form the reef's structure, become weak and crumble, removing hiding places, nurseries, and feeding grounds for thousands of fish and invertebrate species. The reef profile flattens out, impacting coastal protection.",
      bubbles: [
        { x: 60, y: 70, title: "Coral Rubble", text: "Dead coral breaks down into sand and rubble, drastically reducing habitable space.", Icon: ({ size, color }) => <Feather name="cloud-off" size={size} color={color} /> },
        { x: 35, y: 75, title: "Ocean Acidification", text: "Corals struggle to build new calcium carbonate skeletons due to increasingly acidic waters.", Icon: ({ size, color }) => <Feather name="droplet" size={size} color={color} /> },
      ],
    },
    50: {
      description: "Algae and slime now dominate. Without living coral to compete, slimy green and brown turf algae smother the remaining reef structure, turning the once vibrant colors to a murky, uniform green. The system has shifted from a coral-dominated ecosystem to an algal-dominated one, profoundly changing the food web.",
      bubbles: [
        { x: 50, y: 50, title: "Algal Bloom", text: "Thick mats of algae cover the remaining dead and dying rock structures.", Icon: ({ size, color }) => <Feather name="leaf" size={size} color={color} /> },
        { x: 25, y: 30, title: "Herbivore Decline", text: "Grazing fish can't keep up with the rate of algal growth.", Icon: ({ size, color }) => <Feather name="refresh-ccw" size={size} color={color} /> },
      ],
    },
    100: {
      description: "A relic ecosystem. The Great Barrier Reef, as a massive, complex biological structure, has effectively ceased to exist. While some heat-resistant 'super corals' or small patches may survive in deep water or sheltered pockets, the once biodiverse ecosystem is replaced by scattered, low-complexity habitats. The fishing and tourism industries are gone.",
      bubbles: [
        { x: 30, y: 30, title: "Empty Waters", text: "Fish populations plummet as their complex nursery grounds disappear entirely.", Icon: ({ size, color }) => <Feather name="alert-triangle" size={size} color={color} /> },
      ],
    },
  },
  arctic: {
    5: {
      description: "The Arctic ice pack sees a sharp decline in multi-year ice—the thick, old ice that survives multiple summers. The ice remaining is younger, thinner, and far more prone to melting completely. This is the period where visible changes accelerate rapidly due to the loss of reflective white surfaces.",
      bubbles: [
        { x: 20, y: 70, title: "Melt Ponds", text: "Pools of dark blue water form on top of the ice, significantly absorbing more heat from the sun.", Icon: ({ size, color }) => <Feather name="sun" size={size} color={color} /> },
      ],
    },
    10: {
      description: "Summer sea ice extent hits record lows almost every year. Polar bears, seals, and walruses are negatively impacted, as they rely on the ice for hunting and resting. Polar bears are forced onto land for longer periods, leading to greater human-wildlife conflict and starvation.",
      bubbles: [
        { x: 60, y: 50, title: "Land Migration", text: "Animals dependent on the sea ice are seen scavenging on rocky shores for food.", Icon: ({ size, color }) => <Feather name="alert-triangle" size={size} color={color} /> },
        { x: 40, y: 30, title: "Thinner Ice", text: "Ice sheets break up earlier in the spring, making travel treacherous.", Icon: ({ size, color }) => <Feather name="zap" size={size} color={color} /> },
      ],
    },
    25: {
      description: "Seasonal 'Blue Ocean Events' begin to occur regularly. The Arctic Ocean is functionally ice-free for several weeks in September. This profound environmental shift opens up the region to new international shipping lanes and resource extraction, introducing significant pollution and geopolitical risk.",
      bubbles: [
        { x: 50, y: 50, title: "Open Water", text: "Vast expanses of dark ocean water replace white ice, accelerating global warming through increased heat absorption.", Icon: ({ size, color }) => <Feather name="cloud-off" size={size} color={color} /> },
      ],
    },
    50: {
      description: "The surrounding permafrost thaws rapidly, destabilizing coastlines and releasing enormous quantities of methane, a potent greenhouse gas, into the atmosphere. Coastal erosion becomes catastrophic, destroying indigenous villages and infrastructure as the lack of sea ice removes the natural wave buffer.",
      bubbles: [
        { x: 80, y: 60, title: "Coastal Erosion", text: "Shorelines collapse into the sea without the protective barrier of permanent ice.", Icon: ({ size, color }) => <Feather name="alert-triangle" size={size} color={color} /> },
        { x: 15, y: 50, title: "Methane Release", text: "Bubbles of methane gas rise from thawing tundra and frozen lakes.", Icon: ({ size, color }) => <Feather name="zap" size={size} color={color} /> },
      ],
    },
    100: {
      description: "A permanently altered North Pole. The Arctic has become a new, seasonal ocean. The disappearance of year-round ice has fundamentally changed ocean currents and weather patterns globally. Traditional indigenous ways of life dependent on ice hunting and stable environments are now impossible, forcing mass cultural displacement.",
      bubbles: [
        { x: 50, y: 50, title: "New Ecosystem", text: "Temperate marine species migrate north, displacing native polar life and changing the entire food web.", Icon: ({ size, color }) => <Feather name="refresh-ccw" size={size} color={color} /> },
      ],
    },
  },
  maldives: {
    5: {
      description: "Increased sea level rise means that king tides cause nuisance flooding in low-lying streets several times a year. The thin lens of freshwater beneath the islands begins to taste subtly saltier due to seawater intrusion, challenging local drinking water supplies.",
      bubbles: [
        { x: 20, y: 80, title: "Street Flooding", text: "High tides push water through storm drains and onto streets in inhabited areas.", Icon: ({ size, color }) => <Feather name="droplet" size={size} color={color} /> },
      ],
    },
    10: {
      description: "Beach and coastline erosion accelerates dramatically, becoming a major economic crisis. Resorts and local communities spend millions on reinforcement walls and pumping sand to maintain beaches, but the effort is often temporary. Some small, uninhabited islands begin to disappear completely.",
      bubbles: [
        { x: 70, y: 60, title: "Eroded Palms", text: "Coconut palms lean precariously or fall as the sand and soil beneath them washes away.", Icon: ({ size, color }) => <Feather name="alert-triangle" size={size} color={color} /> },
      ],
    },
    25: {
      description: "A nationwide freshwater crisis hits as the groundwater is largely contaminated by saltwater. The islands are completely dependent on costly desalination plants. Frequent and intense storm surges regularly damage critical infrastructure, forcing significant investment in coastal defenses.",
      bubbles: [
        { x: 40, y: 50, title: "Dead Gardens", text: "Local, salt-intolerant vegetation dies off as the groundwater becomes too saline.", Icon: ({ size, color }) => <Feather name="cloud-off" size={size} color={color} /> },
        { x: 65, y: 30, title: "Taller Sea Walls", text: "Concrete flood barriers are constantly being reinforced and raised.", Icon: ({ size, color }) => <Feather name="zap" size={size} color={color} /> },
      ],
    },
    50: {
      description: "Mass abandonment begins. Lower-lying, outer-lying islands are deemed uninhabitable due to the frequency of severe wave overwash. Populations consolidate onto a few larger, protected natural islands or move entirely to elevated, artificial 'City Islands,' creating a major internal migration challenge.",
      bubbles: [
        { x: 50, y: 70, title: "Submerged Infrastructure", text: "Old jetties, docks, and walkways are permanently underwater, decaying rapidly.", Icon: ({ size, color }) => <Feather name="droplet" size={size} color={color} /> },
      ],
    },
    100: {
      description: "The archipelago is functionally lost. Most natural islands are submerged reefs or have eroded away. The Maldivian people are forced to exist primarily on engineered, elevated concrete platforms, or have become climate refugees, migrating to other nations as their homeland can no longer support life.",
      bubbles: [
        { x: 50, y: 50, title: "Underwater Ruins", text: "Remnants of former homes and buildings are visible beneath the clear, rising ocean water.", Icon: ({ size, color }) => <Feather name="alert-triangle" size={size} color={color} /> },
        { x: 30, y: 30, title: "Erosion Scars", text: "Only the highest central points of the largest islands remain above sea level.", Icon: ({ size, color }) => <Feather name="refresh-ccw" size={size} color={color} /> },
      ],
    },
  },
  yosemite: {
    5: {
      description: "Multi-year drought conditions have stressed the iconic pine forests, making them vulnerable to infestation. Bark beetles rapidly infect the weakened trees. Patches of brown, dead foliage appear amidst the green, transforming healthy forest into dangerous fuel for the next fire season.",
      bubbles: [
        { x: 30, y: 40, title: "Brown Needles", text: "Dying pine trees turn rust-red as they succumb to beetles and chronic water stress.", Icon: ({ size, color }) => <Feather name="leaf" size={size} color={color} /> },
      ],
    },
    10: {
      description: "Mega-fire impact becomes the defining ecological event. Scars from massive, high-intensity fires leave entire valleys charred. Smoke fills the valley floor for weeks every summer, causing public health alerts and forcing extended park closures during peak season.",
      bubbles: [
        { x: 50, y: 50, title: "Charred Trunks", text: "Blackened tree skeletons stand where dense, mixed-conifer forest once thrived.", Icon: ({ size, color }) => <Feather name="thermometer" size={size} color={color} /> }, // Mapped Flame to Thermometer
        { x: 70, y: 20, title: "Dusty Air", text: "Haze and smoke reduce visibility, obscuring famous landmarks like El Capitan.", Icon: ({ size, color }) => <Feather name="cloud-off" size={size} color={color} /> },
      ],
    },
    25: {
      description: "Forest retreat accelerates. Conifer forests, unable to withstand the chronic heat and drought, migrate to higher elevations. The lower elevations, including the valley floor, transition rapidly to more fire-tolerant scrub, oak, and chaparral ecosystems, fundamentally changing the landscape's character.",
      bubbles: [
        { x: 70, y: 70, title: "Shrub Invasion", text: "Low-lying chaparral bushes replace the majestic Ponderosa and Sugar Pine forests.", Icon: ({ size, color }) => <Feather name="refresh-ccw" size={size} color={color} /> },
        { x: 25, y: 60, title: "Erosion Risk", text: "Heavy rains on fire-scorched, unstable slopes lead to dangerous mudslides.", Icon: ({ size, color }) => <Feather name="alert-triangle" size={size} color={color} /> },
      ],
    },
    50: {
      description: "The vital winter snowpack disappears almost completely. Without this natural, slow-release reservoir, famous waterfalls like Yosemite Falls dry up entirely by early summer. The valley floor becomes arid and extremely hot, and the remaining giant sequoia groves face unprecedented mortality risk from intense ground fires.",
      bubbles: [
        { x: 50, y: 30, title: "Dry Cliffside", text: "The famous waterfalls are reduced to a seasonal trickle or completely absent by June.", Icon: ({ size, color }) => <Feather name="droplet" size={size} color={color} /> },
      ],
    },
    100: {
      description: "A high-desert landscape is established. The lush, verdant Yosemite of the 20th century is gone, replaced by a biome resembling current-day Southern California chaparral or high-desert shrubland. The ecosystem is dominated by fire and drought, challenging the very existence of the National Park as we know it.",
      bubbles: [
        { x: 50, y: 50, title: "Arid Rock", text: "Exposed granite dominates without the softening frame of green forests.", Icon: ({ size, color }) => <Feather name="sun" size={size} color={color} /> },
        { x: 20, y: 40, title: "Flash Flood Tracks", text: "Evidence of rare, intense rainstorms washing through dry riverbeds.", Icon: ({ size, color }) => <Feather name="zap" size={size} color={color} /> },
      ],
    },
  },
};

// --- ASYNC STORAGE HELPER FUNCTIONS (REPLACED LOCALSTORAGE) ---
const LOCAL_STORAGE_KEY = 'futureWorldImagesCache';

const loadCache = async () => {
  try {
    const serializedState = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
    if (serializedState === null) {
      return {};
    }
    return JSON.parse(serializedState);
  } catch (e) {
    console.warn("Could not load image cache from AsyncStorage", e);
    return {};
  }
};

const saveCache = async (state) => {
  try {
    const serializedState = JSON.stringify(state);
    await AsyncStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
  } catch (e) {
    console.error("Could not save image cache to AsyncStorage", e);
  }
};
// --- END ASYNC STORAGE HELPER FUNCTIONS ---


// --- REACT NATIVE COMPONENTS ---

const TimelinePoint = ({ year, index, activeIndex, onSelect }) => {
  const isActive = index <= activeIndex;
  const isSelected = index === activeIndex;

  return (
    <View style={styles.timelinePointContainer}>
      <Pressable
        onPress={() => onSelect(index)}
        style={({ pressed }) => [
          styles.timelineButtonBase,
          isActive ? styles.timelineButtonActive : styles.timelineButtonInactive,
          isSelected && styles.timelineButtonSelected,
          { opacity: pressed ? 0.8 : 1 }
        ]}
      />
      <Text style={[
        styles.timelineTextBase,
        isSelected ? styles.timelineTextSelected : styles.timelineTextNormal
      ]}>
        +{year}
      </Text>
    </View>
  );
};

const PlaceCard = ({ place, selectedId, onSelect }) => {
  const isSelected = selectedId === place.id;
  // Convert Tailwind color classes to hex/rgba for RN styles
  const colorMap = {
      '#16A34A': { text: '#16A34A', bg: '#D1FAE5' }, // green-600
      '#06B6D4': { text: '#06B6D4', bg: '#CCFBF1' }, // cyan-500
      '#38BDF8': { text: '#38BDF8', bg: '#E0F2FE' }, // sky-400
      '#F59E0B': { text: '#F59E0B', bg: '#FEF3C7' }, // yellow-500
      '#EA580C': { text: '#EA580C', bg: '#FFEDD5' }, // orange-500
  };
  const iconColor = isSelected ? '#FFFFFF' : colorMap[place.color].text;
  const placeCardStyle = { 
    ...styles.placeCardBase,
    backgroundColor: isSelected ? colorMap[place.color].text : '#FFFFFF', 
    borderColor: isSelected ? colorMap[place.color].text : '#E5E7EB',
  };
  const iconWrapperStyle = { 
    ...styles.placeIconWrapper,
    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colorMap[place.color].bg,
  };

  return (
    <Pressable
      onPress={() => onSelect(place.id)}
      style={({ pressed }) => [
        placeCardStyle,
        isSelected ? styles.placeCardSelectedShadow : styles.placeCardInactiveShadow,
        { opacity: pressed ? 0.8 : 1 }
      ]}
    >
      <View style={iconWrapperStyle}>
        <place.Icon size={24} color={iconColor} />
      </View>
      <Text style={[
        styles.placeCardText,
        { color: isSelected ? '#FFFFFF' : '#1F2937' }
      ]}>
        {place.name}
      </Text>
    </Pressable>
  );
};

const HotspotBubble = ({ bubble, index, activeBubble, setActiveBubble }) => {
  const isActive = activeBubble === index;
  
  const style = {
    position: 'absolute',
    top: `${bubble.y}%`,
    left: `${bubble.x}%`,
  };

  return (
    <View style={style}>
      <Pressable
        onPress={() => setActiveBubble(isActive ? null : index)}
        style={({ pressed }) => [
          styles.bubbleBase,
          isActive ? styles.bubbleActive : styles.bubbleInactive,
          isActive && styles.bubblePulse,
          { opacity: pressed ? 0.8 : 1 }
        ]}
      >
        <Feather name="alert-circle" size={16} color={isActive ? '#FFFFFF' : '#EF4444'} />
      </Pressable>

      {/* Tooltip */}
      {isActive && (
        <View 
          style={[
            styles.tooltipBase,
            bubble.x > 50 ? styles.tooltipRight : styles.tooltipLeft,
          ]}
        >
          <Text style={styles.tooltipTitle}>
            <Feather name="zap" size={16} color="#FCA5A5" /> {bubble.title}
          </Text>
          <Text style={styles.tooltipText}>{bubble.text}</Text>
        </View>
      )}
    </View>
  );
};


// --- MAIN APP COMPONENT ---

export default function FutureWorld() {
  const [selectedPlaceId, setSelectedPlaceId] = useState('amazon');
  const [yearIndex, setYearIndex] = useState(0); 
  const [activeBubble, setActiveBubble] = useState(null);
  
  const [generatedImages, setGeneratedImages] = useState({});
  const [isCacheLoaded, setIsCacheLoaded] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // Load cache on mount
  useEffect(() => {
    loadCache().then(cache => {
      setGeneratedImages(cache);
      setIsCacheLoaded(true);
    });
  }, []);

  const currentYear = YEARS[yearIndex];
  const scenarioKey = `${selectedPlaceId}_${currentYear}`;
  const currentScenario = SCENARIOS[selectedPlaceId] ? SCENARIOS[selectedPlaceId][currentYear] : null;
  const currentPrompt = IMAGE_PROMPTS[selectedPlaceId] ? IMAGE_PROMPTS[selectedPlaceId][currentYear] : null;
  const currentImage = generatedImages[scenarioKey];
  
  // Guard against missing scenario data
  if (!currentScenario || !currentPrompt) {
      console.error("Missing configuration data for current scenario:", selectedPlaceId, currentYear);
      // Fallback to a basic loading screen if config is missing
      return (
          <View style={styles.loadingContainer}>
              <Text>Configuration Error: Missing data for {selectedPlaceId} +{currentYear} years.</Text>
          </View>
      );
  }

  // Function to handle image generation with exponential backoff
  const generateImage = useCallback(async (prompt, key) => {
    if (!isCacheLoaded) return; 
    if (generatedImages[key] && generatedImages[key] !== 'error') return; 
    
    setIsLoadingImage(true);
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        const payload = { 
          instances: [{ prompt: prompt }], 
          parameters: { "sampleCount": 1, "aspectRatio": "16:9" } 
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
          const imageURL = `data:image/png;base64,${base64Data}`;

          setGeneratedImages(prev => {
            const newCache = { ...prev, [key]: imageURL };
            saveCache(newCache); 
            return newCache;
          });
          
          setIsLoadingImage(false);
          return; 
        } else {
          throw new Error("Image generation failed or returned empty result.");
        }

      } catch (error) {
        console.error(`Attempt ${attempts + 1} failed for ${key}:`, error);
        attempts++;
        if (attempts >= maxAttempts) {
          setGeneratedImages(prev => {
            const newCache = { ...prev, [key]: 'error' };
            saveCache(newCache); 
            return newCache;
          });
          setIsLoadingImage(false);
          return; 
        }
        const delay = Math.pow(2, attempts) * 1000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, [generatedImages, isCacheLoaded]);


  // useEffect to trigger image generation whenever the scenario changes
  useEffect(() => {
    if (!isCacheLoaded) return; 
    const key = `${selectedPlaceId}_${currentYear}`;
    const prompt = IMAGE_PROMPTS[selectedPlaceId][currentYear];

    setActiveBubble(null); 
    generateImage(prompt, key);
  }, [selectedPlaceId, yearIndex, currentYear, generateImage, isCacheLoaded]);


  if (!isCacheLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading environment...</Text>
      </View>
    );
  }

  // Find the current place name for alt text
  const currentPlaceName = PLACES.find(p => p.id === selectedPlaceId)?.name || 'Ecosystem';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Global Climate Futures</Text>
        <Text style={styles.subtitle}>
          Visualize the impact of climate change on critical global hotspots over time.
        </Text>
      </View>

      {/* Place Selection */}
      <View style={styles.placeSelectionContainer}>
        <Text style={styles.placeSelectionTitle}>Select a Critical Ecosystem:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.placeCardWrapper}>
          {PLACES.map(place => (
            <PlaceCard 
              key={place.id}
              place={place}
              selectedId={selectedPlaceId}
              onSelect={id => {
                setSelectedPlaceId(id);
                setYearIndex(0); 
              }}
            />
          ))}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContentArea}>
        
        {/* Timeline */}
        <View style={styles.timelineArea}>
          <View style={styles.timelineLine}>
            <View 
              style={[
                styles.timelineProgress, 
                { width: `${(yearIndex / (YEARS.length - 1)) * 100}%` }
              ]} 
            />
          </View>
          <View style={styles.timelinePointsWrapper}>
            {YEARS.map((year, index) => (
              <TimelinePoint
                key={year}
                year={year}
                index={index}
                activeIndex={yearIndex}
                onSelect={setYearIndex}
              />
            ))}
          </View>
        </View>
        
        {/* Scenario Header */}
        <View style={styles.scenarioHeader}>
          <Text style={styles.scenarioTitle}>
            <Feather name="alert-triangle" size={24} color="#EF4444" />
            {' '}Scenario: 
            <Text style={styles.scenarioYearText}> +{currentYear} Years</Text>
          </Text>
          <Text style={styles.scenarioSubtitle}>
            Click on the red hotspots in the image below to learn more.
          </Text>
        </View>

        {/* Image and Description Layout */}
        <View style={styles.imageDescriptionLayout}>
          
          {/* Image/Visualization Area */}
          <View style={styles.imageVisualizationArea}>
            {isLoadingImage && (
              <View style={styles.imageOverlay}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={styles.overlayText}>Generating future scenario visualization...</Text>
                <Text style={styles.overlaySmallText}>AI generation in progress</Text>
              </View>
            )}

            {currentImage === 'error' && !isLoadingImage && (
              <View style={styles.imageErrorBox}>
                <Feather name="alert-triangle" size={32} color="#B91C1C" />
                <Text style={styles.errorTitle}>Image Generation Error</Text>
                <Text style={styles.errorText}>Could not generate a visualization for this scenario.</Text>
              </View>
            )}

            {currentImage && currentImage !== 'error' && (
              <View style={styles.imageWrapper}>
                <Image 
                  source={{ uri: currentImage }}
                  style={[
                    styles.scenarioImage,
                    { opacity: isLoadingImage ? 0.3 : 1 }
                  ]}
                  resizeMode="cover"
                  accessibilityLabel={`Future scenario for ${currentPlaceName} in +${currentYear} years.`}
                />
                
                {/* Hotspots Overlay */}
                <View style={styles.hotspotsOverlay}>
                  {currentScenario.bubbles.map((bubble, index) => (
                    <HotspotBubble
                      key={index}
                      bubble={bubble}
                      index={index}
                      activeBubble={activeBubble}
                      setActiveBubble={setActiveBubble}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Description Area */}
          <View style={styles.descriptionArea}>
            <View>
              <Text style={styles.descriptionTitle}>
                <Feather name="message-square" size={20} color="#10B981" />
                {' '}Scientific Summary
              </Text>
              <Text style={styles.descriptionText}>
                {currentScenario.description}
              </Text>
            </View>
            <View style={styles.footerNote}>
              <Text style={styles.footerNoteText}>
                Visualization powered by Imagen 4.0 API. Scenarios are based on projected high-emission climate pathways.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Select a place and move the timeline to explore different climate impacts.
        </Text>
      </View>
    </ScrollView>
  );
}

// --- STYLESHEET (Manual Tailwind/CSS to RN Style Translation) ---

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    fontFamily: 'Quicksand-Medium'
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    fontFamily: 'Quicksand-Bold',
    marginTop: 7,
  },
  subtitle: {
    fontSize: 18,
    color: '#4B5563',
    marginTop: 8,
    maxWidth: width * 0.9,
    textAlign: 'center',
    fontFamily: 'Quicksand-Medium'
  },

  // Place Selection
  placeSelectionContainer: {
    marginBottom: 32,
  },
  placeSelectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Quicksand-Medium'
  },
  placeCardWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  placeCardBase: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
    marginHorizontal: 6,
  },
  placeCardSelectedShadow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  placeCardInactiveShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeIconWrapper: {
    padding: 8,
    borderRadius: 9999,
    marginBottom: 8,
  },
  placeCardText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Quicksand-Medium'
  },

  // Main Content Area
  mainContentArea: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },

  // Timeline
  timelineArea: {
    marginBottom: 32,
    paddingTop: 16,
  },
  timelineLine: {
    position: 'absolute',
    top: '50%',
    left: 24,
    right: 24,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
    marginTop: 10,
  },
  timelineProgress: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 9999,
  },
  timelinePointsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelinePointContainer: {
    alignItems: 'center',
    width: '20%',
    zIndex: 10,
  },
  timelineButtonBase: {
    width: 24,
    height: 24,
    borderRadius: 9999,
    borderWidth: 4,
    borderColor: '#9CA3AF',
  },
  timelineButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  timelineButtonInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  timelineButtonSelected: {
    transform: [{ scale: 1.25 }],
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  timelineTextBase: {
    fontSize: 12,
    marginTop: 12,
    fontFamily: 'Quicksand-Medium'
  },
  timelineTextSelected: {
    fontWeight: '800',
    color: '#059669',
    fontFamily: 'Quicksand-Medium'
  },
  timelineTextNormal: {
    color: '#4B5563',
    fontWeight: '500',
    fontFamily: 'Quicksand-Medium'
  },

  // Scenario Header
  scenarioHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  scenarioTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'Quicksand-Medium'
  },
  scenarioYearText: {
    color: '#EF4444',
    marginLeft: 8,
    fontFamily: 'Quicksand-Medium'
  },
  scenarioSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'Quicksand-Medium'
  },

  // Image Area
  imageDescriptionLayout: {
    flexDirection: Dimensions.get('window').width > 768 ? 'row' : 'column',
    gap: 16,
  },
  imageVisualizationArea: {
    flex: Dimensions.get('window').width > 768 ? 2 : 1, // 2/3 width on large screens
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    aspectRatio: 16 / 9,
    marginBottom: Dimensions.get('window').width > 768 ? 0 : 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  scenarioImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(249, 250, 251, 0.9)',
    zIndex: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    marginTop: 16,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Quicksand-Medium'
  },
  overlaySmallText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'bold',
    textAlign: 'center',
    fontFamily: 'Quicksand-Medium'
  },
  imageErrorBox: {
    padding: 24,
    margin: 16,
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    textAlign: 'center',
  },
  errorTitle: {
    fontWeight: '600',
    color: '#B91C1C',
    marginTop: 12,
    fontFamily: 'Quicksand-Medium'
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    fontFamily: 'Quicksand-Medium'
  },

  // Hotspots
  hotspotsOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  bubbleBase: {
    width: 28,
    height: 28,
    borderRadius: 9999,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  bubbleActive: {
    backgroundColor: '#DC2626',
    borderColor: '#7F1D1D',
    transform: [{ scale: 1.25 }],
  },
  bubbleInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: '#EF4444',
  },
  bubblePulse: {
    shadowColor: '#DC2626',
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipBase: {
    position: 'absolute',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    minWidth: 200,
    maxWidth: 250,
    zIndex: 30,
    borderTopWidth: 4,
    borderTopColor: '#EF4444',
  },
  tooltipLeft: {
    left: 20,
    top: '50%',
    transform: [{ translateY: -25 }],
  },
  tooltipRight: {
    right: 10,
    top: '50%',
    transform: [{ translateY: -25 }],
  },
  tooltipTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
    color: '#FCA5A5',
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: 'Quicksand-Medium'
  },
  tooltipText: {
    fontSize: 14,
    color: '#D1D5DB',
    fontFamily: 'Quicksand-Medium'
  },

  // Description Area
  descriptionArea: {
    flex: Dimensions.get('window').width > 768 ? 1 : 1, // 1/3 width on large screens
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'space-between',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: 'Quicksand-Medium'
  },
  descriptionText: {
    color: '#374151',
    lineHeight: 24,
    fontSize: 16,
    fontFamily: 'Quicksand-Medium'
  },
  footerNote: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerNoteText: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'bold',
    fontFamily: 'Quicksand-Medium'
  },

  // Footer
  footer: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Quicksand-Medium'
  }
});