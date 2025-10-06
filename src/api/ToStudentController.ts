import { BASE_URL } from "../types";

export async function saveStudent(studentData: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to save student: ${res.status} ${text}`);
    }
    return res.json();
}