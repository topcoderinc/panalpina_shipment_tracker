export interface From {
    port: string;
    country?: string;
}

export interface To {
    port: string;
    country?: string;
}

export interface LastEvent {
    status: string;
    from: string;
}

export interface Event {
    id: number;
    start: string;
    end: string;
    short: string;
    event: string;
}

export interface Location {
    port: string;
    country: string | null;
}

export interface GeoData {
    lat: number;
    lng: number;
    location: Location;
    date: string;
    currentLocation?: boolean;
}

export interface PackageGeoInfo {
    trackingNumber: string;
    geoData: GeoData[];
}

export interface TrackingItem {
    events: Event[];
    carrier: string;
    shipmentNumber: string;
    progress: number;
    from: From;
    to: To;
    etd: string;
    eta: string;
    issueDate: string;
    flight: string;
    fileNo: string;
    schedule: string;
    shipmentType: string;

    status: string;

    lastUpdate: string;
    issuePlace: string;

    mawb: string;
    customerReference: string;
    incoterms: string;
    deliveryTerms: string;

    pieces: string;
    volume: string;
    weight: string;
    cWeight: string;

    lastEvent: LastEvent;

    packageGeoInfo: PackageGeoInfo;
}
