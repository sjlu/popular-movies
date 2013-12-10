<?php

class Omdb_model extends CI_Model {

  private $api_url = 'http://www.omdbapi.com/';

  function __construct() {
    parent::__construct();
    $this->load->library('curl');
  }

  private function _lookup_movie($title, $year) {
    $parameters = array(
      's' => $title
    );

    $data = $this->curl->simple_get($this->api_url, $parameters);
    $data = json_decode($data, true);

    if (!isset($data['Search'])) {
      return false;
    }

    $results = array();
    foreach ($data['Search'] as $movie) {
      if ($movie['Year'] == $year) {
        $results[] = array(
          'distance' => levenshtein($title, $movie['Title']),
          'imdb_id' => $movie['imdbID'],
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


  function lookup_movie($title, $year) {
    $id = md5($title . $year);
    if ($movie = $this->cache->get('omdb_id_' . $id)) {
      $movie = $this->_lookup_movie($title, $year);
      $this->cache->save('omdb_id_' . $id, $movie, 86400);
    }
    return $movie;
  }

}