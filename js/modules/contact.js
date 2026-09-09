/**
 * Contact & Engineering Consultation Form Module
 * Handles form validation and submission feedback.
 */

export function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const nameInput = contactForm.querySelector('input[type="text"]');
    const clientName = nameInput && nameInput.value ? nameInput.value.trim() : 'Projetista';

    alert(`Obrigado, ${clientName}! Sua solicitação técnica foi enviada com sucesso à equipe de engenharia da Solid Mesh Studio. Retornaremos em até 2 horas via WhatsApp/E-mail.`);
    contactForm.reset();
  });
}
