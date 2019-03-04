# Validation Guide

1. Deploy the backend and frontend
1. Open the application in browser

## Test data

1. Update the following in `API/code/restapi/src/main/resources/application.properties`
- `fxml3.url.prefix`=https://demo7524826.mockable.io/json/FlightXML3/
and `marinetraffic.url.prefix`=https://demo7524826.mockable.io/

so that you don't have to worry about the keys

1. After API is run update the data of test shipment using POSTMAN requests 

`{{URL}}/v1/freight/TESTM1001`

with body 
```
{
	"Status": "Delivery",
	"ETD": "2019-02-01 18:21",
	"ETA": "2019-02-04 05:09"
}
```

`{{URL}}/v1/flight/TEST1001`

with body 
```
{
	"ETA": "2019-02-04 12:00",
	"AirWayBill": "TEST1001",
	"carrierPrefix": "QTR",
	"flightNo":"125",
	"airportOfDeparture":"DOH",
	"finalDestination":"VCE",
	"ETD":"2019-02-04 12:00"
}
```

you can call the default configured test data in POST update method


1. Go to home page and enter the tracking code 'TEST1001' this is for flight shipment, 'TESTM1001' this is for ocean shipment or any other invalid

http://prntscr.com/mgj22f

click track button, it will navigate to result page

1. if result is found then it will show the result as below, if any shipment is not found no exception occurs so that found shipment could be shown

http://prntscr.com/mgj38j

1. Verify by changing the tracking number, filtering


> NOTE: There are some fields which are not known they are shown as empty for now. while timeline is shown through mock data.

## Video
https://youtu.be/K9BFZNgnNRw