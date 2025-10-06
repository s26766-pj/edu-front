import { BASE_URL, type Lesson, type Room, type Schedule, type SolverStatus, type Timeslot, type Timetable } from "../types";

export async function generateTimetable(lessons: Lesson[], rooms: Room[], timeslots: Timeslot[], minutesSpentLimit?: number): Promise<string> {

    const preparePayload = (lessons: Lesson[], rooms: Room[], timeslots: Timeslot[]) => ({
        timeslotIds: timeslots.map((t: Timeslot) => t.id),
        roomIds: rooms.map((r: Room) => r.id),
        lessonIds: lessons.map((l: Lesson) => l.id)
    });

    const payload = preparePayload(lessons, rooms, timeslots);
    
    // Build URL with optional minutesSpentLimit parameter
    let url = `${BASE_URL}/solver`;
    if (minutesSpentLimit !== undefined) {
        url += `?minutesSpentLimit=${minutesSpentLimit}`;
    }
    
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`❌ Failed to generate timetable: ${res.status} - ${errorText}`);
    }

    return res.text().then(text => text.replace(/^"|"$/g, ''));
}

export async function fetchTimetableStatus(taskId: string): Promise<{ solverStatus: SolverStatus, score: string }> {
    const res = await fetch(`${BASE_URL}/solver/${taskId}/status`);
    console.log("Expecting task id: ", taskId)
    if (!res.ok) {
        throw new Error(`❌ Failed to fetch status: ${res.statusText}`);
    }
    return await res.json();
}

export async function fetchTimetable(taskId: string): Promise<Timetable> {
    const res = await fetch(`${BASE_URL}/solver/${taskId}`);
    if (!res.ok) {
        throw new Error(`❌ Failed to fetch timetable: ${res.statusText}`);
    }
    return await res.json();
}

export async function deleteTimetableTask(taskId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/solver/${taskId}`, {
        method: 'DELETE'
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`❌ Failed to cancel task ${taskId}: ${res.status} - ${errorText}`);
    }
}

export async function analyzeSchedule(schedule: Schedule): Promise<any> {
    console.log("murmur analyzing schedule:", JSON.stringify(schedule));

    try {
        // Convert Schedule to TimetableDto format that the backend expects
        // This avoids Jackson object identity issues
        const timetableDto = {
            timeslotIds: [] as number[],
            roomIds: [] as number[],
            lessonIds: [] as number[],
            lessons: schedule.lessons?.map(lesson => ({
                id: lesson.id,
                subject: lesson.subject,
                teacher: lesson.teacher ? {
                    id: lesson.teacher.id,
                    firstName: lesson.teacher.firstName,
                    lastName: lesson.teacher.lastName
                } : null,
                studentGroup: lesson.studentGroup ? {
                    id: lesson.studentGroup.id,
                    name: lesson.studentGroup.name
                } : null,
                room: lesson.room ? {
                    id: lesson.room.id,
                    name: lesson.room.name
                } : null,
                timeslot: lesson.timeslot ? {
                    id: lesson.timeslot.id,
                    dayOfWeek: lesson.timeslot.dayOfWeek,
                    startTime: lesson.timeslot.startTime,
                    endTime: lesson.timeslot.endTime
                } : null,
                fixed: lesson.fixed || false
            })) || [],
            timeslots: [] as Timeslot[],
            rooms: [] as Room[],
            solverStatus: null,
            score: schedule.score || "0hard/0soft"
        };

        // Extract unique timeslots and rooms
        const timeslotMap = new Map();
        const roomMap = new Map();
        
        timetableDto.lessons.forEach(lesson => {
            if (lesson.timeslot) {
                timeslotMap.set(lesson.timeslot.id, lesson.timeslot);
                timetableDto.timeslotIds.push(lesson.timeslot.id);
            }
            if (lesson.room) {
                roomMap.set(lesson.room.id, lesson.room);
                timetableDto.roomIds.push(lesson.room.id);
            }
            timetableDto.lessonIds.push(lesson.id);
        });

        timetableDto.timeslots = Array.from(timeslotMap.values());
        timetableDto.rooms = Array.from(roomMap.values());

        // Remove duplicates from ID arrays
        timetableDto.timeslotIds = [...new Set(timetableDto.timeslotIds)];
        timetableDto.roomIds = [...new Set(timetableDto.roomIds)];
        timetableDto.lessonIds = [...new Set(timetableDto.lessonIds)];

        console.log("murmur converted to timetableDto:", JSON.stringify(timetableDto));

        const response = await fetch(`${BASE_URL}/solver/analyze-dto`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(timetableDto)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`❌ Failed to analyze schedule: ${response.status} - ${errorText}`);
        }

        const analysisResult = await response.json();
        console.log('Schedule analysis result:', analysisResult);
        return analysisResult;
    } catch (error) {
        console.error('Error in analyzeSchedule:', error);
        throw error;
    }
}