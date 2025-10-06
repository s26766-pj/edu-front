<script lang="ts">
    import { onMount } from 'svelte';
    import type { Teacher } from '../../types';
	import { fetchMyTeachers } from '../../api/ToTeacherController';

    let teachers: Teacher[] = [];
    let loading = true;
    let error = '';

    onMount(async () => {
        try {
            teachers = await fetchMyTeachers();
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