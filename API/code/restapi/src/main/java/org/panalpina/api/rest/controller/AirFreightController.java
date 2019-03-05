/*
 * Copyright (c) 2018 TopCoder Inc. All rights reserved.
 */

package org.panalpina.api.rest.controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import org.apache.http.HttpEntity;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.panalpina.api.rest.constants.AppConstant;
import org.panalpina.api.rest.model.AirFreight;
import org.panalpina.api.rest.model.FlightShipmentResponse;
import org.panalpina.api.rest.model.FlightTrack;
import org.panalpina.api.rest.model.GenericMessage;
import org.panalpina.api.rest.repository.AirFreightRepository;
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

import lombok.extern.slf4j.Slf4j;

/**
 * Air Freight Controller.
 * 
 * @author TCDEVELOPER
 * @version 1.0.0
 */
@RestController
class AirFreightController {
  /* FlightAware API v3 user name */
  @Value("${fxml3.username}")
  private String username;
  /* FlightAware API v3 password */
  @Value("${fxml3.password}")
  private String password;
  /* FlightAware API url prefix */
  @Value("${fxml3.url.prefix}")
  private String urlPrefix;
  /* Air freight repository */
  private final AirFreightRepository airFreightRepository;

  /* One argument constructor */
  AirFreightController(AirFreightRepository airFreightRepository) {
    this.airFreightRepository = airFreightRepository;
  }

  /**
   * Method that retrieves information for specified air freight
   * 
   * @param airFreight air freight
   * @return ResponseEntity<?>
   * @throws Exception Exception
   */
  @GetMapping("/v1/flight/{airFreight}")
  ResponseEntity<?> getFlight(@PathVariable String airFreight) throws Exception {

    AirFreight record = airFreightRepository.findByAirwayBill(airFreight);

    if (record != null) {
      String ETD = record.getEtd();
      String date = formatDate(ETD);
      String flight = prepareFlight(record);
      JsonNode flightNode = retrieveFaFlightID(flight, date, "");

      if (flightNode == null) {
        return prepareErrorMessage("500", AppConstant.INTERNAL_SERVER_ERROR_MSG);
      }
      String faFlightID = flightNode.get("faFlightID").asText();
      List<FlightTrack> flightTracks = retrieveflightTracks(faFlightID);

      if (flightTracks == null) {
        return prepareErrorMessage("500", AppConstant.INTERNAL_SERVER_ERROR_MSG);
      }

      FlightShipmentResponse data = new FlightShipmentResponse();
      data.setProgressPercentage(flightNode.get("progress_percent").asInt());
      data.setSchedule(flightNode.get("status").asText());
      data.setAirFreight(record);
      data.setFlightTracks(flightTracks);
      return new ResponseEntity<>(data, HttpStatus.OK);
    } else {
      return new ResponseEntity<>(new GenericMessage("404", AppConstant.NO_RECORD_FOUND_MSG + airFreight),
          HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Method that updates an air freight record.
   * 
   * @param newFlightRecord new flight record
   * @param airFreight      air freight
   * @return ResponseEntity<?>
   */
  @PostMapping("/v1/flight/{airFreight}")
  ResponseEntity<?> updateFlight(@RequestBody AirFreight newFlightRecord, @PathVariable String airFreight) {

    AirFreight flightRecord = airFreightRepository.findByAirwayBill(airFreight);

    // If there is a record in the database, then update it
    if (flightRecord != null) {
      if (newFlightRecord.getCarrierPrefix() != null) {
        flightRecord.setCarrierPrefix(newFlightRecord.getCarrierPrefix());
      }
      if (newFlightRecord.getFlightNo() != null) {
        flightRecord.setFlightNo(newFlightRecord.getFlightNo());
      }
      if (newFlightRecord.getAirportOfDeparture() != null) {
        flightRecord.setAirportOfDeparture(newFlightRecord.getAirportOfDeparture());
      }
      if (newFlightRecord.getFinalDestination() != null) {
        flightRecord.setFinalDestination(newFlightRecord.getFinalDestination());
      }
      if (newFlightRecord.getPickedUpOrReceviedDate() != null) {
        flightRecord.setPickedUpOrReceviedDate(newFlightRecord.getPickedUpOrReceviedDate());
      }
      if (newFlightRecord.getEtd() != null) {
        flightRecord.setEtd(newFlightRecord.getEtd());
      }
      if (newFlightRecord.getEta() != null) {
        flightRecord.setEta(newFlightRecord.getEta());
      }
      if (newFlightRecord.getDocsReleasedOrDeliveredDate() != null) {
        flightRecord.setDocsReleasedOrDeliveredDate(newFlightRecord.getDocsReleasedOrDeliveredDate());
      }

      // Save updated record in the repository
      airFreightRepository.save(flightRecord);
      return new ResponseEntity<>(flightRecord, HttpStatus.OK);
    } else {
      return new ResponseEntity<>(new GenericMessage("404", AppConstant.NO_RECORD_FOUND_MSG + airFreight),
          HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Method that retrieves faFlightID.
   * 
   * @param flight flight
   * @param date   flight date
   * @param time   flight time
   * @return the faFlightID
   * @throws IOException IOException
   */
  public JsonNode retrieveFaFlightID(String flight, String date, String time) throws IOException {
    String flightInfoStatusURL = this.urlPrefix + "FlightInfoStatus?ident=" + flight;
    HttpGet request = new HttpGet(flightInfoStatusURL);
    request.setHeader(HttpHeaders.AUTHORIZATION, getAuthHeader());

    HttpClient client = HttpClientBuilder.create().build();
    HttpResponse response = client.execute(request);

    HttpEntity entity = response.getEntity();
    String json = EntityUtils.toString(entity, StandardCharsets.UTF_8);
    int statusCode = response.getStatusLine().getStatusCode();
    return parseFaFlightIDFromJson(json, date);
  }

  /**
   * Method that prepares flight number to be used for making FlightAware API
   * call.
   * 
   * @param record Air freight record
   * @return flight number
   */
  public String prepareFlight(AirFreight record) {
    String flightNumber = record.getFlightNo();
    String flightNumberBeforeSlash = flightNumber;
    int indexOfSlash = flightNumber.indexOf('/');
    if (indexOfSlash != -1) {
      flightNumberBeforeSlash = flightNumber.substring(0, indexOfSlash);
    }
    return record.getCarrierPrefix() + flightNumberBeforeSlash;
  }

  /**
   * Method that gives authorization header used for making FlightAware API calls.
   * 
   * @return authorization header value
   */
  private String getAuthHeader() {
    String auth = this.username + ":" + this.password;
    String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
    return "Basic " + encodedAuth;
  }

  /**
   * Method that formats date from YYYY-MM-DD to DD/MM/YYYY.
   * 
   * @param ETD ETD
   * @return the formatted date
   */
  private String formatDate(String ETD) {
    String[] parts = ETD.split(" ");
    String[] dateParts = parts[0].split("-");
    String formattedDate = "";
    formattedDate = dateParts[1] + "/" + dateParts[2] + "/" + dateParts[0];
    return formattedDate;
  }

  /**
   * Method that parses faFlightID from json.
   * 
   * @param json json as string
   * @param date date
   * @return faFlightID
   * @throws IOException IOException
   */
	private JsonNode parseFaFlightIDFromJson(String json, String date) throws IOException {
		ObjectMapper objectMapper = new ObjectMapper();
		JsonNode rootNode = objectMapper.readTree(json);
		JsonNode flightInfoStatus = rootNode.get("FlightInfoStatusResult");
		if (flightInfoStatus == null) {
			return null;
		}
		JsonNode flights = flightInfoStatus.get("flights");

		if (flights != null && flights.isArray()) {
			for (final JsonNode objNode : flights) {
				JsonNode faFlightID = objNode.get("faFlightID");
				JsonNode filedDepartureTimeNode = objNode.get("filed_departure_time");
				String filedDepartureDate = filedDepartureTimeNode.get("date").asText();
				if (date.equals(filedDepartureDate)) {
					return objNode;
				}
			}
		}
		return null;
	}

  /**
   * Method that retrieves flight tracks for a flight
   * 
   * @param faFlightID faFlightID
   * @return List<FlightTrack>
   * @throws IOException IOException
   */
  private List<FlightTrack> retrieveflightTracks(String faFlightID) throws IOException {
    String getFlightTrackURL = this.urlPrefix + "GetFlightTrack?ident=" + faFlightID;
    HttpGet request = new HttpGet(getFlightTrackURL);

    request.setHeader(HttpHeaders.AUTHORIZATION, getAuthHeader());

    HttpClient client = HttpClientBuilder.create().build();
    HttpResponse response = client.execute(request);

    HttpEntity entity = response.getEntity();
    String json = EntityUtils.toString(entity, StandardCharsets.UTF_8);
    int statusCode = response.getStatusLine().getStatusCode();
    return parseFlightTracksFromJson(json);
  }

  /**
   * Method that parses flight tracks from json.
   * 
   * @param json json as string
   * @return List<FlightTrack>
   * @throws IOException IOException
   */
  private List<FlightTrack> parseFlightTracksFromJson(String json) throws IOException {

    List<FlightTrack> flightTracks = new ArrayList<>();
    ObjectMapper objectMapper = new ObjectMapper();
    JsonNode rootNode = objectMapper.readTree(json);

    JsonNode tracks = rootNode.get("GetFlightTrackResult").get("tracks");

    if (tracks.isArray()) {
      for (final JsonNode objNode : tracks) {
        FlightTrack track = new FlightTrack();
        int timestamp = objNode.get("timestamp").asInt();
        String latitude = objNode.get("latitude").asText();
        String longitude = objNode.get("longitude").asText();
        track.setTimestamp(timestamp);
        track.setLon(longitude);
        track.setLat(latitude);
        flightTracks.add(track);
      }
      return flightTracks;
    }
    return null;
  }

  /**
   * Prepares error message
   * 
   * @return
   */
  private ResponseEntity<?> prepareErrorMessage(String code, String message) {
    return new ResponseEntity<>(new GenericMessage(code, message), HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
