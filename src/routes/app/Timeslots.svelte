<script lang="ts">
    import { onMount } from 'svelte';
    import { fetchMyTimeslots } from '../../api/ToTimeslotController';
    import { type Timeslot} from '../../types';

    let timeslots: Timeslot[] = [];
    let loading = true;
    let error: string | null = null;

    onMount(async () => {
        try {
            timeslots = await fetchMyTimeslots();
        } catch (err) {
            error = err instanceof Error ? err.message : 'Unknown error';
        } finally {
            loading = false;
        }
    });
</script>

<main>
    {#if loading}
        <p>⏳ Loading timeslots...</p>
    {:else if error}
        <p style="color: red;">❌ {error}</p>
    {:else}
        {#each timeslots as timeslot}
            <div class="timeslot">
                on {timeslot.dayOfWeek} starting at: {timeslot.startTime} ends: {timeslot.endTime}
            </div>
        {/each}
    {/if}
</main>