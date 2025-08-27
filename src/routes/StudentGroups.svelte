<script lang="ts">
    import { onMount } from 'svelte';
    import { fetchStudentGroupsByLocation } from '../api';
    import { TEMPORARY_LOCATION_ID } from '../types';
    import type { StudentGroup } from '../types';

    let studentGroups: StudentGroup[] = [];
    let loading = true;
    let error = '';

    onMount(async () => {
        try {
            studentGroups = await fetchStudentGroupsByLocation(TEMPORARY_LOCATION_ID);
            loading = false;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to fetch student groups';
            loading = false;
        }
    });
</script>

{#if loading}
    <p>Loading student groups...</p>
{:else if error}
    <p style="color: red;">❌ {error}</p>
{:else}
    <h3>Student Groups ({studentGroups.length})</h3>
    <ul>
        {#each studentGroups as group}
            <li>{group.name}</li>
        {/each}
    </ul>
{/if}