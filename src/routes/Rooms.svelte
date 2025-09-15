<script lang="ts">
    import { onMount } from 'svelte';
    import {fetchRoomsByLocation, fetchLatestScheduleByLocation} from "../api";
    import {TEMPORARY_LOCATION_ID, type Room, type Lesson, type Schedule} from "../types";

    let rooms: Room[] = [];
    let schedule: Schedule | null = null;
    let loading = true;
    let error: string | null = null;

    // Group lessons by room
    $: lessonsByRoom = schedule?.lessons?.reduce((acc, lesson) => {
        if (lesson.room) {
            const roomId = lesson.room.id;
            if (!acc[roomId]) {
                acc[roomId] = {
                    room: lesson.room,
                    lessons: []
                };
            }
            acc[roomId].lessons.push(lesson);
        }
        return acc;
    }, {} as Record<number, { room: any, lessons: Lesson[] }>) || {};

    onMount(async () => {
        try {
            // Fetch both rooms and latest schedule
            const [roomsData, scheduleData] = await Promise.all([
                fetchRoomsByLocation(TEMPORARY_LOCATION_ID),
                fetchLatestScheduleByLocation(TEMPORARY_LOCATION_ID).catch(() => null) // Don't fail if no schedule exists
            ]);
            
            rooms = roomsData;
            schedule = scheduleData;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Unknown error';
        } finally {
            loading = false;
        }
    });
</script>

<main>
    {#if loading}
        <p>⏳ Loading rooms and lessons...</p>
    {:else if error}
        <p style="color: red;">❌ {error}</p>
    {:else}
        <h2>🏫 Rooms and Assigned Lessons</h2>
        
        {#if !schedule}
            <p style="color: orange;">⚠️ No schedule found. Generate a timetable first to see room assignments.</p>
        {/if}
        
        <div class="rooms-container">
            {#each rooms as room}
                <div class="room-card">
                    <h3 class="room-name">🏢 {room.name}</h3>
                    
                    {#if lessonsByRoom[room.id]}
                        <div class="lessons-list">
                            <h4>📚 Assigned Lessons ({lessonsByRoom[room.id].lessons.length})</h4>
                            {#each lessonsByRoom[room.id].lessons as lesson}
                                <div class="lesson-item">
                                    <div class="lesson-subject">📖 {lesson.subject}</div>
                                    <div class="lesson-details">
                                        <span class="teacher">👨‍🏫 {lesson.teacher?.firstName} {lesson.teacher?.lastName}</span>
                                        <span class="student-group">👥 {lesson.studentGroup?.name}</span>
                                        {#if lesson.timeslot}
                                            <span class="timeslot">
                                                📅 {lesson.timeslot.dayOfWeek} 
                                                {lesson.timeslot.startTime} - {lesson.timeslot.endTime}
                                            </span>
                                        {/if}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="no-lessons">
                            <p>📭 No lessons assigned to this room</p>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</main>

<style>
    .rooms-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .room-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
        background: #f9f9f9;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .room-name {
        margin: 0 0 1rem 0;
        color: #333;
        border-bottom: 2px solid #007bff;
        padding-bottom: 0.5rem;
    }
    
    .lessons-list h4 {
        margin: 0 0 0.5rem 0;
        color: #555;
        font-size: 0.9rem;
    }
    
    .lesson-item {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 0.75rem;
        margin-bottom: 0.5rem;
    }
    
    .lesson-subject {
        font-weight: bold;
        color: #007bff;
        margin-bottom: 0.25rem;
    }
    
    .lesson-details {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.85rem;
        color: #666;
    }
    
    .teacher, .student-group, .timeslot {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    
    .no-lessons {
        text-align: center;
        color: #999;
        font-style: italic;
        padding: 1rem;
    }
    
    h2 {
        color: #333;
        margin-bottom: 1rem;
    }
</style>