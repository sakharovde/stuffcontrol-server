import { UserModel } from '../types/user-model';
import { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';

const currentUserRegistrationOptionsStorage: Record<
  UserModel['username'],
  PublicKeyCredentialCreationOptionsJSON
> = {};

const setCurrentRegistrationOptions = (
  user: UserModel,
  options: PublicKeyCredentialCreationOptionsJSON
) => {
  currentUserRegistrationOptionsStorage[user.username] = options;
};

const getCurrentRegistrationOptions = (
  user: UserModel
): PublicKeyCredentialCreationOptionsJSON => {
  if (!currentUserRegistrationOptionsStorage[user.username]) {
    throw new Error('No registration options found for user');
  }

  return currentUserRegistrationOptionsStorage[user.username];
};

export { setCurrentRegistrationOptions, getCurrentRegistrationOptions };
export default currentUserRegistrationOptionsStorage;
