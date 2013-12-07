<?php

class Tmdb_model extends CI_Model {

  private $api_url = 'https://api.themoviedb.org/3';

  function __construct() {
    parent::__construct();
    $this->load->library('curl');
    $this->api_key = $this->config->item('tmdb_api_key');
  }

  private function process_movies($data) {
    $movies = array();

    foreach ($data as $movie) {
      $movies[] = array(
        'title' => $movie['title'],
        'release_date' => $movie['release_date'],
        'tmdb_id' => $movie['id']
      );
    }

    return $movies;
  }

  function discover_movies($page = 1) {
    $parameters = array(
      'api_key' => $this->api_key,
      'sort_by' => 'popularity.desc',
      'vote_count.gte' => 200,
      // 'release_date.gte' => date('Y-m-d', strtotime('-90 days')),
      'page' => $page
    );

    $data = $this->curl->simple_get($this->api_url . '/discover/movie', $parameters);
    $data = json_decode($data, true);

    $processed = $this->process_movies($data['results']);

    if ($page < $data['total_pages']) {
      $processed = array_merge($processed, $this->discover_movies($page + 1));
    }

    return $processed;
  }

}

?>