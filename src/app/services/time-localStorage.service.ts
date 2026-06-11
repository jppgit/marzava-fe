import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TimeRecord {
    id?: number;
    minutes: number;
    orderId: number;
    taskName?: string;
    createdAt?: string;
}

export interface TimeStats {
    today: number;
    total: number;
}

@Injectable({
    providedIn: 'root'
})
export class TimeLocalStorageService {
    private apiUrl = `${environment.api_host}/times`;

    constructor(private http: HttpClient) { }

    private timeTrackExists(orderId: number, createdAt: string): boolean {
        if (!localStorage.getItem('timeTrack')) return false;
        const timesToTrack = JSON.parse(localStorage.getItem('timeTrack') || '[]');
        for (const time of timesToTrack) {
            if (time.orderId === orderId && time.createdAt === createdAt) {
                return true;
            }
        }
        return false;
    }

    saveTimeTrack(newTime: TimeRecord): void {
        const timesToTrack = JSON.parse(localStorage.getItem('timeTrack') || '[]');
        if (!this.timeTrackExists(newTime.orderId, newTime.createdAt + "")) {
            timesToTrack.push(newTime);
            localStorage.setItem('timeTrack', JSON.stringify(timesToTrack));
        }
    }

    existsTimeTracks(): boolean {
        return localStorage.getItem('timeTrack') !== null && JSON.parse(localStorage.getItem('timeTrack') || '[]').length > 0;
    }

    getTimeTracks(): TimeRecord[] {
        return JSON.parse(localStorage.getItem('timeTrack') || '[]');
    }

    clearTimeTracks(i: number): boolean {
        const timesToTrack = JSON.parse(localStorage.getItem('timeTrack') || '[]');
        const newTimesToTrack = timesToTrack.filter((time: TimeRecord, index: number) => i !== index);
        localStorage.setItem('timeTrack', JSON.stringify(newTimesToTrack));
        return true;
    }


}
