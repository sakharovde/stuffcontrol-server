import {
  FastifyInstance,
  RouteGenericInterface,
  RouteHandler,
  RouteOptions,
} from 'fastify';
import { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
import { UserModel } from '../types/user-model';
import getUserFromDB from '../helpers/getUserFromDB';
import { Passkey } from '../types/passkey';
import { getUserPasskeys } from '../helpers/userPasskeysStorage';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { setCurrentRegistrationOptions } from '../helpers/currentUserRegistrationOptionsStorage';
import rpName from '../constants/rp-name';

interface RegistrationRoute extends RouteGenericInterface {
  Body: { username: string };
  Reply: PublicKeyCredentialCreationOptionsJSON | { error: string };
}

const handler: RouteHandler<RegistrationRoute> = async (req, reply) => {
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
};

export default handler;
