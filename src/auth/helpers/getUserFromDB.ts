import { UserModel } from '../types/user-model';

export default (username: UserModel['username']): UserModel => {
  return { username };
};
