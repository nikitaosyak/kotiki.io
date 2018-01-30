const gulp = require('gulp')
const connect = require('gulp-connect')
const sequence = require('run-sequence').use(gulp)

gulp.task('connect', () => {
    connect.server({
        root: 'build/',
        port: '8000',
        livereload: true
    })
})

gulp.task('clean', () => {
    return gulp.src('build/', {read: false}).pipe(require('gulp-clean')())
})

gulp.task('pack', ['clean'], () => {
    const stream = require('webpack-stream')
    const webpack2 = require('webpack')

    const config = {
        module: {
            loaders: [{
                test: /'.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: { presets: ['env']}
            }]
        },
        output: { filename: 'bundle.js' },
        devtool: 'source-map'
    }

    return gulp.src('src/js/**/*.js')
        .pipe(stream(config, webpack2))
        .pipe(gulp.dest('build/'))
})

gulp.task('deploy-static', ['clean'], () => {
    gulp.src(['../nakamaclient/dist/nakama-js.umd.js'])
        .pipe(gulp.dest('build/'))

    gulp.src(['src/lib/**/*.js']).pipe(gulp.dest('build/lib'))

    return gulp.src(['src/index.html']).pipe(gulp.dest('build/'))
})

gulp.task('deploy', ['clean', 'pack', 'deploy-static'], () => {
    gulp.src(['src/**/*']).pipe(connect.reload())
})

gulp.task('watch', () => {
    return gulp.watch(['src/**/*'], ['deploy'])
})

gulp.task('default', sequence('deploy', 'connect', 'watch'))