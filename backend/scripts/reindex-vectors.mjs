import { listSchemes } from "../src/services/core/scheme.repository.js";
import { indexSchemes } from "../src/services/ml/vector-index.service.js";

async function main() {
  const schemes = await listSchemes({ limit: 5000 });
  await indexSchemes(schemes);
  console.log(`Indexed ${schemes.length} schemes into vector store`);
}

main().catch((error) => {
  console.error("Vector reindex failed:", error.message);
  process.exit(1);
});
