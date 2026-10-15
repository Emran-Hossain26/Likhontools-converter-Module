import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Mail, MapPin, MessageSquareText, Phone } from "lucide-react";
import { PageTitle } from "@/components/SiteHeader";
import { useLanguage } from "@/lib/i18n";
import { supabase, type SiteContactSettings } from "@/lib/supabase";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "যোগাযোগ | লিখনটুলস" },
      { name: "description", content: "লিখনটুলসের সঙ্গে যোগাযোগ করুন বা আপনার বার্তা পাঠান।" },
    ],
  }),
  component: ContactPage,
});

type ContactForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  subject: string;
  message: string;
};

const emptyForm: ContactForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  company_name: "",
  subject: "",
  message: "",
};

function ContactPage() {
  const { language } = useLanguage();
  const en = language === "en";
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [contactSettings, setContactSettings] = useState<SiteContactSettings | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "not-configured">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    void supabase
      .from("site_contact_settings")
      .select("*")
      .eq("id", true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Could not load public contact settings", error);
          return;
        }
        if (data) setContactSettings(data);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateField = (field: keyof ContactForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setErrorMessage("");
    if (!supabase) {
      setStatus("not-configured");
      return;
    }

    setStatus("sending");
    try {
      const { error } = await supabase.from("contact_messages").insert({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        company_name: form.company_name.trim() || null,
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      if (error) {
        console.error("Could not submit contact message", error);
        const setupRequired = error.code === "PGRST205" || error.code === "42P01";
        setErrorMessage(setupRequired
          ? en
            ? "Message storage is not set up yet. Please contact us by email."
            : "বার্তা গ্রহণের ডেটাবেস এখনো সেটআপ করা হয়নি। অনুগ্রহ করে ইমেইলে যোগাযোগ করুন।"
          : en
            ? "We couldn't send your message. Please try again later."
            : "বার্তাটি পাঠানো যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।");
        setStatus("error");
        return;
      }

      setForm(emptyForm);
      setStatus("sent");
    } catch (error) {
      console.error("Could not submit contact message", error);
      setErrorMessage(en
        ? "We couldn't connect to send your message. Check your internet connection and try again."
        : "বার্তা পাঠানোর সংযোগ পাওয়া যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।");
      setStatus("error");
    }
  };

  const text = en
    ? {
        title: "Contact us",
        subtitle: "Have a question or idea? Send us a message and we’ll get back to you.",
        contact: "Contact information",
        contactDescription: "We’re here to help with Likhon Tools, feedback and partnerships.",
        email: "Email",
        location: "Location",
        locationValue: "Bangladesh",
        formTitle: "Send us a message",
        formDescription: "Fill in the form and our team will get back to you.",
        first: "First name",
        last: "Last name",
        company: "Company name",
        subject: "Subject",
        message: "Message",
        send: "Send message",
        sending: "Sending…",
        sent: "Your message has been sent. We’ll be in touch soon.",
        config: "Message delivery is not configured yet. Please email us directly.",
        placeholder: "Write your message here…",
      }
    : {
        title: "যোগাযোগ",
        subtitle: "কোনো প্রশ্ন বা পরামর্শ আছে? বার্তা পাঠান, আমরা উত্তর দেব।",
        contact: "যোগাযোগের তথ্য",
        contactDescription: "লিখন টুলস, মতামত ও অংশীদারত্ব সংক্রান্ত বিষয়ে আমরা পাশে আছি।",
        email: "ইমেইল",
        location: "অবস্থান",
        locationValue: "বাংলাদেশ",
        formTitle: "আমাদের বার্তা পাঠান",
        formDescription: "ফর্মটি পূরণ করুন, আমরা আপনার সঙ্গে যোগাযোগ করব।",
        first: "নামের প্রথম অংশ",
        last: "নামের শেষ অংশ",
        company: "প্রতিষ্ঠানের নাম",
        subject: "বিষয়",
        message: "বার্তা",
        send: "বার্তা পাঠান",
        sending: "পাঠানো হচ্ছে…",
        sent: "আপনার বার্তা পাঠানো হয়েছে। শিগগিরই যোগাযোগ করব।",
        config: "বার্তা পাঠানোর ব্যবস্থা এখনো যুক্ত করা হয়নি। আপাতত সরাসরি ইমেইল করুন।",
        placeholder: "আপনার বার্তা লিখুন…",
      };
  const email = contactSettings?.email.trim() || "it.agamirsomoy2@gmail.com";
  const phone = contactSettings ? contactSettings.phone.trim() : "+8801924437817";
  const address = contactSettings?.address.trim() || text.locationValue;
  const phoneLink = phone
    ?.replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - "০".charCodeAt(0)))
    .replace(/[^\d+]/g, "");

  return (
    <div className="contact-page">
      <PageTitle title={text.title} sub={text.subtitle} />
      <section className="contact-card">
        <div className="contact-details">
          <h2>{text.contact}</h2>
          <p>{text.contactDescription}</p>
          <a className="contact-detail" href={`mailto:${email}`}>
            <Mail aria-hidden="true" />
            <span><small>{text.email}</small>{email}</span>
          </a>
          {phone && phoneLink && (
            <a className="contact-detail" href={`tel:${phoneLink}`}>
              <Phone aria-hidden="true" />
              <span><small>{en ? "Phone" : "ফোন"}</small>{phone}</span>
            </a>
          )}
          <div className="contact-detail">
            <MapPin aria-hidden="true" />
            <span><small>{text.location}</small>{address}</span>
          </div>
          <div className="contact-message-hint">
            <MessageSquareText aria-hidden="true" />
            <span>{en ? "Messages sent here can be reviewed by our admin team." : "এখানে পাঠানো বার্তা admin panel থেকে দেখা যাবে।"}</span>
          </div>
        </div>

        <form className="contact-form" onSubmit={submitMessage}>
          <h2>{text.formTitle}</h2>
          <p>{text.formDescription}</p>
          <div className="contact-fields">
            <label>{text.first}<input className="field" autoComplete="given-name" required maxLength={100} value={form.first_name} onChange={updateField("first_name")} /></label>
            <label>{text.last}<input className="field" autoComplete="family-name" required maxLength={100} value={form.last_name} onChange={updateField("last_name")} /></label>
            <label>{text.email}<input className="field" type="email" autoComplete="email" required maxLength={320} value={form.email} onChange={updateField("email")} /></label>
            <label>{en ? "Phone" : "ফোন"}<input className="field" type="tel" autoComplete="tel" maxLength={40} value={form.phone} onChange={updateField("phone")} /></label>
            <label>{text.company}<input className="field" autoComplete="organization" maxLength={160} value={form.company_name} onChange={updateField("company_name")} /></label>
            <label>{text.subject}<input className="field" required maxLength={200} value={form.subject} onChange={updateField("subject")} /></label>
          </div>
          <label className="contact-message-field">
            {text.message}
            <textarea className="field" required rows={5} maxLength={10000} placeholder={text.placeholder} value={form.message} onChange={updateField("message")} />
          </label>
          {status === "sent" && <p className="contact-status success" role="status">{text.sent}</p>}
          {status === "not-configured" && <p className="contact-status error" role="alert">{text.config} <a href={`mailto:${email}`}>{email}</a></p>}
          {status === "error" && <p className="contact-status error" role="alert">{errorMessage}</p>}
          <button className="contact-submit" type="submit" disabled={status === "sending"}>
            {status === "sending" ? text.sending : text.send}
          </button>
        </form>
      </section>
    </div>
  );
}
