<script lang="ts">
    import type { Schedule } from '../types';

    export let schedule: Schedule | null = null;
    export let status: string = '';
</script>

{#if status === 'NOT_SOLVING' || status === 'IDLE'}
    <h4>Timetable:</h4>
    {#if schedule}
        {#if schedule.lessons}
            <ul style="list-style: none; padding: 0;">
                {#each schedule.lessons as lesson}
                    <li style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                        <strong>{lesson.subject}</strong> — 
                        {#if lesson.teacher && lesson.teacher.firstName && lesson.teacher.lastName}
                            {lesson.teacher.firstName} {lesson.teacher.lastName}
                        {:else if lesson.teacher && (lesson.teacher.firstName || lesson.teacher.lastName)}
                            {lesson.teacher.firstName || ''} {lesson.teacher.lastName || ''}
                        {:else}
                            <em>No teacher assigned</em>
                        {/if} — 
                        {#if lesson.studentGroup && lesson.studentGroup.name}
                            {lesson.studentGroup.name}
                        {:else}
                            <em>No group assigned</em>
                        {/if} 
                        <br>
                        📍 <strong>{lesson.room?.name || 'Unknown room'}</strong> | 
                        📅 <strong>{lesson.timeslot?.dayOfWeek || 'Unknown day'}</strong> | 
                        ⏰ {lesson.timeslot?.startTime || 'Unknown'} - {lesson.timeslot?.endTime || 'Unknown'}
                    </li>
                {/each}
            </ul>
        {/if}
    {:else}
        <p>Nothing to show.</p>
    {/if}
{/if}

<style>
    h4 {
        margin-top: 2rem;
        margin-bottom: 1rem;
    }
    
    ul {
        max-width: 100%;
    }
    
    li {
        word-wrap: break-word;
        overflow-wrap: break-word;
    }
</style>
