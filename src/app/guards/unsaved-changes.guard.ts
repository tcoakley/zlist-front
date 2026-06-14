import { CanDeactivateFn } from '@angular/router';
import { ListDetailComponent } from '../components/list-detail/list-detail.component';

export const unsavedChangesGuard: CanDeactivateFn<ListDetailComponent> = (component) => {
	if (component.hasDirty) {
		return confirm('You have unsaved changes. If you leave now, your changes will be lost.');
	}
	return true;
};
