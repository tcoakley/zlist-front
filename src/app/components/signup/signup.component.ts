import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";

@Component({
	selector: "app-signup",
	standalone: true,
	imports: [RouterLink, FormsModule],
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

	ngOnInit() {
		this.validateForm();
	}

	validateForm() {
		this.isReady = !!this.email && !!this.password && !!this.firstName && !!this.lastName;
	}

	test() {
		console.log("Form submitted successfully!");
	}
}
