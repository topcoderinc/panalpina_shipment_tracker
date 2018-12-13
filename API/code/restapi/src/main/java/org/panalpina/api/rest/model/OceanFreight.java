/*
 * Copyright (c) 2018 TopCoder Inc. All rights reserved.
 */

package org.panalpina.api.rest.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data model for ocean freight.
 * 
 * @author TCDEVELOPER
 * @version 1.0.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonPropertyOrder({ "Pantainer HB/L", "Received (Date)", "ETS", "ETA",
                     "Released (Date)", "Shipping Line (text)", "Voyage Nbr", "Vessel name",
                     "Place of Receipt (code)", "Port of Loading (code)",
                     "Port of Discharge (code)", "Place of Delivery (code)",
                     "Gross Weight (total)", "Pieces (total)", "Volume (total)",
                     "Customer Reference (FOS)"})
public class OceanFreight {
  private @Id @GeneratedValue Long id;
  @JsonAlias({ "paintainerHBL", "Pantainer HB/L" })
  private String paintainerHBL; 
  @JsonAlias({ "receivedDate", "Received (Date)" })
  private String receivedDate;
  @JsonAlias({ "etd", "ETS" })
  private String etd;
  @JsonAlias({ "eta", "ETA" })
  private String eta;
  @JsonAlias({ "releasedDate", "Released (Date)" })
  private String releasedDate;
  @JsonAlias({ "shippingLine", "Shipping Line (text)" })
  private String shippingLine;
  @JsonAlias({ "voyageNumber", "Voyage Nbr" })
  private String voyageNumber;
  @JsonAlias({ "vessel", "Vessel name" })
  private String vessel;
  @JsonAlias({ "placeOfReceipt", "Place of Receipt (code)" })
  private String placeOfReceipt;
  @JsonAlias({ "portOfLoading", "Port of Loading (code)" })
  private String portOfLoading;
  @JsonAlias({ "portOfDischarge", "Port of Discharge (code)" })
  private String portOfDischarge;
  @JsonAlias({ "placeOfDeliveryCode", "Place of Delivery (code)" })
  private String placeOfDeliveryCode;
  @JsonAlias({ "weight", "Gross Weight (total)" })
  private String weight;
  @JsonAlias({ "totalPieces", "Pieces (total)" })
  private String totalPieces;
  @JsonAlias({ "volume", "Volume (total)" })
  private String volume;
  @JsonAlias({ "customerReference", "Customer Reference (FOS)" })
  private String customerReference;
}