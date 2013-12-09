<?php
require(APPPATH . 'libraries/REST_Controller.php');
class Api extends REST_Controller {

  function __construct() {
    parent::__construct();
    $this->load->model(array(
      'tmdb_model',
      'rt_model',
      'omdb_model',
      'movies_model',
      'imdb_model'
    ));
    $this->load->driver('cache', array('adapter' => 'file'));
  }

  function index_get() {
    // Get a raw list of movies for the database
    if (!$popular_movies = $this->cache->get('movies')) {
      $popular_movies = $this->tmdb_model->discover();
      $this->cache->save('movies', $popular_movies, 86400);
    }

    // Weed out ones that the user defined that they
    // do not want to see.
    $days_back = $this->get('days_back');
    if ($days_back) {
      $date = date('Ymd', strtotime('-' . $days_back . ' days'));
      foreach ($popular_movies as $key => &$movie) {
        if (str_replace("-", "", $movie['release_date']) < $date) {
          unset($popular_movies[$key]);
        }
      }
    }

    // See if we have any association in the database.
    $tmdb_ids = array();
    foreach ($popular_movies as $movie) {
      $tmdb_ids[] = $movie['tmdb_id'];
    }
    $stored = $this->movies_model->lookup_movies($tmdb_ids);

    // Associate IDs to each movie.
    $returnable_movies = array();
    foreach ($popular_movies as &$movie) {
      $title = $movie['title'];
      $year = substr($movie['release_date'], 0, 4);

      if (isset($stored[$movie['tmdb_id']])) {
        $movie = array_merge($movie, $stored[$movie['tmdb_id']]);
        continue;
      }

      $ids = $this->tmdb_model->get_imdb_id($movie['tmdb_id']);
      if ($ids) {
        $movie = array_merge($movie, $ids);
        continue;
      }

      $ids = $this->rt_model->lookup_movie($title, $year);
      if ($ids) {
        $movie = array_merge($movie, $ids);
        continue;
      }

      $ids = $this->omdb_model->lookup_movie($title, $year);
      if ($ids) {
        $movie = array_merge($movie, $ids);
        continue;
      }
    }

    $returnable_movies = array();
    foreach ($popular_movies as $movie) {
      if (isset($movie['imdb_id'])) {
        if (!isset($stored[$movie['tmdb_id']])) {
          $this->movies_model->add_movie($movie);
        }

        if (!$this->imdb_model->gross_exceeds_budget($movie['imdb_id'])) {
          continue;
        }

        $returnable_movies[] = $movie;
      }
    }

    $this->response(array('movies' => $returnable_movies));
  }

}