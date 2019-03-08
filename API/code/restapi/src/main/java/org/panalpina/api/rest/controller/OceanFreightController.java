/*
 * Copyright (c) 2018 TopCoder Inc. All rights reserved.
 */

package org.panalpina.api.rest.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.panalpina.api.rest.constants.AppConstant;
import org.panalpina.api.rest.helper.ClientMultiThreadedExecution;
import org.panalpina.api.rest.model.AirFreight;
import org.panalpina.api.rest.model.FreightShipmentResponse;
import org.panalpina.api.rest.model.GenericMessage;
import org.panalpina.api.rest.model.GeoCoordinates;
import org.panalpina.api.rest.model.GeoCoordinatesEx;
import org.panalpina.api.rest.model.OceanFreight;
import org.panalpina.api.rest.model.VesselCurrentPosition;
import org.panalpina.api.rest.model.VesselVoyageInfo;
import org.panalpina.api.rest.repository.OceanFreightRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Ocean Freight Controller.
 * 
 * @author TCDEVELOPER
 * @version 1.0.0
 */
@RestController
class OceanFreightController {
  /* Marine traffic url prefix */
  @Value("${marinetraffic.url.prefix}")
  private String urlPrefix;
  /* Marine traffic vessel historical track key */
  @Value("${marinetraffic.vessel.historical.track.PS01.key}")
  private String vesselHistoricalTrackKey;
  /* Marine traffic single vessel position key */
  @Value("${marinetraffic.single.vessel.position.PS07.key}")
  private String singleVesselPositionKey;
  /* Marine traffic voyage forecasts key */
  @Value("${marinetraffic.voyage.forecasts.VI01.key}")
  private String voyageForecastsKey;
  /* Marine traffic search vessel key */
  @Value("${marinetraffic.search.vessel.VD03.key}")
  private String searchVesselKey;
  /* Marine traffic API parameter period's value */
  @Value("${marinetraffic.api.param.period.value}")
  private String periodValue;
  /* Marine traffic API parameter msgtype's value */
  @Value("${marinetraffic.api.param.msgtype.value}")
  private String msgtypeValue;
  /* Marine traffic API parameter protocol's value */
  @Value("${marinetraffic.api.param.protocol.value}")
  private String protocolValue;
  /* Marine traffic API parameter timespan's value */
  @Value("${marinetraffic.api.param.timespan.value}")
  private String timespanValue;
  /* Marine traffic API parameter mmsi's value */
  @Value("${marinetraffic.api.test.mmsi.value}")
  private String mmsiValue;

  /* Ocean Freight Repository */
  private final OceanFreightRepository oceanFreightRepository;

  /* One argument constructor */
  OceanFreightController(OceanFreightRepository oceanFreightRepository) {
    this.oceanFreightRepository = oceanFreightRepository;
  }

  /**
   * Method that retrieves freight information for paintainer specified in the
   * Path variable.
   * 
   * @param paintainer
   *          paintainer
   * @return ResponseEntity<?> Response entity
   */

  @GetMapping("/v1/freight/{paintainer}")
  ResponseEntity<?> getFreight(@PathVariable String paintainer) throws Exception {

    OceanFreight record = oceanFreightRepository.findByPaintainerHBL(paintainer);

    // If there is an existing entry in database, then make marine traffic API calls
    if (record != null) {
      // Simultaneous execution of multiple GET requests
      ClientMultiThreadedExecution execution = new ClientMultiThreadedExecution();

      List<String> urisToGet = new ArrayList<>();

      String mmsi = retrieveMMSI();
      long numOfDays = calculateDays(record.getEtd());
      // Prepare marine traffic API urls
      urisToGet = prepareURIs(mmsi, numOfDays);
      // Fetch the urls
      execution.fetch(urisToGet);

      List<String> results = execution.getResults();

      // Get the result for vessel current position and check for an error
      String json = results.get(0);
      if (isErrorMessageInReturnedJson(json)) {
        return prepareErrorMessage(json);
      }
      VesselCurrentPosition currentPosition = parseJsonForCurrentPosition(json);

      // Get the result for vessel voyage and check for an error
      json = results.get(1);
      if (isErrorMessageInReturnedJson(json)) {
        return prepareErrorMessage(json);
      }
      VesselVoyageInfo voyageInfo = parseJsonForVoyageForecasts(json);
      
      // Get the result for vessel historic position and check for an error
      json = results.get(2);
      if (isErrorMessageInReturnedJson(json)) {
        return prepareErrorMessage(json);
      }
      List<GeoCoordinatesEx> historicPosition = parseJsonForHistoricPosition(json);

      FreightShipmentResponse data = new FreightShipmentResponse();
      data.setOceanFreight(record);
      data.setCurrentPosition(currentPosition);
      data.setVoyageInfo(voyageInfo);
      data.setHistoricPosition(historicPosition);

      return new ResponseEntity<>(data, HttpStatus.OK);
    }
    return new ResponseEntity<>(new GenericMessage("404", AppConstant.NO_RECORD_FOUND_MSG + paintainer),
        HttpStatus.NOT_FOUND);
  }

  /**
   * Method that updates freight record for paintainer.
   * 
   * @param newFreightRecord
   *          New freight record
   * @param paintainer
   *          paintainer
   * @return ResponseEntity<?> Response entity
   */
  @PostMapping("/v1/freight/{paintainer}")
  ResponseEntity<?> updateFlight(@RequestBody OceanFreight newFreightRecord, @PathVariable String paintainer) {

    OceanFreight freightRecord = oceanFreightRepository.findByPaintainerHBL(paintainer);

    // If records exists in the database, then update it
    if (freightRecord != null) {

      if (newFreightRecord.getCustomerReference() != null) {
        freightRecord.setCustomerReference(newFreightRecord.getCustomerReference());
      }
      if (newFreightRecord.getReceivedDate() != null) {
        freightRecord.setReceivedDate(newFreightRecord.getReceivedDate());
      }
      if (newFreightRecord.getReleasedDate() != null) {
        freightRecord.setReleasedDate(newFreightRecord.getReleasedDate());
      }
      if (newFreightRecord.getShippingLine() != null) {
        freightRecord.setShippingLine(newFreightRecord.getShippingLine());
      }
      if (newFreightRecord.getVoyageNumber() != null) {
        freightRecord.setVoyageNumber(newFreightRecord.getVoyageNumber());
      }
      if (newFreightRecord.getVessel() != null) {
        freightRecord.setVessel(newFreightRecord.getVessel());
      }
      if (newFreightRecord.getPlaceOfReceipt() != null) {
        freightRecord.setPlaceOfReceipt(newFreightRecord.getPlaceOfReceipt());
      }
      if (newFreightRecord.getPortOfLoading() != null) {
        freightRecord.setPortOfLoading(newFreightRecord.getPortOfLoading());
      }
      if (newFreightRecord.getPortOfDischarge() != null) {
        freightRecord.setPortOfDischarge(newFreightRecord.getPortOfDischarge());
      }
      if (newFreightRecord.getPlaceOfDeliveryCode() != null) {
        freightRecord.setPlaceOfDeliveryCode(newFreightRecord.getPlaceOfDeliveryCode());
      }
      if (newFreightRecord.getWeight() != null) {
        freightRecord.setWeight(newFreightRecord.getWeight());
      }
      if (newFreightRecord.getTotalPieces() != null) {
        freightRecord.setTotalPieces(newFreightRecord.getTotalPieces());
      }
      if (newFreightRecord.getVolume() != null) {
        freightRecord.setVolume(newFreightRecord.getVolume());
      }
      if (newFreightRecord.getEtd() != null) {
        freightRecord.setEtd(newFreightRecord.getEtd());
      }
      if (newFreightRecord.getEta() != null) {
        freightRecord.setEta(newFreightRecord.getEta());
      }

      // Save updated record in repository
      oceanFreightRepository.save(freightRecord);
      return new ResponseEntity<>(freightRecord, HttpStatus.OK);
    } else {
      return new ResponseEntity<>(new GenericMessage("404", AppConstant.NO_RECORD_FOUND_MSG + paintainer),
          HttpStatus.NOT_FOUND);
    }

  }

  /**
   * This method retrieves MMSI value that will be used for making marine traffic
   * API calls.
   * 
   * @return the MMSI value
   */
  private String retrieveMMSI() {
    return this.mmsiValue;
  }

  /**
   * This method prepares marine traffic API call URLS.
   * 
   * @param mmsi
   *          MMSI
   * @param numOfDays
   *          Number of days
   * @return List<String>
   */
  private List<String> prepareURIs(String mmsi, long numOfDays) {
    List<String> uriList = new ArrayList<>();

    String singleVesselPostionUrl = this.urlPrefix + "exportvessel/v:5/" + this.singleVesselPositionKey + "/"
        + "timespan:" + this.timespanValue + "/" + "mmsi:" + mmsi + "/" + "protocol:" + this.protocolValue;

    uriList.add(singleVesselPostionUrl);

    String voyageForecastsUrl = this.urlPrefix + "voyageforecast/" + this.voyageForecastsKey + "/" + "mmsi:" + mmsi
        + "/" + "protocol:" + this.protocolValue + "/" + "msgtype:" + this.msgtypeValue;
    uriList.add(voyageForecastsUrl);

    String vesselHistoricalTrackUrl = this.urlPrefix + "exportvesseltrack/" + this.vesselHistoricalTrackKey + "/"
        + "v:2/period:" + this.periodValue + "/" + "days:" + String.valueOf(numOfDays) + "/" + "mmsi:" + mmsi + "/"
        + "protocol:" + this.protocolValue;
    uriList.add(vesselHistoricalTrackUrl);

    return uriList;
  }

  /**
   * Method that parses json for current vessel position.
   * 
   * @param json
   *          json as string
   * @return VesselCurrentPosition
   * @throws IOException
   *           IOException
   */
  private VesselCurrentPosition parseJsonForCurrentPosition(String json) throws IOException {
    ObjectMapper objectMapper = new ObjectMapper();
    VesselCurrentPosition currentPosition = new VesselCurrentPosition();
    JsonNode rootNode = objectMapper.readTree(json);

    if (rootNode.isArray()) {
      for (final JsonNode objNode : rootNode) {
        // Read data from the first object and return
        String mmsi = objNode.get("MMSI").asText();
        String lat = objNode.get("LAT").asText();
        String lon = objNode.get("LON").asText();
        String timestamp = objNode.get("TIMESTAMP").asText();
        currentPosition.setMmsi(mmsi);
        currentPosition.setLat(lat);
        currentPosition.setLon(lon);
        currentPosition.setTimestamp(timestamp);
        break;
      }
    }
    return currentPosition;
  }

  /**
   * Method that parses json for voyage forecasts.
   * 
   * @param json
   *          json as string
   * @return VesselVoyageInfo
   * @throws IOException
   *           IOException
   */
  private VesselVoyageInfo parseJsonForVoyageForecasts(String json) throws IOException {
    ObjectMapper objectMapper = new ObjectMapper();
    VesselVoyageInfo voyageInfo = new VesselVoyageInfo();
    JsonNode rootNode = objectMapper.readTree(json);

    if (rootNode.isArray()) {
      for (final JsonNode objNode : rootNode) {
        // Read data from the first object and return
        String wktRoute = objNode.get("ROUTE").asText();
        String distanceTravelled = objNode.get("DISTANCE_TRAVELLED").asText();
        String distanceToGo = objNode.get("DISTANCE_TO_GO").asText();
        List<GeoCoordinates> geoRoute = convertRouteFromWkt(wktRoute);
        voyageInfo.setEstimatedRouteToDestination(geoRoute);
        voyageInfo.setDistanceTravelled(distanceTravelled);
        voyageInfo.setDistanceToGo(distanceToGo);
        break;
      }
    }
    return voyageInfo;
  }

  /**
   * Method that converts route from WKT format.
   * 
   * @param wktRoute
   *          WKT route
   * @return List<GeoCoordinates>
   */
  private List<GeoCoordinates> convertRouteFromWkt(String wktRoute) {
    List<GeoCoordinates> geoRoute = new ArrayList<>();

    String tempRoute = wktRoute;
    tempRoute = tempRoute.replace("LINESTRING (", "");
    tempRoute = tempRoute.replace(")", "");

    String[] positions = tempRoute.split(",");
    for (String entry : positions) {
      String[] coordinates = entry.trim().split(" ");
      GeoCoordinates geoEntry = new GeoCoordinates();
      geoEntry.setLat(coordinates[1]);
      geoEntry.setLon(coordinates[0]);
      geoRoute.add(geoEntry);
    }
    return geoRoute;
  }

  /**
   * Method that parses json for vessel historic position.
   * 
   * @param json
   *          json as string
   * @return List<GeoCoordinatesEx>
   * @throws IOException
   *           IOException
   */
  private List<GeoCoordinatesEx> parseJsonForHistoricPosition(String json) throws IOException {
    ObjectMapper objectMapper = new ObjectMapper();
    List<GeoCoordinatesEx> historicPosition = new ArrayList<>();
    JsonNode rootNode = objectMapper.readTree(json);

    if (rootNode.isArray()) {
      for (final JsonNode objNode : rootNode) {
        String lat = objNode.get("LAT").asText();
        String lon = objNode.get("LON").asText();
        String timestamp = objNode.get("TIMESTAMP").asText();

        GeoCoordinatesEx geoCoordinatesEx = new GeoCoordinatesEx();
        geoCoordinatesEx.setLat(lat);
        geoCoordinatesEx.setLon(lon);
        geoCoordinatesEx.setTimestamp(timestamp);
        historicPosition.add(geoCoordinatesEx);
      }
    }

    return historicPosition;
  }

  /**
   * Method that checks if there is an error property in returned json.
   * 
   * @param json
   *          json as string
   * @return true if there is an error property in json; false otherwise.
   * @throws IOException
   *           IOException
   */
  private boolean isErrorMessageInReturnedJson(String json) throws IOException {
    ObjectMapper objectMapper = new ObjectMapper();
    JsonNode rootNode = objectMapper.readTree(json);
    return rootNode.get("errors") != null ? true : false;
  }

  /**
   * Method that prepares an error message.
   * 
   * @param json
   *          json as string
   * @return ResponseEntity<?>
   * @throws IOException
   *           IOException
   */
  private ResponseEntity<?> prepareErrorMessage(String json) throws IOException {
    ObjectMapper objectMapper = new ObjectMapper();
    JsonNode rootNode = objectMapper.readTree(json);
    JsonNode errors = rootNode.get("errors");

    if (errors.isArray()) {
      for (final JsonNode objNode : errors) {
        String code = objNode.get("code").asText();
        String detail = objNode.get("detail").asText();

        return new ResponseEntity<>(new GenericMessage(code, detail), HttpStatus.OK);
      }
    }
    return new ResponseEntity<>(new GenericMessage("500", AppConstant.INTERNAL_SERVER_ERROR_MSG),
        HttpStatus.INTERNAL_SERVER_ERROR);
  }

  /**
   * Method that calculates number of days between date passed as an argument and
   * the current date.
   * 
   * @param date
   *          date as string
   * @return number of days
   */
  private long calculateDays(final String date) {
    // Date in format YYYY-MM-DD.
    String dateString = date;

    // Converting date to Java8 Local date
    LocalDate startDate = LocalDate.parse(dateString);
    LocalDate endDate = LocalDate.now();
    Long range = ChronoUnit.DAYS.between(startDate, endDate);
    return Math.abs(range);
  }
}
