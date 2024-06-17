import { OmniBar, OmniBarResult } from '@terrazzo/tiles';

export default {
  title: 'Components/Form/OmniBar',
  component: OmniBar,
  parameters: {
    // layout: 'centered',
  },
};

export const Overview = {
  render() {
    return (
      <OmniBar resultDescription={<>Results 1–3 of 3.</>}>
        <OmniBarResult>
          <h1>Search</h1>
          <p>Result blah blah blah</p>
        </OmniBarResult>
        <OmniBarResult>
          <h1>Search</h1>
          <p>Result blah blah blah</p>
        </OmniBarResult>
        <OmniBarResult>
          <h1>Search</h1>
          <p>Result blah blah blah</p>
        </OmniBarResult>
      </OmniBar>
    );
  },
};
