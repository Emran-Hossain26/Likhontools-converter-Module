// Simplified Avro-style phonetic transliteration (English letters -> Bangla)
const vowels: Record<string, [string, string]> = {
  rri: ["ঋ", "ৃ"], OI: ["ঐ", "ৈ"], OU: ["ঔ", "ৌ"], oi: ["ঐ", "ৈ"], ou: ["ঔ", "ৌ"],
  ee: ["ঈ", "ী"], oo: ["উ", "ু"], a: ["আ", "া"], i: ["ই", "ি"], I: ["ঈ", "ী"],
  u: ["উ", "ু"], U: ["ঊ", "ূ"], e: ["এ", "ে"], O: ["ও", "ো"], o: ["অ", ""],
};
const consonants: Record<string, string> = {
  kkh: "ক্ষ", kSh: "ক্ষ", jNG: "জ্ঞ", gg: "জ্ঞ", nth: "ন্থ", ndh: "ন্ধ", sth: "স্থ",
  nd: "ন্দ", nt: "ন্ত", st: "স্ত", sk: "স্ক", sp: "স্প", mp: "ম্প", mb: "ম্ব", kt: "ক্ত", ngk: "ঙ্ক", ngg: "ঙ্গ",
  kh: "খ", gh: "ঘ", Ng: "ঙ", ch: "ছ", jh: "ঝ", NG: "ঞ", Th: "ঠ", Dh: "ঢ", th: "থ", dh: "ধ",
  ph: "ফ", bh: "ভ", sh: "শ", Sh: "ষ", Rh: "ঢ়",
  k: "ক", g: "গ", c: "চ", j: "জ", T: "ট", D: "ড", N: "ণ", t: "ত", d: "দ", n: "ন", p: "প",
  f: "ফ", b: "ব", v: "ভ", m: "ম", z: "য", r: "র", l: "ল", S: "ষ", s: "স", h: "হ", R: "ড়",
  y: "য়", Y: "য়", q: "ক", x: "ক্স", w: "ও",
};
const others: Record<string, string> = {
  "t``": "ৎ", ng: "ং", ",,": "্", "^": "ঁ", ":": "ঃ", ".": "।", $: "৳",
  "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
};

export function transliterate(input: string): string {
  let out = "";
  let prevCons = false;
  let i = 0;
  while (i < input.length) {
    let matched = false;
    for (let len = 4; len >= 1 && !matched; len--) {
      for (const cand of [input.substr(i, len), len === 1 ? input[i]!.toLowerCase() : null]) {
        if (!cand || cand.length !== len) continue;
        if (cand in others && !(cand === "ng" && input.substr(i, 3) === "ngg") && !(cand === "ng" && input.substr(i, 3) === "ngk")) {
          out += others[cand]; prevCons = false;
        } else if (cand in consonants) {
          out += consonants[cand]; prevCons = true;
        } else if (cand in vowels) {
          out += vowels[cand]![prevCons ? 1 : 0]; prevCons = false;
        } else continue;
        i += len; matched = true; break;
      }
    }
    if (!matched) { out += input[i]; prevCons = false; i++; }
  }
  return out;
}

const bnDigits = "০১২৩৪৫৬৭৮৯";
export const toBnDigits = (s: string) => s.replace(/[0-9]/g, (d) => bnDigits[+d]!);
export const toEnDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d)));
