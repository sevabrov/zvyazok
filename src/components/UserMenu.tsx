import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

/** Initials for the avatar: first letters of the first two name words, else the
 *  first two characters of the name/email. */
function initialsOf(name: string | undefined, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

/**
 * Avatar button (user initials) with a dropdown showing the signed-in Google
 * account info and a sign-out action. Renders nothing when not authenticated.
 */
export const UserMenu = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  const initials = initialsOf(user.name, user.email);

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-label={user.name?.trim() || user.email}
        className='grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-linear-to-br from-fuchsia-500 to-violet-500 text-xs font-black uppercase tracking-wide text-white shadow-[0_0_22px_rgba(217,70,239,0.16)] transition hover:-translate-y-0.5'
      >
        {initials}
      </button>

      {open && (
        <div
          role='menu'
          className='animate-text-in absolute right-0 top-[calc(100%+0.5rem)] w-56 overflow-hidden rounded-2xl border border-white/15 bg-black/80 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur'
        >
          <div className='flex flex-col gap-0.5 px-4 py-3 text-left'>
            {user.name?.trim() && (
              <p className='truncate text-sm font-black text-white'>{user.name}</p>
            )}
            <p className='truncate text-xs text-white/60'>{user.email}</p>
          </div>
          <div className='h-px bg-white/10' />
          <button
            type='button'
            role='menuitem'
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className='flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-white/80 transition hover:bg-white/10'
          >
            <LogOut className='h-4 w-4 text-[#ff6df2]' aria-hidden='true' />
            {t('ui.auth.signOut')}
          </button>
        </div>
      )}
    </div>
  );
};
