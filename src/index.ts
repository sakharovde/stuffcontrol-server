import fastify from 'fastify';
import cors from '@fastify/cors';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  Base64URLString,
  CredentialDeviceType,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/types';

const server = fastify({
  logger: true,
});

server.register(cors);

server.get('/ping', async (request, reply) => {
  return 'pong\n';
});

type Passkey = {
  id: Base64URLString;
  publicKey: Uint8Array;
  user: { username: string };
  webAuthnUserID: Base64URLString;
  counter: number;
  deviceType: CredentialDeviceType;
  backedUp: boolean;
  transports?: AuthenticatorTransportFuture[];
};

type UserModel = {
  username: string;
};

// users
const getUserFromDB = (username: UserModel['username']): UserModel => {
  return { username };
};

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

const passkeyCounterStorage: Record<Passkey['id'], number> = {};

const saveUpdatedCounter = (passkey: Passkey, newCounter: number) => {
  passkeyCounterStorage[passkey.id] = newCounter;
};

// registration
const rpName = 'Stuff Control';

server.post<{
  Body: { username: string };
  Reply: PublicKeyCredentialCreationOptionsJSON | { error: string };
}>('/api/register', async (req, reply) => {
  const { username } = req.body;
  if (!username) return reply.status(400).send({ error: 'Email is required' });

  const user: UserModel = getUserFromDB(username);
  const userPasskeys: Passkey[] = getUserPasskeys(user);

  const options: PublicKeyCredentialCreationOptionsJSON =
    await generateRegistrationOptions({
      rpName,
      rpID: String(process.env.CLIENT_HOST),
      userName: username,
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

server.post<{
  Body: {
    username: string;
    credential: RegistrationResponseJSON;
  };
  Reply: { verified: boolean } | { error: string };
}>('/api/register/verify', async (req, reply) => {
  const { username, credential } = req.body;
  const user: UserModel = getUserFromDB(username);
  if (!user) return reply.status(404).send({ error: 'User not found' });

  const currentOptions: PublicKeyCredentialCreationOptionsJSON =
    getCurrentRegistrationOptions(user);

  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge: currentOptions.challenge,
    expectedOrigin: String(req.headers.origin),
    expectedRPID: String(process.env.CLIENT_HOST),
  });

  if (!verification.verified)
    return reply.status(400).send({ error: 'Verification failed' });

  saveRegistrationCredentials(user, verification);
  reply.send({ verified: true });
});

// authentication
server.post<{
  Body: { username: string };
  Reply: PublicKeyCredentialRequestOptionsJSON | { error: string };
}>('/api/authenticate', async (req, reply) => {
  const { username } = req.body;
  const user: UserModel = getUserFromDB(username);
  if (!user) return reply.status(404).send({ error: 'User not found' });
  const userPasskeys: Passkey[] = getUserPasskeys(user);

  const options: PublicKeyCredentialRequestOptionsJSON =
    await generateAuthenticationOptions({
      rpID: String(process.env.CLIENT_HOST),
      allowCredentials: userPasskeys.map((passkey) => ({
        id: passkey.id,
        type: passkey.transports,
      })),
    });

  setCurrentAuthenticationOptions(user, options);

  reply.send(options);
});

server.post<{
  Body: { username: string; credential: AuthenticationResponseJSON };
  Reply: { verified: boolean } | { error: string };
}>('/api/authenticate/verify', async (req, reply) => {
  const { username, credential } = req.body;
  const user: UserModel = getUserFromDB(username);
  if (!user) return reply.status(404).send({ error: 'User not found' });

  const currentOptions: PublicKeyCredentialRequestOptionsJSON =
    getCurrentAuthenticationOptions(user);
  const passkey: Passkey = getUserPasskey(user, credential.id);

  const verification = await verifyAuthenticationResponse({
    response: credential,
    expectedChallenge: currentOptions.challenge,
    expectedOrigin: origin,
    expectedRPID: String(process.env.CLIENT_HOST),
    credential: {
      id: passkey.id,
      publicKey: passkey.publicKey,
      counter: passkey.counter,
      transports: passkey.transports,
    },
  });

  if (!verification.verified)
    return reply.status(400).send({ error: 'Verification failed' });

  const { authenticationInfo } = verification;
  const { newCounter } = authenticationInfo;

  saveUpdatedCounter(passkey, newCounter);

  reply.send({ verified: true });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const host = 'RENDER' in process.env ? `0.0.0.0` : `localhost`;

server.listen({ host: host, port: port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
