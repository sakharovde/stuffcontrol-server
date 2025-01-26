import { AuthenticatorTransportFuture, Base64URLString, CredentialDeviceType } from '@simplewebauthn/types';

export type Passkey = {
  id: Base64URLString;
  publicKey: Uint8Array;
  user: { username: string };
  webAuthnUserID: Base64URLString;
  counter: number;
  deviceType: CredentialDeviceType;
  backedUp: boolean;
  transports?: AuthenticatorTransportFuture[];
};
