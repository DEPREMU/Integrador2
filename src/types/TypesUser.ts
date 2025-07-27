export type UserSession = {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: {
    id: string;
    aud: string;
    role: string;
    email: string;
    email_confirmed_at: string;
    phone: string;
    confirmed_at: string;
    last_sign_in_at: string;
    app_metadata: {
      provider: string;
      providers: string[];
    };
    user_metadata: {
      email: string;
      email_verified: boolean;
      phone_verified: boolean;
      sub: string;
    };
    identities: null;
    created_at: string;
    updated_at: string;
    is_anonymous: boolean;
  };
};

export type UserData = {
  id: string;
  email: string;
  name?: string;
  surname?: string;
  phone?: string;
  address?: string;
  birthdate?: string;
};
