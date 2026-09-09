export const NERDCONF_CLAIM =
  "Are the nerds at NERDCONF the most handsome developers in the world?";

export const NERDCONF_DISCLAIMER =
  "[Disclaimer: Subjective local override detected. No web verification required for undeniable universal truths.]";

export type SeedCard = {
  id: string;
  claim: string;
  tag: string;
  mode: "easter_egg" | "research";
};

export const SEED_CARDS: SeedCard[] = [
  {
    id: "avocado-pits",
    claim: "Do avocado pits absorb microwave radiation?",
    tag: "Internet myth",
    mode: "research",
  },
  {
    id: "friday-holiday",
    claim: "New national holiday announced for this Friday.",
    tag: "Viral news",
    mode: "research",
  },
  {
    id: "nerdconf",
    claim: NERDCONF_CLAIM,
    tag: "Featured",
    mode: "easter_egg",
  },
  {
    id: "ambiguous-wifi",
    claim: "A new particle makes Wi-Fi faster if you whisper to the router.",
    tag: "Unverified",
    mode: "research",
  },
];
