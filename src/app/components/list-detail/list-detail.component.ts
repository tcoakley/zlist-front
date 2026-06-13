import { Component, OnInit, OnDestroy, AfterViewInit, inject, computed, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, CdkDrag, CdkDropList, CdkDragHandle, moveItemInArray } from '@angular/cdk/drag-drop';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { TitleService } from '../../services/title.service';
import { ListStore } from '../../stores/list/list.store';
import { ListItem, ListMember, ListPendingInvite } from '../../../models/list.model';
import { UserStore } from '../../stores/user/user.store';

interface EditableItem {
	id: number;
	listId: number;
	itemName: string;
	itemDescription: string | undefined;
	sortOrder: number;
	isDirty: boolean;
	isExpanded: boolean;
	isSaving: boolean;
}

@Component({
	selector: 'app-list-detail',
	standalone: true,
	imports: [FormsModule, AutofocusDirective, CdkDropList, CdkDrag, CdkDragHandle, RouterLink],
	templateUrl: './list-detail.component.html',
	styleUrls: ['./list-detail.component.scss'],
})
export class ListDetailComponent implements OnInit, OnDestroy, AfterViewInit {
	protected listStore = inject(ListStore);
	protected userStore = inject(UserStore);
	protected loading = true;
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private titleService = inject(TitleService);
	private snackbarService = inject(SnackbarService);

	@ViewChildren('itemNameInput') itemNameInputs!: QueryList<ElementRef<HTMLInputElement>>;

	readonly isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

	listId = 0;

	editingHeader = false;
	editedName = '';
	editedDesc = '';
	isSavingHeader = false;

	editableItems: EditableItem[] = [];
	confirmingDeleteItemId: number | null = null;

	activeTab: 'items' | 'members' = 'items';

	// Members
	members: ListMember[] = [];
	pendingInvites: ListPendingInvite[] = [];
	membersLoading = false;
	showInviteForm = false;
	inviteEmail = '';
	isSendingInvite = false;
	confirmingRemoveMemberId: number | null = null;

	// Sponsor confirmation prompt
	sponsorPromptEmail: string | null = null;
	isConfirmingSponsor = false;

	protected list = computed(() => this.listStore.lists().find(l => l.id === this.listId));

	get nameDirty(): boolean {
		return this.editingHeader && this.editedName.trim() !== (this.list()?.listName ?? '');
	}

	get descDirty(): boolean {
		return this.editingHeader && (this.editedDesc.trim() || '') !== (this.list()?.listDescription ?? '');
	}

	get headerDirty(): boolean {
		return this.nameDirty || this.descDirty;
	}

	get hasDirty(): boolean {
		return this.headerDirty || this.editableItems.some(i => i.isDirty && i.itemName.trim().length > 0);
	}

	get isSavingAny(): boolean {
		return this.isSavingHeader || this.editableItems.some(i => i.isSaving);
	}

	get saveDisabled(): boolean {
		return this.isSavingAny || (this.editingHeader && !this.editedName.trim());
	}

	ngOnInit() {
		this.listId = Number(this.route.snapshot.paramMap.get('id'));
		this.titleService.setHelpContext('edit-list');

		this.titleService.setActionButton({
			label: 'Save',
			show: () => this.hasDirty,
			disabled: () => this.saveDisabled,
			loading: () => this.isSavingAny,
			action: () => this.saveAll(),
		});

		// Pre-populate from cache so first render isn't empty
		const cached = this.list();
		if (cached) {
			this.titleService.setTitle(cached.listName);
			this.editableItems = cached.items.map(i => this.toEditable(i)).concat([this.createDraft()]);
		}

		if (!this.listStore.lists().length) {
			this.listStore.loadLists().then(() => this.initItems());
		} else {
			this.initItems();
		}
	}

	ngAfterViewInit(): void {
		setTimeout(() => this.loading = false, 100);
	}

	ngOnDestroy() {
		this.titleService.setActionButton(null);
		this.titleService.setHelpContext(null);
	}

	private async initItems() {
		const list = await this.listStore.loadList(this.listId);
		if (!list) {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
			this.router.navigate(['/lists']);
			return;
		}
		this.titleService.setTitle(list.listName);
		this.editableItems = list.items.map(i => this.toEditable(i)).concat([this.createDraft()]);
		this.focusDraftItem();
		this.loadMembers();
	}

	async loadMembers() {
		this.membersLoading = true;
		const [members, invites] = await Promise.all([
			this.listStore.getListMembers(this.listId),
			this.listStore.getPendingInvitations(this.listId),
		]);
		if (members) this.members = members;
		if (invites) this.pendingInvites = invites;
		this.membersLoading = false;
	}

	getMemberInitials(member: ListMember): string {
		return (member.firstName.charAt(0) + member.lastName.charAt(0)).toUpperCase();
	}

	isCurrentUser(member: ListMember): boolean {
		return member.userId === this.userStore.user()?.id;
	}

	get isOwner(): boolean {
		return this.list()?.isOwner ?? false;
	}

	openInviteForm() {
		this.showInviteForm = true;
		this.inviteEmail = '';
	}

	cancelInvite() {
		this.showInviteForm = false;
		this.inviteEmail = '';
	}

	async sendInvite() {
		if (!this.inviteEmail.trim() || this.isSendingInvite) return;
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(this.inviteEmail.trim())) {
			this.snackbarService.showMessage('Please enter a valid email address.', 'error');
			return;
		}
		this.isSendingInvite = true;
		const result = await this.listStore.inviteToList(this.listId, this.inviteEmail.trim());
		if (result === null) {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
		} else if (result.requiresSponsor) {
			this.sponsorPromptEmail = this.inviteEmail.trim();
			this.showInviteForm = false;
			this.inviteEmail = '';
		} else {
			const msg = result.message ?? 'Invitation sent!';
			this.snackbarService.showMessage(msg, result.message ? 'warning' : 'success');
			this.showInviteForm = false;
			this.inviteEmail = '';
			const invites = await this.listStore.getPendingInvitations(this.listId);
			if (invites) this.pendingInvites = invites;
		}
		this.isSendingInvite = false;
	}

	async confirmSponsor() {
		if (!this.sponsorPromptEmail || this.isConfirmingSponsor) return;
		this.isConfirmingSponsor = true;
		const result = await this.listStore.inviteToList(this.listId, this.sponsorPromptEmail, true);
		if (result === null) {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
		} else {
			this.snackbarService.showMessage('Invitation sent! $1/month added to your subscription.', 'success');
			this.sponsorPromptEmail = null;
			const invites = await this.listStore.getPendingInvitations(this.listId);
			if (invites) this.pendingInvites = invites;
		}
		this.isConfirmingSponsor = false;
	}

	async declineSponsor() {
		if (!this.sponsorPromptEmail || this.isConfirmingSponsor) return;
		this.isConfirmingSponsor = true;
		const result = await this.listStore.inviteToList(this.listId, this.sponsorPromptEmail, false);
		if (result === null) {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
		} else {
			this.snackbarService.showMessage('Invitation sent. Recipient will need a Premium account to accept.', 'warning');
			this.sponsorPromptEmail = null;
			const invites = await this.listStore.getPendingInvitations(this.listId);
			if (invites) this.pendingInvites = invites;
		}
		this.isConfirmingSponsor = false;
	}

	cancelSponsorPrompt() {
		this.sponsorPromptEmail = null;
	}

	startRemoveMember(userId: number) {
		this.confirmingRemoveMemberId = userId;
	}

	cancelRemoveMember() {
		this.confirmingRemoveMemberId = null;
	}

	async confirmRemoveMember(userId: number) {
		this.confirmingRemoveMemberId = null;
		const ok = await this.listStore.removeListMember(this.listId, userId);
		if (ok) {
			this.members = this.members.filter(m => m.userId !== userId);
			this.snackbarService.showMessage('Member removed.', 'success');
		} else {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
		}
	}

	private focusDraftItem() {
		setTimeout(() => {
			const inputs = this.itemNameInputs?.toArray();
			if (inputs?.length) {
				inputs[inputs.length - 1].nativeElement.focus();
			}
		});
	}

	private toEditable(item: ListItem): EditableItem {
		return {
			id: item.id,
			listId: item.listId,
			itemName: item.itemName,
			itemDescription: item.itemDescription,
			sortOrder: item.sortOrder,
			isDirty: false,
			isExpanded: false,
			isSaving: false,
		};
	}

	private createDraft(): EditableItem {
		return { id: 0, listId: this.listId, itemName: '', itemDescription: undefined, sortOrder: 0, isDirty: false, isExpanded: false, isSaving: false };
	}

	goBack() {
		this.router.navigate(['/lists']);
	}

	async launchList() {
		const run = await this.listStore.createListRun(this.listId);
		if (run) {
			this.router.navigate(['/lists', this.listId, 'run', run.id]);
		} else {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
		}
	}

	// --- Header editing ---

	toggleHeaderEdit() {
		if (this.editingHeader) {
			this.editingHeader = false;
		} else {
			this.editedName = this.list()?.listName ?? '';
			this.editedDesc = this.list()?.listDescription ?? '';
			this.editingHeader = true;
		}
	}

	private async saveHeader(): Promise<boolean> {
		const l = this.list();
		if (!l || !this.editedName.trim()) return false;
		this.isSavingHeader = true;
		const ok = await this.listStore.editList({
			...l,
			listName: this.editedName.trim(),
			listDescription: this.editedDesc.trim() || undefined,
		});
		this.isSavingHeader = false;
		if (!ok) {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
			return false;
		}
		this.titleService.setTitle(this.editedName.trim());
		this.editingHeader = false;
		return true;
	}

	// --- Drag and drop ---

	onDragStart() {
		(document.activeElement as HTMLElement)?.blur();
	}

	onDrop(event: CdkDragDrop<EditableItem[]>) {
		if (event.previousIndex === event.currentIndex) return;
		const draftIndex = this.editableItems.length - 1;
		const targetIndex = Math.min(event.currentIndex, draftIndex - 1);
		if (event.previousIndex === targetIndex) return;
		moveItemInArray(this.editableItems, event.previousIndex, targetIndex);
		this.editableItems.filter(i => i.itemName.trim()).forEach((item, i) => {
			item.sortOrder = i + 1;
			item.isDirty = true;
		});
		this.editableItems = [...this.editableItems];
	}

	// --- Item editing ---

	onItemNameTab(event: Event, index: number) {
		event.preventDefault();
		const inputs = this.itemNameInputs.toArray();
		const next = inputs[index + 1];
		if (next) {
			next.nativeElement.focus();
		}
	}

	onItemNameChange(item: EditableItem, index: number) {
		item.isDirty = true;
		if (index === this.editableItems.length - 1 && item.itemName.trim()) {
			this.editableItems = [...this.editableItems, this.createDraft()];
		}
	}

	onItemDescChange(item: EditableItem) {
		item.isDirty = true;
	}

	async onItemBlur(item: EditableItem) {
		if (this.isMobile && item.isDirty && item.itemName.trim()) {
			await this.saveItem(item);
		}
	}

	async onHeaderBlur() {
		if (this.isMobile && this.headerDirty && this.editedName.trim()) {
			await this.saveHeader();
		}
	}

	toggleExpand(item: EditableItem) {
		item.isExpanded = !item.isExpanded;
	}

	async saveAll() {
		if (this.headerDirty) {
			const ok = await this.saveHeader();
			if (!ok) return;
		}

		const dirty = this.editableItems.filter(i => i.isDirty && i.itemName.trim());
		for (const item of dirty) {
			await this.saveItem(item);
			if (this.listStore.error()) break;
		}
		this.focusDraftItem();
	}

	async saveItem(item: EditableItem) {
		if (!item.itemName.trim() || item.isSaving) return;
		item.isSaving = true;

		if (item.id === 0) {
			const savedCount = this.editableItems.filter(i => i.id > 0).length;
			const newItem = await this.listStore.addListItem({
				id: 0,
				listId: this.listId,
				itemName: item.itemName.trim(),
				itemDescription: item.itemDescription?.trim() || undefined,
				sortOrder: savedCount + 1,
			});
			if (newItem) {
				item.id = newItem.id;
				item.sortOrder = newItem.sortOrder;
				item.isDirty = false;
			} else {
				this.snackbarService.showMessage(this.listStore.error(), 'error');
			}
		} else {
			const ok = await this.listStore.editListItem({
				id: item.id,
				listId: item.listId,
				itemName: item.itemName.trim(),
				itemDescription: item.itemDescription?.trim() || undefined,
				sortOrder: item.sortOrder,
			});
			if (ok) {
				item.isDirty = false;
			} else {
				this.snackbarService.showMessage(this.listStore.error(), 'error');
			}
		}

		item.isSaving = false;
	}

	startDeleteItem(item: EditableItem) {
		this.confirmingDeleteItemId = item.id;
	}

	cancelDeleteItem() {
		this.confirmingDeleteItemId = null;
	}

	async deleteItem(item: EditableItem) {
		this.confirmingDeleteItemId = null;
		await this.listStore.deleteListItem(item.id);
		if (this.listStore.error()) {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
			return;
		}
		this.editableItems = this.editableItems.filter(i => i !== item);
	}
}
