import { Component, OnInit, OnChanges, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';

import { GMapsLoader } from '../../services/gmaps-loader.service';
import { environment } from '../../../environments/environment';

// global variables loaded by google sdk
declare const google: any;
declare const InfoBox: any;
declare const MarkerWithLabel: any;

// configurations for the map
const { gMap } = environment;

// custom stilings for the map
import mapStyles from './map.styles';

// colors for the routes
const colors = {
  delayed: '#d91a26',
  'on-schedule': '#9496B4',
};

const icons = {
  pinDelayed: '/assets/i/icons/ic-pin-error.png',
  destDelayed: '/assets/i/icons/ic-dest-error.png',
  pin: '/assets/i/icons/ic-pin-default.png',
  dest: '/assets/i/icons/ic-dest-default.png',
};

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.scss'],
  exportAs: 'gmap',
})
export class GoogleMapComponent implements OnInit, OnChanges {
  @ViewChild('map') mapEl: ElementRef;
  @ViewChild('infoWindow') infoWindow$: ElementRef;
  @ViewChild('mapControls') mapControls: ElementRef;

  // data to be displayed
  @Input() data = [];

  // google map
  map: any;

  // markers list
  markers: any = [];

  // routs list
  routes: any = [];

  // marker tooltip
  infoWindow: any;

  activeMarker: any = {};
  isWarning: any = false;

  // keep track of selected (active) route
  activeRoute = null;
  @Output() activeRouteChange = new EventEmitter<any>();

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
     // wait for maps sdk to load
    GMapsLoader.load()
    .then(GMapsLoader.loadUtilityLib)
    .then(this.initMap, (err) => {
      console.log('Maps failed to load!', err);
      return Promise.reject({});
    });
  }

  /**
   * ngOnChanges Update markers on input change
   * @param changes Input changes
   */
  ngOnChanges(changes) {
    const { data } = changes;

    if (data && this.map) {
      this.clearMapElements();
      this.drawRoutes();
    }
  }

  /**
   * initMap Init the google map when the api is ready
   */
  initMap = () => {
    this.map = new google.maps.Map(this.mapEl.nativeElement, {
      center: gMap.center,
      zoom: gMap.zoom,
      minZoom: 2,
      disableDefaultUI: true,
      styles: mapStyles,
    });

    // initialize the marker tooltip window
    const infoWindowOpt = {
      disableAutoPan: false,
      maxWidth: 0,
      pixelOffset: new google.maps.Size(23, -110),
      zIndex: null,
      infoBoxClearance: new google.maps.Size(1, 1),
      pane: 'floatPane',
      enableEventPropagation: false,

      boxClass: 'marker-infowindow-wrap',
      content: this.infoWindow$.nativeElement,
    };

    this.infoWindow = new InfoBox(infoWindowOpt);
    this.map.addListener('click', () => this.infoWindow.close());

    // add map routes
    this.drawRoutes();
  }

  // get the map zoom level
  get mapZoom() {
    return this.map.getZoom();
  }

  // set map zoom level
  setMapZoom(zoom) {
    this.map.setZoom(parseFloat(zoom));
  }

  /**
   * clearMapElements Remove all map markers & routes
   */
  clearMapElements() {
    this.markers.forEach(m => m.setMap(null));
    this.routes.forEach(m => m.setMap(null));

    this.markers.splice(0);
    this.routes.splice(0);
  }

  /**
   * Draw the map path lines & markers
   */
  drawRoutes() {
    this.data.forEach(item => {
      const style = {
        color: item.schedule === 'delayed' ? colors.delayed : '#373c8c',
        nextLineColor: colors[item.schedule] || '#9496B4',
      };

      this.drawRouteLines(item, style);
      this.drawRouteMarkers(item, style);
    });
  }

  /**
   * Draw a path line for the passed item
   *
   * @param item The item to draw the path line for
   *  - should contain the geoData with the drawing informations
   * @param style Custom styles for the pathline
   */
  drawRouteLines(item, style) {
    const points = item.packageGeoInfo.geoData;
    const current = points.findIndex(point => point.currentLocation === true);
    const hasCurrent = current > -1;

    if (hasCurrent) {
      // if path has a current location, draw the "full" line first
      const route = new google.maps.Polyline({
        path: points.slice(0, current + 1),
        geodesic: false,
        strokeColor: style.color,
        strokeWeight: 2,
        strokeOpacity: 1,
        item: item,
      });

      route.setMap(this.map);
      this.routes.push(route);
    } else {
      // otherwise add the informative markers (warning & route icon)
      this.addMarkerInfo(item);
    }

    // draw the dotted line
    const nextRoute = new google.maps.Polyline({
      path: points.slice(Math.max(0, current)),
      geodesic: false,
      strokeColor: style.nextLineColor,
      strokeWeight: 2,
      strokeOpacity: 0,
      item: item,
      icons: [{
        icon: { path: 'M 0,-0.5 0,0.5', strokeOpacity: 1 },
        offset: '0',
        repeat: '8px'
      }]
    });

    nextRoute.setMap(this.map);
    this.routes.push(nextRoute);
  }

  /**
   * Draw the route markers - the stoping points & the route icons
   */
  drawRouteMarkers(item, style) {
    item.packageGeoInfo.geoData.map((marker, i) => {
      const markerStyle = {
        color: style.color,
        borderColor: '#ffffff',
        startingPoint: i === 0,
        delayed: item.schedule === 'delayed',
        isDestination: !item.packageGeoInfo.geoData[i + 1],
      };

      // last marker in a route (finish point) must be white + route color
      if (!item.packageGeoInfo.geoData[i + 1]) {
        markerStyle.color = '#ffffff';
        markerStyle.borderColor = style.nextLineColor;
      }

      this.addMarker(marker, item, markerStyle);
    });
  }

  /**
   * addMarker Add a marker to map
   * @param data Data for the marker
   */
  addMarker(point, data, style) {
    const type = data.shipmentType;
    const currentLocationIcon = `/assets/i/icons/${type === 'ocean' ? 'ic-filter-ocean' : 'ic-filter-air'}.svg`;

    const markerData = {
      position: point,
      map: this.map,
      item: data,
      loc: point.location,
      optimized: true,

      icon: point.currentLocation ? {
        url: currentLocationIcon,
        size: {width: 24, height: 24},
        scaledSize: {width: 24, height: 24},
        anchor: {x: 12, y: 12},
      } : {
        url: icons[`${style.isDestination ? 'dest' : 'pin'}${style.delayed ? 'Delayed' : ''}`],
        size: {width: 24, height: 24},
        anchor: {x: 12, y: 12},
      },

      labelContent: (style.startingPoint && style.delayed || point.currentLocation) ? data.shipmentNumber : null,
      labelAnchor: new google.maps.Point(-18, 11),
      labelClass: 'marker-label',
    };

    const label = new MarkerWithLabel({...markerData, icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 1,
      strokeOpacity: 0,
    }});

    const marker = new google.maps.Marker(markerData);

    if (point.currentLocation !== true) {
      marker.addListener('click', this.onMarkerClick.bind(this, marker, false));
      label.addListener('click', this.onMarkerClick.bind(this, label, false));
    } else {
      marker.addListener('click', this.onRouteSelect.bind(this, data));
      label.addListener('click', this.onRouteSelect.bind(this, data));
    }

    // store the marker
    this.markers.push(label);
    this.markers.push(marker);
    return marker;
  }

  /**
   * Draw the informative icons for the route (warning label & route icon)
   */
  addMarkerInfo(item) {
    const
      x0 = item.packageGeoInfo.geoData[0].lat,
      y0 = item.packageGeoInfo.geoData[0].lng,
      x1 = item.packageGeoInfo.geoData[1].lat,
      y1 = item.packageGeoInfo.geoData[1].lng;

    const point = {
      lat: (x0 + 3 * x1) / 4,
      lng: (((x0 + 3 * x1) / 4 - x1) * (y1 - y0) + y1 * (x1 - x0)) / (x1 - x0)
    };

    const marker = new google.maps.Marker({
      position: point,
      map: this.map,
      item: item,
      optimized: true,
      icon: {
        url: (item.shipmentType === 'ocean') ? '/assets/i/icons/ic-filter-ocean-gray.svg' : '/assets/i/icons/ic-filter-air-gray.svg',
        size: {width: 24, height: 24},
        scaledSize: {width: 24, height: 24},
        anchor: {x: 12, y: 12}
      }
    });

    marker.addListener('click', this.onRouteSelect.bind(this, item));
    this.markers.push(marker);

    if (item.schedule === 'delayed' && item.warning) {
      const warningPoint = {
        lat: (3 * x0 + x1) / 4,
        lng: (((3 * x0 + x1) / 4 - x1) * (y1 - y0) + y1 * (x1 - x0)) / (x1 - x0)
      };

      const warningIcon = new google.maps.Marker({
        position: warningPoint,
        map: this.map,
        item: item,
        icon: {
          url: '/assets/i/icons/ic-warning-red.svg',
          size: {width: 18, height: 18},
          scaledSize: {width: 18, height: 18},
          anchor: {x: 9, y: 9}
        }
      });

      warningIcon.addListener('click', this.onMarkerClick.bind(this, warningIcon, true));
      this.markers.push(warningIcon);
    }
  }

  /**
   * onMarkerClick Open the marker tooltip window on click
   * @param marker Marker to display tooltip for
   */
  onMarkerClick(marker, isWarning = false) {
    if (this.activeRoute && (!marker || marker.item.shipmentNumber !== this.activeRoute)) {
      return;
    }

    this.isWarning = isWarning;
    this.activeMarker = marker;
    this.infoWindow.close();
    this.infoWindow.open(this.map, marker);

    this.cd.detectChanges();
  }

  /**
   * Handler for route click, trigger a change event
   */
  onRouteSelect(item) {
    this.activeRouteChange.emit(item.shipmentNumber);
  }

  /**
   * Highlight the route created based on the passed item, set opacity for others
   */
  highlightRoute(item) {
    this.setMapElementsOpacity(1);

    if (!item) {
      this.activeRoute = null;
      return;
    }

    this.activeRoute = item.shipmentNumber;

    const markers = this.markers.filter(m => m.item.shipmentNumber !== this.activeRoute);
    const routes = this.routes.filter(r => r.item.shipmentNumber !== this.activeRoute);

    this.setMapElementsOpacity(0.3, markers, routes);
  }

  /**
   * Set a specific opacity for the passed (or all) map elements
   * @param opacity Numeric value for the opcaity to set on elements
   * @param markers Markers to update
   * @param routes Routes to update
   */
  setMapElementsOpacity(opacity, markers?, routes?) {
    (markers || this.markers).forEach(m => {
      m.setOpacity(opacity);

      if (m.label) {
        m.setOptions({labelClass: `marker-label ${opacity === 1 ? '' : 'inactive'}`});
      }
    });

    (routes || this.routes).forEach(r => {
      if (r.strokeOpacity > 0) {
        return r.setOptions({strokeOpacity: opacity});
      }

      r.setOptions({
        icons: [{
          ...r.icons[0],
          icon: {...r.icons[0].icon, strokeOpacity: opacity},
        }]});
    });
  }
}
