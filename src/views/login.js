

import { findUser } from '../api.js';
import { saveSession } from '../auth.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';

export function renderLogin(container) {
  container.innerHTML = `
    <div class="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col">
      <main class="flex-grow flex items-center justify-center px-gutter py-xxl">
        <div class="w-full max-w-[440px] space-y-xl">

          <div class="text-center space-y-md">
            <h1 class="font-headline-md text-headline-md font-bold text-primary tracking-tight">Riwiflow</h1>
            <p class="font-body-md text-body-md text-on-surface-variant">Sign in to your professional workspace</p>
          </div>

          <div class="bg-surface-container-lowest border border-outline-variant p-xl rounded-xl space-y-lg">
            <form id="loginForm" class="space-y-lg">

              <div id="login-error" class="hidden bg-error-container text-on-error-container px-md py-sm rounded-lg font-body-sm text-body-sm flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]" style="font-variation-settings:'FILL' 1">error</span>
                <span id="login-error-msg">Invalid email or password.</span>
              </div>

              <div class="space-y-sm">
                <label class="font-label-md text-label-md text-on-surface" for="email">Email address</label>
                <input id="email" type="email" placeholder="name@company.com" required
                  class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring placeholder:text-outline" />
              </div>

              <div class="space-y-sm">
                <label class="font-label-md text-label-md text-on-surface" for="password">Password</label>
                <input id="password" type="password" placeholder="••••••••" required
                  class="w-full px-md py-md bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface input-focus-ring placeholder:text-outline" />
              </div>

              <div class="pt-sm">
                <button id="login-btn" type="submit"
                  class="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-md px-lg rounded-lg flex items-center justify-center gap-sm active:scale-[0.98] transition-all">
                  <span id="login-btn-text">Login</span>
                  <span id="login-btn-icon" class="material-symbols-outlined text-[18px]">arrow_forward</span>
                  <span id="login-spinner" class="hidden w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                </button>
              </div>
            </form>

            <div class="relative py-sm">
              <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-outline-variant"></div></div>
              <div class="relative flex justify-center">
                <span class="bg-surface-container-lowest px-md text-outline font-label-sm uppercase tracking-widest">or continue with</span>
              </div>
            </div>

            <button class="w-full flex items-center justify-center gap-md py-md border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors">
              <img alt="Google" class="w-4 h-4 opacity-80"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4MKWoYfBIsxFaqncSN9YxR9mdXQGZNMC1EJDT5yAh5A5R7NXO24MRfA2bF0BxpLFdOJLIlAof80HOr4HokeP6RalmMOUP2rfQdl3XiQ4NoHX37q7XV75Y8mHyjT-0PziGdPkI9qXCMmNzMVVN-ZQUdWwMo6nYIE9qAI22sos0F8nFKx2zlwN1HYzEky_3nI6UP8FAT6bwNH0p2-0Yi3teyjDUPvFHOJwCiAgh-b14qx97Qfr8mlseGFe9mamhHBn8i9WZVkS0Zdjc" />
              Sign in with Google
            </button>
          </div>

          <div class="text-center">
            <p class="font-body-sm text-body-sm text-on-surface-variant">
              Don't have an account? <a class="text-primary font-label-md hover:underline" href="#">Create an account</a>
            </p>
          </div>
        </div>
      </main>

      <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div class="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-fixed/20 blur-[120px] rounded-full"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-primary-fixed/10 blur-[100px] rounded-full"></div>
      </div>
    </div>
  `;

  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorBox = document.getElementById('login-error');
    const errorMsg = document.getElementById('login-error-msg');
    const btn = document.getElementById('login-btn');
    const btnText = document.getElementById('login-btn-text');
    const btnIcon = document.getElementById('login-btn-icon');
    const spinner = document.getElementById('login-spinner');

    errorBox.classList.add('hidden');
    btn.disabled = true;
    btnText.textContent = 'Signing in...';
    btnIcon.classList.add('hidden');
    spinner.classList.remove('hidden');

    try {
      const users = await findUser(email, password);
      if (users.length > 0) {
        saveSession(users[0]);
        showToast(`Welcome back, ${users[0].name}!`, 'success');
        navigate('#/board');
      } else {
        errorMsg.textContent = 'Invalid email or password. Please try again.';
        errorBox.classList.remove('hidden');
        document.getElementById('password').value = '';
      }
    } catch {
      errorMsg.textContent = 'Cannot connect to server. Make sure json-server is running on port 3000.';
      errorBox.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btnText.textContent = 'Login';
      btnIcon.classList.remove('hidden');
      spinner.classList.add('hidden');
    }
  });
}
