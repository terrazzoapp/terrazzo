import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/output')({
  component: Output,
});

function Output() {
  return <>Output</>;
}
