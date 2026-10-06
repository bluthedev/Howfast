// High-frequency English words optimized for mobile keyboards (smooth thumb travel)
export const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "great", "here", "tell", "need", "move", "call", "try", "hand", "high", "keep",
  "hold", "turn", "live", "mean", "help", "show", "play", "run", "small", "night",
  "fast", "cool", "phone", "text", "type", "quick", "speed", "thumb", "chat", "fire",
  "real", "best", "light", "super", "clean", "tap", "touch", "ready", "smart", "game"
];

// Modern mobile texting abbreviations and chat slang
export const SLANG_WORDS = [
  "ngl", "tbh", "idk", "fr", "fr fr", "omw", "lmao", "lol", "rn", "brb",
  "imo", "gg", "w", "huge w", "no cap", "cap", "bet", "lowkey", "highkey",
  "vibes", "valid", "bussin", "rizz", "slay", "say less", "real", "deadass",
  "sus", "facts", "periodt", "hype", "fire", "sheesh", "nah", "yup", "aight",
  "gimme a sec", "let him cook", "i cant even", "wsg", "hmu", "tysm", "np",
  "yea", "omg", "wth", "gtg", "touch grass", "flex", "simp", "glow up", "big mood"
];

// Curated intriguing short stories and micro-fiction
export const SHORT_STORIES = [
  "The astronaut stared out of the capsule window, suddenly realizing that they had left the coffee maker back on Earth. Three years to Mars without an espresso was going to test their limits.",
  "He hit send on the text message, immediately tossed his phone face down on the bed, and stared blankly at the ceiling waiting for the three little typing bubbles to appear.",
  "Deep in the ancient library, she found a leather book where the last page was always writing what the reader was doing right that exact second. She stopped turning the page.",
  "A time traveler stepped out of the machine in eighteen ninety and tried to order a stuffed crust pizza. The baker looked at him with profound concern and handed him a turnip.",
  "Rain drummed softly against the coffee shop window. Across the table, an old friend smiled and slid a postcard from a city neither of them had ever visited.",
  "The runaway shopping cart rolled silently down the parking lot hill, picking up tremendous speed as if it had finally made up its mind to see the ocean.",
  "Midnight on the highway with the windows cracked open, music floating through the warm summer breeze, and fifty miles of open road ahead of them.",
  "She opened the dusty guitar case that had sat in the closet for a decade. The wood still smelled like summer rehearsals and forgotten promises.",
  "Every light in the neighborhood went dark at once. Outside, hundreds of neighbors walked onto their lawns to look at stars they had never noticed before."
];

// Iconic and catchy musical lyrics
export const MUSICAL_LYRICS = [
  "Is this the real life? Is this just fantasy? Caught in a landslide, no escape from reality. Open your eyes, look up to the skies and see.",
  "Just a small town girl, living in a lonely world. She took the midnight train going anywhere. Just a city boy, born and raised in South Detroit.",
  "His palms are sweaty, knees weak, arms are heavy. There is vomit on his sweater already, mom's spaghetti. He is nervous, but on the surface he looks calm and ready.",
  "Cause the players gonna play, play, play, play, play. And the haters gonna hate, hate, hate, hate, hate. Baby, I'm just gonna shake, shake, shake, shake, shake.",
  "I've been on my own for long enough. Maybe you can show me how to love, maybe. I'm going through withdrawals, you don't even have to do too much.",
  "I hear Jerusalem bells a-ringin', Roman cavalry choirs are singin'. Be my mirror, my sword and shield, my missionaries in a foreign field.",
  "Never gonna give you up, never gonna let you down. Never gonna run around and desert you. Never gonna make you cry, never gonna say goodbye.",
  "Here comes the sun, doo-doo-doo-doo. Here comes the sun, and I say, it's all right. Little darling, it's been a long, cold, lonely winter.",
  "Coming out of my cage and I've been doing just fine. Gotta gotta be down because I want it all. It started out with a kiss, how did it end up like this?"
];

// Seeded pseudo-random number generator for daily challenges
function createSeededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function getRandomWords(count = 50, mode = '30s') {
  if (mode === 'story') {
    const story = SHORT_STORIES[Math.floor(Math.random() * SHORT_STORIES.length)];
    return story.split(/\s+/).filter(Boolean);
  }

  if (mode === 'lyrics') {
    const lyric = MUSICAL_LYRICS[Math.floor(Math.random() * MUSICAL_LYRICS.length)];
    return lyric.split(/\s+/).filter(Boolean);
  }

  const bank = mode === 'slang' ? SLANG_WORDS : COMMON_WORDS;
  const words = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * bank.length);
    words.push(bank[randomIndex]);
  }
  return words;
}

export function getDailyChallengeWords(dateStr) {
  const dateKey = dateStr || new Date().toISOString().slice(0, 10);
  let seed = 0;
  for (let i = 0; i < dateKey.length; i++) {
    seed += dateKey.charCodeAt(i) * Math.pow(10, i % 4);
  }
  const random = createSeededRandom(seed);
  const words = [];
  for (let i = 0; i < 45; i++) {
    const idx = Math.floor(random() * COMMON_WORDS.length);
    words.push(COMMON_WORDS[idx]);
  }
  return words;
}
