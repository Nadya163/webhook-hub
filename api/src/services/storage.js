import { readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "../../data");

const SOURCES_FILE = join(DATA_DIR, "sources.json");
const EVENTS_FILE = join(DATA_DIR, "events.json");

async function readJSON(filepath) {
  const data = await readFile(filepath, "utf-8");
  return JSON.parse(data);
}

async function writeJSON(filepath, data) {
  await writeFile(filepath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getSources() {
  return readJSON(SOURCES_FILE);
}

export async function saveSources(sources) {
  return writeJSON(SOURCES_FILE, sources);
}

export async function getEvents() {
  return readJSON(EVENTS_FILE);
}

export async function saveEvents(events) {
  return writeJSON(EVENTS_FILE, events);
}
