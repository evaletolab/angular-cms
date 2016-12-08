module.exports = (grunt) ->
	fs = require 'fs'
	normalizeFilesHelper = require './normalizeFilesHelper'

	grunt.registerMultiTask 'rename', 'Renames files', ->
		normalized = normalizeFilesHelper @
		groups = normalized.groups

		for dest, src of groups
			src.forEach (source) ->
				fs.renameSync source, dest
				grunt.verbose.ok "#{source} -> #{dest}"