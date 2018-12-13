/*
 * Copyright (c) 2018 TopCoder Inc. All rights reserved.
 */

package org.panalpina.api.rest.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data model for flight shipment response.
 * 
 * @author TCDEVELOPER
 * @version 1.0.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FlightShipmentResponse {
  private AirFreight airFreight;
  private List<FlightTrack> flightTracks;
}
