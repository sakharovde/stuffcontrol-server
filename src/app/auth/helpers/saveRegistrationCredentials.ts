import { UserModel } from '../types/user-model';
import { VerifiedRegistrationResponse } from '@simplewebauthn/server';
import { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
import { Passkey } from '../types/passkey';
import { saveNewPasskeyInDB } from './userPasskeysStorage';
import { getCurrentRegistrationOptions } from './currentUserRegistrationOptionsStorage';

const saveRegistrationCredentials = (
  user: UserModel,
  verifiedRegistrationResponse: VerifiedRegistrationResponse
) => {
  const currentOptions: PublicKeyCredentialCreationOptionsJSON =
    getCurrentRegistrationOptions(user);
  const { registrationInfo } = verifiedRegistrationResponse;

  if (!registrationInfo) {
    throw new Error('No registration info found');
  }

  const { credential, credentialDeviceType, credentialBackedUp } =
    registrationInfo;
  const newPasskey: Passkey = {
    // `user` here is from Step 2
    user,
    // Created by `generateRegistrationOptions()` in Step 1
    webAuthnUserID: currentOptions.user.id,
    // A unique identifier for the credential
    id: credential.id,
    // The public key bytes, used for subsequent authentication signature verification
    publicKey: credential.publicKey,
    // The number of times the authenticator has been used on this site so far
    counter: credential.counter,
    // How the browser can talk with this credential's authenticator
    transports: credential.transports,
    // Whether the passkey is single-device or multi-device
    deviceType: credentialDeviceType,
    // Whether the passkey has been backed up in some way
    backedUp: credentialBackedUp,
  };

  saveNewPasskeyInDB(user, newPasskey);
};

export default saveRegistrationCredentials;
