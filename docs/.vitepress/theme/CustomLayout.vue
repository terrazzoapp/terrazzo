<script setup>
import DefaultTheme from 'vitepress/theme';
const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #layout-top
      ><a class="banner" href="https://terrazzo.app">
        <svg
          class="banner-logo"
          fill="none"
          viewBox="0 0 85 94"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <path
            d="m84.28 87.4941s0 6.4012-7.3157 6.4012h-69.64865c-7.31565 0-7.31565-6.4012-7.31565-6.4012z"
            fill="#fff"
          />
          <g fill="currentColor">
            <path
              d="m37.3192.104736h-36.381297c-.515846 0-.937903.422057-.937903.937904v36.38126c0 .8347 1.00825 1.2521 1.59913.6612l36.38597-36.38124c.5909-.59088.1735-1.599124-.6612-1.599124z"
            />
            <path
              d="m84.2798 37.424v-36.38124c0-.515845-.4221-.937902-.9379-.937902h-36.3813c-.8347 0-1.2521 1.008242-.6612 1.599122l36.3812 36.38132c.5909.5908 1.5992.1735 1.5992-.6613z"
            />
            <path
              d="m46.9606 83.053h36.3813c.5158 0 .9379-.4221.9379-.9379v-36.3813c0-.8347-1.0083-1.2521-1.5992-.6612l-36.3812 36.3812c-.5909.5909-.1735 1.5992.6612 1.5992z"
            />
            <path
              d="m37.3192 83.053h-36.381297c-.515846 0-.937903-.4221-.937903-.9379v-36.3813c0-.8347 1.00825-1.2521 1.59913-.6612l36.38127 36.3812c.5909.5909.1735 1.5992-.6612 1.5992z"
            />
          </g>
        </svg>
        Try out the Cobalt 2.0 beta →
      </a></template
    >
  </Layout>
</template>

<style scoped>
.banner {
  --tz-brand: color(
    srgb 0.7411764705882353 0.9333333333333333 0.38823529411764707
  );
  background-color: var(--tz-brand);
  color: color(srgb 0 0 0);
  display: flex;
  font-size: 0.875rem;
  font-weight: 500;
  height: var(--banner-height);
  line-height: 1;
  justify-content: center;
  align-items: center;
  min-height: 1rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  text-decoration: none;
  z-index: 100;
}
.banner:hover .banner-pseudo-link {
  background-color: color(srgb 1 1 1/0.25);
}
.banner-logo {
  margin-top: 0.125rem;
  margin-right: 0.5rem;
  line-height: 1;
  height: 1rem;
  width: 1rem;
}
</style>

<style>
:root {
  --banner-height: 2rem;
  --vp-layout-top-height: 2rem; /* Vitepress’ variable that allows for banners */
}
/** tighten up nav a scootch */
.Layout {
  --vp-nav-height: 56px;
}
</style>
