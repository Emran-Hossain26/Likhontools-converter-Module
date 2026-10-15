import type { LocalizedText } from "./validate";

export type BuiltinTool = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  to: string;
  category: "text" | "image" | "calculator" | "converter" | "document";
  icon: string;
  tone: string;
};

export const builtinTools: BuiltinTool[] = [
  {
    id: "bangla-typing",
    title: { bn: "বাংলা টেক্সট এডিটর", en: "Bangla Text Editor" },
    description: {
      bn: "বাংলায় লিখুন, সঙ্গে শব্দ ও অক্ষর গুনুন।",
      en: "Write in Bangla with live word and character count.",
    },
    to: "/bangla-typing",
    category: "text",
    icon: "Keyboard",
    tone: "lime",
  },
  {
    id: "bijoy-to-unicode",
    title: { bn: "বিজয় থেকে ইউনিকোড", en: "Bijoy to Unicode" },
    description: {
      bn: "বিজয় লেখা সহজেই ইউনিকোডে রূপান্তর করুন।",
      en: "Convert Bijoy text to Unicode instantly.",
    },
    to: "/converter",
    category: "converter",
    icon: "RefreshCw",
    tone: "mint",
  },
  {
    id: "file-converter",
    title: { bn: "ফাইল কনভার্টার", en: "File Converter" },
    description: {
      bn: "ফাইল কনভার্ট করুন - PDF, Word, Excel, ইমেজ এবং আরও অনেক।",
      en: "Convert files - PDF, Word, Excel, images and more.",
    },
    to: "/tool/file-converter",
    category: "converter",
    icon: "Files",
    tone: "sky",
  },
  {
    id: "image-resizer",
    title: { bn: "ইমেজ রিসাইজার", en: "Image Resizer" },
    description: {
      bn: "আপনার প্রয়োজনমতো ছবির মাপ বদলে নিন।",
      en: "Resize your images to any required dimension.",
    },
    to: "/image-resizer",
    category: "image",
    icon: "Image",
    tone: "lavender",
  },
  {
    id: "image-compressor",
    title: { bn: "ইমেজ কম্প্রেসর", en: "Image Compressor" },
    description: {
      bn: "ছবির কোয়ালিটি ঠিক রেখে ফাইলের সাইজ কমান।",
      en: "Reduce image size without sacrificing quality.",
    },
    to: "/image-resizer",
    category: "image",
    icon: "ImageDown",
    tone: "pink",
  },
  {
    id: "passport-photo",
    title: { bn: "পাসপোর্ট সাইজ ছবি", en: "Passport Size Photo" },
    description: {
      bn: "পাসপোর্ট ছবি ও প্রিন্টের শিট তৈরি করুন।",
      en: "Create passport photos and print-ready templates.",
    },
    to: "/passport-photo",
    category: "image",
    icon: "Contact",
    tone: "sky",
  },
  {
    id: "age-calculator",
    title: { bn: "বয়স ক্যালকুলেটর", en: "Age Calculator" },
    description: {
      bn: "বছর, মাস ও দিনে আপনার সঠিক বয়স জানুন।",
      en: "Calculate exact age by year, month and day.",
    },
    to: "/age-calculator",
    category: "calculator",
    icon: "CalendarDays",
    tone: "peach",
  },
  {
    id: "cgpa-calculator",
    title: { bn: "CGPA ক্যালকুলেটর", en: "CGPA Calculator" },
    description: {
      bn: "ক্রেডিট ও গ্রেড থেকে আপনার CGPA হিসাব করুন।",
      en: "Calculate CGPA from credits and grades.",
    },
    to: "/cgpa-calculator",
    category: "calculator",
    icon: "GraduationCap",
    tone: "aqua",
  },
];

export const DOCUMENT_TONES = ["mint", "sky", "lavender", "aqua", "peach", "yellow"] as const;
