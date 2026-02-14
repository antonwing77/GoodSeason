import { runFaoEtl } from './connectors/fao';
import { closePool } from './connectors/db-pool';

runFaoEtl()
  .then(() => closePool())
  .catch((err) => { console.error(err); closePool().then(() => process.exit(1)); });
