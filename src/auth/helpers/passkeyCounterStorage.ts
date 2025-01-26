import { Passkey } from '../types/passkey';

const passkeyCounterStorage: Record<Passkey['id'], number> = {};

const saveUpdatedCounter = (passkey: Passkey, newCounter: number) => {
  passkeyCounterStorage[passkey.id] = newCounter;
};

export default passkeyCounterStorage;
export { saveUpdatedCounter };
