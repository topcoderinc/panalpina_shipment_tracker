/*
 * Copyright (c) 2018 TopCoder Inc. All rights reserved.
 */

package org.panalpina.api.rest.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data model for vessel current position.
 * 
 * @author TCDEVELOPER
 * @version 1.0.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class VesselCurrentPosition {
  /* Maritime Mobile Service Identity */
  @JsonAlias({ "mmsi", "MMSI" })
  private String mmsi;

  /* Latitude */
  @JsonAlias({ "lat", "LAT" })
  private String lat;

  /* Longitude */
  @JsonAlias({ "lon", "LON" })
  private String lon;

  /* The date and time (in UTC) */
  @JsonAlias({ "timestamp", "TIMESTAMP" })
  private String timestamp;
}