<script lang="ts">
    import { onMount } from 'svelte';
    import { fetchTeachersByLocation } from '../api';
    import { TEMPORARY_LOCATION_ID } from '../types';
    import type { Teacher } from '../types';

    let teachers: Teacher[] = [];
    let loading = true;
    let error = '';

    onMount(async () => {
        try {
            teachers = await fetchTeachersByLocation(TEMPORARY_LOCATION_ID);
            loading = false;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to fetch teachers';
            loading = false;
        }
    });
</script>

{#if loading}
    <p>Loading teachers...</p>
{:else if error}
    <p style="color: red;">❌ {error}</p>
{:else}
    <h3>Teachers ({teachers.length})</h3>
    <ul>
        {#each teachers as teacher}
            <li>{teacher.firstName} {teacher.lastName}</li>
        {/each}
    </ul>
{/if}