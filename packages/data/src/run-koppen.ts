import { runKoppenEtl } from './connectors/koppen';
import { closePool } from './connectors/db-pool';

runKoppenEtl()
  .then(() => closePool())
  .catch((err) => { console.error(err); closePool().then(() => process.exit(1)); });
