import { Directive, OnInit, AfterViewInit, Input, ElementRef } from '@angular/core';

/**
 * Dropdown directive
 * Adds an `active` state to [dropdownMenu], when the [dropdownTrigger] is clicked
 * Removes the active state if user clicks the document
 * If `allowMenuClick` is passed, will not deactivate when clicking inside [dropdownMenu]
 */

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective implements AfterViewInit, OnInit {
  @Input() appDropdown = '';
  private options = {
    clickInside: false,
  };

  // get the main element
  get el() {
    return this.ref.nativeElement;
  }

  // get the trigger
  get trigger() {
    return this.el.querySelector('[dropdownTrigger]') || this.el;
  }

  // get the droppdown menu element
  get menu() {
    return this.el.querySelector('[dropdownMenu]');
  }

  constructor(private ref: ElementRef) {}

  ngOnInit() {
    // check if `allowMenuClick` was passed
    this.options.clickInside = this.appDropdown === 'allowMenuClick';
  }

  ngAfterViewInit() {
    // do nothing if trigger is missing
    if (!this.trigger) {
      return;
    }

    // add `click` listener on trigger
    this.trigger.addEventListener('click', this.toggle, false);
  }

  /**
   * isActive Check if dropdown is active
   */
  isActive() {
    return this.menu.classList.contains('active');
  }

  /**
   * toggle Toggle the active state
   * @param toggle Pass in the final state is should end in
   */
  toggle = (toggle) => {
    if (!this.menu) {
      return;
    }

    // open or close the menu depending on current state or the `toggle` param
    this.setOpen(typeof toggle === 'boolean' ? toggle : !this.isActive());

    if (!this.isActive()) {
      // remove the click listener
      return document.removeEventListener('click', this.hide, false);
    }

    // exit current event loop, and listen for click outside
    setTimeout(() =>
      document.addEventListener('click', this.hide, false));
  }

  /**
   * hide Hide the dropdown
   * @param ev The mouse event
   */
  hide = (ev: MouseEvent) => {
    // do nothing if click is on trigger (the trigger is already hooked to `this.toggle`)
    if (this.trigger.contains(ev.target)) {
      return;
    }

    const { clickInside } =  this.options;
    if (clickInside && this.menu.contains(ev.target)) {
      return;
    }

    this.toggle(false);
  }

  /**
   * setOpen Set the passed in state
   * @param open The state to be applied
   */
  setOpen(open) {
    const action = open ? 'add' : 'remove';

    this.menu.classList[action]('active');
    this.el.classList[action]('open');
  }
}
