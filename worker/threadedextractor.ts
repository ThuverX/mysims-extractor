import { parentPort } from 'node:worker_threads'
import { extract } from '../exporters/extract.ts'

export interface ThreadedExtractorParameter {
	filepath: string
	clean?: boolean
	convert?: boolean
	keep_original?: boolean
}

export interface ThreadedExtractorResult {
	num_files: number
	error?: string
}

parentPort?.on('message', async (
	params: ThreadedExtractorParameter,
) => {
	if (params == undefined) {
		return {
			num_files: 0,
			error: 'Invalid params',
		}
	}

	const num_files = await extract(
		params.filepath,
		params.clean,
		params.convert,
		params.keep_original,
	)

	parentPort?.postMessage({
		num_files,
	})
})
