import { Directive, ElementRef, AfterViewInit, Renderer2, Input } from '@angular/core';

@Directive({
	selector: '[appAutofocus]',
	standalone: true
})
export class AutofocusDirective implements AfterViewInit {
	@Input('appAutofocus') enabled: boolean | '' = true;

	constructor(private el: ElementRef, private renderer: Renderer2) {}

	ngAfterViewInit() {
		if (this.enabled === false) return;
		if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;
		setTimeout(() => {
			this.renderer.selectRootElement(this.el.nativeElement).focus();
		});
	}
}
