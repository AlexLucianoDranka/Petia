import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  noPadding?: boolean;
}

export function Card({ className, interactive, noPadding, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'card rounded-xl',
        !noPadding && 'p-4',
        interactive && 'card-interactive cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('font-semibold text-st-arctic text-sm', className)} {...props}>
      {children}
    </h3>
  );
}
