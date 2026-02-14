import { runAqueductEtl } from './connectors/aqueduct';
import { closePool } from './connectors/db-pool';

runAqueductEtl()
  .then(() => closePool())
  .catch((err) => { console.error(err); closePool().then(() => process.exit(1)); });
