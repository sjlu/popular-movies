<?php

class Tmdb_model extends CI_Model {

  private $api_url = 'https://api.themoviedb.org/3';

  function __construct() {
    parent::__construct();
    $this->load->driver('cache', array('adapter' => 'file'));
    $this->load->library('curl');

    $this->api_key = $this->config->item('tmdb_api_key');
  }

  private function _sanatize($data) {
    $movies = array();

    foreach ($data as $movie) {
      $movies[] = array(
        'title' => $movie['title'],
        'tmdb_id' => $movie['id'],
        'tmdb' => array(
          'release_date' => $movie['release_date'],
          'poster_path' => $movie['poster_path'],
          'popularity' => $movie['popularity'],
          'vote_average' => $movie['vote_average'],
          'vote_count' => $movie['vote_count']
        )
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

  private function _get_imdb_id($id) {
    $parameters = array(
      'api_key' => $this->api_key
    );

    $data = $this->curl->simple_get($this->api_url . '/movie/' . $id, $parameters);
    $data = json_decode($data, true);

    if (!isset($data['imdb_id'])) {
      return null;
    }

    if (isset($data['imdb_id'])) {
      return array('imdb_id' => $data['imdb_id']);
    }

    return null;
  }

  function get_imdb_id($id) {
    if (($movie = $this->cache->get('tmdb_id_' . $id)) === false) {
      $movie = $this->_get_imdb_id($id);
      $this->cache->save('tmdb_id_' . $id, $movie, 86400);
    }
    return $movie;
  }

  private function _discover_movies($page = 1) {
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
      $processed = array_merge($processed, $this->_discover_movies($page + 1));
    }

    return $processed;
  }

  function discover_movies() {
    if (!$movies = $this->cache->get('tmdb_movies')) {
      $movies = $this->_discover_movies();

      // append the image path
      $image_path = $this->get_config()['images']['secure_base_url'] . 'w500';
      foreach ($movies as &$movie) {
        $movie['poster_path'] = $image_path . $movie['poster_path'];
        $movie['backdrop_path'] = $image_path . $movie['backdrop_path'];
      }

      $movies = $this->_sanatize($movies);
      $this->cache->save('tmdb_movies', $movies, 86400);
    }

    return $movies;
  }

}

?>