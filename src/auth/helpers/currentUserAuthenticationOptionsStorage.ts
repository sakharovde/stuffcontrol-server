import { UserModel } from '../types/user-model';
import { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';

const currentUserAuthenticationOptionsStorage: Record<
  UserModel['username'],
  PublicKeyCredentialRequestOptionsJSON
> = {};

const setCurrentAuthenticationOptions = (
  user: UserModel,
  options: PublicKeyCredentialRequestOptionsJSON
) => {
  currentUserAuthenticationOptionsStorage[user.username] = options;
};

const getCurrentAuthenticationOptions = (
  user: UserModel
): PublicKeyCredentialRequestOptionsJSON => {
  if (!currentUserAuthenticationOptionsStorage[user.username]) {
    throw new Error('No authentication options found for user');
  }

  return currentUserAuthenticationOptionsStorage[user.username];
};

export { setCurrentAuthenticationOptions, getCurrentAuthenticationOptions };
export default currentUserAuthenticationOptionsStorage;
