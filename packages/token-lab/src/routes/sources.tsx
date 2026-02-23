import { createFileRoute, useRouter } from '@tanstack/react-router';

export const Route = createFileRoute('/sources')({
  component: Sources,
});

function Sources() {
  return <>Sources</>;
}
