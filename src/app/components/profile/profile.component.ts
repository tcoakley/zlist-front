import { Component, OnInit } from "@angular/core";
import { RouterLink, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { UserStore } from '../../stores/user.store';
import { UserModel } from "../../../models/user.model";

@Component({
	selector: "app-profile",
	standalone: true,
	imports: [RouterLink, FormsModule, AutofocusDirective],
	templateUrl: "./profile.component.html",
	styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnInit {
	isReady: boolean = false;
	originalUser: UserModel | null = null;

	// Form fields
	email: string = "";
	password: string = "";
	firstName: string = "";
	lastName: string = "";

	constructor(
		private snackbarService: SnackbarService,
		private userStore: UserStore,
		private router: Router
	) {}

	ngOnInit() {
		this.userStore.user$.subscribe(user => {
			console.log("user", user);
			if (user) {
				console.log("user", user);
				this.originalUser = { ...user };
				this.email = user.email;
				this.firstName = user.firstName;
				this.lastName = user.lastName;
				console.log("lastName", this.lastName);
				this.formReady();
			}
		});
	}

	formReady() {
		this.isReady = !!this.email && !!this.firstName && !!this.lastName && this.hasChanges();
	}

	hasChanges(): boolean {
		if (!this.originalUser) return false;
		return (
			this.email !== this.originalUser.email ||
			this.firstName !== this.originalUser.firstName ||
			this.lastName !== this.originalUser.lastName ||
			(!!this.password && this.password.trim().length > 0)
		);
	}

	saveForm() {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!emailRegex.test(this.email)) {
			this.snackbarService.showMessage("Please enter a valid email address.", "error");
			return;
		}

		const user: UserModel = {
			id: this.originalUser?.id,
			email: this.email,
			password: this.password || this.originalUser?.password || "",
			firstName: this.firstName,
			lastName: this.lastName
		};

		this.userStore.updateUser(user).subscribe({
			next: () => {
				this.snackbarService.showMessage("Profile updated successfully", "success");
				this.originalUser = { ...user, password: "" };
				this.password = "";
				this.formReady();
			},
			error: (error) => {
				this.snackbarService.showMessage(error, "error");
			}
		});
	}
}
