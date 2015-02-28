/* global module */

module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                jshintrc: '../../../.jshintrc'
            },
            build: {
                src: [
                    '**/*.js',
					'!dist/**/*.js',
                    '!node_modules/**/*.js'
                ]
            }
        },
		
		clean: {
			build: 'dist/**/*'
		},
		
		uglify: {
			options: {
				footer:'\n' + '/*! <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd hh:mm:ss") %> */\n',
				mangle: true,
				compress: false,
				sourceMap: true
			},
			
			build: {
				files: [{
	    			expand: true,
					src: [
							'**/*.js',
							'!dist/**/*.js',
							'!Gruntfile.js',
							'!node_modules/**/*.js'
						],
	    			dest: 'dist'
	    		}]
			}
		},
		
		watch: {
			build: {
				files: '**/*.js',
				tasks: ['jshint']
				//tasks: ['jshint', 'clean', 'uglify']
			}
		}
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
	//grunt.loadNpmTasks('grunt-contrib-clean');
	//grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['jshint']);
    //grunt.registerTask('default', ['jshint', 'clean', 'uglify']);
};