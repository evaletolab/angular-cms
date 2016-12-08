module.exports = (config) ->
	return if not config.data

	grunt = require 'grunt'
	path = require 'path'
	unTemplatedConfig = config

	try
		config = grunt.util.recurse config, (prop) ->
			return prop if typeof prop isnt 'string'

			grunt.template.process prop
	catch e
		config = unTemplatedConfig

	data = config.data
	inDest = data.dest if data
	inSrc = data.src if data
	inFiles = data.files if data
	files = {}
	dirs = {}
	groups = {}
	isIndexed = false

	if typeof inFiles is 'string'
		inSrc = inFiles
		inFiles = {}

	if inFiles
		if Array.isArray inFiles
			isIndexed = true
			inFiles.forEach (inFileSrc, index) ->
				inFileSrc = [inFileSrc] if not Array.isArray inFileSrc
				files[index] = inFileSrc
		else
			for inFileDest, inFileSrc of inFiles
				inFileDest = path.relative './', inFileDest
				inFileSrc = [inFileSrc] if not Array.isArray inFileSrc
				files[inFileDest] = inFileSrc

	if inSrc
		inSrc = [inSrc] if not Array.isArray inSrc

	if inDest and inSrc
		inDest = path.relative './', inDest
		files[inDest] = inSrc

	if inSrc and not inDest?
		isIndexed = true
		files[0] = inSrc

	if files
		for dest, src of files
			destExt = path.extname dest
			isDestADirectory = destExt.length is 0 and not isIndexed

			src.forEach (source) ->
				sourceExt = path.extname source
				isSourceADirectory = sourceExt.length is 0
				source = path.join source, '/**/*.*' if isSourceADirectory
				sourceFiles = grunt.file.expand source

				sourceFiles.forEach (sourceFile) ->
					if isDestADirectory
						sourceDirectory = path.dirname source.replace '**', ''

						if sourceFile.indexOf('//') is 0
							relative = sourceFile.substr sourceDirectory.length
						else
							relative = path.relative sourceDirectory, sourceFile

						absoluteDestination = path.resolve dest, relative
						destination = path.relative './', absoluteDestination
					else
						destination = dest

					if isSourceADirectory
						cleanSource = source.replace('/**/*.*', '/').replace('\\**\\*.*', '\\')
						dirs[cleanSource] = [] if not dirs[cleanSource]
						dirs[cleanSource].push sourceFile

					groups[destination] = [] if not groups[destination]
					groups[destination].push sourceFile

	{dirs, groups}