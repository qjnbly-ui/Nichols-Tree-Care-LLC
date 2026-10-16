export {};
(() => {
  const button = document.querySelector<HTMLButtonElement>('.mobile-menu-button');
  const menu = document.querySelector<HTMLDialogElement>('#mobile-pages');
  if (!button || !menu) return;
  const close = () => menu.close();
  button.addEventListener('click', () => {
    menu.showModal();
    button.setAttribute('aria-expanded', 'true');
    document.body.classList.add('mobile-navigation-open');
  });
  menu.querySelector<HTMLButtonElement>('.mobile-menu-close')!.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  menu.addEventListener('close', () => {
    button.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-navigation-open');
    button.focus();
  });
  matchMedia('(min-width: 801px)').addEventListener('change', event => {
    if (event.matches && menu.open) close();
  });
})();
