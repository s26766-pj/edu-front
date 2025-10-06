import { BASE_URL, type Lesson } from "../types";

export async function fetchMyLessons(): Promise<Lesson[]> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const res = await fetch(`${BASE_URL}/lessons/mine`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
    });
    if (!res.ok) {
        throw new Error('Failed to fetch lessons by location.');
    }
    return await res.json();
}

export async function fetchMyUnassignedLessons(): Promise<Lesson[]> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const res = await fetch(`${BASE_URL}/lessons/mine/unassigned`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
    });
    if (!res.ok) {
        throw new Error('Failed to fetch unassigned lessons by location.');
    }
    return await res.json();
}