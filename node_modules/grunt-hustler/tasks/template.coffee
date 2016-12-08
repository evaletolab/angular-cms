module.exports = (grunt) ->
	crypto = require 'crypto'
	normalizeFilesHelper = require './normalizeFilesHelper'

	grunt.registerMultiTask 'template', 'Compiles templates', ->
		normalized = normalizeFilesHelper @
		groups = normalized.groups
		@data.include = grunt.file.read
		data = @data

		@data.hash = (filePath) ->
			contents = grunt.file.read filePath
			hash = crypto.createHash('sha1').update(contents).digest('hex').substr(0, 10)

		@data.uniqueVersion = ->
			uniqueVersion = Date.now()

		for dest, src of groups
			sourceContents = []

			src.forEach (source) ->
				contents = grunt.file.read source

				sourceContents.push contents

			separator = grunt.util.linefeed
			contents = sourceContents.join grunt.util.normalizelf separator
			compiled = grunt.template.process contents, data: config: data
			destination = dest.replace '.template', '.html'

			grunt.file.write destination, compiled
			grunt.verbose.ok "#{src} -> #{destination}"