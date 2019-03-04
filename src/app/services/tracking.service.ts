import { Injectable } from '@angular/core';
import { HttpHelperService } from './http-helper.service';
import { of, from } from 'rxjs';
import { TrackingItem, From, GeoData } from '../models';

const mockEventData = [
  {
    'id': 1,
    'start': '07-19-2018 07:00',
    'end': '07-20-2018 05:00',
    'short': 'BKD',
    'event': 'Issued AWB at Phnom Penh'
  },
  {
    'id': 2,
    'start': '07-19-2018 09:00',
    'end': '07-20-2018 05:00',
    'short': 'BKD',
    'event': 'Booked at Phnom Penh'
  },
  {
    'id': 3,
    'start': '07-20-2018 05:00',
    'end': '07-26-2018 12:15',
    'short': 'NFD',
    'event': 'Notification New ETD at Phnom Penh'
  },
  {
    'id': 4,
    'start': '07-26-2018 12:15',
    'end': '07-28-2018 06:13',
    'short': 'MAN',
    'event': 'Manifested at Phnom Penh'
  },
  {
    'id': 5,
    'start': '07-28-2018 06:13',
    'end': '07-30-2018 00:00',
    'short': 'DEP',
    'event': 'Cargo Departed from Phnom Penh to Doha'
  },
  {
    'id': 6,
    'start': '07-30-2018 00:00',
    'end': '07-30-2018 17:05',
    'short': 'NFA',
    'event': 'Notification New ETA at Zaragoza'
  },
  {
    'id': 7,
    'start': '07-31-2018 21:45',
    'end': '08-01-2018 18:25',
    'short': 'ARR',
    'event': 'Cargo Arrival at Zaragoza'
  }
];

// escape '-' and prepare for regex
const escapeRegExp = text => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// add a matching expresion for whitespaces between word & digit characters
const addWhiteSpaceMatch = text => text.replace(/(\w)(\d)/, '$1[-_\\ +]*$2');

// filter the results from json, based on the passed filters (eg. shipmentNumber, shipmentType)
// this function should be removed once the backend integration is done, it serves only as demo
const filter = (filters) => (items) => {
  return Object.keys(filters).reduce((results, key) => {
    if (!filters[key] || !filters[key].length) {
      return [];
    }

    const query = RegExp(filters[key].map(escapeRegExp).map(addWhiteSpaceMatch).join('|'), 'i');
    return results.filter(r => r[key].match(query));
  }, items);
};

// sort the results from json, based on the passed criteria
// this function should be removed once the backend integration is done, it serves only as demo
const sort = (sortBy) => (items) => (
  items.sort((a, b) => a[sortBy] > b[sortBy] ? 1 : -1));

@Injectable({
  providedIn: 'root'
})
export class TrackingService {

  constructor(private http: HttpHelperService) { }

  /**
   * gets the shipment type
   * @param trackingNumber the tracking number
   * @returns The observable for the HTTP request.
   */
  getShipmentType(trackingNumber: string) {
    return this.http.get(`/shipment/${trackingNumber}`);
  }

  /**
   * gets the flight details
   * @param trackingNumber the tracking number
   * @returns The observable for the HTTP request.
   */
  getFlightDetails(trackingNumber: string) {
    return this.http.get(`/flight/${trackingNumber}`).map(data => {
      data.events = mockEventData;
      const mapData: any[] = [data.flightTracks[0], data.flightTracks[data.flightTracks.length - 1]];

      // const trackingItem: TrackingItem
      const trackingItem: TrackingItem = {
        events: data.events,
        carrier: data.airFreight.carrierPrefix,
        shipmentNumber: data.airFreight.airwayBill,
        from: {
          port: data.airFreight.airportOfDeparture
        },
        to: {
          port: data.airFreight.finalDestination
        },
        etd: data.airFreight.etd,
        eta: data.airFreight.eta,
        issueDate: data.airFreight.pickedUpOrReceviedDate,
        flight: `${data.airFreight.carrierPrefix} ${data.airFreight.flightNo}`,
        fileNo: data.airFreight.id,
        progress: data.progressPercentage,
        shipmentType: 'air',
        schedule: data.schedule === 'delayed' ? 'delayed' : 'on-schedule',
        status: data.schedule,
        lastUpdate: null,
        issuePlace: '-',
        mawb: '-',
        customerReference: '-',
        incoterms: '-',
        deliveryTerms: '-',
        pieces: '-',
        volume: '-',
        weight: '-',
        cWeight: '-',
        lastEvent: null,
        packageGeoInfo: {
          trackingNumber: data.airFreight.airwayBill,
          geoData: mapData.map((i, index) => {
            return {
              lng: parseFloat(i.lon), lat: parseFloat(i.lat), date: i.timestamp,
              currentLocation: index === mapData.length - 1,
              location: null
            };
          })
        }
      };
      return trackingItem;
    });
  }

  /**
   * gets the freight details
   * @param trackingNumber the tracking number
   * @returns The observable for the HTTP request.
   */
  getFreightDetails(trackingNumber: string) {
    return this.http.get(`/freight/${trackingNumber}`).map(data => {
      data.events = mockEventData;
      const mapData: any[] = [data.historicPosition[0], data.currentPosition,
      data.voyageInfo.estimatedRouteToDestination[data.voyageInfo.estimatedRouteToDestination.length - 1]];

      // const trackingItem: TrackingItem
      const trackingItem: TrackingItem = {
        events: data.events,
        carrier: data.oceanFreight.shippingLine,
        shipmentNumber: data.oceanFreight.paintainerHBL,
        from: {
          port: data.oceanFreight.portOfDischarge
        },
        to: {
          port: data.oceanFreight.portOfLoading
        },
        etd: data.oceanFreight.etd,
        eta: data.oceanFreight.eta,
        issueDate: data.oceanFreight.receivedDate,
        flight: `${data.oceanFreight.vessel} ${data.oceanFreight.voyageNumber}`,
        fileNo: data.oceanFreight.id,
        progress: (parseInt(data.voyageInfo.distanceTravelled, 10) /
          (parseInt(data.voyageInfo.distanceTravelled, 10) + parseInt(data.voyageInfo.distanceToGo, 10))) * 100,
        shipmentType: 'ocean',
        schedule: 'on-schedule',
        status: '-',
        lastUpdate: data.currentPosition.timestamp,
        issuePlace: data.oceanFreight.placeOfReceipt,
        mawb: '-',
        customerReference: data.oceanFreight.customerReference,
        incoterms: '-',
        deliveryTerms: '-',
        pieces: data.oceanFreight.totalPieces,
        volume: data.oceanFreight.volume,
        weight: data.oceanFreight.weight,
        cWeight: '-',
        lastEvent: null,
        packageGeoInfo: {
          trackingNumber: data.oceanFreight.paintainerHBL,
          geoData: mapData.map((i, index) => {
            return {
              lng: parseFloat(i.lon), lat: parseFloat(i.lat), date: i.timestamp,
              currentLocation: !!i.mmsi,
              location: null
            };
          })
        }
      };
      return trackingItem;
    });

  }

  /**
   * filter the data
   * @param data the data
   * @param filters the filter
   * @param sortBy the sort
   */
  filterResults(data, filters, sortBy) {
    return of(data).map(filter(filters)).map(sort(sortBy));
  }

  /**
   * getReferenceType Get the reference type for the passed tracking number
   * @param ref The tracking number reference
   */
  getReferenceType(ref) {
    const data: any = {
      'Shipment Number': ['PNH009736', 'LKHBA-004459', 'TKY001234', 'BRRIO-006783'],
      'Home AWB Number': ['157-48197836'],
      'Direct AWB Number': ['220-12345678']
    };

    return of(Object.keys(data).find(type => (
      data[type].indexOf(ref) > -1)));
  }
}
