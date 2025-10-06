import { BASE_URL, type Teacher } from "../types";

export async function saveTeacher(teacherData: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to save teacher: ${res.status} ${text}`);
    }
    return res.json();
}

export async function fetchMyTeachers(): Promise<Teacher[]> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const res = await fetch(`${BASE_URL}/teachers/mine`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
    });
    if (!res.ok) {
        throw new Error('Failed to fetch teachers by location.');
    }
    return await res.json();
}