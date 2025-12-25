document.addEventListener('DOMContentLoaded', () => {
	const loginForm = document.getElementById('loginForm');
	const loginEmailInput = document.getElementById('email');
	const loginPasswordInput = document.getElementById('password');

	if (loginForm) {
		loginForm.addEventListener('submit', (e) => {
			e.preventDefault();

			const email = loginEmailInput.value;
			const password = loginPasswordInput.value;

			if (email && password) {
				// Simulate a loading state
				const btn = loginForm.querySelector('button[type="submit"]');

				btn.innerText = 'Logging in...';
				btn.style.opacity = '0.7';
				btn.disabled = true;

				setTimeout(() => {
					window.location.href = 'main.html';
				}, 800); // Small delay for effect
			} else {
				alert('Please fill in all fields');
			}
		});
	}
});
