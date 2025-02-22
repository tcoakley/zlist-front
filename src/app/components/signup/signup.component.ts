import { Component, OnInit } from "@angular/core";
import { RouterLink, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { AuthService } from '../../services/auth.service';
import { UserModel } from "../../../models/user.model";

@Component({
	selector: "app-signup",
	standalone: true,
	imports: [RouterLink, FormsModule, AutofocusDirective],
	templateUrl: "./signup.component.html",
	styleUrls: ["./signup.component.scss"]
})
export class SignupComponent implements OnInit {
	isReady: boolean = false;

	// Form fields
	email: string = "";
	password: string = "";
	firstName: string = "";
	lastName: string = "";

	constructor(
		private snackbarService: SnackbarService,
		private authService: AuthService,
		private router: Router
	) {}

	ngOnInit() {
		this.formReady();
	}

	formReady() {
		this.isReady = !!this.email && !!this.password && !!this.firstName && !!this.lastName;
	}

	saveForm() {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!emailRegex.test(this.email)) {
			this.snackbarService.showMessage("Please enter a valid email address.", "error");
			return;
		}

		const user: UserModel = {
			email: this.email,
			password: this.password,
			firstName: this.firstName,
			lastName: this.lastName
		}

		this.authService.signUp(user).subscribe({
			next: (response) => {
				console.log("response", response);
				this.snackbarService.showMessage("Singup successful", "success");
				setTimeout(() => {
					this.router.navigate(['/login']);
				}, 50);
			},
			error: (error) => {
				this.snackbarService.showMessage(error, "error");
			}
		});
		
	}
}
