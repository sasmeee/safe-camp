export type Risk = "good" | "caution" | "danger" | "critical";

export type Category =
  | "plant"
  | "fungi"
  | "insect"
  | "animal"
  | "terrain"
  | "water"
  | "fire"
  | "weather"
  | "camp"
  | "site";

export type Hazard = {
  id: string;
  name: string;
  category: Category;
  risk: Risk;
  // easily confused hazards that share advice (e.g. bee vs wasp)
  family?: string;
  prompts: string[];
  summary: string;
  actions: string[];
};

export const HAZARDS: Hazard[] = [
  // plants and fungi
  {
    id: "poison-ivy",
    name: "Poison ivy",
    category: "plant",
    risk: "caution",
    prompts: [
      "a photo of poison ivy leaves with three leaflets",
      "a close-up photo of a poison ivy vine climbing a tree",
    ],
    summary:
      "Oil on leaves, stems and roots can cause an itchy, blistering rash.",
    actions: [
      "Do not touch it. Keep gear and pets away.",
      "Pitch your tent well away from it.",
      "If touched, wash skin and clothes soon with soap and water.",
    ],
  },
  {
    id: "poison-oak-sumac",
    name: "Poison oak or poison sumac",
    category: "plant",
    risk: "caution",
    prompts: [
      "a photo of poison oak leaves with lobed edges like oak leaves",
      "a photo of poison sumac shrub with red stems and many leaflets in a swampy area",
    ],
    summary: "Same rash-causing oil as poison ivy.",
    actions: [
      "Do not touch it. Never burn it, the smoke can harm lungs.",
      "Wash skin and clothes with soap and water if touched.",
      "Seek care for a severe rash or if it spreads to the face or eyes.",
    ],
  },
  {
    id: "stinging-nettle",
    name: "Stinging nettle",
    category: "plant",
    risk: "caution",
    prompts: [
      "a photo of stinging nettle plants with serrated heart-shaped leaves",
      "a photo of a dense patch of nettles with tiny hairs on the stems",
    ],
    summary: "Tiny hairs sting and cause burning, itchy bumps.",
    actions: [
      "Avoid brushing bare skin against it. Wear long sleeves and trousers.",
      "Rinse the area with water and avoid scratching.",
      "Seek help for swelling of the face or throat, or trouble breathing.",
    ],
  },
  {
    id: "giant-hogweed",
    name: "Giant hogweed",
    category: "plant",
    risk: "danger",
    prompts: [
      "a photo of giant hogweed, a very tall plant with huge white umbrella-shaped flower heads",
      "a photo of a tall hollow stem with purple blotches and large jagged leaves",
    ],
    summary:
      "Sap can cause painful burns and blisters when skin is then exposed to sunlight.",
    actions: [
      "Do not touch, cut or brush against it.",
      "If sap touches skin, wash at once with soap and cool water and keep the skin out of sun.",
      "Seek medical care for blisters, or if sap gets in the eyes.",
    ],
  },
  {
    id: "thorny-plants",
    name: "Thorny or spiny plants",
    category: "plant",
    risk: "caution",
    prompts: [
      "a photo of a thorny bramble thicket with sharp spines",
      "a photo of a cactus with sharp spines",
    ],
    summary: "Thorns and spines cause cuts, punctures and infected wounds.",
    actions: [
      "Pitch your tent away from thorny growth.",
      "Wear gloves and sturdy shoes around it.",
      "Remove spines with tweezers, clean the wound, and watch for infection.",
    ],
  },
  {
    id: "wild-berries",
    name: "Unknown wild berries or fruit",
    category: "plant",
    risk: "danger",
    prompts: [
      "a photo of red berries on a wild bush",
      "a photo of dark berries hanging from a wild plant",
    ],
    summary:
      "Many wild berries are poisonous and a photo cannot tell which are harmful.",
    actions: [
      "Do not eat wild berries or fruit unless an expert identifies them as edible.",
      "Keep children and pets away.",
      "If swallowed, call poison control or emergency services.",
    ],
  },
  {
    id: "wild-mushroom",
    name: "Wild mushrooms",
    category: "fungi",
    risk: "danger",
    prompts: [
      "a photo of wild mushrooms growing on the forest floor",
      "a photo of a mushroom cap and stem in the grass",
    ],
    summary: "Photos cannot tell edible mushrooms from deadly lookalikes.",
    actions: [
      "Do not eat, taste or cook wild mushrooms.",
      "Wash hands after touching. Keep children and pets away.",
      "If someone ate one, call poison control or emergency services.",
    ],
  },

  // insects and small creatures
  {
    id: "wasp-nest",
    name: "Wasp or hornet nest",
    category: "insect",
    risk: "danger",
    family: "stinging-insects",
    prompts: [
      "a photo of a wasp nest",
      "a photo of a hornet nest",
      "a photo of a paper wasp nest with hexagonal honeycomb cells and wasps on it",
      "a photo of a grey papery hornet nest hanging from a tree branch",
      "a close-up photo of wasps crawling on a nest",
      "a photo of a hole in the ground with wasps flying in and out",
      "a macro photo of a yellow and black wasp",
      "a photo of a yellowjacket wasp",
    ],
    summary: "Nests defend aggressively. Multiple stings can be serious.",
    actions: [
      "Do not approach or disturb it.",
      "Move your tent pitch at least 30 m (100 ft) away.",
      "Seek emergency help for trouble breathing or swelling after a sting.",
    ],
  },
  {
    id: "bee-hive",
    name: "Bee swarm or wild hive",
    category: "insect",
    risk: "danger",
    family: "stinging-insects",
    prompts: [
      "a photo of a beehive",
      "a photo of a honeybee swarm clustered on a tree branch",
      "a photo of a wild beehive with many bees at its entrance",
      "a photo of a wooden beehive box with bees flying around it",
      "a photo of honeycomb full of bees",
      "a close-up photo of a honeybee",
      "a macro photo of a bee on a flower",
      "a photo of a bumblebee",
    ],
    summary: "Disturbed bees can sting in large numbers.",
    actions: [
      "Stay calm and walk away slowly. Do not swat or shake the branch.",
      "If chased, cover your face and get into a vehicle or building.",
      "Seek emergency help for allergic signs or many stings.",
    ],
  },
  {
    id: "fire-ants",
    name: "Fire ants or swarming ants",
    category: "insect",
    risk: "danger",
    prompts: [
      "a photo of a raised dirt mound of fire ants with ants swarming",
      "a photo of a swarm of red ants crawling on skin",
    ],
    summary:
      "Disturbed colonies swarm and sting. Stings burn and can cause allergic reactions.",
    actions: [
      "Do not step on or disturb the mound. Pitch your tent away from it.",
      "If bitten, brush ants off quickly and move away.",
      "Seek help for trouble breathing or widespread swelling.",
    ],
  },
  {
    id: "tick",
    name: "Tick",
    category: "insect",
    risk: "caution",
    prompts: [
      "a close-up photo of a tick on human skin",
      "a photo of a tick on a blade of grass",
    ],
    summary: "Ticks can carry diseases.",
    actions: [
      "Check your body, clothes and pets after being outside.",
      "Remove with fine-tipped tweezers, pulling straight up close to the skin. Clean the bite.",
      "See a doctor if fever, rash or flu-like symptoms follow.",
    ],
  },
  {
    id: "leech",
    name: "Leech",
    category: "insect",
    risk: "caution",
    prompts: [
      "a photo of a leech attached to human skin",
      "a photo of a leech on a leaf in a rainforest",
    ],
    summary:
      "Leeches attach and feed. Bites bleed a lot but are rarely dangerous.",
    actions: [
      "Slide a fingernail under the sucker to detach it. Do not burn or salt it.",
      "Wash and cover the bite. Press if it keeps bleeding.",
      "Wear long socks and use repellent in leech areas.",
    ],
  },
  {
    id: "scorpion",
    name: "Scorpion",
    category: "insect",
    risk: "danger",
    prompts: [
      "a photo of a scorpion on sand or rock",
      "a photo of a scorpion with raised tail and claws",
    ],
    summary:
      "Stings are painful and some species are dangerous, especially to children.",
    actions: [
      "Shake out shoes, clothes and bedding before use. Do not handle it.",
      "Use a torch at night and watch where you put your hands.",
      "Seek medical help for severe pain, numbness or breathing trouble. Urgent for children.",
    ],
  },
  {
    id: "venomous-spider",
    name: "Venomous or large spider",
    category: "insect",
    risk: "caution",
    prompts: [
      "a photo of a black widow spider",
      "a photo of a large hairy spider on a rock or tent",
    ],
    summary: "Some spider bites need medical care.",
    actions: [
      "Do not handle spiders. Shake out boots and sleeping bags.",
      "Clean a bite and apply a cool compress.",
      "Seek urgent care for severe pain, spreading redness or breathing trouble.",
    ],
  },
  {
    id: "hairy-caterpillar",
    name: "Stinging caterpillar",
    category: "insect",
    risk: "caution",
    prompts: [
      "a photo of a hairy spiny caterpillar on a leaf",
      "a photo of a brightly colored caterpillar with stinging spines",
    ],
    summary: "Some caterpillar hairs sting or cause rashes.",
    actions: [
      "Do not touch it.",
      "If stung, remove spines with tape and wash with soap and water.",
      "Seek care for a severe reaction.",
    ],
  },

  // animals
  {
    id: "snake",
    name: "Snake",
    category: "animal",
    risk: "danger",
    prompts: [
      "a photo of a snake coiled on the ground",
      "a photo of a snake in grass or on a rock near a trail",
      "a photo of a snake hanging on a tree branch",
    ],
    summary:
      "A photo cannot tell venomous from harmless, so treat every snake as dangerous.",
    actions: [
      "Freeze, then back away slowly and give it lots of space. Never handle or kill it.",
      "Wear boots and watch where you step and reach.",
      "If bitten, stay calm and still and call emergency services. Do not cut, suck, ice or tie the bite.",
    ],
  },
  {
    id: "predator",
    name: "Bear or large predator",
    category: "animal",
    risk: "critical",
    prompts: [
      "a photo of a bear in the forest",
      "a photo of a black bear climbing in a tree",
      "a photo of a dark bear cub sitting on a tree branch",
      "a photo of a brown bear walking through woods",
      "a dark silhouette of a large animal in a tree",
      "a photo of large animal paw prints in mud",
      "a photo of a big cat such as a leopard or tiger in the wild",
    ],
    summary: "Large predators can seriously injure or kill.",
    actions: [
      "Do not approach and do not run. Stay calm, talk calmly and back away.",
      "Store food, trash and scented items securely away from your tent.",
      "Leave the area and report sightings to local rangers.",
    ],
  },
  {
    id: "large-herbivore",
    name: "Large wild animal (elephant, buffalo, moose)",
    category: "animal",
    risk: "critical",
    prompts: [
      "a photo of a wild elephant near a forest",
      "a photo of a wild buffalo or bison close to a trail",
      "a photo of a moose or large antlered deer standing in a clearing",
    ],
    summary:
      "Big animals can charge without warning, especially with young or in breeding season.",
    actions: [
      "Keep a long distance. Never approach for photos.",
      "Do not camp on animal trails or near water holes.",
      "Retreat quietly to cover and follow local ranger advice.",
    ],
  },
  {
    id: "monkey",
    name: "Monkeys",
    category: "animal",
    risk: "caution",
    prompts: [
      "a photo of monkeys near a campsite",
      "a photo of a monkey grabbing food",
    ],
    summary: "Monkeys steal food and can bite or scratch.",
    actions: [
      "Do not feed or tease them.",
      "Keep food sealed and out of the tent.",
      "Wash any bite or scratch well and get medical advice (rabies risk).",
    ],
  },
  {
    id: "crocodile",
    name: "Crocodile or alligator",
    category: "water",
    risk: "critical",
    prompts: [
      "a photo of a crocodile or alligator on a river bank",
      "a photo of the eyes and snout of a crocodile in murky water",
    ],
    summary: "Crocodilians attack animals and people near the water's edge.",
    actions: [
      "Stay well back from the water's edge and never swim.",
      "Do not camp close to rivers or lakes in crocodile areas.",
      "Obey local warning signs and ranger advice.",
    ],
  },
  {
    id: "animal-den",
    name: "Cave entrance or animal burrow",
    category: "animal",
    risk: "caution",
    prompts: [
      "a photo of a cave entrance in a rock wall",
      "a photo of an animal burrow hole in the ground",
    ],
    summary: "Dens can shelter snakes, bats, bears or other wildlife.",
    actions: [
      "Do not reach or crawl in.",
      "Keep your tent away from den entrances.",
      "Use a torch at night and step carefully.",
    ],
  },

  // terrain and water
  {
    id: "dead-tree",
    name: "Dead or leaning tree overhead",
    category: "terrain",
    risk: "danger",
    prompts: [
      "a photo of a dead tree with broken hanging branches",
      "a photo of a leaning dead tree over a campsite",
    ],
    summary:
      "Dead trees and branches can fall without warning, especially in wind.",
    actions: [
      "Never pitch under dead trees or hanging branches.",
      "Look up before choosing a spot.",
      "Move camp if wind picks up.",
    ],
  },
  {
    id: "dry-creek-bed",
    name: "Dry creek bed or gully",
    category: "terrain",
    risk: "danger",
    prompts: [
      "a photo of a dry creek bed with rocks and sand",
      "a photo of a narrow gully at the bottom of a hill",
    ],
    summary: "Low channels can flood fast, even if rain fell far upstream.",
    actions: [
      "Do not camp in creek beds or gullies.",
      "Pick higher, flat ground away from channels.",
    ],
  },
  {
    id: "rockfall",
    name: "Rockfall zone",
    category: "terrain",
    risk: "danger",
    prompts: [
      "a photo of a steep cliff face with loose rocks and boulders at its base",
      "a photo of a scree slope of loose fallen rocks",
    ],
    summary: "Rocks can fall from cliffs and steep slopes without warning.",
    actions: [
      "Do not camp below cliffs or loose steep slopes.",
      "Cross such slopes quickly and one person at a time.",
    ],
  },
  {
    id: "cliff-edge",
    name: "Cliff edge or steep drop",
    category: "terrain",
    risk: "danger",
    prompts: [
      "a photo of a campsite near the edge of a steep cliff drop",
      "a photo of a steep drop-off next to a trail",
    ],
    summary:
      "Falls from edges are a leading cause of serious camping injuries.",
    actions: [
      "Keep well back from edges, especially at night or in wind.",
      "Camp well away from drops and use a light after dark.",
      "Keep children close.",
    ],
  },
  {
    id: "landslide",
    name: "Landslide-prone slope",
    category: "terrain",
    risk: "danger",
    prompts: [
      "a photo of a steep muddy hillside with a recent landslide",
      "a photo of cracked soil and fallen debris on a slope after heavy rain",
    ],
    summary: "Saturated slopes can give way suddenly.",
    actions: [
      "Do not camp on or below steep slopes after heavy rain.",
      "Move to stable flat ground away from slopes.",
      "Leave at once if you hear rumbling or see mud moving.",
    ],
  },
  {
    id: "floodplain",
    name: "Low riverbank (flood risk)",
    category: "water",
    risk: "danger",
    prompts: [
      "a photo of a campsite on a low riverbank close to the water",
      "a photo of a river with muddy water rising over its bank",
    ],
    summary: "Rivers can rise fast after rain upstream.",
    actions: [
      "Camp well above the high-water line.",
      "Watch for rain and rising or muddy water.",
      "Move to higher ground at once if water rises.",
    ],
  },
  {
    id: "fast-river",
    name: "Fast or rough water",
    category: "water",
    risk: "danger",
    prompts: [
      "a photo of a fast flowing muddy river with a strong current",
      "a photo of rapids and white water",
    ],
    summary:
      "Strong currents can sweep people off their feet in shallow water.",
    actions: [
      "Do not wade or swim in fast water.",
      "Find another crossing or turn back.",
      "Never cross at night or after heavy rain.",
    ],
  },
  {
    id: "boggy-ground",
    name: "Boggy or waterlogged ground",
    category: "terrain",
    risk: "caution",
    prompts: [
      "a photo of a waterlogged marsh or swamp",
      "a photo of soggy muddy ground with standing water",
    ],
    summary: "Wet ground floods tents, chills you and breeds insects.",
    actions: [
      "Avoid camping on soggy ground.",
      "Choose higher, drier ground.",
      "Use repellent against insects.",
    ],
  },
  {
    id: "frozen-lake",
    name: "Thin or unknown ice",
    category: "water",
    risk: "danger",
    prompts: [
      "a photo of a frozen lake with thin ice and cracks",
      "a photo of ice covering a river",
    ],
    summary: "Ice can break without warning.",
    actions: [
      "Do not walk on ice unless local authorities say it is thick enough.",
      "Stay on shore.",
      "If someone falls in, call emergency services and reach or throw from shore. Do not run out.",
    ],
  },
  {
    id: "slippery-rocks",
    name: "Wet slippery rocks",
    category: "terrain",
    risk: "caution",
    prompts: [
      "a photo of wet slippery rocks beside a stream",
      "a photo of mossy rocks at a waterfall",
    ],
    summary: "Wet rocks cause slips, falls and injuries.",
    actions: [
      "Step slowly and wear shoes with good grip.",
      "Avoid rock hopping near drops or waterfall edges.",
    ],
  },
  {
    id: "tidal-beach",
    name: "Beach below high tide line",
    category: "water",
    risk: "danger",
    prompts: [
      "a photo of a beach campsite close to the waves",
      "a photo of a tidal mudflat at low tide",
    ],
    summary: "Tides can flood camps and cut off routes.",
    actions: [
      "Camp above the high-tide line and check tide times.",
      "Do not cross tidal flats without checking tides.",
    ],
  },
  {
    id: "stagnant-water",
    name: "Stagnant or dirty water",
    category: "water",
    risk: "caution",
    prompts: [
      "a photo of murky green stagnant pond water",
      "a photo of still dirty water with algae",
    ],
    summary: "Can make you sick if drunk and breeds mosquitoes.",
    actions: [
      "Do not drink untreated water, even if it looks clear.",
      "Boil for at least 1 minute or use a proper filter or purifier.",
      "Camp away from stagnant water.",
    ],
  },

  // weather and fire
  {
    id: "storm-lightning",
    name: "Storm or lightning risk",
    category: "weather",
    risk: "danger",
    prompts: [
      "a photo of dark thunderstorm clouds over a campsite",
      "a photo of lightning striking over hills",
      "a photo of an exposed hilltop or ridge with no cover",
    ],
    summary: "Lightning strikes exposed ground and tall objects.",
    actions: [
      "When you hear thunder, move to a vehicle or low, sheltered ground.",
      "Avoid hilltops, open fields, lone trees and water. A tent does not protect from lightning.",
      "Spread out the group and wait 30 minutes after the last thunder.",
    ],
  },
  {
    id: "wildfire",
    name: "Wildfire or heavy smoke",
    category: "fire",
    risk: "critical",
    prompts: [
      "a photo of wildfire smoke rising over a forest",
      "a photo of flames spreading through dry brush",
    ],
    summary: "Wildfires move fast and smoke harms breathing.",
    actions: [
      "Leave at once, away from the fire and smoke, and follow evacuation orders.",
      "Call emergency services if you can.",
      "Do not drive into thick smoke.",
    ],
  },
  {
    id: "campfire-risk",
    name: "Risky campfire",
    category: "fire",
    risk: "caution",
    prompts: [
      "a photo of a campfire burning near a tent",
      "a photo of an unattended campfire next to dry grass",
    ],
    summary: "Sparks and embers start wildfires and burn tents.",
    actions: [
      "Keep fires small, in a ring and well away from tents and dry plants.",
      "Never leave a fire unattended.",
      "Put it out fully with water and stir until cold to the touch.",
    ],
  },

  // camp habits
  {
    id: "food-left-out",
    name: "Food or trash left out",
    category: "camp",
    risk: "caution",
    prompts: [
      "a photo of food and trash left on a campsite picnic table",
      "a photo of open food containers and garbage bags near a tent",
    ],
    summary: "Food attracts animals, from ants to bears.",
    actions: [
      "Store food and trash sealed, away from your tent (vehicle, bear box or hung).",
      "Clean the cooking area after every meal.",
      "Never feed wildlife.",
    ],
  },

  // good signs
  {
    id: "good-tent-site",
    name: "Good tent site features",
    category: "site",
    risk: "good",
    prompts: [
      "a photo of a flat dry grassy clearing suitable for pitching a tent",
      "a photo of a level cleared campsite with open ground",
    ],
    summary: "Flat, dry, cleared ground is a good place to pitch.",
    actions: [
      "Still look up for dead branches and hanging nests.",
      "Check drainage and avoid low spots that collect water.",
      "Follow local camping rules.",
    ],
  },
  {
    id: "clear-stream",
    name: "Clear flowing water",
    category: "water",
    risk: "good",
    prompts: [
      "a photo of a clear shallow stream with flowing water over pebbles",
      "a photo of a clean mountain spring",
    ],
    summary: "Flowing water is a useful water source.",
    actions: [
      "Treat all water before drinking: filter, boil or purify.",
      "Collect water upstream of camp and away from animal trails.",
      "Camp away from the bank in case of rising water.",
    ],
  },
  {
    id: "fire-ring",
    name: "Established fire ring",
    category: "fire",
    risk: "good",
    prompts: [
      "a photo of a stone fire ring at a campsite",
      "a photo of a designated fire pit with a metal grate",
    ],
    summary: "Existing fire rings lower wildfire risk.",
    actions: [
      "Use existing rings and check for fire bans first.",
      "Keep the fire small and never leave it unattended.",
      "Put it out fully with water before sleeping or leaving.",
    ],
  },
  {
    id: "marked-trail",
    name: "Marked trail",
    category: "site",
    risk: "good",
    prompts: [
      "a photo of a marked hiking trail with a signpost",
      "a photo of a trail marker painted on a tree",
    ],
    summary: "Marked trails lower the risk of getting lost.",
    actions: [
      "Stay on marked trails.",
      "Carry an offline map and tell someone your route.",
      "Check the weather before you go.",
    ],
  },
];

export const HARMLESS: { name: string; prompt: string }[] = [
  { name: "Grass", prompt: "a photo of green grass" },
  { name: "Tree leaves", prompt: "a photo of ordinary tree leaves" },
  { name: "Bare soil and stones", prompt: "a photo of bare soil and small stones" },
  { name: "Empty bird nest", prompt: "a photo of an empty bird nest made of twigs in a tree" },
  { name: "Bird nest with eggs", prompt: "a photo of a bird nest with eggs" },
  { name: "Pine branches", prompt: "a photo of pine branches with needles" },
  { name: "Dry sticks and twigs", prompt: "a photo of a bunch of dry sticks and twigs" },
  { name: "Spider web", prompt: "a photo of a spider web on a plant" },
  { name: "Tree bark", prompt: "a photo of tree bark" },
  { name: "Bird on a branch", prompt: "a photo of a bird sitting on a branch" },
  { name: "Person's face", prompt: "a photo of a person's face" },
  { name: "Indoor room", prompt: "a photo of an indoor room" },
  { name: "Rock", prompt: "a photo of a rock" },
  { name: "Paved road", prompt: "a photo of a paved road" },
  { name: "Garden flowers", prompt: "a photo of colorful flowers in a garden" },
  { name: "Butterfly", prompt: "a photo of a butterfly on a flower" },
  { name: "Ladybug", prompt: "a photo of a ladybug on a leaf" },
  { name: "Dragonfly", prompt: "a photo of a dragonfly" },
  { name: "Pet dog", prompt: "a photo of a pet dog" },
  { name: "House cat", prompt: "a photo of a house cat" },
  { name: "Coffee cup", prompt: "a photo of a cup of coffee on a table" },
  { name: "Hand", prompt: "a photo of a person's hand" },
  { name: "Potted plant", prompt: "a photo of a green plant in a pot" },
  { name: "Sky and clouds", prompt: "a photo of a blue sky with clouds" },
  { name: "Lawn with weeds", prompt: "a photo of a lawn with a few weeds" },
];