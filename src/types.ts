export const BASE_URL = 'http://localhost:8081';

export type SolverStatus = 'NOT_SOLVING' | 'SOLVING_ACTIVE' | string;

export interface Timeslot {
    id: number;
    location: number;
    dayOfWeek: string; // "MONDAY"
    startTime: string; // "08:00"
    endTime: string;   // "09:30"
    partTime?: boolean; // true for weekend/part-time slots
}

export interface StudentGroup {
    id: number;
    location: number;
    name: string;
    partTime?: boolean; // true for part-time groups
}

export interface Teacher {
    id: number;
    location: number;
    firstName: string;
    lastName: string;
}

export interface StudentGroup {
    id: number;
    location: number;
    name: string;
}

export interface Room {
    id: number;
    location: number;
    name: string;
}

export interface Lesson {
    id: number;
    location: number;
    subject: string;
    teacher: { 
        id: number; 
        firstName: string; 
        lastName: string; 
        birthDate?: string;
        email?: string;
        telephone?: string;
        locationId?: number;
    };
    studentGroup: { 
        id: number; 
        name: string; 
        locationId?: number;
    };
    room: { id: number; name: string };
    timeslot: { id: number; dayOfWeek: string; startTime: string; endTime: string };
    fixed: boolean;
}

export interface HardSoftScore {
    hardScore: number;
    softScore: number;
}

export interface Timetable {
    name: string | null;
    timeslots: Timeslot[] | null;
    rooms: Room[] | null;
    lessons: Lesson[] | null;
    score: string;
    solverStatus: SolverStatus;
}

export interface Schedule {
    id: number;
    name?: string;
    location?: number;
    created?: string;
    createdBy?: string;
    lastModified?: string;
    lastModifiedBy?: string;
    score?: string;
    lessons: Lesson[];
}

export interface LoginResponse {
    id: number;
    login: string;
    firstName?: string;
    lastName?: string;
    token: string;
}

export interface RegisterRequest {
    login: string;
    password: string;
}

export interface RegisterResponse {
    id: number;
    login: string;
    role: string; // expected to be USER by default on backend
}

