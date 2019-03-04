/*
 * Copyright (c) 2018 TopCoder Inc. All rights reserved.
 */

package org.panalpina.api.rest.controller;

import java.io.IOException;

import org.panalpina.api.rest.constants.AppConstant;
import org.panalpina.api.rest.model.ShipmentLookup;
import org.panalpina.api.rest.model.GenericMessage;
import org.panalpina.api.rest.repository.AirFreightRepository;
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

import lombok.extern.slf4j.Slf4j;

/**
 * Looku Controller.
 * 
 * @author TCDEVELOPER
 * @version 1.0.0
 */
@RestController
class ShipmentLookupController {

  /* Air freight repository */
  private final AirFreightRepository airFreightRepository;

  /* Ocean Freight Repository */
  private final OceanFreightRepository oceanFreightRepository;

  /* Two argument constructor */
  ShipmentLookupController(AirFreightRepository airFreightRepository, OceanFreightRepository oceanFreightRepository) {
    this.oceanFreightRepository = oceanFreightRepository;
    this.airFreightRepository = airFreightRepository;
  }

  /**
   * Method that retrieves information for specified shipment type
   * 
   * @param trackingNumber the tracking number
   * @return ResponseEntity<?>
   * @throws Exception Exception
   */
  @GetMapping("/v1/shipment/{trackingNumber}")
  ResponseEntity<?> getFlight(@PathVariable String trackingNumber) throws Exception {

    if (airFreightRepository.findByAirwayBill(trackingNumber) != null) {
      ShipmentLookup data = new ShipmentLookup();
      data.setType("air");
      return new ResponseEntity<>(data, HttpStatus.OK);
    } else if (oceanFreightRepository.findByPaintainerHBL(trackingNumber) != null) {
      ShipmentLookup data = new ShipmentLookup();
      data.setType("ocean");
      return new ResponseEntity<>(data, HttpStatus.OK);
    } else {
      return new ResponseEntity<>(new GenericMessage("404", AppConstant.NO_RECORD_FOUND_MSG + trackingNumber),
          HttpStatus.NOT_FOUND);
    }
  }
}
