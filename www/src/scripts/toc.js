const content = document.querySelector('.md-content');

const THRESHOLD_Y = 0.1; // % of window screen to accept the next heading (0.1 = 10%)

let currentI = 0;
let ys = [];

function debounce(cb, timeout) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => {
      cb(...args);
    }, timeout);
  };
}

function calculateYs() {
  ys = [];
  for (const el of content.querySelectorAll('h2,h3')) {
    // skip over ToC heading
    if (el.parentElement.classList.contains('toc')) {
      continue;
    }
    ys.push(window.scrollY + el.getBoundingClientRect().y);
  }
}

function highlightNavItem(index = 0) {
  content.querySelectorAll('.toc a').forEach((el, i) => {
    if (i === index) {
      el.setAttribute('aria-current', 'location');
    } else {
      el.removeAttribute('aria-current');
    }
  });
}

calculateYs();
highlightNavItem();
addEventListener('scroll', () => {
  let nextI = 0;
  if (window.scrollY >= 0.3 * window.innerHeight) {
    for (let i = 1; i < ys.length; i++) {
      if (window.scrollY + THRESHOLD_Y * window.innerHeight < ys[i]) {
        break;
      }
      nextI = i;
    }
  }
  if (nextI !== currentI) {
    currentI = nextI;
    highlightNavItem(currentI);
  }
});

addEventListener(
  'resize',
  debounce(() => calculateYs(), 50),
);
