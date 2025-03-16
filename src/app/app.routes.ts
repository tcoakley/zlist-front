import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ListsComponent } from './components/lists/lists.component';
import { ForgotPasswordComponent } from './components/forgotPassword/forgotPassword.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent }, 
	{ path: 'signup', component: SignupComponent },
	{ path: 'lists', component: ListsComponent },
	{ path: 'forgotPassword', component: ForgotPasswordComponent },
	{ path: 'profile', component: ProfileComponent },
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
	{ path: '**', redirectTo: '/login' }, 
];
