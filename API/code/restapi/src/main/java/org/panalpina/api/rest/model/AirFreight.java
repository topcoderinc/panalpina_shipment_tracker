/*
 * Copyright (c) 2018 TopCoder Inc. All rights reserved.
 */

package org.panalpina.api.rest.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



/**
 * Data model for air freight.
 * 
 * @author TCDEVELOPER
 * @version 1.0.0
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({ "AirWayBill", "Carrier Prefix", "Flight No.", "Airport of Departure (code)",
                   "Final Destination (code)", "Picked Up / Received (Date)", "ETD", "ETA",
                   "Docs released / Delivered (Date)" })
public class AirFreight {
    
  private @Id @GeneratedValue Long id;
  @JsonAlias({ "airwayBill", "AirWayBill" })
  private String airwayBill; 
  @JsonAlias({ "carrierPrefix", "Carrier Prefix" })
  private String carrierPrefix;
  @JsonAlias({ "flightNo", "Flight No." })
  private String flightNo;
  @JsonAlias({ "airportOfDeparture", "Airport of Departure (code)" })
  private String airportOfDeparture;
  @JsonAlias({ "finalDestination", "Final Destination (code)" })
  private String finalDestination;
  @JsonAlias({ "pickedUpOrReceviedDate", "Picked Up / Received (Date)" })
  private String pickedUpOrReceviedDate;
  @JsonAlias({ "etd", "ETD" })
  private String etd;
  @JsonAlias({ "eta", "ETA" })
  private String eta;
  @JsonAlias({ "docsReleasedOrDeliveredDate", "Docs released / Delivered (Date)" })
  private String docsReleasedOrDeliveredDate;
}
