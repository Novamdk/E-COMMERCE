import { Container } from './Container';

/**
 * Vertical rhythm wrapper for interior pages, so every route shares the same
 * top and bottom spacing without repeating the padding classes.
 *
 * @param {object} props
 * @param {'narrow'|'default'|'wide'} [props.width]
 */
export function PageShell({ width = 'default', className, children }) {
  return (
    <Container width={width} className={className ?? 'py-10 sm:py-14'}>
      {children}
    </Container>
  );
}
