<?php

class Rt_model extends CI_Model {

  private $api_url = 'http://api.rottentomatoes.com/api/public/v1.0';

  function __construct() {
    parent::__construct();
    $this->load->library('curl');
    $this->api_key = $this->config->item('rt_key');
  }

  function lookup_movie($title, $year) {
    $parameters = array(
      'apikey' => $this->api_key,
      'q' => $title
    );

    $data = $this->curl->simple_get($this->api_url . '/movies.json', $parameters);
    $data = json_decode($data, true);

    if (!isset($data['movies'])) {
      return false;
    }

    $results = array();
    foreach ($data['movies'] as $movie) {
      if ($movie['year'] == $year && isset($movie['alternate_ids'])) {
        $results[] = array(
          'distance' => levenshtein($title, $movie['title']),
          'imdb_id' => "tt" . $movie['alternate_ids']['imdb'],
          'rt_id' => $movie['id']
        );
      }
    }

    usort($results, function ($a, $b) {
      return $a['distance'] - $b['distance'];
    });

    if (count($results)) {
      $result = $results[0];
      unset($result['distance']);
      return $result;
    }

    return false;
  }

}