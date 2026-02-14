/**
 * ETL Connector Orchestrator
 *
 * Runs all dataset connectors in the correct order:
 * 1. OWID (baseline GHG factors - GLOBAL)
 * 2. AGRIBALYSE (detailed LCA - FR/EU)
 * 3. FAO Crop Calendar (seasonality)
 * 4. Köppen climate zones (seasonality fallback)
 * 5. WRI Aqueduct (water risk)
 * 6. UN Comtrade (trade origins)
 *
 * Usage: npx tsx src/connectors/index.ts
 */
import { closePool } from './db-pool';
import { runOwidEtl } from './owid';
import { runAgribalyseEtl } from './agribalyse';
import { runFaoEtl } from './fao';
import { runKoppenEtl } from './koppen';
import { runAqueductEtl } from './aqueduct';
import { runComtradeEtl } from './comtrade';

export async function runAllConnectors(): Promise<void> {
  console.log('=== SeasonScope Dataset Connectors ===\n');
  const start = Date.now();

  try {
    // 1. OWID — baseline GLOBAL GHG factors (must run first, others may reference)
    await runOwidEtl();

    // 2. AGRIBALYSE — FR/EU specific GHG factors
    await runAgribalyseEtl();

    // 3. FAO — crop calendar seasonality
    await runFaoEtl();

    // 4. Köppen — climate zone seasonality fallback
    await runKoppenEtl();

    // 5. Aqueduct — water risk
    await runAqueductEtl();

    // 6. Comtrade — trade origins
    await runComtradeEtl();

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\n=== All connectors completed in ${elapsed}s ===`);
  } catch (err) {
    console.error('Connector pipeline failed:', err);
    throw err;
  }
}

// Run if called directly
if (require.main === module) {
  runAllConnectors()
    .then(() => closePool())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      closePool().then(() => process.exit(1));
    });
}
