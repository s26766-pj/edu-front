import { BASE_URL, type Schedule, type Timetable } from "../types";

export async function fetchMyLatestSchedule(): Promise<Schedule> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const res = await fetch(`${BASE_URL}/schedules/mine`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
    });
    if (!res.ok) {
        throw new Error('Failed to fetch schedule by location.');
    }
    return await res.json();
}

export async function deleteMyLatestSchedule() {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    try {
        const response = await fetch(`${BASE_URL}/schedules/mine`, {
            method: 'DELETE',
            headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
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

export async function saveMySchedule(timetable: Timetable, name: string): Promise<Schedule> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    const transformedLessons = (timetable.lessons || []).map((lesson) => ({
        lessonId: lesson.id,
        roomId: typeof lesson.room === 'object' ? lesson.room.id : lesson.room,
        timeslotId: typeof lesson.timeslot === 'object' ? lesson.timeslot.id : lesson.timeslot,
        fixed: lesson.fixed || false
    }));

    const payload = {
        name,
        score: timetable.score,
        lessons: transformedLessons
    };

    const response = await fetch(`${BASE_URL}/schedules/mine`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save schedule: ${response.status} ${errorText}`);
    }

    return await response.json();
}