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
    const clean = require('gulp-clean')
    return gulp.src('build/', {read: false}).pipe(clean())
})

gulp.task('deploy-static', ['clean'], () => {
    gulp.src(['node_modules/@heroiclabs/nakama-js/dist/nakama-js.umd.js'])
        .pipe(gulp.dest('build/'))

    return gulp.src(['src/index.html']).pipe(gulp.dest('build/'))
})

gulp.task('deploy', ['clean', 'deploy-static'], () => {
    gulp.src(['src/**/*']).pipe(connect.reload())
})

gulp.task('watch', () => {
    return gulp.watch(['src/**/*'], ['deploy'])
})

gulp.task('default', sequence('deploy', 'connect', 'watch'))