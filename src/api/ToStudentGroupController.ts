import { BASE_URL, type StudentGroup } from "../types";

export async function fetchMyStudentGroups(): Promise<StudentGroup[]> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const res = await fetch(`${BASE_URL}/student-groups/mine`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
    });
    if (!res.ok) {
        throw new Error('Failed to fetch student groups by location.');
    }
    return await res.json();
}