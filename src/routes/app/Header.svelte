<script lang="ts">
    import { SvelteDate } from 'svelte/reactivity';
    import { goto } from '$app/navigation';

    const date = new SvelteDate();
    const dateFormat: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    const formatter = new Intl.DateTimeFormat("en-GB", dateFormat);

    $effect(() => {
        const interval = setInterval(() => {
            date.setTime(Date.now());
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    });

    const dateToShow = formatter.format(date);

    function handleLogout() {
        localStorage.removeItem('auth_token');
        goto('/');
    }
</script>

<header class="app-header">
    <div class="header-content">
        <h1>Welcome to EduPlanner! Today is {dateToShow}</h1>
        <button class="logout-btn" on:click={handleLogout}>Logout</button>
    </div>
</header>

<style>
    .app-header {
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
        padding: 1rem 0;
        margin-bottom: 2rem;
    }
    
    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
    }
    
    h1 {
        margin: 0;
        color: #333;
        font-size: 1.5rem;
    }
    
    .logout-btn {
        background: #dc3545;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
    }
    
    .logout-btn:hover {
        background: #c82333;
    }
</style>