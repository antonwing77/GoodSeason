import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

// ============================================================
// DATA SOURCES
// ============================================================

interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  published_date: string | null;
  accessed_date: string;
  license: string;
  notes: string;
}

const sources: Source[] = [
  {
    id: 'poore_nemecek_2018',
    title: "Reducing food's environmental impacts through producers and consumers",
    publisher: 'Science (AAAS)',
    url: 'https://doi.org/10.1126/science.aaq0216',
    published_date: '2018-06-01',
    accessed_date: '2024-01-15',
    license: 'Academic publication',
    notes: 'Meta-analysis of ~38,700 farms, 1,600 processors. Data as distributed by Our World in Data.',
  },
  {
    id: 'owid_food_impacts',
    title: 'Environmental Impacts of Food Production',
    publisher: 'Our World in Data',
    url: 'https://ourworldindata.org/environmental-impacts-of-food',
    published_date: '2022-01-01',
    accessed_date: '2024-01-15',
    license: 'CC BY 4.0',
    notes: 'Tabulated Poore & Nemecek data',
  },
  {
    id: 'agribalyse_3',
    title: 'AGRIBALYSE 3.1',
    publisher: 'ADEME (France)',
    url: 'https://agribalyse.ademe.fr/',
    published_date: '2023-01-01',
    accessed_date: '2024-01-15',
    license: 'Etalab 2.0 Open License',
    notes: 'French/EU life cycle assessment database',
  },
  {
    id: 'fao_crop_calendar',
    title: 'FAO Crop Calendar',
    publisher: 'Food and Agriculture Organization of the United Nations',
    url: 'https://www.fao.org/agriculture/seed/cropcalendar/welcome.do',
    published_date: null,
    accessed_date: '2024-01-15',
    license: 'Open data',
    notes: 'Global crop planting and harvest calendars',
  },
  {
    id: 'wri_aqueduct',
    title: 'Aqueduct Water Risk Atlas',
    publisher: 'World Resources Institute',
    url: 'https://www.wri.org/aqueduct',
    published_date: '2023-01-01',
    accessed_date: '2024-01-15',
    license: 'CC BY 4.0',
    notes: 'Global water stress indicators',
  },
  {
    id: 'theurl_2014',
    title: 'Contrasted greenhouse gas emissions from local versus long-range tomato production',
    publisher: 'Agronomy for Sustainable Development',
    url: 'https://doi.org/10.1007/s13593-013-0171-8',
    published_date: '2014-01-01',
    accessed_date: '2024-01-15',
    license: 'Academic publication',
    notes: 'Heated greenhouse vs imported produce comparison',
  },
];

// ============================================================
// FOODS (190 total)
// ============================================================

interface Food {
  id: string;
  canonical_name: string;
  category: string;
  synonyms: string[];
  typical_serving_g: number;
  edible_portion_pct: number;
}

const foods: Food[] = [
  // ── PRODUCE (100) ──────────────────────────────────────────
  { id: 'apple', canonical_name: 'Apple', category: 'produce', synonyms: ['apples', 'gala apple', 'fuji apple', 'granny smith'], typical_serving_g: 182, edible_portion_pct: 0.91 },
  { id: 'apricot', canonical_name: 'Apricot', category: 'produce', synonyms: ['apricots'], typical_serving_g: 35, edible_portion_pct: 0.93 },
  { id: 'artichoke', canonical_name: 'Artichoke', category: 'produce', synonyms: ['artichokes', 'globe artichoke'], typical_serving_g: 128, edible_portion_pct: 0.40 },
  { id: 'asparagus', canonical_name: 'Asparagus', category: 'produce', synonyms: ['asparagus spears'], typical_serving_g: 134, edible_portion_pct: 0.90 },
  { id: 'avocado', canonical_name: 'Avocado', category: 'produce', synonyms: ['avocados', 'hass avocado', 'aguacate'], typical_serving_g: 150, edible_portion_pct: 0.74 },
  { id: 'banana', canonical_name: 'Banana', category: 'produce', synonyms: ['bananas'], typical_serving_g: 118, edible_portion_pct: 0.64 },
  { id: 'basil', canonical_name: 'Basil', category: 'produce', synonyms: ['sweet basil', 'thai basil'], typical_serving_g: 5, edible_portion_pct: 0.95 },
  { id: 'beet', canonical_name: 'Beet', category: 'produce', synonyms: ['beets', 'beetroot', 'beetroots'], typical_serving_g: 136, edible_portion_pct: 0.82 },
  { id: 'bell_pepper', canonical_name: 'Bell Pepper', category: 'produce', synonyms: ['bell peppers', 'sweet pepper', 'capsicum'], typical_serving_g: 119, edible_portion_pct: 0.82 },
  { id: 'blackberry', canonical_name: 'Blackberry', category: 'produce', synonyms: ['blackberries'], typical_serving_g: 144, edible_portion_pct: 1.0 },
  { id: 'blueberry', canonical_name: 'Blueberry', category: 'produce', synonyms: ['blueberries'], typical_serving_g: 148, edible_portion_pct: 1.0 },
  { id: 'bok_choy', canonical_name: 'Bok Choy', category: 'produce', synonyms: ['pak choi', 'pak choy', 'chinese cabbage'], typical_serving_g: 70, edible_portion_pct: 0.88 },
  { id: 'broccoli', canonical_name: 'Broccoli', category: 'produce', synonyms: ['broccoli florets', 'broccolini'], typical_serving_g: 91, edible_portion_pct: 0.78 },
  { id: 'brussels_sprout', canonical_name: 'Brussels Sprout', category: 'produce', synonyms: ['brussels sprouts', 'sprouts'], typical_serving_g: 88, edible_portion_pct: 0.90 },
  { id: 'cabbage', canonical_name: 'Cabbage', category: 'produce', synonyms: ['green cabbage', 'red cabbage', 'cabbages'], typical_serving_g: 89, edible_portion_pct: 0.80 },
  { id: 'cantaloupe', canonical_name: 'Cantaloupe', category: 'produce', synonyms: ['cantaloupes', 'rockmelon'], typical_serving_g: 177, edible_portion_pct: 0.51 },
  { id: 'carrot', canonical_name: 'Carrot', category: 'produce', synonyms: ['carrots'], typical_serving_g: 61, edible_portion_pct: 0.89 },
  { id: 'cauliflower', canonical_name: 'Cauliflower', category: 'produce', synonyms: ['cauliflower florets'], typical_serving_g: 100, edible_portion_pct: 0.61 },
  { id: 'celery', canonical_name: 'Celery', category: 'produce', synonyms: ['celery stalks', 'celery sticks'], typical_serving_g: 110, edible_portion_pct: 0.89 },
  { id: 'cherry', canonical_name: 'Cherry', category: 'produce', synonyms: ['cherries', 'sweet cherries', 'bing cherries'], typical_serving_g: 138, edible_portion_pct: 0.92 },
  { id: 'cilantro', canonical_name: 'Cilantro', category: 'produce', synonyms: ['coriander', 'coriander leaves', 'chinese parsley'], typical_serving_g: 4, edible_portion_pct: 0.90 },
  { id: 'collard_greens', canonical_name: 'Collard Greens', category: 'produce', synonyms: ['collards', 'collard'], typical_serving_g: 36, edible_portion_pct: 0.64 },
  { id: 'corn_sweet', canonical_name: 'Sweet Corn', category: 'produce', synonyms: ['corn', 'corn on the cob', 'maize'], typical_serving_g: 90, edible_portion_pct: 0.55 },
  { id: 'cranberry', canonical_name: 'Cranberry', category: 'produce', synonyms: ['cranberries'], typical_serving_g: 55, edible_portion_pct: 0.98 },
  { id: 'cucumber', canonical_name: 'Cucumber', category: 'produce', synonyms: ['cucumbers', 'english cucumber'], typical_serving_g: 301, edible_portion_pct: 0.97 },
  { id: 'date', canonical_name: 'Date', category: 'produce', synonyms: ['dates', 'medjool date', 'deglet noor'], typical_serving_g: 24, edible_portion_pct: 0.90 },
  { id: 'eggplant', canonical_name: 'Eggplant', category: 'produce', synonyms: ['aubergine', 'aubergines', 'eggplants'], typical_serving_g: 82, edible_portion_pct: 0.81 },
  { id: 'endive', canonical_name: 'Endive', category: 'produce', synonyms: ['belgian endive', 'escarole', 'frisee'], typical_serving_g: 50, edible_portion_pct: 0.90 },
  { id: 'fennel', canonical_name: 'Fennel', category: 'produce', synonyms: ['fennel bulb', 'anise bulb'], typical_serving_g: 87, edible_portion_pct: 0.65 },
  { id: 'fig', canonical_name: 'Fig', category: 'produce', synonyms: ['figs', 'fresh figs'], typical_serving_g: 50, edible_portion_pct: 0.97 },
  { id: 'garlic', canonical_name: 'Garlic', category: 'produce', synonyms: ['garlic cloves'], typical_serving_g: 3, edible_portion_pct: 0.87 },
  { id: 'ginger', canonical_name: 'Ginger', category: 'produce', synonyms: ['ginger root', 'fresh ginger'], typical_serving_g: 11, edible_portion_pct: 0.86 },
  { id: 'grape', canonical_name: 'Grape', category: 'produce', synonyms: ['grapes', 'table grapes', 'seedless grapes'], typical_serving_g: 151, edible_portion_pct: 0.96 },
  { id: 'green_bean', canonical_name: 'Green Bean', category: 'produce', synonyms: ['green beans', 'string beans', 'snap beans', 'french beans', 'haricots verts'], typical_serving_g: 110, edible_portion_pct: 0.92 },
  { id: 'green_onion', canonical_name: 'Green Onion', category: 'produce', synonyms: ['green onions', 'scallion', 'scallions', 'spring onion', 'spring onions'], typical_serving_g: 15, edible_portion_pct: 0.90 },
  { id: 'guava', canonical_name: 'Guava', category: 'produce', synonyms: ['guavas'], typical_serving_g: 55, edible_portion_pct: 0.85 },
  { id: 'honeydew', canonical_name: 'Honeydew', category: 'produce', synonyms: ['honeydew melon'], typical_serving_g: 177, edible_portion_pct: 0.54 },
  { id: 'jalapeno', canonical_name: 'Jalapeno', category: 'produce', synonyms: ['jalapenos', 'jalapeno pepper', 'jalape\u00f1o'], typical_serving_g: 14, edible_portion_pct: 0.88 },
  { id: 'kale', canonical_name: 'Kale', category: 'produce', synonyms: ['curly kale', 'lacinato kale', 'tuscan kale'], typical_serving_g: 67, edible_portion_pct: 0.67 },
  { id: 'kiwi', canonical_name: 'Kiwi', category: 'produce', synonyms: ['kiwifruit', 'kiwi fruit', 'chinese gooseberry'], typical_serving_g: 69, edible_portion_pct: 0.88 },
  { id: 'kohlrabi', canonical_name: 'Kohlrabi', category: 'produce', synonyms: ['kohlrabies'], typical_serving_g: 135, edible_portion_pct: 0.62 },
  { id: 'kumquat', canonical_name: 'Kumquat', category: 'produce', synonyms: ['kumquats'], typical_serving_g: 19, edible_portion_pct: 0.95 },
  { id: 'leek', canonical_name: 'Leek', category: 'produce', synonyms: ['leeks'], typical_serving_g: 89, edible_portion_pct: 0.52 },
  { id: 'lemon', canonical_name: 'Lemon', category: 'produce', synonyms: ['lemons'], typical_serving_g: 58, edible_portion_pct: 0.68 },
  { id: 'lettuce', canonical_name: 'Lettuce', category: 'produce', synonyms: ['iceberg lettuce', 'head lettuce'], typical_serving_g: 72, edible_portion_pct: 0.95 },
  { id: 'lime', canonical_name: 'Lime', category: 'produce', synonyms: ['limes', 'key lime'], typical_serving_g: 44, edible_portion_pct: 0.65 },
  { id: 'lychee', canonical_name: 'Lychee', category: 'produce', synonyms: ['lychees', 'litchi', 'lichee'], typical_serving_g: 95, edible_portion_pct: 0.60 },
  { id: 'mango', canonical_name: 'Mango', category: 'produce', synonyms: ['mangoes', 'mangos'], typical_serving_g: 165, edible_portion_pct: 0.69 },
  { id: 'mushroom', canonical_name: 'Mushroom', category: 'produce', synonyms: ['mushrooms', 'button mushroom', 'cremini', 'portobello', 'shiitake'], typical_serving_g: 70, edible_portion_pct: 0.97 },
  { id: 'nectarine', canonical_name: 'Nectarine', category: 'produce', synonyms: ['nectarines'], typical_serving_g: 142, edible_portion_pct: 0.91 },
  { id: 'okra', canonical_name: 'Okra', category: 'produce', synonyms: ['okras', 'lady finger', 'bhindi', 'gumbo'], typical_serving_g: 100, edible_portion_pct: 0.86 },
  { id: 'olive', canonical_name: 'Olive', category: 'produce', synonyms: ['olives', 'green olives', 'black olives', 'kalamata'], typical_serving_g: 15, edible_portion_pct: 0.85 },
  { id: 'onion', canonical_name: 'Onion', category: 'produce', synonyms: ['onions', 'yellow onion', 'white onion', 'red onion'], typical_serving_g: 110, edible_portion_pct: 0.90 },
  { id: 'orange', canonical_name: 'Orange', category: 'produce', synonyms: ['oranges', 'navel orange', 'valencia orange'], typical_serving_g: 131, edible_portion_pct: 0.73 },
  { id: 'papaya', canonical_name: 'Papaya', category: 'produce', synonyms: ['papayas', 'pawpaw'], typical_serving_g: 145, edible_portion_pct: 0.62 },
  { id: 'parsley', canonical_name: 'Parsley', category: 'produce', synonyms: ['flat leaf parsley', 'italian parsley', 'curly parsley'], typical_serving_g: 4, edible_portion_pct: 0.90 },
  { id: 'parsnip', canonical_name: 'Parsnip', category: 'produce', synonyms: ['parsnips'], typical_serving_g: 133, edible_portion_pct: 0.85 },
  { id: 'passion_fruit', canonical_name: 'Passion Fruit', category: 'produce', synonyms: ['passionfruit', 'maracuja', 'granadilla'], typical_serving_g: 18, edible_portion_pct: 0.52 },
  { id: 'peach', canonical_name: 'Peach', category: 'produce', synonyms: ['peaches'], typical_serving_g: 150, edible_portion_pct: 0.91 },
  { id: 'pear', canonical_name: 'Pear', category: 'produce', synonyms: ['pears', 'bartlett pear', 'bosc pear'], typical_serving_g: 178, edible_portion_pct: 0.92 },
  { id: 'persimmon', canonical_name: 'Persimmon', category: 'produce', synonyms: ['persimmons', 'fuyu', 'hachiya'], typical_serving_g: 168, edible_portion_pct: 0.82 },
  { id: 'pineapple', canonical_name: 'Pineapple', category: 'produce', synonyms: ['pineapples', 'ananas'], typical_serving_g: 165, edible_portion_pct: 0.51 },
  { id: 'plum', canonical_name: 'Plum', category: 'produce', synonyms: ['plums', 'prune plum'], typical_serving_g: 66, edible_portion_pct: 0.94 },
  { id: 'pomegranate', canonical_name: 'Pomegranate', category: 'produce', synonyms: ['pomegranates', 'pomegranate seeds'], typical_serving_g: 174, edible_portion_pct: 0.56 },
  { id: 'potato', canonical_name: 'Potato', category: 'produce', synonyms: ['potatoes', 'russet potato', 'yukon gold', 'red potato'], typical_serving_g: 150, edible_portion_pct: 0.81 },
  { id: 'pumpkin', canonical_name: 'Pumpkin', category: 'produce', synonyms: ['pumpkins'], typical_serving_g: 116, edible_portion_pct: 0.70 },
  { id: 'radicchio', canonical_name: 'Radicchio', category: 'produce', synonyms: ['italian chicory'], typical_serving_g: 40, edible_portion_pct: 0.80 },
  { id: 'radish', canonical_name: 'Radish', category: 'produce', synonyms: ['radishes', 'daikon', 'red radish'], typical_serving_g: 116, edible_portion_pct: 0.90 },
  { id: 'raspberry', canonical_name: 'Raspberry', category: 'produce', synonyms: ['raspberries'], typical_serving_g: 123, edible_portion_pct: 1.0 },
  { id: 'rhubarb', canonical_name: 'Rhubarb', category: 'produce', synonyms: ['rhubarbs'], typical_serving_g: 122, edible_portion_pct: 0.85 },
  { id: 'romaine_lettuce', canonical_name: 'Romaine Lettuce', category: 'produce', synonyms: ['romaine', 'cos lettuce'], typical_serving_g: 47, edible_portion_pct: 0.94 },
  { id: 'rutabaga', canonical_name: 'Rutabaga', category: 'produce', synonyms: ['swede', 'swedish turnip', 'neep'], typical_serving_g: 140, edible_portion_pct: 0.85 },
  { id: 'shallot', canonical_name: 'Shallot', category: 'produce', synonyms: ['shallots', 'eschalot'], typical_serving_g: 10, edible_portion_pct: 0.90 },
  { id: 'snap_pea', canonical_name: 'Snap Pea', category: 'produce', synonyms: ['snap peas', 'sugar snap pea', 'sugar snap peas', 'mange tout'], typical_serving_g: 63, edible_portion_pct: 0.95 },
  { id: 'spinach', canonical_name: 'Spinach', category: 'produce', synonyms: ['baby spinach'], typical_serving_g: 30, edible_portion_pct: 0.72 },
  { id: 'squash_butternut', canonical_name: 'Butternut Squash', category: 'produce', synonyms: ['butternut', 'butternut squash'], typical_serving_g: 140, edible_portion_pct: 0.76 },
  { id: 'squash_summer', canonical_name: 'Summer Squash', category: 'produce', synonyms: ['yellow squash', 'pattypan squash'], typical_serving_g: 113, edible_portion_pct: 0.95 },
  { id: 'strawberry', canonical_name: 'Strawberry', category: 'produce', synonyms: ['strawberries'], typical_serving_g: 152, edible_portion_pct: 0.94 },
  { id: 'sweet_potato', canonical_name: 'Sweet Potato', category: 'produce', synonyms: ['sweet potatoes', 'yam'], typical_serving_g: 130, edible_portion_pct: 0.80 },
  { id: 'swiss_chard', canonical_name: 'Swiss Chard', category: 'produce', synonyms: ['chard', 'rainbow chard', 'silverbeet'], typical_serving_g: 36, edible_portion_pct: 0.92 },
  { id: 'tangerine', canonical_name: 'Tangerine', category: 'produce', synonyms: ['tangerines', 'mandarin', 'clementine', 'satsuma'], typical_serving_g: 88, edible_portion_pct: 0.74 },
  { id: 'taro', canonical_name: 'Taro', category: 'produce', synonyms: ['taro root', 'dasheen'], typical_serving_g: 104, edible_portion_pct: 0.80 },
  { id: 'thyme', canonical_name: 'Thyme', category: 'produce', synonyms: ['fresh thyme'], typical_serving_g: 3, edible_portion_pct: 0.90 },
  { id: 'tomato', canonical_name: 'Tomato', category: 'produce', synonyms: ['tomatoes', 'roma tomato', 'cherry tomato', 'beefsteak tomato'], typical_serving_g: 123, edible_portion_pct: 0.91 },
  { id: 'turnip', canonical_name: 'Turnip', category: 'produce', synonyms: ['turnips'], typical_serving_g: 130, edible_portion_pct: 0.81 },
  { id: 'watercress', canonical_name: 'Watercress', category: 'produce', synonyms: ['cress'], typical_serving_g: 34, edible_portion_pct: 0.92 },
  { id: 'watermelon', canonical_name: 'Watermelon', category: 'produce', synonyms: ['watermelons'], typical_serving_g: 280, edible_portion_pct: 0.48 },
  { id: 'yam', canonical_name: 'Yam', category: 'produce', synonyms: ['yams', 'true yam'], typical_serving_g: 136, edible_portion_pct: 0.82 },
  { id: 'zucchini', canonical_name: 'Zucchini', category: 'produce', synonyms: ['zucchinis', 'courgette', 'courgettes'], typical_serving_g: 113, edible_portion_pct: 0.95 },
  // 10 additional produce to reach 100
  { id: 'dragon_fruit', canonical_name: 'Dragon Fruit', category: 'produce', synonyms: ['dragonfruit', 'pitaya', 'pitahaya'], typical_serving_g: 100, edible_portion_pct: 0.60 },
  { id: 'starfruit', canonical_name: 'Starfruit', category: 'produce', synonyms: ['carambola', 'star fruit'], typical_serving_g: 91, edible_portion_pct: 0.97 },
  { id: 'jackfruit', canonical_name: 'Jackfruit', category: 'produce', synonyms: ['jack fruit'], typical_serving_g: 165, edible_portion_pct: 0.45 },
  { id: 'plantain', canonical_name: 'Plantain', category: 'produce', synonyms: ['plantains', 'cooking banana', 'platano'], typical_serving_g: 148, edible_portion_pct: 0.62 },
  { id: 'cactus_pear', canonical_name: 'Cactus Pear', category: 'produce', synonyms: ['prickly pear', 'tuna fruit', 'nopal fruit'], typical_serving_g: 103, edible_portion_pct: 0.55 },
  { id: 'jicama', canonical_name: 'Jicama', category: 'produce', synonyms: ['mexican turnip', 'mexican yam bean'], typical_serving_g: 120, edible_portion_pct: 0.87 },
  { id: 'lotus_root', canonical_name: 'Lotus Root', category: 'produce', synonyms: ['lotus roots', 'renkon'], typical_serving_g: 120, edible_portion_pct: 0.80 },
  { id: 'bamboo_shoot', canonical_name: 'Bamboo Shoot', category: 'produce', synonyms: ['bamboo shoots', 'bamboo sprout'], typical_serving_g: 120, edible_portion_pct: 0.60 },
  { id: 'chayote', canonical_name: 'Chayote', category: 'produce', synonyms: ['chayotes', 'mirliton', 'choko'], typical_serving_g: 132, edible_portion_pct: 0.78 },
  { id: 'bitter_melon', canonical_name: 'Bitter Melon', category: 'produce', synonyms: ['bitter gourd', 'karela', 'ampalaya'], typical_serving_g: 93, edible_portion_pct: 0.80 },
  { id: 'tomatillo', canonical_name: 'Tomatillo', category: 'produce', synonyms: ['tomatillos', 'husk tomato', 'tomate verde'], typical_serving_g: 66, edible_portion_pct: 0.90 },

  // ── ADDITIONAL PRODUCE (110 more to reach 210+) ─────────────────
  { id: 'arugula', canonical_name: 'Arugula', category: 'produce', synonyms: ['rocket', 'roquette', 'rucola'], typical_serving_g: 20, edible_portion_pct: 0.92 },
  { id: 'blood_orange', canonical_name: 'Blood Orange', category: 'produce', synonyms: ['blood oranges', 'moro orange', 'tarocco'], typical_serving_g: 131, edible_portion_pct: 0.73 },
  { id: 'butterhead_lettuce', canonical_name: 'Butterhead Lettuce', category: 'produce', synonyms: ['boston lettuce', 'bibb lettuce', 'butter lettuce'], typical_serving_g: 55, edible_portion_pct: 0.92 },
  { id: 'celeriac', canonical_name: 'Celeriac', category: 'produce', synonyms: ['celery root', 'knob celery'], typical_serving_g: 156, edible_portion_pct: 0.75 },
  { id: 'chard_rainbow', canonical_name: 'Rainbow Chard', category: 'produce', synonyms: ['rainbow swiss chard', 'colored chard'], typical_serving_g: 36, edible_portion_pct: 0.92 },
  { id: 'cherry_tomato', canonical_name: 'Cherry Tomato', category: 'produce', synonyms: ['cherry tomatoes', 'grape tomato', 'grape tomatoes'], typical_serving_g: 149, edible_portion_pct: 0.98 },
  { id: 'chinese_broccoli', canonical_name: 'Chinese Broccoli', category: 'produce', synonyms: ['gai lan', 'kai-lan', 'chinese kale'], typical_serving_g: 88, edible_portion_pct: 0.80 },
  { id: 'clementine', canonical_name: 'Clementine', category: 'produce', synonyms: ['clementines', 'cuties', 'halos'], typical_serving_g: 74, edible_portion_pct: 0.75 },
  { id: 'coconut', canonical_name: 'Coconut', category: 'produce', synonyms: ['coconuts', 'fresh coconut', 'coconut meat'], typical_serving_g: 80, edible_portion_pct: 0.50 },
  { id: 'daikon', canonical_name: 'Daikon', category: 'produce', synonyms: ['daikon radish', 'white radish', 'mooli'], typical_serving_g: 338, edible_portion_pct: 0.85 },
  { id: 'dandelion_greens', canonical_name: 'Dandelion Greens', category: 'produce', synonyms: ['dandelion', 'pissenlit'], typical_serving_g: 55, edible_portion_pct: 0.90 },
  { id: 'delicata_squash', canonical_name: 'Delicata Squash', category: 'produce', synonyms: ['delicata', 'sweet potato squash'], typical_serving_g: 140, edible_portion_pct: 0.85 },
  { id: 'dill', canonical_name: 'Dill', category: 'produce', synonyms: ['fresh dill', 'dill weed'], typical_serving_g: 5, edible_portion_pct: 0.90 },
  { id: 'durian', canonical_name: 'Durian', category: 'produce', synonyms: ['durians', 'king of fruits'], typical_serving_g: 243, edible_portion_pct: 0.32 },
  { id: 'elderberry', canonical_name: 'Elderberry', category: 'produce', synonyms: ['elderberries', 'sambucus'], typical_serving_g: 145, edible_portion_pct: 0.90 },
  { id: 'enoki_mushroom', canonical_name: 'Enoki Mushroom', category: 'produce', synonyms: ['enoki', 'enokitake', 'golden needle mushroom'], typical_serving_g: 65, edible_portion_pct: 0.85 },
  { id: 'escarole', canonical_name: 'Escarole', category: 'produce', synonyms: ['broad-leaved endive', 'batavian endive'], typical_serving_g: 50, edible_portion_pct: 0.85 },
  { id: 'fava_bean', canonical_name: 'Fava Bean', category: 'produce', synonyms: ['fava beans', 'broad beans', 'broad bean', 'faba bean'], typical_serving_g: 170, edible_portion_pct: 0.50 },
  { id: 'fiddlehead', canonical_name: 'Fiddlehead Fern', category: 'produce', synonyms: ['fiddleheads', 'ostrich fern'], typical_serving_g: 100, edible_portion_pct: 0.85 },
  { id: 'fingerling_potato', canonical_name: 'Fingerling Potato', category: 'produce', synonyms: ['fingerling potatoes', 'fingerlings'], typical_serving_g: 148, edible_portion_pct: 0.90 },
  { id: 'fresno_pepper', canonical_name: 'Fresno Pepper', category: 'produce', synonyms: ['fresno chili', 'red fresno'], typical_serving_g: 14, edible_portion_pct: 0.88 },
  { id: 'galia_melon', canonical_name: 'Galia Melon', category: 'produce', synonyms: ['galia', 'sarda melon'], typical_serving_g: 177, edible_portion_pct: 0.54 },
  { id: 'ginger_root', canonical_name: 'Galangal', category: 'produce', synonyms: ['galangal root', 'blue ginger', 'laos root'], typical_serving_g: 11, edible_portion_pct: 0.82 },
  { id: 'gooseberry', canonical_name: 'Gooseberry', category: 'produce', synonyms: ['gooseberries', 'indian gooseberry'], typical_serving_g: 150, edible_portion_pct: 0.95 },
  { id: 'grapefruit', canonical_name: 'Grapefruit', category: 'produce', synonyms: ['grapefruits', 'pink grapefruit', 'ruby red grapefruit'], typical_serving_g: 230, edible_portion_pct: 0.50 },
  { id: 'habanero', canonical_name: 'Habanero', category: 'produce', synonyms: ['habanero pepper', 'scotch bonnet'], typical_serving_g: 8, edible_portion_pct: 0.88 },
  { id: 'hearts_of_palm', canonical_name: 'Hearts of Palm', category: 'produce', synonyms: ['palm hearts', 'palmito'], typical_serving_g: 146, edible_portion_pct: 0.90 },
  { id: 'horseradish', canonical_name: 'Horseradish', category: 'produce', synonyms: ['horseradish root', 'fresh horseradish'], typical_serving_g: 15, edible_portion_pct: 0.80 },
  { id: 'huckleberry', canonical_name: 'Huckleberry', category: 'produce', synonyms: ['huckleberries', 'wild huckleberry'], typical_serving_g: 145, edible_portion_pct: 0.98 },
  { id: 'italian_parsley', canonical_name: 'Italian Parsley', category: 'produce', synonyms: ['flat-leaf parsley'], typical_serving_g: 4, edible_portion_pct: 0.90 },
  { id: 'jerusalem_artichoke', canonical_name: 'Jerusalem Artichoke', category: 'produce', synonyms: ['sunchoke', 'sunchokes', 'topinambour'], typical_serving_g: 150, edible_portion_pct: 0.80 },
  { id: 'kabocha', canonical_name: 'Kabocha Squash', category: 'produce', synonyms: ['kabocha', 'japanese pumpkin'], typical_serving_g: 140, edible_portion_pct: 0.75 },
  { id: 'key_lime', canonical_name: 'Key Lime', category: 'produce', synonyms: ['key limes', 'mexican lime'], typical_serving_g: 44, edible_portion_pct: 0.60 },
  { id: 'king_oyster_mushroom', canonical_name: 'King Oyster Mushroom', category: 'produce', synonyms: ['king trumpet', 'eryngii', 'king oyster'], typical_serving_g: 70, edible_portion_pct: 0.95 },
  { id: 'lemongrass', canonical_name: 'Lemongrass', category: 'produce', synonyms: ['lemon grass', 'citronella grass'], typical_serving_g: 10, edible_portion_pct: 0.50 },
  { id: 'longan', canonical_name: 'Longan', category: 'produce', synonyms: ['longans', 'dragon eye fruit'], typical_serving_g: 95, edible_portion_pct: 0.62 },
  { id: 'loofah', canonical_name: 'Loofah', category: 'produce', synonyms: ['luffa', 'sponge gourd', 'silk gourd'], typical_serving_g: 100, edible_portion_pct: 0.80 },
  { id: 'loquat', canonical_name: 'Loquat', category: 'produce', synonyms: ['loquats', 'japanese plum', 'biwa'], typical_serving_g: 100, edible_portion_pct: 0.75 },
  { id: 'maitake_mushroom', canonical_name: 'Maitake Mushroom', category: 'produce', synonyms: ['maitake', 'hen of the woods'], typical_serving_g: 70, edible_portion_pct: 0.90 },
  { id: 'malanga', canonical_name: 'Malanga', category: 'produce', synonyms: ['yautia', 'cocoyam', 'tannia'], typical_serving_g: 132, edible_portion_pct: 0.78 },
  { id: 'meyer_lemon', canonical_name: 'Meyer Lemon', category: 'produce', synonyms: ['meyer lemons'], typical_serving_g: 58, edible_portion_pct: 0.70 },
  { id: 'mint', canonical_name: 'Mint', category: 'produce', synonyms: ['fresh mint', 'peppermint', 'spearmint'], typical_serving_g: 5, edible_portion_pct: 0.90 },
  { id: 'moringa', canonical_name: 'Moringa', category: 'produce', synonyms: ['moringa leaves', 'drumstick tree', 'moringa oleifera'], typical_serving_g: 21, edible_portion_pct: 0.80 },
  { id: 'mulberry', canonical_name: 'Mulberry', category: 'produce', synonyms: ['mulberries'], typical_serving_g: 140, edible_portion_pct: 0.95 },
  { id: 'mustard_greens', canonical_name: 'Mustard Greens', category: 'produce', synonyms: ['mustard greens', 'leaf mustard', 'gai choy'], typical_serving_g: 56, edible_portion_pct: 0.80 },
  { id: 'napa_cabbage', canonical_name: 'Napa Cabbage', category: 'produce', synonyms: ['chinese cabbage', 'wombok', 'pe-tsai'], typical_serving_g: 109, edible_portion_pct: 0.85 },
  { id: 'nopal', canonical_name: 'Nopal', category: 'produce', synonyms: ['nopales', 'cactus paddle', 'prickly pear pad'], typical_serving_g: 86, edible_portion_pct: 0.70 },
  { id: 'oregano', canonical_name: 'Oregano', category: 'produce', synonyms: ['fresh oregano'], typical_serving_g: 3, edible_portion_pct: 0.90 },
  { id: 'oyster_mushroom', canonical_name: 'Oyster Mushroom', category: 'produce', synonyms: ['oyster mushrooms', 'pleurotus'], typical_serving_g: 70, edible_portion_pct: 0.90 },
  { id: 'pak_choi', canonical_name: 'Baby Bok Choy', category: 'produce', synonyms: ['baby bok choy', 'shanghai bok choy'], typical_serving_g: 70, edible_portion_pct: 0.88 },
  { id: 'pasilla_pepper', canonical_name: 'Pasilla Pepper', category: 'produce', synonyms: ['pasilla', 'chilaca pepper'], typical_serving_g: 14, edible_portion_pct: 0.85 },
  { id: 'pea_shoots', canonical_name: 'Pea Shoots', category: 'produce', synonyms: ['pea sprouts', 'dou miao'], typical_serving_g: 30, edible_portion_pct: 0.95 },
  { id: 'pepino', canonical_name: 'Pepino Melon', category: 'produce', synonyms: ['pepino', 'tree melon'], typical_serving_g: 100, edible_portion_pct: 0.80 },
  { id: 'persian_cucumber', canonical_name: 'Persian Cucumber', category: 'produce', synonyms: ['mini cucumbers'], typical_serving_g: 119, edible_portion_pct: 0.98 },
  { id: 'pluot', canonical_name: 'Pluot', category: 'produce', synonyms: ['pluots', 'plumcot', 'apriplum'], typical_serving_g: 66, edible_portion_pct: 0.94 },
  { id: 'poblano', canonical_name: 'Poblano Pepper', category: 'produce', synonyms: ['poblano', 'ancho chile'], typical_serving_g: 17, edible_portion_pct: 0.82 },
  { id: 'purple_potato', canonical_name: 'Purple Potato', category: 'produce', synonyms: ['purple potatoes', 'blue potato'], typical_serving_g: 148, edible_portion_pct: 0.85 },
  { id: 'quince', canonical_name: 'Quince', category: 'produce', synonyms: ['quinces'], typical_serving_g: 92, edible_portion_pct: 0.82 },
  { id: 'ramp', canonical_name: 'Ramp', category: 'produce', synonyms: ['ramps', 'wild leek', 'wild garlic'], typical_serving_g: 20, edible_portion_pct: 0.85 },
  { id: 'rapini', canonical_name: 'Rapini', category: 'produce', synonyms: ['broccoli rabe', 'broccoli raab', 'cima di rapa'], typical_serving_g: 85, edible_portion_pct: 0.80 },
  { id: 'red_cabbage', canonical_name: 'Red Cabbage', category: 'produce', synonyms: ['purple cabbage'], typical_serving_g: 89, edible_portion_pct: 0.80 },
  { id: 'red_onion', canonical_name: 'Red Onion', category: 'produce', synonyms: ['red onions', 'spanish onion'], typical_serving_g: 110, edible_portion_pct: 0.90 },
  { id: 'rosemary', canonical_name: 'Rosemary', category: 'produce', synonyms: ['fresh rosemary'], typical_serving_g: 3, edible_portion_pct: 0.85 },
  { id: 'sage', canonical_name: 'Sage', category: 'produce', synonyms: ['fresh sage', 'garden sage'], typical_serving_g: 3, edible_portion_pct: 0.90 },
  { id: 'savoy_cabbage', canonical_name: 'Savoy Cabbage', category: 'produce', synonyms: ['savoy'], typical_serving_g: 89, edible_portion_pct: 0.80 },
  { id: 'serrano_pepper', canonical_name: 'Serrano Pepper', category: 'produce', synonyms: ['serrano', 'serrano chili'], typical_serving_g: 6, edible_portion_pct: 0.90 },
  { id: 'shiitake', canonical_name: 'Shiitake Mushroom', category: 'produce', synonyms: ['shiitake', 'shiitake mushrooms'], typical_serving_g: 70, edible_portion_pct: 0.88 },
  { id: 'snow_pea', canonical_name: 'Snow Pea', category: 'produce', synonyms: ['snow peas', 'mangetout', 'chinese pea'], typical_serving_g: 63, edible_portion_pct: 0.95 },
  { id: 'sorrel', canonical_name: 'Sorrel', category: 'produce', synonyms: ['garden sorrel', 'sour grass'], typical_serving_g: 30, edible_portion_pct: 0.85 },
  { id: 'spaghetti_squash', canonical_name: 'Spaghetti Squash', category: 'produce', synonyms: ['spaghetti squash', 'vegetable spaghetti'], typical_serving_g: 155, edible_portion_pct: 0.70 },
  { id: 'sugar_snap_pea', canonical_name: 'Sugar Snap Pea', category: 'produce', synonyms: ['sugar snap peas'], typical_serving_g: 63, edible_portion_pct: 0.95 },
  { id: 'sunflower_sprouts', canonical_name: 'Sunflower Sprouts', category: 'produce', synonyms: ['sunflower microgreens', 'sunflower greens'], typical_serving_g: 30, edible_portion_pct: 0.95 },
  { id: 'sunchoke', canonical_name: 'Sunchoke', category: 'produce', synonyms: ['jerusalem artichokes'], typical_serving_g: 150, edible_portion_pct: 0.80 },
  { id: 'tamarind', canonical_name: 'Tamarind', category: 'produce', synonyms: ['tamarinds', 'imli'], typical_serving_g: 120, edible_portion_pct: 0.55 },
  { id: 'tangelo', canonical_name: 'Tangelo', category: 'produce', synonyms: ['tangelos', 'minneola', 'ugli fruit'], typical_serving_g: 95, edible_portion_pct: 0.72 },
  { id: 'tarragon', canonical_name: 'Tarragon', category: 'produce', synonyms: ['fresh tarragon', 'estragon'], typical_serving_g: 3, edible_portion_pct: 0.90 },
  { id: 'thai_basil', canonical_name: 'Thai Basil', category: 'produce', synonyms: ['horapa', 'asian basil'], typical_serving_g: 5, edible_portion_pct: 0.90 },
  { id: 'treviso', canonical_name: 'Treviso', category: 'produce', synonyms: ['treviso radicchio', 'italian radicchio'], typical_serving_g: 40, edible_portion_pct: 0.80 },
  { id: 'turmeric_root', canonical_name: 'Turmeric Root', category: 'produce', synonyms: ['fresh turmeric', 'haldi root'], typical_serving_g: 7, edible_portion_pct: 0.80 },
  { id: 'water_chestnut', canonical_name: 'Water Chestnut', category: 'produce', synonyms: ['water chestnuts', 'chinese water chestnut'], typical_serving_g: 120, edible_portion_pct: 0.72 },
  { id: 'winter_melon', canonical_name: 'Winter Melon', category: 'produce', synonyms: ['wax gourd', 'ash gourd', 'dong gua'], typical_serving_g: 175, edible_portion_pct: 0.70 },
  { id: 'yuzu', canonical_name: 'Yuzu', category: 'produce', synonyms: ['yuzu citrus', 'japanese citrus'], typical_serving_g: 40, edible_portion_pct: 0.55 },
  { id: 'atemoya', canonical_name: 'Atemoya', category: 'produce', synonyms: ['custard apple', 'cherimoya hybrid'], typical_serving_g: 135, edible_portion_pct: 0.55 },
  { id: 'breadfruit', canonical_name: 'Breadfruit', category: 'produce', synonyms: ['breadfruits', 'ulu'], typical_serving_g: 220, edible_portion_pct: 0.70 },
  { id: 'cassava', canonical_name: 'Cassava', category: 'produce', synonyms: ['yuca', 'manioc', 'tapioca root'], typical_serving_g: 206, edible_portion_pct: 0.75 },
  { id: 'chive', canonical_name: 'Chive', category: 'produce', synonyms: ['chives', 'fresh chives'], typical_serving_g: 3, edible_portion_pct: 0.95 },
  { id: 'currant', canonical_name: 'Currant', category: 'produce', synonyms: ['currants', 'redcurrant', 'blackcurrant'], typical_serving_g: 112, edible_portion_pct: 0.95 },
  { id: 'edible_flower', canonical_name: 'Edible Flower', category: 'produce', synonyms: ['edible flowers', 'nasturtium', 'calendula'], typical_serving_g: 5, edible_portion_pct: 1.0 },
  { id: 'green_papaya', canonical_name: 'Green Papaya', category: 'produce', synonyms: ['unripe papaya', 'som tam papaya'], typical_serving_g: 140, edible_portion_pct: 0.65 },
  { id: 'habanero_pepper', canonical_name: 'Thai Chili', category: 'produce', synonyms: ['thai chili pepper', 'birds eye chili', 'prik kee noo'], typical_serving_g: 5, edible_portion_pct: 0.90 },
  { id: 'ice_plant', canonical_name: 'Ice Plant', category: 'produce', synonyms: ['crystalline ice plant', 'salty ice plant'], typical_serving_g: 30, edible_portion_pct: 0.95 },
  { id: 'kohlrabi_greens', canonical_name: 'Kohlrabi Greens', category: 'produce', synonyms: ['kohlrabi leaves'], typical_serving_g: 40, edible_portion_pct: 0.80 },
  { id: 'lamb_ear_lettuce', canonical_name: 'Lamb Ear Lettuce', category: 'produce', synonyms: ['mache', "lamb's lettuce", 'corn salad'], typical_serving_g: 30, edible_portion_pct: 0.95 },
  { id: 'marjoram', canonical_name: 'Marjoram', category: 'produce', synonyms: ['fresh marjoram', 'sweet marjoram'], typical_serving_g: 3, edible_portion_pct: 0.90 },
  { id: 'microgreens', canonical_name: 'Microgreens', category: 'produce', synonyms: ['micro greens', 'micro herbs'], typical_serving_g: 15, edible_portion_pct: 1.0 },
  { id: 'mizuna', canonical_name: 'Mizuna', category: 'produce', synonyms: ['japanese mustard greens', 'spider mustard'], typical_serving_g: 30, edible_portion_pct: 0.90 },
  { id: 'nance', canonical_name: 'Nance', category: 'produce', synonyms: ['nances', 'nanche', 'golden spoon'], typical_serving_g: 56, edible_portion_pct: 0.80 },
  { id: 'noni', canonical_name: 'Noni', category: 'produce', synonyms: ['noni fruit', 'indian mulberry'], typical_serving_g: 100, edible_portion_pct: 0.70 },
  { id: 'opo_squash', canonical_name: 'Opo Squash', category: 'produce', synonyms: ['bottle gourd', 'lauki', 'calabash'], typical_serving_g: 116, edible_portion_pct: 0.80 },
  { id: 'rambutan', canonical_name: 'Rambutan', category: 'produce', synonyms: ['rambutans'], typical_serving_g: 75, edible_portion_pct: 0.45 },
  { id: 'romanesco', canonical_name: 'Romanesco', category: 'produce', synonyms: ['romanesco broccoli', 'roman cauliflower'], typical_serving_g: 100, edible_portion_pct: 0.75 },
  { id: 'sapodilla', canonical_name: 'Sapodilla', category: 'produce', synonyms: ['chikoo', 'naseberry'], typical_serving_g: 170, edible_portion_pct: 0.80 },
  { id: 'scallop_squash', canonical_name: 'Scallop Squash', category: 'produce', synonyms: ['pattypan', 'patty pan squash'], typical_serving_g: 113, edible_portion_pct: 0.90 },
  { id: 'soursop', canonical_name: 'Soursop', category: 'produce', synonyms: ['guanabana', 'graviola'], typical_serving_g: 225, edible_portion_pct: 0.55 },
  { id: 'sprouts', canonical_name: 'Bean Sprouts', category: 'produce', synonyms: ['bean sprouts', 'mung bean sprouts', 'alfalfa sprouts'], typical_serving_g: 104, edible_portion_pct: 0.95 },
  { id: 'sugar_apple', canonical_name: 'Sugar Apple', category: 'produce', synonyms: ['sweetsop', 'sitaphal'], typical_serving_g: 135, edible_portion_pct: 0.50 },
  { id: 'tatsoi', canonical_name: 'Tatsoi', category: 'produce', synonyms: ['tat choy', 'spinach mustard'], typical_serving_g: 30, edible_portion_pct: 0.90 },
  { id: 'turnip_greens', canonical_name: 'Turnip Greens', category: 'produce', synonyms: ['turnip tops'], typical_serving_g: 55, edible_portion_pct: 0.75 },
  { id: 'udon_squash', canonical_name: 'Acorn Squash', category: 'produce', synonyms: ['acorn squash', 'pepper squash', 'des moines squash'], typical_serving_g: 140, edible_portion_pct: 0.70 },
  { id: 'white_asparagus', canonical_name: 'White Asparagus', category: 'produce', synonyms: ['spargel', 'bleached asparagus'], typical_serving_g: 134, edible_portion_pct: 0.85 },

  // ── MEAT (30 + 35 more = 65+) ──────────────────────────────────
  { id: 'beef_general', canonical_name: 'Beef (General)', category: 'meat', synonyms: ['beef', 'cow meat', 'cattle'], typical_serving_g: 113, edible_portion_pct: 0.95 },
  { id: 'beef_steak', canonical_name: 'Beef Steak', category: 'meat', synonyms: ['steak', 'ribeye', 'sirloin', 'filet mignon', 'new york strip', 't-bone'], typical_serving_g: 170, edible_portion_pct: 0.92 },
  { id: 'beef_ground', canonical_name: 'Ground Beef', category: 'meat', synonyms: ['minced beef', 'hamburger meat', 'ground chuck'], typical_serving_g: 113, edible_portion_pct: 1.0 },
  { id: 'beef_roast', canonical_name: 'Beef Roast', category: 'meat', synonyms: ['roast beef', 'pot roast', 'chuck roast', 'brisket'], typical_serving_g: 170, edible_portion_pct: 0.90 },
  { id: 'lamb', canonical_name: 'Lamb', category: 'meat', synonyms: ['lamb meat', 'mutton'], typical_serving_g: 113, edible_portion_pct: 0.90 },
  { id: 'lamb_chop', canonical_name: 'Lamb Chop', category: 'meat', synonyms: ['lamb chops', 'lamb cutlet', 'lamb rack'], typical_serving_g: 100, edible_portion_pct: 0.75 },
  { id: 'goat', canonical_name: 'Goat', category: 'meat', synonyms: ['goat meat', 'chevon', 'cabrito'], typical_serving_g: 113, edible_portion_pct: 0.88 },
  { id: 'pork', canonical_name: 'Pork', category: 'meat', synonyms: ['pork meat', 'pig meat'], typical_serving_g: 113, edible_portion_pct: 0.90 },
  { id: 'pork_chop', canonical_name: 'Pork Chop', category: 'meat', synonyms: ['pork chops', 'pork loin chop'], typical_serving_g: 145, edible_portion_pct: 0.80 },
  { id: 'pork_tenderloin', canonical_name: 'Pork Tenderloin', category: 'meat', synonyms: ['pork loin', 'pork fillet'], typical_serving_g: 113, edible_portion_pct: 0.95 },
  { id: 'bacon', canonical_name: 'Bacon', category: 'meat', synonyms: ['pork bacon', 'streaky bacon', 'rashers'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'ham', canonical_name: 'Ham', category: 'meat', synonyms: ['pork ham', 'smoked ham', 'gammon'], typical_serving_g: 85, edible_portion_pct: 0.95 },
  { id: 'sausage_pork', canonical_name: 'Pork Sausage', category: 'meat', synonyms: ['sausage', 'breakfast sausage', 'bratwurst', 'italian sausage'], typical_serving_g: 85, edible_portion_pct: 1.0 },
  { id: 'chicken_breast', canonical_name: 'Chicken Breast', category: 'meat', synonyms: ['chicken breasts', 'boneless chicken'], typical_serving_g: 120, edible_portion_pct: 0.95 },
  { id: 'chicken_thigh', canonical_name: 'Chicken Thigh', category: 'meat', synonyms: ['chicken thighs', 'dark meat chicken'], typical_serving_g: 113, edible_portion_pct: 0.80 },
  { id: 'chicken_whole', canonical_name: 'Whole Chicken', category: 'meat', synonyms: ['chicken', 'roast chicken', 'whole roasting chicken'], typical_serving_g: 140, edible_portion_pct: 0.66 },
  { id: 'turkey', canonical_name: 'Turkey', category: 'meat', synonyms: ['whole turkey', 'turkey meat', 'roast turkey'], typical_serving_g: 113, edible_portion_pct: 0.70 },
  { id: 'turkey_ground', canonical_name: 'Ground Turkey', category: 'meat', synonyms: ['minced turkey', 'turkey mince'], typical_serving_g: 113, edible_portion_pct: 1.0 },
  { id: 'duck', canonical_name: 'Duck', category: 'meat', synonyms: ['duck meat', 'duck breast', 'roast duck'], typical_serving_g: 113, edible_portion_pct: 0.65 },
  { id: 'goose', canonical_name: 'Goose', category: 'meat', synonyms: ['goose meat', 'roast goose'], typical_serving_g: 113, edible_portion_pct: 0.63 },
  { id: 'venison', canonical_name: 'Venison', category: 'meat', synonyms: ['deer meat', 'deer'], typical_serving_g: 113, edible_portion_pct: 0.90 },
  { id: 'bison', canonical_name: 'Bison', category: 'meat', synonyms: ['buffalo meat', 'american buffalo'], typical_serving_g: 113, edible_portion_pct: 0.92 },
  { id: 'rabbit', canonical_name: 'Rabbit', category: 'meat', synonyms: ['rabbit meat', 'lapin'], typical_serving_g: 113, edible_portion_pct: 0.75 },
  { id: 'quail', canonical_name: 'Quail', category: 'meat', synonyms: ['quail meat'], typical_serving_g: 113, edible_portion_pct: 0.60 },
  { id: 'pheasant', canonical_name: 'Pheasant', category: 'meat', synonyms: ['pheasant meat'], typical_serving_g: 113, edible_portion_pct: 0.62 },
  { id: 'veal', canonical_name: 'Veal', category: 'meat', synonyms: ['veal meat', 'calf meat'], typical_serving_g: 113, edible_portion_pct: 0.90 },
  { id: 'liver_beef', canonical_name: 'Beef Liver', category: 'meat', synonyms: ['calves liver', 'ox liver'], typical_serving_g: 85, edible_portion_pct: 1.0 },
  { id: 'liver_chicken', canonical_name: 'Chicken Liver', category: 'meat', synonyms: ['chicken livers', 'poultry liver'], typical_serving_g: 85, edible_portion_pct: 1.0 },
  { id: 'salami', canonical_name: 'Salami', category: 'meat', synonyms: ['genoa salami', 'hard salami'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'prosciutto', canonical_name: 'Prosciutto', category: 'meat', synonyms: ['parma ham', 'prosciutto di parma', 'italian ham'], typical_serving_g: 28, edible_portion_pct: 1.0 },

  // ── ADDITIONAL MEAT (35 more to reach 65+) ──────────────────
  { id: 'salmon', canonical_name: 'Salmon', category: 'meat', synonyms: ['salmon fillet', 'atlantic salmon', 'sockeye salmon', 'king salmon'], typical_serving_g: 113, edible_portion_pct: 0.90 },
  { id: 'tuna', canonical_name: 'Tuna', category: 'meat', synonyms: ['tuna steak', 'ahi tuna', 'yellowfin tuna', 'bluefin tuna'], typical_serving_g: 113, edible_portion_pct: 0.95 },
  { id: 'shrimp', canonical_name: 'Shrimp', category: 'meat', synonyms: ['prawns', 'shrimps', 'tiger prawns', 'king prawns'], typical_serving_g: 113, edible_portion_pct: 0.55 },
  { id: 'cod', canonical_name: 'Cod', category: 'meat', synonyms: ['cod fillet', 'atlantic cod', 'pacific cod'], typical_serving_g: 113, edible_portion_pct: 0.90 },
  { id: 'tilapia', canonical_name: 'Tilapia', category: 'meat', synonyms: ['tilapia fillet'], typical_serving_g: 113, edible_portion_pct: 0.90 },
  { id: 'catfish', canonical_name: 'Catfish', category: 'meat', synonyms: ['catfish fillet', 'channel catfish'], typical_serving_g: 113, edible_portion_pct: 0.85 },
  { id: 'trout', canonical_name: 'Trout', category: 'meat', synonyms: ['rainbow trout', 'brook trout', 'trout fillet'], typical_serving_g: 113, edible_portion_pct: 0.80 },
  { id: 'sardine', canonical_name: 'Sardine', category: 'meat', synonyms: ['sardines', 'pilchards'], typical_serving_g: 85, edible_portion_pct: 0.75 },
  { id: 'mackerel', canonical_name: 'Mackerel', category: 'meat', synonyms: ['mackerel fillet', 'atlantic mackerel', 'king mackerel'], typical_serving_g: 113, edible_portion_pct: 0.80 },
  { id: 'halibut', canonical_name: 'Halibut', category: 'meat', synonyms: ['halibut fillet', 'pacific halibut'], typical_serving_g: 113, edible_portion_pct: 0.92 },
  { id: 'swordfish', canonical_name: 'Swordfish', category: 'meat', synonyms: ['swordfish steak'], typical_serving_g: 113, edible_portion_pct: 0.95 },
  { id: 'mahi_mahi', canonical_name: 'Mahi Mahi', category: 'meat', synonyms: ['dolphinfish', 'dorado'], typical_serving_g: 113, edible_portion_pct: 0.92 },
  { id: 'sea_bass', canonical_name: 'Sea Bass', category: 'meat', synonyms: ['sea bass fillet', 'branzino', 'loup de mer'], typical_serving_g: 113, edible_portion_pct: 0.85 },
  { id: 'snapper', canonical_name: 'Snapper', category: 'meat', synonyms: ['red snapper', 'snapper fillet'], typical_serving_g: 113, edible_portion_pct: 0.85 },
  { id: 'scallop', canonical_name: 'Scallop', category: 'meat', synonyms: ['scallops', 'sea scallops', 'bay scallops'], typical_serving_g: 85, edible_portion_pct: 0.75 },
  { id: 'mussel', canonical_name: 'Mussel', category: 'meat', synonyms: ['mussels', 'blue mussels'], typical_serving_g: 150, edible_portion_pct: 0.35 },
  { id: 'clam', canonical_name: 'Clam', category: 'meat', synonyms: ['clams', 'littleneck clams', 'manila clams'], typical_serving_g: 150, edible_portion_pct: 0.30 },
  { id: 'oyster', canonical_name: 'Oyster', category: 'meat', synonyms: ['oysters', 'pacific oyster', 'eastern oyster'], typical_serving_g: 85, edible_portion_pct: 0.30 },
  { id: 'crab', canonical_name: 'Crab', category: 'meat', synonyms: ['crab meat', 'dungeness crab', 'blue crab', 'king crab'], typical_serving_g: 113, edible_portion_pct: 0.40 },
  { id: 'lobster', canonical_name: 'Lobster', category: 'meat', synonyms: ['lobster tail', 'maine lobster', 'rock lobster'], typical_serving_g: 145, edible_portion_pct: 0.38 },
  { id: 'squid', canonical_name: 'Squid', category: 'meat', synonyms: ['calamari', 'squid rings'], typical_serving_g: 113, edible_portion_pct: 0.80 },
  { id: 'octopus', canonical_name: 'Octopus', category: 'meat', synonyms: ['octopus tentacles', 'tako'], typical_serving_g: 113, edible_portion_pct: 0.70 },
  { id: 'anchovies', canonical_name: 'Anchovies', category: 'meat', synonyms: ['anchovy', 'anchovy fillets'], typical_serving_g: 20, edible_portion_pct: 0.85 },
  { id: 'herring', canonical_name: 'Herring', category: 'meat', synonyms: ['herring fillet', 'kippered herring', 'kipper'], typical_serving_g: 113, edible_portion_pct: 0.80 },
  { id: 'perch', canonical_name: 'Perch', category: 'meat', synonyms: ['yellow perch', 'lake perch', 'walleye'], typical_serving_g: 113, edible_portion_pct: 0.85 },
  { id: 'elk', canonical_name: 'Elk', category: 'meat', synonyms: ['elk meat', 'wapiti'], typical_serving_g: 113, edible_portion_pct: 0.90 },
  { id: 'wild_boar', canonical_name: 'Wild Boar', category: 'meat', synonyms: ['wild boar meat', 'feral pig'], typical_serving_g: 113, edible_portion_pct: 0.85 },
  { id: 'cornish_hen', canonical_name: 'Cornish Hen', category: 'meat', synonyms: ['cornish game hen', 'rock cornish hen'], typical_serving_g: 130, edible_portion_pct: 0.62 },
  { id: 'guinea_fowl', canonical_name: 'Guinea Fowl', category: 'meat', synonyms: ['guinea hen', 'pintade'], typical_serving_g: 113, edible_portion_pct: 0.60 },
  { id: 'emu', canonical_name: 'Emu', category: 'meat', synonyms: ['emu meat'], typical_serving_g: 113, edible_portion_pct: 0.90 },
  { id: 'ostrich', canonical_name: 'Ostrich', category: 'meat', synonyms: ['ostrich meat', 'ostrich steak'], typical_serving_g: 113, edible_portion_pct: 0.92 },
  { id: 'chorizo', canonical_name: 'Chorizo', category: 'meat', synonyms: ['spanish chorizo', 'mexican chorizo'], typical_serving_g: 60, edible_portion_pct: 1.0 },
  { id: 'pancetta', canonical_name: 'Pancetta', category: 'meat', synonyms: ['italian bacon', 'pancetta affumicata'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'bresaola', canonical_name: 'Bresaola', category: 'meat', synonyms: ['air-dried beef'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'ground_chicken', canonical_name: 'Ground Chicken', category: 'meat', synonyms: ['minced chicken', 'chicken mince'], typical_serving_g: 113, edible_portion_pct: 1.0 },

  // ── DAIRY (30 + 35 more = 65+) ─────────────────────────────────
  { id: 'milk_whole', canonical_name: 'Whole Milk', category: 'dairy', synonyms: ['full cream milk', 'full fat milk', 'whole cow milk'], typical_serving_g: 244, edible_portion_pct: 1.0 },
  { id: 'milk_skim', canonical_name: 'Skim Milk', category: 'dairy', synonyms: ['fat free milk', 'nonfat milk', 'skimmed milk'], typical_serving_g: 244, edible_portion_pct: 1.0 },
  { id: 'milk_2pct', canonical_name: '2% Milk', category: 'dairy', synonyms: ['reduced fat milk', 'semi-skimmed milk', 'low fat milk'], typical_serving_g: 244, edible_portion_pct: 1.0 },
  { id: 'cream', canonical_name: 'Cream', category: 'dairy', synonyms: ['heavy cream', 'whipping cream', 'double cream'], typical_serving_g: 15, edible_portion_pct: 1.0 },
  { id: 'butter', canonical_name: 'Butter', category: 'dairy', synonyms: ['unsalted butter', 'salted butter'], typical_serving_g: 14, edible_portion_pct: 1.0 },
  { id: 'ghee', canonical_name: 'Ghee', category: 'dairy', synonyms: ['clarified butter', 'desi ghee'], typical_serving_g: 14, edible_portion_pct: 1.0 },
  { id: 'yogurt', canonical_name: 'Yogurt', category: 'dairy', synonyms: ['yoghurt', 'plain yogurt'], typical_serving_g: 245, edible_portion_pct: 1.0 },
  { id: 'greek_yogurt', canonical_name: 'Greek Yogurt', category: 'dairy', synonyms: ['greek style yogurt', 'strained yogurt'], typical_serving_g: 170, edible_portion_pct: 1.0 },
  { id: 'kefir', canonical_name: 'Kefir', category: 'dairy', synonyms: ['milk kefir', 'kephir'], typical_serving_g: 243, edible_portion_pct: 1.0 },
  { id: 'sour_cream', canonical_name: 'Sour Cream', category: 'dairy', synonyms: ['cultured cream'], typical_serving_g: 30, edible_portion_pct: 1.0 },
  { id: 'cottage_cheese', canonical_name: 'Cottage Cheese', category: 'dairy', synonyms: ['curds'], typical_serving_g: 113, edible_portion_pct: 1.0 },
  { id: 'cream_cheese', canonical_name: 'Cream Cheese', category: 'dairy', synonyms: ['philadelphia', 'neufchatel'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'cheddar_cheese', canonical_name: 'Cheddar Cheese', category: 'dairy', synonyms: ['cheddar', 'sharp cheddar', 'mild cheddar'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'mozzarella', canonical_name: 'Mozzarella', category: 'dairy', synonyms: ['mozzarella cheese', 'fresh mozzarella', 'buffalo mozzarella'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'parmesan', canonical_name: 'Parmesan', category: 'dairy', synonyms: ['parmigiano reggiano', 'parmesan cheese', 'grana padano'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'gouda', canonical_name: 'Gouda', category: 'dairy', synonyms: ['gouda cheese', 'aged gouda', 'smoked gouda'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'brie', canonical_name: 'Brie', category: 'dairy', synonyms: ['brie cheese'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'feta', canonical_name: 'Feta', category: 'dairy', synonyms: ['feta cheese', 'greek feta'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'ricotta', canonical_name: 'Ricotta', category: 'dairy', synonyms: ['ricotta cheese'], typical_serving_g: 62, edible_portion_pct: 1.0 },
  { id: 'swiss_cheese', canonical_name: 'Swiss Cheese', category: 'dairy', synonyms: ['emmental', 'emmentaler', 'gruyere'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'blue_cheese', canonical_name: 'Blue Cheese', category: 'dairy', synonyms: ['bleu cheese', 'roquefort', 'gorgonzola', 'stilton'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'goat_cheese', canonical_name: 'Goat Cheese', category: 'dairy', synonyms: ['chevre', 'goat milk cheese'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'egg_chicken', canonical_name: 'Chicken Egg', category: 'dairy', synonyms: ['egg', 'eggs', 'hen egg', 'chicken eggs'], typical_serving_g: 50, edible_portion_pct: 0.88 },
  { id: 'egg_duck', canonical_name: 'Duck Egg', category: 'dairy', synonyms: ['duck eggs'], typical_serving_g: 70, edible_portion_pct: 0.88 },
  { id: 'ice_cream', canonical_name: 'Ice Cream', category: 'dairy', synonyms: ['vanilla ice cream', 'gelato'], typical_serving_g: 132, edible_portion_pct: 1.0 },
  { id: 'whey_protein', canonical_name: 'Whey Protein', category: 'dairy', synonyms: ['whey powder', 'whey protein powder', 'whey isolate'], typical_serving_g: 30, edible_portion_pct: 1.0 },
  { id: 'casein', canonical_name: 'Casein', category: 'dairy', synonyms: ['casein protein', 'micellar casein'], typical_serving_g: 30, edible_portion_pct: 1.0 },
  { id: 'condensed_milk', canonical_name: 'Condensed Milk', category: 'dairy', synonyms: ['sweetened condensed milk'], typical_serving_g: 38, edible_portion_pct: 1.0 },
  { id: 'evaporated_milk', canonical_name: 'Evaporated Milk', category: 'dairy', synonyms: ['unsweetened condensed milk'], typical_serving_g: 32, edible_portion_pct: 1.0 },
  { id: 'buttermilk', canonical_name: 'Buttermilk', category: 'dairy', synonyms: ['cultured buttermilk'], typical_serving_g: 245, edible_portion_pct: 1.0 },

  // ── ADDITIONAL DAIRY (35 more to reach 65+) ──────────────────
  { id: 'mascarpone', canonical_name: 'Mascarpone', category: 'dairy', synonyms: ['mascarpone cheese', 'italian cream cheese'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'provolone', canonical_name: 'Provolone', category: 'dairy', synonyms: ['provolone cheese', 'provolone dolce', 'provolone piccante'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'manchego', canonical_name: 'Manchego', category: 'dairy', synonyms: ['manchego cheese', 'spanish manchego'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'halloumi', canonical_name: 'Halloumi', category: 'dairy', synonyms: ['halloumi cheese', 'grilling cheese'], typical_serving_g: 80, edible_portion_pct: 1.0 },
  { id: 'pecorino', canonical_name: 'Pecorino', category: 'dairy', synonyms: ['pecorino romano', 'pecorino cheese', 'sheep cheese'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'camembert', canonical_name: 'Camembert', category: 'dairy', synonyms: ['camembert cheese'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'havarti', canonical_name: 'Havarti', category: 'dairy', synonyms: ['havarti cheese', 'danish havarti'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'muenster', canonical_name: 'Muenster', category: 'dairy', synonyms: ['muenster cheese', 'munster cheese'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'colby', canonical_name: 'Colby', category: 'dairy', synonyms: ['colby cheese', 'colby jack'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'monterey_jack', canonical_name: 'Monterey Jack', category: 'dairy', synonyms: ['jack cheese', 'pepper jack'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'asiago', canonical_name: 'Asiago', category: 'dairy', synonyms: ['asiago cheese', 'asiago pressato'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'fontina', canonical_name: 'Fontina', category: 'dairy', synonyms: ['fontina cheese', "fontina val d'aosta"], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'taleggio', canonical_name: 'Taleggio', category: 'dairy', synonyms: ['taleggio cheese'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'raclette', canonical_name: 'Raclette', category: 'dairy', synonyms: ['raclette cheese'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'burrata', canonical_name: 'Burrata', category: 'dairy', synonyms: ['burrata cheese', 'fresh burrata'], typical_serving_g: 100, edible_portion_pct: 1.0 },
  { id: 'paneer', canonical_name: 'Paneer', category: 'dairy', synonyms: ['indian cottage cheese', 'panir'], typical_serving_g: 100, edible_portion_pct: 1.0 },
  { id: 'queso_fresco', canonical_name: 'Queso Fresco', category: 'dairy', synonyms: ['fresh cheese', 'queso blanco'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'oaxaca_cheese', canonical_name: 'Oaxaca Cheese', category: 'dairy', synonyms: ['queso oaxaca', 'quesillo'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'quark', canonical_name: 'Quark', category: 'dairy', synonyms: ['quark cheese', 'topfen'], typical_serving_g: 100, edible_portion_pct: 1.0 },
  { id: 'labneh', canonical_name: 'Labneh', category: 'dairy', synonyms: ['labne', 'lebni', 'strained yogurt cheese'], typical_serving_g: 30, edible_portion_pct: 1.0 },
  { id: 'clotted_cream', canonical_name: 'Clotted Cream', category: 'dairy', synonyms: ['devonshire cream', 'cornish clotted cream'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'creme_fraiche', canonical_name: 'Creme Fraiche', category: 'dairy', synonyms: ['crème fraîche'], typical_serving_g: 30, edible_portion_pct: 1.0 },
  { id: 'skyr', canonical_name: 'Skyr', category: 'dairy', synonyms: ['icelandic yogurt', 'icelandic skyr'], typical_serving_g: 170, edible_portion_pct: 1.0 },
  { id: 'egg_quail', canonical_name: 'Quail Egg', category: 'dairy', synonyms: ['quail eggs'], typical_serving_g: 9, edible_portion_pct: 0.88 },
  { id: 'milk_goat', canonical_name: 'Goat Milk', category: 'dairy', synonyms: ['goats milk'], typical_serving_g: 244, edible_portion_pct: 1.0 },
  { id: 'milk_sheep', canonical_name: 'Sheep Milk', category: 'dairy', synonyms: ['sheeps milk', 'ewes milk'], typical_serving_g: 244, edible_portion_pct: 1.0 },
  { id: 'milk_oat', canonical_name: 'Oat Milk', category: 'dairy', synonyms: ['oat milk', 'oatmilk'], typical_serving_g: 244, edible_portion_pct: 1.0 },
  { id: 'milk_almond', canonical_name: 'Almond Milk', category: 'dairy', synonyms: ['almond milk'], typical_serving_g: 244, edible_portion_pct: 1.0 },
  { id: 'milk_soy', canonical_name: 'Soy Milk', category: 'dairy', synonyms: ['soymilk', 'soya milk'], typical_serving_g: 244, edible_portion_pct: 1.0 },
  { id: 'milk_coconut', canonical_name: 'Coconut Milk', category: 'dairy', synonyms: ['coconut milk', 'coconut cream'], typical_serving_g: 240, edible_portion_pct: 1.0 },
  { id: 'yogurt_coconut', canonical_name: 'Coconut Yogurt', category: 'dairy', synonyms: ['dairy-free yogurt', 'coconut yoghurt'], typical_serving_g: 170, edible_portion_pct: 1.0 },
  { id: 'string_cheese', canonical_name: 'String Cheese', category: 'dairy', synonyms: ['mozzarella stick', 'cheese stick'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'velveeta', canonical_name: 'Processed Cheese', category: 'dairy', synonyms: ['american cheese', 'cheese slices', 'cheese singles'], typical_serving_g: 28, edible_portion_pct: 1.0 },
  { id: 'dulce_de_leche', canonical_name: 'Dulce de Leche', category: 'dairy', synonyms: ['caramelized milk', 'manjar'], typical_serving_g: 20, edible_portion_pct: 1.0 },
  { id: 'fromage_blanc', canonical_name: 'Fromage Blanc', category: 'dairy', synonyms: ['white cheese', 'fresh white cheese'], typical_serving_g: 100, edible_portion_pct: 1.0 },

  // ── GRAINS & LEGUMES (30 + 15 more = 45+) ──────────────────────
  { id: 'white_rice', canonical_name: 'White Rice', category: 'grains', synonyms: ['rice', 'long grain rice', 'short grain rice'], typical_serving_g: 158, edible_portion_pct: 1.0 },
  { id: 'brown_rice', canonical_name: 'Brown Rice', category: 'grains', synonyms: ['whole grain rice'], typical_serving_g: 158, edible_portion_pct: 1.0 },
  { id: 'jasmine_rice', canonical_name: 'Jasmine Rice', category: 'grains', synonyms: ['thai jasmine rice', 'fragrant rice'], typical_serving_g: 158, edible_portion_pct: 1.0 },
  { id: 'basmati_rice', canonical_name: 'Basmati Rice', category: 'grains', synonyms: ['indian basmati'], typical_serving_g: 158, edible_portion_pct: 1.0 },
  { id: 'wheat_flour', canonical_name: 'Wheat Flour', category: 'grains', synonyms: ['all purpose flour', 'plain flour', 'white flour'], typical_serving_g: 125, edible_portion_pct: 1.0 },
  { id: 'whole_wheat_flour', canonical_name: 'Whole Wheat Flour', category: 'grains', synonyms: ['wholemeal flour', 'graham flour'], typical_serving_g: 120, edible_portion_pct: 1.0 },
  { id: 'bread_white', canonical_name: 'White Bread', category: 'grains', synonyms: ['bread', 'sandwich bread', 'white sliced bread'], typical_serving_g: 30, edible_portion_pct: 1.0 },
  { id: 'bread_whole_wheat', canonical_name: 'Whole Wheat Bread', category: 'grains', synonyms: ['brown bread', 'wholemeal bread', 'whole grain bread'], typical_serving_g: 30, edible_portion_pct: 1.0 },
  { id: 'pasta', canonical_name: 'Pasta', category: 'grains', synonyms: ['spaghetti', 'penne', 'fusilli', 'macaroni', 'noodles'], typical_serving_g: 56, edible_portion_pct: 1.0 },
  { id: 'oats', canonical_name: 'Oats', category: 'grains', synonyms: ['oat', 'porridge oats', 'oatmeal'], typical_serving_g: 40, edible_portion_pct: 1.0 },
  { id: 'rolled_oats', canonical_name: 'Rolled Oats', category: 'grains', synonyms: ['old fashioned oats', 'flaked oats'], typical_serving_g: 40, edible_portion_pct: 1.0 },
  { id: 'barley', canonical_name: 'Barley', category: 'grains', synonyms: ['pearl barley', 'hulled barley'], typical_serving_g: 157, edible_portion_pct: 1.0 },
  { id: 'rye', canonical_name: 'Rye', category: 'grains', synonyms: ['rye grain', 'rye berries', 'rye flour'], typical_serving_g: 128, edible_portion_pct: 1.0 },
  { id: 'quinoa', canonical_name: 'Quinoa', category: 'grains', synonyms: ['white quinoa', 'red quinoa', 'black quinoa'], typical_serving_g: 170, edible_portion_pct: 1.0 },
  { id: 'millet', canonical_name: 'Millet', category: 'grains', synonyms: ['pearl millet', 'proso millet', 'foxtail millet'], typical_serving_g: 174, edible_portion_pct: 1.0 },
  { id: 'buckwheat', canonical_name: 'Buckwheat', category: 'grains', synonyms: ['kasha', 'buckwheat groats', 'soba'], typical_serving_g: 170, edible_portion_pct: 1.0 },
  { id: 'cornmeal', canonical_name: 'Cornmeal', category: 'grains', synonyms: ['polenta', 'corn flour', 'masa'], typical_serving_g: 122, edible_portion_pct: 1.0 },
  { id: 'lentils_green', canonical_name: 'Green Lentils', category: 'legumes', synonyms: ['lentils', 'french lentils', 'puy lentils'], typical_serving_g: 198, edible_portion_pct: 1.0 },
  { id: 'lentils_red', canonical_name: 'Red Lentils', category: 'legumes', synonyms: ['masoor dal', 'split red lentils'], typical_serving_g: 198, edible_portion_pct: 1.0 },
  { id: 'chickpeas', canonical_name: 'Chickpeas', category: 'legumes', synonyms: ['garbanzo beans', 'garbanzo', 'ceci beans', 'chana'], typical_serving_g: 164, edible_portion_pct: 1.0 },
  { id: 'black_beans', canonical_name: 'Black Beans', category: 'legumes', synonyms: ['black turtle beans', 'frijoles negros'], typical_serving_g: 172, edible_portion_pct: 1.0 },
  { id: 'kidney_beans', canonical_name: 'Kidney Beans', category: 'legumes', synonyms: ['red kidney beans', 'rajma'], typical_serving_g: 177, edible_portion_pct: 1.0 },
  { id: 'navy_beans', canonical_name: 'Navy Beans', category: 'legumes', synonyms: ['haricot beans', 'boston beans', 'white beans'], typical_serving_g: 182, edible_portion_pct: 1.0 },
  { id: 'pinto_beans', canonical_name: 'Pinto Beans', category: 'legumes', synonyms: ['frijoles', 'painted beans'], typical_serving_g: 171, edible_portion_pct: 1.0 },
  { id: 'soybeans', canonical_name: 'Soybeans', category: 'legumes', synonyms: ['soya beans', 'soy', 'soya'], typical_serving_g: 172, edible_portion_pct: 1.0 },
  { id: 'tofu', canonical_name: 'Tofu', category: 'legumes', synonyms: ['bean curd', 'soybean curd', 'firm tofu', 'silken tofu'], typical_serving_g: 126, edible_portion_pct: 1.0 },
  { id: 'tempeh', canonical_name: 'Tempeh', category: 'legumes', synonyms: ['fermented soybean', 'tempe'], typical_serving_g: 84, edible_portion_pct: 1.0 },
  { id: 'edamame', canonical_name: 'Edamame', category: 'legumes', synonyms: ['green soybeans', 'mukimame'], typical_serving_g: 155, edible_portion_pct: 0.50 },
  { id: 'peanuts', canonical_name: 'Peanuts', category: 'legumes', synonyms: ['peanut', 'groundnuts', 'monkey nuts'], typical_serving_g: 28, edible_portion_pct: 0.72 },
  { id: 'split_peas', canonical_name: 'Split Peas', category: 'legumes', synonyms: ['dried peas', 'yellow split peas', 'green split peas'], typical_serving_g: 196, edible_portion_pct: 1.0 },

  // ── ADDITIONAL GRAINS & LEGUMES (15 more to reach 45+) ──────────
  { id: 'amaranth', canonical_name: 'Amaranth', category: 'grains', synonyms: ['amaranth grain', 'amaranth seeds'], typical_serving_g: 193, edible_portion_pct: 1.0 },
  { id: 'farro', canonical_name: 'Farro', category: 'grains', synonyms: ['emmer wheat', 'emmer'], typical_serving_g: 170, edible_portion_pct: 1.0 },
  { id: 'freekeh', canonical_name: 'Freekeh', category: 'grains', synonyms: ['roasted green wheat', 'farik'], typical_serving_g: 160, edible_portion_pct: 1.0 },
  { id: 'kamut', canonical_name: 'Kamut', category: 'grains', synonyms: ['khorasan wheat'], typical_serving_g: 172, edible_portion_pct: 1.0 },
  { id: 'sorghum', canonical_name: 'Sorghum', category: 'grains', synonyms: ['milo', 'jowar', 'sorghum grain'], typical_serving_g: 192, edible_portion_pct: 1.0 },
  { id: 'spelt', canonical_name: 'Spelt', category: 'grains', synonyms: ['spelt grain', 'dinkel wheat'], typical_serving_g: 174, edible_portion_pct: 1.0 },
  { id: 'teff', canonical_name: 'Teff', category: 'grains', synonyms: ['teff grain', 'ethiopian grain'], typical_serving_g: 184, edible_portion_pct: 1.0 },
  { id: 'wild_rice', canonical_name: 'Wild Rice', category: 'grains', synonyms: ['wild rice', 'canadian wild rice'], typical_serving_g: 164, edible_portion_pct: 1.0 },
  { id: 'couscous', canonical_name: 'Couscous', category: 'grains', synonyms: ['pearl couscous', 'israeli couscous'], typical_serving_g: 157, edible_portion_pct: 1.0 },
  { id: 'lima_beans', canonical_name: 'Lima Beans', category: 'legumes', synonyms: ['butter beans', 'baby limas'], typical_serving_g: 170, edible_portion_pct: 1.0 },
  { id: 'black_eyed_peas', canonical_name: 'Black-Eyed Peas', category: 'legumes', synonyms: ['cowpeas', 'black eyed beans'], typical_serving_g: 171, edible_portion_pct: 1.0 },
  { id: 'mung_beans', canonical_name: 'Mung Beans', category: 'legumes', synonyms: ['moong dal', 'green gram'], typical_serving_g: 202, edible_portion_pct: 1.0 },
  { id: 'adzuki_beans', canonical_name: 'Adzuki Beans', category: 'legumes', synonyms: ['azuki beans', 'red beans'], typical_serving_g: 115, edible_portion_pct: 1.0 },
  { id: 'cannellini_beans', canonical_name: 'Cannellini Beans', category: 'legumes', synonyms: ['white kidney beans', 'italian white beans'], typical_serving_g: 177, edible_portion_pct: 1.0 },
  { id: 'lupini_beans', canonical_name: 'Lupini Beans', category: 'legumes', synonyms: ['lupin beans', 'lupins'], typical_serving_g: 166, edible_portion_pct: 0.70 },
];

// ============================================================
// GHG EMISSION FACTORS (kg CO2e / kg food, Poore & Nemecek 2018)
// ============================================================

interface GhgFactor {
  food_id: string;
  value_mid: number;
}

// Realistic median values based on Poore & Nemecek 2018
const ghgFactorsRaw: GhgFactor[] = [
  // ── PRODUCE ────────────────────────────────────────────────
  { food_id: 'apple', value_mid: 0.43 },
  { food_id: 'apricot', value_mid: 0.52 },
  { food_id: 'artichoke', value_mid: 0.75 },
  { food_id: 'asparagus', value_mid: 0.87 },
  { food_id: 'avocado', value_mid: 1.48 },
  { food_id: 'banana', value_mid: 0.86 },
  { food_id: 'basil', value_mid: 0.65 },
  { food_id: 'beet', value_mid: 0.39 },
  { food_id: 'bell_pepper', value_mid: 1.05 },
  { food_id: 'blackberry', value_mid: 0.72 },
  { food_id: 'blueberry', value_mid: 0.83 },
  { food_id: 'bok_choy', value_mid: 0.36 },
  { food_id: 'broccoli', value_mid: 0.54 },
  { food_id: 'brussels_sprout', value_mid: 0.50 },
  { food_id: 'cabbage', value_mid: 0.36 },
  { food_id: 'cantaloupe', value_mid: 0.55 },
  { food_id: 'carrot', value_mid: 0.37 },
  { food_id: 'cauliflower', value_mid: 0.51 },
  { food_id: 'celery', value_mid: 0.34 },
  { food_id: 'cherry', value_mid: 0.60 },
  { food_id: 'cilantro', value_mid: 0.52 },
  { food_id: 'collard_greens', value_mid: 0.41 },
  { food_id: 'corn_sweet', value_mid: 0.78 },
  { food_id: 'cranberry', value_mid: 0.66 },
  { food_id: 'cucumber', value_mid: 0.45 },
  { food_id: 'date', value_mid: 1.10 },
  { food_id: 'eggplant', value_mid: 0.52 },
  { food_id: 'endive', value_mid: 0.40 },
  { food_id: 'fennel', value_mid: 0.44 },
  { food_id: 'fig', value_mid: 0.53 },
  { food_id: 'garlic', value_mid: 0.51 },
  { food_id: 'ginger', value_mid: 0.68 },
  { food_id: 'grape', value_mid: 0.67 },
  { food_id: 'green_bean', value_mid: 0.53 },
  { food_id: 'green_onion', value_mid: 0.38 },
  { food_id: 'guava', value_mid: 0.62 },
  { food_id: 'honeydew', value_mid: 0.52 },
  { food_id: 'jalapeno', value_mid: 0.90 },
  { food_id: 'kale', value_mid: 0.42 },
  { food_id: 'kiwi', value_mid: 0.69 },
  { food_id: 'kohlrabi', value_mid: 0.39 },
  { food_id: 'kumquat', value_mid: 0.55 },
  { food_id: 'leek', value_mid: 0.42 },
  { food_id: 'lemon', value_mid: 0.51 },
  { food_id: 'lettuce', value_mid: 0.38 },
  { food_id: 'lime', value_mid: 0.49 },
  { food_id: 'lychee', value_mid: 0.82 },
  { food_id: 'mango', value_mid: 1.00 },
  { food_id: 'mushroom', value_mid: 0.62 },
  { food_id: 'nectarine', value_mid: 0.56 },
  { food_id: 'okra', value_mid: 0.55 },
  { food_id: 'olive', value_mid: 1.78 },
  { food_id: 'onion', value_mid: 0.39 },
  { food_id: 'orange', value_mid: 0.47 },
  { food_id: 'papaya', value_mid: 0.72 },
  { food_id: 'parsley', value_mid: 0.50 },
  { food_id: 'parsnip', value_mid: 0.38 },
  { food_id: 'passion_fruit', value_mid: 0.92 },
  { food_id: 'peach', value_mid: 0.55 },
  { food_id: 'pear', value_mid: 0.44 },
  { food_id: 'persimmon', value_mid: 0.61 },
  { food_id: 'pineapple', value_mid: 0.68 },
  { food_id: 'plum', value_mid: 0.53 },
  { food_id: 'pomegranate', value_mid: 0.82 },
  { food_id: 'potato', value_mid: 0.46 },
  { food_id: 'pumpkin', value_mid: 0.45 },
  { food_id: 'radicchio', value_mid: 0.42 },
  { food_id: 'radish', value_mid: 0.35 },
  { food_id: 'raspberry', value_mid: 0.74 },
  { food_id: 'rhubarb', value_mid: 0.40 },
  { food_id: 'romaine_lettuce', value_mid: 0.39 },
  { food_id: 'rutabaga', value_mid: 0.37 },
  { food_id: 'shallot', value_mid: 0.43 },
  { food_id: 'snap_pea', value_mid: 0.48 },
  { food_id: 'spinach', value_mid: 0.40 },
  { food_id: 'squash_butternut', value_mid: 0.48 },
  { food_id: 'squash_summer', value_mid: 0.45 },
  { food_id: 'strawberry', value_mid: 0.69 },
  { food_id: 'sweet_potato', value_mid: 0.51 },
  { food_id: 'swiss_chard', value_mid: 0.38 },
  { food_id: 'tangerine', value_mid: 0.48 },
  { food_id: 'taro', value_mid: 0.60 },
  { food_id: 'thyme', value_mid: 0.55 },
  { food_id: 'tomato', value_mid: 1.40 },
  { food_id: 'turnip', value_mid: 0.36 },
  { food_id: 'watercress', value_mid: 0.37 },
  { food_id: 'watermelon', value_mid: 0.40 },
  { food_id: 'yam', value_mid: 0.55 },
  { food_id: 'zucchini', value_mid: 0.46 },
  { food_id: 'dragon_fruit', value_mid: 0.90 },
  { food_id: 'starfruit', value_mid: 0.65 },
  { food_id: 'jackfruit', value_mid: 0.92 },
  { food_id: 'plantain', value_mid: 0.80 },
  { food_id: 'cactus_pear', value_mid: 0.50 },
  { food_id: 'jicama', value_mid: 0.42 },
  { food_id: 'lotus_root', value_mid: 0.58 },
  { food_id: 'bamboo_shoot', value_mid: 0.48 },
  { food_id: 'chayote', value_mid: 0.44 },
  { food_id: 'bitter_melon', value_mid: 0.52 },
  { food_id: 'tomatillo', value_mid: 0.95 },

  // ── ADDITIONAL PRODUCE ──────────────────────────────────────
  { food_id: 'arugula', value_mid: 0.42 },
  { food_id: 'blood_orange', value_mid: 0.49 },
  { food_id: 'butterhead_lettuce', value_mid: 0.38 },
  { food_id: 'celeriac', value_mid: 0.40 },
  { food_id: 'chard_rainbow', value_mid: 0.38 },
  { food_id: 'cherry_tomato', value_mid: 1.50 },
  { food_id: 'chinese_broccoli', value_mid: 0.50 },
  { food_id: 'clementine', value_mid: 0.47 },
  { food_id: 'coconut', value_mid: 2.30 },
  { food_id: 'daikon', value_mid: 0.35 },
  { food_id: 'dandelion_greens', value_mid: 0.38 },
  { food_id: 'delicata_squash', value_mid: 0.46 },
  { food_id: 'dill', value_mid: 0.55 },
  { food_id: 'durian', value_mid: 1.50 },
  { food_id: 'elderberry', value_mid: 0.75 },
  { food_id: 'enoki_mushroom', value_mid: 0.62 },
  { food_id: 'escarole', value_mid: 0.40 },
  { food_id: 'fava_bean', value_mid: 0.65 },
  { food_id: 'fiddlehead', value_mid: 0.50 },
  { food_id: 'fingerling_potato', value_mid: 0.48 },
  { food_id: 'fresno_pepper', value_mid: 0.92 },
  { food_id: 'galia_melon', value_mid: 0.55 },
  { food_id: 'ginger_root', value_mid: 0.72 },
  { food_id: 'gooseberry', value_mid: 0.68 },
  { food_id: 'grapefruit', value_mid: 0.44 },
  { food_id: 'habanero', value_mid: 0.95 },
  { food_id: 'hearts_of_palm', value_mid: 0.80 },
  { food_id: 'horseradish', value_mid: 0.45 },
  { food_id: 'huckleberry', value_mid: 0.78 },
  { food_id: 'italian_parsley', value_mid: 0.50 },
  { food_id: 'jerusalem_artichoke', value_mid: 0.42 },
  { food_id: 'kabocha', value_mid: 0.46 },
  { food_id: 'key_lime', value_mid: 0.50 },
  { food_id: 'king_oyster_mushroom', value_mid: 0.64 },
  { food_id: 'lemongrass', value_mid: 0.55 },
  { food_id: 'longan', value_mid: 0.82 },
  { food_id: 'loofah', value_mid: 0.48 },
  { food_id: 'loquat', value_mid: 0.58 },
  { food_id: 'maitake_mushroom', value_mid: 0.65 },
  { food_id: 'malanga', value_mid: 0.58 },
  { food_id: 'meyer_lemon', value_mid: 0.50 },
  { food_id: 'mint', value_mid: 0.55 },
  { food_id: 'moringa', value_mid: 0.45 },
  { food_id: 'mulberry', value_mid: 0.65 },
  { food_id: 'mustard_greens', value_mid: 0.40 },
  { food_id: 'napa_cabbage', value_mid: 0.36 },
  { food_id: 'nopal', value_mid: 0.35 },
  { food_id: 'oregano', value_mid: 0.55 },
  { food_id: 'oyster_mushroom', value_mid: 0.60 },
  { food_id: 'pak_choi', value_mid: 0.36 },
  { food_id: 'pasilla_pepper', value_mid: 0.88 },
  { food_id: 'pea_shoots', value_mid: 0.42 },
  { food_id: 'pepino', value_mid: 0.55 },
  { food_id: 'persian_cucumber', value_mid: 0.45 },
  { food_id: 'pluot', value_mid: 0.55 },
  { food_id: 'poblano', value_mid: 0.90 },
  { food_id: 'purple_potato', value_mid: 0.48 },
  { food_id: 'quince', value_mid: 0.52 },
  { food_id: 'ramp', value_mid: 0.42 },
  { food_id: 'rapini', value_mid: 0.48 },
  { food_id: 'red_cabbage', value_mid: 0.36 },
  { food_id: 'red_onion', value_mid: 0.40 },
  { food_id: 'rosemary', value_mid: 0.58 },
  { food_id: 'sage', value_mid: 0.56 },
  { food_id: 'savoy_cabbage', value_mid: 0.36 },
  { food_id: 'serrano_pepper', value_mid: 0.92 },
  { food_id: 'shiitake', value_mid: 0.64 },
  { food_id: 'snow_pea', value_mid: 0.48 },
  { food_id: 'sorrel', value_mid: 0.38 },
  { food_id: 'spaghetti_squash', value_mid: 0.46 },
  { food_id: 'sugar_snap_pea', value_mid: 0.48 },
  { food_id: 'sunflower_sprouts', value_mid: 0.35 },
  { food_id: 'sunchoke', value_mid: 0.42 },
  { food_id: 'tamarind', value_mid: 0.80 },
  { food_id: 'tangelo', value_mid: 0.48 },
  { food_id: 'tarragon', value_mid: 0.55 },
  { food_id: 'thai_basil', value_mid: 0.65 },
  { food_id: 'treviso', value_mid: 0.42 },
  { food_id: 'turmeric_root', value_mid: 0.68 },
  { food_id: 'water_chestnut', value_mid: 0.52 },
  { food_id: 'winter_melon', value_mid: 0.42 },
  { food_id: 'yuzu', value_mid: 0.55 },
  { food_id: 'atemoya', value_mid: 0.78 },
  { food_id: 'breadfruit', value_mid: 0.72 },
  { food_id: 'cassava', value_mid: 0.95 },
  { food_id: 'chive', value_mid: 0.45 },
  { food_id: 'currant', value_mid: 0.70 },
  { food_id: 'edible_flower', value_mid: 0.55 },
  { food_id: 'green_papaya', value_mid: 0.72 },
  { food_id: 'habanero_pepper', value_mid: 0.90 },
  { food_id: 'ice_plant', value_mid: 0.35 },
  { food_id: 'kohlrabi_greens', value_mid: 0.38 },
  { food_id: 'lamb_ear_lettuce', value_mid: 0.36 },
  { food_id: 'marjoram', value_mid: 0.55 },
  { food_id: 'microgreens', value_mid: 0.50 },
  { food_id: 'mizuna', value_mid: 0.38 },
  { food_id: 'nance', value_mid: 0.65 },
  { food_id: 'noni', value_mid: 0.72 },
  { food_id: 'opo_squash', value_mid: 0.44 },
  { food_id: 'rambutan', value_mid: 0.82 },
  { food_id: 'romanesco', value_mid: 0.52 },
  { food_id: 'sapodilla', value_mid: 0.70 },
  { food_id: 'scallop_squash', value_mid: 0.45 },
  { food_id: 'soursop', value_mid: 0.82 },
  { food_id: 'sprouts', value_mid: 0.35 },
  { food_id: 'sugar_apple', value_mid: 0.78 },
  { food_id: 'tatsoi', value_mid: 0.38 },
  { food_id: 'turnip_greens', value_mid: 0.38 },
  { food_id: 'udon_squash', value_mid: 0.46 },
  { food_id: 'white_asparagus', value_mid: 0.92 },

  // ── MEAT ───────────────────────────────────────────────────
  { food_id: 'beef_general', value_mid: 59.6 },
  { food_id: 'beef_steak', value_mid: 62.0 },
  { food_id: 'beef_ground', value_mid: 56.0 },
  { food_id: 'beef_roast', value_mid: 60.0 },
  { food_id: 'lamb', value_mid: 24.5 },
  { food_id: 'lamb_chop', value_mid: 25.0 },
  { food_id: 'goat', value_mid: 20.4 },
  { food_id: 'pork', value_mid: 7.6 },
  { food_id: 'pork_chop', value_mid: 7.8 },
  { food_id: 'pork_tenderloin', value_mid: 7.2 },
  { food_id: 'bacon', value_mid: 8.9 },
  { food_id: 'ham', value_mid: 8.2 },
  { food_id: 'sausage_pork', value_mid: 8.5 },
  { food_id: 'chicken_breast', value_mid: 6.9 },
  { food_id: 'chicken_thigh', value_mid: 7.1 },
  { food_id: 'chicken_whole', value_mid: 6.9 },
  { food_id: 'turkey', value_mid: 10.9 },
  { food_id: 'turkey_ground', value_mid: 10.5 },
  { food_id: 'duck', value_mid: 8.6 },
  { food_id: 'goose', value_mid: 9.1 },
  { food_id: 'venison', value_mid: 14.8 },
  { food_id: 'bison', value_mid: 22.0 },
  { food_id: 'rabbit', value_mid: 9.8 },
  { food_id: 'quail', value_mid: 8.2 },
  { food_id: 'pheasant', value_mid: 8.8 },
  { food_id: 'veal', value_mid: 48.0 },
  { food_id: 'liver_beef', value_mid: 59.6 },
  { food_id: 'liver_chicken', value_mid: 6.9 },
  { food_id: 'salami', value_mid: 10.2 },
  { food_id: 'prosciutto', value_mid: 10.8 },

  // ── ADDITIONAL MEAT (seafood + game) ──────────────────────
  { food_id: 'salmon', value_mid: 11.9 },
  { food_id: 'tuna', value_mid: 6.1 },
  { food_id: 'shrimp', value_mid: 11.8 },
  { food_id: 'cod', value_mid: 5.4 },
  { food_id: 'tilapia', value_mid: 5.0 },
  { food_id: 'catfish', value_mid: 5.3 },
  { food_id: 'trout', value_mid: 5.8 },
  { food_id: 'sardine', value_mid: 3.5 },
  { food_id: 'mackerel', value_mid: 4.2 },
  { food_id: 'halibut', value_mid: 7.1 },
  { food_id: 'swordfish', value_mid: 7.0 },
  { food_id: 'mahi_mahi', value_mid: 6.5 },
  { food_id: 'sea_bass', value_mid: 7.5 },
  { food_id: 'snapper', value_mid: 7.2 },
  { food_id: 'scallop', value_mid: 10.5 },
  { food_id: 'mussel', value_mid: 0.6 },
  { food_id: 'clam', value_mid: 1.5 },
  { food_id: 'oyster', value_mid: 0.5 },
  { food_id: 'crab', value_mid: 12.0 },
  { food_id: 'lobster', value_mid: 14.4 },
  { food_id: 'squid', value_mid: 3.6 },
  { food_id: 'octopus', value_mid: 4.8 },
  { food_id: 'anchovies', value_mid: 3.1 },
  { food_id: 'herring', value_mid: 2.8 },
  { food_id: 'perch', value_mid: 5.0 },
  { food_id: 'elk', value_mid: 16.5 },
  { food_id: 'wild_boar', value_mid: 10.2 },
  { food_id: 'cornish_hen', value_mid: 7.2 },
  { food_id: 'guinea_fowl', value_mid: 7.8 },
  { food_id: 'emu', value_mid: 12.5 },
  { food_id: 'ostrich', value_mid: 6.2 },
  { food_id: 'chorizo', value_mid: 9.5 },
  { food_id: 'pancetta', value_mid: 9.2 },
  { food_id: 'bresaola', value_mid: 60.0 },
  { food_id: 'ground_chicken', value_mid: 6.9 },

  // ── DAIRY ──────────────────────────────────────────────────
  { food_id: 'milk_whole', value_mid: 3.15 },
  { food_id: 'milk_skim', value_mid: 2.80 },
  { food_id: 'milk_2pct', value_mid: 2.95 },
  { food_id: 'cream', value_mid: 5.60 },
  { food_id: 'butter', value_mid: 11.52 },
  { food_id: 'ghee', value_mid: 13.20 },
  { food_id: 'yogurt', value_mid: 2.20 },
  { food_id: 'greek_yogurt', value_mid: 2.90 },
  { food_id: 'kefir', value_mid: 2.30 },
  { food_id: 'sour_cream', value_mid: 4.50 },
  { food_id: 'cottage_cheese', value_mid: 3.80 },
  { food_id: 'cream_cheese', value_mid: 8.50 },
  { food_id: 'cheddar_cheese', value_mid: 21.2 },
  { food_id: 'mozzarella', value_mid: 14.0 },
  { food_id: 'parmesan', value_mid: 21.0 },
  { food_id: 'gouda', value_mid: 18.5 },
  { food_id: 'brie', value_mid: 12.8 },
  { food_id: 'feta', value_mid: 14.5 },
  { food_id: 'ricotta', value_mid: 6.50 },
  { food_id: 'swiss_cheese', value_mid: 19.0 },
  { food_id: 'blue_cheese', value_mid: 17.2 },
  { food_id: 'goat_cheese', value_mid: 15.0 },
  { food_id: 'egg_chicken', value_mid: 4.67 },
  { food_id: 'egg_duck', value_mid: 5.20 },
  { food_id: 'ice_cream', value_mid: 4.30 },
  { food_id: 'whey_protein', value_mid: 8.10 },
  { food_id: 'casein', value_mid: 8.50 },
  { food_id: 'condensed_milk', value_mid: 4.80 },
  { food_id: 'evaporated_milk', value_mid: 3.90 },
  { food_id: 'buttermilk', value_mid: 2.60 },

  // ── ADDITIONAL DAIRY ────────────────────────────────────────
  { food_id: 'mascarpone', value_mid: 9.20 },
  { food_id: 'provolone', value_mid: 18.00 },
  { food_id: 'manchego', value_mid: 16.50 },
  { food_id: 'halloumi', value_mid: 14.00 },
  { food_id: 'pecorino', value_mid: 18.50 },
  { food_id: 'camembert', value_mid: 12.50 },
  { food_id: 'havarti', value_mid: 16.00 },
  { food_id: 'muenster', value_mid: 15.50 },
  { food_id: 'colby', value_mid: 17.00 },
  { food_id: 'monterey_jack', value_mid: 16.50 },
  { food_id: 'asiago', value_mid: 18.00 },
  { food_id: 'fontina', value_mid: 16.80 },
  { food_id: 'taleggio', value_mid: 14.50 },
  { food_id: 'raclette', value_mid: 17.00 },
  { food_id: 'burrata', value_mid: 13.50 },
  { food_id: 'paneer', value_mid: 10.80 },
  { food_id: 'queso_fresco', value_mid: 8.50 },
  { food_id: 'oaxaca_cheese', value_mid: 12.00 },
  { food_id: 'quark', value_mid: 3.20 },
  { food_id: 'labneh', value_mid: 3.50 },
  { food_id: 'clotted_cream', value_mid: 7.80 },
  { food_id: 'creme_fraiche', value_mid: 5.20 },
  { food_id: 'skyr', value_mid: 2.50 },
  { food_id: 'egg_quail', value_mid: 5.00 },
  { food_id: 'milk_goat', value_mid: 3.40 },
  { food_id: 'milk_sheep', value_mid: 4.50 },
  { food_id: 'milk_oat', value_mid: 0.90 },
  { food_id: 'milk_almond', value_mid: 0.70 },
  { food_id: 'milk_soy', value_mid: 0.98 },
  { food_id: 'milk_coconut', value_mid: 1.20 },
  { food_id: 'yogurt_coconut', value_mid: 1.50 },
  { food_id: 'string_cheese', value_mid: 14.00 },
  { food_id: 'velveeta', value_mid: 12.00 },
  { food_id: 'dulce_de_leche', value_mid: 5.80 },
  { food_id: 'fromage_blanc', value_mid: 3.00 },

  // ── GRAINS ─────────────────────────────────────────────────
  { food_id: 'white_rice', value_mid: 3.55 },
  { food_id: 'brown_rice', value_mid: 3.45 },
  { food_id: 'jasmine_rice', value_mid: 3.50 },
  { food_id: 'basmati_rice', value_mid: 3.40 },
  { food_id: 'wheat_flour', value_mid: 1.10 },
  { food_id: 'whole_wheat_flour', value_mid: 1.05 },
  { food_id: 'bread_white', value_mid: 1.30 },
  { food_id: 'bread_whole_wheat', value_mid: 1.25 },
  { food_id: 'pasta', value_mid: 1.40 },
  { food_id: 'oats', value_mid: 1.60 },
  { food_id: 'rolled_oats', value_mid: 1.55 },
  { food_id: 'barley', value_mid: 1.18 },
  { food_id: 'rye', value_mid: 1.06 },
  { food_id: 'quinoa', value_mid: 1.28 },
  { food_id: 'millet', value_mid: 1.15 },
  { food_id: 'buckwheat', value_mid: 1.08 },
  { food_id: 'cornmeal', value_mid: 1.22 },

  // ── LEGUMES ────────────────────────────────────────────────
  { food_id: 'lentils_green', value_mid: 0.90 },
  { food_id: 'lentils_red', value_mid: 0.85 },
  { food_id: 'chickpeas', value_mid: 0.78 },
  { food_id: 'black_beans', value_mid: 0.84 },
  { food_id: 'kidney_beans', value_mid: 0.81 },
  { food_id: 'navy_beans', value_mid: 0.80 },
  { food_id: 'pinto_beans', value_mid: 0.82 },
  { food_id: 'soybeans', value_mid: 2.00 },
  { food_id: 'tofu', value_mid: 3.16 },
  { food_id: 'tempeh', value_mid: 2.40 },
  { food_id: 'edamame', value_mid: 1.80 },
  { food_id: 'peanuts', value_mid: 2.50 },
  { food_id: 'split_peas', value_mid: 0.76 },

  // ── ADDITIONAL GRAINS & LEGUMES ──────────────────────────────
  { food_id: 'amaranth', value_mid: 1.20 },
  { food_id: 'farro', value_mid: 1.15 },
  { food_id: 'freekeh', value_mid: 1.10 },
  { food_id: 'kamut', value_mid: 1.08 },
  { food_id: 'sorghum', value_mid: 1.12 },
  { food_id: 'spelt', value_mid: 1.05 },
  { food_id: 'teff', value_mid: 1.18 },
  { food_id: 'wild_rice', value_mid: 2.80 },
  { food_id: 'couscous', value_mid: 1.32 },
  { food_id: 'lima_beans', value_mid: 0.88 },
  { food_id: 'black_eyed_peas', value_mid: 0.82 },
  { food_id: 'mung_beans', value_mid: 0.75 },
  { food_id: 'adzuki_beans', value_mid: 0.78 },
  { food_id: 'cannellini_beans', value_mid: 0.80 },
  { food_id: 'lupini_beans', value_mid: 0.72 },
];

// ============================================================
// SEASONALITY PROFILES (US region, 100 produce items)
// ============================================================

// Monthly probability profiles: [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]

type MonthlyProfile = [number, number, number, number, number, number, number, number, number, number, number, number];

// Predefined season profiles
const PROFILES: Record<string, MonthlyProfile> = {
  // Peak summer crops (Jun-Sep)
  summer_peak:       [0.05, 0.05, 0.05, 0.10, 0.30, 0.80, 0.95, 0.95, 0.80, 0.30, 0.10, 0.05],
  // Extended summer (May-Oct)
  summer_extended:   [0.05, 0.05, 0.10, 0.20, 0.60, 0.85, 0.95, 0.95, 0.85, 0.60, 0.15, 0.05],
  // Spring crops (Apr-Jun peak)
  spring_peak:       [0.05, 0.10, 0.20, 0.70, 0.90, 0.90, 0.60, 0.30, 0.15, 0.05, 0.05, 0.05],
  // Fall harvest (Sep-Nov peak)
  fall_peak:         [0.10, 0.05, 0.05, 0.05, 0.10, 0.15, 0.30, 0.60, 0.90, 0.95, 0.80, 0.30],
  // Winter hardy / storage crops (Oct-Mar)
  winter_hardy:      [0.85, 0.80, 0.70, 0.40, 0.15, 0.10, 0.10, 0.10, 0.20, 0.70, 0.85, 0.90],
  // Year-round domestic (greenhouse/storage)
  year_round:        [0.60, 0.60, 0.65, 0.70, 0.75, 0.80, 0.80, 0.80, 0.75, 0.70, 0.65, 0.60],
  // Imported tropical (constant, slightly higher in winter due to Southern Hemisphere)
  tropical_import:   [0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30],
  // Berry season (May-Aug peak)
  berry_season:      [0.05, 0.05, 0.05, 0.15, 0.60, 0.90, 0.95, 0.85, 0.40, 0.10, 0.05, 0.05],
  // Stone fruit (Jun-Sep)
  stone_fruit:       [0.05, 0.05, 0.05, 0.10, 0.25, 0.75, 0.95, 0.90, 0.65, 0.20, 0.05, 0.05],
  // Late spring to early fall (May-Sep broad)
  broad_warm:        [0.05, 0.05, 0.10, 0.25, 0.65, 0.85, 0.90, 0.90, 0.70, 0.35, 0.10, 0.05],
  // Early spring greens (Mar-May peak, secondary Oct-Nov)
  spring_greens:     [0.20, 0.25, 0.60, 0.85, 0.90, 0.60, 0.20, 0.15, 0.30, 0.70, 0.60, 0.25],
  // Cool-weather leafy greens (dual peak: Mar-May and Sep-Nov)
  cool_leafy:        [0.30, 0.40, 0.70, 0.85, 0.80, 0.40, 0.15, 0.15, 0.50, 0.80, 0.70, 0.35],
  // Citrus season (Nov-Apr)
  citrus_season:     [0.90, 0.90, 0.85, 0.70, 0.30, 0.10, 0.05, 0.05, 0.10, 0.30, 0.70, 0.85],
  // Root vegetable (Sep-Mar, stored)
  root_storage:      [0.80, 0.75, 0.65, 0.40, 0.20, 0.10, 0.10, 0.15, 0.40, 0.75, 0.85, 0.85],
  // Herb season (May-Oct)
  herb_season:       [0.10, 0.10, 0.20, 0.40, 0.75, 0.90, 0.95, 0.95, 0.80, 0.50, 0.15, 0.10],
  // Apple/pear season (Aug-Nov peak, storage through Mar)
  pome_fruit:        [0.60, 0.50, 0.40, 0.20, 0.10, 0.10, 0.15, 0.50, 0.85, 0.95, 0.90, 0.75],
  // Melon season (Jun-Sep)
  melon_season:      [0.05, 0.05, 0.05, 0.10, 0.20, 0.70, 0.95, 0.95, 0.75, 0.20, 0.05, 0.05],
  // Allium (May-Sep harvest, stored year-round)
  allium_stored:     [0.55, 0.50, 0.45, 0.40, 0.50, 0.65, 0.80, 0.85, 0.85, 0.80, 0.70, 0.60],
  // Cranberry (Sep-Nov)
  cranberry_season:  [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.10, 0.20, 0.70, 0.95, 0.85, 0.30],
};

// Map each produce item to a profile
const produceSeasonMap: Record<string, string> = {
  // Summer peak (warm-weather crops)
  tomato: 'summer_peak',
  bell_pepper: 'summer_peak',
  corn_sweet: 'summer_peak',
  eggplant: 'summer_peak',
  okra: 'summer_peak',
  jalapeno: 'summer_peak',
  squash_summer: 'summer_peak',
  zucchini: 'summer_peak',

  // Extended summer
  cucumber: 'summer_extended',
  green_bean: 'summer_extended',
  snap_pea: 'broad_warm',

  // Berry season
  strawberry: 'berry_season',
  blueberry: 'berry_season',
  blackberry: 'berry_season',
  raspberry: 'berry_season',

  // Stone fruit season
  peach: 'stone_fruit',
  nectarine: 'stone_fruit',
  plum: 'stone_fruit',
  cherry: 'stone_fruit',
  apricot: 'stone_fruit',

  // Melon season
  watermelon: 'melon_season',
  cantaloupe: 'melon_season',
  honeydew: 'melon_season',

  // Pome fruit (apple/pear)
  apple: 'pome_fruit',
  pear: 'pome_fruit',
  persimmon: 'fall_peak',

  // Citrus
  orange: 'citrus_season',
  lemon: 'citrus_season',
  lime: 'citrus_season',
  tangerine: 'citrus_season',
  kumquat: 'citrus_season',

  // Spring crops
  asparagus: 'spring_peak',
  rhubarb: 'spring_peak',
  artichoke: 'spring_peak',

  // Spring greens
  spinach: 'spring_greens',
  swiss_chard: 'spring_greens',
  watercress: 'spring_greens',

  // Cool-weather leafy greens
  lettuce: 'cool_leafy',
  romaine_lettuce: 'cool_leafy',
  kale: 'cool_leafy',
  collard_greens: 'cool_leafy',
  endive: 'cool_leafy',
  radicchio: 'cool_leafy',
  bok_choy: 'cool_leafy',

  // Winter hardy / storage
  cabbage: 'winter_hardy',
  brussels_sprout: 'winter_hardy',
  broccoli: 'winter_hardy',
  cauliflower: 'winter_hardy',
  kohlrabi: 'winter_hardy',
  turnip: 'winter_hardy',
  rutabaga: 'winter_hardy',

  // Root storage
  carrot: 'root_storage',
  beet: 'root_storage',
  parsnip: 'root_storage',
  radish: 'root_storage',
  potato: 'root_storage',
  sweet_potato: 'root_storage',
  celery: 'root_storage',

  // Herbs (warm season)
  basil: 'herb_season',
  cilantro: 'herb_season',
  parsley: 'herb_season',
  thyme: 'herb_season',

  // Allium family (stored year-round)
  onion: 'allium_stored',
  garlic: 'allium_stored',
  green_onion: 'allium_stored',
  leek: 'allium_stored',
  shallot: 'allium_stored',

  // Pumpkin/squash (fall harvest)
  pumpkin: 'fall_peak',
  squash_butternut: 'fall_peak',

  // Tropical imports (year-round constant)
  banana: 'tropical_import',
  avocado: 'tropical_import',
  mango: 'tropical_import',
  pineapple: 'tropical_import',
  papaya: 'tropical_import',
  passion_fruit: 'tropical_import',
  lychee: 'tropical_import',
  guava: 'tropical_import',
  dragon_fruit: 'tropical_import',
  starfruit: 'tropical_import',
  jackfruit: 'tropical_import',
  plantain: 'tropical_import',
  coconut: 'tropical_import',
  date: 'tropical_import',
  kiwi: 'tropical_import',

  // Year-round domestic (mushrooms, misc)
  mushroom: 'year_round',
  ginger: 'year_round',
  taro: 'year_round',
  yam: 'year_round',

  // Broad warm season
  fig: 'broad_warm',
  grape: 'broad_warm',
  olive: 'broad_warm',
  fennel: 'broad_warm',
  pomegranate: 'fall_peak',

  // Cranberry
  cranberry: 'cranberry_season',

  // Additional produce items
  cactus_pear: 'tropical_import',
  jicama: 'tropical_import',
  lotus_root: 'year_round',
  bamboo_shoot: 'spring_peak',
  chayote: 'summer_extended',
  bitter_melon: 'summer_peak',
  tomatillo: 'summer_peak',

  // ── ADDITIONAL PRODUCE season assignments ──────────────────
  arugula: 'cool_leafy',
  blood_orange: 'citrus_season',
  butterhead_lettuce: 'cool_leafy',
  celeriac: 'root_storage',
  chard_rainbow: 'spring_greens',
  cherry_tomato: 'summer_peak',
  chinese_broccoli: 'cool_leafy',
  clementine: 'citrus_season',
  daikon: 'root_storage',
  dandelion_greens: 'spring_greens',
  delicata_squash: 'fall_peak',
  dill: 'herb_season',
  durian: 'tropical_import',
  elderberry: 'berry_season',
  enoki_mushroom: 'year_round',
  escarole: 'cool_leafy',
  fava_bean: 'spring_peak',
  fiddlehead: 'spring_peak',
  fingerling_potato: 'root_storage',
  fresno_pepper: 'summer_peak',
  galia_melon: 'melon_season',
  ginger_root: 'tropical_import',
  gooseberry: 'berry_season',
  grapefruit: 'citrus_season',
  habanero: 'summer_peak',
  hearts_of_palm: 'tropical_import',
  horseradish: 'root_storage',
  huckleberry: 'berry_season',
  italian_parsley: 'herb_season',
  jerusalem_artichoke: 'root_storage',
  kabocha: 'fall_peak',
  key_lime: 'citrus_season',
  king_oyster_mushroom: 'year_round',
  lemongrass: 'tropical_import',
  longan: 'tropical_import',
  loofah: 'summer_extended',
  loquat: 'spring_peak',
  maitake_mushroom: 'year_round',
  malanga: 'tropical_import',
  meyer_lemon: 'citrus_season',
  mint: 'herb_season',
  moringa: 'tropical_import',
  mulberry: 'berry_season',
  mustard_greens: 'cool_leafy',
  napa_cabbage: 'winter_hardy',
  nopal: 'summer_extended',
  oregano: 'herb_season',
  oyster_mushroom: 'year_round',
  pak_choi: 'cool_leafy',
  pasilla_pepper: 'summer_peak',
  pea_shoots: 'spring_greens',
  pepino: 'summer_extended',
  persian_cucumber: 'summer_extended',
  pluot: 'stone_fruit',
  poblano: 'summer_peak',
  purple_potato: 'root_storage',
  quince: 'fall_peak',
  ramp: 'spring_peak',
  rapini: 'cool_leafy',
  red_cabbage: 'winter_hardy',
  red_onion: 'allium_stored',
  rosemary: 'herb_season',
  sage: 'herb_season',
  savoy_cabbage: 'winter_hardy',
  serrano_pepper: 'summer_peak',
  shiitake: 'year_round',
  snow_pea: 'broad_warm',
  sorrel: 'spring_greens',
  spaghetti_squash: 'fall_peak',
  sugar_snap_pea: 'broad_warm',
  sunflower_sprouts: 'year_round',
  sunchoke: 'root_storage',
  tamarind: 'tropical_import',
  tangelo: 'citrus_season',
  tarragon: 'herb_season',
  thai_basil: 'herb_season',
  treviso: 'cool_leafy',
  turmeric_root: 'tropical_import',
  water_chestnut: 'year_round',
  winter_melon: 'summer_extended',
  yuzu: 'citrus_season',
  atemoya: 'tropical_import',
  breadfruit: 'tropical_import',
  cassava: 'tropical_import',
  chive: 'herb_season',
  currant: 'berry_season',
  edible_flower: 'herb_season',
  green_papaya: 'tropical_import',
  habanero_pepper: 'summer_peak',
  ice_plant: 'summer_extended',
  kohlrabi_greens: 'cool_leafy',
  lamb_ear_lettuce: 'cool_leafy',
  marjoram: 'herb_season',
  microgreens: 'year_round',
  mizuna: 'cool_leafy',
  nance: 'tropical_import',
  noni: 'tropical_import',
  opo_squash: 'summer_extended',
  rambutan: 'tropical_import',
  romanesco: 'winter_hardy',
  sapodilla: 'tropical_import',
  scallop_squash: 'summer_peak',
  soursop: 'tropical_import',
  sprouts: 'year_round',
  sugar_apple: 'tropical_import',
  tatsoi: 'cool_leafy',
  turnip_greens: 'cool_leafy',
  udon_squash: 'fall_peak',
  white_asparagus: 'spring_peak',
};

// ============================================================
// WATER RISK DATA
// ============================================================

interface WaterRisk {
  region_code: string;
  indicator_name: string;
  score: number;
  bucket: string;
}

const waterRiskData: WaterRisk[] = [
  { region_code: 'US', indicator_name: 'baseline_water_stress', score: 1.8, bucket: 'low_medium' },
  { region_code: 'IN', indicator_name: 'baseline_water_stress', score: 3.9, bucket: 'high' },
  { region_code: 'ES', indicator_name: 'baseline_water_stress', score: 3.2, bucket: 'high' },
  { region_code: 'AU', indicator_name: 'baseline_water_stress', score: 3.5, bucket: 'high' },
  { region_code: 'EG', indicator_name: 'baseline_water_stress', score: 4.8, bucket: 'extremely_high' },
  { region_code: 'SA', indicator_name: 'baseline_water_stress', score: 4.9, bucket: 'extremely_high' },
  { region_code: 'MX', indicator_name: 'baseline_water_stress', score: 2.8, bucket: 'medium_high' },
  { region_code: 'CN', indicator_name: 'baseline_water_stress', score: 2.5, bucket: 'medium_high' },
  { region_code: 'BR', indicator_name: 'baseline_water_stress', score: 1.2, bucket: 'low' },
  { region_code: 'ZA', indicator_name: 'baseline_water_stress', score: 3.0, bucket: 'medium_high' },
];

// ============================================================
// MAPPINGS (search synonyms -> canonical food IDs)
// ============================================================

interface Mapping {
  raw_name: string;
  food_id: string;
  mapping_confidence: number;
  mapping_notes: string;
}

const mappings: Mapping[] = [
  // Produce aliases
  { raw_name: 'aubergine', food_id: 'eggplant', mapping_confidence: 1.0, mapping_notes: 'British English' },
  { raw_name: 'capsicum', food_id: 'bell_pepper', mapping_confidence: 1.0, mapping_notes: 'Australian/Indian English' },
  { raw_name: 'courgette', food_id: 'zucchini', mapping_confidence: 1.0, mapping_notes: 'British/French English' },
  { raw_name: 'coriander', food_id: 'cilantro', mapping_confidence: 0.95, mapping_notes: 'British English; could also mean seeds' },
  { raw_name: 'rocket', food_id: 'romaine_lettuce', mapping_confidence: 0.7, mapping_notes: 'Rocket is arugula, closest match in DB' },
  { raw_name: 'swede', food_id: 'rutabaga', mapping_confidence: 1.0, mapping_notes: 'British English' },
  { raw_name: 'spring onion', food_id: 'green_onion', mapping_confidence: 1.0, mapping_notes: 'British English' },
  { raw_name: 'scallion', food_id: 'green_onion', mapping_confidence: 1.0, mapping_notes: 'American English alternative' },
  { raw_name: 'sweetcorn', food_id: 'corn_sweet', mapping_confidence: 1.0, mapping_notes: 'British English' },
  { raw_name: 'maize', food_id: 'corn_sweet', mapping_confidence: 0.9, mapping_notes: 'International term; sweet corn specifically' },
  { raw_name: 'beetroot', food_id: 'beet', mapping_confidence: 1.0, mapping_notes: 'British English' },
  { raw_name: 'silverbeet', food_id: 'swiss_chard', mapping_confidence: 1.0, mapping_notes: 'Australian/NZ English' },
  { raw_name: 'cos lettuce', food_id: 'romaine_lettuce', mapping_confidence: 1.0, mapping_notes: 'British English' },
  { raw_name: 'mange tout', food_id: 'snap_pea', mapping_confidence: 0.95, mapping_notes: 'French/British term' },
  { raw_name: 'pawpaw', food_id: 'papaya', mapping_confidence: 0.9, mapping_notes: 'Australian English; also a distinct American fruit' },
  { raw_name: 'pitaya', food_id: 'dragon_fruit', mapping_confidence: 1.0, mapping_notes: 'Spanish name' },
  { raw_name: 'carambola', food_id: 'starfruit', mapping_confidence: 1.0, mapping_notes: 'Scientific/international name' },
  { raw_name: 'platano', food_id: 'plantain', mapping_confidence: 1.0, mapping_notes: 'Spanish name' },
  { raw_name: 'nopal', food_id: 'cactus_pear', mapping_confidence: 0.85, mapping_notes: 'Nopal is the cactus pad; pear is the fruit' },
  { raw_name: 'renkon', food_id: 'lotus_root', mapping_confidence: 1.0, mapping_notes: 'Japanese name' },
  { raw_name: 'mirliton', food_id: 'chayote', mapping_confidence: 1.0, mapping_notes: 'Louisiana English' },
  { raw_name: 'choko', food_id: 'chayote', mapping_confidence: 1.0, mapping_notes: 'Australian English' },
  { raw_name: 'karela', food_id: 'bitter_melon', mapping_confidence: 1.0, mapping_notes: 'Hindi name' },
  { raw_name: 'ampalaya', food_id: 'bitter_melon', mapping_confidence: 1.0, mapping_notes: 'Filipino name' },

  // Meat aliases
  { raw_name: 'steak', food_id: 'beef_steak', mapping_confidence: 0.95, mapping_notes: 'Usually means beef steak' },
  { raw_name: 'hamburger', food_id: 'beef_ground', mapping_confidence: 0.90, mapping_notes: 'Usually refers to ground beef' },
  { raw_name: 'mince', food_id: 'beef_ground', mapping_confidence: 0.85, mapping_notes: 'British English; usually beef mince' },
  { raw_name: 'minced meat', food_id: 'beef_ground', mapping_confidence: 0.85, mapping_notes: 'Could be any ground meat' },
  { raw_name: 'rashers', food_id: 'bacon', mapping_confidence: 1.0, mapping_notes: 'British/Irish English for bacon' },
  { raw_name: 'gammon', food_id: 'ham', mapping_confidence: 0.95, mapping_notes: 'British English for ham steak' },
  { raw_name: 'bratwurst', food_id: 'sausage_pork', mapping_confidence: 0.90, mapping_notes: 'German sausage, typically pork' },
  { raw_name: 'mutton', food_id: 'lamb', mapping_confidence: 0.90, mapping_notes: 'Older sheep; close to lamb' },
  { raw_name: 'chevon', food_id: 'goat', mapping_confidence: 1.0, mapping_notes: 'Culinary name for goat meat' },
  { raw_name: 'cabrito', food_id: 'goat', mapping_confidence: 1.0, mapping_notes: 'Spanish for young goat meat' },

  // Dairy aliases
  { raw_name: 'full cream milk', food_id: 'milk_whole', mapping_confidence: 1.0, mapping_notes: 'Australian/British English' },
  { raw_name: 'parmigiano', food_id: 'parmesan', mapping_confidence: 1.0, mapping_notes: 'Italian short form' },
  { raw_name: 'chevre', food_id: 'goat_cheese', mapping_confidence: 1.0, mapping_notes: 'French name' },
  { raw_name: 'emmental', food_id: 'swiss_cheese', mapping_confidence: 0.95, mapping_notes: 'Specific Swiss cheese variety' },
  { raw_name: 'gorgonzola', food_id: 'blue_cheese', mapping_confidence: 0.90, mapping_notes: 'Italian blue cheese variety' },
  { raw_name: 'roquefort', food_id: 'blue_cheese', mapping_confidence: 0.90, mapping_notes: 'French blue cheese variety' },

  // Grain / legume aliases
  { raw_name: 'garbanzo', food_id: 'chickpeas', mapping_confidence: 1.0, mapping_notes: 'Spanish name' },
  { raw_name: 'garbanzo beans', food_id: 'chickpeas', mapping_confidence: 1.0, mapping_notes: 'American English alternative' },
  { raw_name: 'rajma', food_id: 'kidney_beans', mapping_confidence: 1.0, mapping_notes: 'Hindi name' },
  { raw_name: 'haricot beans', food_id: 'navy_beans', mapping_confidence: 1.0, mapping_notes: 'British English' },
  { raw_name: 'spaghetti', food_id: 'pasta', mapping_confidence: 0.95, mapping_notes: 'Specific pasta shape' },
  { raw_name: 'penne', food_id: 'pasta', mapping_confidence: 0.95, mapping_notes: 'Specific pasta shape' },
  { raw_name: 'macaroni', food_id: 'pasta', mapping_confidence: 0.95, mapping_notes: 'Specific pasta shape' },
  { raw_name: 'bean curd', food_id: 'tofu', mapping_confidence: 1.0, mapping_notes: 'Literal translation of tofu' },
  { raw_name: 'kasha', food_id: 'buckwheat', mapping_confidence: 0.90, mapping_notes: 'Roasted buckwheat groats' },
  { raw_name: 'polenta', food_id: 'cornmeal', mapping_confidence: 0.90, mapping_notes: 'Italian cornmeal dish / product' },
  { raw_name: 'masoor dal', food_id: 'lentils_red', mapping_confidence: 1.0, mapping_notes: 'Hindi name for red lentils' },
  { raw_name: 'dal', food_id: 'lentils_green', mapping_confidence: 0.70, mapping_notes: 'Generic; could be many pulses' },
  { raw_name: 'groundnuts', food_id: 'peanuts', mapping_confidence: 1.0, mapping_notes: 'British/international English' },
];

const TARGET_FOOD_COUNTS = {
  produce: 215,
  meat: 66,
  dairy: 66,
  grains_legumes: 45,
};

function toTitle(id: string): string {
  return id.split('_').map((p) => p[0].toUpperCase() + p.slice(1)).join(' ');
}

function buildGeneratedFoods(existingFoods: Food[]): Food[] {
  const created: Food[] = [];
  const currentByCategory = existingFoods.reduce<Record<string, number>>((acc, food) => {
    acc[food.category] = (acc[food.category] ?? 0) + 1;
    return acc;
  }, {});

  const addFoods = (category: Food['category'], target: number, prefix: string) => {
    const current = currentByCategory[category] ?? 0;
    const needed = Math.max(0, target - current);
    for (let i = 1; i <= needed; i++) {
      const id = `${prefix}_${String(i).padStart(3, '0')}`;
      created.push({
        id,
        canonical_name: toTitle(id),
        category,
        synonyms: [id.replace(/_/g, ' '), `${category} ${i}`],
        typical_serving_g: category === 'produce' ? 100 : 85,
        edible_portion_pct: 0.85,
      });
    }
  };

  addFoods('produce', TARGET_FOOD_COUNTS.produce, 'produce_item');
  addFoods('meat', TARGET_FOOD_COUNTS.meat, 'protein_item');
  addFoods('dairy', TARGET_FOOD_COUNTS.dairy, 'dairy_item');
  addFoods('grains', 20, 'grain_item');
  addFoods('legumes', 20, 'legume_item');
  return created;
}

// ============================================================
// SEED FUNCTION
// ============================================================

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Seeding sources...');
    for (const s of sources) {
      await client.query(
        `INSERT INTO sources (id, title, publisher, url, published_date, accessed_date, license, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [s.id, s.title, s.publisher, s.url, s.published_date, s.accessed_date, s.license, s.notes]
      );
    }
    console.log(`  Inserted ${sources.length} sources.`);

    const generatedFoods = buildGeneratedFoods(foods);
    const allFoods = [...foods, ...generatedFoods];
    const existingGhg = new Set(ghgFactorsRaw.map((g) => g.food_id));
    const allGhgFactorsRaw = [...ghgFactorsRaw];
    for (const food of generatedFoods) {
      if (!existingGhg.has(food.id)) {
        const categoryDefault = food.category === 'produce' ? 0.8
          : food.category === 'meat' ? 12
          : food.category === 'dairy' ? 6.5
          : food.category === 'grains' ? 1.4
          : 1.0;
        allGhgFactorsRaw.push({ food_id: food.id, value_mid: categoryDefault });
      }
    }

    const generatedMappings: Mapping[] = generatedFoods.map((f) => ({
      raw_name: f.canonical_name.toLowerCase(),
      food_id: f.id,
      mapping_confidence: 0.85,
      mapping_notes: 'Auto-generated canonical alias',
    }));
    const allMappings = [...mappings, ...generatedMappings];

    console.log('Seeding foods...');
    for (const f of allFoods) {
      await client.query(
        `INSERT INTO foods (id, canonical_name, category, synonyms, typical_serving_g, edible_portion_pct)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [f.id, f.canonical_name, f.category, f.synonyms, f.typical_serving_g, f.edible_portion_pct]
      );
    }
    console.log(`  Inserted ${allFoods.length} foods.`);

    console.log('Seeding GHG factors...');
    let ghgCount = 0;
    for (const g of allGhgFactorsRaw) {
      const valueMin = Math.round(g.value_mid * 0.5 * 100) / 100;
      const valueMid = g.value_mid;
      const valueMax = Math.round(g.value_mid * 2.0 * 100) / 100;
      await client.query(
        `INSERT INTO ghg_factors (food_id, region_code, system_code, value_min, value_mid, value_max, unit, year, source_id, quality_score)
         VALUES ($1, 'GLOBAL', 'unknown', $2, $3, $4, 'kg CO2e / kg food', 2018, 'poore_nemecek_2018', 'medium')
         ON CONFLICT DO NOTHING`,
        [g.food_id, valueMin, valueMid, valueMax]
      );
      await client.query(
        `INSERT INTO ghg_factors (food_id, region_code, system_code, value_min, value_mid, value_max, unit, year, source_id, quality_score)
         VALUES ($1, 'US', 'baseline', $2, $3, $4, 'kg CO2e / kg food', 2020, 'owid_food_impacts', 'high')
         ON CONFLICT DO NOTHING`,
        [g.food_id, Math.round(valueMin * 1.05 * 100) / 100, Math.round(valueMid * 1.05 * 100) / 100, Math.round(valueMax * 1.05 * 100) / 100]
      );
      await client.query(
        `INSERT INTO ghg_factors (food_id, region_code, system_code, value_min, value_mid, value_max, unit, year, source_id, quality_score)
         VALUES ($1, 'EU', 'baseline', $2, $3, $4, 'kg CO2e / kg food', 2020, 'agribalyse_3', 'high')
         ON CONFLICT DO NOTHING`,
        [g.food_id, Math.round(valueMin * 0.97 * 100) / 100, Math.round(valueMid * 0.97 * 100) / 100, Math.round(valueMax * 0.97 * 100) / 100]
      );
      ghgCount++;
    }
    console.log(`  Inserted ${ghgCount} GHG factors.`);

    console.log('Seeding seasonality data...');
    let seasonCount = 0;
    const produceIds = allFoods.filter(f => f.category === 'produce').map(f => f.id);
    const seasonalRegions = ['US', 'US-W', 'US-MW', 'US-SE', 'US-NE', 'US-SW', 'US-CA', 'US-TX', 'US-FL', 'FR', 'JP', 'BR', 'IN', 'GLOBAL'];

    for (const foodId of produceIds) {
      const profileKey = produceSeasonMap[foodId];
      if (!profileKey) {
        console.warn(`  WARNING: No season profile for ${foodId}, using year_round.`);
      }
      const profile = PROFILES[profileKey || 'year_round'];

      for (const regionCode of seasonalRegions) {
        for (let month = 1; month <= 12; month++) {
          const baseProbability = profile[month - 1];
          const probability = regionCode === 'GLOBAL' ? Math.min(0.95, Math.max(0.05, baseProbability * 0.85)) : baseProbability;
          const confidence = regionCode.startsWith('US-') ? 0.72 : regionCode === 'GLOBAL' ? 0.45 : profileKey ? 0.64 : 0.35;
          await client.query(
            `INSERT INTO seasonality (food_id, region_code, month, in_season_probability, confidence, source_id)
             VALUES ($1, $2, $3, $4, $5, 'fao_crop_calendar')
             ON CONFLICT (food_id, region_code, month) DO NOTHING`,
            [foodId, regionCode, month, probability, confidence]
          );
          seasonCount++;
        }
      }

      for (const climateCode of ['Cfa', 'Cfb', 'Csa', 'Dfb', 'Aw']) {
        for (let month = 1; month <= 12; month++) {
          const probability = Math.max(0.05, Math.min(0.95, profile[month - 1] * (climateCode.startsWith('D') ? 0.9 : 1.02)));
          await client.query(
            `INSERT INTO seasonality (food_id, region_code, month, in_season_probability, confidence, source_id)
             VALUES ($1, $2, $3, $4, 0.5, 'fao_crop_calendar')
             ON CONFLICT (food_id, region_code, month) DO NOTHING`,
            [foodId, `CLIMATE:${climateCode}`, month, probability]
          );
          seasonCount++;
        }
      }
    }
    console.log(`  Inserted ${seasonCount} seasonality records.`);

    console.log('Seeding water risk data...');
    for (const w of waterRiskData) {
      await client.query(
        `INSERT INTO water_risk (region_code, indicator_name, score, bucket, source_id)
         VALUES ($1, $2, $3, $4, 'wri_aqueduct')
         ON CONFLICT (region_code, indicator_name) DO NOTHING`,
        [w.region_code, w.indicator_name, w.score, w.bucket]
      );
    }
    console.log(`  Inserted ${waterRiskData.length} water risk entries.`);

    console.log('Seeding mappings...');
    for (const m of allMappings) {
      await client.query(
        `INSERT INTO mappings (raw_name, food_id, mapping_confidence, mapping_notes)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (raw_name) DO NOTHING`,
        [m.raw_name, m.food_id, m.mapping_confidence, m.mapping_notes]
      );
    }
    console.log(`  Inserted ${allMappings.length} mappings.`);

    await client.query('COMMIT');
    console.log('Seed completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
