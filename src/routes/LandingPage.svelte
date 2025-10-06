<script lang="ts">
    import LandingPageHeader from "./LandingPageHeader.svelte";
    import { goto } from '$app/navigation';

    const words = [
        'dyrektorem',
        'administarorem',
        'studentem',
        'nauczycielem'
    ];

    let wordIndex = 0;
    let currentWord = words[wordIndex];

    function handleWordCycle() {
        wordIndex = (wordIndex + 1) % words.length;
        currentWord = words[wordIndex];
    }

    function handleLoginClick() {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
            goto('/app');
        } else {
            goto('/login');
        }
    }
</script>

<LandingPageHeader onLogin={handleLoginClick} />
<div class="landing-container">
    <div class="landing-content">
        <div>
            <h1 class="landing-title">Z nami łatwiej być</h1>
            <p class="landing-subtitle" on:animationiteration={handleWordCycle}>{currentWord}</p><br><br><br>
            <p class="landing-description">EduPlanner to nowoczesny program do zarządzania uczelnią on-line. Innowacyjne podejście do planowania i zarządzania zasobami w placówkach edukacyjnych.</p>
            <button type="button" class="cta-button" on:click={() => goto('/register')}>WYPRÓBUJ ZA DARMO</button>
        </div>
        <img class="landing-image" src="/land.png" alt="Landing" />
    </div>
</div>

<style>

    .landing-container {
        position: relative;
        width: 100%;
        height: calc(100vh - 80px);
        margin-top: 85px; /* push image below the header */
        overflow: hidden;
        background: #FFFFFC;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .landing-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        opacity: 0.95;
        filter: drop-shadow(0 6px 24px rgba(0,0,0,0.35));
        user-select: none;
        pointer-events: none;
    }

    .landing-content {
        width: min(1100px, 92%);
        display: grid;
        grid-template-columns: 1fr 1.2fr;
        align-items: center;
        gap: 32px;
    }

    .landing-title {
        color: #344B66;
        font-size: clamp(28px, 4vw, 44px);
        line-height: 1.15;
        font-weight: 800;
        letter-spacing: 0.2px;
        margin: 0;
        text-wrap: balance;
    }

    .landing-subtitle {
        color: #D62B21;
        font-size: clamp(22px, 3vw, 32px);
        line-height: 1.2;
        font-weight: 800;
        margin: 8px 0 0 20px; /* shift 10px to the right */
        display: inline-block;
        animation: slideFadeOnce 5s ease-in-out infinite;
    }

    .landing-description {
        color: #344B66;
        font-size: 16px;
        line-height: 1.6;
        margin: 12px 0 0 0;
        max-width: 48ch;
    }

    .cta-button {
        margin-top: 16px;
        background: #D62B21;
        color: white;
        border: none;
        border-radius: 10px;
        padding: 12px 18px;
        font-weight: 700;
        letter-spacing: 0.2px;
        cursor: pointer;
        transition: background 120ms ease-in-out, transform 120ms ease-in-out;
    }

    .cta-button:hover {
        background: #c95f48;
        transform: translateY(-1px);
    }

    @keyframes slideFadeOnce {
        0% { transform: translateX(-20px); opacity: 0; }
        15% { transform: translateX(-10px); opacity: 1; }
        60% { transform: translateX(20px); opacity: 0; }
        100% { transform: translateX(20px); opacity: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
        .landing-subtitle { animation: none; }
    }

    @media (max-width: 900px) {
        .landing-content {
            grid-template-columns: 1fr;
            text-align: center;
        }
        .landing-title {
            margin-bottom: 16px;
        }
    }
</style>