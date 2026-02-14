import { runOwidEtl } from './connectors/owid';
import { closePool } from './connectors/db-pool';

runOwidEtl()
  .then(() => closePool())
  .catch((err) => { console.error(err); closePool().then(() => process.exit(1)); });
