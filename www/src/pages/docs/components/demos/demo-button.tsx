import { Button, Demo } from '@terrazzo/tiles';

export default function DemoButtonDemo() {
  return (
    <Demo
      code={
        /* tsx */ `import { Button, Demo } from '@terrazzo/tiles';

export default function MyComponent() {
  return (
    <Demo code={
      /* tsx */ \`import { Button } from '@terrazzo/tiles';

<Button variant="primary">Save</Button>\`}>
      <Button variant="primary">Save</Button>
    </Demo>
  );
}`
      }
    >
      <Button variant='primary'>Save</Button>
    </Demo>
  );
}
