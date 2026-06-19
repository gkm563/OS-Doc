import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { ContributionSchema } from "../schemas/contribution.schema";
import { ReviewerSchema } from "../schemas/reviewer.schema";
import { AchievementSchema } from "../schemas/achievement.schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function validateFile<T extends z.ZodTypeAny>(
  filePath: string,
  schema: T
): z.infer<T>[] | null {
  const absolutePath = path.join(rootDir, filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const rawData = fs.readFileSync(absolutePath, "utf-8");
    const parsedData = JSON.parse(rawData);
    
    // Validate array of objects or single object
    const validationSchema = z.array(schema);
    const result = validationSchema.safeParse(parsedData);

    if (!result.success) {
      console.error(`❌ Validation failed for ${filePath}:`);
      console.error(JSON.stringify(result.error.format(), null, 2));
      process.exit(1);
    }

    console.log(`✅ ${filePath} is valid! (${parsedData.length} records)`);
    return result.data;
  } catch (error: any) {
    console.error(`❌ Error parsing ${filePath}:`, error.message || error);
    process.exit(1);
  }
}

console.log("🔍 Validating JSON database files...");

validateFile("data/contributions.json", ContributionSchema);
validateFile("data/reviewers.json", ReviewerSchema);
validateFile("data/achievements.json", AchievementSchema);

console.log("✨ All schema checks passed successfully!");
process.exit(0);
