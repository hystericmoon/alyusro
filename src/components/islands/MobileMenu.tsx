import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { NavGroup, NavLink } from '@/lib/nav';

type Props = {
  groups: NavGroup[];
  login: NavLink;
  register: NavLink;
  currentPath?: string;
};

const MenuIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M2.5 4.5h13M2.5 9h13M2.5 13.5h13" />
  </svg>
);

const CloseIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M4 4l10 10M14 4 4 14" />
  </svg>
);

/** Phone and tablet menu. Hydrated only below the desktop breakpoint. */
export default function MobileMenu({ groups, login, register, currentPath }: Props) {
  return (
    <Sheet>
      <SheetTrigger className="inline-flex min-h-44 cursor-pointer items-center gap-8 rounded-sm border border-ink bg-white px-14 font-body text-16 font-bold text-ink">
        <MenuIcon />
        Menu
      </SheetTrigger>
      <SheetContent>
        <div className="flex items-center justify-between gap-16 border-b border-rule px-20 py-12">
          <SheetTitle className="text-27 font-semibold leading-none">Menu</SheetTitle>
          <SheetClose className="inline-flex min-h-44 min-w-44 cursor-pointer items-center justify-center gap-6 rounded-sm border-0 bg-transparent px-8 font-body text-16 font-medium text-ink">
            <CloseIcon />
            Tutup
          </SheetClose>
        </div>
        <nav aria-label="Menu utama" className="flex flex-col gap-24 px-20 py-24">
          {groups.map((g) => (
            <section key={g.label} className="flex flex-col">
              <h3 className="m-0 mb-4 text-15 font-bold text-ink">{g.label}</h3>
              <ul className="m-0 list-none p-0">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      aria-current={currentPath === l.href ? 'page' : undefined}
                      className="flex min-h-44 items-center justify-between gap-12 border-b border-rule text-17 font-medium text-ink no-underline hover:underline"
                    >
                      <span>{l.label}</span>
                      {l.note && <span className="text-14 font-normal text-muted">{l.note}</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-12 border-t border-rule px-20 pb-32 pt-20">
          <a
            href={register.href}
            className="inline-flex min-h-48 items-center justify-center rounded-sm bg-lapis px-22 text-16 font-bold text-white no-underline hover:text-white"
          >
            {register.label}
          </a>
          <a
            href={login.href}
            className="inline-flex min-h-44 items-center justify-center text-16 font-medium text-ink underline-offset-4"
          >
            {login.label}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
