import { Document, Heading, Pilcrow } from '@terrazzo/icons';
import { OmniBar, OmniBarResult, type OmniBarResultProps } from '@terrazzo/tiles';
import { liteClient } from 'algoliasearch/lite';
import { useState } from 'react';
import { Configure, InstantSearch, useHits } from 'react-instantsearch';
import './SearchBox.css';

const searchClient = liteClient('NV4WV1PJEZ', 'c5678f0920fbec3378a5ae3df0c1f4f5');

type HighlightResult = {
  fullyHighlighted?: boolean;
  matchLevel: 'full' | 'none';
  matchedWords?: string[];
  value: string;
};

interface Hit {
  __position: number;
  _highlightResult?: {
    content?: HighlightResult;
    hierarchy?: Record<'lvl0' | 'lvl1' | 'lvl2' | 'lvl3' | 'lvl4', HighlightResult | undefined>;
  };
  content?: null;
  hierarchy?: Record<'lvl0' | 'lvl1' | 'lvl2' | 'lvl3' | 'lvl4' | 'lvl5' | 'lvl6', string | null>;
  url?: string;
  url_without_anchor?: string;
  objectID: string;
  type?: 'lvl0' | 'lvl1' | 'lvl2' | 'lvl3' | 'lvl4' | 'lvl5' | 'lvl6';
}

const HIT_COMPONENT = {
  lvl1: DocsSearchHitLvl1,
  lvl2: DocsSearchHitLvl2,
  lvl3: DocsSearchHitLvl3,
  lvl4: DocsSearchHitLvl4,
  content: DocsSearchContent,
};

interface DocsSearchHitProps extends OmniBarResultProps {
  hit: Hit;
}

function DocsSearchHit({ hit, ...rest }: DocsSearchHitProps) {
  const HitComponent = HIT_COMPONENT[hit.type];

  return (
    <OmniBarResult key={hit.objectID} {...rest}>
      <a className='tz-searchbox-link' href={hit.url}>
        {HitComponent ? <HitComponent hit={hit} /> : JSON.stringify(hit)}
      </a>
    </OmniBarResult>
  );
}

function DocsSearchHitLvl1({ hit }: { hit: Hit }) {
  return (
    <span className='tz-searchbox-result-pair'>
      <Document className='tz-searchbox-result-icon' />
      <span className='tz-searchbox-result-overflow'>
        <span
          className='tz-searchbox-result-title'
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Algolia-provided
          dangerouslySetInnerHTML={{
            __html: hit._highlightResult?.hierarchy?.lvl1.value ?? hit.hierarchy?.lvl1,
          }}
        />
      </span>
    </span>
  );
}

function DocsSearchHitLvl2({ hit }: { hit: Hit }) {
  return (
    <span className='tz-searchbox-result-pair'>
      <Heading className='tz-searchbox-result-icon' />
      <span className='tz-searchbox-result-overflow'>
        <span
          className='tz-searchbox-result-title'
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Algolia-provided
          dangerouslySetInnerHTML={{
            __html: hit._highlightResult?.hierarchy?.lvl2?.value ?? hit.hierarchy?.lvl2,
          }}
        />
        <span
          className='tz-searchbox-result-desc'
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Algolia-provided
          dangerouslySetInnerHTML={{
            __html: hit._highlightResult?.hierarchy?.lvl1?.value ?? hit.hierarchy?.lvl1,
          }}
        />
      </span>
    </span>
  );
}

function DocsSearchHitLvl3({ hit }: { hit: Hit }) {
  return (
    <span className='tz-searchbox-result-pair'>
      <Heading className='tz-searchbox-result-icon' />
      <span className='tz-searchbox-result-overflow'>
        <span
          className='tz-searchbox-result-title'
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Algolia-provided
          dangerouslySetInnerHTML={{
            __html: hit._highlightResult?.hierarchy?.lvl3?.value ?? hit.hierarchy?.lvl3,
          }}
        />
        <span
          className='tz-searchbox-result-desc'
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Algolia-provided
          dangerouslySetInnerHTML={{
            __html: hit._highlightResult?.hierarchy?.lvl1?.value ?? hit.hierarchy?.lvl1,
          }}
        />
      </span>
    </span>
  );
}

function DocsSearchHitLvl4({ hit }: { hit: Hit }) {
  return (
    <span className='tz-searchbox-result-pair'>
      <Heading className='tz-searchbox-result-icon' />
      <span className='tz-searchbox-result-overflow'>
        <span
          className='tz-searchbox-result-title' // biome-ignore lint/security/noDangerouslySetInnerHtml: Algolia-provided
          dangerouslySetInnerHTML={{
            __html: hit._highlightResult?.hierarchy?.lvl4?.value ?? hit.hierarchy?.lvl4,
          }}
        />
        <span
          className='tz-searchbox-result-desc' // biome-ignore lint/security/noDangerouslySetInnerHtml: Algolia-provided
          dangerouslySetInnerHTML={{
            __html: hit._highlightResult?.hierarchy?.lvl1?.value ?? hit.hierarchy?.lvl1,
          }}
        />
      </span>
    </span>
  );
}

function DocsSearchContent({ hit }: { hit: Hit }) {
  return (
    <span className='tz-searchbox-result-pair'>
      <Pilcrow className='tz-searchbox-result-icon' />
      <span className='tz-searchbox-result-overflow'>
        <span
          className='tz-searchbox-result-title' // biome-ignore lint/security/noDangerouslySetInnerHtml: Algolia-provided
          dangerouslySetInnerHTML={{
            __html: hit._highlightResult?.content?.value,
          }}
        />
        <span
          className='tz-searchbox-result-desc' // biome-ignore lint/security/noDangerouslySetInnerHtml: Algolia-provided
          dangerouslySetInnerHTML={{
            __html: hit._highlightResult?.hierarchy?.lvl1?.value ?? hit.hierarchy?.lvl1,
          }}
        />
      </span>
    </span>
  );
}

function DocsSearchResults() {
  const hits = useHits();
  const [query, setQuery] = useState('');
  const isQuerying = !!query.length;

  return (
    <OmniBar
      aria-label='Search Docs'
      placeholder='Find…'
      keyCommand='/'
      value={query}
      onChange={(evt) => setQuery(evt.currentTarget.value)}
      onEnter={(i) => {
        window.location = hits.hits[i]?.url;
      }}
      resultDescription={
        isQuerying ? (
          <>
            Showing 1–{hits.results.hitsPerPage} out of {hits.results.nbHits}
          </>
        ) : undefined
      }
    >
      <Configure query={query} />
      {isQuerying &&
        hits.hits.map((hit, i) => (
          <DocsSearchHit
            key={hit.objectID}
            hit={hit}
            aria-selected={
              i === 0 // hack just for initial render; will get updated as-needed
            }
          />
        ))}
    </OmniBar>
  );
}

export default function DocsSearch() {
  return (
    <InstantSearch searchClient={searchClient} indexName='terrazzo'>
      <DocsSearchResults />
    </InstantSearch>
  );
}
