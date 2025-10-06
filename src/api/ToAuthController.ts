import {BASE_URL, type LoginResponse, type RegisterRequest, type RegisterResponse} from "../types";

export async function login(login: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to login: ${res.status} ${text}`);
    }
    return res.json();
}

// Registers a new account. Backend should default role to USER (not ADMIN).
export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
    const res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to register: ${res.status} ${text}`);
    }
    return res.json();
}