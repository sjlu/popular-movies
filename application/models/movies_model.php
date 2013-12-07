<?php

class Movies_model extends CI_Model {

  function __construct() {
    parent::__construct();
    $this->load->database();
    $this->load->library('migration');
    if (!$this->migration->current()) {
      show_error($this->migration->error_string());
    }
  }

  function add_movie($movie) {
    $this->db->insert('movies', $movie);
    return $movie;
  }

  function lookup_movies($tmdb_ids) {
    $this->db->where_in('tmdb_id', $tmdb_ids);

    $query = $this->db->get('movies');
    $results = $query->result_array();

    $output = array();
    foreach($results as $result) {
      $output[$result['tmdb_id']] = $result;
    }

    return $output;
  }

  function lookup_movie($tmdb_id) {
    $this->db->where('tmdb_id', $tmdb_id);

    $query = $this->db->get('movies');
    return $query->row_array();
  }

}