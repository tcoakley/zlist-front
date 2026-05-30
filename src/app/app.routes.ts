import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ListsComponent } from './components/lists/lists.component';
import { ListDetailComponent } from './components/list-detail/list-detail.component';
import { ListRunComponent } from './components/list-run/list-run.component';
import { ForgotPasswordComponent } from './components/forgotPassword/forgotPassword.component';
import { ProfileComponent } from './components/profile/profile.component';
import { TermsComponent } from './components/terms/terms.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { AboutComponent } from './components/about/about.component';
import { ListHistoryComponent } from './components/list-history/list-history.component';
import { InviteAcceptComponent } from './components/invite-accept/invite-accept.component';
import { SelectListsComponent } from './components/select-lists/select-lists.component';
import { UpgradeComponent } from './components/upgrade/upgrade.component';
import { ContactComponent } from './components/contact/contact.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'signup', component: SignupComponent },
	{ path: 'forgotPassword', component: ForgotPasswordComponent },
	{ path: 'invite/:token', component: InviteAcceptComponent },
	{ path: 'select-lists', component: SelectListsComponent },
	{ path: 'upgrade', component: UpgradeComponent, canActivate: [AuthGuard] },
	{ path: 'lists', component: ListsComponent, canActivate: [AuthGuard] },
	{ path: 'lists/:id', component: ListDetailComponent, canActivate: [AuthGuard] },
	{ path: 'lists/:listId/run/:runId', component: ListRunComponent, canActivate: [AuthGuard] },
	{ path: 'lists/:listId/history', component: ListHistoryComponent, canActivate: [AuthGuard] },
	{ path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
	{ path: 'contact', component: ContactComponent, canActivate: [AuthGuard] },
	{ path: 'about', component: AboutComponent },
	{ path: 'terms', component: TermsComponent },
	{ path: 'privacy', component: PrivacyComponent },
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
	{ path: '**', redirectTo: '/login' },
];
