/**
 * Navbar & Navigation Module
 * Manages sticky header effects on scroll and responsive interactions.
 */

export function initNavbar() {
  const header = document.querySelector('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('bg-cyber-950/95', 'shadow-lg');
      header.classList.remove('bg-cyber-950/85');
    } else {
      header.classList.add('bg-cyber-950/85');
      header.classList.remove('bg-cyber-950/95', 'shadow-lg');
    }
  }, { passive: true });
}
