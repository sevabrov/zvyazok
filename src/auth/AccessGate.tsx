import { useTranslation } from 'react-i18next';
import { Lock, Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { GoogleLoginButton } from './GoogleLoginButton';

/**
 * Centre-screen content shown whenever the game is NOT available: before login,
 * while logging in, on auth errors, and when the (authenticated) user has not
 * paid. The game itself renders only once status === 'authed' && paid.
 */
export const AccessGate = () => {
  const { t } = useTranslation();
  const { status, logout } = useAuth();

  if (status === 'loading') {
    return (
      <div className='animate-text-in flex flex-col items-center gap-4 text-center'>
        <Loader2 className='h-10 w-10 animate-spin text-[#ff6df2]' aria-hidden='true' />
        <p className='text-sm text-white/70'>{t('ui.auth.loading')}</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className='animate-text-in flex flex-col items-center gap-5 text-center'>
        <p className='text-sm text-white/70'>{t('ui.auth.error')}</p>
        <GoogleLoginButton />
      </div>
    );
  }

  // status === 'authed' but not paid → access locked screen.
  if (status === 'authed') {
    return (
      <div className='animate-text-in flex w-full max-w-sm flex-col items-center gap-6 px-2 text-center'>
        <div className='grid h-24 w-24 place-items-center rounded-[28px] bg-linear-to-br from-fuchsia-500 to-violet-500 shadow-[0_20px_70px_rgba(139,92,246,0.35)] sm:h-28 sm:w-28'>
          <Lock className='h-12 w-12 sm:h-14 sm:w-14' strokeWidth={2.4} aria-hidden='true' />
        </div>
        <div className='flex flex-col gap-2'>
          <p className='text-[clamp(1.3rem,5.5vw,1.7rem)] leading-[1.12] font-black tracking-[-0.03em]'>
            {t('ui.auth.notPaidTitle')}
          </p>
          <p className='text-sm text-white/70'>{t('ui.auth.notPaidDescription')}</p>
        </div>
        <button
          type='button'
          onClick={logout}
          className='text-xs font-bold text-white/45 underline-offset-4 transition hover:text-white/70 hover:underline'
        >
          {t('ui.auth.signOut')}
        </button>
      </div>
    );
  }

  // status === 'idle' → invite to sign in.
  return (
    <div className='animate-text-in flex flex-col items-center gap-6 text-center'>
      <p className='max-w-xs text-sm leading-6 text-white/70'>
        {t('ui.auth.signInPrompt')}
      </p>
      <GoogleLoginButton />
    </div>
  );
};
