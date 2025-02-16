import { Directive, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';

@Directive({
	selector: '[appAutofocus]',
	standalone: true
})
export class AutofocusDirective implements AfterViewInit {
	constructor(private el: ElementRef, private renderer: Renderer2) {}

	ngAfterViewInit() {
		setTimeout(() => {
			this.renderer.selectRootElement(this.el.nativeElement).focus();
		});
	}
}
