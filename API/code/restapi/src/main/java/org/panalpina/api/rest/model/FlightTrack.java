/*
 * Copyright (c) 2018 TopCoder Inc. All rights reserved.
 */

package org.panalpina.api.rest.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data model for flight track.
 * 
 * @author TCDEVELOPER
 * @version 1.0.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FlightTrack {
  /* Timestamp is integer seconds since 1970 (UNIX epoch time). */ 
  private int timestamp;
  /* Longitude */
  private String lon;
  /* Latitude */
  private String lat;
}
