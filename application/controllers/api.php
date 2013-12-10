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

  private function _retrieve() {
    // Get a raw list of movies for the database
    log_message('info', 'Looking up movies on TMDb.');
    if (!$popular_movies = $this->cache->get('movies')) {
      log_message('info', 'TMDb movies were not cached, looking up.');
      $popular_movies = $this->tmdb_model->discover();
      $this->cache->save('movies', $popular_movies, 86400);
    }

    // Weed out anything that hasn't been curated long enough.
    $today = date('Ymd', strtotime('-90 days'));
    $past = date('Ymd', strtotime('-1 year'));
    foreach ($popular_movies as $key => $movie) {
      $numeric_release_date = str_replace("-", "", $movie['release_date']);
      if ($numeric_release_date > $today || $numeric_release_date < $past) {
        unset($popular_movies[$key]);
      }
    }

    log_message('info', 'Looking up existing IDs in the database.');
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

      log_message('info', 'ID not found in database, looking up. (' . $movie['tmdb_id'] . ')');

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

    // Unset anything that doesn't have an IMDB id.
    // And if it does have an ID, make sure we have it in the DB.
    $imdb_id = $this->get('imdb_id');
    $returnable_movies = array();
    foreach ($popular_movies as $movie) {
      if (!isset($movie['imdb_id'])) {
        continue;
      }

      if (!isset($stored[$movie['tmdb_id']])) {
        $this->movies_model->add_movie($movie);
      }

      // If asked for a specific ID, return only this.
      if ($imdb_id && $movie['imdb_id'] != $imdb_id) {
        continue;
      }

      $returnable_movies[] = $movie;
    }

    // Lookup information from IMDb.
    foreach ($returnable_movies as &$movie) {
      log_message('info', 'Looking up movie information on IMDb. (' . $movie['imdb_id'] . ')');
      $movie['imdb'] = $this->imdb_model->lookup($movie['imdb_id']);
    }

    // Lets see what we can filter down with confidence
    $filtered_movies = array();
    $removed_movies = array();
    foreach ($returnable_movies as $movie) {
      $remove = false;
      // No budget
      if ($movie['imdb']['budget'] < 10000000) {
        $remove = true;
      }

      // Low popularity
      if ($movie['tmdb']['popularity'] < 2.5) {
        $remove = true;
      }

      // Low rating
      if ($movie['imdb']['rating'] < 4 || $movie['tmdb']['vote_average'] < 4) {
        $remove = true;
      }

      // Not enough votes
      if ($movie['imdb']['rating_count'] < 30000 && $movie['tmdb']['vote_count'] < 200) {
        $remove = true;
      }

      // Bottom of the bottom
      if ($movie['imdb']['rating_count'] < 15000 || $movie['tmdb']['vote_count'] < 75) {
        $remove = true;
      }

      if ($remove) {
        $removed_movies[] = $movie;
      } else {
        $filtered_movies[] = $movie;
      }
    }

    // With the stuff we've added, how many ratings have
    // they gotten?
    $stats = array(
      'average_number_of_votes' => 0,
      'average_money_spent' => 0,
      'average_money_earned' => 0,
      'average_popularity' => 0,
      'average_rating' => 0,
    );
    foreach ($filtered_movies as $movie) {
      $stats['average_number_of_votes'] += $movie['imdb']['rating_count'];
      $stats['average_money_spent'] += $movie['imdb']['budget'];
      $stats['average_money_earned'] += $movie['imdb']['gross'];
      $stats['average_popularity'] += $movie['tmdb']['popularity'];
      $stats['average_rating'] += $movie['imdb']['rating'];
    }
    $number_of_movies = count($filtered_movies);
    foreach ($stats as &$stat) {
      $stat = $stat / $number_of_movies;
    }

    // Can we add anything back in?
    $removed_movies_temp = array();
    foreach ($removed_movies as $movie) {
      $add_back = false;
      // if ($movie['tmdb']['vote_count'] > $stats['average_number_of_votes']) {
      //   $add_back = true;
      // }

      // if ($movie['imdb']['gross'] > $stats['average_money_earned']) {
      //   $add_back = true;
      // }

      // if ($movie['tmdb']['vote_average'] > $stats['average_rating'] && $movie['tmdb']['popularity']  > $stats['average_popularity']) {
      //   $add_back = true;
      // }

      if ($add_back) {
        $filtered_movies[] = $movie;
      } else {
        $removed_movies_temp[] = $movie;
      }
    }
    $removed_movies = $removed_movies_temp;

    return array(
      'movies' => $filtered_movies,
      'others' => $removed_movies,
      'stats' => $stats
    );
  }

  function detail_get() {
    $this->response($this->_retrieve());
  }

  function index_get() {
    $movies = $this->_retrieve()['movies'];
    $returnable_movies = array();
    foreach ($movies as $movie) {
      $returnable_movies[] = array(
        'title' => $movie['title'],
        'imdb_id' => $movie['imdb_id']
      );
    }
    $this->response(array('movies' => $returnable_movies));
  }

}