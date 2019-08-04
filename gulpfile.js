const gulp = require('gulp');
const fs = require('fs');
const $ = require('gulp-load-plugins')();
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');
const mergeStream = require('merge-stream');
const webpack = require('webpack-stream');
const webpackBundle = require('webpack');
const named = require('vinyl-named');
const browserSync = require('browser-sync');
const pug = require('pug');
const MarkdownIt = require('markdown-it');
const meta = require('markdown-it-meta');
const citation = require('markdown-it-citation');


// Sass tasks
gulp.task('sass', () => {

  return gulp.src(['./assets/scss/**/*.scss'])
    .pipe($.plumber({
      errorHandler: $.notify.onError('<%= error.message %>')
    }))
    .pipe($.sassGlob())
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      errLogToConsole: true,
      outputStyle: 'compressed',
      sourceComments: false,
      sourcemap: true,
      includePaths: [
        './assets/scss',
        './node_modules/bootstrap/scss',
      ]
    }))
    .pipe($.autoprefixer({
      grid: true,
      browsers: ['last 2 versions', 'ie 11']
    }))
    .pipe($.sourcemaps.write('./map'))
    .pipe(gulp.dest('./docs/css'));
});

// Eslint
gulp.task('eslint', () => {
  return gulp.src(['./assets/js/**/*.js'])
    .pipe($.eslint({ useEslintrc: true }))
    .pipe($.eslint.format());
});

// Package js
gulp.task('js', () => {
  let tmp = {};
  return gulp.src(['./assets/js/**/*.js'])
    .pipe($.plumber({
      errorHandler: $.notify.onError('<%= error.message %>')
    }))
    .pipe(named())
    .pipe($.rename(function (path) {
      tmp[path.basename] = path.dirname;
    }))
    .pipe(webpack({
      mode: 'production',
      devtool: 'source-map',
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
                plugins: ['@babel/plugin-transform-react-jsx']
              }
            }
          }
        ]
      }
    }, webpackBundle))
    .pipe($.rename(function (path) {
      if (tmp[path.basename]) {
        path.dirname = tmp[path.basename];
      } else if ('.map' === path.extname && tmp[path.basename.replace(/\.js$/, '')]) {
        path.dirname = tmp[path.basename.replace(/\.js$/, '')];
      }
      return path;
    }))
    .pipe(gulp.dest('./docs/js'));
});

// Image min
gulp.task('imagemin', () => {
  return gulp.src('./assets/img/**/*')
    .pipe($.imagemin([
      pngquant({
        speed: 1,
        floyd: 0
      }),
      mozjpeg({
        quality: 85,
        progressive: true
      }),
      $.imagemin.svgo(),
      $.imagemin.optipng(),
      $.imagemin.gifsicle()
    ]))
    .pipe(gulp.dest('./docs/img'));
});


// Copy library to bundle.
gulp.task('copylib', () => {
  return mergeStream(
    gulp.src([
      './node_modules/jquery/dist/jquery.min.js',
      './node_modules/jquery/dist/jquery.min.map',
      './node_modules/popper.js/dist/umd/popper.min.js',
      './node_modules/popper.js/dist/umd/popper.min.js.map',
      './node_modules/bootstrap/dist/js/bootstrap.min.js',
      './node_modules/bootstrap/dist/js/bootstrap.min.js.map',
    ])
      .pipe(gulp.dest('docs/js'))
  );
});


gulp.task('pug-extract', (done) => {
  // Make new instance
  const md = new MarkdownIt();
  // Add markdown-it-meta
  md.use( meta );
  // Read directory.
  //[].forEach(  );
  done();
  fs.readdirSync( testFolder, (err, files) => {
    files.forEach(file => {
      console.log(file);
    });
  });
  const renderedDocument =  md.render('<md with YAML>');
  console.log({
    document: renderedDocument,
    meta: md.meta
  });
  done();
});

gulp.task('pug-render', (done) => {
  done();
} );

gulp.task('pug-front', (done) => {
  // Add markdown-it-meta
  const local = {
    about: '',
    contact: '',
    members: [],
  };
  const css = fs.statSync("docs/css/app.css").mtime;
  const js = fs.statSync("assets/js/app.js").mtime;
  const index = fs.statSync("docs/index.html").mtime;
  // Scan md files to compile.
  const files = fs.readdirSync( './manuscripts' );
  files.forEach( file => {
    // Make new instance
    const md = (new MarkdownIt()).use( citation );
    md.use( meta );
    const fileContent = fs.readFileSync( './manuscripts/' + file );
    let rendered = md.render( fileContent.toString() );
    rendered = rendered.replace( /&lt;!--(.*?)--&gt;/smg, '' );
    switch( file ) {
      case 'about.md':
        local.about = rendered;
        break;
      case 'contact.md':
        local.contact = rendered;
        break;
      default:
        local.members.push( Object.assign({
          name: "",
          name_ja: "",
          photo: "",
          site: "",
          twitter: "",
          html: rendered,
          id: file.replace( '.md', '' ),
        }, md.meta));
        break;
    }
  });
  // Render HTML
  const compiled = pug.compileFile('pug/index.pug');
  const html = compiled({
    title: 'Dead Channel JP',
    tagline: 'the Sci-Fi writers association in Chiba City',
    desc: 'The sky above the port was the color of television, tuned to a dead channel.',
    markdown: local,
    time: {
      css: css.getTime(),
      js: js.getTime(),
      index: index.getTime(),
    }
  });
  return $.file('index.html', html, { src: true })
    .pipe(gulp.dest('docs'));
});

// Watch BS
gulp.task('bs-watch', () => {
  return gulp.watch([
    'docs/css/**/*.css',
    'docs/js/**/*.js',
    'docs/img/**/*',
    'docs/**/*.html'
  ], gulp.task('bs-reload'));
});

// Copy favicon
gulp.task( 'favicon', () => {
  return gulp.src( './assets/favicon.ico' )
    .pipe( gulp.dest('docs'));
});

// BrowserSync
gulp.task('browser-sync', () => {
  return browserSync({
    server: {
      baseDir: "./docs/",
      index: "index.html"
    },
    reloadDelay: 500
  });
});

// Reload browser sync.
gulp.task('bs-reload', (done) => {
  browserSync.reload();
  done();
});

// watch
gulp.task('watch', function () {
  // Make SASS
  gulp.watch('assets/scss/**/*.scss', gulp.task('sass'));
  // Handle JSX
  gulp.watch(['assets/js/**/*.js'], gulp.parallel('js', 'eslint'));
  // Minify Image
  gulp.watch('assets/img/**/*', gulp.task('imagemin'));
  // Pug
  gulp.watch( 'pug/**/*.pug', gulp.task( 'pug' ) );
  gulp.watch( 'manuscripts/**/*.md', gulp.task( 'pug' ) );
});

// Pug.
gulp.task('pug', gulp.series( 'pug-render', 'pug-front'));

// Build
gulp.task('build', gulp.series( gulp.parallel('js', 'sass', 'copylib', 'imagemin', 'pug', 'favicon'), 'pug' ) );

// Browser Sync
gulp.task( 'bs', gulp.parallel( 'browser-sync', 'bs-watch' ) );

// Default Tasks
gulp.task('default', gulp.series('build', gulp.parallel('watch', 'bs') ));
