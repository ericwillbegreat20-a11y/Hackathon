/* Campusline deliberately unstable layout. Visual ordering only: never detach nodes,
   reset form inputs, replace HTML, or change application state. */
(() => {
  'use strict';
  const app = document.getElementById('app');
  if (!app) return;
  let cycle = 0;
  const zh = () => !!window.__campusLang;
  const selectors = ['.page', '.dash', '.course-grid', '.secondary-grid', '.dash-split', '.search-hub'];
  function shift() {
    cycle++;
    for (const selector of selectors) {
      app.querySelectorAll(selector).forEach((parent, groupIndex) => {
        const children = Array.from(parent.children);
        if (children.length < 2) return;
        parent.classList.add('layout-unstable');
        // Rotate all visible blocks; the content and click handlers stay untouched.
        const offset = (cycle + groupIndex) % children.length;
        children.forEach((child, index) => {
          child.style.order = String((index + offset) % children.length);
        });
      });
    }
    const indicator = document.getElementById('layout-shift-status');
    if (indicator) indicator.textContent = zh() ? `布局已重排 • 版本 ${cycle}` : `Layout rearranged • revision ${cycle}`;
  }
  function init() {
    if (!document.getElementById('layout-shift-status')) {
      const status = document.createElement('div');
      status.id = 'layout-shift-status';
      status.setAttribute('aria-hidden','true');
      status.textContent = zh() ? '布局校准中' : 'Layout recalibration active';
      document.body.appendChild(status);
    }
    shift();
    setInterval(() => {
      if (document.hidden) return;
      shift();
    }, 5500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
