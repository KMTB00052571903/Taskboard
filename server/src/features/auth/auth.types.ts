export interface User {
  id: string;
  email: string;
  user_name: string;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface UserWithToken {
  user: User;
  token: string;
}

export interface AuthenticateUserDTO {
  email: string;
  password: string;
}
