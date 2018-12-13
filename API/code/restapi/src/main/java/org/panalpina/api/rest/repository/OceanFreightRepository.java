/*
 * Copyright (c) 2018 TopCoder Inc. All rights reserved.
 */

package org.panalpina.api.rest.repository;

import org.panalpina.api.rest.model.OceanFreight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

/**
 * JPA repository for Ocean Freight.
 * 
 * @author TCDEVELOPER
 * @version 1.0.0
 */
public interface OceanFreightRepository extends JpaRepository<OceanFreight, Long> {
  /* Finds entry by paintainerHBL */
  OceanFreight findByPaintainerHBL(@Param("paintainerHBL") String paintainerHBL);
}
