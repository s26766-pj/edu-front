<script lang="ts">
    import {
        deleteLatestScheduleByLocation,
        deleteTimetableTask, 
        fetchLessonsByLocation,
        fetchRoomsByLocation,
        fetchTimeslotsByLocation,
        fetchTimetable,
        fetchTimetableStatus,
        generateTimetable, 
        saveSchedule, 
        analyzeSchedule, 
        fetchUnassignedLessonsByLocation
    } from '../api';
        import type {SolverStatus, Timetable} from "../types";
    import StatusModal from './StatusModal.svelte';
    import Lessons from "./Lessons.svelte";
    import TimetableGrid from "./TimetableGrid.svelte";
    import Schedule from "./Schedule.svelte";
    import {onMount} from "svelte";
    import {TEMPORARY_LOCATION_ID, TEMPORARY_SCHEDULE_NAME} from "../types";
    import { schedule, loading, error, solving } from '../lib/stores/appStore';
    import { appActions } from '../lib/stores/appStore';
    import { DataService } from '../lib/services/dataService';

    let taskId: string = '';
    let timetable: Timetable | null = null;
    let status: SolverStatus = 'IDLE';
    let pollingInterval: ReturnType<typeof setInterval> | null = null;
    let analysisResult: any = null;
    let analyzing = false;
    let scheduleName = "Generated Schedule";
    
    // Use store values
    $: scheduleData = $schedule;
    $: isLoading = $loading;
    $: errorMessage = $error;

    onMount(async () => {
        // Initialize application data using the service
        await DataService.initialize();
    });
    async function solveTimetable() {
        try {
            appActions.setError('');
            status = 'SOLVING_ACTIVE';
            appActions.setSolving(true);
            timetable = null;

            const lessons = await fetchLessonsByLocation(TEMPORARY_LOCATION_ID);
            const rooms = await fetchRoomsByLocation(TEMPORARY_LOCATION_ID);
            const timeslots = await fetchTimeslotsByLocation(TEMPORARY_LOCATION_ID);
            taskId = await generateTimetable(lessons, rooms, timeslots)
            appActions.setSolving(true, taskId);
            startPolling(taskId);

        } catch (err) {
            status = 'IDLE';
            appActions.setSolving(false);
            appActions.setError('❌ Unknown error.');
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
                    location.reload();
                }
            } catch (err) {
                clearInterval(pollingInterval!);
                pollingInterval = null;
                appActions.setError(`Failed to check timetable status: ${(err as Error).message}`);
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
            appActions.setError((err as Error).message);
        }
    }

    async function handleClear() {
        try {
            await deleteLatestScheduleByLocation(TEMPORARY_LOCATION_ID);
            await DataService.clearScheduleAndRefresh();
            location.reload();
        } catch (err) {
            appActions.setError((err as Error).message);
        }
    }

    async function handleAnalyze() {
        if (!scheduleData) {
            appActions.setError('No schedule available to analyze.');
            return;
        }

        try {
            analyzing = true;
            appActions.setError('');
            analysisResult = await analyzeSchedule(scheduleData);
        } catch (err) {
            appActions.setError(err instanceof Error ? err.message : 'Unknown error during analysis');
            analysisResult = null;
        } finally {
            analyzing = false;
        }
    }

</script>

<button on:click={solveTimetable}>Solve</button>
<button on:click={handleClear}>Clear</button>
<button on:click={handleAnalyze} disabled={!scheduleData || analyzing}>
    {analyzing ? 'Analyzing...' : 'Analyze'}
</button>

{#if errorMessage}
    <p style="color: red;">❌ {errorMessage}</p>
{/if}

{#if analysisResult}
    <div style="margin: 20px 0; padding: 15px; border: 1px solid #4CAF50; border-radius: 5px; background-color: #f1f8e9;">
        <h4>📊 Analysis Results:</h4>
        <pre style="white-space: pre-wrap; font-family: monospace; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">{JSON.stringify(analysisResult, null, 2)}</pre>
    </div>
{/if}

{#if status === 'SOLVING_ACTIVE'}
    <StatusModal
            {status}
            onCancel={handleCancel}
    />

{/if}
<div class="lessons-section">
    <Lessons />
</div>
<div class="schedule-section">
    <TimetableGrid schedule={scheduleData} />
</div>
<div class="debug-section">
    <Schedule schedule={scheduleData} status={status} />
</div>

<style>
    .lessons-section {
        margin-bottom: 2rem;
        clear: both;
        border: 3px solid red;
        padding: 1rem;
        background-color: rgba(255, 0, 0, 0.1);
    }
    
    .schedule-section {
        clear: both;
        margin-top: 1rem;
        border: 3px solid green;
        padding: 1rem;
        background-color: rgba(0, 255, 0, 0.1);
    }

    .debug-section {
        clear: both;
        margin-top: 1rem;
        border: 3px solid blue;
        padding: 1rem;
        background-color: rgba(0, 0, 255, 0.1);
    }
</style>
