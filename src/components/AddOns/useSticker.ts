import BFF from "@/assets/stickers/bff.svg?react";
import HeartBadge from "@/assets/stickers/heart-badge.svg?react";
import LoveYourself from "@/assets/stickers/love-yourself.svg?react";
import Love from "@/assets/stickers/love.svg?react";
import ShootingStar from "@/assets/stickers/shooting-star.svg?react";
import SunflowerBadge from "@/assets/stickers/sunflower-badge.svg?react";
import LoveTill70s from "@/assets/stickers/love-till-70's.svg?react";
import ShineLikeADiamond from "@/assets/stickers/shine-like-a-diamond.svg?react";
import GoodVibes2 from "@/assets/stickers/good-vibes-2.svg?react";
import Donut from "@/assets/stickers/donut.svg?react";
import PineApple from "@/assets/stickers/pineapple.svg?react";
import OJ from "@/assets/stickers/oj.svg?react";
import Bikini from "@/assets/stickers/bikini.svg?react";
import Lollipop from "@/assets/stickers/lollipop.svg?react";
import ShootingStarBadge from "@/assets/stickers/shooting-star-badge.svg?react";
import FunGlasses from "@/assets/stickers/fun-glasses.svg?react";
import SunHat from "@/assets/stickers/sun-hat.svg?react";
import Leaf from "@/assets/stickers/leaf.svg?react";
import MeltedSmiley from "@/assets/stickers/melted-smiley.svg?react";
import Flames from "@/assets/stickers/flames.svg?react";
import FunWindow from "@/assets/stickers/fun-window.svg?react";
import Palmtree from "@/assets/stickers/palmtree.svg?react";

export const stickerMap: {
    [key in StickerType]: typeof ShootingStar;
} = {
    bff: BFF,
    "heart-badge": HeartBadge,
    "love-yourself": LoveYourself,
    love: Love,
    "sunflower-badge": SunflowerBadge,
    "love-till-70's": LoveTill70s,
    'shine-like-a-diamond': ShineLikeADiamond,
    'good-vibes-2': GoodVibes2,
    'donut': Donut,
    'pineapple': PineApple,
    'oj': OJ,
    'bikini': Bikini,
    'lollipop': Lollipop,
    'shooting-star-badge': ShootingStarBadge,
    'fun-glasses': FunGlasses,
    'sun-hat': SunHat,
    'leaf': Leaf,
    'melted-smiley': MeltedSmiley,
    'flames': Flames,
    'fun-window': FunWindow,
    'palmtree': Palmtree,
  };

export default function useSticker(sticker: StickerType) {
    const SvgIcon = stickerMap[sticker];
    return { SvgIcon };
}

export const stickerTypes = [
    "bff",
    "heart-badge",
    "love-yourself",
    "love",
    "sunflower-badge",
    "love-till-70's",
    'shine-like-a-diamond',
    'good-vibes-2',
    'donut',
    'pineapple',
    'oj',
    'bikini',
    'lollipop',
    'shooting-star-badge',
    'fun-glasses',
    'sun-hat',
    'leaf',
    'melted-smiley',
    'flames',
    'fun-window',
    'palmtree',
] as const;
export type StickerType = typeof stickerTypes[number];
