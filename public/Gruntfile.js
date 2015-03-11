module.exports = function(grunt) {
    'use strict';

    console.log('Current ENV is: ' + process.env.NODE_ENV);

    var isDev = process.env.NODE_ENV === 'local';
    var sourceMapRoot = 'http://localhost:3000/js/';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: isDev ? {
                footer:'\n' + '/*! local_env <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd hh:mm:ss") %> */\n',
				mangle: false,
				compress:false,
				beautify:true
            } : {
                footer:'\n' + '/*! <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd hh:mm:ss") %> */\n'
            },
            app: {
                options: isDev ? {
                    sourceMap: function (path) {
                        return path + '.map';
                    },
                    sourceMappingURL: 'app.min.js.map',
                    sourceMapRoot: sourceMapRoot
                } : {},
                src: [
                    'js/app.js',
                    'js/app/pages/**/*.js',
                    'js/app/*.js',
                    'js/app/eof.js'
                ],
                dest: 'js/app.min.js'
            },
            lib: {
                options: isDev ? {
                    sourceMap: function (path) {
                        return path + '.map';
                    },
                    sourceMappingURL: 'lib.min.js.map',
                    sourceMapRoot: sourceMapRoot
                } : {},
                src: [
                    'js/lib/**/*.js'
                ],
                dest: 'js/lib.min.js'
            },
            vendor: {
                options: isDev ? {
                    sourceMap: function (path) {
                        return path + '.map';
                    },
                    sourceMappingURL: 'vendor.min.js.map',
                    sourceMapRoot: sourceMapRoot
                } : {},
                src: [
                    'js/vendor/_console.js',
                    'js/vendor/bower_components/jquery/dist/jquery.js',
                    'js/vendor/bower_components/jquery.cookie/jquery.cookie.js',
                    'js/vendor/bower_components/lodash/lodash.js',
                    'js/vendor/bower_components/backbone/backbone.js'
                ],
                dest: 'js/vendor.min.js'
            },
            components: {
                files: [{
                    expand: true,
                    cwd: 'js/app/components',
                    src: '*.js',
                    dest: 'js/app/components/min'
                }]
            }
        },
        
        clean: ['js/app/components/min/*.js'],
        
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            build: {
                src: [
                    'js/app.js',
                    'js/app/pages/*.js',
                    'js/app/components/*.js',
                    'js/app/*.js'
                ]
            }
        },
        
        sass: {
            build: {
                options: {
                    compass: true,
                    style: 'expanded',
                    noCache: true
                },
                files: {
                    'css/equinox.css': 'sass/equinox.scss',
                    'css/equinox-medium.css': 'sass/equinox-medium.scss',
                    'css/equinox-large.css': 'sass/equinox-large.scss',
                    'css/equinox-extralarge.css': 'sass/equinox-extralarge.scss',
                    'css/equinox-ie.css': 'sass/equinox-ie.scss'
                }
            }
        },
        
        watch: {
            components: {
                files: ['js/app/components/*.js'],
                tasks: ['jshint', 'clean', 'uglify:components']
            },
            js: {
                files: ['<%= uglify.app.src %>', '<%= uglify.vendor.src %>', '<%= uglify.lib.src %>', '<%= jshint.build.src %>'],
                tasks: ['jshint', 'uglify:app', 'uglify:vendor', 'uglify:lib']
            },
            css: {
                files: ['**/*.scss'],
                tasks: ['sass']
            },
            options: {
                atBegin: true,
                livereload: false
            }
        },
        
        build: {
            js: ['jshint', 'uglify:app', 'uglify:vendor', 'uglify:lib', 'clean', 'uglify:components'],
            css: ['sass']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task(s).
    grunt.registerTask('default', ['sass', 'jshint', 'uglify:app', 'uglify:vendor', 'uglify:lib', 'clean', 'uglify:components']);

    grunt.registerMultiTask('build', 'Build both JS and CSS targets or specified only.', function () {
        if (this.data && this.data.length) {
            grunt.task.run(this.data);
        }
    });
};
