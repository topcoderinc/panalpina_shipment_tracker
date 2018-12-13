/*
 * Copyright (c) 2018 TopCoder Inc. All rights reserved.
 */

package org.panalpina.api.rest.helper;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;

/**
 * Class that performs multiple GET requests simultaneously using multiple
 * threads.
 * 
 * @author TCDEVELOPER
 * @version 1.0.0
 */
public class ClientMultiThreadedExecution {

  /* Results for GET requests */
  private List<String> results = new ArrayList<>();

  /**
   * Method that gives results of GET requests.
   * 
   * @return List<String>
   */
  public List<String> getResults() {
    return results;
  }

  /**
   * Method that fetches urls passed as argument.
   * 
   * @param urisToGet
   *          Uris to get
   * @throws Exception
   *           Exception
   */
  public void fetch(List<String> urisToGet) throws Exception {
    // Create an HttpClient with the ThreadSafeClientConnManager.
    // This connection manager must be used if more than one thread will
    // be using the HttpClient.
    PoolingHttpClientConnectionManager cm = new PoolingHttpClientConnectionManager();
    cm.setMaxTotal(100);

    CloseableHttpClient httpclient = HttpClients.custom().setConnectionManager(cm).build();
    try {

      // create a thread for each URI
      GetThread[] threads = new GetThread[urisToGet.size()];
      for (int i = 0; i < threads.length; i++) {
        HttpGet httpget = new HttpGet(urisToGet.get(i));
        threads[i] = new GetThread(httpclient, httpget, i + 1);
      }

      // Start the threads
      for (int j = 0; j < threads.length; j++) {
        threads[j].start();
      }

      // Join the threads
      for (int j = 0; j < threads.length; j++) {
        threads[j].join();
      }

      for (int j = 0; j < threads.length; j++) {
        results.add(threads[j].getResult());
      }

    } finally {
      httpclient.close();
    }
  }

  /**
   * A thread that performs a GET.
   */
  static class GetThread extends Thread {

    private final CloseableHttpClient httpClient;
    private final HttpContext context;
    private final HttpGet httpget;
    private final int id;
    private String result = "-1";

    public GetThread(CloseableHttpClient httpClient, HttpGet httpget, int id) {
      this.httpClient = httpClient;
      this.context = new BasicHttpContext();
      this.httpget = httpget;
      this.id = id;
    }

    /**
     * Executes the GetMethod and prints some status information.
     */
    @Override
    public void run() {
      try {
        CloseableHttpResponse response = httpClient.execute(httpget, context);
        try {
          HttpEntity entity = response.getEntity();
          if (entity != null) {
            this.result = EntityUtils.toString(entity, StandardCharsets.UTF_8);
          }
        } finally {
          response.close();
        }
      } catch (Exception e) {
        e.printStackTrace();
      }
    }

    public String getResult() {
      return result;
    }
  }

}
