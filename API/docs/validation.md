# Panalpina Bugfix#1 verfiication

The fix is only for backend the verification document explains only aboout how to verify the backend service.


#Apply patch

Skip this test if already done.

git am > 0001-commit-for-BugFix-1-challenge.patch

#Setup backend:

update the below properties in application.properties.

fxml3.username=UCtURaPR
fxml3.password=9d1f7723d5165ac5d9151c8b966176982aea8eca
fxml3.url.prefix=https://flightxml.flightaware.com/json/FlightXML3/

setup the backend document by following the steps in $cd API/docs/README.md file.


#Bug 1:

By looking at the stacktrace, there is a mismatch in the response json. I fixed by checking for the not null condition.

Import the $cd API/docs/postman/F2F-BugFix of get flight status latest data.postman_collection into postman.

Execute the Get flight details by shipment number (200) with any  value parameter by replacing the value with `PNH015420`. You will get the result.

Please refer the screenshots.

 
![npe+fix](./images/npe_fix.png) 

 
![no_flight_data_in_api](./images/no_flight_data.png) 



#Bug 2:

The debug log is enabled. Refer the screenshot.

 
![degug_logs](./images/debug_logs.png) 

#Bug 3:

By looking at the console of browser, the error is because of max request limit reached. There is no code fix required. It has to do with business deciding on the maximum request can be buy from google maps.

You have exceeded your request quota for this API. See https://developers.google.com/maps/documentation/javascript/error-messages?utm_source=maps_js&utm_medium=degraded&utm_campaign=billing#api-key-and-billing-errors








