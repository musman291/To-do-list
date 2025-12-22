document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const fullName = fullNameInput.value;
            const email = emailInput.value;
            const password = passwordInput.value;

            if (fullName && email && password) {
                // Simulate a loading state
                const btn = signupForm.querySelector('button[type="submit"]');

                btn.innerText = 'Creating Account...';
                btn.style.opacity = '0.7';
                btn.disabled = true;

                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000); // Small delay for effect
            } else {
                alert('Please fill in all fields');
            }
        });
    }
});
