import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

it("starts with the default theme and switches between dark and default", () => {
  render(<ThemeToggle />);
  expect(document.documentElement.classList.contains("dark")).toBe(false);
  fireEvent.click(screen.getByRole("button"));
  expect(document.documentElement.classList.contains("dark")).toBe(true);
  expect(localStorage.getItem("likhontools-theme")).toBe("dark");
  fireEvent.click(screen.getByRole("button"));
  expect(document.documentElement.classList.contains("dark")).toBe(false);
  expect(localStorage.getItem("likhontools-theme")).toBe("default");
});

it("restores the saved dark preference", () => {
  localStorage.setItem("likhontools-theme", "dark");
  render(<ThemeToggle />);
  expect(document.documentElement.classList.contains("dark")).toBe(true);
});
