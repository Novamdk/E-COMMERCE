/**
 * Content that screen readers announce but sighted users do not see.
 * @param {{ as?: import('react').ElementType, children: import('react').ReactNode }} props
 */
export function VisuallyHidden({ as: Tag = 'span', children, ...rest }) {
  return (
    <Tag className="sr-only" {...rest}>
      {children}
    </Tag>
  );
}
