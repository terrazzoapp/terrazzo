import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/linting')({
  component: Linting,
});

function Linting() {
  return <>Linting</>;
}
