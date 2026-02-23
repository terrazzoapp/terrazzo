import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/resolver')({
  component: Resolver,
});

function Resolver() {
  return <>Resolver</>;
}
