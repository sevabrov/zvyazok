import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from './AuthContext';

/**
 * Renders the official Google sign-in button. On success we get a Google ID
 * Token (`credential`) which we hand to the backend via the auth context.
 */
export const GoogleLoginButton = () => {
  const { loginWithGoogle } = useAuth();
  return (
    <GoogleLogin
      onSuccess={(cred) => {
        if (cred.credential) loginWithGoogle(cred.credential);
      }}
      onError={() => console.error('Google login failed')}
    />
  );
};
