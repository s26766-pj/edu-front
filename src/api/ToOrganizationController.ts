import { BASE_URL } from "../types";

export async function saveOrganization(organizationData: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/organizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(organizationData)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to save organization: ${res.status} ${text}`);
    }
    return res.json();
}