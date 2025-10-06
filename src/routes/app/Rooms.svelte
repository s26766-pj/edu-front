<script lang="ts">
    import { onMount } from 'svelte';
    import {fetchMyRooms} from '../../api/ToRoomController';
    import {type Room} from "../../types";

    let rooms: Room[] = [];
    let loading = true;
    let error: string | null = null;

    onMount(async () => {
        try {
            rooms = await fetchMyRooms();
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
        <h2>🏫 Rooms</h2>
        
        <div class="rooms-list">
            {#each rooms as room}
                <div class="room-item">
                    🏢 {room.name}
                </div>
            {/each}
        </div>
    {/if}
</main>

<style>
    .rooms-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
        max-width: 400px;
    }
    
    .room-item {
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: #f9f9f9;
        font-size: 1.1rem;
        color: #333;
    }
    
    h2 {
        color: #333;
        margin-bottom: 1rem;
    }
</style>