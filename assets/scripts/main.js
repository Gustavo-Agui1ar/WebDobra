document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  const menuIcon = menuToggle?.querySelector('i');

  if (menuToggle && mainNav && menuIcon) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      
      // Atualiza acessibilidade
      menuToggle.setAttribute('aria-expanded', isOpen);
      menuToggle.setAttribute(
        'aria-label',
        isOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'
      );

     menuIcon.className = `fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'}`;

    });
  }
});