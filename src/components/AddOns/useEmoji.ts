export default function useEmoji(emoji: EmojiType) {
    const imageUrl = new URL(`../../assets/emojis/${emoji}.png`, import.meta.url).href;

    return { imageUrl }
};
export const emojiNames = [
    "aubergine",
    "balloon",
    "beach",
    "black-heart",
    "blue-heart",
    "brown-heart",
    "butterfly",
    "cake-slice",
    "celebrate",
    "cheers",
    "chocolate",
    "cover-mouth",
    "deep-purple-heart",
    "diamond-ring",
    "diamond",
    "dollar-cash",
    "fere",
    "fist-bump",
    "flower",
    "glass-blue-heart",
    "grey-heart",
    "heart-letter",
    "light-blue-heart",
    "lip-bite",
    "love-cat",
    "love-eyes",
    "love-hand",
    "lovers",
    "monkey-shy",
    "moon",
    "palmtree",
    "pepper",
    "pink-heart-shimmer",
    "plum",
    "purple-heart",
    "radiating-heart",
    "red-flower",
    "red-heart",
    "rock",
    "rocket",
    "rose",
    "shimmer",
    "shine",
    "sunflower",
    "thunderbolt",
    "trophy",
    "two-heart",
    "water-drops",
    "white-heart",
    "withered-rose",
    "yellow-heart",
    "yellow-ish-heart"
  ] as const;
export type EmojiType = typeof emojiNames[number];