import { Component, OnInit, AfterViewInit, Input, ElementRef, ViewChild } from '@angular/core';

import * as d3 from 'd3';

@Component({
  selector: 'app-d3-svg',
  templateUrl: './d3-svg.component.html',
  styleUrls: ['./d3-svg.component.scss']
})
export class D3SvgComponent implements OnInit, AfterViewInit {
  @ViewChild('svg') svgNode: ElementRef;

  // provide a title text for the svg
  @Input() title = '';

  // paddings for the main svg element
  @Input() padTop = 0;
  @Input() padLeft = 0;
  @Input() padRight = 0;
  @Input() padBottom = 0;

  // values read from the element ref
  public elWidth = 0;
  public elHeight = 0;

  public width = 0;
  public height = 0;

  public svg: any;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.initSvg();
  }

  ngAfterViewInit() {
    this.onResize();
  }

  /**
   * onResize Call onResize when the element has resized and it needs to re-read the styling values
   */
  onResize() {
    const {width, height} = this.el.nativeElement.getBoundingClientRect();

    this.elWidth = width;
    this.elHeight = height;

    this.width = Math.round(width - this.padLeft - this.padRight);
    this.height = Math.round(height - this.padTop - this.padBottom);
  }

  /**
   * initSvg Create the main svg element and the title text
   */
  private initSvg() {
    const svg = d3.select(this.svgNode.nativeElement);

    if (this.title) {
      svg.append('text')
        .attr('class', 'title')
        .text(this.title);
    }

    this.svg = svg.append('g')
      .attr('transform', `translate(${this.padLeft}, ${this.padTop})`);
  }
}
