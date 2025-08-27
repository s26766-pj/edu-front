import { 
    fetchRoomsByLocation, 
    fetchTimeslotsByLocation, 
    fetchUnassignedLessonsByLocation,
    fetchStudentGroupsByLocation,
    fetchTeachersByLocation,
    fetchLatestScheduleByLocation
} from '../../api';
import { TEMPORARY_LOCATION_ID } from '../../types';
import { appActions } from '../stores/appStore';
import type { Schedule } from '../../types';

export class DataService {
    /**
     * Initialize all application data
     */
    static async initialize(): Promise<void> {
        try {
            appActions.setLoading(true);
            appActions.setError('');

            console.log('DataService: Starting initialization...');

            // Fetch all data in parallel
            const [
                rooms,
                timeslots, 
                unassignedLessons,
                studentGroups,
                teachers,
                latestSchedule
            ] = await Promise.all([
                fetchRoomsByLocation(TEMPORARY_LOCATION_ID),
                fetchTimeslotsByLocation(TEMPORARY_LOCATION_ID),
                fetchUnassignedLessonsByLocation(TEMPORARY_LOCATION_ID),
                fetchStudentGroupsByLocation(TEMPORARY_LOCATION_ID),
                fetchTeachersByLocation(TEMPORARY_LOCATION_ID),
                fetchLatestScheduleByLocation(TEMPORARY_LOCATION_ID).catch(() => null) // Don't fail if no schedule exists
            ]);

            console.log('DataService: Loaded data:', {
                rooms: rooms.length,
                timeslots: timeslots.length,
                unassignedLessons: unassignedLessons.length,
                studentGroups: studentGroups.length,
                teachers: teachers.length,
                hasSchedule: !!latestSchedule
            });

            // Initialize the store with all data
            appActions.initializeData({
                schedule: latestSchedule,
                unassignedLessons,
                rooms,
                timeslots,
                studentGroups,
                teachers
            });

            console.log('DataService: Initialization complete');
        } catch (error) {
            console.error('DataService: Failed to initialize:', error);
            appActions.setError(error instanceof Error ? error.message : 'Failed to initialize application data');
            appActions.setLoading(false);
        }
    }

    /**
     * Refresh the schedule data
     */
    static async refreshSchedule(): Promise<void> {
        try {
            console.log('DataService: Refreshing schedule...');
            const latestSchedule = await fetchLatestScheduleByLocation(TEMPORARY_LOCATION_ID).catch(() => null);
            appActions.setSchedule(latestSchedule);
            console.log('DataService: Schedule refreshed');
        } catch (error) {
            console.error('DataService: Failed to refresh schedule:', error);
            appActions.setError(error instanceof Error ? error.message : 'Failed to refresh schedule');
        }
    }

    /**
     * Refresh unassigned lessons
     */
    static async refreshUnassignedLessons(): Promise<void> {
        try {
            console.log('DataService: Refreshing unassigned lessons...');
            const unassignedLessons = await fetchUnassignedLessonsByLocation(TEMPORARY_LOCATION_ID);
            appActions.setUnassignedLessons(unassignedLessons);
            console.log('DataService: Unassigned lessons refreshed:', unassignedLessons.length);
        } catch (error) {
            console.error('DataService: Failed to refresh unassigned lessons:', error);
            appActions.setError(error instanceof Error ? error.message : 'Failed to refresh unassigned lessons');
        }
    }

    /**
     * Clear schedule and refresh unassigned lessons
     */
    static async clearScheduleAndRefresh(): Promise<void> {
        try {
            appActions.setSchedule(null);
            await this.refreshUnassignedLessons();
        } catch (error) {
            console.error('DataService: Failed to clear and refresh:', error);
            appActions.setError(error instanceof Error ? error.message : 'Failed to clear schedule');
        }
    }
}
