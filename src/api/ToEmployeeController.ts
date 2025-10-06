import { BASE_URL } from "../types";

export async function saveEmployee(employeeData: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to save employee: ${res.status} ${text}`);
    }
    return res.json();
}