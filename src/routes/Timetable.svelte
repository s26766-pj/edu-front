<script lang="ts">
    import {
        deleteLatestScheduleByLocation,
        deleteTimetableTask, fetchLatestScheduleByLocation,
        fetchLessonsByLocation,
        fetchRoomsByLocation,
        fetchTimeslotsByLocation,
        fetchTimetable,
        fetchTimetableStatus,
        generateTimetable, saveSchedule, analyzeSchedule
    } from '../api';
    import type {Schedule, SolverStatus, Timetable} from "../types";
    import StatusModal from './StatusModal.svelte';
    import Lessons from "./Lessons.svelte";
    import {onMount} from "svelte";
    import {TEMPORARY_LOCATION_ID} from "../types";

    let scheduleName = "schedule name";
    let taskId: string = '';
    let timetable: Timetable | null = null;
    let schedule: Schedule | null = null;
    let status: SolverStatus = 'IDLE';
    let pollingInterval: ReturnType<typeof setInterval> | null = null;
    let error: string = '';
    let loading = true;
    let analysisResult: any = null;
    let analyzing = false;

    onMount(async () => {
        try {
            schedule = await fetchLatestScheduleByLocation(TEMPORARY_LOCATION_ID);
            console.log("murmur schedule received:", JSON.stringify(schedule, null, 2));
        } catch (err) {
            error = err instanceof Error ? err.message : 'Unknown error';
        } finally {
            loading = false;
        }
    });
    async function solveTimetable() {
        try {
            error = '';
            status = 'SOLVING_ACTIVE';
            timetable = null;

            const lessons = await fetchLessonsByLocation(TEMPORARY_LOCATION_ID);
            const rooms = await fetchRoomsByLocation(TEMPORARY_LOCATION_ID);
            const timeslots = await fetchTimeslotsByLocation(TEMPORARY_LOCATION_ID);
            taskId = await generateTimetable(lessons, rooms, timeslots)
            startPolling(taskId);

        } catch (err) {
            status = 'IDLE';
            error = '❌ Unknown error.';
        }
    }

    function startPolling(taskId: string) {
        status = 'SOLVING_ACTIVE';
        pollingInterval = setInterval(async () => {
            try {
                const { solverStatus } = await fetchTimetableStatus(taskId);
                status = solverStatus;
                if (status === 'NOT_SOLVING') {
                    clearInterval(pollingInterval!);
                    pollingInterval = null;
                    timetable = await fetchTimetable(taskId);
                }
                if (timetable) {
                    console.log("murmur: ", JSON.stringify(timetable))
                    await saveSchedule(timetable, scheduleName, TEMPORARY_LOCATION_ID)
                    // location.reload();
                }
            } catch (err) {
                clearInterval(pollingInterval!);
                pollingInterval = null;
                error = `Failed to check timetable status: ${(err as Error).message}`;
                status = 'IDLE';
            }
        }, 30000); // 30s
    }

    async function handleCancel() {
        try {
            await deleteTimetableTask(taskId);
            taskId = '';
            status = '';
            clearInterval(pollingInterval!);
        } catch (err) {
            error = (err as Error).message;
        }
    }

    async function handleClear() {
        try {
            await deleteLatestScheduleByLocation(TEMPORARY_LOCATION_ID);
            location.reload()
        } catch (err) {
            error = (err as Error).message;
        }
    }

    async function handleAnalyze() {
        if (!schedule) {
            error = 'No schedule available to analyze.';
            return;
        }

        try {
            analyzing = true;
            error = '';
            analysisResult = await analyzeSchedule(schedule);
        } catch (err) {
            error = err instanceof Error ? err.message : 'Unknown error during analysis';
            analysisResult = null;
        } finally {
            analyzing = false;
        }
    }

</script>

<button on:click={solveTimetable}>Solve</button>
<button on:click={handleClear}>Clear</button>
<button on:click={handleAnalyze} disabled={!schedule || analyzing}>
    {analyzing ? 'Analyzing...' : 'Analyze'}
</button>

{#if error}
    <p style="color: red;">❌ {error}</p>
{/if}

{#if analysisResult}
    <div style="margin: 20px 0; padding: 15px; border: 1px solid #4CAF50; border-radius: 5px; background-color: #f1f8e9;">
        <h4>📊 Analysis Results:</h4>
        <pre style="white-space: pre-wrap; font-family: monospace; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">{JSON.stringify(analysisResult, null, 2)}</pre>
    </div>
{/if}

{#if taskId}
    <StatusModal
            {taskId}
            {pollingInterval}
            {status}
            onCancel={handleCancel}
    />

{/if}
<p>🧾 Unassigned lessons:</p>
<Lessons />
{#if status === 'NOT_SOLVING' || 'IDLE'}
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
