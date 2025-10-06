import { BASE_URL } from "../types";

export async function saveLocation(locationData: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationData)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to save location: ${res.status} ${text}`);
    }
    return res.json();
}