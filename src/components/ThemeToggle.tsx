import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const storageKey = "likhontools-theme";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      const savedDark = localStorage.getItem(storageKey) === "dark";
      setDark(savedDark);
      document.documentElement.classList.toggle("dark", savedDark);
    } catch {
      // Default green theme remains available when storage is blocked.
    }
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(storageKey, next ? "dark" : "default");
    } catch {
      // Theme switching still works without persistent storage.
    }
  }

  const label = dark ? "ডিফল্ট মোড" : "ডার্ক মোড";
  return (
    <Button variant="outline" size="sm" onClick={toggleTheme} aria-label={label} title={label}>
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      <span>{label}</span>
    </Button>
  );
}
