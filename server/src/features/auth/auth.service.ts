import { AuthenticateUserDTO, User, UserWithPassword, UserWithToken } from './auth.types';
import Boom from '@hapi/boom';
import { db } from '../../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config';

const getUserWithPasswordByEmail = async (
  email: string
): Promise<UserWithPassword | null> => {
  const result = await db.query<UserWithPassword>(
    'SELECT id, email, user_name, password FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

const generateToken = (user: User): string => {
  return jwt.sign({ id: user.id, email: user.email, user_name: user.user_name }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const authenticateUserService = async (
  credentials: AuthenticateUserDTO
): Promise<UserWithToken> => {
  const user = await getUserWithPasswordByEmail(credentials.email);

  if (!user) {
    throw Boom.unauthorized('Credenciales inválidas');
  }

  const valid = await bcrypt.compare(credentials.password, user.password);

  if (!valid) {
    throw Boom.unauthorized('Credenciales inválidas');
  }

  const { password: _password, ...userWithoutPassword } = user;
  const token = generateToken(userWithoutPassword);

  return { user: userWithoutPassword, token };
};
