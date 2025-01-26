import { UserModel } from '../types/user-model';
import { Passkey } from '../types/passkey';

const userPasskeysStorage: Record<UserModel['username'], Passkey[]> = {};

const getUserPasskeys = (user: UserModel): Passkey[] => {
  return userPasskeysStorage[user.username] || [];
};

const getUserPasskey = (user: UserModel, passkeyID: Passkey['id']): Passkey => {
  const passkeys = getUserPasskeys(user);
  const passkey = passkeys.find((passkey) => passkey.id === passkeyID);
  if (!passkey) {
    throw new Error('Passkey not found');
  }
  return passkey;
};

const saveNewPasskeyInDB = (user: UserModel, passkey: Passkey) => {
  userPasskeysStorage[user.username] = [
    ...(userPasskeysStorage[user.username] || []),
    passkey,
  ];
};

export default userPasskeysStorage;
export { getUserPasskeys, getUserPasskey, saveNewPasskeyInDB };
