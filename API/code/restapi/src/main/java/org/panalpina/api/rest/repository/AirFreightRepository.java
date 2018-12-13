/*
 * Copyright (c) 2018 TopCoder Inc. All rights reserved.
 */

package org.panalpina.api.rest.repository;

import org.panalpina.api.rest.model.AirFreight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

/**
 * JPA repository for Air Freight.
 * 
 * @author TCDEVELOPER
 * @version 1.0.0
 */
public interface AirFreightRepository extends JpaRepository<AirFreight, Long> {
  /* Finds entry by airwayBill */
  AirFreight findByAirwayBill(@Param("airwayBill") String airwayBill);
}
