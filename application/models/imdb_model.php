<?php

class Imdb_model extends CI_Model {

  function __construct() {
    parent::__construct();
    $this->load->library('dom');
    $this->load->driver('cache', array('adapter' => 'file'));
  }

  function lookup($id) {
    $url = 'http://www.imdb.com/title/';

    if (!$info = $this->cache->get('imdb_' . $id)) {
      $html = $this->dom->create_instance();

      try {
        @$html->load_file($url . $id);
      } catch (Exception $e) {
        $info = false;
      }

      $budget = false;
      $gross = false;
      $elements = $html->find('div[class=txt-block]');
      foreach ($elements as $element) {
        if (preg_match("/budget/i", $element->plaintext)) {
          $budget = filter_var($element->plaintext, FILTER_SANITIZE_NUMBER_INT);
        }

        if (preg_match("/gross/i", $element->plaintext)) {
          $text = preg_replace("/\(.*\)/", "", $element->plaintext);
          $gross = filter_var($text, FILTER_SANITIZE_NUMBER_INT);
        }
      }

      $rating_count = $html->find('span[itemprop=ratingCount]', 0)->plaintext;
      $rating_count = filter_var($rating_count, FILTER_SANITIZE_NUMBER_INT);

      $rating = $html->find('div[class=star-box-giga-star]', 0)->plaintext;
      $rating = filter_var($rating, FILTER_SANITIZE_NUMBER_INT);

      $info = array(
        'budget' => $budget,
        'gross' => $gross,
        'revenue' => $gross - $budget,
        'rating_count' => $rating_count,
        'rating' => $rating/10
      );

      $this->cache->save('imdb_' . $id, $info, 604800); // 1 week
    }

    return $info;
  }

  function gross_exceeds_budget($id) {
    $info = $this->lookup($id);
    if ($info['gross'] > $info['budget']) {
      return true;
    }
    return false;
  }

}