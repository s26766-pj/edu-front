<script>
    export let onLogin = () => {};
</script>

<header class="landing-header">
    <div class="logo-wrap">
        <a href="/" aria-label="Powrót na stronę główną">
            <img src="/logo.png" alt="EduPlanner" class="logo" />
        </a>
    </div>
    <nav class="nav" aria-label="Primary">
        <a href="#functions" class="link" on:click|preventDefault>Funkcje</a>
        <a href="#blog" class="link" on:click|preventDefault>Blog</a>
        <a href="#contact" class="link" on:click|preventDefault>Kontakt</a>
        <button type="button" class="login" on:click={onLogin}>ZALOGUJ</button>
    </nav>
    
</header>

<style>
    .landing-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 24px;
        padding: 12px 16px;
        background: transparent;
        position: absolute;
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
        width: fit-content;
    }

    .logo-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .logo {
        height: 40px;
        width: auto;
        user-select: none;
    }

    .nav {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .link {
        color: #344B66;
        text-decoration: none;
        padding: 10px 12px;
        line-height: 20px;
        border-radius: 8px;
    }

    .link:hover {
        background: rgba(255,255,255,0.08);
    }

    .login {
        background: #D62B21;
        color: white;
        border: none;
        border-radius: 10px;
        padding: 12px 18px;
        line-height: 20px;
        cursor: pointer;
        font-weight: 700;
        letter-spacing: 0.2px;
        transition: background 120ms ease-in-out, transform 120ms ease-in-out;
    }

    .login:hover {
        background: #D62B21;
        transform: translateY(-1px);
    }
</style>

