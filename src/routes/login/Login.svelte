<script lang="ts">
    import type { LoginResponse } from '../../types';
    import { login as apiLogin } from '../../api/ToAuthController';

    let userLogin = '';
    let password = '';
    let error: string | null = null;
    let loading = false;
    let token: string | null = null;

    async function handleSubmit(event: Event) {
        event.preventDefault();
        error = null;
        loading = true;
        try {
            const res: LoginResponse = await apiLogin(userLogin, password);
            token = res.token;
            localStorage.setItem('auth_token', token);
            // Redirect to app after successful login
            window.location.href = '/app';
        } catch (e: any) {
            error = e?.message || 'Login failed';
        } finally {
            loading = false;
        }
    }
</script>

<div class="login-split">
    <div class="left">
        <img src="/logon.png" alt="Logon" class="illustration" />
    </div>
    <div class="right">
        <a href="/" class="back-link" aria-label="Powrót do strony głównej">
            <img src="/logo.png" alt="EduPlanner" class="logo-small" />
        </a>
        <h2>Zaloguj się</h2><br>
        <form on:submit|preventDefault={handleSubmit}>
            <div>
                <label for="login">Login</label>
                <input id="login" type="text" bind:value={userLogin} autocomplete="username" required />
            </div>
            <br>
            <div>
                <label for="password">Hasło</label>
                <input id="password" type="password" bind:value={password} autocomplete="current-password" required />
            </div>
            <br>
            <button type="submit" disabled={loading}>{loading ? 'Logowanie…' : 'Zaloguj'}</button>
        </form>
        {#if error}
            <p class="error">{error}</p>
        {/if}
        {#if token}
            <p class="info">Zalogowano. Token zapisany.</p>
        {/if}
    </div>
</div>

{#if error}
    <p style="color:red">{error}</p>
{/if}

{#if token}
    <p>Logged in. Token saved to localStorage.</p>
{/if}

<style>
    .login-split {
        display: grid;
        grid-template-columns: 1fr 1fr;
        min-height: 100vh;
        align-items: stretch;
        gap: 0;
        padding: 0;
    }

    .left { display: flex; align-items: center; justify-content: center; }
    .illustration { width: 100%; height: 100%; max-width: none; object-fit: cover; }

    .right { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: 24px; }
    form { display: grid; gap: 0.75rem; width: 100%; max-width: 360px; }
    h2 { color: #344B66; }
    label { display: block; font-weight: 600; color: #344B66; }
    input {
        width: 100%;
        padding: 0.6rem 0.75rem;
        border: none;
        border-bottom: 2px solid #D62B21;
        border-radius: 0;
        background: #ffffff;
        color: #344B66;
    }
    input:focus {
        outline: none;
        border-bottom-color: #D62B21;
        background: #ffffff;
    }
    button { justify-self: end; width: auto; min-width: 320px; max-width: 360px; padding: 0.8rem 1rem; border-radius: 0px; border: none; background: #D62B21; color: white; font-weight: 700; cursor: pointer; }
    button:hover { background: #D62B21; }
    .back-link { align-self: flex-start; display: inline-flex; align-items: center; margin-bottom: 12px; }
    .back-link:hover { opacity: 0.95; }
    .back-link:focus, .back-link:focus-visible { outline: none; }
    .logo-small { height: 28px; width: auto; display: block; }
    .error { color: #ef4444; margin-top: 8px; }
    .info { color: #22c55e; margin-top: 8px; }

    @media (max-width: 900px) {
        .login-split { grid-template-columns: 1fr; }
        .illustration { width: 100%; height: auto; object-fit: contain; }
        .right { align-items: center; padding: 16px; }
        form { max-width: 100%; }
    }
</style>


