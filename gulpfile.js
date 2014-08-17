var gulp = require('gulp');
var $ = require('gulp-load-plugins')({lazy: false});
var source = require('vinyl-source-stream');
var browserify = require('browserify');

var argv = require('minimist')(process.argv.slice(2));

var paths = {
  app: {
    entry: './app/main.js',
    all: './app/**/*.js',
    ext: ['./bower_components/**/*.js', './lodash_custom/**/*.js']
  },
  demo: {
    entry: ['./demo/scripts/main.js'],
    scripts: ['./demo/scripts/**/*.js'],
    stylesheets: ['./demo/stylesheets/**/*.css', './demo/stylesheets/**/*.sass'],
    extras: ['./*.{png,ico,txt,xml}']
  },
  dist: {
    scripts: './dist',
    demo: './'
  },
  tests: './tests'
};

gulp.task('lint', function() {
  return gulp.src(paths.app.all)
    .pipe($.jshint())
    .pipe($.jshint.reporter('default'));
});

gulp.task('test', function() {
  return gulp.src(paths.tests)
    .pipe( $.mocha( { reporter: 'spec' } ) )
});

gulp.task('scripts', ['lint'], function() {
  return browserify(paths.app.entry, {
      debug: argv.debug,
      standalone: 'terra'
    })
    .bundle()
    .pipe(source('terra.js'))
    .pipe(gulp.dest(paths.dist.scripts))
    .pipe($.rename('terra.min.js'))
    .pipe($.streamify( $.uglify() ))
    .pipe(gulp.dest(paths.dist.scripts))
});

gulp.task('demo', function() {
  return browserify(paths.demo.entry, {
      debug: argv.debug
    })
    .bundle()
    .pipe(source('terra.demo.min.js'))
    .pipe($.streamify( $.uglify() ))
    .pipe(gulp.dest(paths.dist.demo))
});

gulp.task('sass', function () {
  return gulp.src(paths.demo.stylesheets)
    .pipe($.rubySass())
    .pipe($.autoprefixer())
    .pipe($.minifyCss())
    .pipe(gulp.dest(paths.dist.demo))
});

gulp.task('watch', function() {
  gulp.watch([paths.app.all, paths.app.ext], ['lint', 'scripts']);
  gulp.watch(paths.demo.scripts, ['demo']);
  gulp.watch(paths.demo.stylesheets, ['sass']);
});

gulp.task( 'default', [ 'lint', 'scripts', 'demo', 'sass', 'watch' ] );
