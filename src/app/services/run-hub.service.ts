import { Injectable, NgZone, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { ListRunItem } from '../../models/list.model';

export interface RunHubCallbacks {
	onItemToggled: (runItemId: number, isComplete: boolean, completedByInitials: string) => void;
	onRunCompleted: () => void;
	onItemAdded: (item: ListRunItem) => void;
}

@Injectable({ providedIn: 'root' })
export class RunHubService {
	private ngZone = inject(NgZone);
	private connection: signalR.HubConnection | null = null;
	private currentRunId = 0;
	private currentInitials = '';

	async connect(runId: number, initials: string, callbacks: RunHubCallbacks): Promise<void> {
		this.currentRunId = runId;
		this.currentInitials = initials;

		const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';

		this.connection = new signalR.HubConnectionBuilder()
			.withUrl('/hubs/run', { accessTokenFactory: () => token })
			.withAutomaticReconnect()
			.configureLogging(signalR.LogLevel.Information)
			.build();

		this.connection.on('ItemToggled', (runItemId: number, isComplete: boolean, completedByInitials: string) => {
			this.ngZone.run(() => callbacks.onItemToggled(runItemId, isComplete, completedByInitials));
		});

		this.connection.on('RunCompleted', () => {
			this.ngZone.run(() => callbacks.onRunCompleted());
		});

		this.connection.on('ItemAdded', (item: ListRunItem) => {
			this.ngZone.run(() => callbacks.onItemAdded(item));
		});

		this.connection.onreconnected(async () => {
			console.log('[SignalR] Reconnected — rejoining run group', runId);
			try {
				await this.connection!.invoke('JoinRun', this.currentRunId, this.currentInitials);
			} catch (err) {
				console.error('[SignalR] Failed to rejoin group after reconnect', err);
			}
		});

		this.connection.onclose(err => {
			if (err) console.error('[SignalR] Connection closed with error', err);
		});

		await this.connection.start();
		console.log('[SignalR] Connected, joining run', runId);
		await this.connection.invoke('JoinRun', runId, initials);
		console.log('[SignalR] Joined run group', runId);
	}

	async disconnect(): Promise<void> {
		if (this.connection) {
			await this.connection.stop();
			this.connection = null;
		}
	}
}
