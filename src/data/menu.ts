import {
  breakfast,
  brownPlate,
  mixedGrill,
  samosas,
  cakeSlice,
  cakes,
  milkshake,
  drinks,
} from "@/assets/images";

export type MenuCategory = "Starters" | "Main Courses" | "Desserts" | "Drinks";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: MenuCategory;
  tag?: string;
}

export const menu: MenuItem[] = [
  {
    id: "s1",
    name: "Crispy Chicken Bites",
    description:
      "Golden-fried chicken morsels tossed in our signature chili glaze, served with cool herb dip.",
    price: 6,
    image: mixedGrill.url,
    category: "Starters",
    tag: "Signature",
  },
  {
    id: "s2",
    name: "Garden Crisp Salad",
    description: "Mixed leaves, heirloom tomato, cucumber and feta with citrus-honey vinaigrette.",
    price: 5,
    image: brownPlate.url,
    category: "Starters",
  },
  {
    id: "s3",
    name: "Spring Rolls",
    description: "Hand-rolled vegetable spring rolls, sweet chili dipping sauce.",
    price: 4.5,
    image: samosas.url,
    category: "Starters",
  },

  {
    id: "m1",
    name: "Epic Mixed Grill",
    description: "Char-grilled steak, pork chop, chicken thigh & wings on a bed of golden fries.",
    price: 18,
    image: mixedGrill.url,
    category: "Main Courses",
    tag: "Chef's Pick",
  },
  {
    id: "m2",
    name: "Epic Big Breakfast",
    description: "Sirloin steak, eggs your way, baked beans, mushrooms, tomato and toast.",
    price: 12,
    image: breakfast.url,
    category: "Main Courses",
  },
  {
    id: "m3",
    name: "Brown Plate Special",
    description: "Crispy chicken, hash browns, beans and double eggs — paired with cappuccino.",
    price: 11,
    image: brownPlate.url,
    category: "Main Courses",
  },
  {
    id: "m4",
    name: "Sadza & Beef Stew",
    description: "Tender slow-braised beef with traditional sadza, greens and gravy.",
    price: 9,
    image: mixedGrill.url,
    category: "Main Courses",
    tag: "Local Favourite",
  },

  {
    id: "d1",
    name: "Decadent Brownie",
    description: "Warm dark chocolate brownie with vanilla bean ice cream.",
    price: 5,
    image: cakeSlice.url,
    category: "Desserts",
  },
  {
    id: "d2",
    name: "Classic Cheesecake",
    description: "Velvety New York-style cheesecake with seasonal berry coulis.",
    price: 5.5,
    image: cakes.url,
    category: "Desserts",
  },

  {
    id: "dr1",
    name: "Signature Cappuccino",
    description: "Double-shot espresso, silky steamed milk, hand-poured rosetta.",
    price: 3,
    image: brownPlate.url,
    category: "Drinks",
  },
  {
    id: "dr2",
    name: "Berry Milkshake",
    description: "Strawberry, raspberry and vanilla blended into a thick, dreamy shake.",
    price: 3.5,
    image: milkshake.url,
    category: "Drinks",
  },
  {
    id: "dr3",
    name: "Sunset Mocktail",
    description: "Citrus, grenadine and tropical juices over crushed ice.",
    price: 4,
    image: drinks.url,
    category: "Drinks",
  },
];

export const categories: MenuCategory[] = ["Starters", "Main Courses", "Desserts", "Drinks"];
