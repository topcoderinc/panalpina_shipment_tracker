/*
 * Copyright (c) 2019 TopCoder Inc. All rights reserved.
 */

package org.panalpina.api.rest.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data model for shipment type.
 * 
 * @author TCDEVELOPER
 * @version 1.0.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShipmentLookup {
  private String type;
}
