/*
 * Copyright (c) 2018 TopCoder Inc. All rights reserved.
 */

package org.panalpina.api.rest.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data model for extended geographical coordinates.
 * 
 * @author TCDEVELOPER
 * @version 1.0.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class GeoCoordinatesEx {
  /* Latitude */
  private String lat;
  /* Longitude */
  private String lon;
  /* The date and time (in UTC) */
  private String timestamp;
}
