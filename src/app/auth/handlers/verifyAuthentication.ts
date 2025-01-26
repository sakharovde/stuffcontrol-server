import { RouteGenericInterface, RouteHandler } from 'fastify';
import {
  AuthenticationResponseJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types';
import { UserModel } from '../types/user-model';
import getUserFromDB from '../helpers/getUserFromDB';
import { getCurrentAuthenticationOptions } from '../helpers/currentUserAuthenticationOptionsStorage';
import { Passkey } from '../types/passkey';
import { getUserPasskey } from '../helpers/userPasskeysStorage';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { saveUpdatedCounter } from '../helpers/passkeyCounterStorage';

interface VerifyAuthenticationRoute extends RouteGenericInterface {
  Body: { username: string; credential: AuthenticationResponseJSON };
  Reply: { verified: boolean } | { error: string };
}

const handler: RouteHandler<VerifyAuthenticationRoute> = async (req, reply) => {
  const { username, credential } = req.body;
  const user: UserModel = getUserFromDB(username);
  if (!user) return reply.status(404).send({ error: 'User not found' });

  const currentOptions: PublicKeyCredentialRequestOptionsJSON =
    getCurrentAuthenticationOptions(user);
  const passkey: Passkey = getUserPasskey(user, credential.id);

  const verification = await verifyAuthenticationResponse({
    response: credential,
    expectedChallenge: currentOptions.challenge,
    expectedOrigin: String(req.headers.origin),
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
};

export default handler;
