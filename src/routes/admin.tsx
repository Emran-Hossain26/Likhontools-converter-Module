import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Facebook,
  Globe,
  ImageIcon,
  Keyboard,
  LayoutDashboard,
  Linkedin,
  LogOut,
  Mail,
  PencilRuler,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wand2,
  Youtube,
} from "lucide-react";
import { PageTitle } from "@/components/SiteHeader";
import { useLanguage } from "@/lib/i18n";
import { supabase, type ContactMessage, type SiteSocialLink } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "কন্ট্রোল প্যানেল | লিখনটুলস" },
      { name: "description", content: "সাইট সেটিংস, টুল স্ট্যাটাস ও কনটেন্ট পরিচালনা করুন।" },
    ],
  }),
  component: AdminPanel,
});

type ToolKey =
  | "banglaTyping"
  | "converter"
  | "imageResizer"
  | "passportPhoto"
  | "ageCalculator"
  | "cgpaCalculator";

type SiteSettings = {
  maintenance: boolean;
  darkModeDefault: boolean;
  autoSave: boolean;
  imageCompression: boolean;
  analytics: boolean;
  betaTools: boolean;
};

type SeoSettings = {
  title: string;
  tagline: string;
  cta: string;
  description: string;
};

type ContactSettings = {
  email: string;
  phone: string;
  address: string;
  adEmail: string;
  supportMessage: string;
};

type AdminConfig = {
  settings: SiteSettings;
  tools: Record<ToolKey, boolean>;
  seo: SeoSettings;
  contact: ContactSettings;
  socials: SiteSocialLink[];
};

const ADMIN_STORAGE_KEY = "likhon-tools-admin-config";
const DEFAULT_TOOLS: Record<ToolKey, boolean> = {
  banglaTyping: true,
  converter: true,
  imageResizer: true,
  passportPhoto: true,
  ageCalculator: true,
  cgpaCalculator: true,
};

const DEFAULT_SETTINGS: SiteSettings = {
  maintenance: false,
  darkModeDefault: true,
  autoSave: true,
  imageCompression: true,
  analytics: true,
  betaTools: false,
};

const DEFAULT_SEO: SeoSettings = {
  title: "লিখনটুলস",
  tagline: "বাংলা লেখা, ছবি ও হিসাবের সব টুল এক জায়গায়",
  cta: "সব টুল দেখুন",
  description: "বাংলা টাইপিং, বিজয়-ইউনিকোড রূপান্তর, ছবি রিসাইজ ও ক্যালকুলেটর — ফ্রি ও সহজ।",
};

const DEFAULT_CONTACT: ContactSettings = {
  email: "it.agamirsomoy2@gmail.com",
  phone: "+8801924437817",
  address: "ঢাকা, বাংলাদেশ",
  adEmail: "ads@likhontools.com",
  supportMessage: "প্রয়োজনে মেইল করুন অথবা ফোন করুন।",
};

const DEFAULT_SOCIAL_LINKS: SiteSocialLink[] = [
  {
    id: "facebook",
    label: "Facebook",
    url: "https://facebook.com/",
    icon_key: "facebook",
    is_active: true,
    order_index: 0,
  },
  {
    id: "youtube",
    label: "YouTube",
    url: "https://youtube.com/",
    icon_key: "youtube",
    is_active: true,
    order_index: 1,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    url: "https://linkedin.com/",
    icon_key: "linkedin",
    is_active: true,
    order_index: 2,
  },
  {
    id: "email",
    label: "Email",
    url: "mailto:it.agamirsomoy2@gmail.com",
    icon_key: "email",
    is_active: true,
    order_index: 3,
  },
  {
    id: "website",
    label: "Blog / Website",
    url: "https://likhontools.com",
    icon_key: "website",
    is_active: true,
    order_index: 4,
  },
];

const DEFAULT_CONFIG: AdminConfig = {
  settings: DEFAULT_SETTINGS,
  tools: DEFAULT_TOOLS,
  seo: DEFAULT_SEO,
  contact: DEFAULT_CONTACT,
  socials: DEFAULT_SOCIAL_LINKS,
};

const SOCIAL_ICON_MAP: Record<string, typeof Globe> = {
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  email: Mail,
  website: Globe,
};

const toolMeta: Record<ToolKey, { name: { bn: string; en: string }; icon: typeof Keyboard }> = {
  banglaTyping: { name: { bn: "বাংলা টাইপিং", en: "Bangla Typing" }, icon: Keyboard },
  converter: { name: { bn: "কনভার্টার", en: "Converter" }, icon: Wand2 },
  imageResizer: { name: { bn: "ইমেজ রিসাইজার", en: "Image Resizer" }, icon: ImageIcon },
  passportPhoto: { name: { bn: "পাসপোর্ট ছবি", en: "Passport Photo" }, icon: PencilRuler },
  ageCalculator: { name: { bn: "বয়স ক্যালকুলেটর", en: "Age Calculator" }, icon: Sparkles },
  cgpaCalculator: { name: { bn: "CGPA ক্যালকুলেটর", en: "CGPA Calculator" }, icon: BarChart3 },
};

const activity = [
  {
    title: { bn: "বাংলা টাইপিং টুল আপডেট", en: "Bangla typing tool updated" },
    time: { bn: "১০ মিনিট আগে", en: "10 minutes ago" },
    state: { bn: "সফল", en: "Success" },
  },
  {
    title: { bn: "ইমেজ কম্প্রেশান সেটিংস পরিবর্তন", en: "Image compression settings changed" },
    time: { bn: "১ ঘণ্টা আগে", en: "1 hour ago" },
    state: { bn: "সেভ হয়েছে", en: "Saved" },
  },
  {
    title: { bn: "SEO meta description আপডেট", en: "SEO meta description updated" },
    time: { bn: "আজ সকাল", en: "This morning" },
    state: { bn: "রিভিউয়ের অপেক্ষায়", en: "Awaiting review" },
  },
  {
    title: { bn: "ডার্ক মোড ডিফল্ট সক্রিয়", en: "Default dark mode enabled" },
    time: { bn: "গতকাল", en: "Yesterday" },
    state: { bn: "দেখা হয়েছে", en: "Reviewed" },
  },
] as const;

function getStoredConfig(): AdminConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;

  try {
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;

    const parsed = JSON.parse(raw) as Partial<AdminConfig>;
    return {
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      tools: { ...DEFAULT_TOOLS, ...parsed.tools },
      seo: { ...DEFAULT_SEO, ...parsed.seo },
      contact: { ...DEFAULT_CONTACT, ...parsed.contact },
      socials:
        Array.isArray(parsed.socials) && parsed.socials.length > 0
          ? parsed.socials
          : DEFAULT_SOCIAL_LINKS,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function AdminPanel() {
  const { language } = useLanguage();
  const en = language === "en";
  const tr = useCallback((bn: string, english: string) => (en ? english : bn), [en]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [tools, setTools] = useState<Record<ToolKey, boolean>>(DEFAULT_TOOLS);
  const [seo, setSeo] = useState<SeoSettings>(DEFAULT_SEO);
  const [contact, setContact] = useState<ContactSettings>(DEFAULT_CONTACT);
  const [socialLinks, setSocialLinks] = useState<SiteSocialLink[]>(DEFAULT_SOCIAL_LINKS);
  const [saveNotice, setSaveNotice] = useState(en ? "No changes yet" : "এখনও কোনো পরিবর্তন নেই");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setAuthLoading(false);
      return;
    }

    let active = true;
    void (async () => {
      const { data, error } = await client.auth.getSession();
      if (!active) return;
      if (error) {
        console.error("Could not check admin session", error);
        setLoginError(
          tr(
            "লগইন অবস্থা যাচাই করা যায়নি। আবার চেষ্টা করুন।",
            "Could not verify your sign-in. Please try again.",
          ),
        );
      }

      const isAdmin = data.session?.user.app_metadata["role"] === "admin";
      setIsAuthenticated(isAdmin);
      if (isAdmin) {
        const stored = getStoredConfig();
        setSettings(stored.settings);
        setTools(stored.tools);
        setSeo(stored.seo);
        setContact(stored.contact);
        setSocialLinks(stored.socials || DEFAULT_SOCIAL_LINKS);

        const { data: sharedContact, error: contactError } = await client
          .from("site_contact_settings")
          .select("*")
          .eq("id", true)
          .maybeSingle();
        if (!active) return;
        if (contactError) {
          console.error("Could not load shared contact settings", contactError);
          setSaveNotice(
            tr(
              "শেয়ার্ড যোগাযোগের তথ্য লোড হয়নি। Supabase SQL চালানো হয়েছে কি না দেখুন।",
              "Shared contact details could not load. Check that the Supabase SQL has been run.",
            ),
          );
        } else if (sharedContact) {
          setContact({
            email: sharedContact.email,
            phone: sharedContact.phone,
            address: sharedContact.address,
            adEmail: sharedContact.ad_email,
            supportMessage: sharedContact.support_message,
          });
        }

        const { data: socialRows, error: socialError } = await client
          .from("site_social_links")
          .select("*")
          .order("order_index", { ascending: true });

        if (!active) return;
        if (socialError) {
          console.error("Could not load social links", socialError);
          setSocialLinks(DEFAULT_SOCIAL_LINKS);
        } else if (socialRows && socialRows.length > 0) {
          const normalized = socialRows
            .map((link) => ({
              ...link,
              label: link.label || "Site Link",
              url: link.url || "",
              icon_key: link.icon_key || "website",
              is_active: link.is_active ?? true,
              order_index: Number(link.order_index ?? 0),
            }))
            .sort((first, second) => first.order_index - second.order_index);
          setSocialLinks(normalized);
        } else {
          setSocialLinks(DEFAULT_SOCIAL_LINKS);
        }
      } else if (data.session) {
        void client.auth.signOut();
      }
      setAuthLoading(false);
    })();

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setIsAuthenticated(session?.user.app_metadata["role"] === "admin");
        setAuthLoading(false);
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [tr]);

  const loadMessages = useCallback(async () => {
    if (!supabase) return;
    setMessagesLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Could not load contact messages", error);
        const setupRequired = error.code === "PGRST205" || error.code === "42P01";
        const permissionDenied = error.code === "42501";
        setMessagesError(
          setupRequired
            ? tr(
                "মেসেজ ডেটাবেস তৈরি হয়নি। Supabase SQL Editor-এ supabase/contact-messages.sql চালান।",
                "The message database is not set up. Run supabase/contact-messages.sql in the Supabase SQL Editor.",
              )
            : permissionDenied
              ? tr(
                  "বার্তা দেখার অনুমতি নেই। এই অ্যাকাউন্টে admin role ও RLS policy যাচাই করুন।",
                  "Permission denied. Check this account's admin role and the table's RLS policies.",
                )
              : tr(
                  "বার্তা লোড করা যায়নি। Supabase connection ও database policy যাচাই করুন।",
                  "Could not load messages. Check the Supabase connection and database policies.",
                ),
        );
      } else {
        setMessages(data);
        setMessagesError("");
      }
    } catch (error) {
      console.error("Could not load contact messages", error);
      setMessagesError(
        tr(
          "বার্তার সঙ্গে সংযোগ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
          "Could not connect to load messages. Check your internet connection and try again.",
        ),
      );
    } finally {
      setMessagesLoading(false);
    }
  }, [tr]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadMessages();
    const interval = window.setInterval(() => void loadMessages(), 30_000);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, loadMessages]);

  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") return;
    const nextConfig: AdminConfig = { settings, tools, seo, contact, socials: socialLinks };
    window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(nextConfig));
    setSaveNotice(
      tr(
        `সেটিংস সেভ হয়েছে — ${new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}`,
        `Settings saved — ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
      ),
    );
  }, [settings, tools, seo, contact, socialLinks, isAuthenticated, tr]);

  const activeToolCount = useMemo(() => Object.values(tools).filter(Boolean).length, [tools]);

  const updateSetting = (key: keyof SiteSettings) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  const updateTool = (key: ToolKey) => {
    setTools((current) => ({ ...current, [key]: !current[key] }));
  };

  const resetConfig = () => {
    setSettings(DEFAULT_SETTINGS);
    setTools(DEFAULT_TOOLS);
    setSeo(DEFAULT_SEO);
    setContact(DEFAULT_CONTACT);
    setSocialLinks(DEFAULT_SOCIAL_LINKS);
    setSaveNotice(tr("ডিফল্ট সেটিংসে ফিরে গেছে", "Defaults restored"));
  };

  const saveConfig = async () => {
    try {
      const nextConfig: AdminConfig = { settings, tools, seo, contact, socials: socialLinks };
      window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(nextConfig));
    } catch (error) {
      console.error("Unable to save admin configuration", error);
      setSaveNotice(
        tr(
          "সেভ করা যায়নি। ব্রাউজারের স্টোরেজ পরীক্ষা করুন।",
          "Could not save. Check browser storage and try again.",
        ),
      );
      return;
    }

    if (!supabase) {
      setSaveNotice(
        tr(
          "Supabase সংযুক্ত না থাকায় যোগাযোগের তথ্য প্রকাশ করা যায়নি।",
          "Contact details could not be published because Supabase is not connected.",
        ),
      );
      return;
    }

    setIsSaving(true);
    try {
      const { error: contactError } = await supabase.from("site_contact_settings").upsert(
        {
          id: true,
          email: contact.email.trim(),
          phone: contact.phone.trim(),
          address: contact.address.trim(),
          ad_email: contact.adEmail.trim(),
          support_message: contact.supportMessage.trim(),
        },
        { onConflict: "id" },
      );

      if (contactError) {
        console.error("Could not publish shared contact settings", contactError);
        setSaveNotice(
          tr(
            "যোগাযোগের তথ্য প্রকাশ হয়নি। Supabase SETUP-এর আপডেট করা SQL চালিয়ে আবার চেষ্টা করুন।",
            "Contact details were not published. Run the updated SQL from Supabase SETUP and try again.",
          ),
        );
        return;
      }

      const normalizedSocialLinks = socialLinks
        .map((link, index) => ({
          ...link,
          label: link.label.trim() || "Social Link",
          url: link.url.trim(),
          icon_key: link.icon_key || "website",
          is_active: link.is_active,
          order_index: index,
        }))
        .sort((first, second) => first.order_index - second.order_index);

      const { error: socialError } = await supabase
        .from("site_social_links")
        .upsert(normalizedSocialLinks as never, { onConflict: "id" });

      if (socialError) {
        console.error("Could not publish social links", socialError);
        setSaveNotice(
          tr(
            "সোশ্যাল লিংক সেভ হয়নি। Supabase SQL-এ social links টেবিল আছে কি না যাচাই করুন।",
            "Social links could not be saved. Check whether the Supabase social links table exists.",
          ),
        );
        return;
      }

      setSaveNotice(
        tr("পরিবর্তনগুলো সফলভাবে সেভ ও প্রকাশ হয়েছে", "Changes saved and published successfully"),
      );
    } catch (error) {
      console.error("Could not publish site settings", error);
      setSaveNotice(
        tr(
          "সেটিংস প্রকাশ করা যায়নি। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।",
          "Could not publish site settings. Check your connection and try again.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");
    if (!supabase) {
      setLoginError(
        tr(
          "Supabase সেটআপ না হওয়া পর্যন্ত admin login চালু হবে না।",
          "Admin sign-in is unavailable until Supabase is configured.",
        ),
      );
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginUser.trim(),
      password: loginPass,
    });
    if (error) {
      console.error("Admin sign-in failed", error);
      setLoginPass("");
      setLoginError(
        tr(
          "লগইন হয়নি। ইমেইল/পাসওয়ার্ড ঠিক আছে কি না, Supabase Auth → Users-এ অ্যাকাউন্ট আছে কি না এবং SETUP অনুযায়ী admin অনুমতি দেয়া হয়েছে কি না যাচাই করুন।",
          "Sign-in failed. Check the email and password, confirm the account exists under Supabase Auth → Users, and grant the admin role as described in SETUP.",
        ),
      );
      return;
    }
    if (data.user.app_metadata["role"] !== "admin") {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) console.error("Could not sign out non-admin user", signOutError);
      setLoginPass("");
      setLoginError(
        tr("এই অ্যাকাউন্টে admin অনুমতি নেই।", "This account does not have admin access."),
      );
      return;
    }
    setLoginPass("");
    const stored = getStoredConfig();
    setSettings(stored.settings);
    setTools(stored.tools);
    setSeo(stored.seo);
    const { data: sharedContact, error: contactError } = await supabase
      .from("site_contact_settings")
      .select("*")
      .eq("id", true)
      .maybeSingle();
    if (contactError) {
      console.error("Could not load shared contact settings", contactError);
      setSaveNotice(
        tr(
          "যোগাযোগের তথ্য লোড হয়নি। Supabase SQL চালানো হয়েছে কি না দেখুন।",
          "Contact details could not load. Check that the Supabase SQL has been run.",
        ),
      );
      setContact(stored.contact);
    } else if (sharedContact) {
      setContact({
        email: sharedContact.email,
        phone: sharedContact.phone,
        address: sharedContact.address,
        adEmail: sharedContact.ad_email,
        supportMessage: sharedContact.support_message,
      });
    } else {
      setContact(stored.contact);
    }
    setIsAuthenticated(true);
  };

  const logout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Admin sign-out failed", error);
      setLoginError(
        tr("লগআউট করা যায়নি। আবার চেষ্টা করুন।", "Could not sign out. Please try again."),
      );
    }
    setIsAuthenticated(false);
    setLoginPass("");
  };

  const toggleMessageRead = async (message: ContactMessage) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: !message.is_read })
      .eq("id", message.id);
    if (error) {
      console.error("Could not update contact message status", error);
      setMessagesError(tr("বার্তার অবস্থা আপডেট করা যায়নি।", "Could not update message status."));
      return;
    }
    await loadMessages();
  };

  if (authLoading) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        {tr("যাচাই করা হচ্ছে…", "Checking sign-in…")}
      </p>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <div className="panel">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary">
              <ShieldCheck />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {tr("সাইট লগইন", "Admin sign in")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {tr(
                "সাইট সেটিংস ও কনটেন্ট পরিচালনার জন্য সাইন ইন করুন",
                "Sign in to manage site settings and content",
              )}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {tr(
                "প্রথমে Supabase Auth → Users-এ অ্যাকাউন্ট তৈরি করে সেটআপ নির্দেশনার SQL দিয়ে admin অনুমতি দিন।",
                "Create the account under Supabase Auth → Users, then grant the admin role using the SQL in the setup instructions.",
              )}
            </p>
          </div>

          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                {tr("ইমেইল", "Email")}
              </label>
              <input
                type="email"
                className="field"
                value={loginUser}
                onChange={(event) => setLoginUser(event.target.value)}
                placeholder="it.agamirsomoy2@gmail.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                {tr("পাসওয়ার্ড", "Password")}
              </label>
              <input
                type="password"
                className="field"
                value={loginPass}
                onChange={(event) => setLoginPass(event.target.value)}
              />
            </div>

            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            {!supabase && (
              <p className="text-sm text-amber-700" role="status">
                {tr(
                  "বার্তা ও admin sign-in চালু করতে Supabase project সংযোগ করতে হবে।",
                  "Connect a Supabase project to enable admin sign-in and message delivery.",
                )}
              </p>
            )}

            <button
              type="submit"
              disabled={!supabase}
              className="btn-primary w-full justify-center"
            >
              {tr("লগইন", "Sign in")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <PageTitle
          title={tr("কন্ট্রোল প্যানেল", "Control Panel")}
          sub={tr(
            "সাইট সেটিংস, কনটেন্ট ও টুল স্ট্যাটাস পরিচালনা করুন",
            "Manage site settings, content and tool status",
          )}
        />
        <div className="flex items-center gap-2">
          <button type="button" onClick={resetConfig} className="btn">
            {tr("ডিফল্ট রিসেট", "Reset defaults")}
          </button>
          <button type="button" onClick={logout} className="btn">
            <LogOut size={16} />
            {tr("লগআউট", "Log out")}
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:text-primary">
            {tr("হোম", "Home")}
          </Link>
          <span>/</span>
          <span className="text-foreground">{tr("ড্যাশবোর্ড", "Dashboard")}</span>
        </div>
        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
          {saveNotice}
        </div>
        <a href="#messages" className="admin-message-link">
          <Mail size={15} />
          {tr("বার্তা", "Messages")}
          <span>{messages.filter((message) => !message.is_read).length}</span>
        </a>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: tr("মোট টুলস", "Total tools"),
            value: String(Object.keys(tools).length),
            delta: tr(`${activeToolCount} সক্রিয়`, `${activeToolCount} active`),
            icon: LayoutDashboard,
          },
          {
            label: tr("এক্টিভ ইউজার", "Active users"),
            value: "12.4K",
            delta: "+18%",
            icon: BarChart3,
          },
          {
            label: tr("সাইট হেলথ", "Site health"),
            value: settings.maintenance ? tr("ব্যস্ত", "Paused") : "98.6%",
            delta: settings.maintenance
              ? tr("রক্ষণাবেক্ষণ", "Maintenance")
              : tr("অভ্যন্তরীণ", "Internal"),
            icon: ShieldCheck,
          },
          { label: tr("সেশন", "Sessions"), value: "3.2K", delta: tr("আজ", "Today"), icon: Globe },
        ].map(({ label, value, delta, icon: Icon }) => (
          <div key={label} className="panel">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <h3 className="mt-3 text-3xl font-bold text-foreground">{value}</h3>
              </div>
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Icon size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600">
              <ArrowUpRight size={14} />
              {delta}
            </div>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          <div className="panel">
            <div className="mb-5 flex items-center gap-2">
              <SlidersHorizontal className="text-primary" size={18} />
              <h2 className="text-lg font-semibold">{tr("সাইট সেটিংস", "Site settings")}</h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: "maintenance",
                  title: tr("মেইনটেনেন্স মোড", "Maintenance mode"),
                  detail: tr("সাইটটি সাময়িকভাবে বন্ধ রাখুন", "Temporarily take the site offline"),
                },
                {
                  key: "darkModeDefault",
                  title: tr("ডার্ক মোড ডিফল্ট", "Default dark mode"),
                  detail: tr(
                    "নতুন ব্যবহারকারীদের জন্য ডার্ক থিম চালু করুন",
                    "Enable the dark theme for new visitors",
                  ),
                },
                {
                  key: "autoSave",
                  title: tr("অটো সেভ", "Autosave"),
                  detail: tr(
                    "টাইপিং/কনভার্টার ফর্মের ডেটা স্বয়ংক্রিয়ভাবে সংরক্ষণ",
                    "Automatically save typing and converter form data",
                  ),
                },
                {
                  key: "imageCompression",
                  title: tr("ইমেজ কম্প্রেশান", "Image compression"),
                  detail: tr(
                    "ইমেজ টুলে এডভান্সড কম্প্রেশন অন",
                    "Enable advanced compression for image tools",
                  ),
                },
                {
                  key: "analytics",
                  title: tr("অ্যানালিটিকস", "Analytics"),
                  detail: tr(
                    "ভিজিট ও কনভার্সন ট্র্যাকিং চালু",
                    "Enable visit and conversion tracking",
                  ),
                },
                {
                  key: "betaTools",
                  title: tr("বিটা টুলস", "Beta tools"),
                  detail: tr("নতুন পরীক্ষামূলক টুল দেখান", "Show new experimental tools"),
                },
              ].map(({ key, title, detail }) => {
                const enabled = settings[key as keyof SiteSettings];
                return (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border bg-secondary/30 p-3 transition hover:border-primary/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">{title}</p>
                      <p className="text-sm text-muted-foreground">{detail}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSetting(key as keyof SiteSettings)}
                      aria-pressed={enabled}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${enabled ? "bg-primary" : "bg-muted"}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${enabled ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <div className="mb-5 flex items-center gap-2">
              <Wand2 className="text-primary" size={18} />
              <h2 className="text-lg font-semibold">{tr("টুল ম্যানেজমেন্ট", "Tool management")}</h2>
            </div>

            <div className="space-y-3">
              {(Object.keys(toolMeta) as ToolKey[]).map((key) => {
                const tool = toolMeta[key];
                const enabled = tools[key];
                const Icon = tool.icon;

                return (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border bg-secondary/30 p-3 transition hover:border-primary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <Icon size={18} />
                      </div>
                      <span className="font-medium text-foreground">{tool.name[language]}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateTool(key)}
                      aria-pressed={enabled}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${enabled ? "bg-primary" : "bg-muted"}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${enabled ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </label>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3 text-sm text-muted-foreground">
              {tr("সক্রিয় টুল:", "Active tools:")}{" "}
              <span className="font-semibold text-foreground">{activeToolCount}/6</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel">
            <div className="mb-5 flex items-center gap-2">
              <Sparkles className="text-primary" size={18} />
              <h2 className="text-lg font-semibold">
                {tr("SEO, ব্র্যান্ড ও যোগাযোগ", "SEO, brand & contact")}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {tr("সাইট নাম", "Site name")}
                </label>
                <input
                  className="field"
                  value={seo.title}
                  onChange={(event) =>
                    setSeo((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {tr("ট্যাগলাইন", "Tagline")}
                </label>
                <input
                  className="field"
                  value={seo.tagline}
                  onChange={(event) =>
                    setSeo((current) => ({ ...current, tagline: event.target.value }))
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {tr("CTA টেক্সট", "CTA text")}
                </label>
                <input
                  className="field"
                  value={seo.cta}
                  onChange={(event) =>
                    setSeo((current) => ({ ...current, cta: event.target.value }))
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {tr("মেটা ডিসক্রিপশন", "Meta description")}
                </label>
                <textarea
                  className="field min-h-[100px] resize-y"
                  value={seo.description}
                  onChange={(event) =>
                    setSeo((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    {tr("ইমেইল", "Email")}
                  </label>
                  <input
                    className="field"
                    value={contact.email}
                    onChange={(event) =>
                      setContact((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    {tr("ফোন", "Phone")}
                  </label>
                  <input
                    className="field"
                    value={contact.phone}
                    onChange={(event) =>
                      setContact((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {tr("ঠিকানা", "Address")}
                </label>
                <input
                  className="field"
                  value={contact.address}
                  onChange={(event) =>
                    setContact((current) => ({ ...current, address: event.target.value }))
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {tr("বিজ্ঞাপন ইমেইল", "Advertising email")}
                </label>
                <input
                  className="field"
                  value={contact.adEmail}
                  onChange={(event) =>
                    setContact((current) => ({ ...current, adEmail: event.target.value }))
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {tr("সাপোর্ট বার্তার নোট", "Support message")}
                </label>
                <textarea
                  className="field min-h-[90px] resize-y"
                  value={contact.supportMessage}
                  onChange={(event) =>
                    setContact((current) => ({ ...current, supportMessage: event.target.value }))
                  }
                />
              </div>

              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {tr("সোশ্যাল মিডিয়া", "Social media")}
                  </h3>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() =>
                      setSocialLinks((current) => [
                        ...current,
                        {
                          id: `custom-${Date.now()}`,
                          label: "New link",
                          url: "",
                          icon_key: "website",
                          is_active: true,
                          order_index: current.length,
                        },
                      ])
                    }
                  >
                    {tr("নতুন লিংক", "New link")}
                  </button>
                </div>

                <div className="space-y-3">
                  {socialLinks.map((link, index) => (
                    <div key={link.id} className="rounded-xl border bg-background p-3">
                      <div className="grid gap-3 md:grid-cols-[1.1fr_1.8fr_1fr_auto_auto]">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            {tr("আইকনের নাম / লেবেল", "Icon name / label")}
                          </label>
                          <input
                            className="field"
                            value={link.label}
                            placeholder={tr("যেমন: Facebook", "For example: Facebook")}
                            onChange={(event) =>
                              setSocialLinks((current) =>
                                current.map((item, itemIndex) =>
                                  item.id === link.id
                                    ? { ...item, label: event.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            URL
                          </label>
                          <input
                            className="field"
                            value={link.url}
                            placeholder="https://example.com"
                            onChange={(event) =>
                              setSocialLinks((current) =>
                                current.map((item, itemIndex) =>
                                  item.id === link.id ? { ...item, url: event.target.value } : item,
                                ),
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            {tr("আইকন", "Icon")}
                          </label>
                          <select
                            className="field"
                            value={link.icon_key}
                            onChange={(event) =>
                              setSocialLinks((current) =>
                                current.map((item) =>
                                  item.id === link.id
                                    ? { ...item, icon_key: event.target.value }
                                    : item,
                                ),
                              )
                            }
                          >
                            <option value="facebook">Facebook</option>
                            <option value="youtube">YouTube</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="email">Email</option>
                            <option value="website">Website</option>
                          </select>
                        </div>
                        <div className="flex items-end gap-2 pb-2 text-xs text-muted-foreground">
                          {(() => {
                            const Icon = SOCIAL_ICON_MAP[link.icon_key] ?? Globe;
                            return <Icon size={18} aria-hidden="true" />;
                          })()}
                          <span>{link.label || tr("নামহীন লিংক", "Unnamed link")}</span>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() =>
                              setSocialLinks((current) =>
                                current.filter((item) => item.id !== link.id),
                              )
                            }
                            className="btn text-red-600 hover:bg-red-500/10"
                          >
                            {tr("মুছুন", "Delete")}
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={link.is_active}
                            onChange={(event) =>
                              setSocialLinks((current) =>
                                current.map((item) =>
                                  item.id === link.id
                                    ? { ...item, is_active: event.target.checked }
                                    : item,
                                ),
                              )
                            }
                          />
                          {tr("ফুটারে দেখান", "Show in footer")}
                        </label>
                        <span>#{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={saveConfig}
                disabled={isSaving}
                className="btn-primary w-full justify-center"
              >
                {isSaving ? tr("সেভ হচ্ছে…", "Saving…") : tr("পরিবর্তন সেভ করুন", "Save changes")}
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="mb-5 flex items-center gap-2">
              <Globe className="text-primary" size={18} />
              <h2 className="text-lg font-semibold">{tr("দ্রুত কার্যক্রম", "Quick actions")}</h2>
            </div>

            <div className="space-y-2">
              {[
                { label: tr("প্রকাশ করুন", "Publish"), tone: "primary" },
                { label: tr("ডিফল্ট কনফিগ রিস্টোর", "Restore defaults"), tone: "secondary" },
                { label: tr("ভিডিও/ইমেজ টেস্ট", "Test media"), tone: "secondary" },
              ].map(({ label, tone }) => (
                <button
                  key={label}
                  type="button"
                  onClick={
                    tone === "primary"
                      ? () =>
                          setSaveNotice(
                            tr("সাইট প্রকাশের জন্য প্রস্তুত", "Site is ready to publish"),
                          )
                      : resetConfig
                  }
                  className={
                    tone === "primary"
                      ? "btn-primary w-full justify-center"
                      : "btn w-full justify-center"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="mb-5 flex items-center gap-2">
              <CheckCircle2 className="text-primary" size={18} />
              <h2 className="text-lg font-semibold">
                {tr("সাম্প্রতিক কার্যক্রম", "Recent activity")}
              </h2>
            </div>

            <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.title.bn} className="rounded-xl border bg-secondary/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{item.title[language]}</p>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-700">
                      {item.state[language]}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{item.time[language]}</p>
                </div>
              ))}
            </div>
          </div>

          <section id="messages" className="panel admin-messages">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Mail className="text-primary" size={18} />
                <h2 className="text-lg font-semibold">
                  {tr("যোগাযোগের বার্তা", "Contact messages")}
                </h2>
                <span className="admin-unread-count">
                  {messages.filter((message) => !message.is_read).length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void loadMessages()}
                className="btn"
                disabled={messagesLoading}
              >
                {messagesLoading ? tr("লোড হচ্ছে…", "Loading…") : tr("রিফ্রেশ", "Refresh")}
              </button>
            </div>
            {messagesError && (
              <p className="mb-4 text-sm text-red-600" role="alert">
                {messagesError}
              </p>
            )}
            {messagesLoading && messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {tr("বার্তা লোড হচ্ছে…", "Loading messages…")}
              </p>
            )}
            {!messagesLoading && messages.length === 0 && !messagesError && (
              <p className="text-sm text-muted-foreground">
                {tr("এখনো কোনো বার্তা আসেনি।", "No messages have arrived yet.")}
              </p>
            )}
            <div className="space-y-3">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`admin-message-card ${message.is_read ? "" : "unread"}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {message.first_name} {message.last_name}
                      </h3>
                      <a
                        className="text-sm text-primary hover:underline"
                        href={`mailto:${message.email}`}
                      >
                        {message.email}
                      </a>
                      {message.phone && (
                        <p className="text-sm text-muted-foreground">{message.phone}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <time className="text-xs text-muted-foreground" dateTime={message.created_at}>
                        {new Date(message.created_at).toLocaleString(en ? "en" : "bn-BD")}
                      </time>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => void toggleMessageRead(message)}
                      >
                        {message.is_read
                          ? tr("আনরিড করুন", "Mark unread")
                          : tr("পড়া হয়েছে", "Mark read")}
                      </button>
                    </div>
                  </div>
                  {message.company_name && (
                    <p className="mt-3 text-sm text-muted-foreground">{message.company_name}</p>
                  )}
                  <h4 className="mt-3 font-medium">{message.subject}</h4>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {message.message}
                  </p>
                </article>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {tr(
                "নতুন বার্তা প্রতি ৩০ সেকেন্ডে স্বয়ংক্রিয়ভাবে পরীক্ষা করা হয়।",
                "New messages are checked automatically every 30 seconds.",
              )}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
