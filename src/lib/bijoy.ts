// Bijoy (SutonnyMJ ASCII) <-> Unicode converter
const map: [string, string][] = [
  ["¯Í", "স্ত"], ["š—", "ন্ত"], ["Av", "আ"], ["ÿ", "ক্ষ"], ["³", "ক্ত"], ["µ", "ক্র"], ["•", "ঙ্ক"],
  ["›", "ন্দ"], ["ê", "ত্ত"], ["¯", "স্"], ["š", "ন্"], ["Í", "্ত"], ["—", "্ত"],
  ["A", "অ"], ["B", "ই"], ["C", "ঈ"], ["D", "উ"], ["E", "ঊ"], ["F", "ঋ"], ["G", "এ"], ["H", "ঐ"], ["I", "ও"], ["J", "ঔ"],
  ["K", "ক"], ["L", "খ"], ["M", "গ"], ["N", "ঘ"], ["O", "ঙ"], ["P", "চ"], ["Q", "ছ"], ["R", "জ"], ["S", "ঝ"], ["T", "ঞ"],
  ["U", "ট"], ["V", "ঠ"], ["W", "ড"], ["X", "ঢ"], ["Y", "ণ"], ["Z", "ত"], ["_", "থ"], ["`", "দ"], ["a", "ধ"], ["b", "ন"],
  ["c", "প"], ["d", "ফ"], ["e", "ব"], ["f", "ভ"], ["g", "ম"], ["h", "য"], ["i", "র"], ["j", "ল"], ["k", "শ"], ["l", "ষ"],
  ["m", "স"], ["n", "হ"], ["o", "ড়"], ["p", "ঢ়"], ["q", "য়"], ["r", "ৎ"], ["s", "ং"], ["t", "ঃ"], ["u", "ঁ"],
  ["v", "া"], ["w", "ি"], ["x", "ী"], ["y", "ু"], ["z", "ু"], ["~", "ূ"], ["„", "ৃ"], ["‡", "ে"], ["†", "ে"], ["‰", "ৈ"], ["ˆ", "ৈ"],
  ["Š", "ৗ"], ["¨", "্য"], ["ª", "্র"], ["¡", "্ব"], ["¬", "্ল"], ["©", "র্"], ["&", "্"], ["|", "।"],
  ["Ô", "‘"], ["Õ", "’"], ["Ò", "“"], ["Ó", "”"],
  ["0", "০"], ["1", "১"], ["2", "২"], ["3", "৩"], ["4", "৪"], ["5", "৫"], ["6", "৬"], ["7", "৭"], ["8", "৮"], ["9", "৯"],
];

const C = "[\\u0995-\\u09B9\\u09DC\\u09DD\\u09DF]";
const CLUSTER = `(?:${C}(?:\\u09CD${C})*)`;
const KAR = "[\\u09BE-\\u09C4\\u09C7\\u09C8\\u09CB\\u09CC]";

function replaceGreedy(text: string, pairs: [string, string][]) {
  const sorted = [...pairs].sort((a, b) => b[0].length - a[0].length);
  let out = "";
  let i = 0;
  while (i < text.length) {
    const hit = sorted.find(([k]) => text.startsWith(k, i));
    if (hit) { out += hit[1]; i += hit[0].length; } else { out += text[i]; i++; }
  }
  return out;
}

export function bijoyToUnicode(text: string): string {
  let s = replaceGreedy(text, map);
  // pre-base kars move after their consonant cluster
  s = s.replace(new RegExp(`([িেৈ])(${CLUSTER})`, "g"), "$2$1");
  s = s.replace(/ো/g, "ো").replace(/ে া/g, "ো").replace(/ো/g, "ো").replace(/ৌ/g, "ৌ");
  // reph typed after the cluster moves before it
  s = s.replace(new RegExp(`(${CLUSTER}${KAR}?)র্`, "g"), "র্$1");
  return s;
}

export function unicodeToBijoy(text: string): string {
  let s = text.normalize("NFC");
  s = s.replace(new RegExp(`র্(${CLUSTER}${KAR}?)`, "g"), "$1©");
  s = s.replace(new RegExp(`(${CLUSTER})ো`, "g"), "ে$1া").replace(new RegExp(`(${CLUSTER})ৌ`, "g"), "ে$1ৗ");
  s = s.replace(new RegExp(`(${CLUSTER})([িেৈ])`, "g"), "$2$1");
  const rev = map
    .filter(([k]) => !["z", "†", "ˆ", "—"].includes(k))
    .map(([a, b]) => [b, a] as [string, string]);
  return replaceGreedy(s.replace("©", "©"), rev).replace(/র্/g, "©");
}
