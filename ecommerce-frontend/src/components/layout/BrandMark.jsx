import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/Image';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/cn';

const SIZES = {
  sm: 'w-16',
  md: 'w-16 lg:w-[5.5rem]',
  lg: 'w-28',
};

/**
 * The SK Envision monogram logo, doubling as the home link. The artwork is
 * black on transparent; `isInverse` flips it to white for dark surfaces such
 * as the footer.
 *
 * @param {{ size?: 'sm'|'md'|'lg', isInverse?: boolean, className?: string, onClick?: () => void }} props
 */
export function BrandMark({ size = 'md', isInverse = false, className, onClick }) {
  return (
    <Link
      to={ROUTES.HOME}
      onClick={onClick}
      className={cn('inline-block shrink-0', SIZES[size] ?? SIZES.md, className)}
      aria-label="SK Envision — home"
    >
      <Image
        name="brand-mark"
        alt=""
        sizes="7rem"
        ratio="aspect-[400/319]"
        fit="contain"
        priority
        isTransparent
        imgClassName={cn(isInverse && 'invert')}
      />
    </Link>
  );
}
