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
      'imdb_model',
      'trakt_model'
    ));
    $this->load->driver('cache', array('adapter' => 'file'));
  }

  private function _first_pass($movies) {
    // Lets see what we can filter down with confidence
    $passed = array();
    $removed = array();
    foreach ($movies as $movie) {
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
        $removed[] = $movie;
      } else {
        $passed[] = $movie;
      }
    }
    return array(
      'removed' => $removed,
      'passed' => $passed
    );
  }

  private function _second_pass($movies) {
    // With the stuff we've added, how many ratings have
    // they gotten?
    $association = array(
      'imdb' => array(
        'rating_count' => 'average_imdb_rating_count',
        'rating' => 'average_imdb_rating',
        'budget' => 'average_money_spent',
        'gross' => 'average_money_earned',
      ),
      'tmdb' => array(
        'vote_average' => 'average_tmdb_rating',
        'vote_count' => 'average_tmdb_rating_count',
      ),
      'rt' => array(
        'critics_score' => 'average_imdb_critics_score',
        'audience_score' => 'average_imdb_audience_score'
      ),
      'trakt' => array(
        'rating' => 'average_trakt_score',
        'rating_count' => 'average_trakt_rating_count',
        'plays' => 'average_trakt_plays'
      )
    );
    $stats = array();
    foreach ($movies['passed'] as $movie) {
      foreach ($association as $key => $value) {
        if (is_array($value)) {
          foreach ($value as $inner_key => $inner_value) {
            if (!isset($stats[$inner_value])) {
              $stats[$inner_value] = 0;
            }

            $stats[$inner_value] += $movie[$key][$inner_key];
          }
        } else {
          if (!isset($value)) {
            $stats[$value] = 0;
          }

          $stats[$value] += $movie[$key];
        }
      }
    }
    $number_of_movies = count($movies['passed']);
    foreach ($stats as &$stat) {
      $stat = $stat / $number_of_movies;
    }

    // Can we add anything back in?
    $removed = array();
    $passed = $movies['passed'];
    foreach ($movies['removed'] as $movie) {
      $points = 0;

      // Will place in a series of auto-generated rules.
      // If it passes a certain amount of rules, it'll be
      // added back into the list.
      foreach ($association as $key => $value) {
        if (is_array($value)) {
          foreach ($value as $inner_key => $inner_value) {
            if ($movie[$key][$inner_key] > $stats[$inner_value]) {
              $points++;
            }
          }
        } else {
          if ($movie[$key] > $stats[$value]) {
            $points++;
          }
        }
      }

      if ($points > ceil(count($stats) * 0.5)) {
        $passed[] = $movie;
        log_message('info', 'Added back movie with ' . $points . ' points. (' . $movie['title'] . ')');
      } else {
        $removed[] = $movie;
      }
    }

    return array(
      'removed' => $removed,
      'passed' => $passed
    );
  }

  private function _retrieve() {
    // Get a raw list of movies for the database
    $popular_movies = $this->tmdb_model->discover_movies();

    // Weed out anything that hasn't been curated long enough.
    $today = date('Ymd', strtotime('-90 days'));
    $past = date('Ymd', strtotime('-1 year'));
    foreach ($popular_movies as $key => $movie) {
      $numeric_release_date = str_replace("-", "", $movie['tmdb']['release_date']);
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
    $movies = array();
    foreach ($popular_movies as &$movie) {
      $title = $movie['title'];
      $year = substr($movie['tmdb']['release_date'], 0, 4);

      if (isset($stored[$movie['tmdb_id']])) {
        $movie = array_merge($movie, $stored[$movie['tmdb_id']]);
        continue;
      }

      log_message('info', 'IDs not found in database, looking up. (' . $movie['title'] . ')');
      $ids = $this->tmdb_model->get_imdb_id($movie['tmdb_id']);
      if ($ids) {
        $movie = array_merge($ids, $movie);
      }

      $ids = $this->rt_model->search_movie($title, $year);
      if ($ids) {
        $movie = array_merge($ids, $movie);
      }

      if (!isset($movie['imdb_id'])) {
        $ids = $this->omdb_model->search_movie($title, $year);
        if ($ids) {
          $movie = array_merge($ids, $movie);
        }
      }
    }

    // Unset anything that doesn't have an IMDB id.
    // And if it does have an ID, make sure we have it in the DB.
    $movies = array();
    foreach ($popular_movies as $movie) {
      if (!isset($movie['imdb_id'])) {
        log_message('info', 'IMDb ID not found. (' . $movie['title'] . ')');
        continue;
      }

      if (!isset($movie['rt_id'])) {
        log_message('info', 'RT ID not found. ('. $movie['title'] . ')');
        continue;
      }

      if (!isset($stored[$movie['tmdb_id']])) {
        $this->movies_model->add_movie($movie);
      }

      $movies[] = $movie;
    }

    // Lookup information from IMDb.
    foreach ($movies as &$movie) {
      log_message('info', 'Looking up movie information on IMDb. (' . $movie['title'] . ')');
      $movie['imdb'] = $this->imdb_model->lookup($movie['imdb_id']);

      log_message('info', 'Looking up data on Trakt. (' . $movie['title'] . ')');
      $movie['trakt'] = $this->trakt_model->lookup($movie['imdb_id']);

      if (isset($movie['rt_id'])) {
        log_message('info', 'Looking up movie information on RT. (' . $movie['title'] . ')');
        $movie['rt'] = $this->rt_model->lookup($movie['rt_id']);
      }
    }

    $movies = $this->_first_pass($movies);
    log_message('info', 'First pass. (' . count($movies['passed']) . '/' . count($movies['removed']) . ')');

    $movies = $this->_second_pass($movies);
    log_message('info', 'Second pass. (' . count($movies['passed']) . '/' . count($movies['removed']) . ')');

    return array(
      'passed' => $movies['passed'],
      'removed' => $movies['removed']
    );
  }

  private function _retrieve_cached() {
    if (!$data = $this->cache->get('api')) {
      $data = $this->_retrieve();
      $this->cache->save('api', $data, 14400);
    }
    return $data;
  }

  function detail_get() {
    $this->response($this->_retrieve_cached());
  }

  function index_get() {
    $movies = $this->_retrieve_cached();
    $output = array();
    foreach ($movies['passed'] as $movie) {
      $output[] = array(
        'title' => $movie['title'],
        'imdb_id' => $movie['imdb_id']
      );
    }
    $this->response(array('movies' => $output));
  }

}