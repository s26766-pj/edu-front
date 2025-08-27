<script lang="ts">
    import { onMount } from 'svelte';
    import {fetchRoomsByLocation, } from "../api";
    import {TEMPORARY_LOCATION_ID, type Room} from "../types";

    let rooms: Room[] = [];
    let loading = true;
    let error: string | null = null;

    onMount(async () => {
        try {
            rooms = await fetchRoomsByLocation(TEMPORARY_LOCATION_ID);
        } catch (err) {
            error = err instanceof Error ? err.message : 'Unknown error';
        } finally {
            loading = false;
        }
    });
</script>

<main>
    {#if loading}
        <p>⏳ Loading rooms...</p>
    {:else if error}
        <p style="color: red;">❌ {error}</p>
    {:else}
        {#each rooms as room}
            <div class="room">
                {room.name}
            </div>
        {/each}
    {/if}
</main>