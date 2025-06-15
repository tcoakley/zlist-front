import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ListsComponent } from './components/lists/lists.component';
import { ForgotPasswordComponent } from './components/forgotPassword/forgotPassword.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'signup', component: SignupComponent },
	{ path: 'forgotPassword', component: ForgotPasswordComponent },
	{ path: 'lists', component: ListsComponent, canActivate: [AuthGuard] }, 
	{ path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] }, 
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
	{ path: '**', redirectTo: '/login' },
];
