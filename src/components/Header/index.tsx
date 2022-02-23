import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './header.module.scss';

export default function Header() {
  const router = useRouter();

  const className = router?.asPath === '/' ? styles.headerHome : styles.header;

  return (
    <header className={className}>
        <Link href={'/'}>
          <img src="/images/Logo.svg" alt="logo" />
        </Link>
    </header>
  );
}
