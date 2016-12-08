module.exports = (grunt) ->
	normalizeFilesHelper = require './normalizeFilesHelper'

	grunt.registerMultiTask 'inlineTemplate', 'Inlines templates', ->
		normalized = normalizeFilesHelper @
		groups = normalized.groups
		type = @data.type
		trim = @data.trim

		wrapScript = (contents, type, id, trim) ->
			id = id.replace(trim, '') if trim
			id = id.replace './', ''
			script = "<script type=\"#{type}\" id=\"#{id}\">#{contents}</script>"

		for dest, src of groups
			sourceContents = []

			src.forEach (source) ->
				contents = grunt.file.read source
				script = wrapScript contents, type, source, trim

				sourceContents.push script

			separator = grunt.util.linefeed
			contents = sourceContents.join grunt.util.normalizelf separator

			grunt.file.write dest, contents
			grunt.verbose.ok "#{src} -> #{dest}"