import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function ensureDir(targetPath) {
  await mkdir(targetPath, { recursive: true });
}

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function writeTextFile(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, content, "utf8");
}

export function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function stripHtml(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function formatDisplayDate(dateString, locale) {
  const date = new Date(`${dateString}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  }).format(date);
}

export function slugify(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function sortedByDateDesc(items) {
  return [...items].sort((left, right) => {
    if (left.date === right.date) {
      return left.slug.localeCompare(right.slug);
    }

    return right.date.localeCompare(left.date);
  });
}
