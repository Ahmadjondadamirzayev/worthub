import { Language } from './i18n';
import { WordItem, VocabularyLesson } from '../types/german';

// Weekdays mapping
export const WEEKDAY_MAP: Record<string, { ru: string; en: string; uz: string }> = {
  all: { ru: 'Все', en: 'All', uz: 'Barchasi' },
  dushanba: { ru: 'Понедельник', en: 'Monday', uz: 'Dushanba' },
  seshanba: { ru: 'Вторник', en: 'Tuesday', uz: 'Seshanba' },
  chorshanba: { ru: 'Среда', en: 'Wednesday', uz: 'Chorshanba' },
  payshanba: { ru: 'Четверг', en: 'Thursday', uz: 'Payshanba' },
  juma: { ru: 'Пятница', en: 'Friday', uz: 'Juma' },
  shanba: { ru: 'Суббота', en: 'Saturday', uz: 'Shanba' },
  yakshanba: { ru: 'Воскресенье', en: 'Sunday', uz: 'Yakshanba' },
};

export function getWeekdayName(weekday: string, lang: Language): string {
  const key = weekday.toLowerCase().trim();
  if (WEEKDAY_MAP[key]) {
    return WEEKDAY_MAP[key][lang] || weekday;
  }
  return weekday;
}

// 20 Lessons Translations
export const LESSON_THEMES: Record<number, { ru: string; en: string; uz: string }> = {
  1: {
    ru: 'Приветствие и знакомство',
    en: 'Greetings & Introductions',
    uz: 'Begrüßung & Kennenlernen',
  },
  2: {
    ru: 'Профессии и личная информация',
    en: 'Occupations & Personal Info',
    uz: 'Berufe & Persönliches',
  },
  3: {
    ru: 'Семья и языки',
    en: 'Family & Languages',
    uz: 'Familie & Sprachen',
  },
  4: {
    ru: 'Мебель и покупки для дома',
    en: 'Furniture & Shopping',
    uz: 'Einkaufen & Möbel',
  },
  5: {
    ru: 'Предметы, часы и цены',
    en: 'Items, Clocks & Prices',
    uz: 'Gegenstände & Preise',
  },
  6: {
    ru: 'Распорядок дня и досуг',
    en: 'Daily Routine & Leisure',
    uz: 'Tagesablauf & Freizeit',
  },
  7: {
    ru: 'Свободное время и хобби',
    en: 'Leisure & Hobbies',
    uz: 'Freizeit & Hobbys',
  },
  8: {
    ru: 'В городе и ориентирование',
    en: 'In the City & Navigation',
    uz: 'In der Stadt & Orientierung',
  },
  9: {
    ru: 'Еда и напитки',
    en: 'Food & Drinks',
    uz: 'Essen & Trinken',
  },
  10: {
    ru: 'Встречи и расписание',
    en: 'Appointments & Schedule',
    uz: 'Termine & Verabredungen',
  },
  11: {
    ru: 'Планы, прогулки и поездки',
    en: 'Plans, Trips & Travel',
    uz: 'Pläne & Ausflüge',
  },
  12: {
    ru: 'Здоровье и самочувствие',
    en: 'Health & Well-being',
    uz: 'Gesundheit & Krankheit',
  },
  13: {
    ru: 'Городской транспорт и передвижение',
    en: 'City Transport & Travel',
    uz: 'In der Stadt unterwegs',
  },
  14: {
    ru: 'Сервис и повседневная жизнь',
    en: 'Customer Service & Daily Life',
    uz: 'Kundenservice & Alltag',
  },
  15: {
    ru: 'Квартира и соседи',
    en: 'Apartment & Neighbors',
    uz: 'Neue Wohnung & Nachbarn',
  },
  16: {
    ru: 'Праздники и приглашения',
    en: 'Celebrations & Invitations',
    uz: 'Feste & Einladungen',
  },
  17: {
    ru: 'Профессия и будущее',
    en: 'Career & Future',
    uz: 'Beruf & Zukunft',
  },
  18: {
    ru: 'Здоровье и тело',
    en: 'Health & Body',
    uz: 'Gesundheit & Körper',
  },
  19: {
    ru: 'Домашнее хозяйство и быт',
    en: 'Household & Living Together',
    uz: 'Haushalt & Zusammenleben',
  },
  20: {
    ru: 'Мир работы и профессиональные навыки',
    en: 'Working World & Skills',
    uz: 'Arbeitswelt & Eigenschaften',
  },
};

export function getLessonDisplayTitle(lesson: VocabularyLesson, lang: Language): string {
  const num = lesson.lektionNumber || 1;
  const theme = getLessonDisplayTheme(lesson, lang);
  if (lang === 'ru') {
    return `Урок ${num}: ${theme}`;
  }
  if (lang === 'en') {
    return `Lesson ${num}: ${theme}`;
  }
  return lesson.title || `Lektion ${num}: ${theme}`;
}

export function getLessonDisplayTheme(lesson: VocabularyLesson, lang: Language): string {
  const num = lesson.lektionNumber || 1;
  if (LESSON_THEMES[num] && LESSON_THEMES[num][lang]) {
    return LESSON_THEMES[num][lang];
  }
  return lesson.themeTopic || lesson.germanTitle || `Lektion ${num}`;
}

export function getLessonDisplayDesc(lesson: VocabularyLesson, lang: Language): string {
  const num = lesson.lektionNumber || 1;
  const theme = getLessonDisplayTheme(lesson, lang);
  if (lang === 'ru') {
    return `Blitz Немецкий Центр — Словарь Урока ${num} (${theme})`;
  }
  if (lang === 'en') {
    return `Blitz German Center — Lesson ${num} vocabulary collection (${theme})`;
  }
  return lesson.description || `Blitz Nemis tili markazi — Lektion ${num} (${theme}) so'zlar to'plami`;
}

// Core German Words Vocabulary Database
const GERMAN_VOCAB_MAP: Record<string, { ru: string; en: string }> = {
  // Greetings & basic phrases
  wie: { ru: 'как', en: 'how' },
  'heißt (heißen)': { ru: 'зовут / называется (звать)', en: 'is called (to be called)' },
  heißen: { ru: 'звать / называться', en: 'to be called' },
  ich: { ru: 'я', en: 'I' },
  du: { ru: 'ты', en: 'you' },
  'er / es / sie': { ru: 'он / оно / она', en: 'he / it / she' },
  er: { ru: 'он', en: 'he' },
  es: { ru: 'оно', en: 'it' },
  sie: { ru: 'она / они', en: 'she / they' },
  'Sie': { ru: 'Вы (уважительно)', en: 'You (formal)' },
  wir: { ru: 'мы', en: 'we' },
  ihr: { ru: 'вы (во множ. числе)', en: 'you (plural)' },
  'bist (sein)': { ru: 'ты есть (быть)', en: 'are (to be)' },
  'bin (sein)': { ru: 'я есть (быть)', en: 'am (to be)' },
  'ist (sein)': { ru: 'он/она/оно есть (быть)', en: 'is (to be)' },
  'sind (sein)': { ru: 'есть / являемся (быть)', en: 'are (to be)' },
  sein: { ru: 'быть / являться', en: 'to be' },
  wer: { ru: 'кто', en: 'who' },
  was: { ru: 'что', en: 'what' },
  wo: { ru: 'где', en: 'where' },
  woher: { ru: 'откуда', en: 'where from' },
  wohin: { ru: 'куда', en: 'where to' },
  'kommst (kommen)': { ru: 'приходишь (приходить)', en: 'come (to come)' },
  kommen: { ru: 'приходить / приезжать', en: 'to come' },
  'lernt (lernen)': { ru: 'учит (учить)', en: 'learns (to learn)' },
  lernen: { ru: 'учить / изучать', en: 'to learn' },
  'geht’s (gehen)': { ru: 'дела идут (идти)', en: 'how it goes (to go)' },
  'geht\'s (gehen)': { ru: 'дела идут (идти)', en: 'how it goes (to go)' },
  gehen: { ru: 'идти / ходить', en: 'to go' },
  hallo: { ru: 'привет', en: 'hello' },
  'guten tag': { ru: 'добрый день', en: 'good day' },
  'guten morgen': { ru: 'доброе утро', en: 'good morning' },
  'guten abend': { ru: 'добрый вечер', en: 'good evening' },
  'gute nacht': { ru: 'доброй ночи', en: 'good night' },
  'auf wiedersehen': { ru: 'до свидания', en: 'goodbye' },
  tschüss: { ru: 'пока', en: 'bye' },
  danke: { ru: 'спасибо', en: 'thank you' },
  bitte: { ru: 'пожалуйста', en: 'please / you are welcome' },
  ja: { ru: 'да', en: 'yes' },
  nein: { ru: 'нет', en: 'no' },
  nicht: { ru: 'не', en: 'not' },
  kein: { ru: 'никакой / не', en: 'no / none' },
  sehr: { ru: 'очень', en: 'very' },
  gut: { ru: 'хорошо / хороший', en: 'good / well' },
  super: { ru: 'отлично / супер', en: 'super / great' },
  toll: { ru: 'замечательно / здорово', en: 'great / awesome' },
  schlecht: { ru: 'плохо', en: 'bad' },
  schön: { ru: 'красивый / приятно', en: 'beautiful / nice' },
  neu: { ru: 'новый', en: 'new' },
  alt: { ru: 'старый', en: 'old' },
  'jahre alt': { ru: 'лет (возраст)', en: 'years old' },
  'das jahr': { ru: 'год', en: 'year' },
  groß: { ru: 'большой', en: 'big / large' },
  klein: { ru: 'маленький', en: 'small / little' },
  viel: { ru: 'много', en: 'much / a lot' },
  wenig: { ru: 'мало', en: 'little / few' },
  auch: { ru: 'тоже / также', en: 'also / too' },
  und: { ru: 'и', en: 'and' },
  oder: { ru: 'или', en: 'or' },
  aber: { ru: 'но', en: 'but' },
  hier: { ru: 'здесь', en: 'here' },
  dort: { ru: 'там', en: 'there' },
  heute: { ru: 'сегодня', en: 'today' },
  gestern: { ru: 'вчера', en: 'yesterday' },
  morgen: { ru: 'завтра / утро', en: 'tomorrow / morning' },
  jetzt: { ru: 'сейчас', en: 'now' },
  immer: { ru: 'всегда', en: 'always' },
  oft: { ru: 'часто', en: 'often' },
  manchmal: { ru: 'иногда', en: 'sometimes' },
  nie: { ru: 'никогда', en: 'never' },

  // Family & People
  'die familie': { ru: 'семья', en: 'family' },
  'der vater': { ru: 'отец / папа', en: 'father / dad' },
  'die mutter': { ru: 'мать / мама', en: 'mother / mom' },
  'die eltern': { ru: 'родители', en: 'parents' },
  'der sohn': { ru: 'сын', en: 'son' },
  'die tochter': { ru: 'дочь', en: 'daughter' },
  'der bruder': { ru: 'брат', en: 'brother' },
  'die schwester': { ru: 'сестра', en: 'sister' },
  'die geschwister': { ru: 'братья и сестры', en: 'siblings' },
  'der großvater': { ru: 'дедушка', en: 'grandfather' },
  'die großmutter': { ru: 'бабушка', en: 'grandmother' },
  'die großeltern': { ru: 'дедушка и бабушка', en: 'grandparents' },
  'der opa': { ru: 'дедушка', en: 'grandpa' },
  'die oma': { ru: 'бабушка', en: 'grandma' },
  'das kind': { ru: 'ребёнок', en: 'child' },
  'die kinder': { ru: 'дети', en: 'children' },
  'der mann': { ru: 'мужчина / муж', en: 'man / husband' },
  'die frau': { ru: 'женщина / жена / госпожа', en: 'woman / wife / Ms.' },
  'der freund': { ru: 'друг / парень', en: 'friend / boyfriend' },
  'die freundin': { ru: 'подруга / девушка', en: 'girlfriend / female friend' },
  'der kollege': { ru: 'коллега (мужчина)', en: 'colleague (male)' },
  'die kollegin': { ru: 'коллега (женщина)', en: 'colleague (female)' },

  // Home & Furniture
  'das haus': { ru: 'дом', en: 'house' },
  'die wohnung': { ru: 'квартира', en: 'apartment / flat' },
  'das zimmer': { ru: 'комната', en: 'room' },
  'die küche': { ru: 'кухня', en: 'kitchen' },
  'das bad': { ru: 'ванная комната', en: 'bathroom' },
  'der tisch': { ru: 'стол', en: 'table' },
  'der stuhl': { ru: 'стул', en: 'chair' },
  'das bett': { ru: 'кровать', en: 'bed' },
  'das sofa': { ru: 'диван', en: 'sofa / couch' },
  'der schrank': { ru: 'шкаф', en: 'cupboard / wardrobe' },
  'das bild': { ru: 'картина / фото', en: 'picture / painting' },
  'die lampe': { ru: 'лампа', en: 'lamp' },
  'die tür': { ru: 'дверь', en: 'door' },
  'das fenster': { ru: 'окно', en: 'window' },
  'der balkon': { ru: 'балкон', en: 'balcony' },
  'der garten': { ru: 'сад', en: 'garden' },
  'der aufzug': { ru: 'лифт', en: 'elevator / lift' },
  'der lift': { ru: 'лифт', en: 'lift' },
  'der schlüssel': { ru: 'ключ', en: 'key' },

  // Food & Drinks
  'das brot': { ru: 'хлеб', en: 'bread' },
  'das brötchen': { ru: 'булочка', en: 'bread roll' },
  'das wasser': { ru: 'вода', en: 'water' },
  'der kaffee': { ru: 'кофе', en: 'coffee' },
  'der tee': { ru: 'чай', en: 'tea' },
  'die milch': { ru: 'молоко', en: 'milk' },
  'der zucker': { ru: 'сахар', en: 'sugar' },
  'das salz': { ru: 'соль', en: 'salt' },
  'der apfel': { ru: 'яблоко', en: 'apple' },
  'die banane': { ru: 'банан', en: 'banana' },
  'die tomate': { ru: 'помидор', en: 'tomato' },
  'die kartoffel': { ru: 'картофель', en: 'potato' },
  'das fleisch': { ru: 'мясо', en: 'meat' },
  'der fisch': { ru: 'рыба', en: 'fish' },
  'der käse': { ru: 'сыр', en: 'cheese' },
  'die butter': { ru: 'сливочное масло', en: 'butter' },
  'das ei': { ru: 'яйцо', en: 'egg' },
  'das obst': { ru: 'фрукты', en: 'fruit' },
  'das gemüse': { ru: 'овощи', en: 'vegetables' },
  'das frühstück': { ru: 'завтрак', en: 'breakfast' },
  'das mittagessen': { ru: 'обед', en: 'lunch' },
  'das abendessen': { ru: 'ужин', en: 'dinner' },
  'das restaurant': { ru: 'ресторан', en: 'restaurant' },
  'das café': { ru: 'кафе', en: 'café' },
  'die rechnung': { ru: 'счёт', en: 'bill / invoice' },

  // City & Transport
  'die stadt': { ru: 'город', en: 'city / town' },
  'die straße': { ru: 'улица', en: 'street' },
  'der platz': { ru: 'площадь / место', en: 'square / place' },
  'das auto': { ru: 'автомобиль', en: 'car' },
  'der bus': { ru: 'автобус', en: 'bus' },
  'der zug': { ru: 'поезд', en: 'train' },
  'die bahn': { ru: 'поезд / железная дорога', en: 'train / railway' },
  'die u-bahn': { ru: 'метро', en: 'subway / metro' },
  'das fahrrad': { ru: 'велосипед', en: 'bicycle / bike' },
  'das flugzeug': { ru: 'самолёт', en: 'airplane' },
  'der flughafen': { ru: 'аэропорт', en: 'airport' },
  'der bahnhof': { ru: 'вокзал', en: 'train station' },
  'das hotel': { ru: 'отель / гостиница', en: 'hotel' },
  'das kino': { ru: 'кинотеатр', en: 'cinema / movies' },
  'das theater': { ru: 'театр', en: 'theater' },
  'das museum': { ru: 'музей', en: 'museum' },
  'die bank': { ru: 'банк / скамейка', en: 'bank / bench' },
  'die post': { ru: 'почта', en: 'post office' },
  'das krankenhaus': { ru: 'больница', en: 'hospital' },
  'die apotheke': { ru: 'аптека', en: 'pharmacy' },
  'der supermarkt': { ru: 'супермаркет', en: 'supermarket' },
  'das kaufhaus': { ru: 'универмаг', en: 'department store' },
  'das geschäft': { ru: 'магазин', en: 'shop / store' },
  'der markt': { ru: 'рынок / базар', en: 'market' },
  'das schwimmbad': { ru: 'бассейн', en: 'swimming pool' },
  'der park': { ru: 'парк', en: 'park' },
  'der wald': { ru: 'лес', en: 'forest' },

  // School, Study & Work
  'das buch': { ru: 'книга', en: 'book' },
  'das heft': { ru: 'тетрадь', en: 'notebook' },
  'der stift': { ru: 'ручка / карандаш', en: 'pen / pencil' },
  'der bleistift': { ru: 'карандаш', en: 'pencil' },
  'die tasche': { ru: 'сумка', en: 'bag' },
  'die schule': { ru: 'школа', en: 'school' },
  'die universität': { ru: 'университет', en: 'university' },
  'der lehrer': { ru: 'учитель / преподаватель', en: 'teacher' },
  'die lehrerin': { ru: 'учительница', en: 'female teacher' },
  'der student': { ru: 'студент', en: 'student' },
  'die studentin': { ru: 'студентка', en: 'female student' },
  'der schüler': { ru: 'ученик', en: 'pupil / student' },
  'die schülerin': { ru: 'ученица', en: 'female pupil' },
  'der kurs': { ru: 'курс / занятие', en: 'course' },
  'die aufgabe': { ru: 'задание / задача', en: 'task / exercise' },
  'das wort': { ru: 'слово', en: 'word' },
  'der satz': { ru: 'предложение', en: 'sentence' },
  'die sprache': { ru: 'язык (речь)', en: 'language' },
  'die arbeit': { ru: 'работа / труд', en: 'work / job' },
  'der beruf': { ru: 'профессия', en: 'profession / job' },
  'die firma': { ru: 'фирма / компания', en: 'company / firm' },
  'das büro': { ru: 'офис / кабинет', en: 'office' },
  'der chef': { ru: 'начальник / шеф', en: 'boss / manager' },
  'das geld': { ru: 'деньги', en: 'money' },
  'der preis': { ru: 'цена', en: 'price' },
  'die uhr': { ru: 'часы (время / предмет)', en: 'clock / watch / o\'clock' },
  'die zeit': { ru: 'время', en: 'time' },
  'das handy': { ru: 'мобильный телефон', en: 'mobile phone' },
  'der computer': { ru: 'компьютер', en: 'computer' },
  'die website': { ru: 'веб-сайт', en: 'website' },

  // Verbs
  arbeiten: { ru: 'работать', en: 'to work' },
  essen: { ru: 'есть / кушать', en: 'to eat' },
  trinken: { ru: 'пить', en: 'to drink' },
  schlafen: { ru: 'спать', en: 'to sleep' },
  wohnen: { ru: 'жить / проживать', en: 'to live / reside' },
  sprechen: { ru: 'говорить / разговаривать', en: 'to speak' },
  verstehen: { ru: 'понимать', en: 'to understand' },
  lesen: { ru: 'читать', en: 'to read' },
  schreiben: { ru: 'писать', en: 'to write' },
  kaufen: { ru: 'покупать', en: 'to buy' },
  verkaufen: { ru: 'продавать', en: 'to sell' },
  haben: { ru: 'иметь', en: 'to have' },
  machen: { ru: 'делать', en: 'to do / make' },
  sehen: { ru: 'видеть / смотреть', en: 'to see' },
  hören: { ru: 'слышать / слушать', en: 'to hear / listen' },
  spielen: { ru: 'играть', en: 'to play' },
  kochen: { ru: 'готовить (еду)', en: 'to cook' },
  reisen: { ru: 'путешествовать', en: 'to travel' },
  fahren: { ru: 'ехать / водить', en: 'to drive / ride' },
  fliegen: { ru: 'летать', en: 'to fly' },
  laufen: { ru: 'бегать / ходить пешком', en: 'to run / walk' },
  schwimmen: { ru: 'плавать', en: 'to swim' },
  tanzen: { ru: 'танцевать', en: 'to dance' },
  singen: { ru: 'петь', en: 'to sing' },
  treffen: { ru: 'встречать', en: 'to meet' },
  kennen: { ru: 'знать (кого-то)', en: 'to know (someone)' },
  kennenlernen: { ru: 'знакомиться', en: 'to get to know' },
  wissen: { ru: 'знать (факты)', en: 'to know (facts)' },
  finden: { ru: 'находить / считать', en: 'to find / consider' },
  suchen: { ru: 'искать', en: 'to search / look for' },
  brauchen: { ru: 'нуждаться / требоваться', en: 'to need' },
  helfen: { ru: 'помогать', en: 'to help' },
  fragen: { ru: 'спрашивать', en: 'to ask' },
  antworten: { ru: 'отвечать', en: 'to answer' },
  kosten: { ru: 'стоить', en: 'to cost' },
  bezahlen: { ru: 'оплачивать', en: 'to pay' },
  öffnen: { ru: 'открывать', en: 'to open' },
  aufmachen: { ru: 'открывать', en: 'to open' },
  schließen: { ru: 'закрывать', en: 'to close' },
  zumachen: { ru: 'закрывать', en: 'to close' },
  beginnen: { ru: 'начинать', en: 'to begin / start' },
  anfangen: { ru: 'начинать', en: 'to begin / start' },
  aufhören: { ru: 'прекращать', en: 'to stop / cease' },
  aufstehen: { ru: 'вставать (с постели)', en: 'to get up' },
  anrufen: { ru: 'звонить (по телефону)', en: 'to call (phone)' },
  einkaufen: { ru: 'совершать покупки', en: 'to shop' },
  fernsehen: { ru: 'смотреть телевизор', en: 'to watch TV' },
  mitkommen: { ru: 'идти вместе', en: 'to come along' },
  mitnehmen: { ru: 'брать с собой', en: 'to take along' },
  können: { ru: 'мочь / уметь', en: 'can / to be able to' },
  müssen: { ru: 'быть должным / обязанным', en: 'must / to have to' },
  wollen: { ru: 'хотеть', en: 'to want' },
  möchten: { ru: 'хотел(а) бы', en: 'would like' },
  dürfen: { ru: 'иметь разрешение', en: 'may / to be allowed' },
  sollen: { ru: 'следует / должен', en: 'should / to be supposed to' },
  mögen: { ru: 'любить / нравиться', en: 'to like' },
  werden: { ru: 'становиться', en: 'to become' },
};

// Clean search key helper
function getCleanKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[,\.\!\?\(\)\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Main translation extractor for German words
 */
export function getWordTranslation(word: WordItem, lang: Language): string {
  if (lang === 'uz') {
    return word.uzbek;
  }

  // 1. Check explicit manual or imported translations on word
  if (lang === 'ru' && word.russian && word.russian.trim()) {
    return word.russian.trim();
  }
  if (lang === 'en' && word.english && word.english.trim()) {
    return word.english.trim();
  }

  // 2. Direct match on German word (stripped of any article)
  const bare = word.german.replace(/^(der|die|das)\s+/i, '').trim();
  const cleanDe = getCleanKey(bare || word.german);
  if (GERMAN_VOCAB_MAP[cleanDe] && GERMAN_VOCAB_MAP[cleanDe][lang]) {
    return GERMAN_VOCAB_MAP[cleanDe][lang];
  }

  // 3. Exact match with article if present (e.g. "der Tisch")
  if (word.article && word.article !== 'none') {
    const withArt = `${word.article} ${cleanDe}`;
    if (GERMAN_VOCAB_MAP[withArt] && GERMAN_VOCAB_MAP[withArt][lang]) {
      return GERMAN_VOCAB_MAP[withArt][lang];
    }
  }

  // 4. Match without plural note (e.g. "Gott, ¨ -er" -> "Gott")
  const firstPart = cleanDe.split(',')[0].trim();
  if (GERMAN_VOCAB_MAP[firstPart] && GERMAN_VOCAB_MAP[firstPart][lang]) {
    return GERMAN_VOCAB_MAP[firstPart][lang];
  }

  // 5. Try matching verb without person conjugation (e.g. "tanzen (du tanzt)" -> "tanzen")
  const baseVerb = cleanDe.split('(')[0].trim();
  if (GERMAN_VOCAB_MAP[baseVerb] && GERMAN_VOCAB_MAP[baseVerb][lang]) {
    return GERMAN_VOCAB_MAP[baseVerb][lang];
  }

  // 6. Fallback: Return Uzbek translation
  return word.uzbek;
}
