import { writable, derived } from 'svelte/store';
import type { Schedule, Lesson, Room, Timeslot, StudentGroup, Teacher } from '../../types';

export type SolverStatus = 'IDLE' | 'SOLVING_ACTIVE' | 'NOT_SOLVING';

interface AppState {
    loading: boolean;
    error: string | null;
    schedule: Schedule | null;
    unassignedLessons: Lesson[];
    rooms: Room[];
    timeslots: Timeslot[];
    studentGroups: StudentGroup[];
    teachers: Teacher[];
    viewMode: 'student' | 'teacher';
    selectedStudentGroupId: number | null;
    selectedTeacherId: number | null;
    solving: boolean;
    solverStatus: SolverStatus;
    taskId: string;
}

const initialState: AppState = {
    loading: false,
    error: null,
    schedule: null,
    unassignedLessons: [],
    rooms: [],
    timeslots: [],
    studentGroups: [],
    teachers: [],
    viewMode: 'student',
    selectedStudentGroupId: null,
    selectedTeacherId: null,
    solving: false,
    solverStatus: 'IDLE',
    taskId: ''
};

export const appState = writable<AppState>(initialState);

// Derived stores for easy access to specific parts of the state
export const loading = derived(appState, $state => $state.loading);
export const error = derived(appState, $state => $state.error);
export const schedule = derived(appState, $state => $state.schedule);
export const unassignedLessons = derived(appState, $state => $state.unassignedLessons);
export const rooms = derived(appState, $state => $state.rooms);
export const timeslots = derived(appState, $state => $state.timeslots);
export const studentGroups = derived(appState, $state => $state.studentGroups);
export const teachers = derived(appState, $state => $state.teachers);
export const viewMode = derived(appState, $state => $state.viewMode);
export const selectedStudentGroupId = derived(appState, $state => $state.selectedStudentGroupId);
export const selectedTeacherId = derived(appState, $state => $state.selectedTeacherId);
export const solving = derived(appState, $state => $state.solving);
export const solverStatus = derived(appState, $state => $state.solverStatus);

// Filtered lessons based on current view mode and selection
export const filteredLessons = derived(
    [schedule, viewMode, selectedStudentGroupId, selectedTeacherId],
    ([$schedule, $viewMode, $selectedStudentGroupId, $selectedTeacherId]) => {
        if (!$schedule?.lessons) return [];
        
        return $schedule.lessons.filter(lesson => {
            if ($viewMode === 'student') {
                return !$selectedStudentGroupId || lesson.studentGroup?.id === $selectedStudentGroupId;
            } else {
                return !$selectedTeacherId || lesson.teacher?.id === $selectedTeacherId;
            }
        });
    }
);

// Actions to update the state
export const appActions = {
    // Initialize with all data
    initializeData: (data: {
        schedule?: Schedule | null;
        unassignedLessons: Lesson[];
        rooms: Room[];
        timeslots: Timeslot[];
        studentGroups: StudentGroup[];
        teachers: Teacher[];
    }) => {
        appState.update(state => ({
            ...state,
            loading: false,
            error: null,
            schedule: data.schedule || null,
            unassignedLessons: data.unassignedLessons,
            rooms: data.rooms,
            timeslots: data.timeslots,
            studentGroups: data.studentGroups,
            teachers: data.teachers,
            // Set default selections
            selectedStudentGroupId: data.studentGroups.length > 0 ? data.studentGroups[0].id : null,
            selectedTeacherId: data.teachers.length > 0 ? data.teachers[0].id : null
        }));
    },
    
    // Set loading state
    setLoading: (loading: boolean) => {
        appState.update(state => ({ ...state, loading }));
    },
    
    // Set error
    setError: (error: string) => {
        appState.update(state => ({ ...state, error }));
    },
    
    // Set solving state
    setSolving: (solving: boolean, taskId: string = '') => {
        appState.update(state => ({ ...state, solving, taskId }));
    },
    
    // Set view mode
    setViewMode: (viewMode: 'student' | 'teacher') => {
        appState.update(state => ({ ...state, viewMode }));
    },
    
    // Set selected student group
    setSelectedStudentGroup: (id: number | null) => {
        appState.update(state => ({ ...state, selectedStudentGroupId: id }));
    },
    
    // Set selected teacher
    setSelectedTeacher: (id: number | null) => {
        appState.update(state => ({ ...state, selectedTeacherId: id }));
    },
    
    // Update schedule
    setSchedule: (schedule: Schedule | null) => {
        appState.update(state => ({ ...state, schedule }));
    },
    
    // Update unassigned lessons
    setUnassignedLessons: (lessons: Lesson[]) => {
        appState.update(state => ({ ...state, unassignedLessons: lessons }));
    },
    
    // Set solver status
    setSolverStatus: (status: SolverStatus) => {
        appState.update(state => ({ ...state, solverStatus: status }));
    },
    
    // Clear all data
    clearData: () => {
        appState.set(initialState);
    }
};
