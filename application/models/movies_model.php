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
    $project_to_db = array();
    $fields = array(
      'title' => array('required' => true),
      'tmdb_id' => array('required' => true),
      'imdb_id' => array('required' => true),
      'rt_id' => array('required' => true)
    );
    foreach ($fields as $field => $parameters) {
      if (isset($movie[$field])) {
        $project_to_db[$field] = $movie[$field];
      } else {
        if (isset($parameters['required']) && $parameters['required']) {
          return false;
        }
      }
    }

    if ($this->lookup_movie($project_to_db['tmdb_id'])) {
      return false;
    }

    $this->db->insert('movies', $project_to_db);

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

    if ($query->num_rows()) {
      return $query->row_array();
    }

    return false;
  }

}