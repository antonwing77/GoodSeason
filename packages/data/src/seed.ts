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

  // ── MEAT (30) ──────────────────────────────────────────────
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

  // ── DAIRY (30) ─────────────────────────────────────────────
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

  // ── GRAINS & LEGUMES (30) ──────────────────────────────────
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

    console.log('Seeding foods...');
    for (const f of foods) {
      await client.query(
        `INSERT INTO foods (id, canonical_name, category, synonyms, typical_serving_g, edible_portion_pct)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [f.id, f.canonical_name, f.category, f.synonyms, f.typical_serving_g, f.edible_portion_pct]
      );
    }
    console.log(`  Inserted ${foods.length} foods.`);

    console.log('Seeding GHG factors...');
    let ghgCount = 0;
    for (const g of ghgFactorsRaw) {
      const valueMin = Math.round(g.value_mid * 0.5 * 100) / 100;
      const valueMid = g.value_mid;
      const valueMax = Math.round(g.value_mid * 2.0 * 100) / 100;
      await client.query(
        `INSERT INTO ghg_factors (food_id, region_code, system_code, value_min, value_mid, value_max, unit, year, source_id, quality_score)
         VALUES ($1, 'GLOBAL', 'unknown', $2, $3, $4, 'kg CO2e / kg food', 2018, 'poore_nemecek_2018', 'medium')
         ON CONFLICT DO NOTHING`,
        [g.food_id, valueMin, valueMid, valueMax]
      );
      ghgCount++;
    }
    console.log(`  Inserted ${ghgCount} GHG factors.`);

    console.log('Seeding seasonality data...');
    let seasonCount = 0;
    const produceIds = foods.filter(f => f.category === 'produce').map(f => f.id);

    for (const foodId of produceIds) {
      const profileKey = produceSeasonMap[foodId];
      if (!profileKey) {
        console.warn(`  WARNING: No season profile for ${foodId}, using year_round.`);
      }
      const profile = PROFILES[profileKey || 'year_round'];

      for (let month = 1; month <= 12; month++) {
        const probability = profile[month - 1];
        const confidence = profileKey ? 0.6 : 0.3; // lower confidence for defaulted items
        await client.query(
          `INSERT INTO seasonality (food_id, region_code, month, in_season_probability, confidence, source_id)
           VALUES ($1, 'US', $2, $3, $4, 'fao_crop_calendar')
           ON CONFLICT (food_id, region_code, month) DO NOTHING`,
          [foodId, month, probability, confidence]
        );
        seasonCount++;
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
    for (const m of mappings) {
      await client.query(
        `INSERT INTO mappings (raw_name, food_id, mapping_confidence, mapping_notes)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (raw_name) DO NOTHING`,
        [m.raw_name, m.food_id, m.mapping_confidence, m.mapping_notes]
      );
    }
    console.log(`  Inserted ${mappings.length} mappings.`);

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
