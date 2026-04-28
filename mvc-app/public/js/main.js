// Auto-dismiss alerts after 5 seconds
document.querySelectorAll('.alert').forEach(el => {
  setTimeout(() => el.style.display = 'none', 5000);
});

// Budget end-date must be after start-date
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
if (startDate && endDate) {
  startDate.addEventListener('change', () => {
    if (endDate.value && endDate.value < startDate.value) endDate.value = '';
    endDate.min = startDate.value;
  });
}
