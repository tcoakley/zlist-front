import { Injectable, NgZone, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { ListRunItem } from '../../models/list.model';
import { environment } from '../../environments/environment';

export interface RunHubCallbacks {
	onItemToggled: (runItemId: number, isComplete: boolean, completedByInitials: string, completedByName: string) => void;
	onRunCompleted: () => void;
	onItemAdded: (item: ListRunItem) => void;
	onRunDeleted: () => void;
}

@Injectable({ providedIn: 'root' })
export class RunHubService {
	private ngZone = inject(NgZone);
	private connection: signalR.HubConnection | null = null;
	private currentRunId = 0;
	private currentInitials = '';
	private currentDisplayName = '';

	async connect(runId: number, initials: string, displayName: string, callbacks: RunHubCallbacks): Promise<void> {
		this.currentRunId = runId;
		this.currentInitials = initials;
		this.currentDisplayName = displayName;

		const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';

		this.connection = new signalR.HubConnectionBuilder()
			.withUrl(`${environment.apiUrl}/hubs/run`, { accessTokenFactory: () => token })
			.withAutomaticReconnect()
			.configureLogging(signalR.LogLevel.Information)
			.build();

		this.connection.on('ItemToggled', (runItemId: number, isComplete: boolean, completedByInitials: string, completedByName: string) => {
			this.ngZone.run(() => callbacks.onItemToggled(runItemId, isComplete, completedByInitials, completedByName));
		});

		this.connection.on('RunCompleted', () => {
			this.ngZone.run(() => callbacks.onRunCompleted());
		});

		this.connection.on('ItemAdded', (item: ListRunItem) => {
			this.ngZone.run(() => callbacks.onItemAdded(item));
		});

		this.connection.on('RunDeleted', () => {
			this.ngZone.run(() => callbacks.onRunDeleted());
		});

		this.connection.onreconnected(async () => {
			console.log('[SignalR] Reconnected — rejoining run group', runId);
			try {
				await this.connection!.invoke('JoinRun', this.currentRunId, this.currentInitials, this.currentDisplayName);
			} catch (err) {
				console.error('[SignalR] Failed to rejoin group after reconnect', err);
			}
		});

		this.connection.onclose(err => {
			if (err) console.error('[SignalR] Connection closed with error', err);
		});

		await this.connection.start();
		console.log('[SignalR] Connected, joining run', runId);
		await this.connection.invoke('JoinRun', runId, initials, displayName);
		console.log('[SignalR] Joined run group', runId);
	}

	async disconnect(): Promise<void> {
		if (this.connection) {
			await this.connection.stop();
			this.connection = null;
		}
	}
}
