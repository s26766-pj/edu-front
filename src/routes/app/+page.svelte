<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import Timetable from './Timetable.svelte';
    import Timeslots from './Timeslots.svelte';
    import Rooms from './Rooms.svelte';
    import StudentGroups from './StudentGroups.svelte';
    import Teachers from './Teachers.svelte';
    import Header from './Header.svelte';

let isAuthed = false;
let menu = 1;

    onMount(() => {
        try {
            console.log('[App] onMount start');
            const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
            console.log('[App] token present?', !!token);
            if (!token) {
                console.warn('[App] No token; redirecting to /login');
                goto('/login');
                return;
            }
            isAuthed = true;
            console.log('[App] isAuthed set to true');
        } catch (e) {
            console.error('[App] onMount error:', e);
        }
    });
</script>

{#if isAuthed}
    <Header />
    <ul id="menu">
        <li><a href="/app" on:click|preventDefault={() => (menu = 1)}>Timetable</a></li> |
        <li><a href="/app" on:click|preventDefault={() => (menu = 2)}>Timeslots</a></li> |
        <li><a href="/app" on:click|preventDefault={() => (menu = 3)}>Rooms</a></li> |
        <li><a href="/app" on:click|preventDefault={() => (menu = 4)}>Student Groups</a></li> |
        <li><a href="/app" on:click|preventDefault={() => (menu = 5)}>Teachers</a></li>
    </ul>

    {#if menu === 1}
        <Timetable />
    {:else if menu === 2}
        <Timeslots />
    {:else if menu === 3}
        <Rooms />
    {:else if menu === 4}
        <StudentGroups />
    {:else if menu === 5}
        <Teachers />
    {/if}
{/if}


