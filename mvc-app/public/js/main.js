// Auto-dismiss flash alerts after 5 seconds (not the over-budget banner)
document.querySelectorAll('.alert-error, .alert-success').forEach(el => {
  setTimeout(() => el.style.display = 'none', 5000);
});

// Hamburger menu toggle
const navToggle = document.getElementById('navToggle');
const navbar = document.getElementById('mainNavbar');
if (navToggle && navbar) {
  navToggle.addEventListener('click', () => navbar.classList.toggle('nav-open'));
}

// Budget end-date must be after start-date
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
if (startDate && endDate) {
  startDate.addEventListener('change', () => {
    if (endDate.value && endDate.value < startDate.value) endDate.value = '';
    endDate.min = startDate.value;
  });
}
