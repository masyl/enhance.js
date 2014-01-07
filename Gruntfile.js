var grunt = require("grunt");
grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    qunit: {
        all: {
            options: {
                urls: ['http://localhost:3300/test/test.html'],
                timeout:500000

            }
        }
    },
    connect: {
        server: {
            options: {
                port: 3300,
                    base: './'
            }
        }
    }
});

grunt.loadNpmTasks('grunt-contrib-connect');
grunt.loadNpmTasks('grunt-contrib-qunit');

grunt.registerTask('test', ['connect', 'qunit']);

