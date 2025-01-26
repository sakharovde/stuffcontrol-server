import { RouteGenericInterface, RouteHandler } from 'fastify';
import { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';
import { UserModel } from '../types/user-model';
import getUserFromDB from '../helpers/getUserFromDB';
import { Passkey } from '../types/passkey';
import { getUserPasskeys } from '../helpers/userPasskeysStorage';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { setCurrentAuthenticationOptions } from '../helpers/currentUserAuthenticationOptionsStorage';

interface AuthenticationRoute extends RouteGenericInterface {
  Body: { username: string };
  Reply: PublicKeyCredentialRequestOptionsJSON | { error: string };
}

const handler: RouteHandler<AuthenticationRoute> = async (req, reply) => {
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
};

export default handler;
