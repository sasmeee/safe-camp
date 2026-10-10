export type Risk = "caution" | "danger" | "critical";

export type Hazard = {
  id: string;
  name: string;
  category: "plant" | "insect" | "terrain" | "fungi";
  risk: Risk;
  prompts: string[];
  summary: string;
  actions: string[];
};

export const HAZARDS: Hazard[] = [
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
    id: "wasp-nest",
    name: "Wasp or hornet nest",
    category: "insect",
    risk: "danger",
    prompts: [
      "a photo of a wasp nest hanging from a branch",
      "a photo of a hornet nest on a tree or building",
    ],
    summary: "Nests defend aggressively. Multiple stings can be serious.",
    actions: [
      "Do not approach or disturb it.",
      "Move your tent pitch at least 30 m (100 ft) away.",
      "Seek emergency help for trouble breathing or swelling after a sting.",
    ],
  },
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
    id: "wild-mushroom",
    name: "Wild mushrooms",
    category: "fungi",
    risk: "danger",
    prompts: [
      "a photo of wild mushrooms growing on the forest floor",
      "a photo of a mushroom cap and stem in the grass",
    ],
    summary: "Photos cannot tell safe mushrooms from deadly lookalikes.",
    actions: [
      "Do not eat, taste or cook wild mushrooms.",
      "Wash hands after touching. Keep children and pets away.",
      "If someone ate one, call poison control or emergency services.",
    ],
  },
];

export const HARMLESS_PROMPTS = [
  "a photo of green grass",
  "a photo of a tent on flat ground",
  "a photo of ordinary tree leaves",
  "a photo of bare soil and small stones",
  "a photo of a clear flat camping area",
];
