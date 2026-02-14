import { runComtradeEtl } from './connectors/comtrade';
import { closePool } from './connectors/db-pool';

runComtradeEtl()
  .then(() => closePool())
  .catch((err) => { console.error(err); closePool().then(() => process.exit(1)); });
