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
        import type {SolverStatus, Timetable, Lesson, Timeslot} from "../types";
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
    let solverTimeLimit = 1;

    // Dual-job state
    let taskIdFullTime: string = '';
    let taskIdPartTime: string = '';
    let statusFullTime: SolverStatus = 'IDLE';
    let statusPartTime: SolverStatus = 'IDLE';
    let timetableFullTime: Timetable | null = null;
    let timetablePartTime: Timetable | null = null;

    // Use store values
    $: scheduleData = $schedule;
    $: isLoading = $loading;
    $: errorMessage = $error;

    onMount(async () => {
        // Initialize application data using the service
        await DataService.initialize();
    });

    function splitByStudyType(lessons: Lesson[], timeslots: Timeslot[]) {
        const ftLessons = lessons.filter(l => !(l as any).partTime && !(l.studentGroup as any)?.partTime);
        const ptLessons = lessons.filter(l => (l as any).partTime || (l.studentGroup as any)?.partTime);
        const ftTimes = timeslots.filter(t => !(t as any).partTime);
        const ptTimes = timeslots.filter(t => (t as any).partTime);
        return { ftLessons, ptLessons, ftTimes, ptTimes };
    }

    function startPolling(jobId: string) {
        status = 'SOLVING_ACTIVE';
        pollingInterval = setInterval(async () => {
            try {
                const { solverStatus } = await fetchTimetableStatus(jobId);
                status = solverStatus;
                if (solverStatus === 'NOT_SOLVING') {
                    clearInterval(pollingInterval!);
                    pollingInterval = null;
                    const solved = await fetchTimetable(jobId);
                    timetable = solved;
                    await saveSchedule(solved, scheduleName, TEMPORARY_LOCATION_ID);
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

    async function solveTimetable() {
        try {
            appActions.setError('');
            status = 'SOLVING_ACTIVE';
            appActions.setSolving(true);
            timetable = null;

            const lessons = await fetchLessonsByLocation(TEMPORARY_LOCATION_ID);
            const rooms = await fetchRoomsByLocation(TEMPORARY_LOCATION_ID);
            const timeslots = await fetchTimeslotsByLocation(TEMPORARY_LOCATION_ID);

            const { ftLessons, ptLessons, ftTimes, ptTimes } = splitByStudyType(lessons, timeslots);

            const hasFT = ftLessons.length > 0 && ftTimes.length > 0;
            const hasPT = ptLessons.length > 0 && ptTimes.length > 0;

            if (hasFT && hasPT) {
                // Fire two jobs only when both types are present
                taskIdFullTime = await generateTimetable(ftLessons, rooms, ftTimes, solverTimeLimit);
                taskIdPartTime = await generateTimetable(ptLessons, rooms, ptTimes, solverTimeLimit);
                appActions.setSolving(true, `${taskIdFullTime}|${taskIdPartTime}`);
                startDualPolling(taskIdFullTime, taskIdPartTime);
            } else if (hasFT) {
                // Only full-time
                taskId = await generateTimetable(ftLessons, rooms, ftTimes, solverTimeLimit);
                appActions.setSolving(true, taskId);
                startPolling(taskId);
            } else if (hasPT) {
                // Only part-time
                taskId = await generateTimetable(ptLessons, rooms, ptTimes, solverTimeLimit);
                appActions.setSolving(true, taskId);
                startPolling(taskId);
            } else {
                throw new Error('No lessons/timeslots to solve for.');
            }

        } catch (err) {
            status = 'IDLE';
            appActions.setSolving(false);
            appActions.setError('❌ Unknown error.');
        }
    }

    function startDualPolling(taskIdFT: string, taskIdPT: string) {
        status = 'SOLVING_ACTIVE';
        statusFullTime = 'SOLVING_ACTIVE';
        statusPartTime = 'SOLVING_ACTIVE';
        pollingInterval = setInterval(async () => {
            try {
                // FT status
                if (statusFullTime === 'SOLVING_ACTIVE') {
                    const { solverStatus: s1 } = await fetchTimetableStatus(taskIdFT);
                    statusFullTime = s1;
                    if (statusFullTime === 'NOT_SOLVING' && !timetableFullTime) {
                        timetableFullTime = await fetchTimetable(taskIdFT);
                    }
                }
                // PT status
                if (statusPartTime === 'SOLVING_ACTIVE') {
                    const { solverStatus: s2 } = await fetchTimetableStatus(taskIdPT);
                    statusPartTime = s2;
                    if (statusPartTime === 'NOT_SOLVING' && !timetablePartTime) {
                        timetablePartTime = await fetchTimetable(taskIdPT);
                    }
                }

                const bothDone = statusFullTime === 'NOT_SOLVING' && statusPartTime === 'NOT_SOLVING';
                if (bothDone && timetableFullTime && timetablePartTime) {
                    clearInterval(pollingInterval!);
                    pollingInterval = null;

                    // Merge lessons
                    const merged: any = {
                        ...timetableFullTime,
                        lessons: [
                            ...(timetableFullTime.lessons || []),
                            ...(timetablePartTime.lessons || [])
                        ],
                        // best available score string
                        score: (timetableFullTime as any).score || (timetablePartTime as any).score
                    };

                    timetable = merged;
                    await saveSchedule(merged, scheduleName, TEMPORARY_LOCATION_ID);
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
            // Cancel both if present
            if (taskIdFullTime) {
                await deleteTimetableTask(taskIdFullTime);
            }
            if (taskIdPartTime) {
                await deleteTimetableTask(taskIdPartTime);
            }
            taskId = '';
            taskIdFullTime = '';
            taskIdPartTime = '';
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

<div class="controls">
    <div class="time-limit-section">
        <label for="timeLimit">Solver Time Limit (minutes):</label>
        <input 
            id="timeLimit"
            type="number" 
            bind:value={solverTimeLimit} 
            min="1" 
            max="2880" 
            step="1"
            style="width: 100px; margin-left: 10px;"
        />
        <span style="margin-left: 10px; color: #666;">
            ({Math.floor(solverTimeLimit / 60)}h {solverTimeLimit % 60}m)
        </span>
    </div>
    
    <div class="action-buttons">
        <button on:click={solveTimetable}>Solve</button>
        <button on:click={handleClear}>Clear</button>
        <button on:click={handleAnalyze} disabled={!scheduleData || analyzing}>
            {analyzing ? 'Analyzing...' : 'Analyze'}
        </button>
    </div>
</div>

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
            {solverTimeLimit}
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
    {#if taskIdFullTime || taskIdPartTime}
        <div style="margin-top:8px; font-size: 12px; color: #555;">
            FT job: {taskIdFullTime} — {statusFullTime} | PT job: {taskIdPartTime} — {statusPartTime}
        </div>
    {/if}
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

    .controls {
        margin-bottom: 2rem;
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #f9f9f9;
    }

    .time-limit-section {
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
    }

    .action-buttons {
        display: flex;
        gap: 10px;
    }

    .action-buttons button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }

    .action-buttons button:first-child {
        background-color: #4CAF50;
        color: white;
    }

    .action-buttons button:nth-child(2) {
        background-color: #f44336;
        color: white;
    }

    .action-buttons button:last-child {
        background-color: #2196F3;
        color: white;
    }

    .action-buttons button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
</style>
