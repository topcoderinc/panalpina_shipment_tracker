/*
 * Copyright (c) 2018 TopCoder Inc. All rights reserved.
 */

package org.panalpina.api.rest.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data model for freight shipment response.
 * 
 * @author TCDEVELOPER
 * @version 1.0.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FreightShipmentResponse {
  private OceanFreight oceanFreight;
  VesselCurrentPosition currentPosition;
  VesselVoyageInfo voyageInfo;
  List<GeoCoordinatesEx> historicPosition;
}
