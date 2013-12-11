<?php

class Trakt_model extends CI_Model {

  private $api_url = 'http://api.trakt.tv';

  function __construct() {
    parent::__construct();
    $this->load->driver('cache', array('adapter' => 'file'));
    $this->api_key = $this->config->item('trakt_key');
  }

  private function _sanatize($data) {
    return array(
      'rating' => $data['ratings']['percentage'] / 10,
      'rating_count' => $data['ratings']['votes'],
      'lists' => $data['lists']['all'],
      'collections' => $data['collection']['all'],
      'plays' => $data['plays'],
    );
  }

  private function _lookup($id) {
    $data = $this->curl->simple_get($this->api_url . '/movie/stats.json/' . $this->api_key . '/' . $id);
    $data = json_decode($data, true);

    if (!isset($data['ratings'])) {
      return null;
    }

    return $this->_sanatize($data);
  }

  function lookup($id) {
    if (($movie = $this->cache->get('trakt_' . $id)) === false) {
      $movie = $this->_lookup($id);
      $this->cache->save('trakt_' . $id, $movie, 86400);
    }
    return $movie;
  }

}
