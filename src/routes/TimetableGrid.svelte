<script lang="ts">
    import { onMount } from 'svelte';
    import type { Lesson, Timeslot, StudentGroup, Teacher } from '../types';
    import { 
        timeslots, 
        studentGroups, 
        teachers, 
        viewMode, 
        selectedStudentGroupId, 
        selectedTeacherId,
        filteredLessons
    } from '../lib/stores/appStore';
    import { appActions } from '../lib/stores/appStore';
    import { loadMuuri } from '../lib/muuri.client';

    export let schedule: any = null;
    let uniqueDays: string[] = [];
    let uniqueTimes: string[] = [];
    
    // Use store values
    $: timeslotsData = $timeslots;
    $: studentGroupsData = $studentGroups;
    $: teachersData = $teachers;
    $: currentViewMode = $viewMode;
    $: currentSelectedStudentGroupId = $selectedStudentGroupId;
    $: currentSelectedTeacherId = $selectedTeacherId;
    $: assignedLessons = schedule?.lessons || [];
    
    // Create a reactive key that changes when filters change
    $: filterKey = `${currentViewMode}-${currentSelectedStudentGroupId}-${currentSelectedTeacherId}`;

    // Data is now loaded via the DataService in the parent component

    // Extract lessons from schedule and load timeslots
    $: if (schedule && schedule.lessons) {
        assignedLessons = schedule.lessons;
        console.log('Assigned lessons updated:', assignedLessons.length);
        assignedLessons.forEach((lesson: Lesson) => {
            console.log(`Lesson ${lesson.id}: ${lesson.subject} - Day: ${lesson.timeslot?.dayOfWeek}, Time: ${lesson.timeslot?.startTime}-${lesson.timeslot?.endTime}`);
        });
    }

    // Watch for timeslots data and build table structure
    $: if (timeslotsData.length > 0) {
        // Extract unique days and times
        const dayOrder = ['MONDAY', 'THURSDAY', 'WEDNESDAY', 'TUESDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        const allDays = [...new Set(timeslotsData.map(ts => ts.dayOfWeek))];
        uniqueDays = dayOrder.filter(day => allDays.includes(day));
        
        // Format times consistently (remove seconds if present)
        const formatTime = (timeStr: string) => timeStr ? timeStr.substring(0, 5) : '';
        uniqueTimes = [...new Set(timeslotsData.map(ts => 
            `${formatTime(ts.startTime)}-${formatTime(ts.endTime)}`
        ))].sort();
        
        console.log('TimetableGrid - Days:', uniqueDays);
        console.log('TimetableGrid - Times:', uniqueTimes);
        console.log('TimetableGrid - Building table with', uniqueDays.length, 'days and', uniqueTimes.length, 'times');
    }

    function getCellKey(day: string, time: string): string {
        return `${day}:${time}`;
    }

    function getLessonForCell(day: string, time: string): Lesson | null {
        console.log(`[FILTER] Getting lesson for ${day} ${time}, mode: ${currentViewMode}, studentGroupId: ${currentSelectedStudentGroupId}, teacherId: ${currentSelectedTeacherId}, filterKey: ${filterKey}`);
        
        const lesson = assignedLessons.find((lesson: Lesson) => {
            const lessonDay = lesson.timeslot?.dayOfWeek;
            
            // Handle both formats: "08:30:00" and "08:30"
            const formatTime = (timeStr: string) => {
                if (!timeStr) return '';
                // Remove seconds if present (08:30:00 -> 08:30)
                return timeStr.substring(0, 5);
            };
            
            const lessonStartTime = formatTime(lesson.timeslot?.startTime);
            const lessonEndTime = formatTime(lesson.timeslot?.endTime);
            const lessonTime = `${lessonStartTime}-${lessonEndTime}`;
            
            // Check day and time match
            const dayTimeMatch = lessonDay === day && lessonTime === time;
            
            if (!dayTimeMatch) return false;
            
            // Apply filter based on view mode
            if (currentViewMode === 'student') {
                // If no student groups loaded or no selection, show all lessons
                if (studentGroupsData.length === 0 || !currentSelectedStudentGroupId) {
                    console.log(`No student group filter applied for lesson ${lesson.id}`);
                    return true;
                }
                const matches = lesson.studentGroup?.id === currentSelectedStudentGroupId;
                console.log(`Lesson ${lesson.id} studentGroup ${lesson.studentGroup?.id} matches selected ${currentSelectedStudentGroupId}: ${matches}`);
                return matches;
            } else {
                // If no teachers loaded or no selection, show all lessons
                if (teachersData.length === 0 || !currentSelectedTeacherId) {
                    console.log(`No teacher filter applied for lesson ${lesson.id}`);
                    return true;
                }
                const matches = lesson.teacher?.id === currentSelectedTeacherId;
                console.log(`Lesson ${lesson.id} teacher ${lesson.teacher?.id} matches selected ${currentSelectedTeacherId}: ${matches}`);
                return matches;
            }
        });
        
        if (lesson) {
            console.log(`Found lesson for ${day} ${time}: ${lesson.subject} (${lesson.studentGroup?.name})`);
        } else {
            console.log(`No lesson found for ${day} ${time}`);
        }
        
        return lesson || null;
    }

    function handleViewModeChange(mode: 'student' | 'teacher') {
        console.log(`[VIEW_MODE] Changing to ${mode}, current: ${currentViewMode}`);
        appActions.setViewMode(mode);
        
        // Set default selection when switching view modes
        if (mode === 'student' && studentGroupsData.length > 0) {
            // Select first student group if none selected
            if (!currentSelectedStudentGroupId) {
                console.log(`[VIEW_MODE] Setting default student group: ${studentGroupsData[0].id}`);
                appActions.setSelectedStudentGroup(studentGroupsData[0].id);
            }
        } else if (mode === 'teacher' && teachersData.length > 0) {
            // Select first teacher if none selected
            if (!currentSelectedTeacherId) {
                console.log(`[VIEW_MODE] Setting default teacher: ${teachersData[0].id}`);
                appActions.setSelectedTeacher(teachersData[0].id);
            }
        }
        console.log(`[VIEW_MODE] Mode changed. New filterKey will be: ${mode}-${currentSelectedStudentGroupId}-${currentSelectedTeacherId}`);
    }

    // Initialize Muuri grid for each cell
    function initializeCellGrid(node: HTMLElement, params: {day: string, time: string}) {
        let cellGrid: any = null;
        
        // Initialize asynchronously
        const initAsync = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 200)); // Wait for DOM
                
                const Muuri = await loadMuuri();
                cellGrid = new Muuri(node, {
                    items: '.lesson-item',
                    layoutDuration: 400,
                    layoutEasing: 'ease',
                    dragEnabled: true,
                    dragContainer: document.body,
                    dragStartPredicate: {
                        handle: '.lesson-item'
                    },
                    dragSort: () => {
                        // Enable dragging between all grids
                        const grids = [];
                        if ((window as any).lessonsGrid) {
                            grids.push((window as any).lessonsGrid);
                        }
                        // Add all cell grids
                        Object.values((window as any).cellGrids || {}).forEach(grid => {
                            if (grid) grids.push(grid);
                        });
                        return grids;
                    }
                });

                // Store reference for cross-grid dragging
                if (!(window as any).cellGrids) {
                    (window as any).cellGrids = {};
                }
                (window as any).cellGrids[`${params.day}-${params.time}`] = cellGrid;

                // Add event listeners for drag operations
                cellGrid.on('receive', (data: any) => {
                    console.log(`Lesson received in ${params.day} ${params.time}:`, data.item.getElement().dataset.lessonId);
                    // Here you could update the application state when lessons are assigned to time slots
                });

                cellGrid.on('send', (data: any) => {
                    console.log(`Lesson sent from ${params.day} ${params.time}:`, data.item.getElement().dataset.lessonId);
                });

                console.log(`Initialized cell grid for ${params.day} ${params.time} with cross-grid dragging`);
            } catch (error) {
                console.error(`Failed to initialize cell grid for ${params.day} ${params.time}:`, error);
            }
        };
        
        // Start initialization
        initAsync();
        
        // Return action object immediately (synchronously)
        return {
            destroy() {
                if ((window as any).cellGrids) {
                    delete (window as any).cellGrids[`${params.day}-${params.time}`];
                }
                if (cellGrid) {
                    cellGrid.destroy();
                }
            }
        };
    }
</script>

<div class="timetable-wrapper">
    <div class="timetable-header">
        <h4>School Timetable (Drag lessons to time slots):</h4>
        
        <div class="view-controls">
            <div class="view-buttons">
                <button 
                    class="view-btn {currentViewMode === 'student' ? 'active' : ''}"
                    on:click={() => {
                        console.log('Student group button clicked');
                        handleViewModeChange('student');
                    }}
                >
                    Student Group
                </button>
                <button 
                    class="view-btn {currentViewMode === 'teacher' ? 'active' : ''}"
                    on:click={() => {
                        console.log('Teacher button clicked');
                        handleViewModeChange('teacher');
                    }}
                >
                    Teacher
                </button>
            </div>
            
            <div class="filter-dropdown">
                {#if currentViewMode === 'student'}
                    <select 
                        bind:value={$selectedStudentGroupId}
                        on:change={(e) => {
                            const target = e.target as HTMLSelectElement;
                            appActions.setSelectedStudentGroup(parseInt(target.value));
                            console.log('Student group changed to:', target.value);
                        }}
                    >
                        {#each studentGroupsData as group}
                            <option value={group.id}>{group.name}</option>
                        {/each}
                    </select>
                {:else}
                    <select 
                        bind:value={$selectedTeacherId}
                        on:change={(e) => {
                            const target = e.target as HTMLSelectElement;
                            appActions.setSelectedTeacher(parseInt(target.value));
                            console.log('Teacher changed to:', target.value);
                        }}
                    >
                        {#each teachersData as teacher}
                            <option value={teacher.id}>{teacher.firstName} {teacher.lastName}</option>
                        {/each}
                    </select>
                {/if}
            </div>
        </div>
    </div>
    
    {#if uniqueDays.length > 0 && uniqueTimes.length > 0}
        {#key filterKey}
    <table class="timetable">
        <thead>
        <tr>
                    <th class="time-header">Time</th>
                    {#each uniqueDays as day}
                        <th class="day-header">{day}</th>
            {/each}
        </tr>
        </thead>
        <tbody>
                {#each uniqueTimes as time}
                    <tr>
                        <td class="time-cell">{time}</td>
                        {#each uniqueDays as day}
                            {@const cellKey = getCellKey(day, time)}
                            {@const lesson = getLessonForCell(day, time)}
                            <td class="schedule-cell">
                                <div 
                                    class="cell-grid" 
                                    data-cell="{cellKey}"
                                    use:initializeCellGrid={{day, time}}
                                >
                                    {#if lesson}
                                        <div class="lesson-item muuri-item" data-lesson-id={lesson.id}>
                                            <div class="lesson-content">
                                                <strong>{lesson.subject}</strong><br/>
                                                <small>{lesson.teacher?.firstName} {lesson.teacher?.lastName}</small><br/>
                                                <small>{lesson.studentGroup?.name}</small>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        </td>
                {/each}
            </tr>
        {/each}
        </tbody>
    </table>
        {/key}
    {:else}
        <p>Loading timetable structure...</p>
    {/if}
</div>

<style>
    .timetable-wrapper {
        width: 100%;
        overflow-x: auto;
    }
    
    .timetable-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 1rem;
    }
    
    .view-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .view-buttons {
        display: flex;
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;
    }
    
    .view-btn {
        padding: 8px 16px;
        border: none;
        background: #f5f5f5;
        cursor: pointer;
        transition: all 0.2s;
        border-right: 1px solid #ddd;
    }
    
    .view-btn:last-child {
        border-right: none;
    }
    
    .view-btn:hover {
        background: #e0e0e0;
    }
    
    .view-btn.active {
        background: #1976d2;
        color: white;
    }
    
    .filter-dropdown select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        min-width: 200px;
        cursor: pointer;
    }
    
    .filter-dropdown select:focus {
        outline: none;
        border-color: #1976d2;
    }
    
    .timetable {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }
    
    .timetable th, .timetable td {
        border: 1px solid #ddd;
        padding: 4px;
        text-align: center;
        vertical-align: top;
    }
    
    .time-header, .day-header {
        background-color: #f5f5f5;
        font-weight: bold;
        padding: 8px;
    }
    
    .time-cell {
        background-color: #f9f9f9;
        font-weight: bold;
        white-space: nowrap;
        width: 100px;
    }
    
    .schedule-cell {
        width: 150px;
        height: 80px;
        position: relative;
        border: 1px solid #ddd;
        padding: 4px;
        vertical-align: top;
    }

    .cell-grid {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 70px;
        background-color: #f9f9f9;
        border-radius: 3px;
    }
    
    .lesson-item { 
        position: absolute;
        display: block;
        margin: 5px;
        z-index: 1;
        background: #000;
        color: white;
        border-radius: 3px;
        width: 150px;
        height: auto;
        cursor: grab;
    }


    
    .lesson-content { 
        padding: 4px 6px; 
        word-wrap: break-word;
        user-select: none;
        font-size: 0.8em;
        line-height: 1.2;
        text-align: center;
    }
    
    h4 {
        margin-bottom: 1rem;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .schedule-cell {
            width: 120px;
        }
        
        .lesson-content {
            font-size: 0.7em;
            padding: 2px 4px;
        }
    }
</style>
