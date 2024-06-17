for (const tablist of document.querySelectorAll('[role="tablist"]')) {
  const tabs = tablist.querySelectorAll('[role="tab"]');

  function highlightTab(index) {
    tabs.forEach((tab, i) => {
      if (i === index) {
        tab.setAttribute('aria-selected', 'true');
        document.getElementById(tab.getAttribute('aria-controls'))?.removeAttribute('hidden');
        tab.removeAttribute('tabindex');
        tab.focus();
      } else {
        tab.removeAttribute('aria-selected');
        tab.setAttribute('tabindex', '-1');
        document.getElementById(tab.getAttribute('aria-controls'))?.setAttribute('hidden', 'hidden');
      }
    });
  }

  function getSelected() {
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].getAttribute('aria-selected') === 'true') {
        return i;
      }
    }
    return 0;
  }

  tablist.addEventListener('keydown', (evt) => {
    switch (evt.key) {
      case 'ArrowLeft':
      case 'ArrowUp': {
        evt.preventDefault();
        const selected = getSelected();
        highlightTab(selected === 0 ? tabs.length - 1 : selected - 1);
        break;
      }
      case 'ArrowDown':
      case 'ArrowRight': {
        evt.preventDefault();
        const selected = getSelected();
        highlightTab(selected === tabs.length - 1 ? 0 : selected + 1);
        break;
      }
    }
  });

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => highlightTab(i));
  });
}
