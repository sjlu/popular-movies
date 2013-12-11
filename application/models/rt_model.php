<?php

class Rt_model extends CI_Model {

  private $api_url = 'http://api.rottentomatoes.com/api/public/v1.0';

  function __construct() {
    parent::__construct();
    $this->load->library('curl');
    $this->api_key = $this->config->item('rt_key');
  }

  private function _sanatize($data) {
    $output = array(
      'cast' => array(),
      'studio' => $data['studio'],
      'critics_score' => $data['ratings']['critics_score'],
      'audience_score' => $data['ratings']['audience_score'],
      'genres' => $data['genres']
    );

    foreach ($data['abridged_cast'] as $cast_member) {
      $output['cast'][] = $cast_member['name'];
    }

    if (isset($data['abridged_directors'])) {
      $output['directors'] = array();
      foreach ($data['abridged_directors'] as $director) {
        $output['directors'][] = $director['name'];
      }
    }

    return $output;
  }

  private function _lookup($id) {
    $parameters = array(
      'apikey' => $this->api_key
    );

    $data = $this->curl->simple_get($this->api_url . '/movies/' . $id . '.json', $parameters);
    $data = json_decode($data, true);

    if (!isset($data['id'])) {
      return null;
    }

    return $this->_sanatize($data);
  }

  function lookup($id) {
    if (($movie = $this->cache->get('rt_' . $id)) === false) {
      $movie = $this->_lookup($id);
      $this->cache->save('rt_' . $id, $movie, 86400);
    }
    return $movie;
  }

  private function _search_movie($title, $year) {
    $title = iconv("UTF-8", "ASCII//TRANSLIT//IGNORE", $title);

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
      $years = array(
        $movie['year'] - 1,
        $movie['year'],
        $movie['year'] + 1
      );
      if (!in_array($year, $years)) {
        continue;
      }

      if ($movie['ratings']['critics_score'] == -1) {
        continue;
      }

      $result = array(
        'distance' => levenshtein($title, $movie['title']),
        'rt_id' => $movie['id'],
      );

      if (isset($movie['alternate_ids'])) {
        $result['imdb_id'] = $movie['alternate_ids']['imdb'];
      }

      $results[] = $result;
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
    if (($movie = $this->cache->get('rt_id_' . $id)) === false) {
      $movie = $this->_search_movie($title, $year);
      $this->cache->save('rt_id_' . $id, $movie, 86400);
    }
    return $movie;
  }

}