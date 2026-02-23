import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/outputs')({
  component: Outputs,
});

function Outputs() {
  return <>Outputs</>;
}
