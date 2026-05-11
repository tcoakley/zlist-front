import { Component, OnInit, OnDestroy, inject, computed, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, CdkDrag, CdkDropList, CdkDragHandle, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { TitleService } from '../../services/title.service';
import { ListStore } from '../../stores/list/list.store';
import { UserStore } from '../../stores/user/user.store';
import { ListItem } from '../../../models/list.model';

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
	imports: [FormsModule, AutofocusDirective, RouterLink, CdkDropList, CdkDrag, CdkDragHandle, MatIconModule],
	templateUrl: './list-detail.component.html',
	styleUrls: ['./list-detail.component.scss'],
})
export class ListDetailComponent implements OnInit, OnDestroy {
	protected listStore = inject(ListStore);
	protected userStore = inject(UserStore);
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private titleService = inject(TitleService);
	private snackbarService = inject(SnackbarService);

	helpExpanded = false;

	toggleHelp() {
		this.helpExpanded = !this.helpExpanded;
	}

	@ViewChildren('itemNameInput') itemNameInputs!: QueryList<ElementRef<HTMLInputElement>>;

	readonly isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

	listId = 0;

	editingHeader = false;
	editedName = '';
	editedDesc = '';
	isSavingHeader = false;

	editableItems: EditableItem[] = [];

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

		this.titleService.setActionButton({
			label: 'Save',
			show: () => this.hasDirty,
			disabled: () => this.saveDisabled,
			loading: () => this.isSavingAny,
			action: () => this.saveAll(),
		});

		if (!this.listStore.lists().length) {
			this.listStore.loadLists().then(() => this.initItems());
		} else {
			this.initItems();
		}
	}

	ngOnDestroy() {
		this.titleService.setActionButton(null);
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

	async deleteItem(item: EditableItem) {
		await this.listStore.deleteListItem(item.id);
		if (this.listStore.error()) {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
			return;
		}
		this.editableItems = this.editableItems.filter(i => i !== item);
	}
}
