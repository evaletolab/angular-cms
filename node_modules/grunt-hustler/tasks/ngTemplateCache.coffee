module.exports = (grunt) ->
	escapeContent = (content) ->
		# escape single quotes
		content = content.replace /'/g, '\\\''

		# add single quotes at the beginning and end of each line
		content = content.replace /\r?\n/g, '\' +\n\''

	prettyDiff = require 'prettydiff'
	linefeed = grunt.util.normalizelf grunt.util.linefeed

	grunt.registerMultiTask 'ngTemplateCache', 'Creates a script file pushing all views into the template cache.', ->
		options = @options(
			module: 'app'
			trim: './src'
		)

		grunt.verbose.writeflags options, 'Options'

		@files.forEach (f) ->
			prefix = "angular.module('#{options.module}').run(['$templateCache', function ($templateCache) {"
			suffix = '}]);'

			output = f.src.filter((filepath) ->
				unless grunt.file.exists(filepath)
					grunt.log.warn "Source file \" #{filepath}\" not found."

					false
				else
					true
			).map((filepath) ->
				content = grunt.file.read filepath

				minifyOptions =
					conditional: true
					html: 'html-yes'
					mode: 'minify'
					source: content

				minified = prettyDiff.api(minifyOptions)[0]
				escaped = escapeContent minified
				cache = "\t$templateCache.put('#{filepath.replace(options.trim, '')}', '#{escaped}');"
			)

			output.unshift prefix
			output.push suffix
			grunt.file.write f.dest, output.join linefeed
			grunt.log.writeln "File #{f.dest} created."