import { RouteGenericInterface, RouteHandler } from 'fastify';
import {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/types';
import { UserModel } from '../types/user-model';
import getUserFromDB from '../helpers/getUserFromDB';
import { getCurrentRegistrationOptions } from '../helpers/currentUserRegistrationOptionsStorage';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import saveRegistrationCredentials from '../helpers/saveRegistrationCredentials';

interface VerifyRegistrationRoute extends RouteGenericInterface {
  Body: {
    username: string;
    credential: RegistrationResponseJSON;
  };
  Reply: { verified: boolean } | { error: string };
}

const handler: RouteHandler<VerifyRegistrationRoute> = async (req, reply) => {
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
};

export default handler;
