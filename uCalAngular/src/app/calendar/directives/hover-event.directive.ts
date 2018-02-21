import { Directive, OnInit, Input, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appHoverEvent]'
})
export class HoverEventDirective implements OnInit{
  @Input() button: HTMLElement;
  @HostListener('mouseenter') onMouseEnter() {
    this.button.style.visibility = 'visible';
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.button.style.visibility = 'hidden';
  }
  ngOnInit() {
    this.button.style.visibility = 'hidden';
  }
  constructor(private el: ElementRef) { }

}
