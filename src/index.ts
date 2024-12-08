import fastify from 'fastify';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import {
  AuthenticatorTransportFuture,
  Base64URLString,
  CredentialDeviceType,
  PublicKeyCredentialCreationOptionsJSON,
} from '@simplewebauthn/types';

const server = fastify();

server.get('/ping', async (request, reply) => {
  return 'pong\n';
});

type Passkey = {
  id: Base64URLString;
  publicKey: Uint8Array;
  user: { email: string };
  webAuthnUserID: Base64URLString;
  counter: number;
  deviceType: CredentialDeviceType;
  backedUp: boolean;
  transports?: AuthenticatorTransportFuture[];
};

type UserModel = {
  email: string;
};

// users
const getUserFromDB = (email: UserModel['email']): UserModel => {
  return { email };
};

const userPasskeysStorage: Record<UserModel['email'], Passkey[]> = {};

const getUserPasskeys = (user: UserModel): Passkey[] => {
  return userPasskeysStorage[user.email] || [];
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
  userPasskeysStorage[user.email] = [...(userPasskeysStorage[user.email] || []), passkey];
};

const currentUserRegistrationOptionsStorage: Record<UserModel['email'], PublicKeyCredentialCreationOptionsJSON> = {};

const setCurrentRegistrationOptions = (user: UserModel, options: PublicKeyCredentialCreationOptionsJSON) => {
  currentUserRegistrationOptionsStorage[user.email] = options;
};
const getCurrentRegistrationOptions = (user: UserModel): PublicKeyCredentialCreationOptionsJSON => {
  if (!currentUserRegistrationOptionsStorage[user.email]) {
    throw new Error('No registration options found for user');
  }

  return currentUserRegistrationOptionsStorage[user.email];
};

const saveRegistrationCredentials = (user: UserModel, verifiedRegistrationResponse: VerifiedRegistrationResponse) => {
  const currentOptions: PublicKeyCredentialCreationOptionsJSON = getCurrentRegistrationOptions(user);
  const { registrationInfo } = verifiedRegistrationResponse;

  if (!registrationInfo) {
    throw new Error('No registration info found');
  }

  const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;
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

const currentUserAuthenticationOptionsStorage: Record<UserModel['email'], PublicKeyCredentialRequestOptionsJSON> = {};

const setCurrentAuthenticationOptions = (user: UserModel, options: PublicKeyCredentialRequestOptionsJSON) => {
  currentUserAuthenticationOptionsStorage[user.email] = options;
};

const getCurrentAuthenticationOptions = (user: UserModel): PublicKeyCredentialRequestOptionsJSON => {
  if (!currentUserAuthenticationOptionsStorage[user.email]) {
    throw new Error('No authentication options found for user');
  }

  return currentUserAuthenticationOptionsStorage[user.email];
};

const passkeyCounterStorage: Record<Passkey['id'], number> = {};

const saveUpdatedCounter = (passkey: Passkey, newCounter: number) => {
  passkeyCounterStorage[passkey.id] = newCounter;
};

// registration
const rpName = 'Stuff Control';
const rpID = 'localhost';
const origin = `http://${rpID}:5173`;

server.post('/register', async (req, reply) => {
  const { email } = req.body;
  if (!email) return reply.status(400).send({ error: 'Email is required' });

  const user: UserModel = getUserFromDB(email);
  const userPasskeys: Passkey[] = getUserPasskeys(user);

  const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: email,
    attestationType: 'none',
    excludeCredentials: userPasskeys.map((passkey) => ({
      id: passkey.id,
      transports: passkey.transports,
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
  });

  setCurrentRegistrationOptions(user, options);

  reply.send(options);
});

server.post('/register/verify', async (req, reply) => {
  const { email, credential } = req.body;
  const user: UserModel = getUserFromDB(email);
  if (!user) return reply.status(404).send({ error: 'User not found' });

  const currentOptions: PublicKeyCredentialCreationOptionsJSON = getCurrentRegistrationOptions(user);

  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge: currentOptions.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  if (!verification.verified) return reply.status(400).send({ error: 'Verification failed' });

  saveRegistrationCredentials(user, verification);
  reply.send({ verified: true });
});

// authentication
server.post('/authenticate', async (req, reply) => {
  const { email } = req.body;
  const user: UserModel = getUserFromDB(email);
  if (!user) return reply.status(404).send({ error: 'User not found' });
  const userPasskeys: Passkey[] = getUserPasskeys(user);

  const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
    rpID,
    allowCredentials: userPasskeys.map((passkey) => ({
      id: passkey.id,
      type: passkey.transports,
    })),
  });

  setCurrentAuthenticationOptions(user, options);

  reply.send(options);
});

server.post('/authenticate/verify', async (req, reply) => {
  const { email, credential } = req.body;
  const user: UserModel = getUserFromDB(email);
  if (!user) return reply.status(404).send({ error: 'User not found' });

  const currentOptions: PublicKeyCredentialRequestOptionsJSON = getCurrentAuthenticationOptions(user);
  const passkey: Passkey = getUserPasskey(user, credential.id);

  const verification = await verifyAuthenticationResponse({
    response: credential,
    expectedChallenge: currentOptions.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: passkey.id,
      publicKey: passkey.publicKey,
      counter: passkey.counter,
      transports: passkey.transports,
    },
  });

  if (!verification.verified) return reply.status(400).send({ error: 'Verification failed' });

  const { authenticationInfo } = verification;
  const { newCounter } = authenticationInfo;

  saveUpdatedCounter(passkey, newCounter);

  reply.send({ verified: true });
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
