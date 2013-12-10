$(document).ready(function() {
	var posterTemplate = Handlebars.compile($('#poster-template').html());
	var movies = $.get('index.php/api/detail', function (data) {
    var currentRow, i;
    for (i = 0; i < data.passed.length; i++) {
      var movie = data.passed[i];

      if (!(i % 3)) {
        $('#posters').append(currentRow);
        currentRow = $('<div class="row">');
      }

			currentRow.append(posterTemplate({
				url: movie.tmdb.poster_path
			}));
	  }

    if (i % 3) {
      $('#posters').append(currentRow);
    }
	});
});