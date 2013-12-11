<?php

class Migration_Movies extends CI_Migration {

  function up() {
    $fields = array(
      'title' => array(
        'type' => 'TEXT'
      ),
      'imdb_id' => array(
        'type' => 'VARCHAR',
        'constraint' => 12
      ),
      'tmdb_id' => array(
        'type' => 'INT',
        'constraint' => 8
      ),
      'rt_id' => array(
        'type' => 'INT',
        'constraint' => 12
      )
    );

    $this->dbforge->add_field($fields);
    $this->dbforge->add_key('tmdb_id', TRUE);
    $this->dbforge->create_table('movies');
  }

  function down() {
    $this->dbforge->create_table('movies');
  }

}