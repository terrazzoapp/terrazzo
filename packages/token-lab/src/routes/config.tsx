import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/config')({
  component: Config,
});

function Config() {
  return <>Config</>;
}
