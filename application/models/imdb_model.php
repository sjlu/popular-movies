<?php

class Imdb_model extends CI_Model {

  function __construct() {
    parent::__construct();
    $this->load->library('dom');
    $this->load->driver('cache', array('adapter' => 'file'));
  }

  function get_accounting($id) {
    $url = 'http://www.imdb.com/title/';

    if (!$accounting = $this->cache->get('imdb_accounting_' . $id)) {
      $html = $this->dom->create_instance();

      try {
        @$html->load_file($url . $id);
      } catch (Exception $e) {
        $accounting = false;
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

      if (!$budget || !$gross) {
        $accounting = false;
      }

      $accounting = array(
        'budget' => $budget,
        'gross' => $gross
      );

      $this->cache->save('imdb_accounting_' . $id, $accounting, 604800); // 1 week
    }

    return $accounting;
  }

  function gross_exceeds_budget($id) {
    $accounting = $this->get_accounting($id);
    if ($accounting['gross'] > $accounting['budget']) {
      return true;
    }
    return false;
  }

}