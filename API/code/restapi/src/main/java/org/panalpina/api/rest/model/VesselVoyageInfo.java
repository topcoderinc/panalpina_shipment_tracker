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
 * Data model for vessel voyage information.
 * 
 * @author TCDEVELOPER
 * @version 1.0.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VesselVoyageInfo {
  List<GeoCoordinates> estimatedRouteToDestination;

  /*
   * The Distance (in NM) that the subject vessel has travelled since departing
   * from Last Port.
   */
  private String distanceTravelled;

  /*
   * The Remaining Distance (in NM) for the subject vessel to reach the reported
   * Destination.
   */
  private String distanceToGo;
}
