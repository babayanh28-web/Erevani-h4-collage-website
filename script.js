AOS.init({
    duration: 1000,
    once: true
});
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});
backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
document.getElementById('applyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Շնորհակալություն դիմելու համար: Մենք կկապնվենք Ձեզ հետ մոտակա ժամերին:');
    bootstrap.Modal.getInstance(document.getElementById('applyModal')).hide();
    this.reset();
});