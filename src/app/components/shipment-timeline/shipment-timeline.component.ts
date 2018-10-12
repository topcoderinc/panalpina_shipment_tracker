import * as d3 from 'd3';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, Input } from '@angular/core';

import { interval, fromEvent, merge } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';

import { D3SvgComponent } from '../d3-svg/d3-svg.component';

// store the time for a day
const day = 3600 * 24;

// we need to display the duration for long periods of time on the timeline
// getDuration will return the number of days & hours passed
const getDuration = (start, end) => {
  const duration = (end - start) / 1000;
  const days = Math.floor(duration / day);

  if (days < 2) {
    return '';
  }

  const hours = Math.floor((duration - days * day) / 3600);
  return `${days}d ${hours}h`;
};

@Component({
  selector: 'app-shipment-timeline',
  templateUrl: './shipment-timeline.component.html',
  styleUrls: ['./shipment-timeline.component.scss']
})
export class ShipmentTimelineComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(D3SvgComponent) d3Svg: D3SvgComponent;
  @Input() items = [];

  start = new Date().getTime();
  end = new Date().getTime();

  // we need to unsubscribe from the
  // window events once the component is destroyed
  rxSub = null;

  // padding for the timeline
  public padTop = 75;
  public padBottom = 64;
  public padLeft = 370;

  // x and y scales for the chart
  private xScale;
  private yScale;

  // function to update the chart axis on data update
  private updateAxis;

  private cursor: any;

  getTime() {
    return new Date().getTime();
  }

  ngOnInit() {
    // convert the start & end properties on the passed items to Date, for ease of use
    this.items = this.items.map(i => ({...i, start: +new Date(i.start), end: +new Date(i.end)}));

    // get the start & end of the timeline
    this.start = new Date(Math.min(...this.items.map(item => item.start))).setHours(0, 0, 0, 0);
    this.end = new Date(Math.max(...this.items.map(item => item.end)) + 2 * day * 1000).setHours(0, 0, 0, 0);
  }

  ngAfterViewInit() {
    this.renderTimeline();
  }

  /**
   * Initial render of the timeline element
   */
  renderTimeline() {
    this.d3Svg.onResize();

    const { svg } = this.d3Svg;
    const svgWidth = this.d3Svg.width;
    const svgHeight = this.d3Svg.height;

    // create the x and y scales, set their domains
    // Y scale is a band scale
    this.xScale = d3.scaleTime().range([0, svgWidth]);
    this.yScale = d3.scaleBand().range([svgHeight, 0]);

    svg.append('g').attr('class', 'bars-wrap');

    d3.select(this.d3Svg.svgNode.nativeElement).select('.title')
      .attr('transform', 'translate(32, 35)');

    // create the graph's axis
    const xAxis = svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, 0)`);

    const bottomLine = svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, ${svgHeight})`);

    bottomLine.append('path')
        .attr('class', 'domain')
        .attr('d', `M0.5,0V0.5H${svgWidth}`);

    const yAxis = svg.append('g')
      .attr('class', 'axis axis--y')
      .attr('transform', 'translate(-288, 0)');

    // the vertical line behind the short badges
    const verticalLine = yAxis.append('line').attr('class', 'v-line');

    // create and store the update axis function
    this.updateAxis = (items) => {
      const { width, height } = this.d3Svg;

      this.xScale.range([0, width]);
      this.yScale.range([height, 0]);

      bottomLine
        .attr('transform', `translate(0, ${height})`)
        .select('path')
          .attr('d', `M0.5,0V0.5H${width}`);

      // update the x axis ticks & band widths
      xAxis.call(
        d3.axisTop(this.xScale)
          .ticks(d3.timeDay.every(1))
          .tickFormat(d3.timeFormat('%d'))
          .tickSizeInner(-height)
          .tickSizeOuter(this.padTop)
      );

      xAxis.selectAll('.tick text')
        .attr('transform', 'translate(0, -7)');

      // update the y axis ticks
      yAxis.call(
        d3.axisLeft(this.yScale)
          .tickSize(0)
          .tickSizeOuter(this.padLeft)
      );

      yAxis.select('.domain')
        .attr('transform', 'translate(288, 0)');

      // set the month + year at the begining of each month
      xAxis.selectAll('.tick')
        .each(function(d, i) {
          if (i !== 1 && d.getDate() !== 1) {
            return;
          }

          d3.select(this).selectAll('.mnth-label').remove();
          d3.select(this).append('text')
            .attr('class', 'mnth-label')
            .attr('transform', 'translate(0, -40)')
            .text(d3.timeFormat('%B %Y'));
        });

      // add the short texts before the yAxis' labels
      const now = this.getTime();
      yAxis.selectAll('.tick')
        .each(function(_, i) {
          d3.select(this).select('.short-status').remove();

          const g = d3.select(this)
            .append('g')
            .attr('class', `short-status ${items[i].end > now ? 'in-progress' : ''}`)
            .attr('transform', 'translate(-31, 0)');

          let bb = null;
          const paddingV = 10; // vertical padding
          const paddingH = 15; // horizontal padding
          const rx = 12; // border-radius

          const rect = g.append('rect'); // background rectangle

          g.append('text').text(items[i].short)
            .attr('dy', '.25em')
            .each(function() { bb = this.getBBox(); });

          rect.attr('rx', rx).attr('ry', rx) // position the background
            .attr('x', d => -bb.width / 2 - paddingH / 2)
            .attr('y', d => -bb.height / 2 - paddingV / 2)
            .attr('width', d => bb.width + paddingH)
            .attr('height', d => bb.height + paddingV);
        });

      const dom = this.yScale.domain();
      verticalLine
        .attr('y1', this.yScale(dom[0]))
        .attr('y2', this.yScale(dom[dom.length - 1]))
        .attr('transform', `translate(-30, ${this.yScale.bandwidth() / 2})`);
    };

    // add current time indicator - vertical cursor
    this.cursor = svg.append('g')
      .attr('class', 'cursor');

    this.cursor.append('line')
      .attr('y1', 0)
      .attr('y2', svgHeight + this.padBottom / 2);

    // add the cursor text
    const cursorText = this.cursor.append('g')
      .attr('class', 'cursor-text');

    cursorText.append('rect')
      .attr('rx', 12).attr('ry', 12);

    cursorText.append('text')
      .attr('dy', '.25em');

    // render the timeline data
    this.updateTimeline();

    // update the timeline at the begining of each minute & on window resize
    const timer = interval(1000).map(() => (new Date).getMinutes()).distinctUntilChanged();
    const onResize = fromEvent(window, 'resize');

    this.rxSub = merge(timer, onResize).subscribe(this.updateTimeline.bind(this));
  }

  /**
   * Constant update of the timeline & render the timeline data
   */
  updateTimeline() {
    const items = this.items.sort((a, b) => b.id - a.id);

    this.d3Svg.onResize();
    const { svg, height, width } = this.d3Svg;

    const now = this.getTime();

    // set the domains for the x and y axis, and update (re-render) them
    this.xScale.domain([this.start, this.end]);
    this.yScale.domain(items.map(i => i.event));

    this.updateAxis(items);

    let bars = svg.select('.bars-wrap').selectAll('.bar');
    bars.remove();

    // create bars for each data item
    bars = svg.select('.bars-wrap').selectAll('.bar')
      .data(items)
      .enter().append('g')
        .attr('class', 'bar');

    // append rectangles to serve as background colors
    bars.append('rect')
      .attr('class', 'bg-bar')
      .attr('x', -1 * this.padLeft)
      .attr('y', d => this.yScale(d.event))
      .attr('height', this.yScale.bandwidth())
      .attr('width', d => this.xScale(this.xScale.domain()[1]) + this.padLeft);

    // add the rectangles that show the timeline durations
    bars.append('rect')
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('x', d => this.xScale(d.start))
      .attr('y', d => this.yScale(d.event) + this.yScale.bandwidth() * 0.3)
      .attr('height', this.yScale.bandwidth() * 0.4)
      .attr('width', d => Math.max(0, this.xScale(Math.min(now, d.end)) - this.xScale(d.start)));

    // append the gray bar after the cursor
    const $that = this;
    bars.each(function(d) {
      if (d.end <= now) {
        return;
      }

      const start = d.start < now ? now : d.start;
      d3.select(this).append('rect')
        .attr('class', 'gray')
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('x', () => $that.xScale(start))
        .attr('y', () => $that.yScale(d.event) + $that.yScale.bandwidth() * 0.3)
        .attr('height', $that.yScale.bandwidth() * 0.4)
        .attr('width', () => $that.xScale(d.end) - $that.xScale(start));
    });

    // append the hour at wich a timeline event has ended
    bars.append('text')
      .attr('class', 'end-val')
      .attr('x', d => this.xScale(d.end))
      .attr('y', d => this.yScale(d.event))
      .attr('dy', this.yScale.bandwidth() / 2 + 3)
      .attr('dx', '5px')
      .text(d => d3.timeFormat('%H:%M')(d.end));

    // append the duration of the timeline event for events larger than 3 hours
    bars.append('text')
      .attr('class', 'duration-text')
      .attr('x', d => this.xScale(d.start + (d.end - d.start) / 2))
      .attr('y', d => this.yScale(d.event))
      .attr('dy', this.yScale.bandwidth() / 2 + 3)
      .attr('text-anchor', 'middle')
      .text(d => getDuration(d.start, d.end));

    // position the cursor on the timeline (horizontally)
    const posx = this.xScale(Math.min(now, this.xScale.domain()[1].getTime()));
    const cursorPos = Math.min(posx, width - 50);
    const offsetX = posx - cursorPos;

    this.cursor
      .attr('transform', `translate(${cursorPos}, 0)`);

    // set the cursor's vertical line's height
    this.cursor.select('line')
      .attr('transform', `translate(${offsetX},0)`)
      .attr('y2', height + this.padBottom / 2);

    // set current date & time in the cursor text box
    const cursorText = this.cursor.select('.cursor-text')
      .attr('transform', `translate(0, ${height + this.padBottom / 2})`)
      .select('text')
        .text(d3.timeFormat('%b %d. %H:%M')(now));

    // resize the cursor's text box to fit the updated text
    const bb = cursorText.node().getBBox();
    const paddingH = 29;
    const paddingV = 9;

    this.cursor.select('.cursor-text rect')
      .attr('x', d => -bb.width / 2 - paddingH / 2)
      .attr('y', d => -bb.height / 2 - paddingV / 2)
      .attr('width', d => bb.width + paddingH)
      .attr('height', d => bb.height + paddingV);
  }

  /**
   * Unregister from the resize event & from the timer
   */
  ngOnDestroy() {
    this.rxSub.unsubscribe();
  }
}
