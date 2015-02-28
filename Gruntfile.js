module.exports = function(grunt) {

    var isLocal = 'local'; //process.env.NODE_ENV === 'local';

    console.log('Current ENV is: ' + process.env.NODE_ENV);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: isLocal ? {
                footer:'\n' + '/*! local_env <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd hh:mm:ss") %> */\n',
				mangle: false,
				compress:false,
				beautify:true
            } : {
                footer:'\n' + '/*! <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd hh:mm:ss") %> */\n'
            },
            app: {
                options: isLocal ? {
                    sourceMap: function (path) {
                        return path + '.map';
                    },
                    sourceMappingURL: 'app.min.js.map',
                    sourceMapRoot: '//local-web.equinox.com/assets/'
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
                options: isLocal ? {
                    sourceMap: function (path) {
                        return path + '.map';
                    },
                    sourceMappingURL: 'lib.min.js.map',
                    sourceMapRoot: '//local-web.equinox.com/assets/'
                } : {},
                src: [
                    'js/lib/**/*.js'
                ],
                dest: 'js/lib.min.js'
            },
            vendor: {
                options: isLocal ? {
                    sourceMap: function (path) {
                        return path + '.map';
                    },
                    sourceMappingURL: 'vendor.min.js.map',
                    sourceMapRoot: '//local-web.equinox.com/assets/'
                } : {},
                src: [
                    'js/vendor/_console.js',
                    'js/vendor/bower_components/jquery/jquery.js',
                    'js/vendor/bower_components/lodash/dist/lodash.js',
                    'js/vendor/bower_components/backbone/backbone.js',
                    'js/vendor/bower_components/jquery.autoGrowInput/jquery.autoGrowInput.js',
                    'js/vendor/bower_components/jquery.stellar/jquery.stellar.js',
                    'js/vendor/bower_components/spin.js/spin.js',
                    'js/vendor/bower_components/video.js/video.js',
                    'js/vendor/bower_components/zeroclipboard/ZeroClipboard.js',
                    'js/vendor/bower_components/backgrid/lib/backgrid.js',
                    'js/vendor/bower_components/backbone.paginator/lib/backbone.paginator.js',
                    'js/vendor/bower_components/backgrid-paginator/backgrid-paginator.js',
                    'js/vendor/bower_components/jquery-cookie/*.js',
                    'js/vendor/bower_components/picturefill/dist/picturefill.js',
                    'js/vendor/*.js' //Other non bower vendor scripts.
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
        },
        msbuild: {
            dev: {
                src: ['../Equinox.Site.Web.csproj'],
                options: {
                    projectConfiguration: 'Debug',
                    targets: ['Clean', 'Rebuild'],
                    stdout: true,
                    maxCpuCount: 4,
                    buildParameters: {
                        WarningLevel: 2
                    }
                }
            }
        },
        hub: {
        	schedule: {
        		src: ['js/apps/schedule/Gruntfile.js'],
        		tasks: ['jshint']
        	},

        	purchase: {
        		src: ['js/apps/purchase/Gruntfile.js'],
        		tasks: ['jshint']
        	},
			
			giftcard: {
        		src: ['js/apps/giftcard/Gruntfile.js'],
        		tasks: ['jshint']
        	}
        }
    });

    grunt.loadNpmTasks('grunt-hub');
    grunt.loadNpmTasks('grunt-msbuild');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    //grunt.loadNpmTasks('grunt-jsdoc');

    // Default task(s).
    grunt.registerTask('default', ['sass', 'jshint', 'uglify:app', 'uglify:vendor', 'uglify:lib', 'clean', 'uglify:components', 'spa']);

    grunt.registerMultiTask('build', 'Build both JS and CSS targets or specified only.', function () {
        if (this.data && this.data.length) {
            grunt.task.run(this.data);
        }
    });

	// SPA Pages
    grunt.registerTask('spa', [
        'hub:schedule',
        'hub:purchase',
		'hub:giftcard'
    ]);


    grunt.registerTask('kss', 'Run the styleguide ruby server and save it\'s content to /styleguide directory.', function () {
        var path = require('path'),
            http = require('http'),
            cssPath = path.resolve(__dirname, 'css'),
            kssPath = path.resolve(__dirname, 'kss'),
            kssApplication = path.resolve(kssPath, 'app.rb'),
            kssSections = path.resolve(kssPath, 'views/sections'),
            destinationFolder = path.resolve(__dirname, 'styleguide'),
            url = 'http://localhost:4567/',
            copyFiles,
            done,
            child;

        var getSource = function (url, callback) {
            var data = '';
            http.get(url, function (response) {
                response.on('data', function (chunk) {
                    data += chunk;
                });

                response.on('end', function () {
                    callback(data);
                });
            });
        };

        copyFiles = function () {
            var allSections = function () {
                var files = grunt.file.expand(kssSections + '/*'),
                    saved = 0;

                files.forEach(function (file) {
                    var match = file.match(/\d(\.\d)*/),
                        section;

                    if (match) {
                        section = match[0] + '.html';
                        getSource(url + section, function (response) {
                            grunt.file.write(path.resolve(destinationFolder, section), response);
                            grunt.log.ok('Saving /styleguide/' + section);
                            saved++;

                            if (saved === files.length) {
                                grunt.log.ok('Styleguide successfully generated.');
                                done();
                            }
                        });
                    }
                });
            };

            // Copy required CSS and JS files
            grunt.file.copy(
                path.resolve(kssPath, 'public/stylesheets/layout.css'),
                path.resolve(destinationFolder, 'stylesheets/layout.css')
            );
            grunt.file.copy(
                path.resolve(kssPath, 'public/javascripts/kss.js'),
                path.resolve(destinationFolder, 'javascripts/kss.js')
            );

            // Copy Index
            getSource(url, function (response) {
                grunt.file.write(path.resolve(destinationFolder, 'index.html'), response);
                grunt.log.ok('Saving /styleguide/index.html');

                // Copy the all sections
                allSections();
            });
        };

        // Set grunt async mode
        done = this.async();

        // spawn child process for sinatra KSS server
        child = grunt.util.spawn({
            cmd: 'ruby',
            args: [kssApplication]
        }, function (error, result, code) {
            if (error) {
                grunt.fail.warn('ERROR: Did you forget to run `bundle install` into the kss directory?');
                grunt.fail.fatal(error);
            }
        });

        if (child) {
            grunt.log.ok('Starting server...');

            process.on('exit', function() {
                // grunt.log.writeln('Killing server process...');
                child.kill();
                // grunt.log.writeln('Server offline.');
            });

            if (grunt.file.isDir(destinationFolder)) {
                grunt.file.delete(destinationFolder);
            }

            // I don't know why, but it's stderr instead of stdout
            child.stderr.on('data', function (data) {
                var port = String(data).match(/port=(\d+)/);
                if (port && port[1]) {
                    grunt.log.ok('KSS Server running at port:' + port[1]);
                    copyFiles();
                }
            });

            // child.stdout.pipe(process.stdout);
            // child.stderr.pipe(process.stderr);
        } else {
            grunt.fail.fatal('Couldn\'t start child process for ruby server.');
        }
    });

};
