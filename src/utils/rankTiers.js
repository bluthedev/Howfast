export const RANK_TIERS = [
  {
    minWpm: 85,
    title: "Alien Thumbs",
    emoji: "👽",
    color: "from-cyan-400 to-fuchsia-500",
    textColor: "text-cyan-400",
    bgBorder: "border-cyan-400/50 shadow-cyan-500/20",
    description: "Are you a cyborg? Your fingers broke the sound barrier!",
  },
  {
    minWpm: 70,
    title: "Speed Demon",
    emoji: "⚡",
    color: "from-amber-400 to-orange-500",
    textColor: "text-amber-400",
    bgBorder: "border-amber-400/50 shadow-amber-500/20",
    description: "Unstoppable mobile dexterity! Your group chats can't keep up.",
  },
  {
    minWpm: 55,
    title: "Cheetah",
    emoji: "🐆",
    color: "from-orange-400 to-yellow-500",
    textColor: "text-orange-400",
    bgBorder: "border-orange-400/50 shadow-orange-500/20",
    description: "Lightning-fast responses. Top 10% mobile typing speed!",
  },
  {
    minWpm: 40,
    title: "Rabbit",
    emoji: "🐇",
    color: "from-emerald-400 to-teal-500",
    textColor: "text-emerald-400",
    bgBorder: "border-emerald-400/50 shadow-emerald-500/20",
    description: "Solid, dependable speed. You reply before they finish typing.",
  },
  {
    minWpm: 25,
    title: "Turtle",
    emoji: "🐢",
    color: "from-blue-400 to-indigo-500",
    textColor: "text-blue-400",
    bgBorder: "border-blue-400/50 shadow-blue-500/20",
    description: "Casual texter pace. Accurate, steady, but room to accelerate!",
  },
  {
    minWpm: 0,
    title: "Sloth",
    emoji: "🦥",
    color: "from-slate-400 to-zinc-500",
    textColor: "text-slate-400",
    bgBorder: "border-slate-500/50 shadow-slate-500/20",
    description: "Warming up those thumbs! Rome wasn't typed in a day.",
  },
];

export function getRankTier(wpm) {
  const speed = Number(wpm) || 0;
  for (const tier of RANK_TIERS) {
    if (speed >= tier.minWpm) {
      return tier;
    }
  }
  return RANK_TIERS[RANK_TIERS.length - 1];
}
