$(document).ready(function() {
	var template = Handlebars.compile($('#poster-template').html());
	var movies = $.get('index.php/api/detail', function (data) {
	  _.each(data.movies, function(movie) {
			$('#posters').append(template({
				url: movie.tmdb.poster_path
			}));
	  });
	});
});