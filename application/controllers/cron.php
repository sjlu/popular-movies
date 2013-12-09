<?php
class Cron extends CI_Controller {

  function __construct() {
    parent::__construct();
    $this->load->model(array(
      'tmdb_model',
      'rt_model',
      'omdb_model',
      'movies_model'
    ));
    $this->load->driver('cache', array('adapter' => 'file'));
    $this->load->library('aws');
    $this->aws->load('s3');
  }

  function get() {
    if (!$popular_movies = $this->cache->get('movies')) {
      $popular_movies = $this->tmdb_model->discover_movies();
      $this->cache->save('movies', $popular_movies, 86400);
    }

    $days_back = $this->get('days_back');
    if ($days_back) {
      $date = date('Ymd', strtotime('-' . $days_back . ' days'));
      foreach ($popular_movies as $key => &$movie) {
        if (str_replace("-", "", $movie['release_date']) < $date) {
          unset($popular_movies[$key]);
        }
      }
    }

    $tmdb_ids = array();
    foreach ($popular_movies as $movie) {
      $tmdb_ids[] = $movie['tmdb_id'];
    }
    $stored = $this->movies_model->lookup_movies($tmdb_ids);

    $returnable_movies = array();
    foreach ($popular_movies as &$movie) {
      $title = $movie['title'];
      $year = substr($movie['release_date'], 0, 4);

      if (isset($stored[$movie['tmdb_id']])) {
        $movie = array_merge($movie, $stored[$movie['tmdb_id']]);
        $returnable_movies[] = $movie;
        continue;
      }

      $ids = $this->rt_model->lookup_movie($title, $year);
      if ($ids) {
        $movie = array_merge($movie, $ids);
      } else {
        // alternative lookup
        $ids = $this->omdb_model->lookup_movie($title, $year);
        if ($ids) {
          $movie = array_merge($movie, $ids);
        }
      }

      if ($ids) {
        $this->movies_model->add_movie($movie);
        $returnable_movies[] = $movie;
      }
    }

    return $returnable_movies;
  }

  function upload_to_s3() {
    $this->aws->s3->create_object('popular-movies', 'movies.json', array(
      'body' => json_encode($this->get())
    ));
  }

}