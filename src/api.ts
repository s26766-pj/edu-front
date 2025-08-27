import type {Lesson, Room, Schedule, SolverStatus, StudentGroup, Teacher, Timeslot, Timetable} from "./types";
import {BASE_URL} from "./types";

export async function fetchLessonsByLocation(locationId: number): Promise<Lesson[]> {
    const res = await fetch(`${BASE_URL}/lessons/by-location?locationId=${encodeURIComponent(locationId)}`);
    if (!res.ok) {
        throw new Error('Failed to fetch lessons by location.');
    }
    return await res.json();
}

export async function fetchUnassignedLessonsByLocation(locationId: number): Promise<Lesson[]> {
    const res = await fetch(`${BASE_URL}/lessons/unassigned?locationId=${encodeURIComponent(locationId)}`);
    
    console.log("murmur API response status:", res.status);
    console.log("murmur API response ok:", res.ok);
    
    // Handle 204 No Content response
    if (res.status === 204) {
        console.log("murmur API response is 204 No Content, returning empty array");
        return [];
    }
    
    if (!res.ok) {
        throw new Error('Failed to fetch unassigned lessons by location.');
    }
    
    // Handle 200 OK response
    try {
        const data = await res.json();
        console.log("murmur API response data:", data);
        return data;
    } catch (error) {
        console.error("murmur JSON parse error:", error);
        // If JSON parsing fails, return empty array
        return [];
    }
}

export async function fetchRoomsByLocation(locationId: number): Promise<Room[]> {
    const res = await fetch(`${BASE_URL}/rooms/by-location?locationId=${encodeURIComponent(locationId)}`);
    if (!res.ok) {
        throw new Error('Failed to fetch rooms by location.');
    }
    return await res.json();
}

export async function fetchTimeslotsByLocation(locationId: number): Promise<Timeslot[]> {
    const res = await fetch(`${BASE_URL}/timeslots/by-location?locationId=${encodeURIComponent(locationId)}`);
    if (!res.ok) {
        throw new Error('Failed to fetch timeslots by location.');
    }
    return await res.json();
}

export async function fetchStudentGroupsByLocation(locationId: number): Promise<StudentGroup[]> {
    const res = await fetch(`${BASE_URL}/student-groups/by-location?locationId=${encodeURIComponent(locationId)}`);
    if (!res.ok) {
        throw new Error('Failed to fetch student groups by location.');
    }
    return await res.json();
}

export async function fetchTeachersByLocation(locationId: number): Promise<Teacher[]> {
    const res = await fetch(`${BASE_URL}/teachers/by-location?locationId=${encodeURIComponent(locationId)}`);
    if (!res.ok) {
        throw new Error('Failed to fetch teachers by location.');
    }
    return await res.json();
}

export async function generateTimetable(lessons: Lesson[], rooms: Room[], timeslots: Timeslot[]): Promise<string> {

    const preparePayload = (lessons: Lesson[], rooms: Room[], timeslots: Timeslot[]) => ({
        timeslotIds: timeslots.map((t: Timeslot) => t.id),
        roomIds: rooms.map((r: Room) => r.id),
        lessonIds: lessons.map((l: Lesson) => l.id)
    });

    const payload = preparePayload(lessons, rooms, timeslots);
    const res = await fetch(`${BASE_URL}/solver`, {
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

export async function saveSchedule(timetable: any, name: string, locationId: number) {
    console.log("murmur timetable: ", JSON.stringify(timetable))

    try {
        // Debug: Check the structure of the first lesson
        if (timetable.lessons.length > 0) {
            console.log("First lesson structure:", JSON.stringify(timetable.lessons[0], null, 2));
            console.log("Room:", timetable.lessons[0].room);
            console.log("Timeslot:", timetable.lessons[0].timeslot);
        }

        const transformedLessons = timetable.lessons.map((lesson: any) => {
            const transformed = {
                lessonId: lesson.id,
                roomId: lesson.room?.id || lesson.room, // Extract ID if room is an object
                timeslotId: lesson.timeslot?.id || lesson.timeslot, // Extract ID if timeslot is an object
                fixed: lesson.fixed || false
            };
            console.log("Transformed lesson:", transformed);
            return transformed;
        });

        const body = {
            name,
            locationId,
            score: timetable.score,
            lessons: transformedLessons
        };
        
        console.log("Final body to send:", JSON.stringify(body, null, 2));
        
        const response = await fetch(`${BASE_URL}/schedules`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to save: ${error}`);
        }

        const savedSchedule = await response.json();
        console.log('Schedule is saved:', savedSchedule);
        return savedSchedule;
    } catch (error) {
        console.error('Error in saveSchedule:', error);
        throw error;
    }
}

export async function fetchLatestScheduleByLocation(locationId: number): Promise<Schedule> {
    const res = await fetch(`${BASE_URL}/schedules/by-location?locationId=${encodeURIComponent(locationId)}`);

    if (res.status === 404) {
        throw new Error('No schedule found for this location.');
    }
    
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`❌ Failed to fetch schedule by location: ${res.status} - ${errorText}`);
    }

    return res.json();
}

export async function deleteLatestScheduleByLocation(locationId: number) {
    try {
        const response = await fetch(`${BASE_URL}/schedules/by-location?locationId=${encodeURIComponent(locationId)}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("Schedule deleted.");
        } else if (response.status === 204) {
            alert("Schedule not found.");
        } else {
            alert("Delete operation failed.");
        }
    } catch (error) {
        console.error("Network error:", error);
        alert("Not connected.");
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






