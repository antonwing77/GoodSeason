import { runAgribalyseEtl } from './connectors/agribalyse';
import { closePool } from './connectors/db-pool';

runAgribalyseEtl()
  .then(() => closePool())
  .catch((err) => { console.error(err); closePool().then(() => process.exit(1)); });
