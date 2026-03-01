import type React from 'react';
import { type Page, useRouter } from '../hooks/router.js';

export interface LinkProps extends Omit<React.HTMLAttributes<HTMLAnchorElement>, 'href'> {
  page: Page;
}

export default function Link({ page, ...props }: LinkProps) {
  const { search, setPage } = useRouter();

  return (
    <a
      {...props}
      href={search.toString()}
      onClick={(e) => {
        props.onClick?.(e);
        setPage(page);
        e.preventDefault();
      }}
    />
  );
}
