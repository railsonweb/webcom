/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// @ts-ignore
const { createClient } = supabase;

// !!! IMPORTANTE: Substitua pelas suas credenciais do Supabase !!!
const SUPABASE_URL = 'https://cdicshqkozygdgorspwb.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkaWNzaHFrb3p5Z2Rnb3JzcHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODcwODksImV4cCI6MjA2Mzg2MzA4OX0.rsVYoAsmfOTh8vMpjqzhuTwAEcHz7rw-leVYalvjrlY';

document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container') as HTMLDivElement;
    const rootContainer = document.getElementById('root') as HTMLDivElement;

    // Inicializa o cliente Supabase
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Seletores de elementos
    const loginFormContainer = document.getElementById('login-form-container') as HTMLDivElement;
    const registerFormContainer = document.getElementById('register-form-container') as HTMLDivElement;
    const forgotPasswordFormContainer = document.getElementById('forgot-password-form-container') as HTMLDivElement;
    const resetPasswordPageContainer = document.getElementById('reset-password-page-container') as HTMLDivElement;

    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    const registerForm = document.getElementById('register-form') as HTMLFormElement;
    const forgotPasswordForm = document.getElementById('forgot-password-form') as HTMLFormElement;
    const resetPasswordPageForm = document.getElementById('reset-password-page-form') as HTMLFormElement;

    const showRegisterLink = document.getElementById('show-register') as HTMLAnchorElement;
    const showLoginLink = document.getElementById('show-login') as HTMLAnchorElement;
    const showForgotPasswordLink = document.getElementById('show-forgot-password') as HTMLAnchorElement;
    const backToLoginFromForgotLink = document.getElementById('back-to-login-from-forgot') as HTMLAnchorElement;
    const backToLoginFromResetLink = document.getElementById('back-to-login-from-reset') as HTMLAnchorElement;
    
    const logoutButton = document.getElementById('logout-button') as HTMLButtonElement;
    const userNameDisplay = document.getElementById('user-name-display') as HTMLSpanElement;

    const loginMessageArea = document.getElementById('login-message') as HTMLDivElement;
    const registerMessageArea = document.getElementById('register-message') as HTMLDivElement;
    const forgotPasswordMessageArea = document.getElementById('forgot-password-message') as HTMLDivElement;
    const resetPasswordPageMessageArea = document.getElementById('reset-password-page-message') as HTMLDivElement;

    const passwordToggleButtons = document.querySelectorAll('.password-toggle') as NodeListOf<HTMLButtonElement>;

    // Seletores para Simulação de Anúncio
    const watchAdButton = document.getElementById('watch-ad-button') as HTMLButtonElement;
    const adSimulationModal = document.getElementById('ad-simulation-modal') as HTMLDivElement;
    const closeAdModalButton = document.getElementById('close-ad-modal') as HTMLButtonElement;
    const adMessageArea = document.getElementById('ad-message') as HTMLDivElement;
    const adPlaceholder = document.getElementById('ad-placeholder') as HTMLDivElement;

    function displayMessage(area: HTMLDivElement | null, message: string, type: 'error' | 'success') {
        if (!area) return;
        area.textContent = message;
        area.className = `message-area ${type}`;
        area.classList.remove('hidden');
    }

    function clearMessage(area: HTMLDivElement | null) {
        if (area) {
            area.textContent = '';
            area.classList.add('hidden');
            area.className = 'message-area hidden';
        }
    }
    
    function clearAllMessages() {
        clearMessage(loginMessageArea);
        clearMessage(registerMessageArea);
        clearMessage(forgotPasswordMessageArea);
        clearMessage(resetPasswordPageMessageArea);
        if (adMessageArea) clearMessage(adMessageArea); // Limpa mensagem do modal de anúncio também
    }

    function showForm(formToShow: HTMLDivElement | null) {
        [loginFormContainer, registerFormContainer, forgotPasswordFormContainer, resetPasswordPageContainer].forEach(container => {
            if (container) container.classList.add('hidden');
        });
        if (formToShow) {
            formToShow.classList.remove('hidden');
            // Se o form a ser mostrado está dentro do authContainer, garante que authContainer esteja visível
            if (authContainer && (formToShow === loginFormContainer || formToShow === registerFormContainer || formToShow === forgotPasswordFormContainer || formToShow === resetPasswordPageContainer)) {
                authContainer.classList.remove('hidden');
            }
        }
        clearAllMessages();
    }

    function updateWelcomeMessage(user: any | null) {
        if (userNameDisplay) {
            if (user) {
                userNameDisplay.textContent = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
            } else {
                userNameDisplay.textContent = 'Usuário'; // Fallback
            }
        }
    }

    supabaseClient.auth.onAuthStateChange(async (event: string, session: any) => {
        if (event === 'PASSWORD_RECOVERY' && session) {
            // Usuário clicou no link de recuperação de senha no email
            if (authContainer) authContainer.classList.remove('hidden'); // Garante que o container dos forms de auth esteja visível
            if (rootContainer) rootContainer.classList.add('hidden');
            showForm(resetPasswordPageContainer);
        } else if (event === 'SIGNED_IN' && session) {
            updateWelcomeMessage(session.user);
            if (authContainer) authContainer.classList.add('hidden');
            if (rootContainer) rootContainer.classList.remove('hidden');
            clearAllMessages();
            const passwordInput = loginForm?.elements.namedItem('password') as HTMLInputElement;
            if(passwordInput) passwordInput.value = '';
        } else if (event === 'SIGNED_OUT') {
            updateWelcomeMessage(null);
            if (rootContainer) rootContainer.classList.add('hidden');
            if (authContainer) authContainer.classList.remove('hidden');
            showForm(loginFormContainer);
             const passwordInput = loginForm?.elements.namedItem('password') as HTMLInputElement;
             if (passwordInput) passwordInput.value = '';
        }
        
        // Lidar com a sessão inicial ao carregar a página
        if (event === 'INITIAL_SESSION' && !window.location.hash.includes('type=recovery')) { // Não mexe se for fluxo de recovery
            if (session) {
                updateWelcomeMessage(session.user);
                if (authContainer) authContainer.classList.add('hidden');
                if (rootContainer) rootContainer.classList.remove('hidden');
            } else {
                if (rootContainer) rootContainer.classList.add('hidden');
                if (authContainer) authContainer.classList.remove('hidden');
                showForm(loginFormContainer);
            }
        }
    });


    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            showForm(registerFormContainer);
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showForm(loginFormContainer);
        });
    }

    if (showForgotPasswordLink) {
        showForgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            showForm(forgotPasswordFormContainer);
        });
    }
    
    if (backToLoginFromForgotLink) {
        backToLoginFromForgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            showForm(loginFormContainer);
        });
    }

    if (backToLoginFromResetLink) {
        backToLoginFromResetLink.addEventListener('click', (e) => {
            e.preventDefault();
            showForm(loginFormContainer);
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessage(loginMessageArea);
            const emailInput = loginForm.elements.namedItem('email') as HTMLInputElement;
            const passwordInput = loginForm.elements.namedItem('password') as HTMLInputElement;
            const email = emailInput.value;
            const password = passwordInput.value;

            if (!email || !password) {
                displayMessage(loginMessageArea, 'Por favor, preencha e-mail e senha.', 'error');
                return;
            }

            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

            if (error) {
                displayMessage(loginMessageArea, `Erro no login: ${error.message}`, 'error');
            } else if (!data.session) { 
                 displayMessage(loginMessageArea, 'Login falhou. Verifique suas credenciais ou confirme seu e-mail.', 'error');
            }
            // Se data.session existir, onAuthStateChange cuidará da transição da UI.
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessage(registerMessageArea);
            const nameInput = registerForm.elements.namedItem('name') as HTMLInputElement;
            const emailInput = registerForm.elements.namedItem('email') as HTMLInputElement;
            const passwordInput = registerForm.elements.namedItem('password') as HTMLInputElement;
            const confirmPasswordInput = registerForm.elements.namedItem('confirm-password') as HTMLInputElement;

            const name = nameInput.value;
            const email = emailInput.value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (!name || !email || !password || !confirmPassword) {
                displayMessage(registerMessageArea, 'Por favor, preencha todos os campos.', 'error');
                return;
            }
            if (password !== confirmPassword) {
                displayMessage(registerMessageArea, 'As senhas não coincidem.', 'error');
                return;
            }
            if (password.length < 6) {
                displayMessage(registerMessageArea, 'A senha deve ter pelo menos 6 caracteres.', 'error');
                return;
            }

            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: name }
                }
            });

            if (error) {
                if (error.message && (error.message.toLowerCase().includes("user already registered") || error.message.toLowerCase().includes("already exists"))) {
                    displayMessage(registerMessageArea, 'Este e-mail já está cadastrado. Tente fazer login ou use a opção "Esqueceu a senha?".', 'error');
                } else {
                    displayMessage(registerMessageArea, `Erro no cadastro: ${error.message}`, 'error');
                }
            } else if (data && data.user) { 
                if (data.session) { 
                    displayMessage(registerMessageArea, 'Cadastro realizado com sucesso! Você será redirecionado.', 'success');
                    registerForm.reset();
                } else {
                    displayMessage(registerMessageArea, 'Cadastro realizado! Verifique seu e-mail para confirmar sua conta antes de fazer login.', 'success');
                    registerForm.reset();
                    setTimeout(() => {
                        showForm(loginFormContainer);
                        const loginEmailField = loginForm?.elements.namedItem('email') as HTMLInputElement;
                        if (loginEmailField) loginEmailField.value = email; 
                    }, 4000);
                }
            } else {
                 console.error("Supabase signUp retornou um estado inesperado: nenhum erro e nenhum usuário. Dados recebidos:", data);
                 displayMessage(registerMessageArea, 'Ocorreu um problema inesperado durante o cadastro. Por favor, tente novamente ou contate o suporte.', 'error');
            }
        });
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessage(forgotPasswordMessageArea);
            const emailInput = forgotPasswordForm.elements.namedItem('email') as HTMLInputElement;
            const email = emailInput.value;

            if (!email) {
                displayMessage(forgotPasswordMessageArea, 'Por favor, informe seu endereço de e-mail.', 'error');
                return;
            }
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                 redirectTo: window.location.origin, 
            });

            if (error) {
                displayMessage(forgotPasswordMessageArea, `Erro: ${error.message}`, 'error');
            } else {
                displayMessage(forgotPasswordMessageArea, 'Se uma conta com este email existir, um link de recuperação foi enviado. Verifique sua caixa de entrada (e spam).', 'success');
                forgotPasswordForm.reset();
                 setTimeout(() => {
                    showForm(loginFormContainer);
                }, 4000);
            }
        });
    }

    if (resetPasswordPageForm) {
        resetPasswordPageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessage(resetPasswordPageMessageArea);
            const newPasswordInput = resetPasswordPageForm.elements.namedItem('new-password') as HTMLInputElement;
            const confirmNewPasswordInput = resetPasswordPageForm.elements.namedItem('confirm-new-password') as HTMLInputElement;

            const newPassword = newPasswordInput.value;
            const confirmNewPassword = confirmNewPasswordInput.value;

            if (!newPassword || !confirmNewPassword) {
                displayMessage(resetPasswordPageMessageArea, 'Por favor, preencha ambos os campos de senha.', 'error');
                return;
            }
            if (newPassword !== confirmNewPassword) {
                displayMessage(resetPasswordPageMessageArea, 'As senhas não coincidem.', 'error');
                return;
            }
            if (newPassword.length < 6) {
                displayMessage(resetPasswordPageMessageArea, 'A nova senha deve ter pelo menos 6 caracteres.', 'error');
                return;
            }

            const { data, error } = await supabaseClient.auth.updateUser({ password: newPassword });

            if (error) {
                displayMessage(resetPasswordPageMessageArea, `Erro ao atualizar senha: ${error.message}`, 'error');
            } else {
                displayMessage(resetPasswordPageMessageArea, 'Senha atualizada com sucesso! Você será redirecionado para o login.', 'success');
                resetPasswordPageForm.reset();
                setTimeout(() => {
                    showForm(loginFormContainer);
                }, 3000);
            }
        });
    }


    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            const { error } = await supabaseClient.auth.signOut();
            if (error) {
                console.error('Erro no logout:', error.message);
                alert(`Erro ao sair: ${error.message}`); 
            }
        });
    }

    if (passwordToggleButtons) {
        passwordToggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetInputId = button.dataset.target;
                if (targetInputId) {
                    const passwordInput = document.getElementById(targetInputId) as HTMLInputElement;
                    if (passwordInput) {
                        if (passwordInput.type === 'password') {
                            passwordInput.type = 'text';
                            button.innerHTML = '🙈'; 
                            button.setAttribute('aria-label', 'Ocultar senha');
                        } else {
                            passwordInput.type = 'password';
                            button.innerHTML = '👁️'; 
                            button.setAttribute('aria-label', 'Mostrar senha');
                        }
                    }
                }
            });
        });
    }
    
    // Lógica para Simulação de Anúncio
    function showAdModal() {
        if (adSimulationModal) adSimulationModal.classList.remove('hidden');
    }

    function hideAdModal() {
        if (adSimulationModal) adSimulationModal.classList.add('hidden');
        if (adMessageArea) clearMessage(adMessageArea);
        if (adPlaceholder) adPlaceholder.classList.add('hidden');
    }

    function simulateAdPlayback() {
        showAdModal();
        if (!adMessageArea || !adPlaceholder) return;

        displayMessage(adMessageArea, 'Carregando anúncio...', 'success'); // Usando success para um visual neutro
        adPlaceholder.classList.add('hidden');

        setTimeout(() => {
            displayMessage(adMessageArea, 'Anúncio em exibição...', 'success');
            adPlaceholder.classList.remove('hidden');

            setTimeout(() => {
                displayMessage(adMessageArea, 'Anúncio concluído! Recompensa: +10 Moedas (Simulado)', 'success');
                adPlaceholder.classList.add('hidden');

                // Opcional: fechar modal automaticamente após a recompensa
                // setTimeout(hideAdModal, 3000); 
            }, 5000); // Duração do anúncio simulado (5s)
        }, 2000); // Tempo de carregamento simulado (2s)
    }

    if (watchAdButton) {
        watchAdButton.addEventListener('click', simulateAdPlayback);
    }

    if (closeAdModalButton) {
        closeAdModalButton.addEventListener('click', hideAdModal);
    }
    
    const checkInitialSession = async () => {
        // Evita executar se a URL já indica um fluxo de recuperação de senha, pois onAuthStateChange cuidará disso.
        if (window.location.hash.includes('type=recovery')) {
            return;
        }
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session && authContainer && rootContainer) {
             if (!rootContainer.classList.contains('hidden')) {
                rootContainer.classList.add('hidden');
            }
            if (authContainer.classList.contains('hidden')) {
                authContainer.classList.remove('hidden');
                showForm(loginFormContainer);
            } else if (!loginFormContainer?.classList.contains('hidden') && 
                       !registerFormContainer?.classList.contains('hidden') && 
                       !forgotPasswordFormContainer?.classList.contains('hidden') && 
                       !resetPasswordPageContainer?.classList.contains('hidden')) {
                 // Se nenhum form estiver visível dentro do authContainer, mostra o de login
                 showForm(loginFormContainer);
            }
        }
    };
    checkInitialSession();

    console.log("Aplicação com Supabase Auth inicializada, página de redefinição de senha e simulação de anúncio prontas.");
});