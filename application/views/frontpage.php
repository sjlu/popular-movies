<div class="container">
   <div class="jumbotron">
      <h2>Popular Movies</h2>
      <p>
        This generates a list of movies that deem to be popular based on set or rules and algorithms
        from sources like <a href="http://www.themoviedb.org/" target="_blank">The Movie Database</a>,
        <a href="http://www.imdb.com/" target="_blank">IMDb</a>,
        <a href="http://www.rottentomatoes.com/" target="_blank">Rotten Tomatoes</a>
        and <a href="http://trakt.tv/" target="_blank">Trakt</a>.
      </p>
      <p>
        To view a simple set of data, go to <a href="<?php echo site_url('/api'); ?>" target="_blank">/api</a> or go to the cache on <a href="https://s3.amazonaws.com/popular-movies/movies.json">Amazon S3</a>.
        <br />For a detailed set, go to <a href="<?php echo site_url('/api/detail') ?>" target="_blank">/api/detail</a>.
      </p>
      <p>
        You can learn more about the project by visiting it on <a href="https://github.com/sjlu/popular-movies" target="_blank">Github</a>.
      </p>
   </div>
   <div id="posters"></div>
</div>
<script id="poster-template" type="text/x-handlebars-template">
  <div class="poster col-xs-12 col-sm-4">
    <img src="{{url}}" class="img-responsive" />
  </div>
</script>
