export type AvatarOption = {
  key: string;
  emoji: string;
  label: string;
};

export const AVATAR_OPTIONS: AvatarOption[] = [
  { key: "lion", emoji: "🦁", label: "Lion" },
  { key: "fox", emoji: "🦊", label: "Fox" },
  { key: "panda", emoji: "🐼", label: "Panda" },
  { key: "tiger", emoji: "🐯", label: "Tiger" },
  { key: "koala", emoji: "🐨", label: "Koala" },
  { key: "penguin", emoji: "🐧", label: "Penguin" },
  { key: "unicorn", emoji: "🦄", label: "Unicorn" },
  { key: "dragon", emoji: "🐲", label: "Dragon" },
  { key: "rocket", emoji: "🚀", label: "Rocket" },
  { key: "star", emoji: "⭐", label: "Star" },
  { key: "soccer", emoji: "⚽", label: "Soccer" },
  { key: "music", emoji: "🎵", label: "Music" },
];

export const DEFAULT_AVATAR_KEY = AVATAR_OPTIONS[0].key;

export function getAvatarByKey(key?: string | null): AvatarOption {
  return AVATAR_OPTIONS.find((item) => item.key === key) ?? AVATAR_OPTIONS[0];
}
