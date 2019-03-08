/*
 * Copyright (c) 2018 TopCoder Inc. All rights reserved.
 */

package org.panalpina.api.rest.helper;

import java.io.File;

import org.panalpina.api.rest.model.AirFreight;
import org.panalpina.api.rest.model.OceanFreight;
import org.panalpina.api.rest.repository.AirFreightRepository;
import org.panalpina.api.rest.repository.OceanFreightRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.ResourceUtils;

import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;

import lombok.extern.slf4j.Slf4j;

/**
 * Class that loads database from csv files.
 * 
 * @author TCDEVELOPER
 * @version 1.0.0
 */
@Configuration
@Slf4j
class LoadDatabase {
  /* Air freight CSV file name */
  @Value("${airFreightCsvFilename}")
  private String airFreightFilename;
  /* Ocean freight CSV file name */
  @Value("${oceanFreightCsvFilename}")
  private String oceanFreightFilename;

  /* CSV column separator*/
  @Value("${csvColumnSeparator}")
  private char csvColumnsSeparator;
  @Bean
  CommandLineRunner initDatabase(AirFreightRepository airRepository, OceanFreightRepository oceanRepository) {
    return args -> {
      loadDataFromCsv(airRepository, oceanRepository);
    };
  }

  /**
   * Loads data into repositories from CSV files.
   * 
   * @param airRepository
   *          air freight repository
   * @param oceanRepository
   *          ocean friehgt repository
   * @throws Exception
   *           Exception
   */
  public void loadDataFromCsv(AirFreightRepository airRepository, OceanFreightRepository oceanRepository)
      throws Exception {

    // Air Freight CSV file
    File airFreightCsvFile = ResourceUtils.getFile("classpath:" + airFreightFilename);
    // CSV Schema for Air Freight Data
    CsvSchema airFreightSchema = CsvSchema.builder().addColumn("AirWayBill", CsvSchema.ColumnType.STRING)
        .addColumn("Carrier Prefix", CsvSchema.ColumnType.STRING).addColumn("Flight No.", CsvSchema.ColumnType.STRING)
        .addColumn("Airport of Departure (code)", CsvSchema.ColumnType.STRING)
        .addColumn("Final Destination (code)", CsvSchema.ColumnType.STRING)
        .addColumn("Picked Up / Received (Date)", CsvSchema.ColumnType.STRING)
        .addColumn("ETD", CsvSchema.ColumnType.STRING).addColumn("ETA", CsvSchema.ColumnType.STRING)
        .addColumn("Docs released / Delivered (Date)", CsvSchema.ColumnType.STRING).setColumnSeparator(csvColumnsSeparator).build()
        .withHeader();

    MappingIterator<AirFreight> airFreightIter = new CsvMapper().readerFor(AirFreight.class).with(airFreightSchema)
        .readValues(airFreightCsvFile);

    // Save data to air freight repository
    airRepository.saveAll(airFreightIter.readAll());

    // Ocean Freight CSV file
    File oceanFreightCsvFile = ResourceUtils.getFile("classpath:" + oceanFreightFilename);

    // CSV Schema for Ocean Freight Data
    CsvSchema oceanFreightSchema = CsvSchema.builder().addColumn("Pantainer HB/L", CsvSchema.ColumnType.STRING)
        .addColumn("Received (Date)", CsvSchema.ColumnType.STRING).addColumn("ETS", CsvSchema.ColumnType.STRING)
        .addColumn("ETA", CsvSchema.ColumnType.STRING).addColumn("Released (Date)", CsvSchema.ColumnType.STRING)
        .addColumn("Shipping Line (text)", CsvSchema.ColumnType.STRING)
        .addColumn("Voyage Nbr", CsvSchema.ColumnType.STRING).addColumn("Vessel name", CsvSchema.ColumnType.STRING)
        .addColumn("Place of Receipt (code)", CsvSchema.ColumnType.STRING)
        .addColumn("Port of Loading (code)", CsvSchema.ColumnType.STRING)
        // .addColumn("Port of Discharge (code)", CsvSchema.ColumnType.STRING)
        .addColumn("Place of Delivery (code)", CsvSchema.ColumnType.STRING)
        .addColumn("Gross Weight (total)", CsvSchema.ColumnType.STRING)
        .addColumn("Pieces (total)", CsvSchema.ColumnType.STRING)
        .addColumn("Volume (total)", CsvSchema.ColumnType.STRING)
        // .addColumn("Customer Reference (FOS)", CsvSchema.ColumnType.STRING)
        .setColumnSeparator(csvColumnsSeparator).build()
        .withHeader();

    MappingIterator<OceanFreight> oceanFreightIter = new CsvMapper().readerFor(OceanFreight.class)
        .with(oceanFreightSchema).readValues(oceanFreightCsvFile);

    // Save data to ocean freight repository
    oceanRepository.saveAll(oceanFreightIter.readAll());
  }
}
