<script lang="ts">
    import { onMount } from 'svelte';
    import {fetchTimeslotsByLocation} from "../api";
    import {TEMPORARY_LOCATION_ID, type Timeslot} from "../types";

    let timeslots: Timeslot[] = [];
    let loading = true;
    let error: string | null = null;

    onMount(async () => {
        try {
            timeslots = await fetchTimeslotsByLocation(TEMPORARY_LOCATION_ID);
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