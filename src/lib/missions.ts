import type { Mission } from "./types";

/**
 * The hand-authored mission library. Quality over volume (grill note A5): a
 * dozen well-crafted, varied invitations beat sixty filler cards. Tone per the
 * PRD — warm, second-person, an invitation ("See if you can find…"), no orders.
 *
 * This is plain data, served from the bundle so it works fully offline (FR-3).
 */
export const MISSIONS: readonly Mission[] = [
  {
    id: "first-light-edges",
    title: "Where the first light lands",
    invitation:
      "Early light is low and long. See if you can find one edge it has just touched — a railing, a face, the lip of a cup — and let the rest fall into shadow.",
    timesOfDay: ["morning"],
    locationTypes: ["street", "home", "travel"],
    difficulty: "gentle",
    involvesPeople: false,
  },
  {
    id: "the-colour-of-the-day",
    title: "The colour of the day",
    invitation:
      "Pick one colour the moment you step outside. For the next while, you only notice that colour. Come back with three frames where it leads the eye.",
    timesOfDay: ["morning", "afternoon"],
    locationTypes: ["street", "nature", "travel"],
    difficulty: "gentle",
    involvesPeople: false,
  },
  {
    id: "hands-at-work",
    title: "Hands at work",
    invitation:
      "Hands tell a story faster than faces. Ask someone doing something with their hands if you can photograph just the work — the kneading, the wiring, the wrapping. Keep your eyes kind.",
    timesOfDay: ["morning", "afternoon"],
    locationTypes: ["street", "travel"],
    difficulty: "bold",
    involvesPeople: true,
  },
  {
    id: "negative-space-walk",
    title: "Mostly nothing",
    invitation:
      "Try a frame that is nine-tenths empty and one-tenth subject. Let the quiet do the work. Where does the eye rest when you give it room?",
    timesOfDay: ["afternoon", "evening"],
    locationTypes: ["street", "nature", "home", "travel"],
    difficulty: "stretch",
    involvesPeople: false,
  },
  {
    id: "one-stranger-one-yes",
    title: "One stranger, one yes",
    invitation:
      "Just one. Find a person whose presence catches you, meet their eye, smile, and ask for a single portrait. If they say no, thank them warmly and walk on — the asking is the practice.",
    timesOfDay: ["afternoon", "evening"],
    locationTypes: ["street", "travel"],
    difficulty: "bold",
    involvesPeople: true,
  },
  {
    id: "the-reflection-test",
    title: "Twice in one frame",
    invitation:
      "Puddles, windows, kettles, spoons. Find something that shows the world twice and decide which version you believe.",
    timesOfDay: ["morning", "afternoon", "evening"],
    locationTypes: ["street", "home", "travel"],
    difficulty: "stretch",
    involvesPeople: false,
  },
  {
    id: "small-life-at-home",
    title: "The room you stopped seeing",
    invitation:
      "You walk past it every day. Photograph one corner of home as if you'd just arrived and never seen it before. What does a guest notice that you forgot?",
    timesOfDay: ["morning", "afternoon", "evening", "night"],
    locationTypes: ["home"],
    difficulty: "gentle",
    involvesPeople: false,
  },
  {
    id: "follow-the-line",
    title: "Follow the line",
    invitation:
      "Find a line — a wire, a kerb, a shadow, a crack — and follow it with your feet until it leads you somewhere worth a frame.",
    timesOfDay: ["afternoon"],
    locationTypes: ["street", "nature", "travel"],
    difficulty: "gentle",
    involvesPeople: false,
  },
  {
    id: "blue-hour-warmth",
    title: "A warm window in the cool",
    invitation:
      "As the sky goes blue, lit windows turn gold. Find that warmth inside the cool and frame the contrast. Stay on the street; let the glow stay private.",
    timesOfDay: ["evening"],
    locationTypes: ["street", "travel"],
    difficulty: "stretch",
    involvesPeople: false,
  },
  {
    id: "texture-up-close",
    title: "Close enough to feel it",
    invitation:
      "Get close to one surface — bark, rust, fabric, skin of fruit — until the texture is the whole picture. Let the eye almost touch it.",
    timesOfDay: ["morning", "afternoon"],
    locationTypes: ["nature", "home", "street"],
    difficulty: "gentle",
    involvesPeople: false,
  },
  {
    id: "the-quiet-portrait",
    title: "Someone you know, truly",
    invitation:
      "No performance. Sit with someone you're comfortable with and wait for the moment between expressions — the in-breath, the look away. One honest frame.",
    timesOfDay: ["afternoon", "evening", "night"],
    locationTypes: ["home", "travel"],
    difficulty: "stretch",
    involvesPeople: true,
  },
  {
    id: "night-and-a-single-light",
    title: "One light against the dark",
    invitation:
      "After dark, find a single source — a lamp, a sign, a phone-lit face — and let it carve the scene. Everything it doesn't reach is yours to lose.",
    timesOfDay: ["night"],
    locationTypes: ["street", "home", "travel"],
    difficulty: "bold",
    involvesPeople: false,
  },
];
