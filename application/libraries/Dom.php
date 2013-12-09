<?php

class Dom {

   function create_instance() {
      include_once 'simple_html_dom.php';
      return new Simple_html_dom();
   }

}
