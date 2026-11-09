import { cn } from '@/lib/cn';

const WIDTHS = {
  narrow: 'max-w-3xl',
  default: 'max-w-7xl',
  wide: 'max-w-[90rem]',
};

/**
 * Horizontal page gutter. The 1rem floor at the smallest sizes is what keeps
 * content off the edge at 360px.
 *
 * @param {object} props
 * @param {'narrow'|'default'|'wide'} [props.width]
 * @param {import('react').ElementType} [props.as]
 */
export function Container({ as: Tag = 'div', width = 'default', className, children, ...rest }) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-10',
        WIDTHS[width] ?? WIDTHS.default,
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
