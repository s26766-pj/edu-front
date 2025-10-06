import { BASE_URL, type Timeslot } from "../types";

export async function fetchMyTimeslots(): Promise<Timeslot[]> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const res = await fetch(`${BASE_URL}/timeslots/mine`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
    });
    if (!res.ok) {
        throw new Error('Failed to fetch timeslots by location.');
    }
    return await res.json();
}