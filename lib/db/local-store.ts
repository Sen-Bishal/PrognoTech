import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export interface LocalCalculationRecord {
  id: string;
  systemId: string;
  inputParameters: unknown;
  result: unknown;
  createdAt: string;
}

const dataDir = path.join(process.cwd(), "data");
const calculationsPath = path.join(dataDir, "calculations.json");

const ensureStore = async () => {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(calculationsPath);
  } catch {
    await fs.writeFile(calculationsPath, "[]", "utf8");
  }
};

const readAll = async (): Promise<LocalCalculationRecord[]> => {
  await ensureStore();
  try {
    const content = await fs.readFile(calculationsPath, "utf8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed as LocalCalculationRecord[];
    }
    return [];
  } catch {
    return [];
  }
};

const writeAll = async (records: LocalCalculationRecord[]) => {
  await ensureStore();
  await fs.writeFile(calculationsPath, JSON.stringify(records, null, 2), "utf8");
};

export const appendCalculation = async (input: {
  systemId: string;
  inputParameters: unknown;
  result: unknown;
}) => {
  const record: LocalCalculationRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input
  };

  const current = await readAll();
  current.unshift(record);
  await writeAll(current);

  return record;
};

export const listCalculations = async (limit = 50) => {
  const current = await readAll();
  return current.slice(0, limit);
};
