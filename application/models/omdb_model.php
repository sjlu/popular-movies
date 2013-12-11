<?php

class Omdb_model extends CI_Model {

  private $api_url = 'http://www.omdbapi.com/';

  function __construct() {
    parent::__construct();
    $this->load->library('curl');
  }

  private function _search_movie($title, $year) {
    $title = iconv("UTF-8", "ASCII//TRANSLIT//IGNORE", $title);

    $parameters = array(
      's' => $title
    );

    $data = $this->curl->simple_get($this->api_url, $parameters);
    $data = json_decode($data, true);

    if (!isset($data['Search'])) {
      return null;
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

    return null;
  }


  function search_movie($title, $year) {
    $id = md5($title . $year);
    if (($movie = $this->cache->get('omdb_id_' . $id)) === false) {
      $movie = $this->_search_movie($title, $year);
      $this->cache->save('omdb_id_' . $id, $movie, 86400);
    }
    return $movie;
  }

}