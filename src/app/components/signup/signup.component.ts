import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';

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

	constructor(private snackbarService: SnackbarService) {}

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

		console.log("Form submitted successfully with email:", this.email);
	}
}
