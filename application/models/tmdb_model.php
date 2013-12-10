<?php

class Tmdb_model extends CI_Model {

  private $api_url = 'https://api.themoviedb.org/3';

  function __construct() {
    parent::__construct();
    $this->load->driver('cache', array('adapter' => 'file'));
    $this->load->library('curl');

    $this->api_key = $this->config->item('tmdb_api_key');
  }

  private function process_movies($data) {
    $movies = array();

    foreach ($data as $movie) {
      $movies[] = array(
        'title' => $movie['title'],
        'release_date' => $movie['release_date'],
        'tmdb_id' => $movie['id'],
        'tmdb' => $movie
      );
    }

    return $movies;
  }

  function get_config() {
    if (!$config = $this->cache->get('tmdb_config')) {
      $parameters = array(
        'api_key' => $this->api_key
      );

      $data = $this->curl->simple_get($this->api_url . '/configuration', $parameters);
      $config = json_decode($data, true);

      $this->cache->save('tmdb_config', $config, 86400);
    }

    return $config;
  }

  function get_imdb_id($id) {
    $parameters = array(
      'api_key' => $this->api_key
    );

    $data = $this->curl->simple_get($this->api_url . '/movie/' . $id, $parameters);
    $data = json_decode($data, true);

    if (!isset($data['results'])) {
      return false;
    }

    $processed = $data['results'];

    if (isset($processed['imdb_id'])) {
      return array('imdb_id' => $processed['imdb_id']);
    }

    return false;
  }

  private function discover_movies($page = 1) {
    $parameters = array(
      'api_key' => $this->api_key,
      'sort_by' => 'popularity.desc',
      'vote_count.gte' => 25,
      'vote_average.gte' => 4,
      // 'release_date.gte' => date('Y-m-d', strtotime('-90 days')),
      'page' => $page
    );

    $data = $this->curl->simple_get($this->api_url . '/discover/movie', $parameters);
    $data = json_decode($data, true);

    $processed = $data['results'];
    if ($page < $data['total_pages']) {
      $processed = array_merge($processed, $this->discover_movies($page + 1));
    }

    return $processed;
  }

  function discover() {
    if (!$movies = $this->cache->get('tmdb_movies')) {
      $movies = $this->discover_movies();

      // append the image path
      $image_path = $this->get_config()['images']['secure_base_url'] . 'w500';
      foreach ($movies as &$movie) {
        $movie['poster_path'] = $image_path . $movie['poster_path'];
        $movie['backdrop_path'] = $image_path . $movie['backdrop_path'];
      }

      $this->cache->save('tmdb_movies', $movies, 86400);
    }

    return $this->process_movies($movies);
  }

}

?>