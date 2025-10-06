import { BASE_URL, type Room } from "../types";

export async function fetchMyRooms(): Promise<Room[]> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    console.log('fetchMyRooms', token);
    const res = await fetch(`${BASE_URL}/rooms/mine`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
    });
    if (!res.ok) {
        throw new Error('Failed to fetch rooms by location.');
    }
    return await res.json();
}